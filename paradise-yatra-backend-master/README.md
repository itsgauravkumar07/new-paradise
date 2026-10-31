# Paradise Yatra Backend

## Environment Variables

Create a `.env` file in the backend directory with the following variables:

```env
# Database Configuration
MONGODB_URI=your_mongodb_connection_string_here

# Server Configuration
PORT=5000
NODE_ENV=development

# Client Configuration
CLIENT_ORIGIN=http://localhost:3000

# For production, set CLIENT_ORIGIN to your frontend domain
# CLIENT_ORIGIN=https://paradiseyatra.com
```

## Image URL Configuration

The backend now uses the `CLIENT_ORIGIN` environment variable to generate proper image URLs. This ensures that:

1. In development: Images use relative paths (`/uploads/filename.jpg`)
2. In production: Images use full URLs (`https://paradiseyatra.com/uploads/filename.jpg`)

## Running the Backend

1. Install dependencies: `npm install`
2. Set up environment variables
3. Start the server: `npm start` or `npm run dev`

## API Endpoints

- `/api/fixed-departures` - Fixed departure tours
- `/api/packages` - Tour packages
- `/api/destinations` - Destinations
- `/api/blogs` - Blog posts
- `/api/upload` - File uploads
- And more...
