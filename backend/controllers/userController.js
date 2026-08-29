const User = require('../models/User');
const Watchlist = require('../models/Watchlist');
const Portfolio = require('../models/Portfolio');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');

/**
 * Get list of users for Admin Console (with pagination, filtering & statistics)
 */
const getUsers = catchAsync(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const search = req.query.search || '';
  const role = req.query.role || '';
  const status = req.query.status || '';

  const query = {};

  if (search) {
    query.$or = [
      { username: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { 'profile.firstName': { $regex: search, $options: 'i' } },
      { 'profile.lastName': { $regex: search, $options: 'i' } }
    ];
  }

  if (role) {
    query.role = role;
  }

  if (status === 'active') {
    query.isActive = true;
  } else if (status === 'inactive') {
    query.isActive = false;
  }

  const skip = (page - 1) * limit;

  const users = await User.find(query)
    .select('-password')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await User.countDocuments(query);

  // Attach portfolio count and watchlist count for each user
  const userList = await Promise.all(
    users.map(async (u) => {
      const portfolioCount = await Portfolio.countDocuments({ user: u._id });
      const watchlistCount = await Watchlist.countDocuments({ user: u._id });
      return {
        ...u.toObject(),
        portfolioCount,
        watchlistCount
      };
    })
  );

  res.json({
    success: true,
    data: {
      users: userList,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
});

/**
 * Get single user details by ID
 */
const getUserById = catchAsync(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  const portfolios = await Portfolio.find({ user: user._id });
  const watchlists = await Watchlist.find({ user: user._id });

  res.json({
    success: true,
    data: {
      user: {
        ...user.toObject(),
        portfolios,
        watchlists
      }
    }
  });
});

/**
 * Create a user account from Admin Console
 */
const createUser = catchAsync(async (req, res) => {
  const { username, email, password, role, firstName, lastName, phone, isActive } = req.body;

  if (!username || !email || !password) {
    throw new ApiError(400, 'Username, email, and password are required');
  }

  const existing = await User.findOne({
    $or: [{ email: email.toLowerCase() }, { username: username.trim() }]
  });

  if (existing) {
    throw new ApiError(400, 'User with this email or username already exists');
  }

  const user = new User({
    username: username.trim(),
    email: email.toLowerCase().trim(),
    password,
    role: role || 'user',
    isActive: isActive !== undefined ? isActive : true,
    profile: {
      firstName: firstName || '',
      lastName: lastName || '',
      phone: phone || ''
    }
  });

  await user.save();

  // Create default watchlist & portfolio
  await Watchlist.create({
    user: user._id,
    name: 'My Watchlist',
    isDefault: true
  });

  await Portfolio.create({
    user: user._id,
    name: 'Main Portfolio',
    isDefault: true
  });

  const userObj = user.toObject();
  delete userObj.password;

  res.status(201).json({
    success: true,
    data: { user: userObj },
    message: 'User created successfully'
  });
});

/**
 * Update user from Admin Console
 */
const updateUser = catchAsync(async (req, res) => {
  const { username, email, role, isActive, firstName, lastName, phone, password } = req.body;
  const user = await User.findById(req.params.id);

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  if (username) user.username = username.trim();
  if (email) user.email = email.toLowerCase().trim();
  if (role) user.role = role;
  if (isActive !== undefined) user.isActive = isActive;
  if (password) user.password = password; // Pre-save hook will hash it

  if (firstName !== undefined) user.profile.firstName = firstName;
  if (lastName !== undefined) user.profile.lastName = lastName;
  if (phone !== undefined) user.profile.phone = phone;

  await user.save();

  const userObj = user.toObject();
  delete userObj.password;

  res.json({
    success: true,
    data: { user: userObj },
    message: 'User updated successfully'
  });
});

/**
 * Toggle User Active Status (Active / Inactive)
 */
const toggleUserStatus = catchAsync(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  user.isActive = !user.isActive;
  await user.save();

  res.json({
    success: true,
    data: {
      id: user._id,
      isActive: user.isActive
    },
    message: `User account ${user.isActive ? 'activated' : 'deactivated'} successfully`
  });
});

/**
 * Delete user account and associated data
 */
const deleteUser = catchAsync(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  // Prevent admin from deleting themselves
  if (user._id.toString() === req.user._id.toString()) {
    throw new ApiError(400, 'You cannot delete your own admin account');
  }

  await Watchlist.deleteMany({ user: user._id });
  await Portfolio.deleteMany({ user: user._id });
  await User.findByIdAndDelete(user._id);

  res.json({
    success: true,
    message: 'User and all associated data deleted successfully'
  });
});

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  toggleUserStatus,
  deleteUser
};
