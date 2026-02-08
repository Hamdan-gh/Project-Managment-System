import express from "express";
import User from "../models/User.js";
import auth from "../middleware/auth.js";
import bcrypt from "bcryptjs";

const router = express.Router();

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

export default router;