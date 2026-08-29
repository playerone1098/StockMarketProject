const mongoose = require('mongoose');

const screenerPresetSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Preset title is required'],
    unique: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Preset description is required'],
    trim: true
  },
  icon: {
    type: String,
    default: 'Filter'
  },
  category: {
    type: String,
    enum: ['Valuation', 'Dividends', 'Momentum', 'MarketCap', 'Custom'],
    default: 'Valuation'
  },
  filters: {
    sector: { type: String, default: '' },
    minMarketCap: { type: Number, default: null }, // in Crores
    maxMarketCap: { type: Number, default: null },
    minPe: { type: Number, default: null },
    maxPe: { type: Number, default: null },
    minPb: { type: Number, default: null },
    maxPb: { type: Number, default: null },
    minDividend: { type: Number, default: null }, // percentage
    maxDividend: { type: Number, default: null },
    minPrice: { type: Number, default: null },
    maxPrice: { type: Number, default: null },
    minChange: { type: Number, default: null }, // % day change
    maxChange: { type: Number, default: null },
    near52wHigh: { type: Boolean, default: false },
    near52wLow: { type: Boolean, default: false }
  },
  sortBy: {
    type: String,
    default: 'marketCap'
  },
  sortOrder: {
    type: String,
    enum: ['asc', 'desc'],
    default: 'desc'
  },
  isPopular: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

screenerPresetSchema.pre('validate', function(next) {
  if (this.title && !this.slug) {
    this.slug = this.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }
  next();
});

module.exports = mongoose.model('ScreenerPreset', screenerPresetSchema);
