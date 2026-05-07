
import express from "express";
import { register, login, changePassword } from "../controllers/authController.js";
import auth from "../middleware/auth.js";

const router = express.Router();
router.post("/register", register);
router.post("/login", login);
router.put("/change-password", auth, changePassword);

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
