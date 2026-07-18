const express = require('express');
const marketController = require('../controllers/marketController');

const router = express.Router();

/**
 * @route GET /api/market/overview
 * @desc Get market overview with counts (public)
 */
router.get('/overview', marketController.getOverview);

/**
 * @route GET /api/market/stats
 * @desc Get site stats for homepage (public)
 */
router.get('/stats', marketController.getStats);

/**
 * @route GET /api/market/indices
 * @desc Get live stock indices (public)
 */
router.get('/indices', marketController.getIndices);

module.exports = router;
