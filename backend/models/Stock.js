const mongoose = require('mongoose');
const { EXCHANGES } = require('../utils/constants');

/**
 * Stock model for Indian stock market listings.
 * @module models/Stock
 */
const stockSchema = new mongoose.Schema({
  symbol: {
    type: String,
    required: [true, 'Stock symbol is required'],
    unique: true,
    uppercase: true,
    trim: true
  },
  name: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true
  },
  sector: {
    type: String,
    required: [true, 'Sector is required']
  },
  exchange: {
    type: String,
    enum: EXCHANGES,
    default: 'NSE'
  },
  currentPrice: {
    type: Number,
    default: 0
  },
  dayChange: {
    type: Number,
    default: 0
  },
  dayChangePercent: {
    type: Number,
    default: 0
  },
  weekHigh52: {
    type: Number,
    default: 0
  },
  weekLow52: {
    type: Number,
    default: 0
  },
  marketCap: {
    type: Number,
    default: 0
  },
  marketCapLabel: {
    type: String
  },
  logoUrl: {
    type: String
  },
  peRatio: {
    type: Number,
    default: 0
  },
  pbRatio: {
    type: Number,
    default: 0
  },
  dividendYield: {
    type: Number,
    default: 0
  },
  dayHigh: {
    type: Number,
    default: 0
  },
  dayLow: {
    type: Number,
    default: 0
  },
  volume: {
    type: Number,
    default: 0
  },
  priceHistory: [{
    date: { type: String },
    price: { type: Number },
    open: { type: Number },
    high: { type: Number },
    low: { type: Number },
    close: { type: Number },
    volume: { type: Number }
  }],
  isinNumber: {
    type: String,
    trim: true
  },
  series: {
    type: String,
    trim: true
  },
  dateOfListing: {
    type: String
  },
  paidUpValue: {
    type: Number,
    default: 10
  },
  faceValue: {
    type: Number,
    default: 10
  },
  marketLot: {
    type: Number,
    default: 1
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

stockSchema.index({ symbol: 'text', name: 'text' });

module.exports = mongoose.model('Stock', stockSchema);
