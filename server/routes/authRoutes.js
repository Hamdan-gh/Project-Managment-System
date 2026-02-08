
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
    const user = await req.user.populate('supervisor', 'name email');
    res.json({ user });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
});

export default router;
