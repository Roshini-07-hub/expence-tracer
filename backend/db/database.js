const mongoose = require('mongoose');

// Cache connection across serverless invocations
let cachedConnection = null;

async function connectDB() {
  // If already connected, reuse the connection
  if (cachedConnection && mongoose.connection.readyState === 1) {
    return cachedConnection;
  }

  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });

    cachedConnection = conn;
    console.log('✅ Connected to MongoDB Atlas');
    return conn;
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    throw err;
  }
}

module.exports = connectDB;
