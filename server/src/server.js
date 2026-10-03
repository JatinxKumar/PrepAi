const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "..", ".env") });

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const projectRoutes = require("./routes/projectRoutes");
const resumeRoutes = require("./routes/resumeRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

// Ensure DB connected on incoming requests
app.use(async (req, res, next) => {
  try {
    await connectDB();
  } catch (e) {
    console.error("DB connection error in middleware:", e.message);
  }
  next();
});

app.get("/", (req, res) => {
  res.send("PrepAI API Running");
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Explicitly register routes with function checks
if (typeof authRoutes === "function") {
  app.use("/api/auth", authRoutes);
} else {
  console.error("authRoutes is not a valid function handler:", authRoutes);
}

if (typeof projectRoutes === "function") {
  app.use("/api/projects", projectRoutes);
} else {
  console.error("projectRoutes is not a valid function handler:", projectRoutes);
}

if (typeof resumeRoutes === "function") {
  app.use("/api/resume", resumeRoutes);
} else {
  console.error("resumeRoutes is not a valid function handler:", resumeRoutes);
}

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Express App Error:", err);
  res.status(err.status || 500).json({ error: err.message || "Internal Server Error" });
});

if (process.env.NODE_ENV !== "production" || !process.env.VERCEL) {
  connectDB().then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Server running on ${PORT}`);
    });
  });
}

module.exports = app;
