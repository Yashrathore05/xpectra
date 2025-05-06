/**
 * Tracking Controller
 * Handles incoming tracking requests from client-side trackers
 */

const Event = require('../models/Event');
const Site = require('../models/Site');
const { getLocationFromIP } = require('../utils/geoip');
const { createLogger } = require('../utils/logger');
const UAParser = require('ua-parser-js');

const logger = createLogger();

/**
 * Process tracking data
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.trackEvent = async (req, res) => {
  try {
    const eventData = req.body;
    
    // Basic validation
    if (!eventData || !eventData.siteId) {
      return res.status(400).json({ error: 'Invalid tracking data' });
    }

    // Get IP address
    const ip = req.headers['x-forwarded-for'] || 
               req.connection.remoteAddress || 
               req.socket.remoteAddress || 
               req.connection.socket?.remoteAddress;
               
    // Look up site settings (if available)
    let siteSettings = null;
    
    try {
      const site = await Site.findOne({ siteId: eventData.siteId });
      if (site) {
        siteSettings = site.settings;
      }
    } catch (error) {
      // Proceed without site settings
      logger.warn(`Could not find site settings for ${eventData.siteId}: ${error.message}`);
    }
    
    // Process and enrich tracking data
    const enrichedData = enrichTrackingData(eventData, ip, siteSettings, req);
    
    // Save to database
    const event = new Event(enrichedData);
    await event.save();
    
    // Return success (minimal response for performance)
    return res.status(200).json({ success: true });
  } catch (error) {
    logger.error(`Error processing tracking data: ${error.message}`);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Enrich tracking data with additional information
 * @param {Object} data - Original tracking data
 * @param {string} ip - IP address
 * @param {Object} siteSettings - Site configuration settings
 * @param {Object} req - Express request object
 * @returns {Object} Enriched tracking data
 */
function enrichTrackingData(data, ip, siteSettings, req) {
  // Create a copy to avoid mutating the original
  const enriched = { ...data };
  
  // Add IP (masked based on settings if needed)
  if (!siteSettings || !siteSettings.privacy?.maskIPs) {
    enriched.ip = ip;
  } else {
    // Mask IP (e.g., 192.168.1.1 -> 192.168.1.0)
    const ipParts = ip.split('.');
    if (ipParts.length === 4) {
      ipParts[3] = '0';
      enriched.ip = ipParts.join('.');
    } else {
      // IPv6 masking
      enriched.ip = ip.replace(/((?:[0-9a-f]{1,4}:){6})([0-9a-f]{1,4}:[0-9a-f]{1,4})/, '$1:0000:0000');
    }
  }
  
  // Add location data if IP is present
  const locationData = getLocationFromIP(ip);
  if (locationData) {
    enriched.country = locationData.country;
    enriched.region = locationData.region;
    enriched.city = locationData.city;
    enriched.timezone = locationData.timezone;
    
    // Add geospatial coordinates if available
    if (locationData.ll && locationData.ll.length === 2) {
      enriched.location = {
        type: 'Point',
        coordinates: [locationData.ll[1], locationData.ll[0]] // [longitude, latitude]
      };
    }
  }
  
  // Parse user agent for additional device info if not already provided
  if (req.headers['user-agent'] && (!enriched.deviceType || !enriched.deviceOS || !enriched.deviceBrowser)) {
    const uaParser = new UAParser(req.headers['user-agent']);
    const uaResult = uaParser.getResult();
    
    if (!enriched.deviceType) {
      const device = uaResult.device.type || 
        (uaResult.device.model ? 'mobile' : 'desktop');
      enriched.deviceType = device;
    }
    
    if (!enriched.deviceOS) {
      const os = uaResult.os.name ? 
        `${uaResult.os.name} ${uaResult.os.version || ''}`.trim() : 
        'Unknown';
      enriched.deviceOS = os;
    }
    
    if (!enriched.deviceBrowser) {
      const browser = uaResult.browser.name ? 
        `${uaResult.browser.name} ${uaResult.browser.version || ''}`.trim() : 
        'Unknown';
      enriched.deviceBrowser = browser;
    }
  }
  
  // Ensure timestamp is a Date object
  if (enriched.timestamp && typeof enriched.timestamp === 'string') {
    enriched.timestamp = new Date(enriched.timestamp);
  } else if (!enriched.timestamp) {
    enriched.timestamp = new Date();
  }
  
  return enriched;
} 