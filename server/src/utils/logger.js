/**
 * Logging Utility
 */

const winston = require('winston');
const path = require('path');
const fs = require('fs');

/**
 * Create logger instance with file and console transports
 * @returns {winston.Logger} Winston logger instance
 */
const createLogger = () => {
  // Ensure log directory exists
  const logDir = path.dirname(process.env.LOG_FILE_PATH || './logs/xpectra.log');
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }

  // Define log format
  const logFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  );

  // Create console format
  const consoleFormat = winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(({ timestamp, level, message }) => {
      return `${timestamp} ${level}: ${message}`;
    })
  );

  // Create logger with configuration
  return winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: logFormat,
    defaultMeta: { service: 'xpectra-server' },
    transports: [
      // Console transport for all environments
      new winston.transports.Console({
        format: consoleFormat
      }),
      // File transport
      new winston.transports.File({
        filename: process.env.LOG_FILE_PATH || 'logs/xpectra.log',
        maxsize: 10485760, // 10MB
        maxFiles: 5,
        tailable: true
      }),
      // Separate file for errors
      new winston.transports.File({
        filename: process.env.LOG_ERROR_FILE_PATH || 'logs/error.log',
        level: 'error',
        maxsize: 10485760, // 10MB
        maxFiles: 5
      })
    ],
    exceptionHandlers: [
      new winston.transports.File({
        filename: process.env.LOG_EXCEPTION_FILE_PATH || 'logs/exceptions.log',
        maxsize: 10485760, // 10MB
        maxFiles: 5
      })
    ],
    rejectionHandlers: [
      new winston.transports.File({
        filename: process.env.LOG_REJECTION_FILE_PATH || 'logs/rejections.log',
        maxsize: 10485760, // 10MB
        maxFiles: 5
      })
    ],
    exitOnError: false
  });
};

module.exports = {
  createLogger
}; 