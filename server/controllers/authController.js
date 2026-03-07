
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const register = async (req, res) => {
  try {
    const { email, password, name, role, matricNumber, department, level, specialization, maxStudents } = req.body;

    // Format email for students
    let formattedEmail = email;
    if (role === 'student' && matricNumber) {
      formattedEmail = `${matricNumber.toLowerCase().replace(/\//g, ".")}@student.fyp`;
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email: formattedEmail,
      password: hashed,
      role,
      matricNumber: role === 'student' ? matricNumber : undefined,
      department,
      level: role === 'student' ? level : undefined,
      specialization: role === 'supervisor' ? specialization : undefined,
      maxStudents: role === 'supervisor' ? maxStudents : undefined
    });

    const userResponse = user.toObject();
    delete userResponse.password;
    res.json(userResponse);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ msg: "User not found" });

    const ok = await bcrypt.compare(currentPassword, user.password);
    if (!ok) return res.status(401).json({ msg: "Current password is incorrect" });

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    await user.save();

    res.json({ msg: "Password changed successfully" });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const login = async (req, res) => {
  try {
    console.log('Login attempt:', { identifier: req.body.identifier });
    
    const { identifier, password } = req.body;

    // Format identifier as email
    let email = identifier;
    if (!identifier.includes("@")) {
      email = `${identifier.toLowerCase().replace(/\//g, ".")}@student.fyp`;
    }

    console.log('Looking for user with email:', email);
    
    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found:', email);
      return res.status(404).json({ msg: "User not found" });
    }

    console.log('User found:', { id: user._id, email: user.email, role: user.role });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      console.log('Invalid password for user:', email);
      return res.status(401).json({ msg: "Invalid credentials" });
    }

    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not set!');
      return res.status(500).json({ msg: "Server configuration error" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    const userResponse = user.toObject();
    delete userResponse.password;
    
    console.log('Login successful for:', email);
    res.json({ token, user: userResponse });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ msg: error.message });
  }
};
