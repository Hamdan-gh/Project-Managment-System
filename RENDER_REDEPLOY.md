# Quick Redeploy Guide for Render

## Critical: Check Your Render Settings First

Before pushing code, verify these settings in your Render dashboard:

1. Go to https://dashboard.render.com/
2. Select your web service
3. Click "Settings" (left sidebar)
4. Verify these EXACT settings:

   - **Root Directory**: Leave EMPTY (do not set to "server")
   - **Build Command**: `chmod +x build.sh && ./build.sh`
   - **Start Command**: `cd server && node server.js`

5. Scroll down to "Environment Variables" and ensure these are set:
   - `MONGO_URI` - Your MongoDB connection string
   - `JWT_SECRET` - Any random string (e.g., "your-secret-key-123")
   - `PORT` - Set to `10000`
   - `NODE_ENV` - Set to `production`

6. Click "Save Changes" if you made any changes

## Deploy the Fix

1. **Commit and push these changes:**
   ```bash
   git add .
   git commit -m "Fix: SPA routing with build script"
   git push
   ```

2. **Render will automatically redeploy**
   - Watch the logs in Render dashboard
   - Look for these success messages:
     - "✓ Frontend built successfully"
     - "dist folder contents:"
     - "✓ dist folder found, serving static files"
     - "MongoDB Atlas connected"
     - "Server running on port 10000"

3. **Wait 5-10 minutes** for build to complete

## What Was Fixed

1. Created `build.sh` script that ensures frontend builds correctly
2. Server now properly serves the React app for all routes
3. Added logging to help debug issues
4. Fixed duplicate import error

## Test After Deploy

1. Visit your app URL: `https://your-app-name.onrender.com`
2. You should see the homepage
3. Click "Login" or go to `/auth`
4. Press F5 to refresh - should NOT show "Not Found"
5. Try logging in - API should work

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
