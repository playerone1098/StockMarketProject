const mongoose = require('mongoose');

const socialPostSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  authorName: {
    type: String,
    required: true,
    trim: true,
    default: 'Trader'
  },
  authorAvatar: {
    type: String,
    default: ''
  },
  authorRole: {
    type: String,
    default: 'Investor'
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  taggedStock: {
    type: String,
    uppercase: true,
    trim: true,
    default: ''
  },
  sentiment: {
    type: String,
    enum: ['BULLISH', 'BEARISH', 'NEUTRAL'],
    default: 'NEUTRAL'
  },
  targetPrice: {
    type: Number,
    default: null
  },
  timeframe: {
    type: String,
    enum: ['Intraday', 'Short Term', 'Swing', 'Long Term', 'N/A'],
    default: 'Short Term'
  },
  chartImageUrl: {
    type: String,
    default: ''
  },
  likes: [{
    type: String // User ID or session identifier
  }],
  likeCount: {
    type: Number,
    default: 0
  },
  commentsCount: {
    type: Number,
    default: 0
  },
  isPinned: {
    type: Boolean,
    default: false
  },
  isReported: {
    type: Boolean,
    default: false
  },
  reportReason: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['active', 'flagged', 'hidden'],
    default: 'active'
  }
}, {
  timestamps: true
});

socialPostSchema.index({ taggedStock: 1, createdAt: -1 });
socialPostSchema.index({ status: 1, isPinned: -1, createdAt: -1 });

module.exports = mongoose.model('SocialPost', socialPostSchema);
