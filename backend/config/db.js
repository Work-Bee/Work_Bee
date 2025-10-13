const mongoose = require('mongoose');

const mask = (s) => (s ? `${s.slice(0, 2)}***` : '');

const connectDB = async () => {
  try {
    const uri = (process.env.MONGO_URI || '').trim();
    const user = (process.env.MONGO_USER || '').trim();
    const pass = (process.env.MONGO_PASS || '').trim();

    if (!uri) {
      throw new Error('MONGO_URI is empty');
    }

    console.log(`Attempting MongoDB connection as ${mask(user)} to ${new URL(uri.replace('mongodb+srv', 'https')).host}`);

    const conn = await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      user,
      pass,
      authSource: 'admin',
      dbName: 'work_bee',
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Database connection error:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;