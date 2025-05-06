/**
 * Database Connection
 */

const mongoose = require('mongoose');
const { createLogger } = require('./utils/logger');

const logger = createLogger();
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/xpectra';

/**
 * Connect to MongoDB
 * @returns {Promise} MongoDB connection
 */
const connectToDatabase = async () => {
  try {
    // Set mongoose options
    mongoose.set('strictQuery', false);
    
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    return mongoose.connection;
  } catch (error) {
    logger.error(`MongoDB connection error: ${error.message}`);
    throw error;
  }
};

/**
 * Close the database connection
 * @returns {Promise} Resolved when connection is closed
 */
const closeDatabaseConnection = async () => {
  try {
    await mongoose.connection.close();
    logger.info('MongoDB connection closed');
  } catch (error) {
    logger.error(`Error closing MongoDB connection: ${error.message}`);
    throw error;
  }
};

module.exports = {
  connectToDatabase,
  closeDatabaseConnection,
  connection: mongoose.connection
}; 