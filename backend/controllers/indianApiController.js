const catchAsync = require('../utils/catchAsync');
const indianApiService = require('../utils/indianApiService');

/**
 * Controller for Indian API market endpoints
 */

const getCompanyDetails = catchAsync(async (req, res) => {
  const { name } = req.query;
  if (!name) {
    return res.status(400).json({ success: false, message: 'Company name is required' });
  }
  const data = await indianApiService.getCompanyStockData(name);
  res.status(200).json({ success: true, data });
});

const getTrending = catchAsync(async (req, res) => {
  const data = await indianApiService.getTrendingStocks();
  res.status(200).json({ success: true, data });
});

const getMostActive = catchAsync(async (req, res) => {
  const { exchange = 'NSE' } = req.query;
  const data = await indianApiService.getMostActiveStocks(exchange);
  res.status(200).json({ success: true, data });
});

const get52WHighLow = catchAsync(async (req, res) => {
  const data = await indianApiService.get52WeekHighLowData();
  res.status(200).json({ success: true, data });
});

const getPriceShockers = catchAsync(async (req, res) => {
  const data = await indianApiService.getPriceShockers();
  res.status(200).json({ success: true, data });
});

const getCommodities = catchAsync(async (req, res) => {
  const data = await indianApiService.getCommoditiesData();
  res.status(200).json({ success: true, data });
});

const getTargetPrice = catchAsync(async (req, res) => {
  const { symbol } = req.params;
  const data = await indianApiService.getStockTargetPrice(symbol);
  res.status(200).json({ success: true, data });
});

const getHistoricalChart = catchAsync(async (req, res) => {
  const { symbol } = req.params;
  const { period = '1yr', filter = 'price' } = req.query;
  const data = await indianApiService.getHistoricalData(symbol, period, filter);
  res.status(200).json({ success: true, data });
});

const getHistoricalFinancialStats = catchAsync(async (req, res) => {
  const { symbol } = req.params;
  const { stats = 'quarter_results' } = req.query;
  const data = await indianApiService.getHistoricalStats(symbol, stats);
  res.status(200).json({ success: true, data });
});

const getMutualFunds = catchAsync(async (req, res) => {
  const data = await indianApiService.getMutualFunds();
  res.status(200).json({ success: true, data });
});

const searchIndustry = catchAsync(async (req, res) => {
  const { query } = req.query;
  const data = await indianApiService.searchIndustry(query || '');
  res.status(200).json({ success: true, data });
});

module.exports = {
  getCompanyDetails,
  getTrending,
  getMostActive,
  get52WHighLow,
  getPriceShockers,
  getCommodities,
  getTargetPrice,
  getHistoricalChart,
  getHistoricalFinancialStats,
  getMutualFunds,
  searchIndustry
};
