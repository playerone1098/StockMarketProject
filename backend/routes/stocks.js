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
 * @route GET /api/stocks/admin/all
 * @desc Get all stocks including inactive (admin)
 */
router.get('/admin/all', adminAuth, stockController.getAdminAll);

/**
 * @route GET /api/stocks/:symbol
 * @desc Get a single stock by symbol (public)
 */
router.get('/:symbol', stockController.getBySymbol);

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
 * @route DELETE /api/stocks/:id
 * @desc Delete a stock (admin)
 */
router.delete('/:id', adminAuth, stockController.remove);

module.exports = router;
