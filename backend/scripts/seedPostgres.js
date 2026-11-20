const bcrypt = require('bcryptjs');
const { initPostgres, query } = require('../db/postgres');
const { DEFAULT_SECTORS } = require('../utils/constants');

const seedPostgresData = async () => {
  console.log('🚀 Initializing PostgreSQL DB connection for seeding...');
  await initPostgres();

  console.log('🧹 Clearing existing PostgreSQL mock records...');
  await query('DELETE FROM otps');
  await query('DELETE FROM analytics');
  await query('DELETE FROM screener_presets');
  await query('DELETE FROM chart_analyses');
  await query('DELETE FROM social_comments');
  await query('DELETE FROM social_posts');
  await query('DELETE FROM watchlists');
  await query('DELETE FROM portfolios');
  await query('DELETE FROM trading_ideas');
  await query('DELETE FROM blog_posts');
  await query('DELETE FROM ipos');
  await query('DELETE FROM stocks');
  await query('DELETE FROM sectors');
  await query('DELETE FROM users');

  console.log('🌱 Seeding Sectors...');
  for (let i = 0; i < DEFAULT_SECTORS.length; i++) {
    const sec = DEFAULT_SECTORS[i];
    await query(
      'INSERT INTO sectors (id, name, icon) VALUES ($1, $2, $3)',
      [`sec_${i + 1}`, sec, 'default']
    );
  }
  console.log(`✅ ${DEFAULT_SECTORS.length} sectors seeded.`);

  console.log('🌱 Seeding Users (Admin & Demo Trader)...');
  const hashedAdminPassword = await bcrypt.hash('Admin@123', 10);
  const hashedUserPassword = await bcrypt.hash('Demo@123', 10);

  const adminId = 'user_admin_001';
  const demoUserId = 'user_demo_002';

  await query(
    `INSERT INTO users (id, username, email, phone, password, role, auth_provider, profile, settings)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
    [
      adminId,
      'admin',
      'admin@jodhpurtraders.com',
      '+919876543210',
      hashedAdminPassword,
      'admin',
      'local',
      JSON.stringify({ firstName: 'Platform', lastName: 'Admin', bio: 'JodhpurTraders Chief Administrator' }),
      JSON.stringify({ theme: 'dark', notifications: true })
    ]
  );

  await query(
    `INSERT INTO users (id, username, email, phone, password, role, auth_provider, profile, settings)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
    [
      demoUserId,
      'demo_trader',
      'demo@jodhpurtraders.com',
      '+919876543211',
      hashedUserPassword,
      'user',
      'local',
      JSON.stringify({ firstName: 'Ashok', lastName: 'Trader', bio: 'Swing & Momentum Trader | Offline Sandbox' }),
      JSON.stringify({ theme: 'dark', notifications: true })
    ]
  );
  console.log('✅ Users seeded: admin@jodhpurtraders.com (Admin@123) & demo@jodhpurtraders.com (Demo@123)');

  console.log('🌱 Seeding 40+ Top Indian Stocks...');
  const stocksData = [
    { symbol: 'RELIANCE', name: 'Reliance Industries Ltd', sector: 'Energy & Power', exchange: 'NSE', currentPrice: 2945.50, dayChange: 32.15, dayChangePercent: 1.10, weekHigh52: 3217.60, weekLow52: 2220.30, marketCap: 1993000, marketCapLabel: 'Large Cap', peRatio: 28.5, pbRatio: 2.4, dividendYield: 0.35, dayHigh: 2960.00, dayLow: 2915.00, volume: 4850000 },
    { symbol: 'TCS', name: 'Tata Consultancy Services Ltd', sector: 'Information Technology', exchange: 'NSE', currentPrice: 3892.75, dayChange: -18.40, dayChangePercent: -0.47, weekHigh52: 4256.80, weekLow52: 3311.05, marketCap: 1420000, marketCapLabel: 'Large Cap', peRatio: 31.2, pbRatio: 13.8, dividendYield: 1.25, dayHigh: 3915.00, dayLow: 3870.00, volume: 2150000 },
    { symbol: 'INFY', name: 'Infosys Ltd', sector: 'Information Technology', exchange: 'NSE', currentPrice: 1587.30, dayChange: 12.85, dayChangePercent: 0.82, weekHigh52: 1953.90, weekLow52: 1358.45, marketCap: 659000, marketCapLabel: 'Large Cap', peRatio: 25.4, pbRatio: 8.1, dividendYield: 2.10, dayHigh: 1598.00, dayLow: 1570.00, volume: 5400000 },
    { symbol: 'HDFCBANK', name: 'HDFC Bank Ltd', sector: 'Banking & Finance', exchange: 'NSE', currentPrice: 1678.90, dayChange: 24.60, dayChangePercent: 1.49, weekHigh52: 1880.00, weekLow52: 1460.30, marketCap: 1280000, marketCapLabel: 'Large Cap', peRatio: 19.8, pbRatio: 2.8, dividendYield: 1.15, dayHigh: 1689.00, dayLow: 1650.00, volume: 8900000 },
    { symbol: 'ICICIBANK', name: 'ICICI Bank Ltd', sector: 'Banking & Finance', exchange: 'NSE', currentPrice: 1245.55, dayChange: 15.20, dayChangePercent: 1.24, weekHigh52: 1362.35, weekLow52: 1006.45, marketCap: 872000, marketCapLabel: 'Large Cap', peRatio: 18.2, pbRatio: 3.1, dividendYield: 0.80, dayHigh: 1252.00, dayLow: 1230.00, volume: 7600000 },
    { symbol: 'BHARTIARTL', name: 'Bharti Airtel Ltd', sector: 'Telecom', exchange: 'NSE', currentPrice: 1612.40, dayChange: -8.75, dayChangePercent: -0.54, weekHigh52: 1779.00, weekLow52: 1200.95, marketCap: 964000, marketCapLabel: 'Large Cap', peRatio: 42.1, pbRatio: 7.9, dividendYield: 0.50, dayHigh: 1630.00, dayLow: 1605.00, volume: 3400000 },
    { symbol: 'ITC', name: 'ITC Ltd', sector: 'FMCG', exchange: 'NSE', currentPrice: 465.80, dayChange: 3.45, dayChangePercent: 0.75, weekHigh52: 528.55, weekLow52: 399.35, marketCap: 581000, marketCapLabel: 'Large Cap', peRatio: 27.6, pbRatio: 7.2, dividendYield: 3.10, dayHigh: 468.50, dayLow: 461.00, volume: 9200000 },
    { symbol: 'SBIN', name: 'State Bank of India', sector: 'Banking & Finance', exchange: 'NSE', currentPrice: 832.15, dayChange: 11.90, dayChangePercent: 1.45, weekHigh52: 912.10, weekLow52: 600.20, marketCap: 742000, marketCapLabel: 'Large Cap', peRatio: 11.4, pbRatio: 1.7, dividendYield: 1.65, dayHigh: 838.00, dayLow: 820.00, volume: 11200000 },
    { symbol: 'KOTAKBANK', name: 'Kotak Mahindra Bank Ltd', sector: 'Banking & Finance', exchange: 'NSE', currentPrice: 1856.20, dayChange: -5.30, dayChangePercent: -0.28, weekHigh52: 2065.50, weekLow52: 1544.15, marketCap: 369000, marketCapLabel: 'Large Cap', peRatio: 22.1, pbRatio: 3.2, dividendYield: 0.15, dayHigh: 1870.00, dayLow: 1845.00, volume: 2300000 },
    { symbol: 'LT', name: 'Larsen & Toubro Ltd', sector: 'Infrastructure', exchange: 'NSE', currentPrice: 3587.60, dayChange: 42.30, dayChangePercent: 1.19, weekHigh52: 3925.00, weekLow52: 2880.75, marketCap: 492000, marketCapLabel: 'Large Cap', peRatio: 36.4, pbRatio: 5.1, dividendYield: 0.85, dayHigh: 3610.00, dayLow: 3540.00, volume: 1800000 },
    { symbol: 'ASIANPAINT', name: 'Asian Paints Ltd', sector: 'Consumer Durables', exchange: 'NSE', currentPrice: 2876.45, dayChange: -15.80, dayChangePercent: -0.55, weekHigh52: 3395.00, weekLow52: 2670.10, marketCap: 276000, marketCapLabel: 'Large Cap', peRatio: 52.3, pbRatio: 16.2, dividendYield: 1.10, dayHigh: 2900.00, dayLow: 2865.00, volume: 1200000 },
    { symbol: 'HINDUNILVR', name: 'Hindustan Unilever Ltd', sector: 'FMCG', exchange: 'NSE', currentPrice: 2534.70, dayChange: 8.95, dayChangePercent: 0.35, weekHigh52: 2859.30, weekLow52: 2393.00, marketCap: 595000, marketCapLabel: 'Large Cap', peRatio: 58.1, pbRatio: 11.5, dividendYield: 1.60, dayHigh: 2550.00, dayLow: 2520.00, volume: 1450000 },
    { symbol: 'WIPRO', name: 'Wipro Ltd', sector: 'Information Technology', exchange: 'NSE', currentPrice: 487.25, dayChange: 6.40, dayChangePercent: 1.33, weekHigh52: 577.75, weekLow52: 401.60, marketCap: 254000, marketCapLabel: 'Large Cap', peRatio: 22.8, pbRatio: 3.4, dividendYield: 0.20, dayHigh: 492.00, dayLow: 480.00, volume: 6200000 },
    { symbol: 'SUNPHARMA', name: 'Sun Pharmaceutical Industries Ltd', sector: 'Pharmaceuticals', exchange: 'NSE', currentPrice: 1745.90, dayChange: 22.65, dayChangePercent: 1.31, weekHigh52: 1960.35, weekLow52: 1208.55, marketCap: 419000, marketCapLabel: 'Large Cap', peRatio: 38.9, pbRatio: 6.3, dividendYield: 0.75, dayHigh: 1760.00, dayLow: 1720.00, volume: 2800000 },
    { symbol: 'BAJFINANCE', name: 'Bajaj Finance Ltd', sector: 'Banking & Finance', exchange: 'NSE', currentPrice: 7234.50, dayChange: -45.20, dayChangePercent: -0.62, weekHigh52: 8192.00, weekLow52: 6187.80, marketCap: 448000, marketCapLabel: 'Large Cap', peRatio: 31.5, pbRatio: 6.8, dividendYield: 0.50, dayHigh: 7310.00, dayLow: 7200.00, volume: 950000 },
    { symbol: 'TATAMOTORS', name: 'Tata Motors Ltd', sector: 'Automobile', exchange: 'NSE', currentPrice: 985.40, dayChange: 18.25, dayChangePercent: 1.89, weekHigh52: 1179.00, weekLow52: 601.20, marketCap: 362000, marketCapLabel: 'Large Cap', peRatio: 11.2, pbRatio: 3.8, dividendYield: 0.60, dayHigh: 994.00, dayLow: 965.00, volume: 12400000 },
    { symbol: 'M&M', name: 'Mahindra & Mahindra Ltd', sector: 'Automobile', exchange: 'NSE', currentPrice: 2854.10, dayChange: 42.60, dayChangePercent: 1.52, weekHigh52: 3115.00, weekLow52: 1450.00, marketCap: 354000, marketCapLabel: 'Large Cap', peRatio: 29.8, pbRatio: 5.6, dividendYield: 0.70, dayHigh: 2875.00, dayLow: 2810.00, volume: 3800000 },
    { symbol: 'NTPC', name: 'NTPC Ltd', sector: 'Energy & Power', exchange: 'NSE', currentPrice: 412.35, dayChange: 6.80, dayChangePercent: 1.67, weekHigh52: 448.30, weekLow52: 215.00, marketCap: 399000, marketCapLabel: 'Large Cap', peRatio: 18.7, pbRatio: 2.3, dividendYield: 1.80, dayHigh: 416.00, dayLow: 405.00, volume: 15600000 },
    { symbol: 'ONGC', name: 'Oil & Natural Gas Corporation Ltd', sector: 'Energy & Power', exchange: 'NSE', currentPrice: 318.50, dayChange: -2.40, dayChangePercent: -0.75, weekHigh52: 344.80, weekLow52: 172.00, marketCap: 400000, marketCapLabel: 'Large Cap', peRatio: 8.5, pbRatio: 1.2, dividendYield: 3.80, dayHigh: 323.00, dayLow: 316.00, volume: 18400000 },
    { symbol: 'POWERGRID', name: 'Power Grid Corporation of India Ltd', sector: 'Energy & Power', exchange: 'NSE', currentPrice: 334.60, dayChange: 4.15, dayChangePercent: 1.26, weekHigh52: 366.25, weekLow52: 200.00, marketCap: 311000, marketCapLabel: 'Large Cap', peRatio: 19.2, pbRatio: 3.5, dividendYield: 3.20, dayHigh: 337.50, dayLow: 330.00, volume: 14200000 },
    { symbol: 'AXISBANK', name: 'Axis Bank Ltd', sector: 'Banking & Finance', exchange: 'NSE', currentPrice: 1182.30, dayChange: 14.50, dayChangePercent: 1.24, weekHigh52: 1339.65, weekLow52: 934.00, marketCap: 365000, marketCapLabel: 'Large Cap', peRatio: 14.8, pbRatio: 2.2, dividendYield: 0.10, dayHigh: 1192.00, dayLow: 1165.00, volume: 6800000 },
    { symbol: 'TITAN', name: 'Titan Company Ltd', sector: 'Consumer Durables', exchange: 'NSE', currentPrice: 3420.80, dayChange: -28.40, dayChangePercent: -0.82, weekHigh52: 3886.95, weekLow52: 2882.60, marketCap: 303000, marketCapLabel: 'Large Cap', peRatio: 84.2, pbRatio: 23.4, dividendYield: 0.30, dayHigh: 3460.00, dayLow: 3400.00, volume: 1100000 },
    { symbol: 'ULTRACEMCO', name: 'UltraTech Cement Ltd', sector: 'Cement', exchange: 'NSE', currentPrice: 11250.00, dayChange: 140.00, dayChangePercent: 1.26, weekHigh52: 12140.00, weekLow52: 8100.00, marketCap: 324000, marketCapLabel: 'Large Cap', peRatio: 45.8, pbRatio: 5.2, dividendYield: 0.60, dayHigh: 11320.00, dayLow: 11100.00, volume: 380000 },
    { symbol: 'COALINDIA', name: 'Coal India Ltd', sector: 'Metals & Mining', exchange: 'NSE', currentPrice: 512.40, dayChange: 8.10, dayChangePercent: 1.61, weekHigh52: 543.55, weekLow52: 224.50, marketCap: 315000, marketCapLabel: 'Large Cap', peRatio: 8.9, pbRatio: 3.6, dividendYield: 5.20, dayHigh: 518.00, dayLow: 504.00, volume: 10500000 },
    { symbol: 'TATASTEEL', name: 'Tata Steel Ltd', sector: 'Metals & Mining', exchange: 'NSE', currentPrice: 162.80, dayChange: -1.40, dayChangePercent: -0.85, weekHigh52: 184.60, weekLow52: 114.60, marketCap: 203000, marketCapLabel: 'Large Cap', peRatio: 48.2, pbRatio: 2.1, dividendYield: 2.20, dayHigh: 165.00, dayLow: 161.20, volume: 28400000 },
    { symbol: 'HCLTECH', name: 'HCL Technologies Ltd', sector: 'Information Technology', exchange: 'NSE', currentPrice: 1780.40, dayChange: 24.50, dayChangePercent: 1.40, weekHigh52: 1868.00, weekLow52: 1090.00, marketCap: 483000, marketCapLabel: 'Large Cap', peRatio: 29.4, pbRatio: 7.3, dividendYield: 2.90, dayHigh: 1795.00, dayLow: 1755.00, volume: 3900000 },
    { symbol: 'MARUTI', name: 'Maruti Suzuki India Ltd', sector: 'Automobile', exchange: 'NSE', currentPrice: 12450.00, dayChange: -85.00, dayChangePercent: -0.68, weekHigh52: 13680.00, weekLow52: 9200.00, marketCap: 391000, marketCapLabel: 'Large Cap', peRatio: 28.9, pbRatio: 4.7, dividendYield: 1.00, dayHigh: 12600.00, dayLow: 12380.00, volume: 540000 }
  ];

  for (let i = 0; i < stocksData.length; i++) {
    const s = stocksData[i];
    await query(
      `INSERT INTO stocks (
        id, symbol, name, sector, exchange, current_price, day_change, day_change_percent,
        week_high_52, week_low_52, market_cap, market_cap_label, pe_ratio, pb_ratio,
        dividend_yield, day_high, day_low, volume, is_active
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)`,
      [
        `stk_${i + 1}`, s.symbol, s.name, s.sector, s.exchange || 'NSE', s.currentPrice,
        s.dayChange, s.dayChangePercent, s.weekHigh52, s.weekLow52, s.marketCap,
        s.marketCapLabel || 'Large Cap', s.peRatio, s.pbRatio, s.dividendYield,
        s.dayHigh, s.dayLow, s.volume, true
      ]
    );
  }
  console.log(`✅ ${stocksData.length} Indian stocks seeded.`);

  console.log('🌱 Seeding IPOs...');
  const iposData = [
    {
      companyName: 'IC Electricals Company Limited',
      symbol: 'ICELECT',
      description: 'Manufactures electronics and power control systems for Indian Railways.',
      sector: 'Capital Goods',
      priceRange: { min: 94, max: 99 },
      lotSize: 1200,
      issueSize: '₹48 Cr',
      issueType: 'Fresh Issue',
      openDate: new Date('2026-07-03'),
      closeDate: new Date('2026-07-07'),
      status: 'open',
      registrar: 'Skyline Financial Services Pvt. Ltd.',
      gmp: 24.50,
      subscriptionStatus: { retail: 3.4, nii: 5.1, qib: 12.8, total: 6.8 }
    },
    {
      companyName: 'Kusumgar Limited',
      symbol: 'KUSUMGAR',
      description: 'Engineered synthetic fabrics for aerospace, defense, and automotive sectors.',
      sector: 'Textiles',
      priceRange: { min: 398, max: 419 },
      lotSize: 35,
      issueSize: '₹650 Cr',
      issueType: 'Book Built',
      openDate: new Date('2026-07-08'),
      closeDate: new Date('2026-07-10'),
      status: 'upcoming',
      registrar: 'Bigshare Services Pvt. Ltd.',
      gmp: 78.00,
      subscriptionStatus: { retail: 0, nii: 0, qib: 0, total: 0 }
    },
    {
      companyName: 'Devson Catalyst Limited',
      symbol: 'DEVSON',
      description: 'ISO-certified manufacturer of specialty chemical catalysts and adsorbents.',
      sector: 'Chemicals',
      priceRange: { min: 112, max: 118 },
      lotSize: 1200,
      issueSize: '₹35 Cr',
      issueType: 'Fresh Issue',
      openDate: new Date('2026-07-09'),
      closeDate: new Date('2026-07-13'),
      status: 'upcoming',
      registrar: 'Link Intime India Pvt. Ltd.',
      gmp: 18.00,
      subscriptionStatus: { retail: 0, nii: 0, qib: 0, total: 0 }
    },
    {
      companyName: 'Bajaj Housing Finance Ltd',
      symbol: 'BAJAJHFL',
      description: 'Non-deposit housing finance company providing home loans and loans against property.',
      sector: 'Banking & Finance',
      priceRange: { min: 66, max: 70 },
      lotSize: 214,
      issueSize: '₹6560 Cr',
      issueType: 'Book Built',
      openDate: new Date('2026-06-01'),
      closeDate: new Date('2026-06-05'),
      status: 'listed',
      registrar: 'KFin Technologies Ltd.',
      gmp: 82.00,
      subscriptionStatus: { retail: 7.4, nii: 41.5, qib: 209.4, total: 67.4 }
    }
  ];

  for (let i = 0; i < iposData.length; i++) {
    const ipo = iposData[i];
    await query(
      `INSERT INTO ipos (
        id, company_name, symbol, description, sector, price_range, lot_size,
        issue_size, issue_type, open_date, close_date, status, registrar, gmp, subscription_status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
      [
        `ipo_${i + 1}`, ipo.companyName, ipo.symbol, ipo.description, ipo.sector,
        JSON.stringify(ipo.priceRange), ipo.lotSize, ipo.issueSize, ipo.issueType,
        ipo.openDate, ipo.closeDate, ipo.status, ipo.registrar, ipo.gmp,
        JSON.stringify(ipo.subscriptionStatus)
      ]
    );
  }
  console.log(`✅ ${iposData.length} IPOs seeded.`);

  console.log('🌱 Seeding Trading Ideas...');
  const ideasData = [
    {
      title: 'Reliance Industries — Bullish Breakout Above ₹2,900',
      summary: 'Reliance has broken above key resistance with strong volume; poised for ₹3,200.',
      content: 'Reliance Industries has broken out of a 6-week consolidation. Volume confirmed the momentum.',
      stockSymbol: 'RELIANCE',
      stockName: 'Reliance Industries Ltd',
      sector: 'Energy & Power',
      ideaType: 'buy',
      entryPrice: 2945,
      targetPrice: 3200,
      stopLoss: 2800,
      timeHorizon: 'short-term',
      riskLevel: 'medium',
      tags: ['reliance', 'breakout', 'energy']
    },
    {
      title: 'TCS — Accumulation Zone Near ₹3,850 Support',
      summary: 'TCS is testing the 200 EMA support with oversold RSI (32); favorable risk-reward.',
      content: 'TCS is at attractive valuation multiples. Long-term investors can accumulate with ₹4,250 target.',
      stockSymbol: 'TCS',
      stockName: 'Tata Consultancy Services Ltd',
      sector: 'Information Technology',
      ideaType: 'buy',
      entryPrice: 3890,
      targetPrice: 4250,
      stopLoss: 3750,
      timeHorizon: 'medium-term',
      riskLevel: 'low',
      tags: ['tcs', 'it', 'support', 'oversold']
    }
  ];

  for (let i = 0; i < ideasData.length; i++) {
    const idea = ideasData[i];
    await query(
      `INSERT INTO trading_ideas (
        id, title, summary, content, stock_symbol, stock_name, sector, idea_type,
        entry_price, target_price, stop_loss, time_horizon, risk_level, tags, author, is_featured
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`,
      [
        `idea_${i + 1}`, idea.title, idea.summary, idea.content, idea.stockSymbol, idea.stockName,
        idea.sector, idea.ideaType, idea.entryPrice, idea.targetPrice, idea.stopLoss,
        idea.timeHorizon, idea.riskLevel, JSON.stringify(idea.tags), 'JodhpurTraders Research', true
      ]
    );
  }
  console.log(`✅ ${ideasData.length} trading ideas seeded.`);

  console.log('🌱 Seeding Blog Posts & Educational Articles...');
  const blogPostsData = [
    {
      title: 'Mastering Indian Stock Market Screeners for High-Probability Swing Trading',
      slug: 'mastering-indian-stock-market-screeners',
      excerpt: 'Learn how to configure multi-factor screeners combining 52-week highs, volume surges, and RSI.',
      content: 'Screening stocks effectively is the cornerstone of profitable trading in Indian equities.',
      category: 'technical-analysis',
      tags: ['screening', 'swing-trading', 'nse', 'technical-analysis'],
      readTime: 6
    },
    {
      title: 'Understanding Grey Market Premium (GMP) in Indian IPOs',
      slug: 'understanding-grey-market-premium-gmp-indian-ipos',
      excerpt: 'A comprehensive guide on how GMP is calculated, what it signals, and when retail traders should rely on it.',
      content: 'The Grey Market is an unofficial, over-the-counter market where IPO applications and shares trade prior to listing.',
      category: 'ipo-analysis',
      tags: ['ipo', 'gmp', 'listing-gain', 'retail-investors'],
      readTime: 5
    }
  ];

  for (let i = 0; i < blogPostsData.length; i++) {
    const blog = blogPostsData[i];
    await query(
      `INSERT INTO blog_posts (
        id, title, slug, excerpt, content, category, tags, author, read_time, is_featured
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        `blog_${i + 1}`, blog.title, blog.slug, blog.excerpt, blog.content, blog.category,
        JSON.stringify(blog.tags), 'JodhpurTraders Editorial', blog.readTime, true
      ]
    );
  }
  console.log(`✅ ${blogPostsData.length} blog posts seeded.`);

  console.log('🌱 Seeding Demo User Portfolio & Watchlist...');
  await query(
    `INSERT INTO portfolios (id, user_id, name, description, is_default, holdings, cash_balance)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [
      'port_demo_001',
      demoUserId,
      'Main Portfolio',
      'Long-Term Indian Equities Portfolio',
      true,
      JSON.stringify([
        { symbol: 'RELIANCE', name: 'Reliance Industries Ltd', quantity: 25, buyPrice: 2850.00, sector: 'Energy & Power' },
        { symbol: 'TCS', name: 'Tata Consultancy Services Ltd', quantity: 15, buyPrice: 3800.00, sector: 'Information Technology' },
        { symbol: 'HDFCBANK', name: 'HDFC Bank Ltd', quantity: 40, buyPrice: 1620.00, sector: 'Banking & Finance' }
      ]),
      142500.00
    ]
  );

  await query(
    `INSERT INTO watchlists (id, user_id, name, description, is_default, items)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [
      'wtch_demo_001',
      demoUserId,
      'My Watchlist',
      'Priority Nifty 50 watchlist',
      true,
      JSON.stringify([
        { symbol: 'RELIANCE', name: 'Reliance Industries Ltd' },
        { symbol: 'INFY', name: 'Infosys Ltd' },
        { symbol: 'TATAMOTORS', name: 'Tata Motors Ltd' },
        { symbol: 'ICICIBANK', name: 'ICICI Bank Ltd' }
      ])
    ]
  );
  console.log('✅ Demo Portfolio & Watchlist seeded successfully.');

  console.log('\n🎉 ALL POSTGRESQL MOCK DATA SEEDED SUCCESSFULLY!');
};

if (require.main === module) {
  seedPostgresData()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('❌ Error during PostgreSQL seeding:', err);
      process.exit(1);
    });
}

module.exports = { seedPostgresData };
