const Stock = require('../models/Stock');
const Analytics = require('../models/Analytics');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');

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
  const stock = await Stock.findOne({
    symbol: req.params.symbol.toUpperCase(),
    isActive: true
  });

  if (!stock) {
    throw new ApiError(404, 'Stock not found');
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

module.exports = {
  getAll,
  getAdminAll,
  getBySymbol,
  create,
  update,
  remove
};
