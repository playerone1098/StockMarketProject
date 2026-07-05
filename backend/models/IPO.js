const mongoose = require('mongoose');
const { IPO_STATUSES } = require('../utils/constants');

/**
 * IPO model for tracking Initial Public Offerings in the Indian market.
 * @module models/IPO
 */
const ipoSchema = new mongoose.Schema({
  companyName: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true
  },
  slug: {
    type: String,
    unique: true
  },
  symbol: {
    type: String
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  sector: {
    type: String,
    required: [true, 'Sector is required']
  },
  priceRange: {
    min: { type: Number },
    max: { type: Number }
  },
  lotSize: {
    type: Number,
    required: [true, 'Lot size is required']
  },
  issueSize: {
    type: String
  },
  issueType: {
    type: String
  },
  openDate: {
    type: Date,
    required: [true, 'Open date is required']
  },
  closeDate: {
    type: Date,
    required: [true, 'Close date is required']
  },
  listingDate: {
    type: Date
  },
  listingPrice: {
    type: Number
  },
  status: {
    type: String,
    enum: IPO_STATUSES,
    default: 'upcoming'
  },
  subscriptionStatus: {
    retail: { type: Number, default: 0 },
    nii: { type: Number, default: 0 },
    qib: { type: Number, default: 0 },
    total: { type: Number, default: 0 }
  },
  registrar: {
    type: String
  },
  imageUrl: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  viewCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

ipoSchema.index({ companyName: 'text', description: 'text' });

/**
 * Pre-save hook to auto-generate slug from company name.
 */
ipoSchema.pre('save', function (next) {
  if (this.isModified('companyName') || !this.slug) {
    const base = this.companyName
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
    const suffix = Math.random().toString(36).substring(2, 8);
    this.slug = `${base}-${suffix}`;
  }
  next();
});

module.exports = mongoose.model('IPO', ipoSchema);
