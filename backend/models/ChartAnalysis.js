const mongoose = require('mongoose');

const ChartAnalysisSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    deviceId: {
      type: String,
      required: true,
      index: true
    },
    symbol: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      index: true
    },
    drawings: {
      type: mongoose.Schema.Types.Mixed,
      default: []
    },
    trendlines: [
      {
        id: { type: String },
        label: { type: String, default: 'Trendline' },
        priceLevel: { type: Number },
        type: { type: String, enum: ['support', 'resistance', 'trendline', 'custom'], default: 'trendline' },
        color: { type: String, default: '#10B981' },
        notes: { type: String, default: '' }
      }
    ],
    notes: {
      type: String,
      default: '',
      maxlength: 5000
    },
    targetPrice: {
      type: Number,
      default: null
    },
    stopLoss: {
      type: Number,
      default: null
    },
    timeframe: {
      type: String,
      default: '1D'
    },
    chartType: {
      type: String,
      enum: ['tradingview', 'jodhpurtraders', 'stockvista'],
      default: 'tradingview'
    },
    lastVisitedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

// Compound index to quickly find analysis by symbol and user/deviceId
ChartAnalysisSchema.index({ symbol: 1, deviceId: 1 }, { unique: true });

module.exports = mongoose.model('ChartAnalysis', ChartAnalysisSchema);
