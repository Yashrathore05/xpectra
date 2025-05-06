/**
 * Analytics Routes
 * Endpoints for retrieving analytics data for dashboard
 */

const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { authenticateJWT, checkSiteAccess } = require('../middlewares/auth');

// All analytics routes require authentication
router.use(authenticateJWT);

// GET /api/analytics/overview/:siteId - Get site overview
router.get('/overview/:siteId', checkSiteAccess, analyticsController.getOverview);

// GET /api/analytics/realtime/:siteId - Get realtime stats
router.get('/realtime/:siteId', checkSiteAccess, analyticsController.getRealtime);

// GET /api/analytics/pageviews/:siteId - Get pageview stats
router.get('/pageviews/:siteId', checkSiteAccess, analyticsController.getPageviews);

// GET /api/analytics/referrers/:siteId - Get referrer stats
router.get('/referrers/:siteId', checkSiteAccess, analyticsController.getReferrers);

// GET /api/analytics/locations/:siteId - Get location stats
router.get('/locations/:siteId', checkSiteAccess, analyticsController.getLocations);

// GET /api/analytics/devices/:siteId - Get device stats
router.get('/devices/:siteId', checkSiteAccess, analyticsController.getDevices);

// GET /api/analytics/browsers/:siteId - Get browser stats
router.get('/browsers/:siteId', checkSiteAccess, analyticsController.getBrowsers);

// GET /api/analytics/events/:siteId - Get custom event stats
router.get('/events/:siteId', checkSiteAccess, analyticsController.getEvents);

// GET /api/analytics/visitors/:siteId - Get visitor stats
router.get('/visitors/:siteId', checkSiteAccess, analyticsController.getVisitors);

// GET /api/analytics/sessions/:siteId - Get session stats
router.get('/sessions/:siteId', checkSiteAccess, analyticsController.getSessions);

// GET /api/analytics/export/:siteId - Export data
router.get('/export/:siteId', checkSiteAccess, analyticsController.exportData);

// POST /api/analytics/custom/:siteId - Custom query
router.post('/custom/:siteId', checkSiteAccess, analyticsController.customQuery);

module.exports = router; 