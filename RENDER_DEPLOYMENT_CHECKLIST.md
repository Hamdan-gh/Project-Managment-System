# Render Deployment Checklist

## Critical Environment Variables on Render

Go to your Render dashboard → Your service → Environment tab and verify:

### 1. MONGO_URI
- **Status**: Must be set
- **Value**: Your MongoDB Atlas connection string
- **Example**: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/dbname`
- **How to get it**: 
  - Go to MongoDB Atlas
  - Click "Connect" on your cluster
  - Choose "Connect your application"
  - Copy the connection string
  - Replace `<password>` with your actual password
  - Add database name at the end

### 2. JWT_SECRET
- **Status**: Must be set
- **Value**: A strong random string (NOT "your_jwt_secret_key_here")
- **Generate one**: Run this in your terminal:
  ```bash
  node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
  ```
- **Example**: `a1b2c3d4e5f6...` (long random string)

### 3. NODE_ENV
- **Status**: Should be set to `production`
- **Value**: `production`

### 4. PORT
- **Status**: Should be set to `10000`
- **Value**: `10000`

### 5. VITE_API_URL
- **Status**: Should NOT be set (or be empty)
- **Why**: The frontend should use relative paths `/api` in production

## Deployment Steps

1. **Commit and push your latest changes**
   ```bash
   git add .
   git commit -m "Fix deployment configuration"
   git push
   ```

2. **Trigger manual deploy on Render**
   - Go to Render dashboard
   - Click "Manual Deploy" → "Deploy latest commit"

3. **Check the logs**
   - Watch the build logs for errors
   - Look for these success messages:
     - `✓ Frontend built successfully`
     - `✓ MongoDB Atlas connected successfully`
     - `Server running on port 10000`

4. **Test the deployment**
   - Visit your site: https://project-managment-system-cs.onrender.com
   - Try to login
   - Check browser console for errors (F12)

## Common Issues and Solutions

### Issue: "User not found" or "Invalid credentials"
**Cause**: No users in the database
**Solution**: Create an admin user using the createAdmin script:
```bash
# SSH into your Render service or run locally with production DB
cd server
node createAdmin.js
```

### Issue: "Server configuration error"
**Cause**: JWT_SECRET not set on Render
**Solution**: Add JWT_SECRET in Render environment variables

### Issue: 404 errors on API calls
**Cause**: VITE_API_URL is set incorrectly
**Solution**: Remove VITE_API_URL from Render environment variables

### Issue: MongoDB connection timeout
**Cause**: MongoDB Atlas IP whitelist
**Solution**: 
- Go to MongoDB Atlas → Network Access
- Add IP: `0.0.0.0/0` (allow all) for Render

## Verify Deployment

After deployment, check these URLs:

1. **Homepage**: https://project-managment-system-cs.onrender.com
   - Should show the login page

2. **API Test**: https://project-managment-system-cs.onrender.com/api/test
   - Should return: `{"message":"API is working","timestamp":"..."}`

3. **Root API**: https://project-managment-system-cs.onrender.com/
   - Should return: "FYP System API running"

## Debug Login Issues

If login still fails, check Render logs for these messages:

```
Login attempt: { identifier: 'xxx' }
Looking for user with email: xxx
User found: { id: 'xxx', email: 'xxx', role: 'xxx' }
Login successful for: xxx
```

If you see "User not found", you need to create users in the database.
