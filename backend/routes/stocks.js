const express = require('express');
const { adminAuth } = require('../middleware/auth');
const stockController = require('../controllers/stockController');

const router = express.Router();

/**
 * @route GET /api/stocks
 * @desc Get all active stocks (public, filterable, paginated)
 */
router.get('/', stockController.getAll);

/**
 * @route GET /api/stocks/screener
 * @desc Advanced stock screener query (public)
 */
router.get('/screener', stockController.runScreener);

/**
 * @route GET /api/stocks/movers
 * @desc Get Top Gainers, Losers, Most Active, 52W Highs/Lows (public)
 */
router.get('/movers', stockController.getMarketMovers);

/**
 * @route GET /api/stocks/heatmap
 * @desc Get market heatmap grouped by sector (public)
 */
router.get('/heatmap', stockController.getMarketHeatmap);

/**
 * @route GET /api/stocks/admin/all
 * @desc Get all stocks including inactive (admin)
 */
router.get('/admin/all', adminAuth, stockController.getAdminAll);

/**
 * @route GET /api/stocks/ai-lookup/:symbol
 * @desc AI-powered company data lookup from Yahoo Finance (admin)
 */
router.get('/ai-lookup/:symbol', adminAuth, stockController.aiLookup);

/**
 * @route POST /api/stocks/generate-about
 * @desc Generate AI About company description (admin)
 */
router.post('/generate-about', adminAuth, stockController.generateAbout);

/**
 * @route GET /api/stocks/:symbol
 * @desc Get a single stock by symbol (public)
 */
router.get('/:symbol', stockController.getBySymbol);

/**
 * @route GET /api/stocks/:symbol/chart
 * @desc Get stock chart / historical price data (public)
 */
router.get('/:symbol/chart', stockController.getChartData);

/**
 * @route POST /api/stocks
 * @desc Create a new stock (admin)
 */
router.post('/', adminAuth, stockController.create);

/**
 * @route PUT /api/stocks/:id
 * @desc Update a stock (admin)
 */
router.put('/:id', adminAuth, stockController.update);

/**
 * @route POST /api/stocks/sync
 * @desc Sync all stock prices with live market data (admin)
 */
router.post('/sync', adminAuth, stockController.syncPrices);

/**
 * @route DELETE /api/stocks/:id
 * @desc Delete a stock (admin)
 */
router.delete('/:id', adminAuth, stockController.remove);

module.exports = router;
