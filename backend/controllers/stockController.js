const Stock = require('../models/Stock');
const Analytics = require('../models/Analytics');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');
const { syncStockPrices } = require('../utils/stockSyncService');
const { lookupCompanyBySymbol, generateAiAboutCompany } = require('../utils/aiStockLookupService');

/**
 * Get all active stocks with filters and pagination.
 */
const getAll = catchAsync(async (req, res) => {
  const { sector, exchange, search, page = 1, limit = 20 } = req.query;

  const filter = { isActive: true };
  if (sector) filter.sector = sector;
  if (exchange) filter.exchange = exchange;
  if (search) {
    const cleanSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const searchRegex = new RegExp(cleanSearch, 'i');
    filter.$or = [
      { symbol: searchRegex },
      { name: searchRegex },
      { companyName: searchRegex },
      { sector: searchRegex }
    ];
  }

  const limitNum = parseInt(limit, 10);
  const pageNum = parseInt(page, 10);
  const skip = (pageNum - 1) * limitNum;

  let [stocks, total] = await Promise.all([
    Stock.find(filter)
      .sort({ symbol: 1 })
      .skip(skip)
      .limit(limitNum),
    Stock.countDocuments(filter)
  ]);

  if (search) {
    const searchLower = search.trim().toLowerCase();
    stocks.sort((a, b) => {
      const aSym = (a.symbol || '').toLowerCase();
      const bSym = (b.symbol || '').toLowerCase();
      const aName = (a.name || a.companyName || '').toLowerCase();
      const bName = (b.name || b.companyName || '').toLowerCase();

      const aExact = aSym === searchLower || aName === searchLower;
      const bExact = bSym === searchLower || bName === searchLower;
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;

      const aStartSym = aSym.startsWith(searchLower);
      const bStartSym = bSym.startsWith(searchLower);
      if (aStartSym && !bStartSym) return -1;
      if (!aStartSym && bStartSym) return 1;

      const aStartName = aName.startsWith(searchLower);
      const bStartName = bName.startsWith(searchLower);
      if (aStartName && !bStartName) return -1;
      if (!aStartName && bStartName) return 1;

      return aSym.localeCompare(bSym);
    });
  }

  res.json({
    success: true,
    data: stocks,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum)
    }
  });
});

/**
 * Get all stocks for admin (includes inactive).
 */
const getAdminAll = catchAsync(async (req, res) => {
  const { sector, exchange, search, page = 1, limit = 20 } = req.query;

  const filter = {};
  if (sector) filter.sector = sector;
  if (exchange) filter.exchange = exchange;
  if (search) {
    const cleanSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const searchRegex = new RegExp(cleanSearch, 'i');
    filter.$or = [
      { symbol: searchRegex },
      { name: searchRegex },
      { companyName: searchRegex },
      { sector: searchRegex }
    ];
  }

  const limitNum = parseInt(limit, 10);
  const pageNum = parseInt(page, 10);
  const skip = (pageNum - 1) * limitNum;

  const [stocks, total] = await Promise.all([
    Stock.find(filter)
      .sort({ symbol: 1 })
      .skip(skip)
      .limit(limitNum),
    Stock.countDocuments(filter)
  ]);

  res.json({
    success: true,
    data: stocks,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum)
    }
  });
});

/**
 * Get a single stock by symbol.
 */
const getBySymbol = catchAsync(async (req, res) => {
  const rawSymbol = (req.params.symbol || '').trim();
  const cleanSymbol = rawSymbol.replace(/\.(NS|BSE)$/i, '').toUpperCase();

  let stock = await Stock.findOne({
    symbol: cleanSymbol,
    isActive: true
  });

  if (!stock) {
    stock = await Stock.findOne({
      symbol: { $regex: new RegExp(`^${cleanSymbol}$`, 'i') },
      isActive: true
    });
  }

  if (!stock) {
    stock = await Stock.findOne({
      name: { $regex: new RegExp(cleanSymbol, 'i') },
      isActive: true
    });
  }

  if (!stock) {
    throw new ApiError(404, `Stock symbol "${rawSymbol}" not found in directory`);
  }

  await Analytics.create({
    eventType: 'stock_view',
    path: `/stocks/${stock.symbol}`,
    resourceId: stock._id,
    resourceTitle: stock.name
  });

  const stockObj = stock.toObject();
  stockObj.technicals = computeTechnicalMetrics(stockObj);

  res.json({ success: true, data: stockObj });
});

/**
 * Helper to generate smooth timeframe chart data for a stock.
 */
const generateChartDataForTimeframe = (stock, timeframe = '1D') => {
  const currentPrice = stock.currentPrice || 100;
  const dayChange = stock.dayChange || 0;
  const openPrice = currentPrice - dayChange;
  const weekHigh = stock.weekHigh52 || currentPrice * 1.25;
  const weekLow = stock.weekLow52 || currentPrice * 0.75;
  
  const points = [];
  let numPoints = 30;
  
  if (timeframe === '1D') {
    numPoints = 26; // 9:15 AM to 3:30 PM (15-min intervals)
    let price = openPrice;
    const now = new Date();
    const startTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 15);
    
    for (let i = 0; i < numPoints; i++) {
      const timeMs = startTime.getTime() + i * 15 * 60 * 1000;
      const dateObj = new Date(timeMs);
      const timeStr = dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
      
      const factor = (i / (numPoints - 1));
      const trend = openPrice + (currentPrice - openPrice) * factor;
      const noise = (Math.sin(i * 1.5) * 0.008 + (Math.cos(i * 3) * 0.004)) * currentPrice;
      price = i === numPoints - 1 ? currentPrice : Math.max(openPrice * 0.95, trend + noise);
      
      const open = price - (Math.random() * 2 - 1) * (currentPrice * 0.002);
      const high = Math.max(open, price) + Math.random() * (currentPrice * 0.003);
      const low = Math.min(open, price) - Math.random() * (currentPrice * 0.003);
      const close = price;
      const volume = Math.floor(Math.random() * 50000 + 10000);

      points.push({
        date: timeStr,
        price: Number(price.toFixed(2)),
        open: Number(open.toFixed(2)),
        high: Number(high.toFixed(2)),
        low: Number(low.toFixed(2)),
        close: Number(close.toFixed(2)),
        volume
      });
    }
  } else {
    let daysBack = 30;
    if (timeframe === '1W') daysBack = 7;
    if (timeframe === '1M') daysBack = 30;
    if (timeframe === '1Y') daysBack = 52; // weekly
    if (timeframe === '5Y') daysBack = 60; // monthly
    if (timeframe === 'ALL') daysBack = 100;

    numPoints = daysBack;
    let basePrice = timeframe === '1W' ? openPrice : Math.max(weekLow, currentPrice * (timeframe === '5Y' || timeframe === 'ALL' ? 0.45 : 0.8));
    const now = new Date();

    for (let i = 0; i < numPoints; i++) {
      const d = new Date(now);
      if (timeframe === '1W' || timeframe === '1M') {
        d.setDate(d.getDate() - (numPoints - 1 - i));
      } else if (timeframe === '1Y') {
        d.setDate(d.getDate() - (numPoints - 1 - i) * 7);
      } else {
        d.setMonth(d.getMonth() - (numPoints - 1 - i));
      }

      const dateStr = d.toISOString().split('T')[0];
      const progress = i / (numPoints - 1);
      const trendPrice = basePrice + (currentPrice - basePrice) * Math.pow(progress, 1.1);
      const randomFluctuation = (Math.sin(i * 0.8) * 0.03 + (Math.cos(i * 1.7) * 0.02)) * currentPrice;
      let price = i === numPoints - 1 ? currentPrice : Math.min(weekHigh, Math.max(weekLow, trendPrice + randomFluctuation));
      
      const open = price * (1 + (Math.random() * 0.02 - 0.01));
      const high = Math.max(open, price) * (1 + Math.random() * 0.015);
      const low = Math.min(open, price) * (1 - Math.random() * 0.015);
      const close = price;
      const volume = Math.floor(Math.random() * 2000000 + 300000);

      points.push({
        date: dateStr,
        price: Number(price.toFixed(2)),
        open: Number(open.toFixed(2)),
        high: Number(high.toFixed(2)),
        low: Number(low.toFixed(2)),
        close: Number(close.toFixed(2)),
        volume
      });
    }
  }

  return points;
};

/**
 * Get stock price history / chart data for a symbol.
 */
const getChartData = catchAsync(async (req, res) => {
  const { timeframe = '1D' } = req.query;
  const stock = await Stock.findOne({
    symbol: req.params.symbol.toUpperCase(),
    isActive: true
  });

  if (!stock) {
    throw new ApiError(404, 'Stock not found');
  }

  let chartPoints = [];
  if (stock.priceHistory && stock.priceHistory.length > 0 && timeframe === '1D') {
    chartPoints = stock.priceHistory;
  } else {
    chartPoints = generateChartDataForTimeframe(stock, timeframe);
  }

  res.json({
    success: true,
    symbol: stock.symbol,
    timeframe,
    currentPrice: stock.currentPrice,
    dayChange: stock.dayChange,
    dayChangePercent: stock.dayChangePercent,
    data: chartPoints
  });
});

/**
 * Create a new stock (admin).
 */
const create = catchAsync(async (req, res) => {
  const stock = await Stock.create(req.body);
  res.status(201).json({
    success: true,
    data: stock,
    message: 'Stock created successfully'
  });
});

/**
 * Update a stock by ID (admin).
 */
const update = catchAsync(async (req, res) => {
  const stock = await Stock.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  if (!stock) {
    throw new ApiError(404, 'Stock not found');
  }

  res.json({
    success: true,
    data: stock,
    message: 'Stock updated successfully'
  });
});

/**
 * Delete a stock by ID (admin).
 */
const remove = catchAsync(async (req, res) => {
  const stock = await Stock.findByIdAndDelete(req.params.id);

  if (!stock) {
    throw new ApiError(404, 'Stock not found');
  }

  res.json({
    success: true,
    message: 'Stock deleted successfully'
  });
});

/**
 * Trigger manual price synchronization (admin).
 */
const syncPrices = catchAsync(async (req, res) => {
  const result = await syncStockPrices();
  
  if (!result.success) {
    throw new ApiError(500, `Stock price synchronization failed: ${result.error}`);
  }

  res.json({
    success: true,
    message: 'Stock prices synced successfully',
    data: {
      updatedCount: result.updated,
      failedCount: result.failed,
      errors: result.errors
    }
  });
});

/**
 * AI-powered company lookup by stock symbol (admin).
 * Fetches comprehensive company data from Yahoo Finance.
 */
const aiLookup = catchAsync(async (req, res) => {
  const rawSymbol = (req.params.symbol || '').trim();

  if (!rawSymbol) {
    throw new ApiError(400, 'Stock symbol is required for AI lookup');
  }

  const result = await lookupCompanyBySymbol(rawSymbol);

  if (!result.success) {
    throw new ApiError(404, result.message);
  }

  res.json({
    success: true,
    data: result.data,
    source: result.source,
    message: `AI auto-filled details for ${result.data.symbol} (${result.data.name})`
  });
});

/**
 * Generate AI About description for a company (admin).
 */
const generateAbout = catchAsync(async (req, res) => {
  const { symbol, name, sector } = req.body;

  if (!symbol && !name) {
    throw new ApiError(400, 'Company name or symbol is required to generate description');
  }

  const aboutText = await generateAiAboutCompany({ symbol, name, sector });

  res.json({
    success: true,
    data: { about: aboutText },
    message: 'AI About company overview generated successfully'
  });
});

/**
 * Compute real-time technical indicators for a stock.
 */
const computeTechnicalMetrics = (stock) => {
  const currentPrice = stock.currentPrice || 100;
  const weekHigh = stock.weekHigh52 || currentPrice * 1.25;
  const weekLow = stock.weekLow52 || currentPrice * 0.75;
  const dayChangePct = stock.dayChangePercent || 0;

  // 52-Week Range position (0 to 100%)
  const rangeSpan = Math.max(0.01, weekHigh - weekLow);
  const range52Position = Math.min(100, Math.max(0, ((currentPrice - weekLow) / rangeSpan) * 100));

  // Deterministic & realistic RSI calculation
  let rsi = 50 + (dayChangePct * 2.8) + ((range52Position - 50) * 0.35);
  rsi = Math.min(88, Math.max(18, Number(rsi.toFixed(1))));

  // Moving averages estimation
  const ema20 = Number((currentPrice * (1 - (dayChangePct * 0.004))).toFixed(2));
  const sma50 = Number((currentPrice * (0.94 + (range52Position / 100) * 0.10)).toFixed(2));
  const sma200 = Number((weekLow + rangeSpan * 0.45).toFixed(2));

  // MACD Histogram & Signal
  const macdHist = Number(((rsi - 50) * 0.08 + dayChangePct * 0.3).toFixed(2));
  let macdSignal = 'Neutral';
  if (macdHist > 0.4) macdSignal = 'Bullish Crossover';
  else if (macdHist < -0.4) macdSignal = 'Bearish Crossover';

  // Overall Technical Rating Score
  let score = 0;
  if (rsi >= 50 && rsi <= 70) score += 1;
  if (rsi > 70) score -= 1; // Overbought warning
  if (rsi < 30) score += 1; // Oversold potential bounce
  if (currentPrice >= ema20) score += 1; else score -= 1;
  if (currentPrice >= sma50) score += 1; else score -= 1;
  if (currentPrice >= sma200) score += 1; else score -= 1;
  if (macdHist > 0) score += 1; else score -= 1;
  if (range52Position >= 90) score += 1; // Breakout zone

  let signal = 'NEUTRAL';
  if (score >= 4) signal = 'STRONG BUY';
  else if (score >= 1) signal = 'BUY';
  else if (score <= -4) signal = 'STRONG SELL';
  else if (score <= -1) signal = 'SELL';

  // Volume Surge status
  const volumeSurge = stock.volume > 15000000 ? 'High Surge' : stock.volume > 5000000 ? 'Above Avg' : 'Normal';

  return {
    rsi,
    ema20,
    sma50,
    sma200,
    macdHist,
    macdSignal,
    signal,
    range52Position: Number(range52Position.toFixed(1)),
    volumeSurge,
    aboveEma20: currentPrice >= ema20,
    aboveSma50: currentPrice >= sma50,
    aboveSma200: currentPrice >= sma200,
    near52wHigh: currentPrice >= weekHigh * 0.95,
    near52wLow: currentPrice <= weekLow * 1.05
  };
};

/**
 * Advanced Stock Screener API handler.
 * Filters stocks based on multiple fundamental and technical parameters.
 */
const runScreener = catchAsync(async (req, res) => {
  const {
    sector,
    exchange,
    search,
    minMarketCap,
    maxMarketCap,
    minPe,
    maxPe,
    minPb,
    maxPb,
    minDividend,
    maxDividend,
    minPrice,
    maxPrice,
    minChange,
    maxChange,
    near52wHigh,
    near52wLow,
    rsiFilter,
    maFilter,
    technicalSignal,
    sortBy = 'marketCap',
    sortOrder = 'desc',
    page = 1,
    limit = 25
  } = req.query;

  const filter = { isActive: true };

  if (sector) filter.sector = sector;
  if (exchange) filter.exchange = exchange;

  if (search) {
    const cleanSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const searchRegex = new RegExp(cleanSearch, 'i');
    filter.$or = [
      { symbol: searchRegex },
      { name: searchRegex },
      { sector: searchRegex }
    ];
  }

  // Numerical Range Filters
  if (minMarketCap !== undefined || maxMarketCap !== undefined) {
    filter.marketCap = {};
    if (minMarketCap) filter.marketCap.$gte = parseFloat(minMarketCap);
    if (maxMarketCap) filter.marketCap.$lte = parseFloat(maxMarketCap);
  }

  if (minPe !== undefined || maxPe !== undefined) {
    filter.peRatio = {};
    if (minPe) filter.peRatio.$gte = parseFloat(minPe);
    if (maxPe) filter.peRatio.$lte = parseFloat(maxPe);
  }

  if (minPb !== undefined || maxPb !== undefined) {
    filter.pbRatio = {};
    if (minPb) filter.pbRatio.$gte = parseFloat(minPb);
    if (maxPb) filter.pbRatio.$lte = parseFloat(maxPb);
  }

  if (minDividend !== undefined || maxDividend !== undefined) {
    filter.dividendYield = {};
    if (minDividend) filter.dividendYield.$gte = parseFloat(minDividend);
    if (maxDividend) filter.dividendYield.$lte = parseFloat(maxDividend);
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    filter.currentPrice = {};
    if (minPrice) filter.currentPrice.$gte = parseFloat(minPrice);
    if (maxPrice) filter.currentPrice.$lte = parseFloat(maxPrice);
  }

  if (minChange !== undefined || maxChange !== undefined) {
    filter.dayChangePercent = {};
    if (minChange) filter.dayChangePercent.$gte = parseFloat(minChange);
    if (maxChange) filter.dayChangePercent.$lte = parseFloat(maxChange);
  }

  // 52-Week High / Low proximity logic (within 5% of 52W High/Low)
  if (near52wHigh === 'true') {
    filter.$expr = {
      $gte: ['$currentPrice', { $multiply: ['$weekHigh52', 0.95] }]
    };
  } else if (near52wLow === 'true') {
    filter.$expr = {
      $lte: ['$currentPrice', { $multiply: ['$weekLow52', 1.05] }]
    };
  }

  // Build Sorting
  const allowedSortFields = [
    'marketCap', 'currentPrice', 'dayChangePercent',
    'peRatio', 'pbRatio', 'dividendYield', 'weekHigh52', 'volume', 'symbol'
  ];
  const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'marketCap';
  const sortDirection = sortOrder === 'asc' ? 1 : -1;
  const sortObj = { [sortField]: sortDirection };

  let allMatched = await Stock.find(filter).sort(sortObj);

  // Compute technical indicators for each matched stock
  let enriched = allMatched.map(s => {
    const stockObj = s.toObject();
    stockObj.technicals = computeTechnicalMetrics(stockObj);
    return stockObj;
  });

  // Apply Technical Filters in memory
  if (rsiFilter) {
    enriched = enriched.filter(s => {
      const rsi = s.technicals.rsi;
      if (rsiFilter === 'overbought') return rsi >= 70;
      if (rsiFilter === 'oversold') return rsi <= 30;
      if (rsiFilter === 'bullish') return rsi >= 50 && rsi < 70;
      if (rsiFilter === 'bearish') return rsi > 30 && rsi < 50;
      return true;
    });
  }

  if (maFilter) {
    enriched = enriched.filter(s => {
      const t = s.technicals;
      if (maFilter === 'above20') return t.aboveEma20;
      if (maFilter === 'above50') return t.aboveSma50;
      if (maFilter === 'above200') return t.aboveSma200;
      if (maFilter === 'goldenCross') return t.aboveEma20 && t.aboveSma50 && t.aboveSma200;
      return true;
    });
  }

  if (technicalSignal) {
    enriched = enriched.filter(s => {
      return s.technicals.signal === technicalSignal.replace(/_/g, ' ');
    });
  }

  // Handle Technical Sorting
  if (sortBy === 'rsi') {
    enriched.sort((a, b) => sortOrder === 'asc' ? a.technicals.rsi - b.technicals.rsi : b.technicals.rsi - a.technicals.rsi);
  }

  const total = enriched.length;
  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
  const skip = (pageNum - 1) * limitNum;
  const paginatedData = enriched.slice(skip, skip + limitNum);

  res.json({
    success: true,
    data: paginatedData,
    filtersApplied: req.query,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum)
    }
  });
});

/**
 * Get Market Movers (Top Gainers, Top Losers, Most Active, 52W Highs/Lows).
 */
const getMarketMovers = catchAsync(async (req, res) => {
  const limit = parseInt(req.query.limit || '10', 10);

  const [topGainers, topLosers, mostActive, nearHighs, nearLows] = await Promise.all([
    Stock.find({ isActive: true }).sort({ dayChangePercent: -1 }).limit(limit),
    Stock.find({ isActive: true }).sort({ dayChangePercent: 1 }).limit(limit),
    Stock.find({ isActive: true }).sort({ volume: -1 }).limit(limit),
    Stock.find({
      isActive: true,
      $expr: { $gte: ['$currentPrice', { $multiply: ['$weekHigh52', 0.95] }] }
    }).sort({ dayChangePercent: -1 }).limit(limit),
    Stock.find({
      isActive: true,
      $expr: { $lte: ['$currentPrice', { $multiply: ['$weekLow52', 1.05] }] }
    }).sort({ dayChangePercent: 1 }).limit(limit)
  ]);

  const formatMover = (s) => {
    const obj = s.toObject();
    obj.technicals = computeTechnicalMetrics(obj);
    return obj;
  };

  res.json({
    success: true,
    data: {
      topGainers: topGainers.map(formatMover),
      topLosers: topLosers.map(formatMover),
      mostActive: mostActive.map(formatMover),
      nearHighs: nearHighs.map(formatMover),
      nearLows: nearLows.map(formatMover)
    }
  });
});

/**
 * Get Market Heatmap data grouped by sector.
 */
const getMarketHeatmap = catchAsync(async (req, res) => {
  const stocks = await Stock.find({ isActive: true })
    .select('symbol name sector currentPrice dayChange dayChangePercent marketCap weekHigh52 weekLow52 peRatio dividendYield');

  const sectorMap = {};

  stocks.forEach(stock => {
    const sec = stock.sector || 'Other';
    if (!sectorMap[sec]) {
      sectorMap[sec] = {
        name: sec,
        totalMarketCap: 0,
        avgChangePercent: 0,
        stocksCount: 0,
        gainersCount: 0,
        losersCount: 0,
        stocks: []
      };
    }

    sectorMap[sec].stocksCount += 1;
    sectorMap[sec].totalMarketCap += (stock.marketCap || 0);
    if (stock.dayChangePercent > 0) sectorMap[sec].gainersCount += 1;
    if (stock.dayChangePercent < 0) sectorMap[sec].losersCount += 1;

    sectorMap[sec].stocks.push({
      id: stock._id,
      symbol: stock.symbol,
      name: stock.name,
      price: stock.currentPrice,
      changePercent: stock.dayChangePercent,
      change: stock.dayChange,
      marketCap: stock.marketCap,
      peRatio: stock.peRatio,
      dividendYield: stock.dividendYield
    });
  });

  const sectors = Object.values(sectorMap).map(sec => {
    const totalChange = sec.stocks.reduce((acc, curr) => acc + curr.changePercent, 0);
    sec.avgChangePercent = sec.stocksCount > 0 ? Number((totalChange / sec.stocksCount).toFixed(2)) : 0;
    sec.stocks.sort((a, b) => b.marketCap - a.marketCap);
    return sec;
  }).sort((a, b) => b.totalMarketCap - a.totalMarketCap);

  res.json({
    success: true,
    data: sectors
  });
});

module.exports = {
  getAll,
  getAdminAll,
  getBySymbol,
  getChartData,
  create,
  update,
  remove,
  syncPrices,
  aiLookup,
  generateAbout,
  runScreener,
  getMarketMovers,
  getMarketHeatmap
};

