const Portfolio = require('../models/Portfolio');
const Stock = require('../models/Stock');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');
const fs = require('fs');

/**
 * Helper to calculate live performance metrics for portfolio holdings
 */
const calculatePortfolioMetrics = async (portfolioObj) => {
  const holdings = portfolioObj.holdings || [];
  if (holdings.length === 0) {
    return {
      ...portfolioObj,
      summary: {
        totalInvested: 0,
        currentValue: 0,
        totalPnl: 0,
        totalPnlPercent: 0,
        dayPnl: 0,
        dayPnlPercent: 0,
        holdingsCount: 0
      },
      sectorAllocation: []
    };
  }

  const symbols = Array.from(new Set(holdings.map(h => h.symbol.toUpperCase())));
  const stocks = await Stock.find({ symbol: { $in: symbols } });
  const stockMap = {};
  stocks.forEach(s => { stockMap[s.symbol.toUpperCase()] = s; });

  let totalInvested = 0;
  let currentValue = 0;
  let dayPnl = 0;
  const sectorTotals = {};

  const processedHoldings = holdings.map(h => {
    const sym = h.symbol.toUpperCase();
    const stockInfo = stockMap[sym];
    const shares = Number(h.shares) || 0;
    const avgBuyPrice = Number(h.avgBuyPrice) || 0;
    
    const holdingInvested = shares * avgBuyPrice;
    const livePrice = stockInfo ? (stockInfo.currentPrice || avgBuyPrice) : avgBuyPrice;
    const holdingCurrentValue = shares * livePrice;
    const holdingPnl = holdingCurrentValue - holdingInvested;
    const holdingPnlPercent = holdingInvested > 0 ? (holdingPnl / holdingInvested) * 100 : 0;
    
    const dayChangePercent = stockInfo ? (stockInfo.changePercent || 0) : 0;
    const holdingDayPnl = holdingCurrentValue * (dayChangePercent / 100);

    totalInvested += holdingInvested;
    currentValue += holdingCurrentValue;
    dayPnl += holdingDayPnl;

    const sectorName = stockInfo ? (stockInfo.sector || 'Uncategorized') : 'Uncategorized';
    sectorTotals[sectorName] = (sectorTotals[sectorName] || 0) + holdingCurrentValue;

    return {
      ...h,
      symbol: sym,
      companyName: stockInfo ? stockInfo.companyName : h.name || sym,
      sector: sectorName,
      shares,
      avgBuyPrice,
      livePrice,
      investedValue: Math.round(holdingInvested * 100) / 100,
      currentValue: Math.round(holdingCurrentValue * 100) / 100,
      pnl: Math.round(holdingPnl * 100) / 100,
      pnlPercent: Math.round(holdingPnlPercent * 100) / 100,
      dayChangePercent: Math.round(dayChangePercent * 100) / 100,
      dayPnl: Math.round(holdingDayPnl * 100) / 100,
      stockId: stockInfo ? stockInfo._id : null
    };
  });

  const totalPnl = currentValue - totalInvested;
  const totalPnlPercent = totalInvested > 0 ? (totalPnl / totalInvested) * 100 : 0;
  const dayPnlPercent = currentValue > 0 ? (dayPnl / currentValue) * 100 : 0;

  const sectorAllocation = Object.keys(sectorTotals).map(sec => ({
    sector: sec,
    value: Math.round(sectorTotals[sec] * 100) / 100,
    percentage: currentValue > 0 ? Math.round((sectorTotals[sec] / currentValue) * 10000) / 100 : 0
  })).sort((a, b) => b.value - a.value);

  return {
    ...portfolioObj,
    holdings: processedHoldings,
    summary: {
      totalInvested: Math.round(totalInvested * 100) / 100,
      currentValue: Math.round(currentValue * 100) / 100,
      totalPnl: Math.round(totalPnl * 100) / 100,
      totalPnlPercent: Math.round(totalPnlPercent * 100) / 100,
      dayPnl: Math.round(dayPnl * 100) / 100,
      dayPnlPercent: Math.round(dayPnlPercent * 100) / 100,
      holdingsCount: holdings.length
    },
    sectorAllocation
  };
};

/**
 * Get all portfolios for current user with performance summary
 */
const getPortfolios = catchAsync(async (req, res) => {
  const portfolios = await Portfolio.find({ user: req.user._id }).sort({ createdAt: -1 });

  const calculatedPortfolios = await Promise.all(
    portfolios.map(p => calculatePortfolioMetrics(p.toObject()))
  );

  // Overall summary across all portfolios
  let overallInvested = 0;
  let overallCurrentValue = 0;
  let overallDayPnl = 0;

  calculatedPortfolios.forEach(p => {
    overallInvested += p.summary.totalInvested;
    overallCurrentValue += p.summary.currentValue;
    overallDayPnl += p.summary.dayPnl;
  });

  const overallPnl = overallCurrentValue - overallInvested;
  const overallPnlPercent = overallInvested > 0 ? (overallPnl / overallInvested) * 100 : 0;

  res.json({
    success: true,
    data: {
      portfolios: calculatedPortfolios,
      overallSummary: {
        totalInvested: Math.round(overallInvested * 100) / 100,
        currentValue: Math.round(overallCurrentValue * 100) / 100,
        totalPnl: Math.round(overallPnl * 100) / 100,
        totalPnlPercent: Math.round(overallPnlPercent * 100) / 100,
        dayPnl: Math.round(overallDayPnl * 100) / 100,
        portfoliosCount: portfolios.length
      }
    }
  });
});

/**
 * Get single portfolio by ID
 */
const getPortfolioById = catchAsync(async (req, res) => {
  let portfolio = await Portfolio.findOne({ _id: req.params.id, user: req.user._id });
  if (!portfolio) {
    throw new ApiError(404, 'Portfolio not found');
  }

  const calculated = await calculatePortfolioMetrics(portfolio.toObject());

  res.json({
    success: true,
    data: { portfolio: calculated }
  });
});

/**
 * Create new portfolio
 */
const createPortfolio = catchAsync(async (req, res) => {
  const { name, description, isDefault } = req.body;

  if (!name) {
    throw new ApiError(400, 'Portfolio name is required');
  }

  if (isDefault) {
    await Portfolio.updateMany({ user: req.user._id }, { isDefault: false });
  }

  const portfolio = new Portfolio({
    user: req.user._id,
    name: name.trim(),
    description: description || '',
    isDefault: !!isDefault,
    holdings: []
  });

  await portfolio.save();
  const calculated = await calculatePortfolioMetrics(portfolio.toObject());

  res.status(201).json({
    success: true,
    data: { portfolio: calculated },
    message: 'Portfolio created successfully'
  });
});

/**
 * Update portfolio details
 */
const updatePortfolio = catchAsync(async (req, res) => {
  const { name, description, isDefault } = req.body;

  const portfolio = await Portfolio.findOne({ _id: req.params.id, user: req.user._id });
  if (!portfolio) {
    throw new ApiError(404, 'Portfolio not found');
  }

  if (name) portfolio.name = name.trim();
  if (description !== undefined) portfolio.description = description;

  if (isDefault) {
    await Portfolio.updateMany({ user: req.user._id }, { isDefault: false });
    portfolio.isDefault = true;
  }

  await portfolio.save();
  const calculated = await calculatePortfolioMetrics(portfolio.toObject());

  res.json({
    success: true,
    data: { portfolio: calculated },
    message: 'Portfolio updated successfully'
  });
});

/**
 * Delete portfolio
 */
const deletePortfolio = catchAsync(async (req, res) => {
  const portfolio = await Portfolio.findOne({ _id: req.params.id, user: req.user._id });
  if (!portfolio) {
    throw new ApiError(404, 'Portfolio not found');
  }

  await Portfolio.findByIdAndDelete(portfolio._id);

  res.json({
    success: true,
    message: 'Portfolio deleted successfully'
  });
});

/**
 * Add a holding to portfolio
 */
const addHolding = catchAsync(async (req, res) => {
  const { symbol, name, shares, avgBuyPrice, buyDate, broker, notes } = req.body;

  if (!symbol || !shares || avgBuyPrice === undefined) {
    throw new ApiError(400, 'Symbol, shares count, and average buy price are required');
  }

  const cleanSymbol = symbol.toUpperCase().trim();
  const stock = await Stock.findOne({ symbol: cleanSymbol });

  const portfolio = await Portfolio.findOne({ _id: req.params.id, user: req.user._id });
  if (!portfolio) {
    throw new ApiError(404, 'Portfolio not found');
  }

  // If stock already exists in portfolio, update average buy price and total shares
  const existingHolding = portfolio.holdings.find(h => h.symbol.toUpperCase() === cleanSymbol);
  if (existingHolding) {
    const existingTotalCost = existingHolding.shares * existingHolding.avgBuyPrice;
    const newTotalCost = Number(shares) * Number(avgBuyPrice);
    const newTotalShares = existingHolding.shares + Number(shares);

    existingHolding.shares = newTotalShares;
    existingHolding.avgBuyPrice = (existingTotalCost + newTotalCost) / newTotalShares;
    if (notes) existingHolding.notes = notes;
    if (broker) existingHolding.broker = broker;
  } else {
    portfolio.holdings.push({
      symbol: cleanSymbol,
      name: name || (stock ? stock.companyName : cleanSymbol),
      stock: stock ? stock._id : null,
      shares: Number(shares),
      avgBuyPrice: Number(avgBuyPrice),
      buyDate: buyDate ? new Date(buyDate) : new Date(),
      broker: broker || 'Manual',
      notes: notes || ''
    });
  }

  await portfolio.save();
  const calculated = await calculatePortfolioMetrics(portfolio.toObject());

  res.json({
    success: true,
    data: { portfolio: calculated },
    message: `Added ${cleanSymbol} to portfolio`
  });
});

/**
 * Update existing holding in portfolio
 */
const updateHolding = catchAsync(async (req, res) => {
  const { holdingId } = req.params;
  const { shares, avgBuyPrice, buyDate, broker, notes } = req.body;

  const portfolio = await Portfolio.findOne({ _id: req.params.id, user: req.user._id });
  if (!portfolio) {
    throw new ApiError(404, 'Portfolio not found');
  }

  const holding = portfolio.holdings.id(holdingId);
  if (!holding) {
    throw new ApiError(404, 'Holding not found');
  }

  if (shares !== undefined) holding.shares = Number(shares);
  if (avgBuyPrice !== undefined) holding.avgBuyPrice = Number(avgBuyPrice);
  if (buyDate) holding.buyDate = new Date(buyDate);
  if (broker) holding.broker = broker;
  if (notes !== undefined) holding.notes = notes;

  await portfolio.save();
  const calculated = await calculatePortfolioMetrics(portfolio.toObject());

  res.json({
    success: true,
    data: { portfolio: calculated },
    message: 'Holding updated successfully'
  });
});

/**
 * Delete holding from portfolio
 */
const deleteHolding = catchAsync(async (req, res) => {
  const { holdingId } = req.params;

  const portfolio = await Portfolio.findOne({ _id: req.params.id, user: req.user._id });
  if (!portfolio) {
    throw new ApiError(404, 'Portfolio not found');
  }

  portfolio.holdings = portfolio.holdings.filter(h => h._id.toString() !== holdingId);
  await portfolio.save();

  const calculated = await calculatePortfolioMetrics(portfolio.toObject());

  res.json({
    success: true,
    data: { portfolio: calculated },
    message: 'Holding removed from portfolio'
  });
});

/**
 * Import holdings from parsed CSV/Excel array or uploaded statement file
 */
const importHoldings = catchAsync(async (req, res) => {
  const portfolioId = req.params.id;
  const { holdingsData, brokerName } = req.body; // Can receive array of items or parsed rows

  let rawItems = holdingsData;

  // If file was uploaded via multer, parse CSV/Excel file on server
  if (req.file) {
    const XLSX = require('xlsx');
    const workbook = XLSX.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    rawItems = XLSX.utils.sheet_to_json(sheet);

    // Clean up uploaded file
    try { fs.unlinkSync(req.file.path); } catch (e) {}
  }

  if (!Array.isArray(rawItems) || rawItems.length === 0) {
    throw new ApiError(400, 'No valid holding records found in statement');
  }

  const portfolio = await Portfolio.findOne({ _id: portfolioId, user: req.user._id });
  if (!portfolio) {
    throw new ApiError(404, 'Portfolio not found');
  }

  let importedCount = 0;
  let skippedCount = 0;
  const importedSymbols = [];

  // Helper to extract field by fuzzy header match
  const findFieldValue = (row, fieldKeys) => {
    for (const key of Object.keys(row)) {
      const cleanKey = key.toLowerCase().replace(/[^a-z0-9]/g, '');
      for (const target of fieldKeys) {
        if (cleanKey.includes(target)) {
          return row[key];
        }
      }
    }
    return null;
  };

  for (const row of rawItems) {
    // Standardize symbol keys: symbol, stock, scrip, instrument, ticker
    let rawSymbol = row.symbol || row.Symbol || row.stock || row.Stock ||
      findFieldValue(row, ['symbol', 'stock', 'scrip', 'instrument', 'ticker', 'company']);

    if (!rawSymbol) {
      skippedCount++;
      continue;
    }

    // Clean stock symbol: e.g. "RELIANCE EQ" -> "RELIANCE", "TATAMOTORS-NSE" -> "TATAMOTORS"
    let cleanSymbol = String(rawSymbol)
      .toUpperCase()
      .replace(/\.(NS|BO)$/i, '')
      .replace(/\s+(EQ|BE|SM|ST|BZ|GS)$/i, '')
      .replace(/[^A-Z0-9]/g, '')
      .trim();

    if (!cleanSymbol) {
      skippedCount++;
      continue;
    }

    // Extract quantity: quantity, qty, shares, share count, available qty
    let rawQty = row.shares || row.sharesCount || row.qty || row.Quantity || row.quantity ||
      findFieldValue(row, ['qty', 'quantity', 'shares', 'sharecount', 'availableshares', 'holdings']);

    const shares = parseFloat(String(rawQty).replace(/,/g, ''));

    // Extract avg price or buy value
    let rawAvgPrice = row.avgBuyPrice || row.avgPrice || row.averagePrice || row.buyPrice ||
      findFieldValue(row, ['avgprice', 'averageprice', 'buyprice', 'avgcost', 'costprice', 'buyval', 'unitcost']);

    let rawTotalValue = row.totalValue || row.investedValue || row.totalCost || row.buyValue ||
      findFieldValue(row, ['invested', 'totalcost', 'totalvalue', 'buyvalue', 'costval', 'valueinrupees', 'amountinr']);

    let avgBuyPrice = parseFloat(String(rawAvgPrice || 0).replace(/,/g, ''));
    let totalValue = parseFloat(String(rawTotalValue || 0).replace(/,/g, ''));

    if ((!avgBuyPrice || isNaN(avgBuyPrice)) && totalValue && shares) {
      avgBuyPrice = totalValue / shares;
    }

    if (isNaN(shares) || shares <= 0 || isNaN(avgBuyPrice) || avgBuyPrice <= 0) {
      skippedCount++;
      continue;
    }

    const stock = await Stock.findOne({ symbol: cleanSymbol });

    // Check if already in portfolio
    const existing = portfolio.holdings.find(h => h.symbol.toUpperCase() === cleanSymbol);
    if (existing) {
      const existingCost = existing.shares * existing.avgBuyPrice;
      const newCost = shares * avgBuyPrice;
      const totalShares = existing.shares + shares;
      existing.shares = totalShares;
      existing.avgBuyPrice = (existingCost + newCost) / totalShares;
      existing.broker = brokerName || existing.broker || 'Imported';
    } else {
      portfolio.holdings.push({
        symbol: cleanSymbol,
        name: stock ? stock.companyName : cleanSymbol,
        stock: stock ? stock._id : null,
        shares,
        avgBuyPrice,
        buyDate: new Date(),
        broker: brokerName || 'Imported Statement',
        notes: `Imported statement`
      });
    }

    importedCount++;
    importedSymbols.push(cleanSymbol);
  }

  await portfolio.save();
  const calculated = await calculatePortfolioMetrics(portfolio.toObject());

  res.json({
    success: true,
    data: {
      portfolio: calculated,
      importedCount,
      skippedCount,
      importedSymbols
    },
    message: `Successfully imported ${importedCount} stock holdings into portfolio`
  });
});

module.exports = {
  getPortfolios,
  getPortfolioById,
  createPortfolio,
  updatePortfolio,
  deletePortfolio,
  addHolding,
  updateHolding,
  deleteHolding,
  importHoldings
};
