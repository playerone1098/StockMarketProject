const express = require('express');
const { auth } = require('../middleware/auth');
const notificationController = require('../controllers/notificationController');

const router = express.Router();

router.use(auth);

/**
 * @route GET /api/notifications
 * @desc Get all notifications for user
 * @access Private
 */
router.get('/', notificationController.getAll);

/**
 * @route POST /api/notifications/:id/read
 * @desc Mark a notification as read
 * @access Private
 */
router.post('/:id/read', notificationController.markRead);

/**
 * @route POST /api/notifications/read-all
 * @desc Mark all notifications as read
 * @access Private
 */
router.post('/read-all', notificationController.markAllRead);

module.exports = router;
