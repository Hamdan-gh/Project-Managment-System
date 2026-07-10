import express from "express";
import Chapter from "../models/Chapter.js";
import User from "../models/User.js";
import auth from "../middleware/auth.js";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads', 'chapters');
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
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Get chapters for student
router.get("/my", auth, async (req, res) => {
  try {
    if (req.user.role !== 'student') return res.status(403).json({ msg: "Access denied" });

    const chapters = await Chapter.find({ student: req.user._id }).populate('supervisor', 'name email');
    res.json(chapters);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
});

// Get chapters for supervisor's students
router.get("/supervisor", auth, async (req, res) => {
  try {
    if (req.user.role !== 'supervisor') return res.status(403).json({ msg: "Access denied" });

    console.log("Supervisor ID:", req.user._id);
    const chapters = await Chapter.find({ supervisor: req.user._id }).populate('student', 'name email');
    console.log("Found chapters:", chapters.length);
    console.log("Chapters data:", chapters.map(c => ({ id: c._id, title: c.title, student: c.student, supervisor: c.supervisor })));
    res.json(chapters);
  } catch (error) {
    console.error("Error in supervisor route:", error);
    res.status(500).json({ msg: error.message });
  }
});

// Create chapter
router.post("/", auth, upload.single('file'), async (req, res) => {
  try {
    console.log("Creating chapter for user:", req.user._id, "role:", req.user.role);
    if (req.user.role !== 'student') return res.status(403).json({ msg: "Only students can create chapters" });

    // Get student with supervisor populated
    const student = await User.findById(req.user._id).populate('supervisor');
    if (!student) return res.status(404).json({ msg: "Student not found" });
    if (!student.supervisor) return res.status(400).json({ msg: "No supervisor assigned" });

    console.log("Student:", student._id, "Supervisor:", student.supervisor?._id);

    const chapterData = {
      title: req.body.title,
      content: req.body.content || '',
      student: req.user._id,
      supervisor: student.supervisor._id,
      status: "submitted",
      submittedAt: new Date()
    };

    console.log("Chapter data:", chapterData);

    // Add file information if uploaded
    if (req.file) {
      chapterData.filePath = req.file.path;
      chapterData.fileName = req.file.originalname;
      console.log("File uploaded:", req.file.originalname, "to", req.file.path);
    } else {
      console.log("No file uploaded");
    }

    const chapter = await Chapter.create(chapterData);
    console.log("Chapter created:", chapter._id);
    await chapter.populate('student', 'name email');
    await chapter.populate('supervisor', 'name email');
    console.log("Created chapter:", chapter._id, "with supervisor:", chapter.supervisor?._id);
    res.json(chapter);
  } catch (error) {
    console.error("Error creating chapter:", error);
    res.status(500).json({ msg: error.message });
  }
});

// Update chapter (with optional file upload)
const updateChapter = async (req, res) => {
  try {
    const chapter = await Chapter.findById(req.params.id);
    if (!chapter) return res.status(404).json({ msg: "Chapter not found" });

    if (req.user.role === 'student' && chapter.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({ msg: "Access denied" });
    }

    if (req.user.role === 'supervisor' && chapter.supervisor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ msg: "Access denied" });
    }

    const updateData = {};

    // Handle different content types
    if (req.is('multipart/form-data')) {
      // File upload (from students)
      updateData.title = req.body.title;
      updateData.content = req.body.content || '';
      updateData.status = req.body.status || "submitted";
      updateData.submittedAt = new Date();

      if (req.file) {
        // Delete old file if exists
        if (chapter.filePath && fs.existsSync(chapter.filePath)) {
          fs.unlinkSync(chapter.filePath);
        }
        updateData.filePath = req.file.path;
        updateData.fileName = req.file.originalname;
      }
    } else {
      // JSON update (from supervisors)
      Object.assign(updateData, req.body);
      
      // Set approvedAt when status changes to approved
      if (req.body.status === 'approved') {
        updateData.approvedAt = new Date();
      }

      // Set submittedAt when resubmitting
      if (req.body.status === 'submitted') {
        updateData.submittedAt = new Date();
      }
    }

    const updatedChapter = await Chapter.findByIdAndUpdate(req.params.id, updateData, { new: true })
      .populate('student', 'name email')
      .populate('supervisor', 'name email');
    res.json(updatedChapter);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

// Routes
router.put("/:id", auth, (req, res, next) => {
  // Check if this is a file upload
  if (req.headers['content-type'] && req.headers['content-type'].includes('multipart/form-data')) {
    upload.single('file')(req, res, next);
  } else {
    next();
  }
}, updateChapter);

// Delete chapter
router.delete("/:id", auth, async (req, res) => {
  try {
    const chapter = await Chapter.findById(req.params.id);
    if (!chapter) return res.status(404).json({ msg: "Chapter not found" });

    if (req.user.role === 'student' && chapter.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({ msg: "Access denied" });
    }

    await Chapter.findByIdAndDelete(req.params.id);
    res.json({ msg: "Chapter deleted" });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
});

// Download chapter file
router.get("/download/:id", auth, async (req, res) => {
  try {
    console.log("Download request for chapter:", req.params.id);
    const chapter = await Chapter.findById(req.params.id);
    if (!chapter) {
      console.log("Chapter not found:", req.params.id);
      return res.status(404).json({ msg: "Chapter not found" });
    }

    console.log("Chapter found:", chapter._id, "filePath:", chapter.filePath);

    // Check permissions
    if (req.user.role === 'student' && chapter.student.toString() !== req.user._id.toString()) {
      console.log("Access denied: student mismatch");
      return res.status(403).json({ msg: "Access denied" });
    }
    if (req.user.role === 'supervisor' && chapter.supervisor.toString() !== req.user._id.toString()) {
      console.log("Access denied: supervisor mismatch");
      return res.status(403).json({ msg: "Access denied" });
    }

    if (!chapter.filePath) {
      console.log("No file path in chapter record");
      return res.status(404).json({ msg: "No file uploaded for this chapter" });
    }

    if (!fs.existsSync(chapter.filePath)) {
      console.log("File does not exist at path:", chapter.filePath);
      return res.status(404).json({ msg: "File not found on server. It may have been lost after a server restart. Please ask the student to re-upload." });
    }

    console.log("Downloading file:", chapter.filePath);
    res.download(path.resolve(chapter.filePath), chapter.fileName || 'chapter.pdf');
  } catch (error) {
    console.error("Error in download route:", error);
    res.status(500).json({ msg: error.message });
  }
});

// Preview chapter file (for PDF viewing)
router.get("/preview/:id", auth, async (req, res) => {
  try {
    console.log("Preview request for chapter:", req.params.id);
    const chapter = await Chapter.findById(req.params.id);
    if (!chapter) {
      console.log("Chapter not found:", req.params.id);
      return res.status(404).json({ msg: "Chapter not found" });
    }

    console.log("Chapter found:", chapter._id, "filePath:", chapter.filePath);

    // Check permissions
    if (req.user.role === 'student' && chapter.student.toString() !== req.user._id.toString()) {
      console.log("Access denied: student mismatch");
      return res.status(403).json({ msg: "Access denied" });
    }
    if (req.user.role === 'supervisor' && chapter.supervisor.toString() !== req.user._id.toString()) {
      console.log("Access denied: supervisor mismatch");
      return res.status(403).json({ msg: "Access denied" });
    }

    if (!chapter.filePath) {
      console.log("No file path in chapter record");
      return res.status(404).json({ msg: "No file uploaded for this chapter" });
    }

    if (!fs.existsSync(chapter.filePath)) {
      console.log("File does not exist at path:", chapter.filePath);
      return res.status(404).json({ msg: "File not found on server. It may have been lost after a server restart. Please ask the student to re-upload." });
    }

    console.log("Sending file:", chapter.filePath);
    // For PDF preview, we can serve the file directly
    res.sendFile(path.resolve(chapter.filePath));
  } catch (error) {
    console.error("Error in preview route:", error);
    res.status(500).json({ msg: error.message });
  }
});

export default router;