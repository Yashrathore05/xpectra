// Xpectra Analytics Tracker
// Version 1.0.0

(function() {
  // Configuration variables
  let apiKey = null;
  let trackingEndpoint = 'https://xpectra-api.vercel.app/track';
  
  // Get script attributes
  const scriptElement = document.currentScript;
  if (scriptElement) {
    apiKey = scriptElement.getAttribute('data-api-key');
  }

  // Check if API key is provided
  if (!apiKey) {
    console.error('Xpectra Analytics: API key is required');
    return;
  }

  // Device detection
  const getDeviceType = () => {
    const ua = navigator.userAgent;
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
      return 'tablet';
    }
    if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
      return 'mobile';
    }
    return 'desktop';
  };

  // Browser detection
  const getBrowser = () => {
    const ua = navigator.userAgent;
    let browserName = "Unknown";
    
    if (ua.indexOf("Firefox") > -1) {
      browserName = "Firefox";
    } else if (ua.indexOf("Opera") > -1 || ua.indexOf("OPR") > -1) {
      browserName = "Opera";
    } else if (ua.indexOf("Trident") > -1) {
      browserName = "Internet Explorer";
    } else if (ua.indexOf("Edge") > -1 || ua.indexOf("Edg") > -1) {
      browserName = "Edge";
    } else if (ua.indexOf("Chrome") > -1) {
      browserName = "Chrome";
    } else if (ua.indexOf("Safari") > -1) {
      browserName = "Safari";
    }
    
    return browserName;
  };

  // Get referrer info
  const getReferrer = () => {
    let referrer = document.referrer;
    
    // If no referrer, it's direct traffic
    if (!referrer) {
      return 'direct';
    }
    
    try {
      // Extract domain from referrer
      const referrerUrl = new URL(referrer);
      const currentUrl = new URL(window.location.href);
      
      // If referrer is from the same domain, it's internal traffic
      if (referrerUrl.hostname === currentUrl.hostname) {
        return 'internal';
      }
      
      return referrerUrl.hostname;
    } catch (e) {
      return 'unknown';
    }
  };

  // Generate visitor ID (or get from cookie)
  const getVisitorId = () => {
    let visitorId = localStorage.getItem('xpectra_visitor_id');
    
    if (!visitorId) {
      visitorId = 'v_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      localStorage.setItem('xpectra_visitor_id', visitorId);
    }
    
    return visitorId;
  };

  // Check if this is a new or returning visitor
  const isNewVisitor = () => {
    let isFirst = !localStorage.getItem('xpectra_returning');
    localStorage.setItem('xpectra_returning', 'true');
    return isFirst;
  };

  // Track pageview
  const trackPageview = () => {
    const visitorId = getVisitorId();
    const isNew = isNewVisitor();
    
    const data = {
      apiKey,
      event: 'pageview',
      url: window.location.href,
      path: window.location.pathname,
      title: document.title,
      referrer: getReferrer(),
      visitorId,
      isNewVisitor: isNew,
      timestamp: new Date().toISOString(),
      device: {
        type: getDeviceType(),
        browser: getBrowser(),
        screenSize: `${window.screen.width}x${window.screen.height}`,
        language: navigator.language || navigator.userLanguage
      }
    };

    // Send data
    sendData(data);
  };

  // Track custom event
  const trackEvent = (eventName, eventData = {}) => {
    const visitorId = getVisitorId();
    
    const data = {
      apiKey,
      event: eventName,
      url: window.location.href,
      path: window.location.pathname,
      visitorId,
      timestamp: new Date().toISOString(),
      data: eventData
    };

    // Send data
    sendData(data);
  };

  // Send data to server
  const sendData = (data) => {
    // Use Beacon API if available for better performance and to ensure data is sent even on page unload
    if (navigator.sendBeacon) {
      navigator.sendBeacon(trackingEndpoint, JSON.stringify(data));
    } else {
      // Fallback to fetch API
      fetch(trackingEndpoint, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json'
        },
        keepalive: true
      }).catch(err => {
        console.error('Xpectra Analytics: Failed to send data', err);
      });
    }
  };

  // Track session time
  let sessionStartTime = new Date();
  const trackSessionTime = () => {
    const currentTime = new Date();
    const sessionDurationSeconds = Math.floor((currentTime - sessionStartTime) / 1000);
    
    trackEvent('session_duration', { durationSeconds: sessionDurationSeconds });
  };

  // Initialize tracking
  const init = () => {
    // Track initial pageview
    trackPageview();
    
    // Track pageviews on navigation (for SPAs)
    if (typeof history !== 'undefined') {
      const pushState = history.pushState;
      history.pushState = function() {
        pushState.apply(this, arguments);
        trackPageview();
      };
      
      window.addEventListener('popstate', trackPageview);
    }
    
    // Track when user leaves page
    window.addEventListener('beforeunload', trackSessionTime);
  };

  // Expose public API
  window.xpectra = {
    trackEvent
  };

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})(); 