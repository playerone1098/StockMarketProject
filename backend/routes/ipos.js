const express = require('express');
const { adminAuth } = require('../middleware/auth');
const ipoController = require('../controllers/ipoController');

const router = express.Router();

/**
 * @route GET /api/ipos
 * @desc Get all active IPOs (public, filterable by status, paginated)
 */
router.get('/', ipoController.getAll);

/**
 * @route GET /api/ipos/admin/all
 * @desc Get all IPOs including inactive (admin)
 */
router.get('/admin/all', adminAuth, ipoController.getAdminAll);

/**
 * @route GET /api/ipos/:slug
 * @desc Get a single IPO by slug (public)
 */
router.get('/:slug', ipoController.getBySlug);

/**
 * @route POST /api/ipos
 * @desc Create a new IPO (admin)
 */
router.post('/', adminAuth, ipoController.create);

/**
 * @route PUT /api/ipos/:id
 * @desc Update an IPO (admin)
 */
router.put('/:id', adminAuth, ipoController.update);

/**
 * @route PATCH /api/ipos/:id
 * @desc Partially update an IPO (admin)
 */
router.patch('/:id', adminAuth, ipoController.partialUpdate);

/**
 * @route POST /api/ipos/sync
 * @desc Sync all IPO data with live status (admin)
 */
router.post('/sync', adminAuth, ipoController.syncIPOs);

/**
 * @route DELETE /api/ipos/:id
 * @desc Delete an IPO (admin)
 */
router.delete('/:id', adminAuth, ipoController.remove);

module.exports = router;
