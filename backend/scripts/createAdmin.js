const mongoose = require('mongoose');
require('dotenv').config();
const User = require('../models/User');

const requiredEnv = ['MONGO_URI', 'ADMIN_EMAIL', 'ADMIN_PASSWORD'];

const missing = requiredEnv.filter((key) => !process.env[key]);

if (missing.length > 0) {
  console.error(`❌ Missing required environment variables: ${missing.join(', ')}`);
  process.exit(1);
}

const {
  MONGO_URI,
  ADMIN_NAME = 'Platform Administrator',
  ADMIN_EMAIL,
  ADMIN_PASSWORD,
  ADMIN_PHONE,
  ADMIN_LOCATION
} = process.env;

const bootstrapAdmin = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    let adminUser = await User.findOne({ email: ADMIN_EMAIL });

    if (adminUser) {
      adminUser.name = ADMIN_NAME || adminUser.name;
      adminUser.role = 'admin';
      adminUser.password = ADMIN_PASSWORD;
      adminUser.phone = ADMIN_PHONE || adminUser.phone;
      adminUser.location = ADMIN_LOCATION || adminUser.location;
      adminUser.isActive = true;
      await adminUser.save();
      console.log(`✅ Updated existing admin account for ${ADMIN_EMAIL}`);
    } else {
      adminUser = await User.create({
        name: ADMIN_NAME,
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        role: 'admin',
        phone: ADMIN_PHONE,
        location: ADMIN_LOCATION,
        isActive: true
      });
      console.log(`✅ Created new admin account for ${ADMIN_EMAIL}`);
    }

    console.log('\n📋 Admin Credentials');
    console.log(`Email: ${ADMIN_EMAIL}`);
    console.log(`Password: ${ADMIN_PASSWORD}`);
    console.log('\n🔒 Remember to rotate your admin password after first login.');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to bootstrap admin account:', error);
    process.exit(1);
  }
};

bootstrapAdmin();
