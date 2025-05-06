/**
 * GeoIP Utility for IP-based location detection
 */

const geoip = require('geoip-lite');
const { createLogger } = require('./logger');

const logger = createLogger();

/**
 * Get location information from an IP address
 * @param {string} ip - The IP address to look up
 * @returns {object|null} Location data or null if not found
 */
function getLocationFromIP(ip) {
  if (!ip) return null;
  
  try {
    // Remove port if present
    const cleanIP = ip.split(':')[0];
    
    // Skip local/private IPs
    if (isPrivateIP(cleanIP)) {
      return null;
    }
    
    // Look up IP
    const geo = geoip.lookup(cleanIP);
    
    if (!geo) {
      return null;
    }
    
    return {
      country: geo.country,
      region: geo.region,
      city: geo.city,
      ll: geo.ll, // [latitude, longitude]
      timezone: geo.timezone
    };
  } catch (error) {
    logger.error(`GeoIP lookup error: ${error.message}`);
    return null;
  }
}

/**
 * Check if an IP address is private/local
 * @param {string} ip - The IP address to check
 * @returns {boolean} Whether the IP is private/local
 */
function isPrivateIP(ip) {
  // Check for localhost
  if (ip === '127.0.0.1' || ip === '::1' || ip === 'localhost') {
    return true;
  }
  
  // Check for private IPv4 ranges
  const ipv4PrivateRanges = [
    /^10\./,                    // 10.0.0.0 - 10.255.255.255
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./, // 172.16.0.0 - 172.31.255.255
    /^192\.168\./              // 192.168.0.0 - 192.168.255.255
  ];
  
  for (const range of ipv4PrivateRanges) {
    if (range.test(ip)) {
      return true;
    }
  }
  
  // Check for IPv6 local addresses
  if (ip.startsWith('fc') || ip.startsWith('fd') || ip.startsWith('fe')) {
    return true;
  }
  
  return false;
}

module.exports = {
  getLocationFromIP
}; 