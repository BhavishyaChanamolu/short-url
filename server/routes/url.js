const express = require("express");
const router = express.Router();
const authenticate = require("../middleware/auth");
const User = require("../models/userModel");
const Url = require("../models/urlModel");

const bhav = "https://short-url-frontend-hb0t.onrender.com";
router.post("/", authenticate, async (req, res) => {
  const { longUrl, customAlias } = req.body;

  if (!longUrl) return res.status(400).json({ error: "Long URL is required" });

  const shortCode = customAlias || Math.random().toString(36).substring(2, 8);
  const shortUrl = `${shortCode}`;

  try {
    const existing = await Url.findOne({ shortUrl });
    if (existing) return res.status(409).json({ error: "Short URL already exists" });

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    const userUrlCount = await Url.countDocuments({ user: user._id });
    if (userUrlCount >= 3) {
      return res.status(403).json({ error: "Maximum of 3 short URLs allowed" });
    }

    const newUrl = new Url({
      originalUrl: longUrl,
      shortUrl,
      user: user._id,
    });

    await newUrl.save();

    user.urls.push(newUrl._id);
    await user.save();

    return res.status(200).json({
      shortUrl: newUrl.shortUrl,
      originalUrl: newUrl.originalUrl,
      createdAt: newUrl.createdAt,
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});

router.get("/history", authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('urls'); 
    if (!user) return res.status(404).json({ error: "User not found" });

    res.status(200).json({
      username: user.username,    
      urls: user.urls  
    });
  } catch (err) {
    console.error("Analytics fetch error:", err);
    res.status(500).json({ error: "Failed to fetch URL history" });
  }
});


module.exports = router;
