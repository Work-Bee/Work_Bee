const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const User = require('../models/User');

const DEMO_EMAILS = [
  'employer@demo.com',
  'jobseeker@demo.com',
];

const run = async () => {
  try {
    const { MONGO_URI, SEED_DEMO_PASSWORD } = process.env;
    if (!MONGO_URI) {
      console.error('❌ Missing MONGO_URI. Set it in backend/.env');
      process.exit(1);
    }

    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

    const users = await User.find({ email: { $in: DEMO_EMAILS } }).lean();
    const admins = await User.find({ role: 'admin' }).lean();

    console.log('Demo Users:');
    for (const email of DEMO_EMAILS) {
      const u = users.find((x) => x.email === email);
      if (u) {
        console.log(`- ${u.role} -> email: ${u.email}, id: ${u._id}`);
      } else {
        console.log(`- ${email} not found`);
      }
    }

    console.log('\nAdmins:');
    if (!admins.length) {
      console.log('- none');
    } else {
      admins.forEach((a) => console.log(`- ${a.email} (id: ${a._id})`));
    }

    console.log('\nPasswords:');
    console.log(`- employer@demo.com password: ${SEED_DEMO_PASSWORD || 'demo123'}`);
    console.log(`- jobseeker@demo.com password: ${SEED_DEMO_PASSWORD || 'demo123'}`);

    await mongoose.disconnect();
  } catch (err) {
    console.error('❌ Error printing demo users:', err);
    try { await mongoose.disconnect(); } catch (_) {}
    process.exit(1);
  }
};

run();
