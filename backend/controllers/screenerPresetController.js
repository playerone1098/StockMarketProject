const ScreenerPreset = require('../models/ScreenerPreset');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');

const DEFAULT_PRESETS = [
  {
    title: 'Value Bargains',
    description: 'Profitable companies trading at low P/E ratios (P/E under 20).',
    icon: 'TrendingDown',
    category: 'Valuation',
    filters: { maxPe: 20 },
    sortBy: 'peRatio',
    sortOrder: 'asc',
    isPopular: true
  },
  {
    title: 'High Dividend Yielders',
    description: 'Companies delivering stable passive income with dividend yields above 2%.',
    icon: 'DollarSign',
    category: 'Dividends',
    filters: { minDividend: 2.0 },
    sortBy: 'dividendYield',
    sortOrder: 'desc',
    isPopular: true
  },
  {
    title: 'Top Gainers Today',
    description: 'Bullish momentum stocks showing highest percentage gains today.',
    icon: 'ArrowUpRight',
    category: 'Momentum',
    filters: { minChange: 0.5 },
    sortBy: 'dayChangePercent',
    sortOrder: 'desc',
    isPopular: true
  },
  {
    title: 'Large Cap Titans',
    description: 'Established industry leaders with market cap exceeding ₹20,000 Cr.',
    icon: 'Shield',
    category: 'MarketCap',
    filters: { minMarketCap: 20000 },
    sortBy: 'marketCap',
    sortOrder: 'desc',
    isPopular: true
  },
  {
    title: 'Near 52-Week Highs',
    description: 'Stocks trading close to their 52-week peak with strong upward momentum.',
    icon: 'Zap',
    category: 'Momentum',
    filters: { near52wHigh: true },
    sortBy: 'dayChangePercent',
    sortOrder: 'desc',
    isPopular: false
  },
  {
    title: 'Small Cap Growth',
    description: 'Emerging high-potential companies with market cap under ₹5,000 Cr.',
    icon: 'Rocket',
    category: 'MarketCap',
    filters: { maxMarketCap: 5000 },
    sortBy: 'marketCap',
    sortOrder: 'desc',
    isPopular: false
  }
];

/**
 * Get all screener presets (public).
 * Seeds defaults if empty.
 */
const getAllPresets = catchAsync(async (req, res) => {
  let presets = await ScreenerPreset.find({ isActive: true }).sort({ isPopular: -1, createdAt: 1 });

  if (presets.length === 0) {
    presets = await ScreenerPreset.insertMany(DEFAULT_PRESETS);
  }

  res.json({
    success: true,
    data: presets
  });
});

/**
 * Get all presets for admin (includes inactive).
 */
const getAdminPresets = catchAsync(async (req, res) => {
  const presets = await ScreenerPreset.find().sort({ createdAt: -1 });
  res.json({
    success: true,
    data: presets
  });
});

/**
 * Create a new screener preset (admin).
 */
const createPreset = catchAsync(async (req, res) => {
  const preset = await ScreenerPreset.create(req.body);
  res.status(201).json({
    success: true,
    data: preset,
    message: 'Screener preset created successfully'
  });
});

/**
 * Update a screener preset by ID (admin).
 */
const updatePreset = catchAsync(async (req, res) => {
  const preset = await ScreenerPreset.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  if (!preset) {
    throw new ApiError(404, 'Screener preset not found');
  }

  res.json({
    success: true,
    data: preset,
    message: 'Screener preset updated successfully'
  });
});

/**
 * Delete a screener preset by ID (admin).
 */
const deletePreset = catchAsync(async (req, res) => {
  const preset = await ScreenerPreset.findByIdAndDelete(req.params.id);

  if (!preset) {
    throw new ApiError(404, 'Screener preset not found');
  }

  res.json({
    success: true,
    message: 'Screener preset deleted successfully'
  });
});

module.exports = {
  getAllPresets,
  getAdminPresets,
  createPreset,
  updatePreset,
  deletePreset
};
