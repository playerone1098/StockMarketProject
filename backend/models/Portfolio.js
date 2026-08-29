const mongoose = require('mongoose');

const holdingSchema = new mongoose.Schema({
  symbol: {
    type: String,
    required: true,
    uppercase: true,
    trim: true
  },
  name: {
    type: String,
    default: ''
  },
  stock: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Stock'
  },
  shares: {
    type: Number,
    required: true,
    min: 0.0001
  },
  avgBuyPrice: {
    type: Number,
    required: true,
    min: 0
  },
  buyDate: {
    type: Date,
    default: Date.now
  },
  broker: {
    type: String,
    default: 'Manual'
  },
  notes: {
    type: String,
    default: ''
  }
});

const portfolioSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    default: 'Main Portfolio'
  },
  description: {
    type: String,
    default: ''
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  holdings: [holdingSchema]
}, {
  timestamps: true
});

module.exports = mongoose.model('Portfolio', portfolioSchema);
