const TradingIdea = require('../models/TradingIdea');
const Analytics = require('../models/Analytics');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');

/**
 * Get all active trading ideas with filters and pagination.
 */
const getAll = catchAsync(async (req, res) => {
  const {
    sector, ideaType, riskLevel, timeHorizon,
    search, featured, page = 1, limit = 12
  } = req.query;

  const filter = { isActive: true };
  if (sector) filter.sector = sector;
  if (ideaType) filter.ideaType = ideaType;
  if (riskLevel) filter.riskLevel = riskLevel;
  if (timeHorizon) filter.timeHorizon = timeHorizon;
  if (featured === 'true') filter.isFeatured = true;
  if (search) filter.$text = { $search: search };

  const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
  const [ideas, total] = await Promise.all([
    TradingIdea.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10)),
    TradingIdea.countDocuments(filter)
  ]);

  res.json({
    success: true,
    data: ideas,
    pagination: {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      total,
      pages: Math.ceil(total / parseInt(limit, 10))
    }
  });
});

/**
 * Get all trading ideas for admin (includes inactive).
 */
const getAdminAll = catchAsync(async (req, res) => {
  const {
    sector, ideaType, riskLevel, timeHorizon,
    search, page = 1, limit = 12
  } = req.query;

  const filter = {};
  if (sector) filter.sector = sector;
  if (ideaType) filter.ideaType = ideaType;
  if (riskLevel) filter.riskLevel = riskLevel;
  if (timeHorizon) filter.timeHorizon = timeHorizon;
  if (search) filter.$text = { $search: search };

  const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
  const [ideas, total] = await Promise.all([
    TradingIdea.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10)),
    TradingIdea.countDocuments(filter)
  ]);

  res.json({
    success: true,
    data: ideas,
    pagination: {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      total,
      pages: Math.ceil(total / parseInt(limit, 10))
    }
  });
});

/**
 * Get a single trading idea by slug. Increments view count and logs analytics.
 */
const getBySlug = catchAsync(async (req, res) => {
  const idea = await TradingIdea.findOne({
    slug: req.params.slug,
    isActive: true
  });

  if (!idea) {
    throw new ApiError(404, 'Trading idea not found');
  }

  idea.viewCount += 1;
  await idea.save();

  await Analytics.create({
    eventType: 'trading_idea_view',
    path: `/trading-ideas/${idea.slug}`,
    resourceId: idea._id,
    resourceTitle: idea.title
  });

  res.json({ success: true, data: idea });
});

/**
 * Get featured active trading ideas (limit 6).
 */
const getFeatured = catchAsync(async (req, res) => {
  const ideas = await TradingIdea.find({ isActive: true, isFeatured: true })
    .sort({ createdAt: -1 })
    .limit(6);

  res.json({ success: true, data: ideas });
});

/**
 * Create a new trading idea (admin).
 */
const create = catchAsync(async (req, res) => {
  const idea = await TradingIdea.create(req.body);
  res.status(201).json({
    success: true,
    data: idea,
    message: 'Trading idea created successfully'
  });
});

/**
 * Update a trading idea by ID (admin).
 */
const update = catchAsync(async (req, res) => {
  const idea = await TradingIdea.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  if (!idea) {
    throw new ApiError(404, 'Trading idea not found');
  }

  res.json({
    success: true,
    data: idea,
    message: 'Trading idea updated successfully'
  });
});

/**
 * Partially update a trading idea (admin) — e.g., toggle isFeatured/isActive.
 */
const partialUpdate = catchAsync(async (req, res) => {
  const idea = await TradingIdea.findByIdAndUpdate(
    req.params.id,
    { $set: req.body },
    { new: true, runValidators: true }
  );

  if (!idea) {
    throw new ApiError(404, 'Trading idea not found');
  }

  res.json({
    success: true,
    data: idea,
    message: 'Trading idea updated successfully'
  });
});

/**
 * Delete a trading idea by ID (admin).
 */
const remove = catchAsync(async (req, res) => {
  const idea = await TradingIdea.findByIdAndDelete(req.params.id);

  if (!idea) {
    throw new ApiError(404, 'Trading idea not found');
  }

  res.json({
    success: true,
    message: 'Trading idea deleted successfully'
  });
});

/**
 * Get trading idea stats — counts by type, sector, etc.
 */
const getStats = catchAsync(async (req, res) => {
  const [total, byType, bySector, byRisk] = await Promise.all([
    TradingIdea.countDocuments({ isActive: true }),
    TradingIdea.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$ideaType', count: { $sum: 1 } } }
    ]),
    TradingIdea.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$sector', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]),
    TradingIdea.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$riskLevel', count: { $sum: 1 } } }
    ])
  ]);

  res.json({
    success: true,
    data: { total, byType, bySector, byRisk }
  });
});

module.exports = {
  getAll,
  getAdminAll,
  getBySlug,
  getFeatured,
  create,
  update,
  partialUpdate,
  remove,
  getStats
};
