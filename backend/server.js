const http = require('http');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const config = require('./config');
const errorHandler = require('./middleware/errorHandler');
const Sector = require('./models/Sector');
const { DEFAULT_SECTORS } = require('./utils/constants');
const { syncStockPrices } = require('./utils/stockSyncService');
const { syncIpoData } = require('./utils/ipoSyncService');
const { syncNewsData } = require('./utils/newsSyncService');
const { initWebSocketServer, getWSStats } = require('./utils/websocketService');

const app = express();
const server = http.createServer(app);

// Initialize WebSocket real-time data server
try {
  initWebSocketServer(server);
} catch (wsErr) {
  console.warn('⚠️ WebSocket server initialization warning:', wsErr.message);
}

// Trust proxy for rate limiting behind reverse proxies (Railway, nginx, etc.)
app.set('trust proxy', 1);

// Security middleware
app.use(helmet());

const allowedOrigins = [
  config.frontendUrl,
  process.env.ADMIN_URL,
  'http://localhost:3000',
  'http://localhost:3003',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3003'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (
      allowedOrigins.includes(origin) || 
      origin.startsWith('http://localhost:') || 
      origin.startsWith('http://127.0.0.1:') ||
      origin.startsWith('http://192.168.') ||
      origin.startsWith('http://10.') ||
      origin.endsWith('.vercel.app')
    ) {
      return callback(null, true);
    }
    return callback(new Error('CORS policy: Origin not allowed'), false);
  },
  credentials: true
}));
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use('/api/', limiter);

// Handle MongoDB connection runtime errors (prevents crashing on network drops)
mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB connection runtime error:', err);
});

// Connect to MongoDB
mongoose.connect(config.mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000
})
.then(async () => {
  console.log('✅ MongoDB connected successfully!');
  try {
    const count = await Sector.countDocuments();
    if (count === 0) {
      await Sector.insertMany(DEFAULT_SECTORS.map((name) => ({ name })));
      console.log('📊 Default sectors seeded successfully!');
    }
  } catch (err) {
    console.error('Error seeding default sectors:', err);
  }

  // Trigger initial stock price synchronization and set up interval (every 1 minute for live updates)
  syncStockPrices();
  setInterval(syncStockPrices, 60 * 1000);

  // Trigger initial IPO synchronization and set up interval (500 times/month -> every 86.4 minutes)
  syncIpoData();
  setInterval(syncIpoData, 86.4 * 60 * 1000);

  // Trigger initial news synchronization and set up interval (every 30 minutes)
  syncNewsData();
  setInterval(syncNewsData, 30 * 60 * 1000);
})
.catch((err) => {
  console.error('❌ Could not connect to MongoDB:', err.message);
  console.error('💡 TIP: Make sure MongoDB is running locally (e.g. `mongod` or `sudo systemctl start mongod`) or update `MONGODB_URI` in `backend/.env` with your MongoDB Atlas cloud database URI.');
});

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', platform: 'JodhpurTraders' });
});

// Status check
app.get('/api/status', (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStatusMap = { 0: 'Disconnected', 1: 'Connected', 2: 'Connecting', 3: 'Disconnecting' };
  res.json({
    success: true,
    data: {
      platform: 'JodhpurTraders',
      backend: 'Connected',
      database: dbStatusMap[dbState] || 'Unknown',
      environment: config.nodeEnv,
      websocket: getWSStats()
    }
  });
});

// WebSocket status check
app.get('/api/ws/status', (req, res) => {
  res.json({
    success: true,
    data: getWSStats()
  });
});

// SEO Routes
app.use('/sitemap.xml', require('./routes/sitemap'));
app.get('/robots.txt', (req, res) => {
  res.type('text/plain');
  res.send(`User-agent: *
Allow: /
Allow: /stocks
Allow: /stocks/*
Allow: /trading-ideas
Allow: /trading-ideas/*
Allow: /ipos
Allow: /ipos/*
Allow: /blog
Allow: /blog/*
Allow: /screener
Allow: /community
Allow: /about
Allow: /faq
Allow: /contact

Disallow: /admin/
Disallow: /login
Disallow: /register
Disallow: /portfolio
Disallow: /watchlist
Disallow: /settings

Sitemap: /sitemap.xml`);
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/watchlists', require('./routes/watchlists'));
app.use('/api/portfolios', require('./routes/portfolios'));
app.use('/api/trading-ideas', require('./routes/tradingIdeas'));
app.use('/api/ipos', require('./routes/ipos'));
app.use('/api/blogs', require('./routes/blogs'));
app.use('/api/stocks', require('./routes/stocks'));
app.use('/api/sectors', require('./routes/sectors'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/market', require('./routes/market'));
app.use('/api/indian', require('./routes/indianApiRoutes'));
app.use('/api/social', require('./routes/social'));
app.use('/api/chart-analysis', require('./routes/chartAnalysis'));
app.use('/api/screener-presets', require('./routes/screenerPresets'));



// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// Centralized error handler (must be last)
app.use(errorHandler);

server.listen(config.port, () => {
  console.log(`🚀 JodhpurTraders server & WebSocket running on port ${config.port} [${config.nodeEnv}]`);
});
