const express = require('express');
const router = express.Router();
const chartAnalysisController = require('../controllers/chartAnalysisController');

// Admin route
router.get('/admin/all', chartAnalysisController.getAdminAllAnalyses);

// Public / User routes
router.get('/:symbol', chartAnalysisController.getAnalysis);
router.post('/:symbol', chartAnalysisController.saveAnalysis);
router.delete('/:symbol', chartAnalysisController.deleteAnalysis);

module.exports = router;
