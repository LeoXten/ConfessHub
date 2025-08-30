const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const app = express();

// ✅ CORS: allow your real Render URL + localhost
app.use(cors({
  origin: [
    "https://confesshub-pi3x.onrender.com", // ✅ your real Render frontend
    "http://localhost:5000"                 // ✅ for local dev
  ],
  credentials: true
}));


// ✅ Parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Serve static files from /public
app.use(express.static("public"));

// ✅ MongoDB connection
const mongoURI =
  process.env.MONGO_URI ||
  "mongodb+srv://gdebanjan89_db_user:DEgh15@cluster3.odjibsr.mongodb.net/confesshub?retryWrites=true&w=majority&appName=Cluster3";

mongoose
  .connect(mongoURI, {})
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Error", err));

// ✅ Schema
const secretSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});
const Secret = mongoose.model("Secret", secretSchema);

// ✅ API: Save secret
app.post("/api/submit", async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ success: false, msg: "Message is required." });
    }
    const userId = new mongoose.Types.ObjectId();
    const newSecret = new Secret({ userId, message });
    await newSecret.save();
    res.json({ success: true, msg: "Secret saved successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, msg: "Error saving secret." });
  }
});

// ✅ API: Delete secret
app.delete("/api/secrets/:id", async (req, res) => {
  try {
    await Secret.findByIdAndDelete(req.params.id);
    res.json({ success: true, msg: "Secret deleted successfully!" });
  } catch (err) {
    res.status(500).json({ success: false, msg: "Error deleting secret." });
  }
});

// ✅ API: Get all secrets
app.get("/api/secrets", async (req, res) => {
  try {
    const secrets = await Secret.find().sort({ timestamp: -1 });
    res.json(secrets);
  } catch (err) {
    res.status(500).json({ success: false, msg: "Error fetching secrets." });
  }
});

// ✅ Serve Admin Panel
app.get("/adminDE15.html", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "adminDE15.html"));
});

// ✅ Serve User Homepage
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ✅ Start server (use Render's PORT)
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT}`)
);
