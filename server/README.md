# Xpectra Server

This is the server-side component of Xpectra, a universal visitor tracking tool for web, mobile, and desktop platforms.

## Features

- RESTful API for collecting tracking data
- MongoDB database for storing analytics data
- User authentication and dashboard access control
- Geolocation detection for visitor IP addresses
- Real-time analytics processing
- Data export capabilities
- Privacy-friendly configuration options

## Requirements

- Node.js 14+
- MongoDB 4.4+
- npm or yarn

## Installation

1. Clone the repository
2. Install dependencies:

```bash
cd server
npm install
```

3. Copy the example environment file and configure your environment:

```bash
cp env.example .env
```

4. Edit the `.env` file with your specific configuration

## Configuration

The following environment variables can be configured in your `.env` file:

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 3000 |
| NODE_ENV | Environment (development, production) | development |
| MONGODB_URI | MongoDB connection string | mongodb://localhost:27017/xpectra |
| CORS_ORIGIN | CORS origin setting | * |
| JWT_SECRET | Secret for JWT tokens | your-secret-key |
| JWT_EXPIRES_IN | JWT token expiration | 24h |
| RATE_LIMIT_WINDOW_MS | Rate limiting window in ms | 60000 |
| RATE_LIMIT_MAX | Max requests per window | 100 |
| API_KEY_ENABLED | Whether API key auth is enabled | false |
| API_KEY | Global API key for private tracking | |
| LOG_LEVEL | Logging level | info |

## Running the Server

```bash
# Development mode
npm run dev

# Production mode
npm start
```

## API Endpoints

### Tracking API

- `POST /api/track` - Send tracking data
- `POST /api/track/bulk` - Send bulk tracking data
- `POST /api/track/private` - Private tracking (requires API key)
- `GET /api/track/pixel.gif` - Tracking pixel for email tracking

### Analytics API

- `GET /api/analytics/overview/:siteId` - Site overview
- `GET /api/analytics/realtime/:siteId` - Realtime stats
- `GET /api/analytics/pageviews/:siteId` - Pageview stats
- `GET /api/analytics/referrers/:siteId` - Referrer stats
- `GET /api/analytics/locations/:siteId` - Location stats
- `GET /api/analytics/devices/:siteId` - Device stats
- `GET /api/analytics/browsers/:siteId` - Browser stats
- `GET /api/analytics/events/:siteId` - Custom event stats
- `GET /api/analytics/visitors/:siteId` - Visitor stats
- `GET /api/analytics/sessions/:siteId` - Session stats
- `GET /api/analytics/export/:siteId` - Export data
- `POST /api/analytics/custom/:siteId` - Custom query

### Authentication API

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh-token` - Refresh JWT token
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token
- `GET /api/auth/me` - Get current user info
- `PUT /api/auth/me` - Update current user info
- `PUT /api/auth/change-password` - Change password

## Data Models

### Event

The core data model that stores all tracking events:

- `siteId` - Identifier for the website/app
- `type` - Event type (pageview, event, error, exit)
- `timestamp` - When the event occurred
- `visitorId` - Unique visitor identifier
- `sessionId` - Session identifier
- Various metadata (URL, referrer, device info, location, etc.)

### User

Stores dashboard user accounts:

- `email` - User email (unique)
- `name` - User name
- `passwordHash` - Hashed password
- `role` - User role (admin, user, readonly)

### Site

Represents a tracked website, mobile app, or desktop app:

- `siteId` - Site identifier used in tracking
- `name` - Human-readable site name
- `url` - Site URL or app name
- `apiKey` - Private API key for tracking
- Settings, team access, and statistics

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT 