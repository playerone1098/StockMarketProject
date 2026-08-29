const ChartAnalysis = require('../models/ChartAnalysis');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');

/**
 * Get saved chart analysis and drawings for a stock symbol.
 */
const getAnalysis = catchAsync(async (req, res) => {
  const symbol = (req.params.symbol || '').toUpperCase().trim();
  const deviceId = req.query.deviceId || 'default_device';

  if (!symbol) {
    throw new ApiError(400, 'Stock symbol is required');
  }

  let filter = { symbol, deviceId };
  if (req.user && req.user._id) {
    filter = { symbol, $or: [{ user: req.user._id }, { deviceId }] };
  }

  const analysis = await ChartAnalysis.findOne(filter);

  if (!analysis) {
    return res.json({
      success: true,
      data: {
        symbol,
        deviceId,
        drawings: [],
        trendlines: [],
        notes: '',
        targetPrice: null,
        stopLoss: null,
        timeframe: '1D',
        chartType: 'tradingview',
        exists: false
      }
    });
  }

  // Update last visited timestamp
  analysis.lastVisitedAt = new Date();
  await analysis.save({ validateBeforeSave: false });

  res.json({
    success: true,
    data: {
      ...analysis.toObject(),
      exists: true
    }
  });
});

/**
 * Save or update chart analysis and drawings for a stock symbol.
 */
const saveAnalysis = catchAsync(async (req, res) => {
  const symbol = (req.params.symbol || '').toUpperCase().trim();
  const { deviceId, drawings, trendlines, notes, targetPrice, stopLoss, timeframe, chartType } = req.body;

  if (!symbol) {
    throw new ApiError(400, 'Stock symbol is required');
  }

  const activeDeviceId = deviceId || req.body.deviceId || 'default_device';
  const userId = req.user ? req.user._id : null;

  const updateData = {
    symbol,
    deviceId: activeDeviceId,
    ...(userId && { user: userId }),
    ...(drawings !== undefined && { drawings }),
    ...(trendlines !== undefined && { trendlines }),
    ...(notes !== undefined && { notes }),
    ...(targetPrice !== undefined && { targetPrice }),
    ...(stopLoss !== undefined && { stopLoss }),
    ...(timeframe && { timeframe }),
    ...(chartType && { chartType }),
    lastVisitedAt: new Date()
  };

  const analysis = await ChartAnalysis.findOneAndUpdate(
    { symbol, deviceId: activeDeviceId },
    updateData,
    { new: true, upsert: true, runValidators: true }
  );

  res.json({
    success: true,
    message: 'Chart analysis and drawings saved permanently',
    data: analysis
  });
});

/**
 * Delete saved chart analysis for a stock symbol.
 */
const deleteAnalysis = catchAsync(async (req, res) => {
  const symbol = (req.params.symbol || '').toUpperCase().trim();
  const deviceId = req.query.deviceId || 'default_device';

  let filter = { symbol, deviceId };
  if (req.user && req.user._id) {
    filter = { symbol, $or: [{ user: req.user._id }, { deviceId }] };
  }

  await ChartAnalysis.findOneAndDelete(filter);

  res.json({
    success: true,
    message: 'Chart analysis and drawings cleared'
  });
});

/**
 * Get all saved chart analyses for admin.
 */
const getAdminAllAnalyses = catchAsync(async (req, res) => {
  const { page = 1, limit = 20, search } = req.query;

  const filter = {};
  if (search) {
    filter.symbol = { $regex: search.toUpperCase(), $options: 'i' };
  }

  const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);

  const [analyses, total] = await Promise.all([
    ChartAnalysis.find(filter)
      .populate('user', 'name email')
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10)),
    ChartAnalysis.countDocuments(filter)
  ]);

  res.json({
    success: true,
    data: analyses,
    pagination: {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      total,
      pages: Math.ceil(total / parseInt(limit, 10))
    }
  });
});

module.exports = {
  getAnalysis,
  saveAnalysis,
  deleteAnalysis,
  getAdminAllAnalyses
};
