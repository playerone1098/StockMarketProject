const Watchlist = require('../models/Watchlist');
const Stock = require('../models/Stock');
const BlogPost = require('../models/BlogPost');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');

/**
 * Get all watchlists of the logged-in user.
 */
const getAll = catchAsync(async (req, res) => {
  const watchlists = await Watchlist.find({ user: req.user._id })
    .populate('stocks')
    .sort({ createdAt: -1 });
  
  res.json({
    success: true,
    data: watchlists
  });
});

/**
 * Create a new watchlist.
 */
const create = catchAsync(async (req, res) => {
  const { name } = req.body;
  if (!name) {
    throw new ApiError(400, 'Watchlist name is required');
  }
  
  const watchlist = await Watchlist.create({
    user: req.user._id,
    name,
    stocks: []
  });
  
  res.status(201).json({
    success: true,
    data: watchlist,
    message: 'Watchlist created successfully'
  });
});

/**
 * Add a stock to a specific watchlist.
 */
const addStock = catchAsync(async (req, res) => {
  const { symbol } = req.body;
  if (!symbol) {
    throw new ApiError(400, 'Stock symbol is required');
  }
  
  const stock = await Stock.findOne({ symbol: symbol.toUpperCase() });
  if (!stock) {
    throw new ApiError(404, 'Stock not found');
  }
  
  const watchlist = await Watchlist.findOne({ _id: req.params.id, user: req.user._id });
  if (!watchlist) {
    throw new ApiError(404, 'Watchlist not found');
  }
  
  // Check if stock already in watchlist
  if (watchlist.stocks.includes(stock._id)) {
    throw new ApiError(400, 'Stock already in watchlist');
  }
  
  watchlist.stocks.push(stock._id);
  await watchlist.save();
  await watchlist.populate('stocks');
  
  res.json({
    success: true,
    data: watchlist,
    message: `${stock.symbol} added to watchlist`
  });
});

/**
 * Remove a stock from a specific watchlist.
 */
const removeStock = catchAsync(async (req, res) => {
  const watchlist = await Watchlist.findOne({ _id: req.params.id, user: req.user._id });
  if (!watchlist) {
    throw new ApiError(404, 'Watchlist not found');
  }
  
  watchlist.stocks = watchlist.stocks.filter(
    (stockId) => stockId.toString() !== req.params.stockId
  );
  await watchlist.save();
  await watchlist.populate('stocks');
  
  res.json({
    success: true,
    data: watchlist,
    message: 'Stock removed from watchlist'
  });
});

/**
 * Delete a watchlist.
 */
const remove = catchAsync(async (req, res) => {
  const watchlist = await Watchlist.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!watchlist) {
    throw new ApiError(404, 'Watchlist not found');
  }
  
  res.json({
    success: true,
    message: 'Watchlist deleted successfully'
  });
});

/**
 * Get news aggregated from all watchlisted stock symbols.
 */
const getWatchlistNews = catchAsync(async (req, res) => {
  const watchlists = await Watchlist.find({ user: req.user._id }).populate('stocks');
  
  const symbols = new Set();
  watchlists.forEach(wl => {
    wl.stocks.forEach(stock => {
      symbols.add(stock.symbol.toLowerCase());
    });
  });
  
  const symbolList = Array.from(symbols);
  
  if (symbolList.length === 0) {
    return res.json({
      success: true,
      data: []
    });
  }
  
  const news = await BlogPost.find({
    category: 'news',
    isActive: true,
    tags: { $in: symbolList }
  }).sort({ createdAt: -1 });
  
  res.json({
    success: true,
    data: news
  });
});

module.exports = {
  getAll,
  create,
  addStock,
  removeStock,
  remove,
  getWatchlistNews
};
