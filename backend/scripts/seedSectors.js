const mongoose = require('mongoose');
const Sector = require('../models/Sector');
const { DEFAULT_SECTORS } = require('../utils/constants');
const config = require('../config');

/**
 * Seed default sectors into the database.
 */
const seedSectors = async () => {
  try {
    await mongoose.connect(config.mongoUri, {
      dbName: config.dbName,
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('📊 Connected to MongoDB');

    await Sector.deleteMany({});
    console.log('🗑️  Cleared existing sectors');

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

    console.log(`✅ ${sectors.length} sectors seeded successfully!`);
    DEFAULT_SECTORS.forEach((s) => console.log(`   • ${s}`));
  } catch (error) {
    console.error('❌ Error seeding sectors:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed');
  }
};

seedSectors();
