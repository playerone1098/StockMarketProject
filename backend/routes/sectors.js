const express = require('express');
const { adminAuth } = require('../middleware/auth');
const sectorController = require('../controllers/sectorController');

const router = express.Router();

/**
 * @route GET /api/sectors
 * @desc Get all sectors sorted alphabetically (public)
 */
router.get('/', sectorController.getAll);

/**
 * @route POST /api/sectors
 * @desc Create a new sector (admin)
 */
router.post('/', adminAuth, sectorController.create);

/**
 * @route DELETE /api/sectors/:id
 * @desc Delete a sector (admin)
 */
router.delete('/:id', adminAuth, sectorController.remove);

module.exports = router;
