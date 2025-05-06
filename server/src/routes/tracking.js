/**
 * Tracking Routes
 * Endpoints for receiving tracking data from clients
 */

const express = require('express');
const router = express.Router();
const trackingController = require('../controllers/trackingController');
const { validateTrackingData } = require('../middlewares/validation');
const { checkApiKey } = require('../middlewares/auth');

// POST /api/track - Receive tracking data from clients
router.post('/', validateTrackingData, trackingController.trackEvent);

// POST /api/track/bulk - Receive bulk tracking data (for offline/batch tracking)
router.post('/bulk', validateTrackingData, trackingController.trackEvent);

// POST /api/track/private - Private tracking API (requires API key)
router.post('/private', checkApiKey, validateTrackingData, trackingController.trackEvent);

// GET /api/track/pixel.gif - Tracking pixel endpoint for email tracking or non-JS environments
router.get('/pixel.gif', trackingController.trackEvent);

module.exports = router; 