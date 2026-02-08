
import mongoose from "mongoose";

const ProposalSchema = new mongoose.Schema({
  title: { type: String, required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  supervisor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending"
  },
  feedback: String,
  submittedAt: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model("Proposal", ProposalSchema);
