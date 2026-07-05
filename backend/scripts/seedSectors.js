const mongoose = require('mongoose');
const Sector = require('../models/Sector');
const { DEFAULT_SECTORS } = require('../utils/constants');
require('dotenv').config();

/**
 * Seed default sectors into the database.
 */
const seedSectors = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('📊 Connected to MongoDB');

    await Sector.deleteMany({});
    console.log('🗑️  Cleared existing sectors');

    const sectors = DEFAULT_SECTORS.map((name) => ({ name }));
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
