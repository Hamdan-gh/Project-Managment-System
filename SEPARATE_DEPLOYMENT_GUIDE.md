# 🚀 Separate Deployment Guide

## Backend on Render + Frontend on Vercel

### **Phase 1: Deploy Backend to Render**

#### **1. Create New Render Service**
1. Go to https://dashboard.render.com
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: `project-management-backend`
   - **Runtime**: `Node`
   - **Build Command**: `cd server && npm install`
   - **Start Command**: `cd server && node server.js`
   - **Root Directory**: Leave empty (uses repo root)

#### **2. Set Environment Variables**
In Render Dashboard → Environment tab, add:

```
NODE_ENV=production
PORT=10000
MONGO_URI=mongodb+srv://saeedhamdan360x_db_user:BhfmX62rtEdKZmq2@cluster0.ckd4k2f.mongodb.net/fypSystem
JWT_SECRET=your_jwt_secret_key_here
```

**⚠️ Important**: Replace `JWT_SECRET` with a strong random string:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

#### **3. Deploy Backend**
- Click "Create Web Service"
- Wait for deployment (5-10 minutes)
- Test: https://your-backend-url.onrender.com/api/test

---

### **Phase 2: Deploy Frontend to Vercel**

#### **1. Install Vercel CLI** (Optional)
```bash
npm i -g vercel
```

#### **2. Deploy via Vercel Dashboard**
1. Go to https://vercel.com/dashboard
2. Click "New Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `.` (repo root)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

#### **3. Set Environment Variables**
In Vercel Dashboard → Settings → Environment Variables:

```
VITE_API_URL=https://your-backend-url.onrender.com/api
```

**Replace `your-backend-url` with your actual Render backend URL**

#### **4. Deploy Frontend**
- Click "Deploy"
- Wait for deployment (2-5 minutes)
- Test: https://your-frontend-url.vercel.app

---

### **Phase 3: Update CORS Configuration**

After getting your Vercel URL, update the backend CORS:

1. **Edit `server/server.js`**:
```javascript
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5173', 
    'https://your-frontend-url.vercel.app', // Add your actual Vercel URL
    'https://*.vercel.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

2. **Commit and push** to trigger Render redeploy

---

### **Phase 4: Testing**

#### **Backend Tests**:
1. **API Health**: `https://your-backend.onrender.com/api/test`
2. **Root Endpoint**: `https://your-backend.onrender.com/`
3. **CORS**: Check browser console for CORS errors

#### **Frontend Tests**:
1. **Homepage**: `https://your-frontend.vercel.app`
2. **Login**: Test with `admin@gmail.com` / `123456`
3. **Voice Messages**: Test recording and playback
4. **Notifications**: Test badge counts

---

### **Phase 5: Environment URLs**

After deployment, you'll have:

- **Backend**: `https://project-management-backend.onrender.com`
- **Frontend**: `https://project-management-frontend.vercel.app`

Update these in your environment variables accordingly.

---

### **Troubleshooting**

#### **Backend Issues**:
- **Build Fails**: Check `cd server && npm install` works locally
- **Runtime Error**: Verify environment variables are set
- **CORS Error**: Update allowed origins with your Vercel URL

#### **Frontend Issues**:
- **Build Fails**: Check `npm run build` works locally
- **API Errors**: Verify `VITE_API_URL` points to correct backend
- **404 Errors**: Check Vercel routing configuration

#### **Connection Issues**:
- **Network Error**: Backend might be sleeping (Render free tier)
- **CORS Error**: Backend CORS not configured for frontend URL
- **Auth Error**: Check JWT_SECRET matches between deployments

---

### **Benefits of Separate Deployment**:

✅ **Independent Scaling**: Scale frontend and backend separately
✅ **Faster Frontend Deploys**: Vercel's edge network for static files
✅ **Better Performance**: CDN for frontend, dedicated server for API
✅ **Easier Debugging**: Separate logs and monitoring
✅ **Cost Optimization**: Use best platform for each service

---

### **Next Steps After Deployment**:

1. **Custom Domains** (Optional): Add custom domains to both services
2. **Monitoring**: Set up monitoring for both services
3. **SSL**: Both platforms provide SSL automatically
4. **Environment Management**: Set up staging environments
