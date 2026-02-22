# Render Deployment Checklist

## Before You Deploy

### 1. Check Render Dashboard Settings

Go to your Render service settings and verify:

- [ ] **Root Directory** is EMPTY (not "server")
- [ ] **Build Command** is: `chmod +x build.sh && ./build.sh`
- [ ] **Start Command** is: `cd server && node server.js`

### 2. Check Environment Variables

Make sure these are set in Render:

- [ ] `MONGO_URI` - Your MongoDB Atlas connection string
- [ ] `JWT_SECRET` - Any secure random string
- [ ] `PORT` - Set to `10000`
- [ ] `NODE_ENV` - Set to `production`

### 3. Check MongoDB Atlas

- [ ] MongoDB Atlas allows connections from `0.0.0.0/0` (all IPs)
- [ ] Your connection string is correct
- [ ] Database user has read/write permissions

## Deploy Steps

1. **Commit all changes:**
   ```bash
   git add .
   git commit -m "Fix: SPA routing and build process"
   git push
   ```

2. **Watch Render logs** for these messages:
   - ✓ "Frontend built successfully"
   - ✓ "dist folder found, serving static files"
   - ✓ "MongoDB Atlas connected"
   - ✓ "Server running on port 10000"

3. **Wait for deployment** (5-10 minutes)

## After Deployment

### Test These:

- [ ] Homepage loads: `https://your-app.onrender.com/`
- [ ] Auth page loads: `https://your-app.onrender.com/auth`
- [ ] Refresh on /auth works (no 404)
- [ ] Login works (API connection)
- [ ] Navigate to dashboard after login
- [ ] Refresh on dashboard works

### If Something Fails:

1. **Check Render Logs:**
   - Go to your service in Render
   - Click "Logs" tab
   - Look for error messages

2. **Common Issues:**

   **"dist folder not found"**
   - Root Directory must be empty
   - Build command must run from root
   - Check build logs for npm errors

   **"MongoDB error"**
   - Check MONGO_URI is correct
   - Verify MongoDB Atlas network access
   - Check database user permissions

   **"404 on API calls"**
   - Check browser console for actual URL being called
   - Verify API routes are registered (check logs)
   - Make sure server started successfully

   **"Not Found" on page refresh**
   - Check if dist folder was created
   - Verify catch-all route is working
   - Look for "GET /auth" in server logs

## Quick Debug Commands

If you need to test locally:

```bash
# Build and test locally
npm install
npm run build
cd server
npm install
node server.js
```

Then visit http://localhost:5000

## Need Help?

Check these files:
- `FIX_SUMMARY.md` - Detailed explanation of changes
- `RENDER_REDEPLOY.md` - Step-by-step deployment guide
- `DEPLOYMENT.md` - Full deployment documentation
