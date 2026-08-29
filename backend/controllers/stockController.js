const Stock = require('../models/Stock');
const Analytics = require('../models/Analytics');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');
const { syncStockPrices } = require('../utils/stockSyncService');
const { lookupCompanyBySymbol } = require('../utils/aiStockLookupService');

/**
 * Get all active stocks with filters and pagination.
 */
const getAll = catchAsync(async (req, res) => {
  const { sector, exchange, search, page = 1, limit = 20 } = req.query;

  const filter = { isActive: true };
  if (sector) filter.sector = sector;
  if (exchange) filter.exchange = exchange;
  if (search) filter.$text = { $search: search };

  const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
  const [stocks, total] = await Promise.all([
    Stock.find(filter)
      .sort({ symbol: 1 })
      .skip(skip)
      .limit(parseInt(limit, 10)),
    Stock.countDocuments(filter)
  ]);

  res.json({
    success: true,
    data: stocks,
    pagination: {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      total,
      pages: Math.ceil(total / parseInt(limit, 10))
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
  if (search) filter.$text = { $search: search };

  const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
  const [stocks, total] = await Promise.all([
    Stock.find(filter)
      .sort({ symbol: 1 })
      .skip(skip)
      .limit(parseInt(limit, 10)),
    Stock.countDocuments(filter)
  ]);

  res.json({
    success: true,
    data: stocks,
    pagination: {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      total,
      pages: Math.ceil(total / parseInt(limit, 10))
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

  res.json({ success: true, data: stock });
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
    sortBy = 'marketCap',
    sortOrder = 'desc',
    page = 1,
    limit = 25
  } = req.query;

  const filter = { isActive: true };

  if (sector) filter.sector = sector;
  if (exchange) filter.exchange = exchange;
  if (search) filter.$text = { $search: search };

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

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
  const skip = (pageNum - 1) * limitNum;

  const [stocks, total] = await Promise.all([
    Stock.find(filter)
      .sort(sortObj)
      .skip(skip)
      .limit(limitNum),
    Stock.countDocuments(filter)
  ]);

  res.json({
    success: true,
    data: stocks,
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

  res.json({
    success: true,
    data: {
      topGainers,
      topLosers,
      mostActive,
      nearHighs,
      nearLows
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
  runScreener,
  getMarketMovers,
  getMarketHeatmap
};

