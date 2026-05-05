# Voice Message Upload Fix

## Issue
Voice messages were not working on the deployed site (Render backend). Users would record audio but get an error when trying to send.

## Root Cause
1. **Relative path issue**: The multer storage was using relative paths (`'uploads/voice-messages'`) which may not work correctly on Render's file system
2. **Missing directory creation**: The uploads directory wasn't being created on server startup
3. **Insufficient logging**: No detailed logs to debug upload issues

## Solution Applied

### 1. Fixed Message Routes (`server/routes/messageRoutes.js`)
- ✅ Added ES module imports for `__dirname` equivalent
- ✅ Changed to absolute paths using `path.join(__dirname, '..', 'uploads', 'voice-messages')`
- ✅ Added dynamic file extension detection from MIME type
- ✅ Added comprehensive logging for debugging:
  - Upload path
  - File details (mimetype, filename)
  - Request body
  - Success/error messages

### 2. Enhanced Server Startup (`server/server.js`)
- ✅ Added automatic creation of all upload directories on server start:
  - `uploads/`
  - `uploads/voice-messages/`
  - `uploads/avatars/`
  - `uploads/chapters/`
- ✅ Logs directory creation for visibility

### 3. File Upload Flow
```
1. User records audio → Blob created
2. Frontend sends FormData with:
   - voice: audio blob
   - receiver: supervisor/student ID
   - duration: recording length
3. Backend multer processes:
   - Validates audio MIME type
   - Creates upload directory if needed
   - Saves with unique filename
4. Message created in MongoDB with voiceUrl
5. File served via /uploads/voice-messages/
```

## Testing After Deployment

### Backend (Render)
1. Wait 5-10 minutes for Render to redeploy
2. Check Render logs for:
   - "Creating directory: /path/to/uploads/voice-messages"
   - "Upload path: /path/to/uploads/voice-messages"
   - "Voice message created successfully: [message_id]"

### Frontend (Vercel)
1. Login at https://fyps-uds.vercel.app
2. Go to Messages page
3. Click microphone icon
4. Record a short message
5. Click send
6. Should see success toast
7. Voice message should appear in chat with play button

### Browser Console Logs
Look for:
- "Sending voice message: {blobSize, blobType, duration, receiverId}"
- "FormData created, sending request..."
- "Voice message sent successfully: [response]"

## Troubleshooting

### If still not working:

1. **Check Render Logs**:
   - Go to Render Dashboard → project-management-backend → Logs
   - Look for errors during voice upload

2. **Check Browser Console**:
   - Open DevTools → Console
   - Look for network errors or API errors

3. **Verify Environment Variables**:
   - Render: MONGO_URI, JWT_SECRET, NODE_ENV=production
   - Vercel: VITE_API_URL=https://project-managment-system-cxli.onrender.com/api

4. **Test API Directly**:
   ```bash
   curl https://project-managment-system-cxli.onrender.com/api/test
   ```

5. **Check File Permissions**:
   - Render should have write permissions to /uploads directory
   - If not, may need to configure persistent storage

## Additional Notes

- Voice messages are stored on Render's ephemeral file system
- Files may be lost on redeploy (consider using cloud storage like AWS S3 for production)
- Maximum file size: 10MB
- Supported formats: WebM, MP4, OGG, WAV
- Files are served via `/uploads/voice-messages/[filename]`

## Deployment Status

- ✅ Backend changes committed and pushed
- ✅ Render will auto-redeploy (5-10 minutes)
- ✅ Frontend already deployed on Vercel
- ⏳ Waiting for Render redeploy to complete

## Next Steps

1. Wait for Render redeploy
2. Test voice messaging feature
3. If issues persist, check Render logs
4. Consider implementing cloud storage (S3) for production
