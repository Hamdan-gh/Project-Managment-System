import express from "express";
import User from "../models/User.js";
import auth from "../middleware/auth.js";
import bcrypt from "bcryptjs";
import multer from "multer";
import cloudinary from "../config/cloudinary.js";

const router = express.Router();

// Configure multer for memory storage (we'll upload to Cloudinary)
const storage = multer.memoryStorage();

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
    console.log("Cloudinary config:", {
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME ? 'Set' : 'Missing',
      api_key: process.env.CLOUDINARY_API_KEY ? 'Set' : 'Missing',
      api_secret: process.env.CLOUDINARY_API_SECRET ? 'Set' : 'Missing'
    });
    
    if (!req.file) {
      return res.status(400).json({ msg: "No file uploaded" });
    }

    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.error('Cloudinary credentials not configured');
      return res.status(500).json({ msg: "Cloud storage not configured. Please contact administrator." });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    console.log('Starting Cloudinary upload...');

    // Delete old avatar from Cloudinary if exists
    if (user.avatarPath && user.avatarPath.includes('cloudinary')) {
      try {
        // Extract public_id from Cloudinary URL
        const urlParts = user.avatarPath.split('/');
        const publicIdWithExt = urlParts[urlParts.length - 1];
        const publicId = publicIdWithExt.split('.')[0];
        await cloudinary.uploader.destroy(`avatars/${publicId}`);
        console.log("Deleted old avatar from Cloudinary");
      } catch (error) {
        console.error("Error deleting old avatar from Cloudinary:", error);
      }
    }

    // Upload to Cloudinary
    const uploadPromise = new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'avatars',
          resource_type: 'image',
          transformation: [
            { width: 500, height: 500, crop: 'limit' },
            { quality: 'auto' }
          ]
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            reject(error);
          } else {
            console.log('Cloudinary upload success:', result.secure_url);
            resolve(result);
          }
        }
      );
      uploadStream.end(req.file.buffer);
    });

    const result = await uploadPromise;
    
    // Update user with Cloudinary URL
    user.avatarPath = result.secure_url;
    user.avatarFileName = req.file.originalname;
    await user.save();

    console.log("Avatar uploaded successfully to Cloudinary:", result.secure_url);

    res.json({
      msg: "Avatar uploaded successfully",
      avatarPath: result.secure_url,
      avatarFileName: req.file.originalname
    });
  } catch (error) {
    console.error("Error uploading avatar:", error);
    res.status(500).json({ msg: error.message || "Failed to upload avatar" });
  }
});

// Get avatar - now just redirects to Cloudinary URL
router.get("/avatar/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    if (!user.avatarPath) {
      return res.status(404).json({ msg: "Avatar not found" });
    }

    // If it's a Cloudinary URL, redirect to it
    if (user.avatarPath.includes('cloudinary')) {
      return res.redirect(user.avatarPath);
    }

    // Legacy: handle old local file paths (for backward compatibility)
    return res.status(404).json({ msg: "Avatar not found" });
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

    // Delete avatar from Cloudinary if exists
    if (user.avatarPath && user.avatarPath.includes('cloudinary')) {
      try {
        const publicId = user.avatarPath.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(`avatars/${publicId}`);
        console.log("Deleted avatar from Cloudinary");
      } catch (error) {
        console.error("Error deleting avatar from Cloudinary:", error);
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