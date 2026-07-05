const express = require('express');
const { adminAuth } = require('../middleware/auth');
const analyticsController = require('../controllers/analyticsController');

const router = express.Router();

/**
 * @route POST /api/analytics/track
 * @desc Track an analytics event (public)
 */
router.post('/track', analyticsController.trackEvent);

/**
 * @route POST /api/analytics/page-view
 * @desc Track a page view event (public, backward compatible)
 */
router.post('/page-view', analyticsController.trackEvent);

/**
 * @route GET /api/analytics/stats
 * @desc Get aggregated analytics stats (admin)
 */
router.get('/stats', adminAuth, analyticsController.getStats);

module.exports = router;
