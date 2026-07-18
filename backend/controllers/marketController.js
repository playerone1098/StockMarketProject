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

let cachedIndices = null;
let cacheTime = 0;

/**
 * Get major Indian indices (Nifty, Sensex, Bank Nifty) from Yahoo Finance.
 */
const getIndices = catchAsync(async (req, res) => {
  const YahooFinance = require('yahoo-finance2').default;
  const yahooFinance = new YahooFinance({ suppressNotices: ['yahooSurvey'] });
  const now = Date.now();

  // 1 minute cache
  if (cachedIndices && (now - cacheTime < 60 * 1000)) {
    return res.json({
      success: true,
      data: cachedIndices
    });
  }

  try {
    const symbols = {
      nifty: '^NSEI',
      sensex: '^BSESN',
      bankNifty: '^NSEBANK'
    };

    const results = {};
    const quotes = await Promise.all(
      Object.entries(symbols).map(async ([key, symbol]) => {
        try {
          const quote = await yahooFinance.quote(symbol);
          return { key, quote };
        } catch (err) {
          console.error(`Failed to fetch index ${symbol}:`, err.message);
          return { key, quote: null };
        }
      })
    );

    quotes.forEach(({ key, quote }) => {
      if (quote) {
        results[key] = {
          name: key === 'nifty' ? 'NIFTY 50' : key === 'sensex' ? 'SENSEX' : 'BANK NIFTY',
          price: quote.regularMarketPrice,
          change: quote.regularMarketChange,
          changePercent: quote.regularMarketChangePercent
        };
      } else {
        const mockDefaults = {
          nifty: { name: 'NIFTY 50', price: 24320.50, change: 112.30, changePercent: 0.46 },
          sensex: { name: 'SENSEX', price: 79840.10, change: 325.60, changePercent: 0.41 },
          bankNifty: { name: 'BANK NIFTY', price: 52180.40, change: -120.50, changePercent: -0.23 }
        };
        results[key] = mockDefaults[key];
      }
    });

    cachedIndices = results;
    cacheTime = now;

    res.json({
      success: true,
      data: results
    });

  } catch (err) {
    console.error('Yahoo Finance global indices fetch failed:', err.message);
    const mockIndices = {
      nifty: { name: 'NIFTY 50', price: 24320.50, change: 112.30, changePercent: 0.46 },
      sensex: { name: 'SENSEX', price: 79840.10, change: 325.60, changePercent: 0.41 },
      bankNifty: { name: 'BANK NIFTY', price: 52180.40, change: -120.50, changePercent: -0.23 }
    };
    res.json({
      success: true,
      data: mockIndices
    });
  }
});

module.exports = { getOverview, getStats, getIndices };
