const express = require('express');
const router = express.Router();
const indianApiController = require('../controllers/indianApiController');

// Indian Stock Market API routes
router.get('/company', indianApiController.getCompanyDetails);
router.get('/trending', indianApiController.getTrending);
router.get('/most-active', indianApiController.getMostActive);
router.get('/high-low-52w', indianApiController.get52WHighLow);
router.get('/price-shockers', indianApiController.getPriceShockers);
router.get('/commodities', indianApiController.getCommodities);
router.get('/target-price/:symbol', indianApiController.getTargetPrice);
router.get('/historical/:symbol', indianApiController.getHistoricalChart);
router.get('/financial-stats/:symbol', indianApiController.getHistoricalFinancialStats);
router.get('/mutual-funds', indianApiController.getMutualFunds);
router.get('/industry-search', indianApiController.searchIndustry);

module.exports = router;
