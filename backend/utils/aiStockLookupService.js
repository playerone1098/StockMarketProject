const YahooFinance = require('yahoo-finance2').default;
const yahooFinance = new YahooFinance({ suppressNotices: ['yahooSurvey'] });
const { DEFAULT_SECTORS } = require('./constants');

/**
 * Maps Yahoo Finance sector strings to JodhpurTraders's predefined sector list.
 * Uses fuzzy keyword matching for resilience against naming variations.
 */
const SECTOR_KEYWORD_MAP = {
  'Information Technology': ['technology', 'software', 'computer', 'semiconductor', 'electronic'],
  'Banking & Finance': ['financial', 'banking', 'bank', 'insurance', 'capital market'],
  'Pharmaceuticals': ['pharmaceutical', 'drug', 'biotech', 'pharma'],
  'Automobile': ['automobile', 'auto', 'vehicle', 'motor', 'car'],
  'FMCG': ['consumer defensive', 'consumer staple', 'fmcg', 'food', 'beverage', 'household'],
  'Energy & Power': ['energy', 'power', 'oil', 'gas', 'petroleum', 'utilities', 'renewable'],
  'Metals & Mining': ['metal', 'mining', 'steel', 'iron', 'aluminium', 'copper'],
  'Real Estate': ['real estate', 'property', 'housing', 'construction'],
  'Telecom': ['telecom', 'communication', 'wireless', 'broadband'],
  'Infrastructure': ['infrastructure', 'engineering', 'construction', 'industrial'],
  'Media & Entertainment': ['media', 'entertainment', 'broadcast', 'streaming', 'film'],
  'Chemicals': ['chemical', 'specialty chemical', 'agrochemical', 'fertilizer'],
  'Textiles': ['textile', 'apparel', 'garment', 'fabric'],
  'Insurance': ['insurance', 'life insurance', 'general insurance'],
  'Consumer Durables': ['consumer cyclical', 'consumer durable', 'electronics', 'appliance'],
  'Capital Goods': ['capital good', 'machinery', 'defense', 'aerospace', 'equipment'],
  'Cement': ['cement', 'building material'],
  'Healthcare': ['healthcare', 'hospital', 'diagnostic', 'medical', 'health'],
  'Retail': ['retail', 'e-commerce', 'store', 'marketplace'],
  'Agriculture': ['agriculture', 'farm', 'crop', 'seed', 'agri']
};

/**
 * Maps a Yahoo Finance sector/industry string to a JodhpurTraders sector.
 * @param {string} yahooSector - Sector name from Yahoo Finance
 * @param {string} yahooIndustry - Industry name from Yahoo Finance
 * @returns {string} Best matching JodhpurTraders sector
 */
const mapToJodhpurTradersSector = (yahooSector = '', yahooIndustry = '') => {
  const combined = `${yahooSector} ${yahooIndustry}`.toLowerCase();

  for (const [svSector, keywords] of Object.entries(SECTOR_KEYWORD_MAP)) {
    if (keywords.some(kw => combined.includes(kw))) {
      return svSector;
    }
  }

  return DEFAULT_SECTORS[0]; // Fallback to 'Information Technology'
};

/**
 * Determines market cap label based on value in Crores INR.
 * @param {number} marketCapCrores - Market cap in Crores
 * @returns {string} 'Large Cap' | 'Mid Cap' | 'Small Cap'
 */
const getMarketCapLabel = (marketCapCrores) => {
  if (marketCapCrores >= 20000) return 'Large Cap';    // ≥ ₹20,000 Cr
  if (marketCapCrores >= 5000) return 'Mid Cap';        // ₹5,000–20,000 Cr
  return 'Small Cap';
};

/**
 * Looks up comprehensive company data from Yahoo Finance for a given stock symbol.
 * Tries NSE first (.NS suffix), then BSE (.BO suffix).
 *
 * @param {string} symbol - Indian stock symbol (e.g., RELIANCE, TCS, INFY)
 * @returns {Promise<Object>} Normalized company data ready for StockForm auto-fill
 */
const lookupCompanyBySymbol = async (symbol) => {
  const cleanSymbol = symbol.trim().toUpperCase().replace(/\.(NS|BO|BSE)$/i, '');

  const tickerVariants = [
    `${cleanSymbol}.NS`,
    `${cleanSymbol}.BO`
  ];

  let quote = null;
  let quoteSummary = null;
  let resolvedExchange = 'NSE';

  // Try each ticker variant until one works
  for (const ticker of tickerVariants) {
    try {
      quote = await yahooFinance.quote(ticker);
      if (quote && (quote.regularMarketPrice || quote.ask)) {
        resolvedExchange = ticker.endsWith('.NS') ? 'NSE' : 'BSE';

        // Try to get additional profile data
        try {
          quoteSummary = await yahooFinance.quoteSummary(ticker, {
            modules: ['assetProfile', 'summaryDetail', 'defaultKeyStatistics']
          });
        } catch {
          // quoteSummary is optional, continue without it
        }

        break;
      }
    } catch {
      // Try next variant
      continue;
    }
  }

  if (!quote || (!quote.regularMarketPrice && !quote.ask)) {
    return {
      success: false,
      message: `Could not find stock data for symbol "${cleanSymbol}". Ensure the symbol is valid and listed on NSE or BSE.`
    };
  }

  // Extract pricing data
  const currentPrice = quote.regularMarketPrice || quote.ask || 0;
  const dayChange = quote.regularMarketChange || 0;
  const dayChangePercent = quote.regularMarketChangePercent || 0;
  const weekHigh52 = quote.fiftyTwoWeekHigh || 0;
  const weekLow52 = quote.fiftyTwoWeekLow || 0;
  const dayHigh = quote.regularMarketDayHigh || 0;
  const dayLow = quote.regularMarketDayLow || 0;
  const volume = quote.regularMarketVolume || 0;
  const peRatio = quote.trailingPE || quote.forwardPE || 0;
  const pbRatio = quoteSummary?.defaultKeyStatistics?.priceToBook || 0;
  const dividendYield = (quoteSummary?.summaryDetail?.dividendYield || quote.dividendYield || 0) * 100;

  // Market cap in Crores (₹)
  const rawMarketCap = quote.marketCap || 0;
  const marketCapCrores = Math.round(rawMarketCap / 10000000);

  // Map sector
  const yahooSector = quote.sector || quoteSummary?.assetProfile?.sector || '';
  const yahooIndustry = quote.industry || quoteSummary?.assetProfile?.industry || '';
  const sector = mapToJodhpurTradersSector(yahooSector, yahooIndustry);

  // Company name
  const companyName = quote.longName || quote.shortName || cleanSymbol;

  // Logo URL from Clearbit (free, high-quality logos)
  const domain = quoteSummary?.assetProfile?.website
    ? new URL(quoteSummary.assetProfile.website).hostname.replace('www.', '')
    : null;
  const logoUrl = domain ? `https://logo.clearbit.com/${domain}` : '';

  return {
    success: true,
    data: {
      symbol: cleanSymbol,
      name: companyName,
      sector,
      exchange: resolvedExchange,
      currentPrice: Number(currentPrice.toFixed(2)),
      dayChange: Number(dayChange.toFixed(2)),
      dayChangePercent: Number(dayChangePercent.toFixed(2)),
      weekHigh52: Number(weekHigh52.toFixed(2)),
      weekLow52: Number(weekLow52.toFixed(2)),
      dayHigh: Number(dayHigh.toFixed(2)),
      dayLow: Number(dayLow.toFixed(2)),
      volume,
      marketCap: marketCapCrores,
      marketCapLabel: getMarketCapLabel(marketCapCrores),
      peRatio: Number(peRatio.toFixed(2)),
      pbRatio: Number(pbRatio.toFixed(2)),
      dividendYield: Number(dividendYield.toFixed(2)),
      logoUrl,
      isActive: true
    },
    source: 'Yahoo Finance',
    yahooMeta: {
      sector: yahooSector,
      industry: yahooIndustry,
      exchange: resolvedExchange
    }
  };
};

module.exports = {
  lookupCompanyBySymbol
};
