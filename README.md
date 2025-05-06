# 🛰️ Xpectra — Universal Visitor Tracking Tool

A privacy-friendly visitor tracking solution for websites with Firebase integration and a React dashboard.

## Overview

Xpectra is a comprehensive analytics platform that allows website owners to:
- Track visitor engagement, pageviews, and user interactions
- Analyze traffic sources and user behavior
- Visualize data through an intuitive dashboard
- Implement custom event tracking

## Architecture

Xpectra consists of three main components:

1. **Client Tracker**: JavaScript library that collects visitor data
2. **Firebase Backend**: Handles data storage and analytics processing
3. **React Dashboard**: Visualizes analytics data for site owners

## Getting Started

### For Website Owners

#### 1. Create an Account
1. Visit the Xpectra dashboard at `https://xpectra-dashboard.vercel.app`
2. Click "Register" and create an account with your email and password
3. Verify your email address if required

#### 2. Add Your Website
1. Log in to your Xpectra dashboard
2. Click "Add Site" button in the dashboard
3. Enter your website details:
   - Site name
   - Domain
   - Allowed origins (optional for cross-domain tracking)
4. Save to generate your unique API key

#### 3. Install the Tracking Script
Add this script to your website's HTML, preferably before the closing `</body>` tag:

```html
<script src="https://xpectra-api.vercel.app/tracker.js" data-api-key="YOUR_API_KEY"></script>
```

Replace `YOUR_API_KEY` with the API key generated for your site.

#### 4. Start Tracking (No Further Configuration Needed)
The script automatically tracks:
- Pageviews
- Visitor information (device, browser, screen size)
- Referrers
- Session duration
- Basic user interactions

#### 5. Track Custom Events (Optional)
For more detailed analytics, you can track custom events:

```javascript
// Basic event tracking
window.xpectra.trackEvent('signup', { plan: 'premium' });

// E-commerce tracking example
window.xpectra.trackEvent('purchase', {
  productId: '12345',
  price: 49.99,
  currency: 'USD',
  category: 'Electronics'
});
```

### Viewing Your Analytics

1. Log in to your Xpectra dashboard
2. Select your website from the site selector dropdown
3. View analytics data in the main dashboard:
   - Visitor Overview: total, new, and returning visitors
   - Pageview Statistics: views, average time on page, bounce rate
   - Visitor Timeline: traffic patterns over time
   - Top Pages: most visited content
   - Referrers: traffic sources
   - Device Distribution: browser and device types
   - Geographic Data: visitor locations

4. Use the time period selector to filter data by:
   - Today
   - Yesterday  
   - Last 7 days
   - Last 30 days
   - This month
   - Last month
   - Custom date range

## Advanced Usage

### Data Attributes for Enhanced Tracking
Add `data-track` attributes to important elements for better tracking labels:

```html
<button data-track="signup-button" data-track-action="click">
  Sign Up
</button>
```

### Site Management
- **Multiple Sites**: Track multiple websites from a single dashboard
- **API Key Management**: Regenerate API keys if needed for security
- **Access Control**: Invite team members with different permission levels (coming soon)

### Custom Integration
For deeper integration or custom implementations, you can use the Xpectra client as an importable library:

```javascript
import XpectraTracker from 'xpectra-tracker';

const tracker = new XpectraTracker({
  endpoint: 'https://xpectra-api.vercel.app/track',
  siteId: 'YOUR_SITE_ID',
  // Additional configuration options
  trackClicks: true,
  trackScroll: true,
  sessionDuration: 30 // minutes
});

// Use the tracker instance
tracker.trackEvent('custom-event', { data: 'value' });
```

## Self-Hosting (For Developers)

### Prerequisites
- Node.js v14 or higher
- Firebase account
- Vercel account (recommended for hosting)

### Setup Process
1. Clone the repository
2. Configure Firebase credentials
3. Deploy the server to Vercel
4. Deploy the dashboard to Vercel
5. Host the client tracking script on your server or CDN

See detailed development setup in the `/client`, `/server`, and `/dashboard` directories.

## Privacy Considerations

Xpectra is designed with privacy in mind:
- No cookies required (uses localStorage)
- Minimal personal data collection
- No cross-site tracking
- Compliant with major privacy regulations (with proper configuration)

## Support and Feedback

For issues, feature requests, or contributions, please:
- Create an issue on GitHub
- Contact support at info@immersivex.in 