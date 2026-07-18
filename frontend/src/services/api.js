import axios from 'axios';

/**
 * Service for fetching and interacting with the backend API.
 */
export const fetchMarketOverview = async () => {
  const res = await axios.get('/api/market/overview');
  return res.data;
};

export const fetchMarketStats = async () => {
  const res = await axios.get('/api/market/stats');
  return res.data;
};

export const fetchMarketIndices = async () => {
  const res = await axios.get('/api/market/indices');
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

// Watchlist API Calls
export const fetchWatchlists = async () => {
  const res = await axios.get('/api/watchlist');
  return res.data;
};

export const createWatchlist = async (name) => {
  const res = await axios.post('/api/watchlist', { name });
  return res.data;
};

export const deleteWatchlist = async (id) => {
  const res = await axios.delete(`/api/watchlist/${id}`);
  return res.data;
};

export const addStockToWatchlist = async (watchlistId, symbol) => {
  const res = await axios.post(`/api/watchlist/${watchlistId}/stocks`, { symbol });
  return res.data;
};

export const removeStockFromWatchlist = async (watchlistId, stockId) => {
  const res = await axios.delete(`/api/watchlist/${watchlistId}/stocks/${stockId}`);
  return res.data;
};

export const fetchWatchlistNews = async () => {
  const res = await axios.get('/api/watchlist/news');
  return res.data;
};

// Notification API Calls
export const fetchNotifications = async () => {
  const res = await axios.get('/api/notifications');
  return res.data;
};

export const markNotificationRead = async (id) => {
  const res = await axios.post(`/api/notifications/${id}/read`);
  return res.data;
};

export const markAllNotificationsRead = async () => {
  const res = await axios.post('/api/notifications/read-all');
  return res.data;
};
