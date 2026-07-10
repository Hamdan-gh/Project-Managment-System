
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

import authRoutes from "./routes/authRoutes.js";
import proposalRoutes from "./routes/proposalRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import announcementRoutes from "./routes/announcementRoutes.js";
import chapterRoutes from "./routes/chapterRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Ensure uploads directories exist
const uploadsDir = path.join(__dirname, 'uploads');
const voiceMessagesDir = path.join(uploadsDir, 'voice-messages');
const avatarsDir = path.join(uploadsDir, 'avatars');
const chaptersDir = path.join(uploadsDir, 'chapters');

[uploadsDir, voiceMessagesDir, avatarsDir, chaptersDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    console.log('Creating directory:', dir);
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Log all requests for debugging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5173',
      'http://localhost:8080',   // Vite dev server
      'http://127.0.0.1:8080',  // Vite dev server (alternate)
      'https://fyps-uds.vercel.app'
    ];
    
    // Check if origin is in allowed list or is a vercel.app / onrender.com domain
    if (allowedOrigins.includes(origin) || origin.endsWith('.vercel.app') || origin.endsWith('.onrender.com')) {
      callback(null, true);
    } else {
      callback(null, true); // Allow all for now, can restrict later
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Validate required environment variables
if (!process.env.MONGO_URI) {
  console.error('FATAL: MONGO_URI environment variable is not set');
  process.exit(1);
}
if (!process.env.JWT_SECRET) {
  console.error('FATAL: JWT_SECRET environment variable is not set');
  process.exit(1);
}

console.log('Environment check:');
console.log('- MONGO_URI:', process.env.MONGO_URI ? '✓ Set' : '✗ Missing');
console.log('- JWT_SECRET:', process.env.JWT_SECRET ? '✓ Set' : '✗ Missing');
console.log('- NODE_ENV:', process.env.NODE_ENV || 'development');

mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
})
  .then(() => console.log("✓ MongoDB Atlas connected successfully"))
  .catch(err => {
    console.error("✗ MongoDB connection error:", err.message);
    process.exit(1);
  });

app.get("/", (req, res) => {
  res.send("FYP System API running");
});

app.get("/api/test", (req, res) => {
  res.json({ message: "API is working", timestamp: new Date().toISOString() });
});

// API Routes - must come before static file serving
app.use("/api/auth", authRoutes);
app.use("/api/proposals", proposalRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/chapters", chapterRoutes);
app.use("/api/users", userRoutes);
app.use("/api/analytics", analyticsRoutes);

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve static assets (images, logos, etc.)
app.use('/assets', express.static(path.join(__dirname, 'public')));

// API-only server - frontend is served separately by Vercel
app.get('/', (req, res) => {
  res.json({ 
    message: "FYP System API Server", 
    status: "running",
    timestamp: new Date().toISOString(),
    endpoints: {
      test: "/api/test",
      auth: "/api/auth",
      messages: "/api/messages",
      announcements: "/api/announcements",
      proposals: "/api/proposals",
      chapters: "/api/chapters",
      users: "/api/users",
      analytics: "/api/analytics"
    }
  });
});

// Handle 404 for unknown API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ msg: 'API endpoint not found' });
});

// Handle all other routes
app.use('*', (req, res) => {
  res.status(404).json({ 
    msg: 'This is an API server. Frontend is served separately.',
    api_base: '/api'
  });
});

const PORT = process.env.PORT || 5000;
console.log('Environment PORT variable:', process.env.PORT);
console.log('Using PORT:', PORT);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Server is listening on http://0.0.0.0:${PORT}`);
});
