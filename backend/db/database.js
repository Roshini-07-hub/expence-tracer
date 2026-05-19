const mongoose = require('mongoose');

async function connectDB() {
  const RETRY_INTERVAL = 5000; // retry every 5 seconds

  const tryConnect = async () => {
    try {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log('✅ Connected to MongoDB Atlas');
    } catch (err) {
      console.error('❌ MongoDB connection error:', err.message);
      console.log(`⏳ Retrying in ${RETRY_INTERVAL / 1000}s...`);
      setTimeout(tryConnect, RETRY_INTERVAL);
    }
  };

  await tryConnect();
}

module.exports = connectDB;
