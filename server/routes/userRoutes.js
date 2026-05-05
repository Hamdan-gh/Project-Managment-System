import express from "express";
import User from "../models/User.js";
import auth from "../middleware/auth.js";
import bcrypt from "bcryptjs";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = express.Router();

// Configure multer for avatar uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'server', 'uploads', 'avatars');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (JPEG, PNG, GIF, WebP) are allowed'));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Get all users (admin only)
router.get("/", auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ msg: "Access denied" });

    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
});

// Get users by role
router.get("/role/:role", auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ msg: "Access denied" });

    const users = await User.find({ role: req.params.role }).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
});

// Get supervisor's students
router.get("/supervisor/students", auth, async (req, res) => {
  try {
    if (req.user.role !== 'supervisor') return res.status(403).json({ msg: "Access denied" });

    const students = await User.find({ role: 'student', supervisor: req.user._id }).select('-password');
    res.json(students);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
});

// Create user (admin only)
router.post("/", auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ msg: "Access denied" });

    const hashed = await bcrypt.hash(req.body.password, 10);
    const user = await User.create({ ...req.body, password: hashed });
    const userResponse = user.toObject();
    delete userResponse.password;
    res.json(userResponse);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
});

// Update user
router.put("/:id", auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.params.id !== req.user._id.toString()) {
      return res.status(403).json({ msg: "Access denied" });
    }

    const updateData = { ...req.body };
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    const user = await User.findByIdAndUpdate(req.params.id, updateData, { new: true }).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
});

// Assign supervisor to student
router.put("/:studentId/supervisor/:supervisorId", auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ msg: "Access denied" });

    const student = await User.findById(req.params.studentId);
    const supervisor = await User.findById(req.params.supervisorId);

    if (!student || student.role !== 'student') return res.status(404).json({ msg: "Student not found" });
    if (!supervisor || supervisor.role !== 'supervisor') return res.status(404).json({ msg: "Supervisor not found" });

    student.supervisor = req.params.supervisorId;
    await student.save();

    res.json({ msg: "Supervisor assigned successfully" });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
});

// Delete user
router.delete("/:id", auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ msg: "Access denied" });

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ msg: "User not found" });

    res.json({ msg: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
});

// Get dashboard stats (admin only)
router.get("/stats", auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ msg: "Access denied" });

    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalSupervisors = await User.countDocuments({ role: 'supervisor' });
    const assignedStudents = await User.countDocuments({ role: 'student', supervisor: { $ne: null } });
    const unassignedStudents = totalStudents - assignedStudents;

    // Import Proposal model for proposal stats
    const Proposal = (await import('../models/Proposal.js')).default;
    const pendingProposals = await Proposal.countDocuments({ status: 'pending' });
    const approvedProposals = await Proposal.countDocuments({ status: 'approved' });
    const rejectedProposals = await Proposal.countDocuments({ status: 'rejected' });

    res.json({
      totalStudents,
      totalSupervisors,
      assignedStudents,
      unassignedStudents,
      pendingProposals,
      approvedProposals,
      rejectedProposals,
    });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
});

// Upload avatar
router.post("/avatar", auth, upload.single('avatar'), async (req, res) => {
  try {
    console.log("Avatar upload request from user:", req.user._id);
    
    if (!req.file) {
      return res.status(400).json({ msg: "No file uploaded" });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Delete old avatar if exists
    if (user.avatarPath) {
      const oldAvatarFullPath = path.join(process.cwd(), 'server', user.avatarPath);
      if (fs.existsSync(oldAvatarFullPath)) {
        fs.unlinkSync(oldAvatarFullPath);
        console.log("Deleted old avatar:", oldAvatarFullPath);
      }
    }

    // Save relative path instead of full path
    const relativePath = `uploads/avatars/${req.file.filename}`;
    
    // Update user with new avatar
    user.avatarPath = relativePath;
    user.avatarFileName = req.file.originalname;
    await user.save();

    console.log("Avatar uploaded successfully:", relativePath);

    res.json({
      msg: "Avatar uploaded successfully",
      avatarPath: relativePath,
      avatarFileName: req.file.originalname
    });
  } catch (error) {
    console.error("Error uploading avatar:", error);
    res.status(500).json({ msg: error.message });
  }
});

// Get avatar
router.get("/avatar/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    if (!user.avatarPath) {
      return res.status(404).json({ msg: "Avatar not found" });
    }

    // Construct full path from relative path
    const fullPath = path.join(process.cwd(), 'server', user.avatarPath);
    
    if (!fs.existsSync(fullPath)) {
      console.error("Avatar file not found:", fullPath);
      return res.status(404).json({ msg: "Avatar file not found" });
    }

    res.sendFile(path.resolve(fullPath));
  } catch (error) {
    console.error("Error retrieving avatar:", error);
    res.status(500).json({ msg: error.message });
  }
});

// Delete avatar
router.delete("/avatar", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Delete avatar file if exists
    if (user.avatarPath) {
      const fullPath = path.join(process.cwd(), 'server', user.avatarPath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
        console.log("Deleted avatar:", fullPath);
      }
    }

    // Remove avatar from user record
    user.avatarPath = undefined;
    user.avatarFileName = undefined;
    await user.save();

    res.json({ msg: "Avatar deleted successfully" });
  } catch (error) {
    console.error("Error deleting avatar:", error);
    res.status(500).json({ msg: error.message });
  }
});

export default router;