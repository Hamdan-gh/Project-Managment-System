import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import Message from "../models/Message.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// Configure multer for voice message uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = 'uploads/voice-messages';
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `voice-${uniqueSuffix}.webm`);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit for voice messages
  },
  fileFilter: (req, file, cb) => {
    // Accept audio files
    if (file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('Only audio files are allowed'), false);
    }
  }
});

// Get messages for user
router.get("/", auth, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [{ sender: req.user._id }, { receiver: req.user._id }]
    }).populate('sender', 'name email').populate('receiver', 'name email').sort({ createdAt: 1 }); // Sort ascending (oldest first)
    res.json(messages);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
});

// Get unread messages count
router.get("/unread", auth, async (req, res) => {
  try {
    const count = await Message.countDocuments({ receiver: req.user._id, isRead: false });
    res.json({ count });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
});

// Send message
router.post("/", auth, async (req, res) => {
  try {
    const message = await Message.create({
      ...req.body,
      sender: req.user._id
    });
    res.json(message);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
});

// Send voice message
router.post("/voice", auth, upload.single('voice'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ msg: "No voice file uploaded" });
    }

    const { receiver, duration } = req.body;
    
    if (!receiver) {
      return res.status(400).json({ msg: "Receiver is required" });
    }

    const voiceUrl = `/uploads/voice-messages/${req.file.filename}`;
    
    const message = await Message.create({
      sender: req.user._id,
      receiver,
      messageType: "voice",
      voiceUrl,
      voiceDuration: duration ? parseFloat(duration) : null
    });

    // Populate sender and receiver info
    await message.populate('sender', 'name email');
    await message.populate('receiver', 'name email');
    
    res.json(message);
  } catch (error) {
    // Clean up uploaded file if message creation fails
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Error deleting file:', err);
      });
    }
    res.status(500).json({ msg: error.message });
  }
});

// Mark as read
router.put("/:id/read", auth, async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) return res.status(404).json({ msg: "Message not found" });

    if (message.receiver.toString() !== req.user._id.toString()) {
      return res.status(403).json({ msg: "Access denied" });
    }

    message.isRead = true;
    await message.save();
    res.json(message);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
});

// Mark all messages from a sender as read
router.put("/mark-read/:senderId", auth, async (req, res) => {
  try {
    await Message.updateMany(
      { sender: req.params.senderId, receiver: req.user._id, isRead: false },
      { isRead: true }
    );
    res.json({ msg: "Messages marked as read" });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
});

// Delete message
router.delete("/:id", auth, async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) return res.status(404).json({ msg: "Message not found" });

    // Only allow sender to delete their own message
    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({ msg: "Access denied" });
    }

    await Message.findByIdAndDelete(req.params.id);
    res.json({ msg: "Message deleted successfully" });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
});

export default router;