const Sector = require('../models/Sector');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');

/**
 * Get all sectors sorted alphabetically.
 */
const getAll = catchAsync(async (req, res) => {
  const sectors = await Sector.find().sort({ name: 1 });

  res.json({
    success: true,
    data: sectors
  });
});

/**
 * Create a new sector (admin). Auto-deduplicates by lowercase name.
 */
const create = catchAsync(async (req, res) => {
  const { name, icon, description } = req.body;

  if (!name || !name.trim()) {
    throw new ApiError(400, 'Sector name is required');
  }

  const trimmedName = name.trim();

  const existing = await Sector.findOne({
    name: { $regex: new RegExp(`^${trimmedName}$`, 'i') }
  });

  if (existing) {
    throw new ApiError(400, 'Sector already exists');
  }

  const sector = await Sector.create({
    name: trimmedName,
    icon: icon || '📊',
    description
  });

  res.status(201).json({
    success: true,
    data: sector,
    message: 'Sector created successfully'
  });
});

/**
 * Delete a sector by ID (admin).
 */
const remove = catchAsync(async (req, res) => {
  const sector = await Sector.findByIdAndDelete(req.params.id);

  if (!sector) {
    throw new ApiError(404, 'Sector not found');
  }

  res.json({
    success: true,
    message: 'Sector deleted successfully'
  });
});

module.exports = { getAll, create, remove };
