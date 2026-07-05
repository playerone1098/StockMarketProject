const IPO = require('../models/IPO');
const Analytics = require('../models/Analytics');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');

/**
 * Get all active IPOs with filters and pagination.
 */
const getAll = catchAsync(async (req, res) => {
  const { status, page = 1, limit = 12 } = req.query;

  const filter = { isActive: true };
  if (status) filter.status = status;

  const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
  const [ipos, total] = await Promise.all([
    IPO.find(filter)
      .sort({ openDate: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10)),
    IPO.countDocuments(filter)
  ]);

  res.json({
    success: true,
    data: ipos,
    pagination: {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      total,
      pages: Math.ceil(total / parseInt(limit, 10))
    }
  });
});

/**
 * Get all IPOs for admin (includes inactive).
 */
const getAdminAll = catchAsync(async (req, res) => {
  const { status, page = 1, limit = 12 } = req.query;

  const filter = {};
  if (status) filter.status = status;

  const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
  const [ipos, total] = await Promise.all([
    IPO.find(filter)
      .sort({ openDate: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10)),
    IPO.countDocuments(filter)
  ]);

  res.json({
    success: true,
    data: ipos,
    pagination: {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      total,
      pages: Math.ceil(total / parseInt(limit, 10))
    }
  });
});

/**
 * Get a single IPO by slug. Increments view count.
 */
const getBySlug = catchAsync(async (req, res) => {
  const ipo = await IPO.findOne({
    slug: req.params.slug,
    isActive: true
  });

  if (!ipo) {
    throw new ApiError(404, 'IPO not found');
  }

  ipo.viewCount += 1;
  await ipo.save();

  await Analytics.create({
    eventType: 'ipo_view',
    path: `/ipos/${ipo.slug}`,
    resourceId: ipo._id,
    resourceTitle: ipo.companyName
  });

  res.json({ success: true, data: ipo });
});

/**
 * Create a new IPO (admin).
 */
const create = catchAsync(async (req, res) => {
  const ipo = await IPO.create(req.body);
  res.status(201).json({
    success: true,
    data: ipo,
    message: 'IPO created successfully'
  });
});

/**
 * Update an IPO by ID (admin).
 */
const update = catchAsync(async (req, res) => {
  const ipo = await IPO.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  if (!ipo) {
    throw new ApiError(404, 'IPO not found');
  }

  res.json({
    success: true,
    data: ipo,
    message: 'IPO updated successfully'
  });
});

/**
 * Partially update an IPO (admin).
 */
const partialUpdate = catchAsync(async (req, res) => {
  const ipo = await IPO.findByIdAndUpdate(
    req.params.id,
    { $set: req.body },
    { new: true, runValidators: true }
  );

  if (!ipo) {
    throw new ApiError(404, 'IPO not found');
  }

  res.json({
    success: true,
    data: ipo,
    message: 'IPO updated successfully'
  });
});

/**
 * Delete an IPO by ID (admin).
 */
const remove = catchAsync(async (req, res) => {
  const ipo = await IPO.findByIdAndDelete(req.params.id);

  if (!ipo) {
    throw new ApiError(404, 'IPO not found');
  }

  res.json({
    success: true,
    message: 'IPO deleted successfully'
  });
});

module.exports = {
  getAll,
  getAdminAll,
  getBySlug,
  create,
  update,
  partialUpdate,
  remove
};
