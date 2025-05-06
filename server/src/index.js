/**
 * Xpectra Server - Main Entry Point
 */

// Load environment variables
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const { createLogger } = require('./utils/logger');
const { connectToDatabase } = require('./database');
const trackingRoutes = require('./routes/tracking');
const analyticsRoutes = require('./routes/analytics');
const authRoutes = require('./routes/auth');

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Initialize logger
const logger = createLogger();

// Connect to database
connectToDatabase()
  .then(() => logger.info('Connected to database'))
  .catch(err => {
    logger.error(`Database connection error: ${err.message}`);
    process.exit(1);
  });

// Configure middleware
app.use(helmet()); // Security headers
app.use(compression()); // Compress responses
app.use(express.json({ limit: '1mb' })); // Parse JSON requests
app.use(morgan('dev', { stream: { write: message => logger.http(message.trim()) } })); // HTTP request logging

// Configure CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 60 * 1000, // 1 minute
  max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100, // Limit each IP to 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' }
});

// Apply rate limiting to tracking endpoints
app.use('/api/track', apiLimiter);

// Define routes
app.use('/api/track', trackingRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/auth', authRoutes);

// Basic health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Not found handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use((err, req, res, next) => {
  logger.error(`Error: ${err.message}`);
  
  const statusCode = err.statusCode || 500;
  const errorMessage = process.env.NODE_ENV === 'production' && statusCode === 500
    ? 'Internal server error'
    : err.message;
  
  res.status(statusCode).json({ error: errorMessage });
});

// Start server
app.listen(PORT, () => {
  logger.info(`Xpectra server running on port ${PORT}`);
}); 