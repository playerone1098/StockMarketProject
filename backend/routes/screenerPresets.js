const express = require('express');
const { adminAuth } = require('../middleware/auth');
const screenerPresetController = require('../controllers/screenerPresetController');

const router = express.Router();

/**
 * @route GET /api/screener-presets
 * @desc Get active screener presets (public)
 */
router.get('/', screenerPresetController.getAllPresets);

/**
 * @route GET /api/screener-presets/admin/all
 * @desc Get all screener presets for admin
 */
router.get('/admin/all', adminAuth, screenerPresetController.getAdminPresets);

/**
 * @route POST /api/screener-presets
 * @desc Create new screener preset (admin)
 */
router.post('/', adminAuth, screenerPresetController.createPreset);

/**
 * @route PUT /api/screener-presets/:id
 * @desc Update screener preset (admin)
 */
router.put('/:id', adminAuth, screenerPresetController.updatePreset);

/**
 * @route DELETE /api/screener-presets/:id
 * @desc Delete screener preset (admin)
 */
router.delete('/:id', adminAuth, screenerPresetController.deletePreset);

module.exports = router;
