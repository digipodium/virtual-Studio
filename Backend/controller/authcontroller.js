const User = require("../models/usermodel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// 🔐 Secret Key (better: .env me rakho)
const JWT_SECRET = "SECRET_KEY";


// ===============================
// ✅ SIGNUP CONTROLLER
// ===============================
const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    

    // Create user
    const user = await User.create({
      name,
      email,
      password,
    });

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });

  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "Server error", error:error.message });
  }
};


// ===============================
// ✅ LOGIN CONTROLLER
// ===============================
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate token
    const token = jwt.sign(
      { id: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });

  } catch (error){
    
    res.status(500).json({ message: "Server error", error });
  }
};


// ===============================
// ✅ GET CURRENT USER
// ===============================
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    res.status(200).json(user);

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};


// ===============================
// ✅ LOGOUT (Frontend based)
// ===============================
exports.logout = async (req, res) => {
  try {
    // Backend me kuch nahi hota JWT logout me
    // Frontend se token delete hota hai

    res.status(200).json({ message: "Logout successful" });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
module.exports = {signup,login};
