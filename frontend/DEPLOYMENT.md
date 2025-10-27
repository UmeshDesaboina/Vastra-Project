# Deployment Configuration

## Overview
- **Frontend URL**: https://vastrastore.netlify.app/
- **Backend URL**: https://vastra-project.onrender.com

## Netlify Deployment Setup

### 1. Environment Variables in Netlify

Go to your Netlify dashboard → Site settings → Environment variables and add:

```
REACT_APP_API_URL=https://vastra-project.onrender.com
REACT_APP_ENV=production
CI=false
```

### 2. Build Settings

Make sure your build settings in Netlify are:
- **Base directory**: `frontend` (if deploying from monorepo) or leave empty
- **Build command**: `npm run build`
- **Publish directory**: `build`

### 3. Deploy

Push your changes to your git repository, and Netlify will automatically deploy.

Or manually deploy via CLI:
```bash
netlify deploy --prod
```

## Local Development

For local development, create a `.env.local` file (not committed to git):

```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_ENV=development
```

Then run:
```bash
npm start
```

## Backend CORS Configuration

Make sure your backend (Render) allows requests from your Netlify domain. In your backend, add:

```javascript
// backend/server.js or equivalent
const cors = require('cors');

const allowedOrigins = [
  'https://vastrastore.netlify.app',
  'http://localhost:3000', // for local development
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
```

## Troubleshooting

### API calls failing
1. Check that `REACT_APP_API_URL` is set in Netlify environment variables
2. Verify backend is running on Render: https://vastra-project.onrender.com
3. Check browser console for CORS errors
4. Ensure all API routes start with `/api/`

### Build failing on Netlify
1. Set `CI=false` in environment variables to treat warnings as non-fatal
2. Check build logs for specific errors
3. Ensure all dependencies are in `package.json`

### 404 errors on page refresh
This should be handled by `netlify.toml` redirects. Make sure the file exists with:
```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

## Using the Axios Config (Optional)

If you want to use the centralized axios configuration instead of importing axios directly:

```javascript
// Instead of:
import axios from 'axios';

// Use:
import axios from '../config/axiosConfig';

// Then use axios normally:
const response = await axios.get('/api/products');
```

The axios config automatically includes the `REACT_APP_API_URL` as the base URL.
