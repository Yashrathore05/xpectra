# Xpectra Analytics SDK

A lightweight JavaScript SDK for tracking website analytics including page views, user engagement, and custom events.

## Features

- 📊 Page view tracking
- 👤 User identification
- 📱 Device and browser detection
- ⏱️ Time on page measurement
- 📜 Scroll depth tracking
- 🖱️ Click tracking
- 📝 Custom event tracking
- 🔄 Session management
- 📶 Offline event queueing

## Installation

### NPM

```bash
npm install xpectra-sdk
```

### CDN

```html
<script src="https://cdn.xpectra.com/sdk/latest/xpectra.min.js"></script>
```

### Self-hosted

Download the `xpectra.min.js` file from the `dist` folder and include it in your project:

```html
<script src="/path/to/xpectra.min.js"></script>
```

## Quick Start

```html
<!-- Include the SDK -->
<script src="https://cdn.xpectra.com/sdk/latest/xpectra.min.js"></script>

<script>
// Initialize the SDK with your API key
const analytics = new XpectraAnalytics({
    apiKey: 'YOUR_API_KEY',
    debug: false
});

// Track a custom event
analytics.trackEvent('button_click', {
    buttonId: 'signup',
    buttonText: 'Sign Up Now'
});

// Identify a user
analytics.identify('user123', {
    email: 'user@example.com',
    plan: 'premium'
});
</script>
```

## Configuration Options

| Option | Type | Description | Default |
|--------|------|-------------|---------|
| `apiKey` | String | **Required**. Your Xpectra API key | - |
| `endpoint` | String | Custom data collection endpoint | `https://api.xpectra.com/collect` |
| `debug` | Boolean | Enable debug logging | `false` |

## API Reference

### Core Methods

#### `trackEvent(eventName, eventData)`

Track a custom event with associated data.

```javascript
analytics.trackEvent('product_view', {
    productId: '12345',
    productName: 'Wireless Headphones',
    price: 99.99
});
```

#### `identify(userId, traits)`

Associate the current user with a unique ID and additional traits.

```javascript
analytics.identify('user-123', {
    name: 'John Doe',
    email: 'john@example.com',
    plan: 'premium',
    signupDate: '2023-01-15'
});
```

#### `trackPageView(page)`

Manually track a page view (automatically called on initialization).

```javascript
// You can override the page name
analytics.trackPageView('/custom-path');
```

## Automatically Tracked Events

The SDK automatically tracks the following events:

- **Page Views**: When a user loads a page
- **Clicks**: When a user clicks on elements
- **Scroll Depth**: When a user scrolls to 25%, 50%, 75%, or 100% of the page
- **Time on Page**: Tracked when the user leaves the page
- **Visibility Changes**: When the page becomes visible/hidden (tab switching)

## Building from Source

1. Clone this repository
2. Install dependencies: `npm install`
3. Build the SDK: `npm run build`

The compiled files will be available in the `dist` directory.

## Example

See `example.html` for a complete working example of the SDK.

## License

MIT License 