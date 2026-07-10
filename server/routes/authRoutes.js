
import express from "express";
import { register, login, changePassword } from "../controllers/authController.js";
import auth from "../middleware/auth.js";
import { sendSupervisorCredentials } from "../config/mailer.js";

const router = express.Router();
router.post("/register", register);
router.post("/login", login);
router.put("/change-password", auth, changePassword);

// Send supervisor login credentials via email (admin only)
router.post("/send-credentials", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ msg: "Access denied" });
    }

    const { email, name, password } = req.body;
    if (!email || !name || !password) {
      return res.status(400).json({ msg: "email, name, and password are required" });
    }

    if (!process.env.RESEND_API_KEY) {
      return res.status(503).json({
        msg: "Email service is not configured. Please set RESEND_API_KEY in the server environment variables.",
      });
    }

    console.log("Attempting to send credentials email to:", email);
    console.log("Using EMAIL_USER:", process.env.EMAIL_USER);

    await sendSupervisorCredentials(email, name, password);
    console.log("Email sent successfully to:", email);
    res.json({ msg: "Credentials sent successfully" });
  } catch (error) {
    console.error("Error sending credentials email:", error);
    // Return the actual error so we can diagnose it
    res.status(500).json({
      msg: `Failed to send email: ${error.message || "Unknown error"}`,
    });
  }
});

// Get current user info
router.get("/me", auth, async (req, res) => {
  try {
    // Import User model to use populate
    const User = (await import('../models/User.js')).default;
    const user = await User.findById(req.user._id).populate('supervisor', 'name email avatarPath');
    
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }
    
    const userResponse = user.toObject();
    delete userResponse.password;
    res.json({ user: userResponse });
  } catch (error) {
    console.error('Error in /me endpoint:', error);
    res.status(500).json({ msg: error.message });
  }
});

export default router;
