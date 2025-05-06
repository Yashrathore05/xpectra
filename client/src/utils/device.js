/**
 * Device detection utilities
 */

export function getDeviceInfo() {
  const userAgent = navigator.userAgent;
  const platform = navigator.platform;
  
  return {
    type: getDeviceType(userAgent, platform),
    os: getOperatingSystem(userAgent, platform),
    browser: getBrowser(userAgent),
  };
}

function getDeviceType(userAgent, platform) {
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  const isTablet = /iPad|Android(?!.*Mobile)/i.test(userAgent);
  
  if (isTablet) return 'tablet';
  if (isMobile) return 'mobile';
  return 'desktop';
}

function getOperatingSystem(userAgent, platform) {
  // Windows detection
  if (/Windows/i.test(userAgent)) {
    if (/Windows NT 10.0/i.test(userAgent)) return 'Windows 10';
    if (/Windows NT 6.3/i.test(userAgent)) return 'Windows 8.1';
    if (/Windows NT 6.2/i.test(userAgent)) return 'Windows 8';
    if (/Windows NT 6.1/i.test(userAgent)) return 'Windows 7';
    if (/Windows NT 6.0/i.test(userAgent)) return 'Windows Vista';
    if (/Windows NT 5.1/i.test(userAgent) || /Windows XP/i.test(userAgent)) return 'Windows XP';
    return 'Windows';
  }
  
  // macOS detection
  if (/Macintosh|Mac OS X/i.test(userAgent)) {
    if (/Mac OS X 10[._]15/i.test(userAgent)) return 'macOS Catalina';
    if (/Mac OS X 10[._]14/i.test(userAgent)) return 'macOS Mojave';
    if (/Mac OS X 10[._]13/i.test(userAgent)) return 'macOS High Sierra';
    if (/Mac OS X 10[._]12/i.test(userAgent)) return 'macOS Sierra';
    if (/Mac OS X 10[._]11/i.test(userAgent)) return 'macOS El Capitan';
    return 'macOS';
  }
  
  // iOS detection
  if (/iPhone|iPad|iPod/i.test(userAgent)) {
    if (/OS 14_/i.test(userAgent)) return 'iOS 14';
    if (/OS 13_/i.test(userAgent)) return 'iOS 13';
    if (/OS 12_/i.test(userAgent)) return 'iOS 12';
    return 'iOS';
  }
  
  // Android detection
  if (/Android/i.test(userAgent)) {
    const match = userAgent.match(/Android\s([0-9.]+)/i);
    return match ? `Android ${match[1]}` : 'Android';
  }
  
  // Linux detection
  if (/Linux/i.test(platform)) {
    if (/Ubuntu/i.test(userAgent)) return 'Ubuntu';
    if (/Fedora/i.test(userAgent)) return 'Fedora';
    if (/Debian/i.test(userAgent)) return 'Debian';
    return 'Linux';
  }
  
  return 'Unknown OS';
}

function getBrowser(userAgent) {
  // Edge detection (Chromium-based)
  if (/Edg/i.test(userAgent)) {
    return 'Microsoft Edge';
  }
  
  // Chrome detection
  if (/Chrome/i.test(userAgent) && !/Chromium|OPR|Edge/i.test(userAgent)) {
    return 'Chrome';
  }
  
  // Firefox detection
  if (/Firefox/i.test(userAgent)) {
    return 'Firefox';
  }
  
  // Safari detection
  if (/Safari/i.test(userAgent) && !/Chrome|Chromium|OPR|Edge/i.test(userAgent)) {
    return 'Safari';
  }
  
  // Opera detection
  if (/OPR|Opera/i.test(userAgent)) {
    return 'Opera';
  }
  
  // IE detection
  if (/MSIE|Trident/i.test(userAgent)) {
    return 'Internet Explorer';
  }
  
  return 'Unknown Browser';
} 