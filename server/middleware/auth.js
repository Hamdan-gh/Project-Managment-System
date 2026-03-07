
import jwt from "jsonwebtoken";
import User from "../models/User.js";

export default async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      console.log('Auth middleware: No token provided');
      return res.status(401).json({ msg: "No token" });
    }

    if (!process.env.JWT_SECRET) {
      console.error('Auth middleware: JWT_SECRET is not set!');
      return res.status(500).json({ msg: "Server configuration error" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);
    if (!req.user) {
      console.log('Auth middleware: User not found for token');
      return res.status(401).json({ msg: "User not found" });
    }

    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    res.status(401).json({ msg: "Invalid token" });
  }
};

export const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ msg: "Forbidden" });
  }
  next();
};
