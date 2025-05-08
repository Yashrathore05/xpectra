/**
 * Xpectra Analytics Dashboard
 * Mock Data Generator
 * 
 * This module provides mock data for the dashboard when real data is not available or when testing.
 * It creates realistic-looking analytics data that can be used to demonstrate the dashboard functionality.
 */

// Mock data generator
const xpectraMockData = {
  // Generate mock visitor data for date range
  generateVisitorData: function(startDate, endDate) {
    const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    const pageViews = [];
    const visitors = [];
    let basePageViews = Math.floor(Math.random() * 500) + 200;
    let baseVisitors = Math.floor(basePageViews * 0.7);
    
    for (let i = 0; i < days; i++) {
      // Add some randomness to the data
      const randomFactor = 0.8 + (Math.random() * 0.4);
      const weekendFactor = isWeekend(new Date(startDate.getTime() + i * 86400000)) ? 0.8 : 1.2;
      
      // Calculate values
      const dayPageViews = Math.floor(basePageViews * randomFactor * weekendFactor);
      const dayVisitors = Math.floor(baseVisitors * randomFactor * weekendFactor);
      
      pageViews.push(dayPageViews);
      visitors.push(dayVisitors);
    }
    
    return {
      pageViews,
      visitors,
      labels: this.generateDateLabels(startDate, days)
    };
  },
  
  // Generate mock device distribution
  generateDeviceData: function() {
    // Generate random percentages that add up to 100%
    const desktop = Math.floor(Math.random() * 50) + 30; // 30-80%
    const mobile = Math.floor(Math.random() * (90 - desktop)) + 5; // 5-60%
    const tablet = 100 - desktop - mobile; // Whatever is left
    
    return [desktop, mobile, tablet];
  },
  
  // Generate mock peak hours data
  generateHourlyData: function() {
    const hourData = [];
    
    // Start with a base pattern that resembles realistic traffic
    const basePattern = [
      1, 0.5, 0.2, 0.1, 0.1, 0.2, // 12am - 6am (low traffic)
      0.5, 1, 2, 3, 3.5, 4,       // 6am - 12pm (increasing)
      4.5, 4.7, 4.5, 4.2, 4, 3.5, // 12pm - 6pm (peak)
      3, 2.5, 2, 1.5, 1.2, 1.1    // 6pm - 12am (decreasing)
    ];
    
    // Base visitor count
    const baseVisitors = Math.floor(Math.random() * 50) + 20;
    
    for (let i = 0; i < 24; i++) {
      // Add randomness to the pattern
      const randomFactor = 0.8 + (Math.random() * 0.4);
      hourData.push(Math.floor(baseVisitors * basePattern[i] * randomFactor));
    }
    
    return hourData;
  },
  
  // Generate mock scroll depth data
  generateScrollDepthData: function() {
    // Most users scroll at least a bit, fewer scroll all the way
    const quartile1 = Math.floor(Math.random() * 30) + 10; // 10-40 visitors
    const quartile2 = Math.floor(Math.random() * 40) + 20; // 20-60 visitors
    const quartile3 = Math.floor(Math.random() * 30) + 15; // 15-45 visitors
    const quartile4 = Math.floor(Math.random() * 20) + 5;  // 5-25 visitors
    
    return [quartile1, quartile2, quartile3, quartile4];
  },
  
  // Generate top pages data
  generateTopPagesData: function() {
    const pages = [
      { path: '/', title: 'Home Page' },
      { path: '/about', title: 'About Us' },
      { path: '/services', title: 'Our Services' },
      { path: '/blog', title: 'Blog' },
      { path: '/contact', title: 'Contact Us' },
      { path: '/products', title: 'Products' },
      { path: '/pricing', title: 'Pricing' },
      { path: '/blog/top-10-seo-tips', title: 'Top 10 SEO Tips for 2023' },
      { path: '/blog/website-redesign', title: 'How to Plan a Website Redesign' },
      { path: '/faq', title: 'Frequently Asked Questions' }
    ];
    
    const topPages = [];
    const usedIndexes = new Set();
    
    // Pick 5 random pages
    for (let i = 0; i < 5; i++) {
      let index;
      do {
        index = Math.floor(Math.random() * pages.length);
      } while (usedIndexes.has(index));
      
      usedIndexes.add(index);
      const page = pages[index];
      
      // Generate random stats for the page
      const views = Math.floor(Math.random() * 500) + 100;
      const avgTime = Math.floor(Math.random() * 180) + 30;
      const bounceRate = Math.floor(Math.random() * 40) + 20;
      
      topPages.push({
        path: page.path,
        title: page.title,
        views,
        avgTime,
        bounceRate
      });
    }
    
    // Sort by views (descending)
    return topPages.sort((a, b) => b.views - a.views);
  },
  
  // Generate traffic sources data
  generateTrafficSourcesData: function() {
    const sources = [
      { name: 'Direct', icon: 'fas fa-link' },
      { name: 'Google', icon: 'fab fa-google' },
      { name: 'Facebook', icon: 'fab fa-facebook' },
      { name: 'Twitter', icon: 'fab fa-twitter' },
      { name: 'Bing', icon: 'fas fa-search' },
      { name: 'LinkedIn', icon: 'fab fa-linkedin' },
      { name: 'Reddit', icon: 'fab fa-reddit' },
      { name: 'Email', icon: 'fas fa-envelope' }
    ];
    
    const trafficSources = [];
    const usedIndexes = new Set();
    
    // Pick random sources
    const numSources = Math.floor(Math.random() * 3) + 4; // 4-6 sources
    
    for (let i = 0; i < numSources; i++) {
      let index;
      do {
        index = Math.floor(Math.random() * sources.length);
      } while (usedIndexes.has(index));
      
      usedIndexes.add(index);
      const source = sources[index];
      
      // Generate random percentage for this source
      let percent;
      if (i === 0) {
        // First source (likely to be Direct or Google)
        percent = Math.floor(Math.random() * 30) + 30; // 30-60%
      } else if (i === numSources - 1) {
        // Last source (make sure percentages add up to 100%)
        let total = 0;
        trafficSources.forEach(s => total += s.percent);
        percent = 100 - total;
      } else {
        // Middle sources
        percent = Math.floor(Math.random() * 20) + 5; // 5-25%
      }
      
      trafficSources.push({
        name: source.name,
        icon: source.icon,
        percent
      });
    }
    
    // Sort by percentage (descending)
    return trafficSources.sort((a, b) => b.percent - a.percent);
  },
  
  // Helper: Generate date labels for charts
  generateDateLabels: function(startDate, numberOfDays) {
    const labels = [];
    const options = { month: 'short', day: 'numeric' };
    
    for (let i = 0; i < numberOfDays; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      labels.push(date.toLocaleDateString(undefined, options));
    }
    
    return labels;
  },
  
  // Generate user data
  generateUserData: function() {
    const firstNames = ['John', 'Sarah', 'Michael', 'Emma', 'David', 'Olivia', 'James', 'Sophia', 'William', 'Ava'];
    const lastNames = ['Smith', 'Johnson', 'Brown', 'Davis', 'Miller', 'Wilson', 'Moore', 'Taylor', 'Anderson', 'Thomas'];
    const domains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'icloud.com', 'protonmail.com'];
    
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const domain = domains[Math.floor(Math.random() * domains.length)];
    
    return {
      uid: `user_${Math.random().toString(36).substr(2, 9)}`,
      displayName: `${firstName} ${lastName}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${domain}`,
      photoURL: null,
      createdAt: new Date().toISOString()
    };
  },
  
  // Generate project data
  generateProjectData: function(userId) {
    const projectNames = [
      'My Website', 
      'Company Site', 
      'Blog Project', 
      'E-commerce Store', 
      'Portfolio Site'
    ];
    
    const name = projectNames[Math.floor(Math.random() * projectNames.length)];
    
    return {
      id: `project_${Math.random().toString(36).substr(2, 9)}`,
      name,
      userId,
      apiKey: this.generateApiKey(),
      createdAt: new Date().toISOString(),
      domain: `www.example${Math.floor(Math.random() * 1000)}.com`,
      description: `Analytics tracking for ${name}`
    };
  },
  
  // Generate API key
  generateApiKey: function() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const length = 32;
    let result = '';
    
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return result;
  }
};

// Helper function to check if a date is a weekend
function isWeekend(date) {
  const day = date.getDay();
  return day === 0 || day === 6; // 0 is Sunday, 6 is Saturday
}

// Export the mock data generator
window.xpectraMockData = xpectraMockData; 