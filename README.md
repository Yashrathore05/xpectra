# Xpectra Analytics Platform

<div align="center">
  <img src="dashboard/assets/logo.png" alt="Xpectra Logo" width="150">
  <h3>Comprehensive Web Analytics for Modern Applications</h3>
  <p>Track, analyze, and optimize your web presence with powerful insights</p>
  
  [![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
  [![JavaScript](https://img.shields.io/badge/JavaScript-ES6-yellow.svg)](https://www.ecmascript6.com/)
  [![Firebase](https://img.shields.io/badge/Firebase-8.10.1-orange.svg)](https://firebase.google.com/)
  [![Chart.js](https://img.shields.io/badge/Chart.js-Latest-green.svg)](https://www.chartjs.org/)
</div>

## 📊 Overview

Xpectra Analytics is a comprehensive web analytics platform that helps you understand user behavior on your websites and applications. The platform consists of two main components:

- **Analytics Dashboard**: A beautiful, intuitive interface to visualize and analyze your data
- **JavaScript SDK**: A lightweight client-side library to track user interactions

## ✨ Features

- **Real-time Analytics**: Monitor user activity as it happens
- **User Identification**: Track individual user journeys across sessions
- **Device & Browser Detection**: Understand your audience's technology stack
- **Engagement Metrics**: Measure time on page, scroll depth, and click patterns
- **Custom Events**: Track specific interactions important to your business
- **Offline Support**: Queue events when users are offline for later transmission
- **Multiple Projects**: Manage analytics for multiple websites/applications
- **Responsive Dashboard**: Access insights from any device

## 🚀 Quick Start

### Dashboard Setup

1. Clone this repository
   ```bash
   git clone https://github.com/Yashrathore05/xpectra
   cd xpectra
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Configure Firebase
   - Create a Firebase project at [firebase.google.com](https://firebase.google.com)
   - Enable Authentication, Firestore, and Analytics
   - Add your Firebase configuration to the dashboard

4. Launch the dashboard
   ```bash
   cd dashboard
   # Serve using your preferred method, e.g., with a simple HTTP server
   python -m http.server 3000
   ```

5. Access the dashboard at `http://localhost:3000`

### Integrating the SDK

#### Using NPM

```bash
npm install xpectra-sdk
```

```javascript
import XpectraAnalytics from 'xpectra-sdk';

const analytics = new XpectraAnalytics({
    apiKey: 'YOUR_API_KEY',
    debug: false
});
```

#### Using CDN

```html
<script src="https://cdn.xpectra.com/sdk/latest/xpectra.min.js"></script>

<script>
    const analytics = new XpectraAnalytics({
        apiKey: 'YOUR_API_KEY',
        debug: false
    });
</script>
```

## 📖 Documentation

### SDK Methods

| Method | Description | Example |
|--------|-------------|---------|
| `trackEvent(name, data)` | Track a custom event | `analytics.trackEvent('signup', { plan: 'premium' })` |
| `identify(userId, traits)` | Identify a user | `analytics.identify('user123', { email: 'user@example.com' })` |
| `trackPageView(page)` | Track a page view | `analytics.trackPageView('/products')` |

### Automatically Tracked Events

The SDK automatically tracks:
- Page views
- Click events
- Scroll depth (25%, 50%, 75%, 100%)
- Time on page
- Tab visibility changes

### Dashboard Features

- **Project Management**: Create and manage multiple tracking projects
- **API Key Management**: Generate and rotate API keys for security
- **Custom Date Ranges**: Analyze data over specific time periods
- **Data Visualization**: Interactive charts and graphs
- **Export Capabilities**: Download reports in various formats

## 🛠️ Development

### Building the SDK

```bash
cd xpectra-sdk
npm install
npm run build
```

The compiled SDK will be available in the `xpectra-sdk/dist` directory.

### Customizing the Dashboard

The dashboard is built with vanilla JavaScript, HTML, and CSS, making it easy to customize:

- `dashboard/css/`: Styling files
- `dashboard/js/`: Application logic
- `dashboard/pages/`: Additional dashboard pages

## 🔒 Security

Xpectra Analytics is designed with security in mind:
- Data is transmitted securely over HTTPS
- API keys can be rotated regularly
- User authentication is handled via Firebase Auth
- Personal data is stored according to privacy best practices

## 📱 Browser Support

Xpectra Analytics supports all modern browsers:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Opera (latest)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📬 Contact

Have questions? Reach out to us:
- Website: [immersivex.in](https://immersivex.in)
- Email: info@immersivex.in

---

<div align="center">
  <sub>Built with ❤️ by the IMMERSIVE X team</sub>
</div> 
