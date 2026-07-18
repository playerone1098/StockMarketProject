const YahooFinance = require('yahoo-finance2').default;
const yahooFinance = new YahooFinance({ suppressNotices: ['yahooSurvey'] });
const Stock = require('../models/Stock');
const Watchlist = require('../models/Watchlist');
const Notification = require('../models/Notification');

/**
 * Maps a stock symbol to its Yahoo Finance ticker symbol.
 * E.g., RELIANCE (NSE) -> RELIANCE.NS
 */
const getYahooTicker = (stock) => {
  const symbol = stock.symbol.toUpperCase();
  if (stock.exchange === 'NSE') {
    return `${symbol}.NS`;
  } else if (stock.exchange === 'BSE') {
    return `${symbol}.BO`;
  }
  return symbol;
};

/**
 * Synchronizes all active stock prices in MongoDB with real-time data from Yahoo Finance.
 * @returns {Promise<{success: boolean, updated: number, failed: number, errors: Array}>}
 */
const syncStockPrices = async () => {
  console.log('🔄 Initiating stock price synchronization...');
  
  try {
    const activeStocks = await Stock.find({ isActive: true });
    
    if (activeStocks.length === 0) {
      console.log('⚠️ No active stocks found in the database to sync.');
      return { success: true, updated: 0, failed: 0, errors: [] };
    }
    
    let updatedCount = 0;
    let failedCount = 0;
    const errors = [];

    // Sync in parallel with individual error boundaries so one fail doesn't block the rest
    await Promise.all(
      activeStocks.map(async (stock) => {
        const ticker = getYahooTicker(stock);
        try {
          // Fetch quote from Yahoo Finance
          const quote = await yahooFinance.quote(ticker);
          
          if (!quote) {
            throw new Error(`No quote data returned for ticker ${ticker}`);
          }

          // Extract metrics with fallbacks
          const currentPrice = quote.regularMarketPrice ?? stock.currentPrice;
          const dayChange = quote.regularMarketChange ?? stock.dayChange;
          const dayChangePercent = quote.regularMarketChangePercent ?? stock.dayChangePercent;
          const weekHigh52 = quote.fiftyTwoWeekHigh ?? stock.weekHigh52;
          const weekLow52 = quote.fiftyTwoWeekLow ?? stock.weekLow52;

          // Update MongoDB document
          await Stock.updateOne(
            { _id: stock._id },
            {
              $set: {
                currentPrice,
                dayChange,
                dayChangePercent,
                weekHigh52,
                weekLow52
              }
            }
          );

          // Check for significant movement (4% and above)
          if (Math.abs(dayChangePercent) >= 4) {
            const watchlists = await Watchlist.find({ stocks: stock._id });
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            for (const wl of watchlists) {
              const existingNotification = await Notification.findOne({
                user: wl.user,
                type: 'price_movement',
                stock: stock._id,
                createdAt: { $gte: today }
              });

              if (!existingNotification) {
                const isGain = dayChangePercent >= 0;
                const percentText = `${isGain ? '+' : ''}${dayChangePercent.toFixed(2)}%`;
                await Notification.create({
                  user: wl.user,
                  type: 'price_movement',
                  stock: stock._id,
                  title: `Significant Movement for ${stock.symbol}`,
                  message: `${stock.name} (${stock.symbol}) is ${isGain ? 'up' : 'down'} by ${percentText} today, trading at ₹${currentPrice.toFixed(2)}.`
                });
                console.log(`🔔 Created price alert for user ${wl.user} on stock ${stock.symbol}`);
              }
            }
          }

          updatedCount++;
          console.log(`✅ Synced ${stock.symbol} (${ticker}): ₹${currentPrice} (${dayChangePercent >= 0 ? '+' : ''}${dayChangePercent.toFixed(2)}%)`);
        } catch (error) {
          failedCount++;
          const errorMessage = error.message || 'Unknown error';
          errors.push({ symbol: stock.symbol, ticker, error: errorMessage });
          console.error(`❌ Failed to sync ${stock.symbol} (${ticker}):`, errorMessage);
        }
      })
    );

    console.log(`📊 Synchronization complete. Updated: ${updatedCount}, Failed: ${failedCount}`);
    return {
      success: true,
      updated: updatedCount,
      failed: failedCount,
      errors
    };
  } catch (globalError) {
    console.error('❌ Critical error during stock price synchronization:', globalError);
    return {
      success: false,
      error: globalError.message || 'Global sync failure'
    };
  }
};

module.exports = {
  syncStockPrices
};
