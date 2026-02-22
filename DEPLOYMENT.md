# Deployment Guide - Render

## Full Stack Deployment (Frontend + Backend Together)

### Prerequisites
- GitHub repository with your code
- MongoDB Atlas database set up

### Steps to Deploy on Render

1. **Go to Render Dashboard**
   - Visit https://dashboard.render.com/
   - Click "New +" button
   - Select "Web Service"

2. **Connect Your Repository**
   - Connect your GitHub account if not already connected
   - Select your repository
   - Click "Connect"

3. **Configure Build Settings**
   - **Name**: Choose a name (e.g., `student-supervision-system`)
   - **Branch**: `main` (or your default branch)
   - **Root Directory**: Leave empty (use root of repository)
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build && cd server && npm install`
   - **Start Command**: `cd server && node server.js`

4. **Add Environment Variables**
   Click "Advanced" and add these environment variables:
   - **Key**: `MONGO_URI`
   - **Value**: Your MongoDB Atlas connection string
   - **Key**: `JWT_SECRET`
   - **Value**: Your JWT secret key
   - **Key**: `PORT`
   - **Value**: `5000`
   - **Key**: `NODE_ENV`
   - **Value**: `production`

5. **Deploy**
   - Click "Create Web Service"
   - Wait for the build to complete (5-10 minutes)
   - Your app will be live at: `https://your-app-name.onrender.com`

### Important Notes

- **Free Tier**: Web services on Render's free tier spin down after 15 minutes of inactivity
- **Custom Domain**: You can add a custom domain in the service settings
- **Auto-Deploy**: Render will automatically redeploy when you push to your branch
- **Build Time**: First build takes longer, subsequent builds are faster

### Troubleshooting

**Build Fails:**
- Check build logs in Render dashboard
- Ensure all dependencies are in both root and server `package.json`
- Verify Node version compatibility

**404 on Page Refresh:**
- This is now fixed! The server serves the React app and handles all routes
- Make sure the build completed successfully and `dist` folder was created

**API Connection Issues:**
- Verify all environment variables are set correctly
- Check MongoDB Atlas allows connections from anywhere (0.0.0.0/0)
- Ensure backend is running and accessible

### Local Testing with Production API

To test locally with your production backend:

1. Create a `.env` file:
   ```
   VITE_API_URL=https://your-backend-app.onrender.com/api
   ```

2. Run development server:
   ```
   npm run dev
   ```

### Build Locally

To test the production build locally:

```bash
npm run build
npm run preview
```

This will build and serve the production version at `http://localhost:4173`
