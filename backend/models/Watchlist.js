const mongoose = require('mongoose');

/**
 * Watchlist model. A user can have multiple watchlists of stocks.
 * @module models/Watchlist
 */
const watchlistSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    default: 'My Watchlist'
  },
  stocks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Stock'
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Watchlist', watchlistSchema);
