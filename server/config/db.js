const mongoose = require('mongoose');

/**
 * Establishes the MongoDB connection using the MONGO_URI env variable.
 * Exits the process on failure so the app never runs in a half-broken state.
 */
const connectDB = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('✗ MONGO_URI is not set. Add it to your .env file.');
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(uri);
    console.log(`✓ MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
  } catch (err) {
    console.error(`✗ MongoDB connection error: ${err.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
