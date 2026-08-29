const Watchlist = require('../models/Watchlist');
const Stock = require('../models/Stock');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');

/**
 * Get all watchlists for current user with current stock prices
 */
const getWatchlists = catchAsync(async (req, res) => {
  const watchlists = await Watchlist.find({ user: req.user._id }).sort({ createdAt: -1 });

  // Gather all unique stock symbols in user watchlists
  const allSymbols = new Set();
  watchlists.forEach(w => {
    w.items.forEach(item => {
      if (item.symbol) allSymbols.add(item.symbol.toUpperCase());
    });
  });

  // Fetch stocks matching these symbols
  const stockMap = {};
  if (allSymbols.size > 0) {
    const stocks = await Stock.find({ symbol: { $in: Array.from(allSymbols) } });
    stocks.forEach(s => {
      stockMap[s.symbol.toUpperCase()] = s;
    });
  }

  // Populate items with live stock details
  const populatedWatchlists = watchlists.map(w => {
    const wObj = w.toObject();
    wObj.items = wObj.items.map(item => {
      const stockInfo = stockMap[item.symbol.toUpperCase()];
      return {
        ...item,
        stockDetails: stockInfo ? {
          id: stockInfo._id,
          symbol: stockInfo.symbol,
          companyName: stockInfo.companyName,
          sector: stockInfo.sector,
          currentPrice: stockInfo.currentPrice,
          change: stockInfo.change,
          changePercent: stockInfo.changePercent,
          marketCap: stockInfo.marketCap,
          peRatio: stockInfo.peRatio,
          weekHigh52: stockInfo.weekHigh52,
          weekLow52: stockInfo.weekLow52,
          volume: stockInfo.volume
        } : {
          symbol: item.symbol,
          companyName: item.symbol,
          currentPrice: 0,
          change: 0,
          changePercent: 0
        }
      };
    });
    return wObj;
  });

  res.json({
    success: true,
    data: { watchlists: populatedWatchlists }
  });
});

/**
 * Get single watchlist by ID
 */
const getWatchlistById = catchAsync(async (req, res) => {
  const watchlist = await Watchlist.findOne({ _id: req.params.id, user: req.user._id });
  if (!watchlist) {
    throw new ApiError(404, 'Watchlist not found');
  }

  const symbols = watchlist.items.map(i => i.symbol.toUpperCase());
  const stocks = await Stock.find({ symbol: { $in: symbols } });
  const stockMap = {};
  stocks.forEach(s => { stockMap[s.symbol.toUpperCase()] = s; });

  const wObj = watchlist.toObject();
  wObj.items = wObj.items.map(item => {
    const stockInfo = stockMap[item.symbol.toUpperCase()];
    return {
      ...item,
      stockDetails: stockInfo || {
        symbol: item.symbol,
        companyName: item.symbol,
        currentPrice: 0,
        changePercent: 0
      }
    };
  });

  res.json({
    success: true,
    data: { watchlist: wObj }
  });
});

/**
 * Create new watchlist
 */
const createWatchlist = catchAsync(async (req, res) => {
  const { name, description, isDefault } = req.body;

  if (!name) {
    throw new ApiError(400, 'Watchlist name is required');
  }

  if (isDefault) {
    // Unset current default watchlist
    await Watchlist.updateMany({ user: req.user._id }, { isDefault: false });
  }

  const watchlist = new Watchlist({
    user: req.user._id,
    name: name.trim(),
    description: description || '',
    isDefault: !!isDefault,
    items: []
  });

  await watchlist.save();

  res.status(201).json({
    success: true,
    data: { watchlist },
    message: 'Watchlist created successfully'
  });
});

/**
 * Update watchlist name/description/isDefault
 */
const updateWatchlist = catchAsync(async (req, res) => {
  const { name, description, isDefault } = req.body;

  const watchlist = await Watchlist.findOne({ _id: req.params.id, user: req.user._id });
  if (!watchlist) {
    throw new ApiError(404, 'Watchlist not found');
  }

  if (name) watchlist.name = name.trim();
  if (description !== undefined) watchlist.description = description;

  if (isDefault) {
    await Watchlist.updateMany({ user: req.user._id }, { isDefault: false });
    watchlist.isDefault = true;
  }

  await watchlist.save();

  res.json({
    success: true,
    data: { watchlist },
    message: 'Watchlist updated successfully'
  });
});

/**
 * Delete a watchlist
 */
const deleteWatchlist = catchAsync(async (req, res) => {
  const watchlist = await Watchlist.findOne({ _id: req.params.id, user: req.user._id });
  if (!watchlist) {
    throw new ApiError(404, 'Watchlist not found');
  }

  await Watchlist.findByIdAndDelete(watchlist._id);

  res.json({
    success: true,
    message: 'Watchlist deleted successfully'
  });
});

/**
 * Add stock to watchlist
 */
const addStockToWatchlist = catchAsync(async (req, res) => {
  const { symbol } = req.body;
  if (!symbol) {
    throw new ApiError(400, 'Stock symbol is required');
  }

  const cleanSymbol = symbol.toUpperCase().trim();
  
  // Find stock in database to verify & link reference
  const stock = await Stock.findOne({ symbol: cleanSymbol });

  let watchlist = await Watchlist.findOne({ _id: req.params.id, user: req.user._id });
  if (!watchlist) {
    // If id is 'default', get or create default watchlist
    if (req.params.id === 'default') {
      watchlist = await Watchlist.findOne({ user: req.user._id, isDefault: true });
      if (!watchlist) {
        watchlist = await Watchlist.findOne({ user: req.user._id }).sort({ createdAt: 1 });
      }
      if (!watchlist) {
        watchlist = await Watchlist.create({
          user: req.user._id,
          name: 'My Watchlist',
          isDefault: true
        });
      }
    } else {
      throw new ApiError(404, 'Watchlist not found');
    }
  }

  // Check if stock already in watchlist
  const exists = watchlist.items.some(i => i.symbol.toUpperCase() === cleanSymbol);
  if (exists) {
    return res.json({
      success: true,
      data: { watchlist },
      message: 'Stock is already in watchlist'
    });
  }

  watchlist.items.push({
    symbol: cleanSymbol,
    stock: stock ? stock._id : null,
    addedAt: new Date()
  });

  await watchlist.save();

  res.json({
    success: true,
    data: { watchlist },
    message: `${cleanSymbol} added to watchlist`
  });
});

/**
 * Remove stock from watchlist
 */
const removeStockFromWatchlist = catchAsync(async (req, res) => {
  const { symbol } = req.params;
  const cleanSymbol = symbol.toUpperCase().trim();

  const watchlist = await Watchlist.findOne({ _id: req.params.id, user: req.user._id });
  if (!watchlist) {
    throw new ApiError(404, 'Watchlist not found');
  }

  watchlist.items = watchlist.items.filter(i => i.symbol.toUpperCase() !== cleanSymbol);
  await watchlist.save();

  res.json({
    success: true,
    data: { watchlist },
    message: `${cleanSymbol} removed from watchlist`
  });
});

/**
 * Check if a symbol is in any watchlist for logged-in user
 */
const checkStockInWatchlists = catchAsync(async (req, res) => {
  const symbol = req.params.symbol.toUpperCase().trim();
  const watchlists = await Watchlist.find({
    user: req.user._id,
    'items.symbol': symbol
  });

  res.json({
    success: true,
    data: {
      inWatchlist: watchlists.length > 0,
      watchlistIds: watchlists.map(w => w._id)
    }
  });
});

module.exports = {
  getWatchlists,
  getWatchlistById,
  createWatchlist,
  updateWatchlist,
  deleteWatchlist,
  addStockToWatchlist,
  removeStockFromWatchlist,
  checkStockInWatchlists
};
