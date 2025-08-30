const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();
app.use(cors({
  origin: ['https://your-render-app.onrender.com', 'http://localhost:5000'],
  credentials: true
}));
app.use(bodyParser.json());
app.use(express.static("public")); // Serve static files from /public folder

// ✅ MongoDB connection (make sure password is URL-encoded)
// Replace your MongoDB connection line with:
const mongoURI = process.env.MONGO_URI || "...";

mongoose
  .connect(mongoURI, {})
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Error", err));

// Schema
const secretSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const Secret = mongoose.model("Secret", secretSchema);

// API: Save secret (for normal user)
app.post("/api/submit", async (req, res) => {
  try {
    const { message } = req.body;
    const userId = new mongoose.Types.ObjectId(); // Generate unique userId
    const newSecret = new Secret({ userId, message });
    await newSecret.save();
    res.json({ success: true, msg: "Secret saved successfully!" });
  } catch (err) {
    res.status(500).json({ success: false, msg: "Error saving secret." });
  }
});

// DELETE API: remove secret by ID
app.delete("/api/secrets/:id", async (req, res) => {
  try {
    await Secret.findByIdAndDelete(req.params.id);
    res.json({ success: true, msg: "Secret deleted successfully!" });
  } catch (err) {
    res.status(500).json({ success: false, msg: "Error deleting secret." });
  }
});



// API: Get all secrets (for admin panel)
app.get("/api/secrets", async (req, res) => {
  try {
    const secrets = await Secret.find().sort({ timestamp: -1 });
    res.json(secrets);
  } catch (err) {
    res.status(500).json({ success: false, msg: "Error fetching secrets." });
  }
});

// ✅ Serve Admin Panel with hidden URL
app.get("/adminDE15.html", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "adminDE15.html"));
});

// ✅ Serve User Homepage
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Start server
const PORT = 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);
