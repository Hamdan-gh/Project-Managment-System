import mongoose from "mongoose";

const AnnouncementSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  targetRole: {
    type: String,
    enum: ["all", "student", "supervisor", "admin"],
    default: "all"
  }
}, { timestamps: true });

export default mongoose.model("Announcement", AnnouncementSchema);