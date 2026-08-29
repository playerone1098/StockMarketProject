const mongoose = require('mongoose');

const watchlistSchema = new mongoose.Schema({
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
    default: 'My Watchlist'
  },
  description: {
    type: String,
    default: ''
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  items: [{
    symbol: {
      type: String,
      required: true,
      uppercase: true,
      trim: true
    },
    stock: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Stock'
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Watchlist', watchlistSchema);
