const mongoose = require('mongoose');
require('dotenv').config();
const { syncStockPrices } = require('../utils/stockSyncService');

const runSync = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/stockvista';
    console.log(`📡 Connecting to MongoDB at ${mongoUri}...`);
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    console.log('🚀 Triggering live stock market price sync...');
    const result = await syncStockPrices();
    
    if (result.success) {
      console.log(`\n🎉 Stock synchronization complete! Updated ${result.updated} stocks in DB.`);
    } else {
      console.error('❌ Sync failed:', result.error);
    }
  } catch (error) {
    console.error('❌ Uncaught sync script error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed.');
  }
};

runSync();
