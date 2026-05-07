import express from "express";
import multer from "multer";
import Message from "../models/Message.js";
import auth from "../middleware/auth.js";
import cloudinary from "../config/cloudinary.js";

const router = express.Router();

// Configure multer for memory storage (we'll upload to Cloudinary)
const storage = multer.memoryStorage();

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit for voice messages
  },
  fileFilter: (req, file, cb) => {
    console.log('File upload attempt:', file.mimetype, file.originalname);
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
    console.log('Voice upload request received');
    console.log('File:', req.file ? `${req.file.size} bytes, ${req.file.mimetype}` : 'No file');
    console.log('Body:', req.body);
    
    if (!req.file) {
      console.error('No file in request');
      return res.status(400).json({ msg: "No voice file uploaded" });
    }

    const { receiver, duration } = req.body;
    
    if (!receiver) {
      console.error('No receiver specified');
      return res.status(400).json({ msg: "Receiver is required" });
    }

    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.error('Cloudinary credentials not configured');
      return res.status(500).json({ msg: "Cloud storage not configured. Please contact administrator." });
    }

    console.log('Starting Cloudinary upload for voice message...');

    // Upload to Cloudinary
    const uploadPromise = new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'voice-messages',
          resource_type: 'video', // Cloudinary uses 'video' for audio files
          format: 'mp3', // Convert to mp3 for better compatibility
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
    const voiceUrl = result.secure_url;
    
    console.log('Voice URL:', voiceUrl);
    
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
    
    console.log('Voice message created successfully:', message._id);
    res.json(message);
  } catch (error) {
    console.error('Voice upload error:', error);
    res.status(500).json({ msg: error.message || "Failed to upload voice message" });
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