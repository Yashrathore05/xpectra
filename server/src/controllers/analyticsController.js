/**
 * Analytics Controller
 * Handles data aggregation and retrieval for the dashboard
 */

const Event = require('../models/Event');
const Site = require('../models/Site');
const { createLogger } = require('../utils/logger');

const logger = createLogger();

/**
 * Get site overview statistics
 */
exports.getOverview = async (req, res) => {
  try {
    const { siteId } = req.params;
    const { period = '7d' } = req.query;
    
    const timeRange = getTimeRange(period);
    if (!timeRange) {
      return res.status(400).json({ error: 'Invalid time period' });
    }
    
    // Get total pageviews
    const pageviewsCount = await Event.countDocuments({ 
      siteId, 
      type: 'pageview',
      timestamp: { $gte: timeRange.start, $lte: timeRange.end }
    });
    
    // Get unique visitors
    const visitorsCount = await Event.distinct('visitorId', { 
      siteId, 
      timestamp: { $gte: timeRange.start, $lte: timeRange.end }
    }).then(visitors => visitors.length);
    
    // Get unique sessions
    const sessionsCount = await Event.distinct('sessionId', { 
      siteId, 
      timestamp: { $gte: timeRange.start, $lte: timeRange.end }
    }).then(sessions => sessions.length);
    
    // Get bounce rate (sessions with only one pageview)
    const bounceRate = await calculateBounceRate(siteId, timeRange);
    
    // Get average session duration
    const avgSessionDuration = await calculateAverageSessionDuration(siteId, timeRange);
    
    // Get pageviews over time
    const pageviewsOverTime = await getPageviewsOverTime(siteId, timeRange, period);
    
    // Get top pages
    const topPages = await Event.aggregate([
      { 
        $match: { 
          siteId, 
          type: 'pageview',
          timestamp: { $gte: timeRange.start, $lte: timeRange.end } 
        } 
      },
      { 
        $group: { 
          _id: '$path', 
          title: { $first: '$title' },
          count: { $sum: 1 },
          visitors: { $addToSet: '$visitorId' }
        } 
      },
      { 
        $project: {
          path: '$_id',
          title: 1,
          views: '$count',
          visitors: { $size: '$visitors' },
          _id: 0
        }
      },
      { $sort: { views: -1 } },
      { $limit: 10 }
    ]);
    
    return res.json({
      timeRange: {
        start: timeRange.start,
        end: timeRange.end
      },
      overview: {
        pageviews: pageviewsCount,
        visitors: visitorsCount,
        sessions: sessionsCount,
        bounceRate,
        avgSessionDuration,
        pageviewsOverTime
      },
      topPages
    });
  } catch (error) {
    logger.error(`Error getting overview stats: ${error.message}`);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Get realtime data (last 5 minutes)
 */
exports.getRealtime = async (req, res) => {
  try {
    const { siteId } = req.params;
    
    // Get data from the last 5 minutes
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    
    // Get active visitors
    const activeVisitors = await Event.distinct('visitorId', { 
      siteId, 
      timestamp: { $gte: fiveMinutesAgo }
    }).then(visitors => visitors.length);
    
    // Get pageviews in last 5 minutes
    const recentPageviews = await Event.countDocuments({ 
      siteId, 
      type: 'pageview',
      timestamp: { $gte: fiveMinutesAgo }
    });
    
    // Get current pages being viewed
    const currentPages = await Event.aggregate([
      { 
        $match: { 
          siteId, 
          type: 'pageview',
          timestamp: { $gte: fiveMinutesAgo } 
        } 
      },
      { 
        $sort: { 
          timestamp: -1 
        } 
      },
      {
        $group: {
          _id: '$visitorId',
          path: { $first: '$path' },
          title: { $first: '$title' },
          timestamp: { $first: '$timestamp' },
          country: { $first: '$country' },
          city: { $first: '$city' },
          deviceType: { $first: '$deviceType' }
        }
      },
      { 
        $project: {
          _id: 0,
          visitorId: '$_id',
          path: 1,
          title: 1,
          timestamp: 1,
          country: 1,
          city: 1,
          deviceType: 1
        }
      },
      { $sort: { timestamp: -1 } },
      { $limit: 50 }
    ]);
    
    return res.json({
      timestamp: new Date(),
      activeVisitors,
      recentPageviews,
      currentPages
    });
  } catch (error) {
    logger.error(`Error getting realtime stats: ${error.message}`);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Get pageview statistics
 */
exports.getPageviews = async (req, res) => {
  try {
    const { siteId } = req.params;
    const { period = '7d', limit = 50 } = req.query;
    
    const timeRange = getTimeRange(period);
    if (!timeRange) {
      return res.status(400).json({ error: 'Invalid time period' });
    }
    
    // Get top pages
    const pages = await Event.aggregate([
      { 
        $match: { 
          siteId, 
          type: 'pageview',
          timestamp: { $gte: timeRange.start, $lte: timeRange.end } 
        } 
      },
      { 
        $group: { 
          _id: '$path', 
          url: { $first: '$url' },
          title: { $first: '$title' },
          count: { $sum: 1 },
          visitors: { $addToSet: '$visitorId' },
          totalTimeSpent: { $sum: '$timeOnPage' }
        } 
      },
      { 
        $project: {
          path: '$_id',
          url: 1,
          title: 1,
          views: '$count',
          visitors: { $size: '$visitors' },
          avgTimeOnPage: { 
            $cond: [
              { $eq: ['$count', 0] },
              0,
              { $divide: ['$totalTimeSpent', '$count'] }
            ]
          },
          _id: 0
        }
      },
      { $sort: { views: -1 } },
      { $limit: parseInt(limit, 10) }
    ]);
    
    return res.json({
      timeRange: {
        start: timeRange.start,
        end: timeRange.end
      },
      pages
    });
  } catch (error) {
    logger.error(`Error getting pageview stats: ${error.message}`);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Get referrer statistics
 */
exports.getReferrers = async (req, res) => {
  try {
    const { siteId } = req.params;
    const { period = '7d', limit = 20 } = req.query;
    
    const timeRange = getTimeRange(period);
    if (!timeRange) {
      return res.status(400).json({ error: 'Invalid time period' });
    }
    
    // Get referrers
    const referrers = await Event.aggregate([
      { 
        $match: { 
          siteId, 
          type: 'pageview',
          referrer: { $ne: null, $ne: '' },
          timestamp: { $gte: timeRange.start, $lte: timeRange.end } 
        } 
      },
      { 
        $group: { 
          _id: '$referrer', 
          count: { $sum: 1 },
          visitors: { $addToSet: '$visitorId' }
        } 
      },
      { 
        $project: {
          source: '$_id',
          views: '$count',
          visitors: { $size: '$visitors' },
          _id: 0
        }
      },
      { $sort: { views: -1 } },
      { $limit: parseInt(limit, 10) }
    ]);
    
    // Enrich with referrer type (social, search, direct, etc.)
    const enrichedReferrers = referrers.map(ref => ({
      ...ref,
      type: categorizeReferrer(ref.source)
    }));
    
    return res.json({
      timeRange: {
        start: timeRange.start,
        end: timeRange.end
      },
      referrers: enrichedReferrers
    });
  } catch (error) {
    logger.error(`Error getting referrer stats: ${error.message}`);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Additional analytics controller methods (getLocations, getDevices, etc.) would be similar

/**
 * Export data in CSV/Excel/JSON format
 */
exports.exportData = async (req, res) => {
  try {
    const { siteId } = req.params;
    const { format = 'json', period = '7d', type = 'pageviews' } = req.query;
    
    const timeRange = getTimeRange(period);
    if (!timeRange) {
      return res.status(400).json({ error: 'Invalid time period' });
    }
    
    // Get the data to export based on type
    let data;
    switch (type) {
      case 'pageviews':
        data = await Event.find(
          { 
            siteId, 
            type: 'pageview',
            timestamp: { $gte: timeRange.start, $lte: timeRange.end } 
          },
          { 
            _id: 0, 
            __v: 0,
            createdAt: 0,
            updatedAt: 0
          }
        ).lean();
        break;
      case 'events':
        data = await Event.find(
          { 
            siteId, 
            type: 'event',
            timestamp: { $gte: timeRange.start, $lte: timeRange.end } 
          },
          { 
            _id: 0, 
            __v: 0,
            createdAt: 0,
            updatedAt: 0
          }
        ).lean();
        break;
      default:
        return res.status(400).json({ error: 'Invalid export type' });
    }
    
    // Format and return the data
    switch (format.toLowerCase()) {
      case 'json':
        return res.json(data);
      
      case 'csv':
        if (!data.length) {
          return res.status(404).json({ error: 'No data to export' });
        }
        
        const csv = convertToCSV(data);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${siteId}_${type}_${period}.csv"`);
        return res.send(csv);
      
      default:
        return res.status(400).json({ error: 'Unsupported export format' });
    }
  } catch (error) {
    logger.error(`Error exporting data: ${error.message}`);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Custom query endpoint for advanced analytics
 */
exports.customQuery = async (req, res) => {
  try {
    const { siteId } = req.params;
    const { query } = req.body;
    
    // Validate query to prevent injection
    if (!query || typeof query !== 'object') {
      return res.status(400).json({ error: 'Invalid query format' });
    }
    
    // Ensure the query is scoped to the requested site
    const safeQuery = {
      ...query,
      siteId // Force siteId to match the requested site
    };
    
    const result = await Event.aggregate(safeQuery);
    
    return res.json(result);
  } catch (error) {
    logger.error(`Error executing custom query: ${error.message}`);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Helper functions

/**
 * Get start and end dates for a time period
 * @param {string} period - Time period (e.g., 1d, 7d, 30d, 12m)
 * @returns {Object|null} Start and end dates, or null if invalid
 */
function getTimeRange(period) {
  const end = new Date();
  let start;
  
  const match = period.match(/^(\d+)([dwmy])$/);
  if (!match) return null;
  
  const [, value, unit] = match;
  const num = parseInt(value, 10);
  
  switch (unit) {
    case 'd': // days
      start = new Date();
      start.setDate(start.getDate() - num);
      break;
    case 'w': // weeks
      start = new Date();
      start.setDate(start.getDate() - (num * 7));
      break;
    case 'm': // months
      start = new Date();
      start.setMonth(start.getMonth() - num);
      break;
    case 'y': // years
      start = new Date();
      start.setFullYear(start.getFullYear() - num);
      break;
    default:
      return null;
  }
  
  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);
  
  return { start, end };
}

/**
 * Calculate bounce rate
 * @param {string} siteId - Site ID
 * @param {Object} timeRange - Time range object
 * @returns {number} Bounce rate percentage
 */
async function calculateBounceRate(siteId, timeRange) {
  // Get sessions that have only one pageview
  const sessionsWithSinglePageview = await Event.aggregate([
    { 
      $match: { 
        siteId,
        type: 'pageview',
        timestamp: { $gte: timeRange.start, $lte: timeRange.end }
      } 
    },
    {
      $group: {
        _id: '$sessionId',
        count: { $sum: 1 }
      }
    },
    {
      $match: {
        count: 1
      }
    },
    {
      $count: 'bounces'
    }
  ]);
  
  // Get total number of sessions
  const totalSessions = await Event.distinct('sessionId', { 
    siteId, 
    type: 'pageview',
    timestamp: { $gte: timeRange.start, $lte: timeRange.end }
  }).then(sessions => sessions.length);
  
  if (totalSessions === 0) return 0;
  
  const bounces = sessionsWithSinglePageview.length > 0 ? sessionsWithSinglePageview[0].bounces : 0;
  return Math.round((bounces / totalSessions) * 100);
}

/**
 * Calculate average session duration
 * @param {string} siteId - Site ID
 * @param {Object} timeRange - Time range object
 * @returns {number} Average session duration in seconds
 */
async function calculateAverageSessionDuration(siteId, timeRange) {
  const sessionDurations = await Event.aggregate([
    { 
      $match: { 
        siteId,
        timestamp: { $gte: timeRange.start, $lte: timeRange.end }
      } 
    },
    {
      $sort: {
        sessionId: 1,
        timestamp: 1
      }
    },
    {
      $group: {
        _id: '$sessionId',
        firstTimestamp: { $first: '$timestamp' },
        lastTimestamp: { $last: '$timestamp' }
      }
    },
    {
      $project: {
        duration: { 
          $divide: [
            { $subtract: ['$lastTimestamp', '$firstTimestamp'] },
            1000
          ]
        }
      }
    },
    {
      $match: {
        duration: { $gt: 0 }
      }
    },
    {
      $group: {
        _id: null,
        totalDuration: { $sum: '$duration' },
        count: { $sum: 1 }
      }
    }
  ]);
  
  if (sessionDurations.length === 0) return 0;
  
  return Math.round(sessionDurations[0].totalDuration / sessionDurations[0].count);
}

/**
 * Get pageviews over time
 * @param {string} siteId - Site ID
 * @param {Object} timeRange - Time range object
 * @param {string} period - Time period (e.g., 1d, 7d, 30d)
 * @returns {Array} Array of pageview counts by date
 */
async function getPageviewsOverTime(siteId, timeRange, period) {
  let groupByFormat;
  let dateFormat;
  
  // Determine grouping format based on period
  if (period.endsWith('d') && parseInt(period, 10) <= 2) {
    // For 1-2 days, group by hour
    groupByFormat = {
      year: { $year: '$timestamp' },
      month: { $month: '$timestamp' },
      day: { $dayOfMonth: '$timestamp' },
      hour: { $hour: '$timestamp' }
    };
    dateFormat = '%Y-%m-%d %H:00';
  } else if (period.endsWith('d') && parseInt(period, 10) <= 31) {
    // For up to 31 days, group by day
    groupByFormat = {
      year: { $year: '$timestamp' },
      month: { $month: '$timestamp' },
      day: { $dayOfMonth: '$timestamp' }
    };
    dateFormat = '%Y-%m-%d';
  } else if (period.endsWith('m') && parseInt(period, 10) <= 3) {
    // For up to 3 months, group by day
    groupByFormat = {
      year: { $year: '$timestamp' },
      month: { $month: '$timestamp' },
      day: { $dayOfMonth: '$timestamp' }
    };
    dateFormat = '%Y-%m-%d';
  } else {
    // For longer periods, group by month
    groupByFormat = {
      year: { $year: '$timestamp' },
      month: { $month: '$timestamp' }
    };
    dateFormat = '%Y-%m';
  }
  
  return await Event.aggregate([
    { 
      $match: { 
        siteId,
        type: 'pageview',
        timestamp: { $gte: timeRange.start, $lte: timeRange.end }
      } 
    },
    {
      $group: {
        _id: groupByFormat,
        count: { $sum: 1 },
        visitors: { $addToSet: '$visitorId' }
      }
    },
    {
      $project: {
        _id: 0,
        date: {
          $dateFromParts: {
            year: '$_id.year',
            month: '$_id.month',
            day: '$_id.day',
            hour: '$_id.hour',
          }
        },
        views: '$count',
        visitors: { $size: '$visitors' }
      }
    },
    {
      $sort: { date: 1 }
    }
  ]);
}

/**
 * Categorize referrer into source type
 * @param {string} referrer - Referrer URL
 * @returns {string} Source category
 */
function categorizeReferrer(referrer) {
  if (!referrer) return 'direct';
  
  try {
    const url = new URL(referrer);
    const hostname = url.hostname.toLowerCase();
    
    // Social media
    if (hostname.includes('facebook.com') || 
        hostname.includes('twitter.com') ||
        hostname.includes('instagram.com') ||
        hostname.includes('linkedin.com') ||
        hostname.includes('pinterest.com') ||
        hostname.includes('reddit.com') ||
        hostname.includes('t.co')) {
      return 'social';
    }
    
    // Search engines
    if (hostname.includes('google.') || 
        hostname.includes('bing.com') ||
        hostname.includes('yahoo.com') ||
        hostname.includes('duckduckgo.com') ||
        hostname.includes('baidu.com') ||
        hostname.includes('yandex.ru')) {
      return 'search';
    }
    
    // Email providers
    if (hostname.includes('gmail.') || 
        hostname.includes('outlook.com') ||
        hostname.includes('mail.') ||
        hostname.includes('yahoo.')) {
      return 'email';
    }
    
    return 'other';
  } catch (e) {
    return 'unknown';
  }
}

/**
 * Convert data to CSV format
 * @param {Array} data - Array of objects to convert
 * @returns {string} CSV string
 */
function convertToCSV(data) {
  if (!data.length) return '';
  
  const headers = Object.keys(data[0]);
  const csvRows = [];
  
  // Add headers
  csvRows.push(headers.join(','));
  
  // Add data rows
  for (const row of data) {
    const values = headers.map(header => {
      const value = row[header];
      
      // Handle different value types
      if (value === null || value === undefined) {
        return '';
      } else if (typeof value === 'object') {
        return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
      } else {
        return `"${String(value).replace(/"/g, '""')}"`;
      }
    });
    
    csvRows.push(values.join(','));
  }
  
  return csvRows.join('\n');
} 