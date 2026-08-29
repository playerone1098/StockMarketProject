import axios from 'axios';

// Ensure token is attached from localStorage on initial load
const token = localStorage.getItem('jodhpurtraders_token') || localStorage.getItem('stockvista_token');
if (token) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

/**
 * Market & Stocks API
 */
export const fetchMarketOverview = async () => {
  const res = await axios.get('/api/market/overview');
  return res.data;
};

export const fetchMarketStats = async () => {
  const res = await axios.get('/api/market/stats');
  return res.data;
};

export const fetchSectors = async () => {
  const res = await axios.get('/api/sectors');
  return res.data;
};

export const fetchStocks = async (params = {}) => {
  const res = await axios.get('/api/stocks', { params });
  return res.data;
};

export const fetchStockBySymbol = async (symbol) => {
  const res = await axios.get(`/api/stocks/${symbol}`);
  return res.data;
};

export const fetchStockChartData = async (symbol, timeframe = '1D') => {
  const res = await axios.get(`/api/stocks/${symbol}/chart`, { params: { timeframe } });
  return res.data;
};

/**
 * Advanced Screener & Market Heatmap API
 */
export const runStockScreener = async (params = {}) => {
  const res = await axios.get('/api/stocks/screener', { params });
  return res.data;
};

export const fetchMarketMovers = async (limit = 10) => {
  const res = await axios.get('/api/stocks/movers', { params: { limit } });
  return res.data;
};

export const fetchMarketHeatmap = async () => {
  const res = await axios.get('/api/stocks/heatmap');
  return res.data;
};

export const fetchScreenerPresets = async () => {
  const res = await axios.get('/api/screener-presets');
  return res.data;
};

export const fetchTradingIdeas = async (params = {}) => {
  const res = await axios.get('/api/trading-ideas', { params });
  return res.data;
};

export const fetchTradingIdeaBySlug = async (slug) => {
  const res = await axios.get(`/api/trading-ideas/${slug}`);
  return res.data;
};

export const fetchFeaturedTradingIdeas = async () => {
  const res = await axios.get('/api/trading-ideas/featured');
  return res.data;
};

export const fetchIPOs = async (params = {}) => {
  const res = await axios.get('/api/ipos', { params });
  return res.data;
};

export const fetchIPOBySlug = async (slug) => {
  const res = await axios.get(`/api/ipos/${slug}`);
  return res.data;
};

export const fetchBlogs = async (params = {}) => {
  const res = await axios.get('/api/blogs', { params });
  return res.data;
};

export const fetchBlogBySlug = async (slug) => {
  const res = await axios.get(`/api/blogs/${slug}`);
  return res.data;
};

export const fetchFeaturedBlogs = async () => {
  const res = await axios.get('/api/blogs/featured');
  return res.data;
};

export const trackPageView = async (path) => {
  try {
    await axios.post('/api/analytics/page-view', { path });
  } catch (err) {
    console.error('Analytics tracking failed:', err);
  }
};

/**
 * Watchlist API
 */
export const fetchWatchlists = async () => {
  const res = await axios.get('/api/watchlists');
  return res.data;
};

export const createWatchlist = async (data) => {
  const res = await axios.post('/api/watchlists', data);
  return res.data;
};

export const updateWatchlist = async (id, data) => {
  const res = await axios.put(`/api/watchlists/${id}`, data);
  return res.data;
};

export const deleteWatchlist = async (id) => {
  const res = await axios.delete(`/api/watchlists/${id}`);
  return res.data;
};

export const addStockToWatchlist = async (watchlistId, symbol) => {
  const res = await axios.post(`/api/watchlists/${watchlistId}/items`, { symbol });
  return res.data;
};

export const removeStockFromWatchlist = async (watchlistId, symbol) => {
  const res = await axios.delete(`/api/watchlists/${watchlistId}/items/${symbol}`);
  return res.data;
};

export const checkStockInWatchlists = async (symbol) => {
  const res = await axios.get(`/api/watchlists/check/${symbol}`);
  return res.data;
};

/**
 * Portfolio API
 */
export const fetchPortfolios = async () => {
  const res = await axios.get('/api/portfolios');
  return res.data;
};

export const fetchPortfolioById = async (id) => {
  const res = await axios.get(`/api/portfolios/${id}`);
  return res.data;
};

export const createPortfolio = async (data) => {
  const res = await axios.post('/api/portfolios', data);
  return res.data;
};

export const updatePortfolio = async (id, data) => {
  const res = await axios.put(`/api/portfolios/${id}`, data);
  return res.data;
};

export const deletePortfolio = async (id) => {
  const res = await axios.delete(`/api/portfolios/${id}`);
  return res.data;
};

export const addPortfolioHolding = async (portfolioId, holdingData) => {
  const res = await axios.post(`/api/portfolios/${portfolioId}/holdings`, holdingData);
  return res.data;
};

export const updatePortfolioHolding = async (portfolioId, holdingId, holdingData) => {
  const res = await axios.put(`/api/portfolios/${portfolioId}/holdings/${holdingId}`, holdingData);
  return res.data;
};

export const deletePortfolioHolding = async (portfolioId, holdingId) => {
  const res = await axios.delete(`/api/portfolios/${portfolioId}/holdings/${holdingId}`);
  return res.data;
};

/**
 * Import Stock Statement (CSV or Excel) into Portfolio
 */
export const importPortfolioStatement = async (portfolioId, formDataOrData) => {
  if (formDataOrData instanceof FormData) {
    const res = await axios.post(`/api/portfolios/${portfolioId}/import`, formDataOrData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  } else {
    const res = await axios.post(`/api/portfolios/${portfolioId}/import`, formDataOrData);
    return res.data;
  }
};

/**
 * Indian Stock Market Live API Endpoints
 */
export const fetchIndianTrending = async () => {
  const res = await axios.get('/api/indian/trending');
  return res.data;
};

export const fetchIndianMostActive = async (exchange = 'NSE') => {
  const res = await axios.get('/api/indian/most-active', { params: { exchange } });
  return res.data;
};

export const fetchIndian52WHighLow = async () => {
  const res = await axios.get('/api/indian/high-low-52w');
  return res.data;
};

export const fetchIndianPriceShockers = async () => {
  const res = await axios.get('/api/indian/price-shockers');
  return res.data;
};

export const fetchIndianCommodities = async () => {
  const res = await axios.get('/api/indian/commodities');
  return res.data;
};

export const fetchIndianTargetPrice = async (symbol) => {
  const res = await axios.get(`/api/indian/target-price/${symbol}`);
  return res.data;
};

export const fetchIndianHistoricalChart = async (symbol, period = '1yr', filter = 'price') => {
  const res = await axios.get(`/api/indian/historical/${symbol}`, { params: { period, filter } });
  return res.data;
};

export const fetchIndianFinancialStats = async (symbol, stats = 'quarter_results') => {
  const res = await axios.get(`/api/indian/financial-stats/${symbol}`, { params: { stats } });
  return res.data;
};

export const fetchIndianMutualFunds = async () => {
  const res = await axios.get('/api/indian/mutual-funds');
  return res.data;
};

export const fetchIndianCompanyData = async (name) => {
  const res = await axios.get('/api/indian/company', { params: { name } });
  return res.data;
};

/**
 * Social Media & Trader Community API
 */
export const fetchSocialPosts = async (params = {}) => {
  const res = await axios.get('/api/social/posts', { params });
  return res.data;
};

export const fetchSocialTrending = async () => {
  const res = await axios.get('/api/social/trending');
  return res.data;
};

export const fetchSocialPostById = async (id) => {
  const res = await axios.get(`/api/social/posts/${id}`);
  return res.data;
};

export const createSocialPost = async (data) => {
  const res = await axios.post('/api/social/posts', data);
  return res.data;
};

export const toggleSocialPostLike = async (id, data = {}) => {
  const res = await axios.post(`/api/social/posts/${id}/like`, data);
  return res.data;
};

export const addSocialPostComment = async (id, data) => {
  const res = await axios.post(`/api/social/posts/${id}/comments`, data);
  return res.data;
};

export const reportSocialPost = async (id, data = {}) => {
  const res = await axios.post(`/api/social/posts/${id}/report`, data);
  return res.data;
};

/**
 * Chart Analysis & Persistent Drawings API
 */
export const fetchChartAnalysis = async (symbol, deviceId) => {
  const res = await axios.get(`/api/chart-analysis/${symbol}`, { params: { deviceId } });
  return res.data;
};

export const saveChartAnalysis = async (symbol, data) => {
  const res = await axios.post(`/api/chart-analysis/${symbol}`, data);
  return res.data;
};

export const deleteChartAnalysis = async (symbol, deviceId) => {
  const res = await axios.delete(`/api/chart-analysis/${symbol}`, { params: { deviceId } });
  return res.data;
};

export const fetchAdminChartAnalyses = async (params = {}) => {
  const res = await axios.get('/api/chart-analysis/admin/all', { params });
  return res.data;
};


