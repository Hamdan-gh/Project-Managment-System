
import express from "express";
import Proposal from "../models/Proposal.js";
import User from "../models/User.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// Get all proposals (admin/supervisor)
router.get("/", auth, async (req, res) => {
  try {
    let proposals;
    if (req.user.role === 'admin') {
      proposals = await Proposal.find().populate('student', 'name email').populate('supervisor', 'name email');
    } else if (req.user.role === 'supervisor') {
      proposals = await Proposal.find({ supervisor: req.user._id }).populate('student', 'name email');
    } else {
      return res.status(403).json({ msg: "Access denied" });
    }
    res.json(proposals);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
});

// Get student's own proposals
router.get("/my", auth, async (req, res) => {
  try {
    const proposals = await Proposal.find({ student: req.user._id }).populate('supervisor', 'name email');
    res.json(proposals);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
});

// Create proposal
router.post("/", auth, async (req, res) => {
  try {
    if (req.user.role !== 'student') return res.status(403).json({ msg: "Only students can submit proposals" });

    // Get student's assigned supervisor
    const student = await User.findById(req.user._id);
    if (!student || !student.supervisor) {
      return res.status(400).json({ msg: "No supervisor assigned. Please contact admin." });
    }

    const proposal = await Proposal.create({
      ...req.body,
      student: req.user._id,
      supervisor: student.supervisor
    });

    await proposal.populate('student', 'name email').populate('supervisor', 'name email');
    res.json(proposal);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
});

// Update proposal status (supervisor/admin)
router.put("/:id", auth, async (req, res) => {
  try {
    const proposal = await Proposal.findById(req.params.id);
    if (!proposal) return res.status(404).json({ msg: "Proposal not found" });

    if (req.user.role === 'supervisor' && proposal.supervisor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ msg: "Access denied" });
    }

    if (req.user.role === 'student' && proposal.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({ msg: "Access denied" });
    }

    const updatedProposal = await Proposal.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('student', 'name email')
      .populate('supervisor', 'name email');
    res.json(updatedProposal);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
});

export default router;
