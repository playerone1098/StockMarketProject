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
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/jodhpurtraders',

  /** @type {string} JWT secret key */
  jwtSecret: process.env.JWT_SECRET || 'jodhpurtraders-dev-secret-change-in-production',

  /** @type {string} Node environment */
  nodeEnv: process.env.NODE_ENV || 'development',

  /** @type {string} Frontend URL for CORS and sitemap */
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',

  /** @type {string} Google Client ID */
  googleClientId: process.env.GOOGLE_CLIENT_ID || '817253510812-74npu66qfekfggmbeui8tn8aco9b3fi6.apps.googleusercontent.com',

  /** @type {string} Google Client Secret */
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || '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'
};

module.exports = config;
