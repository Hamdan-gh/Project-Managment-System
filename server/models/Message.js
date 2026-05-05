import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: false }, // Make content optional for voice messages
  messageType: { 
    type: String, 
    enum: ["text", "voice"], 
    default: "text" 
  },
  voiceUrl: { type: String }, // URL to the voice recording file
  voiceDuration: { type: Number }, // Duration in seconds
  isRead: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model("Message", MessageSchema);