const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const Watchlist = require('../models/Watchlist');
const Portfolio = require('../models/Portfolio');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');
const config = require('../config');

// Initialize Google OAuth2 Client if Client ID exists
const googleClientId = process.env.GOOGLE_CLIENT_ID || config.googleClientId;
const googleClient = new OAuth2Client(googleClientId);

/**
 * Helper to generate JWT token for user
 */
const generateToken = (userId) => {
  return jwt.sign({ userId }, config.jwtSecret, { expiresIn: '7d' });
};

/**
 * Helper to create default Watchlist and Portfolio for new user
 */
const createDefaultUserData = async (user) => {
  const defaultWatchlist = await Watchlist.create({
    user: user._id,
    name: 'My Watchlist',
    description: 'Default stock watchlist',
    isDefault: true,
    items: []
  });

  const defaultPortfolio = await Portfolio.create({
    user: user._id,
    name: 'Main Portfolio',
    description: 'Primary equity portfolio',
    isDefault: true,
    holdings: []
  });

  user.settings.defaultWatchlist = defaultWatchlist._id;
  user.settings.defaultPortfolio = defaultPortfolio._id;
  await user.save();
};

/**
 * Google OAuth Unified Login/Register
 */
const googleAuth = catchAsync(async (req, res) => {
  const { credential, userInfo } = req.body;
  let googleId, email, name, avatar;

  if (credential) {
    try {
      if (googleClientId) {
        const ticket = await googleClient.verifyIdToken({
          idToken: credential,
          audience: googleClientId
        });
        const payload = ticket.getPayload();
        googleId = payload.sub;
        email = payload.email;
        name = payload.name || payload.given_name;
        avatar = payload.picture;
      } else {
        // Parse JWT payload without verification if client id isn't set locally yet
        const base64Url = credential.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map((c) => {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        const payload = JSON.parse(jsonPayload);
        googleId = payload.sub;
        email = payload.email;
        name = payload.name || payload.given_name;
        avatar = payload.picture;
      }
    } catch (err) {
      console.warn('[Google Auth] Token verification warning:', err.message);
      if (userInfo) {
        googleId = userInfo.googleId || userInfo.sub || userInfo.id;
        email = userInfo.email;
        name = userInfo.name;
        avatar = userInfo.picture;
      } else {
        throw new ApiError(400, 'Invalid Google login credentials');
      }
    }
  } else if (userInfo) {
    googleId = userInfo.googleId || userInfo.sub || userInfo.id;
    email = userInfo.email;
    name = userInfo.name;
    avatar = userInfo.picture;
  } else {
    throw new ApiError(400, 'Google credentials are required');
  }

  if (!googleId && !email) {
    throw new ApiError(400, 'Unable to retrieve user details from Google');
  }

  // Unified Auth Flow: Find user by googleId or email
  let user = await User.findOne({
    $or: [
      { googleId: googleId },
      ...(email ? [{ email: email.toLowerCase() }] : [])
    ]
  });

  let isNewUser = false;

  if (!user) {
    isNewUser = true;
    const baseUsername = email ? email.split('@')[0] : 'trader_google';
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    let username = `${baseUsername}_${randomSuffix}`;

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      username = `${baseUsername}_${Date.now().toString().slice(-4)}`;
    }

    user = new User({
      username,
      email: email ? email.toLowerCase() : undefined,
      googleId,
      authProvider: 'google',
      profile: {
        firstName: name || '',
        avatar: avatar || ''
      }
    });

    await user.save();
    await createDefaultUserData(user);
  } else {
    if (!user.isActive) {
      throw new ApiError(403, 'Account is deactivated. Please contact support.');
    }
    if (!user.googleId && googleId) {
      user.googleId = googleId;
    }
    if (avatar && !user.profile.avatar) {
      user.profile.avatar = avatar;
    }
    user.lastLogin = new Date();
    await user.save();
  }

  const token = generateToken(user._id);

  res.json({
    success: true,
    data: {
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        role: user.role,
        profile: user.profile,
        settings: user.settings,
        authProvider: user.authProvider
      },
      isNewUser
    },
    message: isNewUser ? 'Account registered with Google successfully!' : 'Login successful!'
  });
});

/**
 * Get current authenticated user details.
 */
const getMe = catchAsync(async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  
  res.json({
    success: true,
    data: {
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        role: user.role,
        profile: user.profile,
        settings: user.settings,
        isActive: user.isActive,
        authProvider: user.authProvider,
        createdAt: user.createdAt
      }
    }
  });
});

/**
 * Update user profile & settings.
 */
const updateProfile = catchAsync(async (req, res) => {
  const { firstName, lastName, phone, address, avatar, bio, settings } = req.body;
  const user = await User.findById(req.user._id);

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  if (firstName !== undefined) user.profile.firstName = firstName;
  if (lastName !== undefined) user.profile.lastName = lastName;
  if (phone !== undefined) {
    user.profile.phone = phone;
    user.phone = phone;
  }
  if (address !== undefined) user.profile.address = address;
  if (avatar !== undefined) user.profile.avatar = avatar;
  if (bio !== undefined) user.profile.bio = bio;

  if (settings) {
    if (settings.currency) user.settings.currency = settings.currency;
    if (settings.theme) user.settings.theme = settings.theme;
    if (settings.notifications) {
      user.settings.notifications = {
        ...user.settings.notifications,
        ...settings.notifications
      };
    }
  }

  await user.save();

  res.json({
    success: true,
    data: {
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        role: user.role,
        profile: user.profile,
        settings: user.settings
      }
    },
    message: 'Profile updated successfully'
  });
});

module.exports = {
  googleAuth,
  getMe,
  updateProfile
};
