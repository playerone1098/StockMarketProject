/**
 * Shared constants for the StockVista platform.
 * @module constants
 */

/** @type {string[]} Trading idea types */
const IDEA_TYPES = ['buy', 'sell', 'hold', 'watch'];

/** @type {string[]} Investment time horizons */
const TIME_HORIZONS = ['intraday', 'short-term', 'medium-term', 'long-term'];

/** @type {string[]} Risk levels */
const RISK_LEVELS = ['low', 'medium', 'high'];

/** @type {string[]} IPO statuses */
const IPO_STATUSES = ['upcoming', 'open', 'closed', 'listed'];

/** @type {string[]} Blog post categories */
const BLOG_CATEGORIES = [
  'market-analysis',
  'education',
  'ipo-review',
  'sector-analysis',
  'personal-finance',
  'news'
];

/** @type {string[]} Stock exchanges */
const EXCHANGES = ['NSE', 'BSE', 'BOTH'];

/**
 * Legacy discount types — kept for backward compatibility.
 * @type {string[]}
 */
const DISCOUNT_TYPES = ['percentage', 'flat', 'cashback', 'coupon'];

/** @type {string[]} Default stock market sectors for India */
const DEFAULT_SECTORS = [
  'Information Technology',
  'Banking & Finance',
  'Pharmaceuticals',
  'Automobile',
  'FMCG',
  'Energy & Power',
  'Metals & Mining',
  'Real Estate',
  'Telecom',
  'Infrastructure',
  'Media & Entertainment',
  'Chemicals',
  'Textiles',
  'Insurance',
  'Consumer Durables',
  'Capital Goods',
  'Cement',
  'Healthcare',
  'Retail',
  'Agriculture'
];

/** @type {string[]} Analytics event types */
const ANALYTICS_EVENT_TYPES = [
  'page_view',
  'trading_idea_view',
  'ipo_view',
  'blog_view',
  'stock_view'
];

module.exports = {
  IDEA_TYPES,
  TIME_HORIZONS,
  RISK_LEVELS,
  IPO_STATUSES,
  BLOG_CATEGORIES,
  EXCHANGES,
  DISCOUNT_TYPES,
  DEFAULT_SECTORS,
  ANALYTICS_EVENT_TYPES
};
