const mongoose = require('mongoose');

const socialCommentSchema = new mongoose.Schema({
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SocialPost',
    required: true,
    index: true
  },
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
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('SocialComment', socialCommentSchema);
