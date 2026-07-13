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

const app = express();

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
  dbName: config.dbName,
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(async () => {
  console.log('✅ MongoDB connected');
  try {
    const count = await Sector.countDocuments();
    if (count === 0) {
      const sectors = DEFAULT_SECTORS.map((name) => {
        const slug = name
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .trim();
        return { name, slug };
      });
      await Sector.insertMany(sectors);
      console.log('📊 Default sectors seeded successfully!');
    }
  } catch (err) {
    console.error('Error seeding default sectors:', err);
  }

  // Trigger initial stock price synchronization and set up interval (every 10 minutes)
  syncStockPrices();
  setInterval(syncStockPrices, 10 * 60 * 1000);

  // Trigger initial IPO synchronization and set up interval (500 times/month -> every 86.4 minutes)
  syncIpoData();
  setInterval(syncIpoData, 86.4 * 60 * 1000);

  // Trigger initial news synchronization and set up interval (every 30 minutes)
  syncNewsData();
  setInterval(syncNewsData, 30 * 60 * 1000);
})
.catch((err) => console.error('❌ MongoDB connection error:', err));

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', platform: 'StockVista' });
});

// Status check
app.get('/api/status', (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStatusMap = { 0: 'Disconnected', 1: 'Connected', 2: 'Connecting', 3: 'Disconnecting' };
  res.json({
    success: true,
    data: {
      platform: 'StockVista',
      backend: 'Connected',
      database: dbStatusMap[dbState] || 'Unknown',
      environment: config.nodeEnv
    }
  });
});

// Routes
app.use('/sitemap.xml', require('./routes/sitemap'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/trading-ideas', require('./routes/tradingIdeas'));
app.use('/api/ipos', require('./routes/ipos'));
app.use('/api/blogs', require('./routes/blogs'));
app.use('/api/stocks', require('./routes/stocks'));
app.use('/api/sectors', require('./routes/sectors'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/market', require('./routes/market'));

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// Centralized error handler (must be last)
app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`🚀 StockVista server running on port ${config.port} [${config.nodeEnv}]`);
});
