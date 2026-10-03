const express = require("express");
const multer = require("multer");
const path = require("path");
const resumeController = require("../controllers/resumeController");
const authMiddleware = require("../middleware/auth");
const {
  ensureResumeDirectory,
  RESUME_UPLOAD_DIR,
} = require("../services/ResumeDocumentService");

const router = express.Router();
ensureResumeDirectory();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, RESUME_UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const safeBase = path
      .basename(file.originalname, path.extname(file.originalname))
      .replace(/[^a-z0-9-_]+/gi, "-")
      .replace(/^-+|-+$/g, "")
      .toLowerCase();
    cb(
      null,
      `${Date.now()}-${safeBase || "resume"}${path.extname(file.originalname).toLowerCase()}`,
    );
  },
});

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
    "text/markdown",
  ];

  const allowedExtensions = [".pdf", ".doc", ".docx", ".txt", ".md"];
  const ext = path.extname(file.originalname).toLowerCase();

  if (
    allowedMimeTypes.includes(file.mimetype) ||
    allowedExtensions.includes(ext)
  ) {
    cb(null, true);
    return;
  }

  cb(new Error("Only PDF, DOC, DOCX, TXT, or MD files are allowed"));
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 8 * 1024 * 1024 },
});

router.get("/", authMiddleware, resumeController.getUserResumes);
router.get("/latest", authMiddleware, resumeController.getLatestResume);
router.post(
  "/upload",
  authMiddleware,
  upload.single("resume"),
  resumeController.uploadResume,
);
router.post("/:id/improve", authMiddleware, resumeController.improveResume);
router.get("/:id/download", authMiddleware, resumeController.downloadResume);
router.delete("/:id", authMiddleware, resumeController.deleteResume);
router.post("/optimize-bullet", authMiddleware, resumeController.optimizeBullet);

module.exports = router;
