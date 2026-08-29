const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args)).catch(() => globalThis.fetch(...args));

const BASE_URL = 'https://stock.indianapi.in';

/**
 * Helper to make authenticated GET requests to IndianAPI
 */
const fetchFromIndianApi = async (endpoint, params = {}) => {
  const apiKey = process.env.INDIAN_API_KEY;
  const queryString = new URLSearchParams(params).toString();
  const url = `${BASE_URL}${endpoint}${queryString ? `?${queryString}` : ''}`;

  if (!apiKey) {
    console.log(`ℹ️ [IndianAPI] No INDIAN_API_KEY found in .env. Operating in fallback mode for ${endpoint}`);
    return null;
  }

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'x-api-key': apiKey,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      console.warn(`⚠️ [IndianAPI] ${endpoint} returned HTTP ${response.status}`);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error(`❌ [IndianAPI] Error fetching ${endpoint}:`, error.message);
    return null;
  }
};

/**
 * 1. Get Company Data by Name / Symbol
 */
const getCompanyStockData = async (name) => {
  const data = await fetchFromIndianApi('/stock', { name });
  if (data) return data;

  // Realistic fallback model when API key is missing or endpoint is down
  return {
    tickerId: name.toUpperCase(),
    companyName: `${name.toUpperCase()} Limited`,
    industry: 'Diverse Conglomerate',
    companyProfile: {
      about: `${name.toUpperCase()} is a leading corporate group with strong market capitalization in India.`,
      sector: 'Diversified',
      ceo: 'Managing Director'
    },
    currentPrice: { BSE: 2450.50, NSE: 2455.00 },
    percentChange: 1.85,
    yearHigh: 2800.00,
    yearLow: 1950.00,
    keyMetrics: { peRatio: 24.5, pbRatio: 3.8, dividendYield: 1.2 },
    analystView: { recommendation: 'Buy', targetPrice: 2850 },
    riskMeter: { riskLevel: 'Moderate' },
    recentNews: [
      { title: `${name.toUpperCase()} reports strong Q3 revenue growth`, source: 'Economic Times', date: new Date().toISOString() }
    ]
  };
};

/**
 * 2. Industry Search
 */
const searchIndustry = async (query) => {
  const data = await fetchFromIndianApi('/industry_search', { query });
  if (data) return data;

  return [
    {
      id: 'IND001',
      commonName: query,
      mgIndustry: 'Technology & Services',
      mgSector: 'Technology',
      exchangeCodeNsi: query.toUpperCase(),
      activeStockTrends: { overallRating: 'Bullish' }
    }
  ];
};

/**
 * 3. Trending Stocks (Top Gainers & Top Losers)
 */
const getTrendingStocks = async () => {
  const data = await fetchFromIndianApi('/trending');
  if (data) return data;

  return {
    trending_stocks: {
      top_gainers: [
        { ticker_id: 'RELIANCE', company_name: 'Reliance Industries', price: '2980.50', percent_change: '+3.45%', net_change: '99.50', volume: '12400000', overall_rating: 'Bullish' },
        { ticker_id: 'TCS', company_name: 'Tata Consultancy Services', price: '4120.00', percent_change: '+2.80%', net_change: '112.00', volume: '8500000', overall_rating: 'Bullish' },
        { ticker_id: 'INFY', company_name: 'Infosys Limited', price: '1680.25', percent_change: '+2.15%', net_change: '35.40', volume: '9200000', overall_rating: 'Moderately Bullish' }
      ],
      top_losers: [
        { ticker_id: 'TATAMOTORS', company_name: 'Tata Motors', price: '945.10', percent_change: '-2.10%', net_change: '-20.30', volume: '15400000', overall_rating: 'Bearish' },
        { ticker_id: 'HDFCBANK', company_name: 'HDFC Bank', price: '1450.00', percent_change: '-1.75%', net_change: '-25.80', volume: '18900000', overall_rating: 'Neutral' },
        { ticker_id: 'SBIN', company_name: 'State Bank of India', price: '730.50', percent_change: '-1.40%', net_change: '-10.35', volume: '21000000', overall_rating: 'Neutral' }
      ]
    }
  };
};

/**
 * 4. 52-Week High and Low Data
 */
const get52WeekHighLowData = async () => {
  const data = await fetchFromIndianApi('/fetch_52_week_high_low_data');
  if (data && data.NSE_52WeekHighLow && (data.NSE_52WeekHighLow.high52Week?.length > 0 || data.NSE_52WeekHighLow.low52Week?.length > 0)) {
    return data;
  }

  return {
    NSE_52WeekHighLow: {
      high52Week: [
        { ticker: 'TRENT.NS', company: 'Trent Limited', price: 7450.00, '52_week_high': 8345.00 },
        { ticker: 'BHARTIARTL.NS', company: 'Bharti Airtel Ltd', price: 1612.40, '52_week_high': 1675.00 },
        { ticker: 'BEL.NS', company: 'Bharat Electronics', price: 305.80, '52_week_high': 340.00 },
        { ticker: 'HAL.NS', company: 'Hindustan Aeronautics', price: 4780.00, '52_week_high': 5675.00 },
        { ticker: 'M&M.NS', company: 'Mahindra & Mahindra', price: 2950.00, '52_week_high': 3015.00 },
        { ticker: 'ZOMATO.NS', company: 'Zomato Limited', price: 248.60, '52_week_high': 298.00 }
      ],
      low52Week: [
        { ticker: 'PAYTM.NS', company: 'One97 Communications', price: 380.00, '52_week_low': 310.00 },
        { ticker: 'BANDHANBNK.NS', company: 'Bandhan Bank Ltd', price: 185.40, '52_week_low': 168.00 },
        { ticker: 'ZEEL.NS', company: 'Zee Entertainment', price: 132.50, '52_week_low': 115.00 },
        { ticker: 'DELHIVERY.NS', company: 'Delhivery Limited', price: 345.00, '52_week_low': 312.00 }
      ]
    }
  };
};

/**
 * 5. NSE & BSE Most Active Stocks
 */
const getMostActiveStocks = async (exchange = 'NSE') => {
  const endpoint = exchange.toUpperCase() === 'BSE' ? '/BSE_most_active' : '/NSE_most_active';
  const data = await fetchFromIndianApi(endpoint);
  if (Array.isArray(data) && data.length > 0) return data;

  return [
    { ticker: `RELIANCE.${exchange}`, company: 'Reliance Industries', price: 2945.50, percent_change: 1.10, net_change: 32.10, volume: 15400000 },
    { ticker: `TCS.${exchange}`, company: 'Tata Consultancy Services', price: 3892.75, percent_change: -0.47, net_change: -18.40, volume: 8900000 },
    { ticker: `HDFCBANK.${exchange}`, company: 'HDFC Bank Ltd', price: 1678.90, percent_change: 1.49, net_change: 24.60, volume: 24500000 },
    { ticker: `INFY.${exchange}`, company: 'Infosys Limited', price: 1587.30, percent_change: 0.82, net_change: 12.90, volume: 11200000 },
    { ticker: `TATAMOTORS.${exchange}`, company: 'Tata Motors Ltd', price: 985.40, percent_change: 1.89, net_change: 18.30, volume: 18900000 },
    { ticker: `SBIN.${exchange}`, company: 'State Bank of India', price: 832.15, percent_change: 1.45, net_change: 11.90, volume: 21000000 },
    { ticker: `ICICIBANK.${exchange}`, company: 'ICICI Bank Ltd', price: 1245.55, percent_change: 1.24, net_change: 15.30, volume: 16700000 }
  ];
};

/**
 * 6. Price Shockers (High volatility movers)
 */
const getPriceShockers = async () => {
  const data = await fetchFromIndianApi('/price_shockers');
  if (Array.isArray(data) && data.length > 0) return data;

  return [
    { ticker: 'BPCL.NS', company: 'Bharat Petroleum', price: 309.15, percent_change: -4.27, net_change: -13.98, high: 325.00, low: 305.00, open: 322.00, volume: 18726562 },
    { ticker: 'COALINDIA.NS', company: 'Coal India Ltd', price: 485.40, percent_change: 5.60, net_change: 25.80, high: 490.00, low: 458.00, open: 460.00, volume: 24150000 },
    { ticker: 'SUZLON.NS', company: 'Suzlon Energy Ltd', price: 72.40, percent_change: 4.85, net_change: 3.35, high: 74.50, low: 68.90, open: 69.00, volume: 85400000 },
    { ticker: 'RVNL.NS', company: 'Rail Vikas Nigam', price: 575.00, percent_change: 6.25, net_change: 33.80, high: 588.00, low: 535.00, open: 540.00, volume: 32100000 },
    { ticker: 'BHEL.NS', company: 'Bharat Heavy Electricals', price: 288.40, percent_change: -3.85, net_change: -11.55, high: 302.00, low: 284.00, open: 300.00, volume: 21500000 },
    { ticker: 'IRFC.NS', company: 'Indian Railway Finance', price: 178.40, percent_change: 3.90, net_change: 6.70, high: 182.50, low: 171.00, open: 172.00, volume: 44200000 }
  ];
};

/**
 * 7. Commodities Futures Data (MCX)
 */
const getCommoditiesData = async () => {
  const data = await fetchFromIndianApi('/commodities');
  if (Array.isArray(data) && data.length > 0) return data;

  return [
    { contractId: 'GOLD_AUG2026', commoditySymbol: 'GOLD 24K 10g', expiryDate: '05 Aug 2026', lastTradedPrice: 72450.00, priceChange: 450.00, percentageChange: 0.63, priceUnit: '10 GMS' },
    { contractId: 'SILVER_SEP2026', commoditySymbol: 'SILVER 999 1kg', expiryDate: '05 Sep 2026', lastTradedPrice: 88900.00, priceChange: 1120.00, percentageChange: 1.27, priceUnit: '1 KGS' },
    { contractId: 'CRUDEOIL_AUG2026', commoditySymbol: 'MCX CRUDE OIL', expiryDate: '19 Aug 2026', lastTradedPrice: 6420.00, priceChange: -85.00, percentageChange: -1.31, priceUnit: 'BBL' },
    { contractId: 'NATURALGAS_AUG2026', commoditySymbol: 'NATURAL GAS', expiryDate: '25 Aug 2026', lastTradedPrice: 218.40, priceChange: 5.20, percentageChange: 2.45, priceUnit: 'mmbtu' },
    { contractId: 'COPPER_AUG2026', commoditySymbol: 'MCX COPPER', expiryDate: '28 Aug 2026', lastTradedPrice: 785.60, priceChange: 7.40, percentageChange: 0.95, priceUnit: 'KGS' },
    { contractId: 'ZINC_AUG2026', commoditySymbol: 'MCX ZINC', expiryDate: '28 Aug 2026', lastTradedPrice: 245.20, priceChange: 1.10, percentageChange: 0.45, priceUnit: 'KGS' },
    { contractId: 'ALUMINIUM_AUG2026', commoditySymbol: 'ALUMINIUM', expiryDate: '28 Aug 2026', lastTradedPrice: 232.50, priceChange: 1.80, percentageChange: 0.78, priceUnit: 'KGS' },
    { contractId: 'MENTHAOIL_AUG2026', commoditySymbol: 'MENTHA OIL', expiryDate: '31 Aug 2026', lastTradedPrice: 920.00, priceChange: -7.90, percentageChange: -0.85, priceUnit: 'KGS' }
  ];
};

/**
 * 8. Stock Target Price & Analyst Recommendations
 */
const getStockTargetPrice = async (stockId) => {
  const data = await fetchFromIndianApi('/stock_target_price', { stock_id: stockId });
  if (data) return data;

  return {
    priceTarget: {
      CurrencyCode: 'INR',
      Mean: 3150.00,
      High: 3400.00,
      Low: 2700.00,
      Median: 3180.00,
      NumberOfEstimates: 38
    },
    recommendation: {
      Mean: 1.8, // 1 = Strong Buy, 2 = Buy, 3 = Hold, 4 = Underperform, 5 = Sell
      RatingText: 'Buy',
      Statistics: {
        Statistic: [
          { Recommendation: 1, NumberOfAnalysts: 18 },
          { Recommendation: 2, NumberOfAnalysts: 14 },
          { Recommendation: 3, NumberOfAnalysts: 4 },
          { Recommendation: 4, NumberOfAnalysts: 2 },
          { Recommendation: 5, NumberOfAnalysts: 0 }
        ]
      }
    }
  };
};

/**
 * 9. Historical Data (Candlestick / Price / PE history)
 */
const getHistoricalData = async (symbol, period = '1yr', filter = 'price') => {
  const data = await fetchFromIndianApi('/historical_data', { stock_name: symbol, period, filter });
  if (data) return data;

  // Generate smooth timeline dates for mock chart
  const dates = [];
  const prices = [];
  const volumes = [];
  let basePrice = 2200;
  const now = new Date();
  
  for (let i = 90; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    basePrice += (Math.random() - 0.48) * 35;
    const priceVal = parseFloat(basePrice.toFixed(2));
    const volumeVal = Math.floor(Math.random() * 5000000) + 1000000;
    
    dates.push(dateStr);
    prices.push([dateStr, priceVal.toString()]);
    volumes.push([dateStr, volumeVal]);
  }

  return {
    datasets: [
      { metric: 'Price', label: `Price on NSE (${symbol})`, values: prices },
      { metric: 'Volume', label: 'Volume', values: volumes }
    ]
  };
};

/**
 * 10. Historical Financial Stats (Quarterly, Balance Sheet, Cashflow)
 */
const getHistoricalStats = async (symbol, stats = 'quarter_results') => {
  const data = await fetchFromIndianApi('/historical_stats', { stock_name: symbol, stats });
  if (data) return data;

  return {
    Sales: { 'Jun 2024': 62613, 'Mar 2024': 61237, 'Dec 2023': 60583, 'Sep 2023': 59692 },
    Expenses: { 'Jun 2024': 45951, 'Mar 2024': 44073, 'Dec 2023': 44195, 'Sep 2023': 43946 },
    'Operating Profit': { 'Jun 2024': 16662, 'Mar 2024': 17164, 'Dec 2023': 16388, 'Sep 2023': 15746 },
    'Net Profit': { 'Jun 2024': 12105, 'Mar 2024': 12502, 'Dec 2023': 11097, 'Sep 2023': 11380 },
    'EPS in Rs': { 'Jun 2024': 33.28, 'Mar 2024': 34.37, 'Dec 2023': 30.56, 'Sep 2023': 31.00 }
  };
};

/**
 * 11. Mutual Funds Data
 */
const getMutualFunds = async () => {
  const data = await fetchFromIndianApi('/mutual_funds');
  if (data) return data;

  return {
    Equity: {
      'Large Cap': [
        { fund_name: 'SBI Bluechip Fund Direct-Growth', latest_nav: 98.45, percentage_change: 0.85, '1_year_return': 22.4, star_rating: 5 },
        { fund_name: 'Nippon India Large Cap Fund Direct', latest_nav: 84.10, percentage_change: 1.12, '1_year_return': 26.8, star_rating: 5 },
        { fund_name: 'HDFC Top 100 Fund Direct-Growth', latest_nav: 112.30, percentage_change: 0.65, '1_year_return': 21.5, star_rating: 4 }
      ]
    }
  };
};

module.exports = {
  getCompanyStockData,
  searchIndustry,
  getTrendingStocks,
  get52WeekHighLowData,
  getMostActiveStocks,
  getPriceShockers,
  getCommoditiesData,
  getStockTargetPrice,
  getHistoricalData,
  getHistoricalStats,
  getMutualFunds
};
