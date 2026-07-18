const mongoose = require('mongoose');

/**
 * Notification model. Stores alert notifications (price changes or news) for a user.
 * @module models/Notification
 */
const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['news', 'price_movement'],
    required: true
  },
  stock: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Stock'
  },
  relatedNews: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BlogPost'
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  isRead: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Notification', notificationSchema);
