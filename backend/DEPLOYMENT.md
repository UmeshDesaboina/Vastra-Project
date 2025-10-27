# Backend Deployment on Render

## Overview
Backend URL: https://vastra-project.onrender.com

## Environment Variables on Render

Go to your Render dashboard → Web Service → Environment and add:

```
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=vastra_store_secret_key_2025
NODE_ENV=production
FRONTEND_URL=https://vastrastore.netlify.app
```

**Important**: Make sure `FRONTEND_URL` matches your Netlify domain exactly (including https://)

## Build & Start Commands

In Render dashboard settings:

- **Build Command**: `npm install`
- **Start Command**: `node server.js` or `npm start`

## CORS Configuration

The backend is configured to accept requests from:
- https://vastrastore.netlify.app (production)
- http://localhost:3000 (local development)

If you need to add more origins, update `allowedOrigins` array in `server.js`:

```javascript
const allowedOrigins = [
  'https://vastrastore.netlify.app',
  'http://localhost:3000',
  // Add more origins here
];
```

## MongoDB Atlas Configuration

Make sure your MongoDB Atlas allows connections from Render:

1. Go to MongoDB Atlas → Network Access
2. Add IP: **0.0.0.0/0** (allows all IPs)
   - Or add Render's specific IPs if you want tighter security

## Testing the Backend

After deployment, test these endpoints:

```bash
# Check if API is running
curl https://vastra-project.onrender.com

# Check products endpoint
curl https://vastra-project.onrender.com/api/products

# Check categories endpoint
curl https://vastra-project.onrender.com/api/categories
```

## Troubleshooting

### CORS Errors
- Verify `FRONTEND_URL` environment variable matches your Netlify domain exactly
- Check Render logs for "CORS blocked origin:" messages
- Ensure frontend is using `https://` not `http://`

### Database Connection Issues
- Verify `MONGODB_URI` is correct in Render environment variables
- Check MongoDB Atlas network access settings
- Look for connection errors in Render logs

### 502 Bad Gateway
- Check if the app crashed (view Render logs)
- Verify all dependencies are in `package.json`
- Ensure PORT is not hardcoded (use `process.env.PORT`)

## Local Development

For local development:

```bash
cd backend
npm install
npm start
```

Make sure `.env` has:
```
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```
