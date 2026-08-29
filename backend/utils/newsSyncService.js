const BlogPost = require('../models/BlogPost');
const Stock = require('../models/Stock');

/**
 * Generates a random percentage between min and max.
 */
const getRandomPercent = (min, max) => {
  return (Math.random() * (max - min) + min).toFixed(1);
};

/**
 * Fetches real stock news from stock.indianapi.in if API key is present.
 * @param {string} apiKey - The IndianAPI secret token
 * @returns {Promise<Array|null>} Array of news items or null on failure
 */
const fetchLiveNewsData = async (apiKey) => {
  try {
    console.log('📡 Fetching live news from stock.indianapi.in/news...');
    const response = await fetch('https://stock.indianapi.in/news', {
      headers: {
        'x-api-key': apiKey,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const data = await response.json();
    return Array.isArray(data) ? data : (data.data && Array.isArray(data.data) ? data.data : null);
  } catch (err) {
    console.error('⚠️ IndianAPI news fetch failed:', err.message);
    return null;
  }
};

/**
 * Generates a realistic simulated financial news item for one of the active stocks.
 * @returns {Promise<Object|null>} A generated news article object, or null
 */
const generateSimulatedNews = async () => {
  try {
    const activeStocks = await Stock.find({ isActive: true });
    if (activeStocks.length === 0) return null;

    // Pick a random stock
    const stock = activeStocks[Math.floor(Math.random() * activeStocks.length)];

    const templates = [
      {
        title: `${stock.name} Secures Major Expansion Deal in Europe`,
        excerpt: `In a regulatory filing today, ${stock.name} confirmed it has locked in a long-term strategic expansion contract with key European partners, boosting its international order book.`,
        content: `### Strategic Deal Confirmed\n\n**${stock.name}** announced today that it has signed a multi-year agreement to supply enterprise solutions and services to leading European consortiums.\n\nThis landmark expansion contract is valued at over several million Euros and is projected to start impacting the top-line numbers from next quarter.\n\n"This is a major milestone for our business as we solidify our footprint in the European zone," said the CEO. "We are seeing very robust international demand for our services."\n\n### Market Reaction\n\nThe market reacted positively to this announcement, with ${stock.symbol} shares gaining support during early trading sessions.`
      },
      {
        title: `${stock.name} Announces Q1 Net Profit Surge of ${getRandomPercent(12, 35)}%`,
        excerpt: `${stock.name} reported a stellar performance for the first quarter of the fiscal year, led by operational efficiency and robust demand across its core segments.`,
        content: `### Earnings Release Overview\n\n**${stock.name}** has declared its financial results for Q1, recording an impressive surge in net profit of **${getRandomPercent(12, 35)}% YoY**.\n\n- **Revenue:** Up 15.4% YoY\n- **EBITDA Margins:** Expanded by 180 bps\n- **Net Profit Margin:** Improved to 14.8%\n\nAccording to management, the stellar numbers were driven by higher operational efficiency and solid volume growth across key divisions.\n\nAnalysts have reiterated a 'Buy' rating on ${stock.symbol} post-earnings, citing stable tailwinds.`
      },
      {
        title: `Analysts Raise Target Price For ${stock.symbol} Post Strong Earnings Guidance`,
        excerpt: `Major brokerages have raised their consensus target price for ${stock.name} following the company's upbeat growth outlook for the upcoming quarters.`,
        content: `### Brokerage Upgrade Analysis\n\nFollowing the management's optimistic revenue guidance, top brokerage firms have raised their price target for **${stock.name} (${stock.symbol})**.\n\n- **Consensus Rating:** Overweight / Buy\n- **Revised Average Target Price:** Up 15% from current market price\n- **Key Drivers:** Strong order pipeline, margin expansion, and market share gains\n\n"The company's digital transformation pipeline looks exceptionally resilient," noted a senior research analyst. "We expect ${stock.symbol} to outperform peers in the medium term."`
      },
      {
        title: `Board of Directors at ${stock.name} Approves Interim Dividend`,
        excerpt: `The board of directors of ${stock.name} has approved a dividend payout to reward its shareholders, setting the record date for later this month.`,
        content: `### Corporate Action Dividend Declaration\n\n**${stock.name}** has informed exchanges that its Board of Directors has approved an interim dividend payout for the financial year.\n\n- **Dividend Rate:** ₹${getRandomPercent(2, 15)} per share\n- **Record Date:** Set for two weeks from today\n- **Payout Date:** Within 30 days of declaration\n\nThis dividend payout highlights the company's strong free cash flow generation and commitment to returning value to shareholders.`
      }
    ];

    // Pick a random template
    const article = templates[Math.floor(Math.random() * templates.length)];
    
    return {
      title: article.title,
      excerpt: article.excerpt,
      content: article.content,
      category: 'news',
      tags: ['market-news', stock.symbol.toLowerCase()],
      author: 'JodhpurTraders Research',
      readTime: 3,
      isFeatured: false,
      isActive: true
    };
  } catch (err) {
    console.error('❌ Failed to generate simulated news:', err.message);
    return null;
  }
};

/**
 * Synchronizes Indian stock market news.
 * Fetches from IndianAPI in live mode, or generates simulated news articles.
 * @returns {Promise<{success: boolean, inserted: number, mode: string, errors: Array}>}
 */
const syncNewsData = async () => {
  const apiKey = process.env.INDIAN_API_KEY;
  const isSimulationMode = !apiKey;
  const modeLabel = isSimulationMode ? 'Simulation Mode' : 'Live API Mode';

  console.log(`🔄 Initiating market news synchronization (${modeLabel})...`);

  try {
    let insertedCount = 0;
    const errors = [];

    if (!isSimulationMode) {
      // --- LIVE API MODE ---
      const apiNewsList = await fetchLiveNewsData(apiKey);
      
      if (!apiNewsList || apiNewsList.length === 0) {
        console.log('⚠️ No live news articles returned from API.');
        return { success: true, inserted: 0, mode: modeLabel, errors };
      }

      for (const item of apiNewsList) {
        try {
          const title = item.title || item.headline;
          if (!title) continue;

          // Check if article already exists
          const existing = await BlogPost.findOne({ title });
          if (existing) continue;

          // Create new BlogPost news item
          await BlogPost.create({
            title,
            excerpt: item.summary || item.description || title,
            content: `Read the full story from **${item.source || 'our news source'}** [here](${item.url || '#'}).\n\n*Published at: ${item.publishedAt ? new Date(item.publishedAt).toLocaleString() : new Date().toLocaleString()}*`,
            category: 'news',
            tags: ['market-news', (item.ticker || item.symbol || 'general').toLowerCase()],
            author: item.source || 'JodhpurTraders News',
            readTime: 2,
            isFeatured: false,
            isActive: true
          });

          insertedCount++;
        } catch (itemErr) {
          errors.push({ error: itemErr.message });
          console.error('❌ Failed to insert live news item:', itemErr.message);
        }
      }
    } else {
      // --- SIMULATION MODE ---
      // Generate 2 new simulated news articles
      for (let i = 0; i < 2; i++) {
        try {
          const newsItem = await generateSimulatedNews();
          if (!newsItem) continue;

          // Check if already generated
          const existing = await BlogPost.findOne({ title: newsItem.title });
          if (existing) continue;

          await BlogPost.create(newsItem);
          insertedCount++;
          console.log(`✅ Generated news: "${newsItem.title}"`);
        } catch (simErr) {
          errors.push({ error: simErr.message });
          console.error('❌ Failed to insert simulated news:', simErr.message);
        }
      }
    }

    console.log(`📊 News synchronization complete. New articles inserted: ${insertedCount}`);
    return {
      success: true,
      inserted: insertedCount,
      mode: modeLabel,
      errors
    };

  } catch (globalError) {
    console.error('❌ Critical error during news sync:', globalError);
    return {
      success: false,
      error: globalError.message || 'Global news sync failure'
    };
  }
};

module.exports = {
  syncNewsData
};
