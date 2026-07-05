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
      counts: {
        stocks: totalStocks,
        tradingIdeas: totalIdeas,
        ipos: totalIpos,
        blogs: totalBlogs
      },
      featuredIdeas,
      recentIdeas,
      disclaimer: 'StockVista provides information for educational purposes only. This is not financial advice. Please consult a SEBI-registered advisor before making investment decisions.'
    }
  });
});

module.exports = { getOverview, getStats };
