const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    unique: true,
    sparse: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },
  authProvider: {
    type: String,
    enum: ['local', 'phone', 'google'],
    default: 'local'
  },
  password: {
    type: String,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  profile: {
    firstName: { type: String, default: '' },
    lastName: { type: String, default: '' },
    phone: { type: String, default: '' },
    address: { type: String, default: '' },
    avatar: { type: String, default: '' },
    bio: { type: String, default: '' }
  },
  settings: {
    currency: { type: String, default: 'INR' },
    defaultWatchlist: { type: mongoose.Schema.Types.ObjectId, ref: 'Watchlist' },
    defaultPortfolio: { type: mongoose.Schema.Types.ObjectId, ref: 'Portfolio' },
    theme: { type: String, default: 'dark' },
    notifications: {
      emailAlerts: { type: Boolean, default: true },
      priceAlerts: { type: Boolean, default: true }
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Hash password before saving if password exists and is modified
userSchema.pre('save', async function(next) {
  if (!this.password || !this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);

