/**
 * Event Model
 * Stores tracking events such as pageviews, clicks, etc.
 */

const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  // Required fields
  siteId: {
    type: String,
    required: true,
    index: true
  },
  type: {
    type: String,
    required: true,
    enum: ['pageview', 'event', 'error', 'exit'],
    index: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  visitorId: {
    type: String,
    required: true,
    index: true
  },
  sessionId: {
    type: String,
    required: true,
    index: true
  },
  
  // Common tracking data
  url: String,
  path: String,
  referrer: String,
  title: String,
  
  // Event-specific data
  category: String,
  action: String,
  label: String,
  value: mongoose.Schema.Types.Mixed,
  
  // Error-specific data
  message: String,
  stack: String,
  source: String,
  
  // Time/engagement data
  timeOnPage: Number,
  timeSpent: Number,
  
  // Device & browser data
  userAgent: String,
  deviceType: String,
  deviceOS: String,
  deviceBrowser: String,
  screenWidth: Number,
  screenHeight: Number,
  viewportWidth: Number,
  viewportHeight: Number,
  language: String,
  
  // Location data (from IP)
  country: String,
  region: String,
  city: String,
  location: {
    type: {
      type: String,
      enum: ['Point'],
    },
    coordinates: {
      type: [Number],
    }
  },
  timezone: String,
  
  // IP address (hashed for privacy if needed)
  ip: String,
}, {
  timestamps: true,
  collection: 'events'
});

// Create indexes for common queries
EventSchema.index({ siteId: 1, type: 1, timestamp: -1 });
EventSchema.index({ siteId: 1, sessionId: 1, timestamp: -1 });
EventSchema.index({ siteId: 1, country: 1, timestamp: -1 });
EventSchema.index({ siteId: 1, deviceType: 1, timestamp: -1 });

// Add geospatial index for location-based queries
EventSchema.index({ location: '2dsphere' });

// Create the model
const Event = mongoose.model('Event', EventSchema);

module.exports = Event; 