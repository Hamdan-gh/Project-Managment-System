# Quick Redeploy Guide for Render

## What Was Fixed

The "404 Not Found" error on page refresh was caused by the server not handling client-side routing. This has been fixed by:

1. Updated `server/server.js` to serve the built React app
2. Added a catch-all route that returns `index.html` for all non-API routes
3. Updated API configuration to use relative paths in production

## How to Redeploy

### Option 1: Automatic Deploy (Recommended)

1. Commit and push these changes to your GitHub repository:
   ```bash
   git add .
   git commit -m "Fix: Handle SPA routing for page refresh"
   git push
   ```

2. Render will automatically detect the changes and redeploy
3. Wait 5-10 minutes for the build to complete

### Option 2: Manual Deploy

1. Go to your Render dashboard: https://dashboard.render.com/
2. Select your web service
3. Click "Manual Deploy" → "Deploy latest commit"
4. Wait for the build to complete

## Verify the Fix

After deployment completes:

1. Visit your app URL: `https://your-app-name.onrender.com`
2. Navigate to any page (e.g., `/dashboard`, `/login`)
3. Refresh the page (F5 or Ctrl+R)
4. The page should load correctly without showing "Not Found"

## Build Settings (If Starting Fresh)

If you need to reconfigure your Render service:

- **Root Directory**: `server`
- **Build Command**: `npm install && cd .. && npm install && npm run build && cd server && npm install`
- **Start Command**: `node server.js`

## Troubleshooting

**Still getting 404:**
- Check Render logs to ensure build completed successfully
- Verify the `dist` folder was created during build
- Make sure the start command is `node server.js` (not `npm start`)

**API not working:**
- Check that all environment variables are set in Render dashboard
- Verify MongoDB connection string is correct
- Check server logs for any errors
