const mongoose = require('mongoose');

const mask = (s) => (s ? `${s.slice(0, 2)}***` : '');

const connectWithRetry = async (uri, options, retries = 3, delayMs = 5000) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const conn = await mongoose.connect(uri, options);
      return conn;
    } catch (err) {
      console.error(`MongoDB connect attempt ${attempt} failed: ${err.message}`);
      if (attempt < retries) {
        await new Promise((res) => setTimeout(res, delayMs));
        continue;
      }
      throw err;
    }
  }
};

const connectDB = async () => {
  try {
    const uri = (process.env.MONGO_URI || '').trim();
    const user = (process.env.MONGO_USER || '').trim();
    const pass = (process.env.MONGO_PASS || '').trim();

    if (!uri) {
      throw new Error('MONGO_URI is empty');
    }

    const host = new URL(uri.replace('mongodb+srv', 'https')).host;
    console.log(`Attempting MongoDB connection as ${mask(user)} to ${host}`);

    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName: 'work_bee',
    };

    // Only set user/pass if provided (some URIs embed credentials)
    if (user) options.user = user;
    if (pass) options.pass = pass;
    // Atlas typically doesn't need authSource when using SRV + dbName, but keep admin if explicit user provided
    if (user) options.authSource = 'admin';

    const conn = await connectWithRetry(uri, options, 3, 4000);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Database connection error:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;