const mongoose = require('mongoose');

/**
 * Sector model for categorizing stocks and content.
 * @module models/Sector
 */
const sectorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Sector name is required'],
    unique: true,
    trim: true
  },
  slug: {
    type: String,
    unique: true
  },
  icon: {
    type: String,
    default: '📊'
  },
  description: {
    type: String
  }
}, {
  timestamps: true
});

/**
 * Pre-save hook to auto-generate slug from name.
 */
sectorSchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }
  next();
});

module.exports = mongoose.model('Sector', sectorSchema);
