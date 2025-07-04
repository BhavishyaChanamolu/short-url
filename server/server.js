const express = require("express");
const path = require("path");
const app = express();
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const User = require("./models/userModel");
const Url = require("./models/urlModel"); // ✅ New model
const authRoutes = require("./routes/auth");
const urlRoutes = require("./routes/url");
const PORT = 3000;
// MongoDB connection
mongoose.connect("mongodb+srv://bhavishyachanamolu2004:CejYgpk0LIeFjqUu@url-short-db.bccn4aa.mongodb.net/?retryWrites=true&w=majority&appName=url-short-db");

// Allowed frontend origins
const allowedOrigins = ["https://short-url-frontend-hb0t.onrender.com","http://localhost:3001", "http://localhost:5173"];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("CORS error: Not allowed by CORS"));
    }
  },
  credentials: true
}));

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/", authRoutes);        // /login and /signup
app.use("/shorten", urlRoutes);  // POST /shorten (auth-protected)

// Base constant for URL prefix
const short = `http://localhost:${PORT}`;

// Root route
app.get("/", (req, res) => {
  res.send("Welcome to the Short URL Backend");
});

// 🔁 Redirect route: maps short URLs back to original
app.get("/:code", async (req, res) => {
  const code = req.params.code;
  const fullShortUrl = `${short}/${code}`;

  try {
    const urlEntry = await Url.findOne({ shortUrl: fullShortUrl });
    if (!urlEntry) return res.status(404).send("Short URL not found");

    return res.redirect(urlEntry.originalUrl);
  } catch (err) {
    console.error("Redirection error:", err);
    return res.status(500).send("Internal Server Error");
  }
});

// Serve static files if needed (e.g., frontend build)
app.use(express.static(path.join(__dirname, "public")));


app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
