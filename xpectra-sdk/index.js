/**
 * Xpectra Analytics SDK
 * A lightweight JavaScript library for tracking website analytics
 */

class XpectraAnalytics {
  constructor(config) {
    this.apiKey = config.apiKey;
    this.endpoint = config.endpoint || 'https://api.xpectra.com/collect';
    this.debug = config.debug || false;
    this.initialized = false;
    this.sessionId = this._generateSessionId();
    this.userAgent = navigator.userAgent;
    this.referrer = document.referrer;
    this.previousPage = null;
    this.scrollDepthMarkers = [25, 50, 75, 100];
    this.scrollDepthReached = new Set();
    this.startTime = new Date();
    this.eventQueue = [];
    this.flushInterval = null;
    
    // Initialize if all required parameters are present
    if (this.apiKey) {
      this._initialize();
    } else {
      this._log('Error: API key is required');
    }
  }

  _initialize() {
    // Track initial page view
    this._trackPageView();
    
    // Set up event listeners
    this._setupEventListeners();
    
    // Set up flush interval (send data every 10 seconds)
    this.flushInterval = setInterval(() => this._flushEvents(), 10000);
    
    this.initialized = true;
    this._log('Xpectra Analytics initialized');
  }
  
  _setupEventListeners() {
    // Track page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this._trackEvent('visibility_change', { state: 'hidden', timeSpent: this._getTimeOnPage() });
      } else if (document.visibilityState === 'visible') {
        this.startTime = new Date();
        this._trackEvent('visibility_change', { state: 'visible' });
      }
    });
    
    // Track page unload
    window.addEventListener('beforeunload', () => {
      this._trackEvent('page_exit', { timeSpent: this._getTimeOnPage() });
      this._flushEvents(true); // Synchronous flush on exit
    });
    
    // Track clicks
    document.addEventListener('click', (e) => {
      const target = e.target.tagName;
      const id = e.target.id;
      const className = e.target.className;
      
      this._trackEvent('click', {
        target,
        id,
        className,
        position: {
          x: e.clientX,
          y: e.clientY
        }
      });
    });
    
    // Track scroll depth
    window.addEventListener('scroll', this._debounce(() => {
      this._trackScrollDepth();
    }, 500));
  }
  
  // Public API methods
  
  /**
   * Track a custom event
   * @param {string} eventName - Name of the event
   * @param {Object} eventData - Data associated with the event
   */
  trackEvent(eventName, eventData) {
    if (!this.initialized) {
      this._log('Warning: SDK not initialized');
      return;
    }
    
    this._trackEvent(eventName, eventData);
  }
  
  /**
   * Track a user identity (when known)
   * @param {string} userId - User's unique identifier
   * @param {Object} traits - Additional user traits
   */
  identify(userId, traits = {}) {
    if (!this.initialized) {
      this._log('Warning: SDK not initialized');
      return;
    }
    
    this._trackEvent('identify', {
      userId,
      traits
    });
  }
  
  /**
   * Manually track a page view
   * @param {string} page - Optional page name override
   */
  trackPageView(page) {
    if (!this.initialized) {
      this._log('Warning: SDK not initialized');
      return;
    }
    
    this._trackPageView(page);
  }
  
  // Internal methods
  
  _trackPageView(pageName) {
    const currentPage = pageName || window.location.pathname;
    
    if (this.previousPage === currentPage) return;
    
    this._trackEvent('page_view', {
      page: currentPage,
      title: document.title,
      url: window.location.href,
      referrer: this.referrer
    });
    
    this.previousPage = currentPage;
    this.startTime = new Date();
    this.scrollDepthReached = new Set();
  }
  
  _trackScrollDepth() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const windowHeight = window.innerHeight;
    const documentHeight = Math.max(
      document.body.scrollHeight,
      document.body.offsetHeight,
      document.documentElement.clientHeight,
      document.documentElement.scrollHeight,
      document.documentElement.offsetHeight
    );
    
    if (documentHeight <= windowHeight) return;
    
    const scrollPercent = Math.floor((scrollTop / (documentHeight - windowHeight)) * 100);
    
    for (const marker of this.scrollDepthMarkers) {
      if (scrollPercent >= marker && !this.scrollDepthReached.has(marker)) {
        this.scrollDepthReached.add(marker);
        this._trackEvent('scroll_depth', { depth: marker });
      }
    }
  }
  
  _trackEvent(eventName, eventData = {}) {
    const event = {
      type: eventName,
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      device: this._getDeviceInfo(),
      ...eventData
    };
    
    this.eventQueue.push(event);
    this._log('Event tracked:', eventName, event);
    
    // If queue gets too large, flush immediately
    if (this.eventQueue.length >= 10) {
      this._flushEvents();
    }
  }
  
  _flushEvents(sync = false) {
    if (this.eventQueue.length === 0) return;
    
    const events = [...this.eventQueue];
    this.eventQueue = [];
    
    const payload = {
      apiKey: this.apiKey,
      url: window.location.href,
      userAgent: this.userAgent,
      language: navigator.language,
      screenSize: {
        width: window.screen.width,
        height: window.screen.height
      },
      events
    };
    
    if (sync) {
      // Synchronous request (for beforeunload)
      const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
      navigator.sendBeacon(this.endpoint, blob);
      this._log('Events flushed (beacon):', events.length);
    } else {
      // Asynchronous request
      fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload),
        keepalive: true
      })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        this._log('Events flushed successfully:', events.length);
      })
      .catch(error => {
        this._log('Error flushing events:', error);
        // Re-add events to queue on failure
        this.eventQueue = [...events, ...this.eventQueue];
      });
    }
  }
  
  _getDeviceInfo() {
    const ua = navigator.userAgent;
    let deviceType = 'unknown';
    
    if (/mobile/i.test(ua)) {
      deviceType = 'mobile';
    } else if (/tablet/i.test(ua) || /ipad/i.test(ua)) {
      deviceType = 'tablet';
    } else if (/windows|macintosh|linux/i.test(ua)) {
      deviceType = 'desktop';
    }
    
    return {
      type: deviceType,
      browser: this._detectBrowser(),
      os: this._detectOS()
    };
  }
  
  _detectBrowser() {
    const ua = navigator.userAgent;
    
    if (ua.includes('Firefox/')) return 'Firefox';
    if (ua.includes('Edge/') || ua.includes('Edg/')) return 'Edge';
    if (ua.includes('Chrome/') && !ua.includes('Chromium/')) return 'Chrome';
    if (ua.includes('Safari/') && !ua.includes('Chrome/')) return 'Safari';
    if (ua.includes('MSIE ') || ua.includes('Trident/')) return 'Internet Explorer';
    
    return 'Unknown';
  }
  
  _detectOS() {
    const ua = navigator.userAgent;
    
    if (ua.includes('Windows')) return 'Windows';
    if (ua.includes('Mac OS X')) return 'macOS';
    if (ua.includes('Linux')) return 'Linux';
    if (ua.includes('Android')) return 'Android';
    if (ua.includes('iOS') || ua.includes('iPhone') || ua.includes('iPad')) return 'iOS';
    
    return 'Unknown';
  }
  
  _getTimeOnPage() {
    return Math.round((new Date() - this.startTime) / 1000);
  }
  
  _generateSessionId() {
    // Check if we have a stored session that's less than 30 minutes old
    const storedSession = localStorage.getItem('xpectra_session');
    if (storedSession) {
      try {
        const session = JSON.parse(storedSession);
        const lastActivity = new Date(session.lastActivity);
        const now = new Date();
        
        // If session is less than 30 minutes old, reuse it
        if ((now - lastActivity) < 30 * 60 * 1000) {
          // Update last activity and return existing session ID
          session.lastActivity = now.toISOString();
          localStorage.setItem('xpectra_session', JSON.stringify(session));
          return session.id;
        }
      } catch (e) {
        // Invalid session data, create a new one
      }
    }
    
    // Create new session ID (timestamp + random string)
    const sessionId = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
    localStorage.setItem('xpectra_session', JSON.stringify({
      id: sessionId,
      lastActivity: new Date().toISOString()
    }));
    
    return sessionId;
  }
  
  _debounce(func, delay) {
    let timeout;
    return function() {
      const context = this;
      const args = arguments;
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(context, args), delay);
    };
  }
  
  _log(...args) {
    if (this.debug) {
      console.log('[Xpectra]', ...args);
    }
  }
}

// Export for webpack/ES modules
export default XpectraAnalytics;

// Legacy browser support
if (typeof window !== 'undefined') {
  window.XpectraAnalytics = XpectraAnalytics;
} 