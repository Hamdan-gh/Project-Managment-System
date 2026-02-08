# Deployment Guide - Render

## Frontend Deployment (Static Site)

### Prerequisites
- Backend already deployed on Render
- GitHub repository with your code

### Steps to Deploy Frontend on Render

1. **Go to Render Dashboard**
   - Visit https://dashboard.render.com/
   - Click "New +" button
   - Select "Static Site"

2. **Connect Your Repository**
   - Connect your GitHub account if not already connected
   - Select your repository
   - Click "Connect"

3. **Configure Build Settings**
   - **Name**: Choose a name (e.g., `student-supervision-frontend`)
   - **Branch**: `main` (or your default branch)
   - **Root Directory**: Leave empty (or `.` if root)
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`

4. **Add Environment Variables**
   Click "Advanced" and add:
   - **Key**: `VITE_API_URL`
   - **Value**: `https://your-backend-app.onrender.com/api`
   
   Replace `your-backend-app.onrender.com` with your actual backend URL

5. **Deploy**
   - Click "Create Static Site"
   - Wait for the build to complete (5-10 minutes)
   - Your frontend will be live at: `https://your-app-name.onrender.com`

### Important Notes

- **Free Tier**: Static sites on Render are free with 100GB bandwidth/month
- **Custom Domain**: You can add a custom domain in the site settings
- **Auto-Deploy**: Render will automatically redeploy when you push to your branch
- **Build Time**: First build takes longer, subsequent builds are faster

### Update Backend CORS

After deploying, update your backend's CORS settings to allow your frontend URL:

In `server/server.js`, update the CORS configuration:

```javascript
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'https://your-frontend-app.onrender.com'  // Add your frontend URL
  ],
  credentials: true
}));
```

Then redeploy your backend.

### Troubleshooting

**Build Fails:**
- Check build logs in Render dashboard
- Ensure all dependencies are in `package.json`
- Verify Node version compatibility

**API Connection Issues:**
- Verify `VITE_API_URL` environment variable is set correctly
- Check backend CORS settings include frontend URL
- Ensure backend is running and accessible

**404 on Page Refresh:**
- Render automatically handles SPA routing for static sites
- No additional configuration needed

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
