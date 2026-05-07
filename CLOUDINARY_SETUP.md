# Cloudinary Setup Guide

## Why Cloudinary?

Render's free tier uses **ephemeral storage**, which means uploaded files are deleted when the server restarts or goes to sleep. Cloudinary provides **permanent cloud storage** for images, ensuring profile pictures persist forever.

## Setup Steps

### 1. Create a Free Cloudinary Account

1. Go to [https://cloudinary.com/users/register_free](https://cloudinary.com/users/register_free)
2. Sign up for a free account (no credit card required)
3. Verify your email address

### 2. Get Your Cloudinary Credentials

1. After logging in, go to your **Dashboard**
2. You'll see your credentials:
   - **Cloud Name**
   - **API Key**
   - **API Secret**

### 3. Update Environment Variables

#### **For Local Development:**

Update `server/.env`:
```env
PORT=5000
MONGO_URI=mongodb+srv://...
JWT_SECRET=your_jwt_secret_key_here

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here
```

#### **For Production (Render):**

1. Go to your Render Dashboard
2. Select your backend service
3. Go to **Environment** tab
4. Add these environment variables:
   - `CLOUDINARY_CLOUD_NAME` = your cloud name
   - `CLOUDINARY_API_KEY` = your API key
   - `CLOUDINARY_API_SECRET` = your API secret

### 4. Install Dependencies

```bash
cd server
npm install
```

This will install the `cloudinary` package.

### 5. Restart Your Backend

**Local:**
```bash
cd server
node server.js
```

**Production:**
Render will automatically redeploy when you push to GitHub.

## How It Works

### Before (Local Storage):
- ❌ Images saved to `server/uploads/avatars/`
- ❌ Files deleted when Render restarts
- ❌ Images disappear after logout

### After (Cloudinary):
- ✅ Images uploaded to Cloudinary cloud
- ✅ Permanent storage - never deleted
- ✅ Images persist forever
- ✅ Automatic image optimization
- ✅ Fast CDN delivery

## Features

- **Automatic Optimization**: Images are automatically compressed
- **Resizing**: Avatars are resized to 500x500px max
- **CDN Delivery**: Fast loading from Cloudinary's global CDN
- **Free Tier**: 25GB storage, 25GB bandwidth/month
- **Permanent Storage**: Images never disappear

## Testing

1. Upload a profile picture
2. Logout and wait a few minutes
3. Login again
4. Profile picture should still be there! ✅

## Cloudinary Dashboard

You can view all uploaded avatars in your Cloudinary dashboard:
1. Go to [https://cloudinary.com/console](https://cloudinary.com/console)
2. Click on **Media Library**
3. You'll see an `avatars` folder with all profile pictures

## Free Tier Limits

- **Storage**: 25 GB
- **Bandwidth**: 25 GB/month
- **Transformations**: 25,000/month
- **Images**: Unlimited

This is more than enough for a student project!

## Troubleshooting

### Issue: "Cloudinary configuration error"
**Solution**: Make sure all three environment variables are set correctly in `server/.env` or Render environment variables.

### Issue: Upload fails with 401 error
**Solution**: Check that your API Key and API Secret are correct. Copy them exactly from your Cloudinary dashboard.

### Issue: Old images still showing local paths
**Solution**: Old images will continue to use local storage. New uploads will use Cloudinary. Users can re-upload their profile pictures to migrate to Cloudinary.

## Migration Note

Existing profile pictures stored locally will continue to work until the server restarts. Users should re-upload their profile pictures to migrate to Cloudinary for permanent storage.
