import mongoose from "mongoose";

const ChapterSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: String,
  filePath: String, // Path to uploaded file
  fileName: String, // Original filename
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  supervisor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: {
    type: String,
    enum: ["draft", "submitted", "approved", "rejected"],
    default: "draft"
  },
  feedback: String,
  submittedAt: Date,
  approvedAt: Date
}, { timestamps: true });

export default mongoose.model("Chapter", ChapterSchema);