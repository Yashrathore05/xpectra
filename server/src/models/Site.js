/**
 * Site Model
 * Represents a tracked website, mobile app, or desktop app
 */

const mongoose = require('mongoose');
const crypto = require('crypto');

const SiteSchema = new mongoose.Schema({
  // Site identifier (used in tracker)
  siteId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true
  },
  
  // Human-readable name
  name: {
    type: String,
    required: true,
    trim: true
  },
  
  // Site URL or app name
  url: {
    type: String,
    trim: true
  },
  
  // Site type
  type: {
    type: String,
    enum: ['website', 'mobile-app', 'desktop-app'],
    default: 'website'
  },
  
  // API key for private tracking
  apiKey: {
    type: String,
    default: () => crypto.randomBytes(32).toString('hex')
  },
  
  // Site settings
  settings: {
    // Data retention period in days (0 = indefinite)
    dataRetentionDays: {
      type: Number,
      default: 730 // 2 years
    },
    
    // Privacy settings
    privacy: {
      maskIPs: {
        type: Boolean,
        default: true
      },
      respectDoNotTrack: {
        type: Boolean,
        default: true
      },
      collectUserAgent: {
        type: Boolean,
        default: true
      }
    },
    
    // Custom tracking domains (for proxy setups)
    customDomains: [String],
    
    // Custom dashboard appearance
    dashboardTheme: {
      type: String,
      enum: ['default', 'dark', 'light', 'custom'],
      default: 'default'
    },
    customColors: {
      primary: String,
      secondary: String,
      accent: String
    }
  },
  
  // Site owner (reference to user)
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Team members with access
  team: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['owner', 'admin', 'editor', 'viewer'],
      default: 'viewer'
    }
  }],
  
  // Stats summary (updated periodically)
  stats: {
    totalPageviews: {
      type: Number,
      default: 0
    },
    totalVisitors: {
      type: Number,
      default: 0
    },
    totalSessions: {
      type: Number,
      default: 0
    },
    totalEvents: {
      type: Number,
      default: 0
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },
  
  // Activity status
  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Create compound index for queries
SiteSchema.index({ owner: 1, active: 1 });

// Regenerate API key method
SiteSchema.methods.regenerateApiKey = function() {
  this.apiKey = crypto.randomBytes(32).toString('hex');
  return this.apiKey;
};

// Create the model
const Site = mongoose.model('Site', SiteSchema);

module.exports = Site; 