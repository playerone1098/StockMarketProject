const mongoose = require('mongoose');
const { ANALYTICS_EVENT_TYPES } = require('../utils/constants');

/**
 * Analytics model for tracking user engagement events.
 * @module models/Analytics
 */
const analyticsSchema = new mongoose.Schema({
  eventType: {
    type: String,
    enum: ANALYTICS_EVENT_TYPES,
    default: 'page_view',
    required: true
  },
  path: {
    type: String,
    required: true
  },
  resourceId: {
    type: mongoose.Schema.Types.ObjectId
  },
  resourceTitle: {
    type: String
  }
}, {
  timestamps: true
});

// Indexes for fast aggregation and statistics retrieval
analyticsSchema.index({ eventType: 1, createdAt: -1 });
analyticsSchema.index({ path: 1 });

module.exports = mongoose.model('Analytics', analyticsSchema);
