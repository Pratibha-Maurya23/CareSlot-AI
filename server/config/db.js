const mongoose = require('mongoose');
const dns = require('dns');
const logger = require('../utils/logger');

// Fix for Windows / ISP DNS querySrv ECONNREFUSED with mongodb+srv://
try {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (e) {
  // Ignore if unable to override DNS
}

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI;
    const conn = await mongoose.connect(uri);

    logger.info(`MongoDB Connected successfully to ${conn.connection.host}`);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    logger.error('MongoDB Connection Error', error);
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
  }
};

module.exports = connectDB;
