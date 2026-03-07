console.log("Starting user creation script...");

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

const createUser = async () => {
  try {
    console.log("Connecting to MongoDB...");
    const mongoUri = process.env.MONGO_URI.endsWith('/') 
      ? process.env.MONGO_URI + 'fypSystem'
      : process.env.MONGO_URI;
    
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB");

    const UserSchema = new mongoose.Schema({
      name: String,
      email: { type: String, unique: true },
      password: String,
      role: { type: String, enum: ["student", "supervisor", "admin"], required: true },
      department: String,
      specialization: String,
      maxStudents: Number
    });

    const User = mongoose.model("User", UserSchema);

    // Check if user already exists
    const existingUser = await User.findOne({ email: "john@gmail.com" });
    if (existingUser) {
      console.log("User already exists!");
      console.log("Email: john@gmail.com");
      console.log("Role:", existingUser.role);
      return;
    }

    console.log("Creating user...");
    const hashedPassword = await bcrypt.hash("123456", 10);

    const user = new User({
      name: "John Doe",
      email: "john@gmail.com",
      password: hashedPassword,
      role: "admin"
    });

    await user.save();
    console.log("✅ User created successfully!");
    console.log("Email: john@gmail.com");
    console.log("Password: 123456");
    console.log("Role: admin");

  } catch (error) {
    console.error("❌ Error creating user:", error.message);
  } finally {
    await mongoose.connection.close();
    console.log("Database connection closed");
  }
};

createUser();
