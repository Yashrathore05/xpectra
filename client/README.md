# Xpectra Tracker Client

This is the client-side component of Xpectra, a universal visitor tracking tool for web, mobile, and desktop platforms.

## Installation

### Option 1: Direct Script Include

Add the Xpectra tracker script to your website:

```html
<script src="https://yourserver.com/xpectra/xpectra.min.js"
        data-xpectra-endpoint="https://yourserver.com/api/track"
        data-xpectra-site-id="your-site-id"></script>
```

### Option 2: NPM Package

```bash
npm install xpectra-tracker
```

Then import and initialize:

```javascript
import XpectraTracker from 'xpectra-tracker';

const tracker = new XpectraTracker({
  endpoint: 'https://yourserver.com/api/track',
  siteId: 'your-site-id'
});
```

## Configuration Options

The Xpectra tracker accepts the following configuration options:

| Option | Description | Default |
|--------|-------------|---------|
| endpoint | API endpoint for tracking data | `/api/track` |
| siteId | Identifier for your website/app | Current hostname |
| trackClicks | Enable click tracking | `true` |
| trackScroll | Enable scroll depth tracking | `true` |
| sessionDuration | Session timeout in minutes | `30` |
| onDataCollected | Callback function when data is collected | `null` |

## Basic Usage

### Track Page Views

Page views are tracked automatically on initialization.

### Track Custom Events

```javascript
xpectra.trackEvent(category, action, label, value);

// Examples:
xpectra.trackEvent('user', 'signup', 'homepage form');
xpectra.trackEvent('product', 'view', 'sneakers', 99.99);
```

### Track Errors

```javascript
try {
  // Your code
} catch (error) {
  xpectra.trackError(error, 'checkout-process');
}
```

## Platform Integration

### Web Integration

See the script and NPM options above.

### Mobile App Integration (iOS/Android)

#### WebView Integration

1. Load the tracker in your WebView:

```javascript
// Android - in your WebView
webView.loadUrl("javascript:(function() {" +
  "var script = document.createElement('script');" +
  "script.src = 'https://yourserver.com/xpectra/xpectra.min.js';" +
  "script.setAttribute('data-xpectra-endpoint', 'https://yourserver.com/api/track');" +
  "script.setAttribute('data-xpectra-site-id', 'your-mobile-app');" +
  "document.head.appendChild(script);" +
"})()");
```

#### Native Bridge Integration

For native mobile apps, create a bridge to send data to your tracking server:

##### iOS Example (Swift)
```swift
class XpectraTracker {
    static let shared = XpectraTracker()
    let endpoint = "https://yourserver.com/api/track"
    
    func trackEvent(category: String, action: String, label: String? = nil, value: Any? = nil) {
        let data: [String: Any] = [
            "siteId": "your-ios-app",
            "timestamp": ISO8601DateFormatter().string(from: Date()),
            "type": "event",
            "category": category,
            "action": action,
            "label": label,
            "value": value,
            "deviceOS": UIDevice.current.systemVersion,
            "deviceType": UIDevice.current.model
            // Add other device info
        ]
        
        sendData(data)
    }
    
    private func sendData(_ data: [String: Any]) {
        guard let url = URL(string: endpoint) else { return }
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.addValue("application/json", forHTTPHeaderField: "Content-Type")
        
        do {
            request.httpBody = try JSONSerialization.data(withJSONObject: data)
            URLSession.shared.dataTask(with: request).resume()
        } catch {
            print("Error sending tracking data: \(error)")
        }
    }
}

// Usage:
XpectraTracker.shared.trackEvent(category: "screen", action: "view", label: "home")
```

##### Android Example (Kotlin)
```kotlin
object XpectraTracker {
    private const val ENDPOINT = "https://yourserver.com/api/track"
    
    fun trackEvent(context: Context, category: String, action: String, label: String? = null, value: Any? = null) {
        val data = JSONObject().apply {
            put("siteId", "your-android-app")
            put("timestamp", SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'", Locale.US).format(Date()))
            put("type", "event")
            put("category", category)
            put("action", action)
            put("label", label)
            put("value", value)
            put("deviceOS", "Android ${Build.VERSION.RELEASE}")
            put("deviceType", Build.MODEL)
            // Add other device info
        }
        
        sendData(context, data)
    }
    
    private fun sendData(context: Context, data: JSONObject) {
        val queue = Volley.newRequestQueue(context)
        val request = JsonObjectRequest(
            Request.Method.POST, ENDPOINT, data,
            { /* Success */ },
            { error -> Log.e("XpectraTracker", "Error sending tracking data: ${error.message}") }
        )
        queue.add(request)
    }
}

// Usage:
XpectraTracker.trackEvent(context, "screen", "view", "settings")
```

### Desktop Application Integration

#### Electron Apps

```javascript
// In your main process or preload script
const { app } = require('electron');
const fetch = require('node-fetch');

class XpectraTracker {
  constructor(options = {}) {
    this.endpoint = options.endpoint || 'https://yourserver.com/api/track';
    this.appId = options.appId || 'electron-app';
  }
  
  trackEvent(category, action, label = null, value = null) {
    const data = {
      siteId: this.appId,
      timestamp: new Date().toISOString(),
      type: 'event',
      category,
      action,
      label,
      value,
      deviceOS: process.platform,
      appVersion: app.getVersion()
      // Add other app/system info
    };
    
    this.sendData(data);
  }
  
  sendData(data) {
    fetch(this.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).catch(err => console.error('Tracking error:', err));
  }
}

// Create global instance
global.xpectraTracker = new XpectraTracker({
  endpoint: 'https://yourserver.com/api/track',
  appId: 'your-electron-app'
});

// Usage in renderer process:
// window.xpectraTracker.trackEvent('app', 'start', 'main-window');
```

## Advanced Usage

### Custom Data Attributes

You can use data attributes to automatically track elements:

```html
<button data-track="signup" data-track-action="click">Sign Up</button>
```

### Manual Page View Tracking

For single-page applications, track new page views manually:

```javascript
// When route changes
xpectra.trackPageView();
```

## Building from Source

```bash
# Install dependencies
npm install

# Build production version
npm run build

# Development mode
npm run dev
```

The built file will be in the `dist` directory. 