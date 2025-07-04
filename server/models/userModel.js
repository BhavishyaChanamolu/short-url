const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: {
    type: String,
    required: true,
    unique: true, // enforce uniqueness
  },
  pass: String, // hashed password stored here
  urls: [{ type: mongoose.Schema.Types.ObjectId, ref: "Url" }]
});

module.exports = mongoose.model("User", userSchema);
