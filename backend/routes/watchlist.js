const express = require('express');
const { auth } = require('../middleware/auth');
const watchlistController = require('../controllers/watchlistController');

const router = express.Router();

// Protect all routes with authentication middleware
router.use(auth);

/**
 * @route GET /api/watchlist
 * @desc Get all watchlists of the logged-in user
 * @access Private
 */
router.get('/', watchlistController.getAll);

/**
 * @route POST /api/watchlist
 * @desc Create a new watchlist
 * @access Private
 */
router.post('/', watchlistController.create);

/**
 * @route GET /api/watchlist/news
 * @desc Get aggregated news feed for all watchlisted stocks
 * @access Private
 */
router.get('/news', watchlistController.getWatchlistNews);

/**
 * @route POST /api/watchlist/:id/stocks
 * @desc Add a stock to a watchlist
 * @access Private
 */
router.post('/:id/stocks', watchlistController.addStock);

/**
 * @route DELETE /api/watchlist/:id/stocks/:stockId
 * @desc Remove a stock from a watchlist
 * @access Private
 */
router.delete('/:id/stocks/:stockId', watchlistController.removeStock);

/**
 * @route DELETE /api/watchlist/:id
 * @desc Delete a watchlist
 * @access Private
 */
router.delete('/:id', watchlistController.remove);

module.exports = router;
