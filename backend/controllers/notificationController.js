const Notification = require('../models/Notification');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');

/**
 * Get all notifications for the authenticated user.
 */
const getAll = catchAsync(async (req, res) => {
  const notifications = await Notification.find({ user: req.user._id })
    .populate('stock')
    .populate('relatedNews')
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    data: notifications
  });
});

/**
 * Mark a single notification as read.
 */
const markRead = catchAsync(async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    { $set: { isRead: true } },
    { new: true }
  );

  if (!notification) {
    throw new ApiError(404, 'Notification not found');
  }

  res.json({
    success: true,
    data: notification,
    message: 'Notification marked as read'
  });
});

/**
 * Mark all notifications as read for the user.
 */
const markAllRead = catchAsync(async (req, res) => {
  await Notification.updateMany(
    { user: req.user._id, isRead: false },
    { $set: { isRead: true } }
  );

  res.json({
    success: true,
    message: 'All notifications marked as read'
  });
});

module.exports = {
  getAll,
  markRead,
  markAllRead
};
