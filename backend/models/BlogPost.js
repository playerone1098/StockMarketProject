const mongoose = require('mongoose');
const { BLOG_CATEGORIES } = require('../utils/constants');

/**
 * BlogPost model for editorial and educational content.
 * @module models/BlogPost
 */
const blogPostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  slug: {
    type: String,
    unique: true
  },
  excerpt: {
    type: String,
    required: [true, 'Excerpt is required']
  },
  content: {
    type: String,
    required: [true, 'Content is required']
  },
  category: {
    type: String,
    enum: BLOG_CATEGORIES,
    required: [true, 'Category is required']
  },
  tags: [{
    type: String
  }],
  imageUrl: {
    type: String
  },
  author: {
    type: String,
    default: 'JodhpurTraders Editorial'
  },
  readTime: {
    type: Number,
    default: 5
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

blogPostSchema.index({ title: 'text', excerpt: 'text', content: 'text', tags: 'text' });

/**
 * Pre-save hook to auto-generate slug from title.
 */
blogPostSchema.pre('save', function (next) {
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

module.exports = mongoose.model('BlogPost', blogPostSchema);
