const mongoose = require('mongoose');
const Stock = require('../models/Stock');
const TradingIdea = require('../models/TradingIdea');
const IPO = require('../models/IPO');
const BlogPost = require('../models/BlogPost');
require('dotenv').config();

/**
 * Sample stocks — 15 major Indian companies with realistic data.
 */
const sampleStocks = [
  { symbol: 'RELIANCE', name: 'Reliance Industries Ltd', sector: 'Energy & Power', exchange: 'NSE', currentPrice: 2945.50, dayChange: 32.15, dayChangePercent: 1.10, weekHigh52: 3217.60, weekLow52: 2220.30, marketCap: 1993000, marketCapLabel: 'Large Cap' },
  { symbol: 'TCS', name: 'Tata Consultancy Services Ltd', sector: 'Information Technology', exchange: 'NSE', currentPrice: 3892.75, dayChange: -18.40, dayChangePercent: -0.47, weekHigh52: 4256.80, weekLow52: 3311.05, marketCap: 1420000, marketCapLabel: 'Large Cap' },
  { symbol: 'INFY', name: 'Infosys Ltd', sector: 'Information Technology', exchange: 'NSE', currentPrice: 1587.30, dayChange: 12.85, dayChangePercent: 0.82, weekHigh52: 1953.90, weekLow52: 1358.45, marketCap: 659000, marketCapLabel: 'Large Cap' },
  { symbol: 'HDFCBANK', name: 'HDFC Bank Ltd', sector: 'Banking & Finance', exchange: 'NSE', currentPrice: 1678.90, dayChange: 24.60, dayChangePercent: 1.49, weekHigh52: 1880.00, weekLow52: 1460.30, marketCap: 1280000, marketCapLabel: 'Large Cap' },
  { symbol: 'ICICIBANK', name: 'ICICI Bank Ltd', sector: 'Banking & Finance', exchange: 'NSE', currentPrice: 1245.55, dayChange: 15.20, dayChangePercent: 1.24, weekHigh52: 1362.35, weekLow52: 1006.45, marketCap: 872000, marketCapLabel: 'Large Cap' },
  { symbol: 'BHARTIARTL', name: 'Bharti Airtel Ltd', sector: 'Telecom', exchange: 'NSE', currentPrice: 1612.40, dayChange: -8.75, dayChangePercent: -0.54, weekHigh52: 1779.00, weekLow52: 1200.95, marketCap: 964000, marketCapLabel: 'Large Cap' },
  { symbol: 'ITC', name: 'ITC Ltd', sector: 'FMCG', exchange: 'NSE', currentPrice: 465.80, dayChange: 3.45, dayChangePercent: 0.75, weekHigh52: 528.55, weekLow52: 399.35, marketCap: 581000, marketCapLabel: 'Large Cap' },
  { symbol: 'SBIN', name: 'State Bank of India', sector: 'Banking & Finance', exchange: 'NSE', currentPrice: 832.15, dayChange: 11.90, dayChangePercent: 1.45, weekHigh52: 912.10, weekLow52: 600.20, marketCap: 742000, marketCapLabel: 'Large Cap' },
  { symbol: 'KOTAKBANK', name: 'Kotak Mahindra Bank Ltd', sector: 'Banking & Finance', exchange: 'NSE', currentPrice: 1856.20, dayChange: -5.30, dayChangePercent: -0.28, weekHigh52: 2065.50, weekLow52: 1544.15, marketCap: 369000, marketCapLabel: 'Large Cap' },
  { symbol: 'LT', name: 'Larsen & Toubro Ltd', sector: 'Infrastructure', exchange: 'NSE', currentPrice: 3587.60, dayChange: 42.30, dayChangePercent: 1.19, weekHigh52: 3925.00, weekLow52: 2880.75, marketCap: 492000, marketCapLabel: 'Large Cap' },
  { symbol: 'ASIANPAINT', name: 'Asian Paints Ltd', sector: 'Consumer Durables', exchange: 'NSE', currentPrice: 2876.45, dayChange: -15.80, dayChangePercent: -0.55, weekHigh52: 3395.00, weekLow52: 2670.10, marketCap: 276000, marketCapLabel: 'Large Cap' },
  { symbol: 'HINDUNILVR', name: 'Hindustan Unilever Ltd', sector: 'FMCG', exchange: 'NSE', currentPrice: 2534.70, dayChange: 8.95, dayChangePercent: 0.35, weekHigh52: 2859.30, weekLow52: 2393.00, marketCap: 595000, marketCapLabel: 'Large Cap' },
  { symbol: 'WIPRO', name: 'Wipro Ltd', sector: 'Information Technology', exchange: 'NSE', currentPrice: 487.25, dayChange: 6.40, dayChangePercent: 1.33, weekHigh52: 577.75, weekLow52: 401.60, marketCap: 254000, marketCapLabel: 'Large Cap' },
  { symbol: 'SUNPHARMA', name: 'Sun Pharmaceutical Industries Ltd', sector: 'Pharmaceuticals', exchange: 'NSE', currentPrice: 1745.90, dayChange: 22.65, dayChangePercent: 1.31, weekHigh52: 1960.35, weekLow52: 1208.55, marketCap: 419000, marketCapLabel: 'Large Cap' },
  { symbol: 'BAJFINANCE', name: 'Bajaj Finance Ltd', sector: 'Banking & Finance', exchange: 'NSE', currentPrice: 7234.50, dayChange: -45.20, dayChangePercent: -0.62, weekHigh52: 8192.00, weekLow52: 6187.80, marketCap: 448000, marketCapLabel: 'Large Cap' }
];

/**
 * Sample trading ideas — 6 ideas across different stocks and strategies.
 */
const sampleTradingIdeas = [
  {
    title: 'Reliance Industries — Bullish Breakout Above ₹2,900',
    summary: 'Reliance has broken above the key resistance of ₹2,900 with strong volume. The stock is poised for a move towards ₹3,200 in the near term.',
    content: 'Reliance Industries has been consolidating in a range of ₹2,750–₹2,900 for the past six weeks. The breakout above ₹2,900 with above-average volume signals strong buying interest. The RSI is at 62, indicating room for further upside. Key support at ₹2,850. Target ₹3,200 with a stop loss at ₹2,800.\n\n**Disclaimer:** This is for educational purposes only. Not financial advice. Consult a SEBI-registered advisor.',
    stockSymbol: 'RELIANCE',
    stockName: 'Reliance Industries Ltd',
    sector: 'Energy & Power',
    ideaType: 'buy',
    entryPrice: 2945,
    targetPrice: 3200,
    stopLoss: 2800,
    timeHorizon: 'short-term',
    riskLevel: 'medium',
    tags: ['reliance', 'breakout', 'energy', 'large-cap'],
    author: 'StockVista Research',
    isFeatured: true
  },
  {
    title: 'HDFC Bank — Accumulate on Dips Near ₹1,650',
    summary: 'HDFC Bank is trading near strong support at ₹1,650. With improving NIMs and credit growth, the banking heavyweight offers a favorable risk-reward ratio.',
    content: 'HDFC Bank has corrected ~8% from its recent highs and is now trading near the 100-DMA support at ₹1,650. The bank posted strong Q4 results with NII growing 24% YoY. Asset quality remains stable with GNPA at 1.24%. Accumulate at current levels for a medium-term target of ₹1,880.\n\n**Disclaimer:** This is for educational purposes only. Not financial advice. Consult a SEBI-registered advisor.',
    stockSymbol: 'HDFCBANK',
    stockName: 'HDFC Bank Ltd',
    sector: 'Banking & Finance',
    ideaType: 'buy',
    entryPrice: 1678,
    targetPrice: 1880,
    stopLoss: 1580,
    timeHorizon: 'medium-term',
    riskLevel: 'low',
    tags: ['hdfc-bank', 'banking', 'accumulate', 'large-cap'],
    author: 'StockVista Research',
    isFeatured: true
  },
  {
    title: 'Asian Paints — Sell Signal Below ₹2,850',
    summary: 'Asian Paints is showing bearish patterns after weak demand commentary. Rising crude oil prices further threaten margins.',
    content: 'Asian Paints has broken below the ₹2,900 support level and is now testing ₹2,850. Management guided for cautious demand in the near term due to monsoon seasonality and rural slowdown. Rising crude oil prices pose an additional threat to input costs. The stock could see further downside towards ₹2,650 if ₹2,850 breaks.\n\n**Disclaimer:** This is for educational purposes only. Not financial advice. Consult a SEBI-registered advisor.',
    stockSymbol: 'ASIANPAINT',
    stockName: 'Asian Paints Ltd',
    sector: 'Consumer Durables',
    ideaType: 'sell',
    entryPrice: 2876,
    targetPrice: 2650,
    stopLoss: 2960,
    timeHorizon: 'short-term',
    riskLevel: 'high',
    tags: ['asian-paints', 'sell', 'bearish', 'consumer'],
    author: 'StockVista Research',
    isFeatured: false
  },
  {
    title: 'Infosys — Hold with a Target of ₹1,750',
    summary: 'Infosys has shown resilience amidst IT sector headwinds. Strong deal wins and improving margins support the holding case.',
    content: 'Infosys posted a strong deal pipeline of $4.5B in Q4 with a healthy mix of large and mega deals. The company has guided for 4-7% CC revenue growth for FY27 with an operating margin band of 20-22%. The stock is currently trading at 25x FY27E earnings, which is in line with historical averages. Hold for a target of ₹1,750.\n\n**Disclaimer:** This is for educational purposes only. Not financial advice. Consult a SEBI-registered advisor.',
    stockSymbol: 'INFY',
    stockName: 'Infosys Ltd',
    sector: 'Information Technology',
    ideaType: 'hold',
    entryPrice: 1587,
    targetPrice: 1750,
    stopLoss: 1480,
    timeHorizon: 'medium-term',
    riskLevel: 'low',
    tags: ['infosys', 'it-sector', 'hold', 'large-cap'],
    author: 'StockVista Research',
    isFeatured: true
  },
  {
    title: 'Sun Pharma — Momentum Play for ₹1,950 Target',
    summary: 'Sun Pharma is riding strong momentum with specialty business growth. Technical indicators point to further upside.',
    content: 'Sun Pharma specialty segment revenue grew 32% YoY, driving overall revenue growth of 11%. The EBITDA margin expanded to 28.5%, up 200bps QoQ. The stock has formed a strong cup-and-handle pattern on the weekly chart. A breakout above ₹1,770 could take it to ₹1,950. Entry near ₹1,745 with stop loss at ₹1,650.\n\n**Disclaimer:** This is for educational purposes only. Not financial advice. Consult a SEBI-registered advisor.',
    stockSymbol: 'SUNPHARMA',
    stockName: 'Sun Pharmaceutical Industries Ltd',
    sector: 'Pharmaceuticals',
    ideaType: 'buy',
    entryPrice: 1745,
    targetPrice: 1950,
    stopLoss: 1650,
    timeHorizon: 'short-term',
    riskLevel: 'medium',
    tags: ['sun-pharma', 'pharma', 'momentum', 'specialty'],
    author: 'StockVista Research',
    isFeatured: false
  },
  {
    title: 'L&T — Watch for Breakout Above ₹3,600',
    summary: 'L&T order book is at an all-time high. Watch for a decisive close above ₹3,600 for a potential rally towards ₹4,000.',
    content: 'Larsen & Toubro reported an order inflow of ₹76,000 Cr in Q4, taking the total order book to ₹5.2 lakh Cr. The company is a key beneficiary of the government\'s infrastructure push. The stock is currently consolidating near ₹3,580. A breakout above ₹3,600 with volume confirmation could trigger a rally towards ₹3,900-4,000.\n\n**Disclaimer:** This is for educational purposes only. Not financial advice. Consult a SEBI-registered advisor.',
    stockSymbol: 'LT',
    stockName: 'Larsen & Toubro Ltd',
    sector: 'Infrastructure',
    ideaType: 'watch',
    entryPrice: 3600,
    targetPrice: 4000,
    stopLoss: 3400,
    timeHorizon: 'medium-term',
    riskLevel: 'medium',
    tags: ['lt', 'infrastructure', 'breakout', 'watch'],
    author: 'StockVista Research',
    isFeatured: false
  }
];

/**
 * Sample IPOs — 4 IPOs with mixed statuses.
 */
const sampleIPOs = [
  {
    companyName: 'Vikram Solar Ltd',
    symbol: 'VIKRAMSOL',
    description: 'Vikram Solar is one of India\'s leading solar energy solutions providers, manufacturing solar PV modules and providing EPC services. The company has a manufacturing capacity of 3.5 GW and serves both domestic and international markets.',
    sector: 'Energy & Power',
    priceRange: { min: 340, max: 378 },
    lotSize: 39,
    issueSize: '₹2,100 Cr',
    issueType: 'Both',
    openDate: new Date('2026-07-15'),
    closeDate: new Date('2026-07-18'),
    status: 'upcoming',
    registrar: 'Link Intime India Pvt Ltd'
  },
  {
    companyName: 'PhysicsWallah Ltd',
    symbol: 'PW',
    description: 'PhysicsWallah is an ed-tech platform offering affordable and accessible education for competitive exam preparation. With over 35 million registered students, it is one of India\'s fastest-growing edtech companies.',
    sector: 'Information Technology',
    priceRange: { min: 265, max: 280 },
    lotSize: 53,
    issueSize: '₹4,600 Cr',
    issueType: 'Fresh Issue',
    openDate: new Date('2026-07-08'),
    closeDate: new Date('2026-07-11'),
    status: 'open',
    subscriptionStatus: { retail: 2.8, nii: 4.2, qib: 8.5, total: 5.1 },
    registrar: 'KFin Technologies Ltd'
  },
  {
    companyName: 'Ather Energy Ltd',
    symbol: 'ATHER',
    description: 'Ather Energy is an Indian electric scooter manufacturer and EV infrastructure company. Known for the Ather 450X, it operates one of the largest fast-charging networks in India with over 2,000 Ather Grid points.',
    sector: 'Automobile',
    priceRange: { min: 304, max: 321 },
    lotSize: 46,
    issueSize: '₹3,100 Cr',
    issueType: 'Both',
    openDate: new Date('2026-06-25'),
    closeDate: new Date('2026-06-28'),
    listingDate: new Date('2026-07-03'),
    listingPrice: 358,
    status: 'listed',
    subscriptionStatus: { retail: 12.5, nii: 18.7, qib: 42.3, total: 24.6 },
    registrar: 'Link Intime India Pvt Ltd'
  },
  {
    companyName: 'Boat Lifestyle Ltd',
    symbol: 'BOAT',
    description: 'Boat (Imagine Marketing) is India\'s leading audio and wearable brand, known for affordable and trendy consumer electronics. It holds the #1 position in the TWS (True Wireless Stereo) and neckband categories in India.',
    sector: 'Consumer Durables',
    priceRange: { min: 2000, max: 2150 },
    lotSize: 6,
    issueSize: '₹2,000 Cr',
    issueType: 'OFS',
    openDate: new Date('2026-06-15'),
    closeDate: new Date('2026-06-18'),
    status: 'closed',
    subscriptionStatus: { retail: 5.3, nii: 7.8, qib: 15.2, total: 9.4 },
    registrar: 'KFin Technologies Ltd'
  }
];

/**
 * Sample blog posts — 5 articles across categories.
 */
const sampleBlogPosts = [
  {
    title: 'Nifty 50 Technical Analysis — Key Levels to Watch This Week',
    excerpt: 'The Nifty 50 index is approaching a critical resistance zone. Here\'s a detailed technical breakdown of the key support and resistance levels for the week ahead.',
    content: '## Nifty 50 Weekly Technical Outlook\n\nThe Nifty 50 closed the week at 24,850, up 1.2% from last week\'s close. The index has been trending above the 20-DMA and 50-DMA, indicating a positive short-term trend.\n\n### Key Levels\n- **Resistance:** 25,100 (previous swing high), 25,350 (Fibonacci extension)\n- **Support:** 24,600 (20-DMA), 24,200 (50-DMA)\n\n### Indicators\n- RSI (14): 58 — neutral zone, room for upside\n- MACD: Positive crossover, bullish signal\n- Bollinger Bands: Trading near the upper band, watch for mean reversion\n\n### Sector Outlook\nBanking and IT sectors are expected to lead the rally, while FMCG remains range-bound. Keep an eye on auto sector stocks ahead of monthly sales data.\n\n**Disclaimer:** This analysis is for educational purposes only and should not be considered as investment advice. Please consult a SEBI-registered financial advisor before making any investment decisions.',
    category: 'market-analysis',
    tags: ['nifty', 'technical-analysis', 'weekly-outlook', 'support-resistance'],
    author: 'StockVista Editorial',
    readTime: 6,
    isFeatured: true
  },
  {
    title: 'Beginner\'s Guide to Reading Candlestick Charts',
    excerpt: 'Candlestick charts are the most popular way to visualize stock price movements. Learn how to read and interpret the basic candlestick patterns that every trader should know.',
    content: '## Understanding Candlestick Charts\n\nCandlestick charts originated in Japan in the 18th century and have become the standard for technical analysis worldwide.\n\n### Anatomy of a Candlestick\nEach candlestick represents four data points for a given time period:\n- **Open:** The price at which trading began\n- **Close:** The price at which trading ended\n- **High:** The highest price reached\n- **Low:** The lowest price reached\n\n### Bullish vs Bearish Candles\n- **Green/White (Bullish):** Close > Open — indicates buying pressure\n- **Red/Black (Bearish):** Close < Open — indicates selling pressure\n\n### Key Patterns to Know\n1. **Doji:** Open = Close, indicates indecision\n2. **Hammer:** Small body at top, long lower wick — bullish reversal\n3. **Engulfing:** Current candle completely engulfs the previous one\n4. **Morning Star:** Three-candle bullish reversal pattern\n5. **Evening Star:** Three-candle bearish reversal pattern\n\n### Tips for Beginners\n- Always confirm patterns with volume\n- Use candlestick patterns with support/resistance levels\n- Don\'t trade based on a single candlestick\n\n**Disclaimer:** This content is for educational purposes only. Past performance is not indicative of future results.',
    category: 'education',
    tags: ['candlestick', 'charts', 'beginners', 'technical-analysis'],
    author: 'StockVista Editorial',
    readTime: 8,
    isFeatured: true
  },
  {
    title: 'Ather Energy IPO Review — Should You Subscribe?',
    excerpt: 'Ather Energy\'s IPO opens this week. We analyze the company\'s financials, growth prospects, and valuation to help you decide if this EV stock is worth subscribing to.',
    content: '## Ather Energy IPO — Detailed Review\n\n### Company Overview\nAther Energy is one of India\'s pioneering electric scooter companies, founded in 2013 by IIT Madras alumni. The company has sold over 200,000 vehicles and operates the Ather Grid — one of India\'s largest fast-charging networks.\n\n### Financial Highlights (FY26)\n- Revenue: ₹1,890 Cr (up 45% YoY)\n- EBITDA Margin: -8.5% (improving from -18% in FY25)\n- Net Loss: ₹280 Cr (narrowing)\n- Cash Reserves: ₹1,200 Cr post-IPO\n\n### Strengths\n- Strong brand recognition in the premium EV segment\n- Proprietary technology stack (motor, battery, charger)\n- First-mover advantage in charging infrastructure\n- Growing EV adoption in India (FAME III subsidies)\n\n### Risks\n- Still loss-making, path to profitability unclear\n- Intense competition from Ola Electric, TVS, Bajaj\n- Dependence on government subsidies\n- Raw material (lithium) price volatility\n\n### Valuation\nAt the upper price band of ₹321, Ather is valued at ~₹15,000 Cr (P/S of ~8x FY26 revenue). This is at a premium to listed EV peers.\n\n### Our Verdict\nAther Energy is a quality franchise in the growing EV space but the premium valuation leaves limited listing gains. **Subscribe for the long term** if you believe in the India EV story.\n\n**Disclaimer:** This review is for informational purposes only. Not a buy/sell recommendation. Consult a SEBI-registered advisor.',
    category: 'ipo-review',
    tags: ['ather-energy', 'ipo', 'ev', 'electric-vehicle', 'review'],
    author: 'StockVista Editorial',
    readTime: 10,
    isFeatured: false
  },
  {
    title: 'Banking Sector Outlook — NPA Cycle Turning Favorable',
    excerpt: 'Indian banks are reporting the best asset quality in a decade. We analyze the banking sector\'s outlook and identify the top picks for the next 12 months.',
    content: '## Banking Sector Analysis — Q4 FY26 Review\n\n### Asset Quality Improvement\nThe Indian banking sector has witnessed a remarkable improvement in asset quality over the past 3 years:\n- System-wide GNPA has declined from 7.5% in FY22 to 2.8% in FY26\n- Net NPA is now at a decadal low of 0.6%\n- Provision coverage ratio stands at 75%+\n\n### Credit Growth\nBank credit growth has been robust at 15-16% YoY, driven by:\n- Retail loans (home, personal, vehicle): +18% YoY\n- MSME lending: +22% YoY\n- Corporate credit: +12% YoY (capex recovery)\n\n### Net Interest Margins\nNIMs remain healthy at 3.4-3.6% for private banks and 3.0-3.2% for PSU banks. The RBI\'s rate cuts may compress NIMs by 10-15bps over the next year.\n\n### Top Picks\n1. **HDFC Bank** — Best-in-class asset quality, strong retail franchise\n2. **ICICI Bank** — Diversified book, improving return ratios\n3. **SBI** — Valuations attractive, strong deposit franchise\n4. **Kotak Mahindra Bank** — Premium franchise, high ROE\n\n**Disclaimer:** This is for educational purposes only. Consult a SEBI-registered financial advisor before investing.',
    category: 'sector-analysis',
    tags: ['banking', 'npa', 'sector-analysis', 'hdfc-bank', 'icici-bank'],
    author: 'StockVista Editorial',
    readTime: 7,
    isFeatured: false
  },
  {
    title: '5 Common Mistakes New Investors Make in the Stock Market',
    excerpt: 'Investing in the stock market can be rewarding, but beginners often fall into common traps. Here are 5 mistakes to avoid and how to build a solid investment habit.',
    content: '## Common Investment Mistakes to Avoid\n\n### 1. Not Having a Plan\nMany new investors jump into the market without a clear investment plan. Define your goals, time horizon, and risk tolerance before investing a single rupee.\n\n### 2. Following Tips Blindly\nStock tips from social media, WhatsApp groups, and Telegram channels are often unreliable. Always do your own research (DYOR) before investing.\n\n### 3. Timing the Market\n"Time in the market beats timing the market." Studies show that SIP investing consistently outperforms lump-sum investing for most retail investors.\n\n### 4. Ignoring Diversification\nPutting all your money in one stock or sector is risky. A well-diversified portfolio across sectors and market caps reduces risk.\n\n### 5. Panic Selling During Corrections\nMarket corrections are normal and healthy. The Nifty 50 has corrected 10%+ at least once every year, yet has delivered ~12% CAGR over the last 20 years.\n\n### Building Good Habits\n- Start with index funds or ETFs\n- Invest through SIPs for rupee cost averaging\n- Review your portfolio quarterly, not daily\n- Keep learning — read annual reports, follow market news\n\n**Disclaimer:** This article is for educational purposes only. Past performance is not indicative of future results. Consult a SEBI-registered advisor.',
    category: 'personal-finance',
    tags: ['beginner', 'mistakes', 'investing', 'tips', 'personal-finance'],
    author: 'StockVista Editorial',
    readTime: 5,
    isFeatured: true
  }
];

/**
 * Main seed function.
 */
const seedSampleData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('📊 Connected to MongoDB');

    // Seed stocks
    await Stock.deleteMany({});
    const stocks = await Stock.insertMany(sampleStocks);
    console.log(`✅ ${stocks.length} stocks seeded`);

    // Seed trading ideas
    await TradingIdea.deleteMany({});
    const ideas = await TradingIdea.create(sampleTradingIdeas);
    console.log(`✅ ${ideas.length} trading ideas seeded`);

    // Seed IPOs
    await IPO.deleteMany({});
    const ipos = await IPO.create(sampleIPOs);
    console.log(`✅ ${ipos.length} IPOs seeded`);

    // Seed blog posts
    await BlogPost.deleteMany({});
    const posts = await BlogPost.create(sampleBlogPosts);
    console.log(`✅ ${posts.length} blog posts seeded`);

    console.log('\n🎉 All sample data seeded successfully!');
    console.log('   Stocks: 15 | Ideas: 6 | IPOs: 4 | Blogs: 5');
  } catch (error) {
    console.error('❌ Error seeding sample data:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed');
  }
};

seedSampleData();
