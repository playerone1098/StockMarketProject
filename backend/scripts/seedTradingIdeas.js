const mongoose = require('mongoose');
const TradingIdea = require('../models/TradingIdea');
require('dotenv').config();

const sampleIdeas = [
  {
    title: 'Reliance Industries — Bullish Breakout Above ₹2,920 Target ₹3,250',
    summary: 'Reliance has broken above key resistance with strong volume. Strong growth in Retail and Jio segments supports a multi-quarter rally.',
    content: 'Reliance Industries has consolidated in a range for six weeks before breaking out with high volume. RSI stands at 64 indicating momentum. Target: ₹3,250 | Stop Loss: ₹2,840 | Entry: ₹2,945.',
    stockSymbol: 'RELIANCE',
    stockName: 'Reliance Industries Ltd',
    sector: 'Energy & Power',
    ideaType: 'buy',
    entryPrice: 2945,
    targetPrice: 3250,
    stopLoss: 2840,
    timeHorizon: 'short-term',
    riskLevel: 'medium',
    tags: ['reliance', 'breakout', 'energy', 'nifty50'],
    author: 'StockVista Desk',
    isFeatured: true,
    isActive: true
  },
  {
    title: 'HDFC Bank — Accumulate on Dips Near ₹1,650 for ₹1,880 Target',
    summary: 'HDFC Bank is trading near strong 100-DMA support. NIMs and credit quality show steady recovery after merger integration.',
    content: 'HDFC Bank has corrected ~6% offering a favorable risk-reward entry. Asset quality remains stable. Target: ₹1,880 | Stop Loss: ₹1,580 | Entry: ₹1,678.',
    stockSymbol: 'HDFCBANK',
    stockName: 'HDFC Bank Ltd',
    sector: 'Banking & Finance',
    ideaType: 'buy',
    entryPrice: 1678,
    targetPrice: 1880,
    stopLoss: 1580,
    timeHorizon: 'medium-term',
    riskLevel: 'low',
    tags: ['hdfcbank', 'banking', 'value', 'large-cap'],
    author: 'StockVista Desk',
    isFeatured: true,
    isActive: true
  },
  {
    title: 'Tata Motors — Long Term Target ₹1,200 Driven by EV Dominance',
    summary: 'Tata Motors continues to dominate Indian electric passenger vehicles with over 70% market share and JLR deleveraging.',
    content: 'Free cash flow at JLR is at multi-year highs while Indian passenger EV market share remains unmatched. Target: ₹1,200 | Stop Loss: ₹900 | Entry: ₹985.',
    stockSymbol: 'TATAMOTORS',
    stockName: 'Tata Motors Ltd',
    sector: 'Automobile',
    ideaType: 'buy',
    entryPrice: 985,
    targetPrice: 1200,
    stopLoss: 900,
    timeHorizon: 'long-term',
    riskLevel: 'medium',
    tags: ['tatamotors', 'auto', 'ev', 'largecap'],
    author: 'StockVista Desk',
    isFeatured: true,
    isActive: true
  },
  {
    title: 'Infosys — Hold Position Target ₹1,750 on Large Deal Pipeline',
    summary: 'Infosys deal pipeline remains robust at $4.5B with expanding margins in Generative AI implementations.',
    content: 'Infosys posted resilient Q4 numbers. While discretionary spending is slow, cost-optimization deals remain strong. Target: ₹1,750 | Stop Loss: ₹1,480 | Entry: ₹1,587.',
    stockSymbol: 'INFY',
    stockName: 'Infosys Ltd',
    sector: 'Information Technology',
    ideaType: 'hold',
    entryPrice: 1587,
    targetPrice: 1750,
    stopLoss: 1480,
    timeHorizon: 'medium-term',
    riskLevel: 'low',
    tags: ['infosys', 'it', 'nifty', 'tech'],
    author: 'StockVista Desk',
    isFeatured: true,
    isActive: true
  },
  {
    title: 'Bharat Electronics (BEL) — Strong Defense Order Book Target ₹350',
    summary: 'BEL order book crossed ₹75,000 Cr backed by indigenous defense modernization projects.',
    content: 'BEL is a core beneficiary of the government\'s defense indigenization mandate. Target: ₹350 | Stop Loss: ₹280 | Entry: ₹305.',
    stockSymbol: 'BEL',
    stockName: 'Bharat Electronics Ltd',
    sector: 'Capital Goods',
    ideaType: 'buy',
    entryPrice: 305,
    targetPrice: 350,
    stopLoss: 280,
    timeHorizon: 'short-term',
    riskLevel: 'medium',
    tags: ['bel', 'defense', 'psu', 'capital-goods'],
    author: 'StockVista Desk',
    isFeatured: true,
    isActive: true
  },
  {
    title: 'Zomato — Multi-Quarter Growth Target ₹310 Driven by Blinkit Expansion',
    summary: 'Quick-commerce arm Blinkit turned EBITDA positive, accelerating overall profitability for Zomato.',
    content: 'Blinkit stores expanded rapidly with GOV growth surpassing 80% YoY. Target: ₹310 | Stop Loss: ₹220 | Entry: ₹248.',
    stockSymbol: 'ZOMATO',
    stockName: 'Zomato Ltd',
    sector: 'Retail',
    ideaType: 'buy',
    entryPrice: 248,
    targetPrice: 310,
    stopLoss: 220,
    timeHorizon: 'medium-term',
    riskLevel: 'high',
    tags: ['zomato', 'blinkit', 'tech', 'retail'],
    author: 'StockVista Desk',
    isFeatured: true,
    isActive: true
  },
  {
    title: 'State Bank of India — Re-rating Candidate with Target ₹980',
    summary: 'SBI asset quality is at a 10-year best with GNPA at 2.2% and robust credit growth across MSME and retail.',
    content: 'Valuations remain attractive at 1.4x FY27E ABV. Target: ₹980 | Stop Loss: ₹770 | Entry: ₹832.',
    stockSymbol: 'SBIN',
    stockName: 'State Bank of India',
    sector: 'Banking & Finance',
    ideaType: 'buy',
    entryPrice: 832,
    targetPrice: 980,
    stopLoss: 770,
    timeHorizon: 'medium-term',
    riskLevel: 'low',
    tags: ['sbin', 'psu-bank', 'nifty50'],
    author: 'StockVista Desk',
    isFeatured: false,
    isActive: true
  },
  {
    title: 'Asian Paints — Caution Advised, Sell on Rallies Target ₹2,600',
    summary: 'Sluggish demand and rising competition from Grasim Birka Opus pose downside risks to valuation.',
    content: 'Asian Paints margin guidance remains cautious amidst price cuts and competitive pressures. Target: ₹2,600 | Stop Loss: ₹2,980 | Entry: ₹2,876.',
    stockSymbol: 'ASIANPAINT',
    stockName: 'Asian Paints Ltd',
    sector: 'Consumer Durables',
    ideaType: 'sell',
    entryPrice: 2876,
    targetPrice: 2600,
    stopLoss: 2980,
    timeHorizon: 'short-term',
    riskLevel: 'high',
    tags: ['asianpaints', 'paints', 'fmcg'],
    author: 'StockVista Desk',
    isFeatured: false,
    isActive: true
  },
  {
    title: 'Sun Pharma — Momentum Buy for ₹1,950 Target on Specialty Expansion',
    summary: 'Sun Pharma specialty portfolio revenue grew 30%+ YoY, expanding EBITDA margins.',
    content: 'The stock formed a strong bullish flag pattern on weekly charts. Target: ₹1,950 | Stop Loss: ₹1,630 | Entry: ₹1,745.',
    stockSymbol: 'SUNPHARMA',
    stockName: 'Sun Pharmaceutical Industries Ltd',
    sector: 'Pharmaceuticals',
    ideaType: 'buy',
    entryPrice: 1745,
    targetPrice: 1950,
    stopLoss: 1630,
    timeHorizon: 'short-term',
    riskLevel: 'medium',
    tags: ['sunpharma', 'pharma', 'health'],
    author: 'StockVista Desk',
    isFeatured: false,
    isActive: true
  },
  {
    title: 'Larsen & Toubro — Infrastructure Giant Target ₹4,100',
    summary: 'L&T order book reached ₹5.2 Lakh Crore with robust order inflows from Middle East and domestic infrastructure.',
    content: 'L&T is a prime beneficiary of government capex push. Target: ₹4,100 | Stop Loss: ₹3,400 | Entry: ₹3,587.',
    stockSymbol: 'LT',
    stockName: 'Larsen & Toubro Ltd',
    sector: 'Infrastructure',
    ideaType: 'buy',
    entryPrice: 3587,
    targetPrice: 4100,
    stopLoss: 3400,
    timeHorizon: 'medium-term',
    riskLevel: 'low',
    tags: ['lt', 'infrastructure', 'capex'],
    author: 'StockVista Desk',
    isFeatured: false,
    isActive: true
  }
];

const seedTradingIdeas = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/stockvista';
    await mongoose.connect(mongoUri);
    await TradingIdea.deleteMany({});
    const created = await TradingIdea.create(sampleIdeas);
    console.log(`✅ Seeded ${created.length} trading ideas!`);
  } catch (err) {
    console.error('Error seeding trading ideas:', err);
  } finally {
    await mongoose.connection.close();
  }
};

seedTradingIdeas();
