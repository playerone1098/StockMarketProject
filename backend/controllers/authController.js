const jwt = require('jsonwebtoken');
const User = require('../models/User');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');
const config = require('../config');

/**
 * Login handler — validates credentials, generates JWT.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(400, 'Invalid credentials');
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new ApiError(400, 'Invalid credentials');
  }

  const token = jwt.sign(
    { userId: user._id },
    config.jwtSecret,
    { expiresIn: '7d' }
  );

  res.json({
    success: true,
    data: {
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        profile: user.profile
      }
    },
    message: 'Login successful'
  });
});

/**
 * Register handler — creates a new user, generates JWT.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
const register = catchAsync(async (req, res) => {
  const { username, email, password } = req.body;

  // Check if email already exists
  let existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    throw new ApiError(400, 'Email already registered');
  }

  // Check if username already exists
  existingUser = await User.findOne({ username });
  if (existingUser) {
    throw new ApiError(400, 'Username already taken');
  }

  // Create new user
  const user = await User.create({
    username,
    email: email.toLowerCase(),
    password,
    role: 'user'
  });

  const token = jwt.sign(
    { userId: user._id },
    config.jwtSecret,
    { expiresIn: '7d' }
  );

  res.status(201).json({
    success: true,
    data: {
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        profile: user.profile
      }
    },
    message: 'Registration successful'
  });
});

/**
 * Get current authenticated user.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
const getMe = catchAsync(async (req, res) => {
  res.json({
    success: true,
    data: {
      user: {
        id: req.user._id,
        username: req.user.username,
        email: req.user.email,
        role: req.user.role,
        profile: req.user.profile
      }
    }
  });
});

module.exports = { login, register, getMe };
