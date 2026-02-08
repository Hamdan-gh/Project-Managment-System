console.log("Starting admin creation script...");

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

const createAdmin = async () => {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const UserSchema = new mongoose.Schema({
      name: String,
      email: { type: String, unique: true },
      password: String,
      role: { type: String, enum: ["student", "supervisor", "admin"], required: true }
    });

    const User = mongoose.model("User", UserSchema);

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: "saeedhamdan@gmail.com" });
    if (existingAdmin) {
      console.log("Admin user already exists!");
      console.log("Email: saeedhamdan@gmail.com");
      console.log("Password: 123456");
      return;
    }

    console.log("Creating admin user...");
    const hashedPassword = await bcrypt.hash("123456", 10);

    const admin = new User({
      name: "Admin User",
      email: "saeedhamdan@gmail.com",
      password: hashedPassword,
      role: "admin"
    });

    await admin.save();
    console.log("✅ Admin user created successfully!");
    console.log("Email: saeedhamdan@gmail.com");
    console.log("Password: 123456");

  } catch (error) {
    console.error("❌ Error creating admin:", error.message);
  } finally {
    await mongoose.connection.close();
    console.log("Database connection closed");
  }
};

createAdmin();