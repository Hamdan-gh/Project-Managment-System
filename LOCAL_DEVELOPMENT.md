# Local Development Guide

## Running the Application Locally

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas connection)

### Backend Setup

1. **Navigate to the server directory:**
   ```bash
   cd server
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create/Update `.env` file in the server directory:**
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   NODE_ENV=development
   ```

4. **Start the backend server:**
   ```bash
   npm start
   # or for development with auto-reload:
   node server.js
   ```

   The backend will run on `http://localhost:5000`

### Frontend Setup

1. **Navigate to the project root directory:**
   ```bash
   cd ..  # if you're in the server directory
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Verify `.env` file:**
   The `.env` file should have `VITE_API_URL` commented out for local development:
   ```env
   # VITE_API_URL=https://project-management-backend-in20.onrender.com/api
   ```

   This allows the Vite proxy to forward API requests to your local backend.

4. **Start the frontend development server:**
   ```bash
   npm run dev
   ```

   The frontend will run on `http://localhost:8080`

### How It Works

- **Local Development**: 
  - Frontend runs on `http://localhost:8080`
  - Backend runs on `http://localhost:5000`
  - Vite proxy forwards `/api` requests from frontend to backend
  - `.env` has `VITE_API_URL` commented out

- **Production Deployment**:
  - Frontend deployed on Vercel
  - Backend deployed on Render
  - `.env.production` sets `VITE_API_URL` to production backend URL
  - Vercel automatically uses `.env.production` during build

### Testing Login Locally

1. Make sure both backend and frontend are running
2. Open `http://localhost:8080` in your browser
3. Login with:
   - **Admin**: `admin@gmail.com` / `123456`
   - **Or any other user credentials**

### Troubleshooting

**Issue**: Login not working locally
- **Solution**: Make sure `VITE_API_URL` is commented out in `.env`
- **Check**: Backend is running on port 5000
- **Check**: Frontend console shows "Using API base URL: /api"

**Issue**: CORS errors
- **Solution**: Backend CORS is configured to allow `localhost:8080`
- **Check**: `server/server.js` includes `http://localhost:8080` in allowed origins

**Issue**: MongoDB connection error
- **Solution**: Verify `MONGO_URI` in `server/.env` is correct
- **Check**: MongoDB is running (if using local MongoDB)

### Environment Files Summary

| File | Purpose | Used By |
|------|---------|---------|
| `.env` | Local development (frontend) | Developer's machine |
| `.env.production` | Production build (frontend) | Vercel deployment |
| `server/.env` | Backend configuration | Both local and Render |

### Port Configuration

- **Frontend Dev Server**: `8080` (configured in `vite.config.ts`)
- **Backend Server**: `5000` (configured in `server/.env`)
- **Vite Proxy**: Forwards `/api` → `http://127.0.0.1:5000`

### Admin Credentials

- **Email**: `admin@gmail.com`
- **Password**: `123456`

Use these credentials to access the admin dashboard and create supervisors/students.
