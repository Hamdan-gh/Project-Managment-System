
import jwt from "jsonwebtoken";
import User from "../models/User.js";

export default async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    console.log('Auth middleware - Authorization header:', authHeader ? 'Present' : 'Missing');
    
    const token = authHeader?.split(" ")[1];
    if (!token) {
      console.log('Auth middleware: No token provided');
      return res.status(401).json({ msg: "No token, authorization denied" });
    }

    if (!process.env.JWT_SECRET) {
      console.error('Auth middleware: JWT_SECRET is not set!');
      return res.status(500).json({ msg: "Server configuration error" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Auth middleware: Token decoded, user ID:', decoded.id);
    
    req.user = await User.findById(decoded.id);
    if (!req.user) {
      console.log('Auth middleware: User not found for token');
      return res.status(401).json({ msg: "User not found" });
    }

    console.log('Auth middleware: User authenticated:', req.user._id, req.user.role);
    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ msg: "Invalid token" });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ msg: "Token expired" });
    }
    res.status(401).json({ msg: "Token verification failed" });
  }
};

export const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ msg: "Forbidden" });
  }
  next();
};
