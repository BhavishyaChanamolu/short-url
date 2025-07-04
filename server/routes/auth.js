const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const usermodel = require("../models/userModel");

// ✅ Signup route
router.post("/signup", async (req, res) => {
  const { name, email, pass } = req.body;

  try {
    const existingUser = await usermodel.findOne({ email }); // ✅ correct reference

    if (existingUser) {
      return res.status(400).json({ error: "Email already in use" });
    }

    const hashedPass = await bcrypt.hash(pass, 10); // ✅ hash the password

    const newUser = new usermodel({ name, email, pass: hashedPass }); // ✅ use 'pass' field
    await newUser.save();

    const token = jwt.sign({ id: newUser._id }, "your-secret-key", { expiresIn: "1h" });
    res.cookie("token", token, { httpOnly: true });
    res.status(201).json({ message: "Signup successful", token });

  } catch (err) {
    console.error("🔥 Signup error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ Login route
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await usermodel.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    const match = await bcrypt.compare(password, user.pass); // ✅ compare with hashed password
    if (!match) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, "your-secret-key", { expiresIn: "1h" });
    res.cookie("token", token, { httpOnly: true });
    res.status(200).json({ message: "Login successful", token });

  } catch (err) {
    console.error("🔥 Login error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ Logout route
router.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ message: "Logged out" });
});

module.exports = router;
