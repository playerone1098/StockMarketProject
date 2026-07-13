const mongoose = require('mongoose');
const User = require('../models/User');
const config = require('../config');

/**
 * Create or reset the admin user for StockVista.
 */
const createAdmin = async () => {
  try {
    await mongoose.connect(config.mongoUri, {
      dbName: config.dbName,
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('');
    console.log('╔═══════════════════════════════════════╗');
    console.log('║       🚀 StockVista Admin Setup       ║');
    console.log('╚═══════════════════════════════════════╝');
    console.log('');

    // Find by either email or username to avoid E11000 duplicate key errors
    let admin = await User.findOne({ 
      $or: [
        { email: 'admin@stockvista.com' },
        { username: 'admin' }
      ]
    });

    if (admin) {
      admin.username = 'admin';
      admin.email = 'admin@stockvista.com';
      admin.password = 'ashokbhupi@2015';
      admin.role = 'admin';
      admin.profile = {
        firstName: 'StockVista',
        lastName: 'Admin'
      };
      await admin.save();
      console.log('🔄 Admin user already existed — credentials updated');
    } else {
      admin = new User({
        username: 'admin',
        email: 'admin@stockvista.com',
        password: 'ashokbhupi@2015',
        role: 'admin',
        profile: {
          firstName: 'StockVista',
          lastName: 'Admin'
        }
      });
      await admin.save();
      console.log('✅ Admin user created successfully!');
    }

    console.log('');
    console.log('📧 Email:    admin@stockvista.com');
    console.log('🔑 Password: ashokbhupi@2015');
    console.log('');
    console.log('⚠️  Please change the password after first login.');
    console.log('');
  } catch (error) {
    console.error('❌ Error creating admin:', error);
  } finally {
    await mongoose.connection.close();
  }
};

createAdmin();
