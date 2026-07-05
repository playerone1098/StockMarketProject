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
