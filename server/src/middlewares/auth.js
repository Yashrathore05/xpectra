/**
 * Authentication Middleware
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Site = require('../models/Site');
const { createLogger } = require('../utils/logger');

const logger = createLogger();

/**
 * Verify JWT token from Authorization header
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.authenticateJWT = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Invalid token format' });
    }
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      
      // Get user from database
      const user = await User.findById(decoded.id).select('-passwordHash -salt');
      
      if (!user || !user.active) {
        return res.status(401).json({ error: 'User not found or inactive' });
      }
      
      // Attach user to request
      req.user = user;
      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Token expired' });
      }
      
      return res.status(401).json({ error: 'Invalid token' });
    }
  } catch (error) {
    logger.error(`Authentication error: ${error.message}`);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Check if user has access to requested site
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.checkSiteAccess = async (req, res, next) => {
  try {
    const { siteId } = req.params;
    const userId = req.user._id;
    
    if (!siteId) {
      return res.status(400).json({ error: 'Site ID required' });
    }
    
    // Check if user is admin (admins have access to all sites)
    if (req.user.role === 'admin') {
      return next();
    }
    
    // Find the site and check if user has access
    const site = await Site.findOne({ siteId });
    
    if (!site) {
      return res.status(404).json({ error: 'Site not found' });
    }
    
    // Check if user is site owner
    if (site.owner.toString() === userId.toString()) {
      return next();
    }
    
    // Check if user is in team
    const teamMember = site.team.find(member => 
      member.user.toString() === userId.toString()
    );
    
    if (!teamMember) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    // Add team member role to request
    req.userSiteRole = teamMember.role;
    next();
  } catch (error) {
    logger.error(`Site access check error: ${error.message}`);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Check if API key is valid for tracking
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.checkApiKey = async (req, res, next) => {
  try {
    const apiKey = req.headers['x-api-key'] || req.query.api_key;
    
    if (!apiKey) {
      return res.status(401).json({ error: 'API key required' });
    }
    
    // Check if API key is enabled in config
    if (process.env.API_KEY_ENABLED === 'false') {
      return next();
    }
    
    // If a global API key is configured, check against that
    if (process.env.API_KEY && apiKey === process.env.API_KEY) {
      return next();
    }
    
    // Check site-specific API key if siteId is provided
    const { siteId } = req.body;
    
    if (siteId) {
      const site = await Site.findOne({ siteId, apiKey, active: true });
      
      if (site) {
        return next();
      }
    }
    
    return res.status(401).json({ error: 'Invalid API key' });
  } catch (error) {
    logger.error(`API key check error: ${error.message}`);
    return res.status(500).json({ error: 'Internal server error' });
  }
}; 