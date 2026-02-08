import express from "express";
import Announcement from "../models/Announcement.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// Get announcements
router.get("/", auth, async (req, res) => {
  try {
    let announcements;
    if (req.user.role === 'admin') {
      announcements = await Announcement.find().populate('author', 'name email');
    } else {
      announcements = await Announcement.find({
        $or: [
          { targetRole: 'all' },
          { targetRole: req.user.role }
        ]
      }).populate('author', 'name email');
    }
    res.json(announcements);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
});

// Get my announcements (for supervisors)
router.get("/my", auth, async (req, res) => {
  try {
    if (req.user.role !== 'supervisor') return res.status(403).json({ msg: "Access denied" });

    const announcements = await Announcement.find({ author: req.user._id }).populate('author', 'name email');
    res.json(announcements);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
});

// Create announcement (admin/supervisor)
router.post("/", auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'supervisor') return res.status(403).json({ msg: "Access denied" });

    const announcement = await Announcement.create({
      ...req.body,
      author: req.user._id
    });
    await announcement.populate('author', 'name email');
    res.json(announcement);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
});

// Update announcement
router.put("/:id", auth, async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) return res.status(404).json({ msg: "Announcement not found" });

    if (req.user.role !== 'admin' && announcement.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ msg: "Access denied" });
    }

    const updatedAnnouncement = await Announcement.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('author', 'name email');
    res.json(updatedAnnouncement);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
});

// Delete announcement
router.delete("/:id", auth, async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) return res.status(404).json({ msg: "Announcement not found" });

    if (req.user.role !== 'admin' && announcement.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ msg: "Access denied" });
    }

    await Announcement.findByIdAndDelete(req.params.id);
    res.json({ msg: "Announcement deleted" });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
});

export default router;