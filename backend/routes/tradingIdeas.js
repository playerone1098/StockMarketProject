const express = require('express');
const { adminAuth } = require('../middleware/auth');
const tradingIdeaController = require('../controllers/tradingIdeaController');

const router = express.Router();

/**
 * @route GET /api/trading-ideas
 * @desc Get all active trading ideas (public, filterable, paginated)
 */
router.get('/', tradingIdeaController.getAll);

/**
 * @route GET /api/trading-ideas/featured
 * @desc Get featured trading ideas (public)
 */
router.get('/featured', tradingIdeaController.getFeatured);

/**
 * @route GET /api/trading-ideas/stats
 * @desc Get trading idea statistics (public)
 */
router.get('/stats', tradingIdeaController.getStats);

/**
 * @route GET /api/trading-ideas/admin/all
 * @desc Get all trading ideas including inactive (admin)
 */
router.get('/admin/all', adminAuth, tradingIdeaController.getAdminAll);

/**
 * @route GET /api/trading-ideas/:slug
 * @desc Get a single trading idea by slug (public)
 */
router.get('/:slug', tradingIdeaController.getBySlug);

/**
 * @route POST /api/trading-ideas
 * @desc Create a new trading idea (admin)
 */
router.post('/', adminAuth, tradingIdeaController.create);

/**
 * @route PUT /api/trading-ideas/:id
 * @desc Update a trading idea (admin)
 */
router.put('/:id', adminAuth, tradingIdeaController.update);

/**
 * @route PATCH /api/trading-ideas/:id
 * @desc Partially update a trading idea (admin)
 */
router.patch('/:id', adminAuth, tradingIdeaController.partialUpdate);

/**
 * @route DELETE /api/trading-ideas/:id
 * @desc Delete a trading idea (admin)
 */
router.delete('/:id', adminAuth, tradingIdeaController.remove);

module.exports = router;
