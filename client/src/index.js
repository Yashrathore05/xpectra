/**
 * Xpectra - Universal Visitor Tracking Tool
 */

import { getDeviceInfo } from './utils/device';
import { generateUUID, getCookieValue, setCookie } from './utils/cookies';
import { sendBeacon, sendXHR } from './utils/network';

class XpectraTracker {
  constructor(options = {}) {
    this.config = {
      endpoint: options.endpoint || '/api/track',
      siteId: options.siteId || document.location.hostname,
      trackClicks: options.trackClicks !== false,
      trackScroll: options.trackScroll !== false,
      sessionDuration: options.sessionDuration || 30, // minutes
      ...options
    };

    this.sessionId = this.getOrCreateSessionId();
    this.visitorId = this.getOrCreateVisitorId();
    this.deviceInfo = getDeviceInfo();
    this.lastActivity = Date.now();
    
    this.init();
  }

  init() {
    // Track page view on initialization
    this.trackPageView();

    // Set up event listeners
    if (this.config.trackClicks) {
      document.addEventListener('click', this.handleClick.bind(this));
    }

    if (this.config.trackScroll) {
      window.addEventListener('scroll', this.debounce(this.handleScroll.bind(this), 500));
    }

    // Track user session activity
    document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
    window.addEventListener('beforeunload', this.handleBeforeUnload.bind(this));
    
    // Update activity timestamp
    ['mousedown', 'keydown', 'touchstart', 'scroll'].forEach(eventType => {
      document.addEventListener(eventType, () => {
        this.lastActivity = Date.now();
      });
    });

    // Session keepalive
    this.activityInterval = setInterval(() => {
      // If user has been inactive for the session duration, reset the session
      if (Date.now() - this.lastActivity > this.config.sessionDuration * 60 * 1000) {
        this.sessionId = generateUUID();
        setCookie('xpectra_session', this.sessionId, this.config.sessionDuration);
        this.trackEvent('session', 'restart');
      }
    }, 60 * 1000); // Check every minute
  }

  getOrCreateVisitorId() {
    let visitorId = getCookieValue('xpectra_visitor');
    if (!visitorId) {
      visitorId = generateUUID();
      // Set visitor cookie for 2 years
      setCookie('xpectra_visitor', visitorId, 2 * 365 * 24 * 60);
    }
    return visitorId;
  }

  getOrCreateSessionId() {
    let sessionId = getCookieValue('xpectra_session');
    if (!sessionId) {
      sessionId = generateUUID();
      setCookie('xpectra_session', sessionId, this.config.sessionDuration);
    }
    return sessionId;
  }

  trackPageView() {
    const data = this.prepareTrackingData({
      type: 'pageview',
      path: window.location.pathname,
      title: document.title,
      referrer: document.referrer
    });
    
    this.sendData(data);
  }

  trackEvent(category, action, label = null, value = null) {
    const data = this.prepareTrackingData({
      type: 'event',
      category,
      action,
      label,
      value
    });
    
    this.sendData(data);
  }

  trackError(error, source) {
    const data = this.prepareTrackingData({
      type: 'error',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : null,
      source
    });
    
    this.sendData(data);
  }

  prepareTrackingData(eventData) {
    return {
      siteId: this.config.siteId,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      sessionId: this.sessionId,
      visitorId: this.visitorId,
      userAgent: navigator.userAgent,
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      deviceType: this.deviceInfo.type,
      deviceOS: this.deviceInfo.os,
      deviceBrowser: this.deviceInfo.browser,
      language: navigator.language,
      timeOnPage: Math.floor((Date.now() - this.lastActivity) / 1000),
      ...eventData
    };
  }

  sendData(data) {
    // Try to use the Beacon API first (for reliability during page unload)
    if (!sendBeacon(this.config.endpoint, data)) {
      // Fall back to XHR if Beacon is not available
      sendXHR(this.config.endpoint, data);
    }

    // If a custom callback is provided, call it with the data
    if (typeof this.config.onDataCollected === 'function') {
      this.config.onDataCollected(data);
    }
  }

  handleClick(event) {
    // Get the clicked element
    const element = event.target;
    let targetElement = null;
    
    // Traverse up the DOM to find the nearest clickable element
    let currentElement = element;
    while (currentElement && !targetElement) {
      if (currentElement.tagName === 'A' || currentElement.tagName === 'BUTTON' ||
          currentElement.getAttribute('role') === 'button' || 
          currentElement.hasAttribute('data-track')) {
        targetElement = currentElement;
      } else {
        currentElement = currentElement.parentElement;
      }
    }

    if (!targetElement) return;

    // Prepare click data
    const clickData = {
      tagName: targetElement.tagName.toLowerCase(),
      id: targetElement.id || null,
      classes: targetElement.className || null,
      text: targetElement.innerText ? targetElement.innerText.substring(0, 100) : null,
      href: targetElement.href || null,
      dataTrack: targetElement.getAttribute('data-track') || null
    };

    this.trackEvent('click', targetElement.getAttribute('data-track-action') || 'click', 
                   JSON.stringify(clickData));
  }

  handleScroll() {
    const scrollDepth = Math.round(
      (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
    );

    // Track scroll depth at 25%, 50%, 75%, and 100%
    const milestone = Math.floor(scrollDepth / 25) * 25;
    
    if (milestone > 0 && (!this._lastTrackedScrollDepth || milestone > this._lastTrackedScrollDepth)) {
      this._lastTrackedScrollDepth = milestone;
      this.trackEvent('scroll', 'depth', String(milestone));
    }
  }

  handleVisibilityChange() {
    if (document.visibilityState === 'hidden') {
      // Page is hidden (user switched tabs or minimized window)
      const timeSpent = Math.floor((Date.now() - this.lastActivity) / 1000);
      this.trackEvent('visibility', 'hidden', null, timeSpent);
    } else {
      // Page is visible again
      this.lastActivity = Date.now();
      this.trackEvent('visibility', 'visible');
    }
  }

  handleBeforeUnload() {
    // Track page exit
    const timeSpent = Math.floor((Date.now() - this.lastActivity) / 1000);
    
    // Use sendBeacon for reliability during page unload
    const data = this.prepareTrackingData({
      type: 'exit',
      timeSpent
    });
    
    sendBeacon(this.config.endpoint, data);
  }

  debounce(func, wait) {
    let timeout;
    return function(...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }
}

// Create a global instance for sites that just include the script
if (typeof window !== 'undefined') {
  // Parse script data attributes for configuration
  const script = document.currentScript;
  const config = {};
  
  if (script) {
    Array.from(script.attributes).forEach(attr => {
      if (attr.name.startsWith('data-xpectra-')) {
        const key = attr.name.replace('data-xpectra-', '');
        config[key] = attr.value;
      }
    });
  }
  
  window._xpectraQueue = window._xpectraQueue || [];
  window.xpectra = new XpectraTracker(config);
  
  // Process any queued commands
  window._xpectraQueue.forEach(command => {
    const [method, ...args] = command;
    if (typeof window.xpectra[method] === 'function') {
      window.xpectra[method](...args);
    }
  });
  
  // Replace queue with direct calls to tracker
  window._xpectraQueue = {
    push: function(command) {
      const [method, ...args] = command;
      if (typeof window.xpectra[method] === 'function') {
        window.xpectra[method](...args);
      }
    }
  };
}

export default XpectraTracker; 