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

- **Root Directory**: Leave empty (use root of repository)
- **Build Command**: `npm install && npm run build && cd server && npm install`
- **Start Command**: `cd server && node server.js`
- **Environment Variables**: Make sure these are set:
  - `MONGO_URI` - Your MongoDB connection string
  - `JWT_SECRET` - Your JWT secret key
  - `PORT` - Set to `10000` (Render's default)
  - `NODE_ENV` - Set to `production`

## Troubleshooting

**Still getting 404 on /api/auth:**
- Check Render logs: Look for "✓ dist folder found" message
- Verify the build command completed successfully
- Check that the logs show "MongoDB Atlas connected"
- Look for the request logs showing `POST /api/auth/login`

**Build fails:**
- Check Render logs for specific error messages
- Ensure all dependencies are in `package.json`
- Verify Node version is compatible (16.x or higher)

**dist folder not found:**
- The build command must run from the root directory
- Make sure "Root Directory" in Render is empty (not set to `server`)
- Check build logs to see if `npm run build` completed successfully

**API not working:**
- Check that all environment variables are set in Render dashboard
- Verify MongoDB connection string is correct
- Check server logs for any errors
- Make sure JWT_SECRET is set

## Testing Locally

To test the production build locally before deploying:

```bash
# Build the frontend
npm install
npm run build

# Start the server
cd server
npm install
node server.js
```

Then visit http://localhost:5000 and test:
- Homepage loads
- Login works
- Page refresh doesn't show 404
- API calls work
