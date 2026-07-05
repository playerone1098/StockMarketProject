require('dotenv').config();

/**
 * Centralized configuration module.
 * All environment variables should be accessed through this module.
 * @module config
 */
const config = {
  /** @type {number} Server port */
  port: parseInt(process.env.PORT, 10) || 5000,

  /** @type {string} MongoDB connection URI */
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/stockvista',

  /** @type {string} JWT secret key */
  jwtSecret: process.env.JWT_SECRET || 'stockvista-dev-secret-change-in-production',

  /** @type {string} Node environment */
  nodeEnv: process.env.NODE_ENV || 'development',

  /** @type {string} Frontend URL for CORS and sitemap */
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
};

module.exports = config;
