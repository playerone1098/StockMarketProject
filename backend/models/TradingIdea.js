const mongoose = require('mongoose');
const { IDEA_TYPES, TIME_HORIZONS, RISK_LEVELS } = require('../utils/constants');

/**
 * TradingIdea model for stock research and trading recommendations.
 * @module models/TradingIdea
 */
const tradingIdeaSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  slug: {
    type: String,
    unique: true
  },
  summary: {
    type: String,
    required: [true, 'Summary is required']
  },
  content: {
    type: String,
    required: [true, 'Content is required']
  },
  stock: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Stock'
  },
  stockSymbol: {
    type: String
  },
  stockName: {
    type: String
  },
  sector: {
    type: String,
    required: [true, 'Sector is required']
  },
  ideaType: {
    type: String,
    enum: IDEA_TYPES,
    required: [true, 'Idea type is required']
  },
  entryPrice: {
    type: Number,
    required: [true, 'Entry price is required']
  },
  targetPrice: {
    type: Number,
    required: [true, 'Target price is required']
  },
  stopLoss: {
    type: Number,
    required: [true, 'Stop loss is required']
  },
  timeHorizon: {
    type: String,
    enum: TIME_HORIZONS,
    required: [true, 'Time horizon is required']
  },
  riskLevel: {
    type: String,
    enum: RISK_LEVELS,
    default: 'medium'
  },
  tags: [{
    type: String
  }],
  imageUrl: {
    type: String
  },
  author: {
    type: String,
    default: 'JodhpurTraders Research'
  },
  isFeatured: {
    type: Boolean,
    default: false
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

tradingIdeaSchema.index({ title: 'text', summary: 'text', content: 'text', tags: 'text' });

/**
 * Pre-save hook to auto-generate slug from title with a random suffix.
 */
tradingIdeaSchema.pre('save', function (next) {
  if (this.isModified('title') || !this.slug) {
    const base = this.title
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

module.exports = mongoose.model('TradingIdea', tradingIdeaSchema);
