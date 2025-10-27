# 🚨 URGENT: Fix API Calls on Netlify

## Problem
API calls are going to `vastraprojectt.netlify.app` instead of `vastra-project.onrender.com`

## Root Cause
Environment variables are not set in Netlify dashboard. The `.env` file in your repo is only for local development.

## ✅ Solution

### Option 1: Via Netlify Dashboard (Recommended)

1. Go to: https://app.netlify.com
2. Select your site: **vastraprojectt**
3. Go to: **Site settings** → **Environment variables**
4. Click: **Add a variable**
5. Add these variables:

   ```
   REACT_APP_API_URL = https://vastra-project.onrender.com
   CI = false
   REACT_APP_ENV = production
   ```

6. Go to: **Deploys** tab
7. Click: **Trigger deploy** → **Deploy site**
8. Wait for deployment to complete

### Option 2: Via Netlify CLI

If you have Netlify CLI installed:

```bash
# Install Netlify CLI (if not installed)
npm install -g netlify-cli

# Login
netlify login

# Set environment variables
netlify env:set REACT_APP_API_URL https://vastra-project.onrender.com
netlify env:set CI false
netlify env:set REACT_APP_ENV production

# Trigger a new build
netlify deploy --prod --build
```

## Verification

After deployment completes:

1. **Open your site**: https://vastraprojectt.netlify.app
2. **Open browser DevTools** (F12)
3. **Go to Network tab**
4. **Try to login or navigate**
5. **Check that API calls go to**: `https://vastra-project.onrender.com/api/...`

## Still Not Working?

If API calls still go to the wrong URL:

1. **Clear Netlify cache:**
   - In Netlify dashboard: **Site settings** → **Build & deploy** → **Clear cache and deploy site**

2. **Check build logs:**
   - Look for: `REACT_APP_API_URL` in the build environment
   - Should show: `https://vastra-project.onrender.com`

3. **Verify environment variables:**
   ```bash
   netlify env:list
   ```

## How Environment Variables Work in React

- **Local Development**: Uses `.env` file
- **Netlify Production**: Uses environment variables from Netlify dashboard
- Variables must start with `REACT_APP_` to be accessible in React
- They are embedded at **build time**, not runtime
- Changing them requires a **new build/deploy**

## Quick Test

You can verify the environment variable is being used by adding this temporarily to your code:

```javascript
// In any component
console.log('API URL:', process.env.REACT_APP_API_URL);
```

This should log: `https://vastra-project.onrender.com` in production.
