// const express = require("express");
// const cors = require("cors");
// const dotenv = require("dotenv");
// const path = require("path");
// const connectDB = require("./config/db");

// dotenv.config({ path: path.join(__dirname, "..", ".env") });

// // Connect to Database
// connectDB();

// const app = express();
// const PORT = process.env.PORT || 5000;

// app.use(cors());
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

// app.get("/", (req, res) => {
//   res.send("CodeDNA API is running.");
// });

// // Import Routes
// const authRoutes = require("./routes/authRoutes");
// const projectRoutes = require("./routes/projectRoutes");
// const resumeRoutes = require("./routes/resumeRoutes");

// app.use("/api/auth", authRoutes);
// app.use("/api/projects", projectRoutes);
// app.use("/api/resume", resumeRoutes);

// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "..", ".env") });

const connectDB = require("./config/db");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

app.get("/", (req, res) => {
  res.send("PrepAI API Running");
});

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/projects", require("./routes/projectRoutes"));
app.use("/api/resume", require("./routes/resumeRoutes"));

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`🚀 Server running on ${PORT}`);
  });
};

startServer();