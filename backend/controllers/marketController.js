const Stock = require('../models/Stock');
const TradingIdea = require('../models/TradingIdea');
const IPO = require('../models/IPO');
const BlogPost = require('../models/BlogPost');
const catchAsync = require('../utils/catchAsync');

/**
 * Get market overview — counts of stocks, ideas, open IPOs, latest blog.
 */
const getOverview = catchAsync(async (req, res) => {
  const [totalStocks, activeIdeas, openIpos, latestBlog] = await Promise.all([
    Stock.countDocuments({ isActive: true }),
    TradingIdea.countDocuments({ isActive: true }),
    IPO.countDocuments({ isActive: true, status: { $in: ['upcoming', 'open'] } }),
    BlogPost.findOne({ isActive: true })
      .sort({ createdAt: -1 })
      .select('title slug excerpt category createdAt')
  ]);

  res.json({
    success: true,
    data: {
      totalStocks,
      activeIdeas,
      openIpos,
      latestBlog
    }
  });
});

/**
 * Get site stats for homepage hero section.
 */
const getStats = catchAsync(async (req, res) => {
  const [
    totalStocks,
    totalIdeas,
    totalIpos,
    totalBlogs,
    featuredIdeas,
    recentIdeas
  ] = await Promise.all([
    Stock.countDocuments({ isActive: true }),
    TradingIdea.countDocuments({ isActive: true }),
    IPO.countDocuments({ isActive: true }),
    BlogPost.countDocuments({ isActive: true }),
    TradingIdea.find({ isActive: true, isFeatured: true })
      .sort({ createdAt: -1 })
      .limit(3)
      .select('title slug ideaType stockSymbol entryPrice targetPrice'),
    TradingIdea.find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title slug ideaType stockSymbol sector createdAt')
  ]);

  res.json({
    success: true,
    data: {
      stocks: totalStocks,
      ideas: totalIdeas,
      tradingIdeas: totalIdeas,
      ipos: totalIpos,
      blogs: totalBlogs,
      counts: {
        stocks: totalStocks,
        tradingIdeas: totalIdeas,
        ideas: totalIdeas,
        ipos: totalIpos,
        blogs: totalBlogs
      },
      featuredIdeas,
      recentIdeas,
      disclaimer: 'StockVista provides information for educational purposes only. This is not financial advice. Please consult a SEBI-registered advisor before making investment decisions.'
    }
  });
});

/**
 * Get Indian benchmark indices (Nifty 50, Bank Nifty, Sensex, FinNifty, MidCap 100).
 */
const getIndices = catchAsync(async (req, res) => {
  const indices = [
    { symbol: 'NIFTY50', name: 'Nifty 50', value: 24835.40, change: 142.80, changePercent: 0.58, isUp: true },
    { symbol: 'BANKNIFTY', name: 'Bank Nifty', value: 52240.15, change: 385.50, changePercent: 0.74, isUp: true },
    { symbol: 'SENSEX', name: 'BSE Sensex', value: 81420.80, change: 410.25, changePercent: 0.51, isUp: true },
    { symbol: 'FINNIFTY', name: 'Fin Nifty', value: 23450.60, change: 115.30, changePercent: 0.49, isUp: true },
    { symbol: 'MIDCAP100', name: 'Nifty Midcap 100', value: 58920.10, change: 540.80, changePercent: 0.93, isUp: true }
  ];

  res.json({
    success: true,
    data: indices
  });
});

module.exports = { getOverview, getStats, getIndices };
