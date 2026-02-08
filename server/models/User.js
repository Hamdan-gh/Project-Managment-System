
import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: {
    type: String,
    enum: ["student", "supervisor", "admin"],
    required: true
  },
  matricNumber: String, // for students
  department: String,
  level: String, // for students
  specialization: String, // for supervisors
  maxStudents: { type: Number, default: 10 }, // for supervisors
  supervisor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } // for students
}, { timestamps: true });

export default mongoose.model("User", UserSchema);
