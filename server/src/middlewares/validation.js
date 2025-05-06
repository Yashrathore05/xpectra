/**
 * Validation Middleware
 */

const { createLogger } = require('../utils/logger');

const logger = createLogger();

/**
 * Validate tracking data
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.validateTrackingData = (req, res, next) => {
  try {
    const data = req.body;
    
    // For GET requests (pixel tracking), create basic data
    if (req.method === 'GET') {
      req.body = {
        siteId: req.query.sid || 'default',
        type: 'pageview',
        timestamp: new Date().toISOString(),
        url: req.query.url || req.headers.referer,
        visitorId: req.query.uid || 'anonymous',
        sessionId: req.query.sid || 'anonymous',
        referrer: req.query.ref || req.headers.referer,
        userAgent: req.headers['user-agent']
      };
      return next();
    }
    
    // Check if data is an array (bulk tracking)
    if (Array.isArray(data)) {
      if (data.length === 0) {
        return res.status(400).json({ error: 'Empty tracking data array' });
      }
      
      // Validate each item in the array
      for (const item of data) {
        if (!validateSingleTrackingItem(item)) {
          return res.status(400).json({ 
            error: 'Invalid tracking data in array',
            item
          });
        }
      }
      
      return next();
    }
    
    // Validate single tracking item
    if (!validateSingleTrackingItem(data)) {
      return res.status(400).json({ error: 'Invalid tracking data' });
    }
    
    next();
  } catch (error) {
    logger.error(`Validation error: ${error.message}`);
    return res.status(400).json({ error: 'Invalid tracking data format' });
  }
};

/**
 * Validate a single tracking data item
 * @param {Object} data - Tracking data item
 * @returns {boolean} Whether data is valid
 */
function validateSingleTrackingItem(data) {
  // Required fields
  if (!data.siteId || !data.visitorId || !data.sessionId) {
    return false;
  }
  
  // Type validation
  if (data.type && !['pageview', 'event', 'error', 'exit'].includes(data.type)) {
    return false;
  }
  
  // If type is event, validate event data
  if (data.type === 'event' && (!data.category || !data.action)) {
    return false;
  }
  
  // If type is error, validate error data
  if (data.type === 'error' && !data.message) {
    return false;
  }
  
  return true;
} 