const fs = require("fs");
const Resume = require("../models/Resume");
const GroqAgent = require("../services/GroqAgent");
const {
  parseResumeFile,
  buildResumeTextPdf,
  ensureResumeDirectory,
} = require("../services/ResumeDocumentService");
const { scoreResume } = require("../services/ResumeATS");
const { structureResumeText } = require("../services/ResumeStructuringService");
const { structureJobDescription } = require("../services/JobDescriptionService");
const { matchResumeToJob } = require("../services/ResumeMatchService");
const { buildMatchPresentation } = require("../services/MatchAnalysisPresentationService");

const isMongoId = (value) => /^[a-f\d]{24}$/i.test(String(value || ""));

const removeFileIfExists = (filePath) => {
  if (!filePath || !fs.existsSync(filePath)) return;
  try {
    fs.unlinkSync(filePath);
  } catch (error) {
    console.warn("Failed to remove resume asset:", filePath, error.message);
  }
};

const buildOptimizationPrompt = ({
  text,
  targetRole,
  score,
  suggestions,
}) => `You are rewriting a real resume for ATS performance.

Rules:
- Preserve only facts from the original resume.
- Do not invent experience, degrees, companies, or tools.
- Improve clarity, keyword coverage, and formatting.
- Keep it professional, concise, and ATS-friendly.
- Use clear section headings.
- Return plain text only, no markdown fences.

Target role: ${targetRole}
Current ATS score: ${score.overall}/100
Current strengths: ${(score.strengths || []).join(" | ") || "None"}
Current gaps: ${(score.gaps || []).join(" | ") || "None"}
Suggested improvements: ${(suggestions || []).join(" | ") || "None"}

Original resume text:
${text}`;

const buildDownloadPath = (resume, version = "optimized") => {
  if (version === "original") return resume.original?.filePath;
  if (resume.optimized?.filePath) return resume.optimized.filePath;
  return resume.original?.filePath;
};

exports.uploadResume = async (req, res) => {
  try {
    const file = req.file;
    const { targetRole = "Software Engineer" } = req.body;

    if (!file) {
      return res.status(400).json({ error: "Resume file is required" });
    }

    ensureResumeDirectory();
    const extractedText = await parseResumeFile(
      file.path,
      file.mimetype,
      file.originalname,
    );
    const atsScore = scoreResume({ text: extractedText, targetRole });

    const resume = new Resume({
      user: req.user.id,
      targetRole,
      original: {
        fileName: file.originalname,
        filePath: file.path,
        mimeType: file.mimetype,
        extractedText,
      },
      atsScore,
      suggestions: atsScore.suggestions,
      structuringStatus: "processing",
    });

    if (isMongoId(req.user.id)) {
      await resume.save();
    }

    // Structure extracted resume text using LLM service
    try {
      const structuringResult = await structureResumeText(extractedText);
      if (structuringResult.success) {
        resume.structuredResume = structuringResult.data;
        resume.structuringStatus = "structured";
      } else {
        resume.structuringStatus = "structure_failed";
        console.warn("Resume structuring warning:", structuringResult.error);
      }
    } catch (structError) {
      resume.structuringStatus = "structure_failed";
      console.error("Resume structuring exception:", structError.message);
    }

    if (isMongoId(req.user.id)) {
      await resume.save();
    }

    return res.status(201).json({
      message: "Resume analyzed successfully",
      resume,
    });
  } catch (error) {
    console.error("Upload resume error:", error);
    return res
      .status(500)
      .json({ error: error.message || "Failed to analyze resume" });
  }
};

exports.deleteResume = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isMongoId(id)) {
      return res.status(400).json({ error: "Invalid resume id" });
    }

    const resume = await Resume.findOne({ _id: id, user: req.user.id });
    if (!resume) {
      return res.status(404).json({ error: "Resume not found" });
    }

    removeFileIfExists(resume.original?.filePath);
    removeFileIfExists(resume.optimized?.filePath);
    removeFileIfExists(resume.optimized?.filePath?.replace(/\.pdf$/i, ".txt"));

    await Resume.deleteOne({ _id: id, user: req.user.id });

    return res.json({ message: "Resume deleted successfully", resumeId: id });
  } catch (error) {
    console.error("Delete resume error:", error);
    return res.status(500).json({ error: "Failed to delete resume" });
  }
};

exports.getUserResumes = async (req, res) => {
  try {
    if (!isMongoId(req.user.id)) {
      return res.json({ resumes: [] });
    }

    const resumes = await Resume.find({ user: req.user.id }).sort({
      createdAt: -1,
    });
    return res.json({ resumes });
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch resumes" });
  }
};

exports.getLatestResume = async (req, res) => {
  try {
    if (!isMongoId(req.user.id)) {
      return res.json({ resume: null });
    }

    const resume = await Resume.findOne({ user: req.user.id }).sort({
      updatedAt: -1,
      createdAt: -1,
    });
    return res.json({ resume });
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch latest resume" });
  }
};

exports.improveResume = async (req, res) => {
  try {
    const { id } = req.params;
    const { targetRole } = req.body;

    if (!isMongoId(id)) {
      return res.status(400).json({ error: "Invalid resume id" });
    }

    const resume = await Resume.findOne({ _id: id, user: req.user.id });
    if (!resume) {
      return res.status(404).json({ error: "Resume not found" });
    }

    const currentText =
      resume.optimized?.extractedText || resume.original.extractedText || "";
    const currentScore =
      resume.optimized?.atsScore ||
      resume.atsScore ||
      scoreResume({
        text: currentText,
        targetRole: targetRole || resume.targetRole,
      });
    const nextTargetRole =
      targetRole || resume.targetRole || "Software Engineer";

    const prompt = buildOptimizationPrompt({
      text: currentText,
      targetRole: nextTargetRole,
      score: currentScore,
      suggestions: currentScore.suggestions || resume.suggestions || [],
    });

    const optimizedText = await GroqAgent.generate(
      prompt,
      "You are a precise ATS resume editor.",
    );
    const optimizedScore = scoreResume({
      text: optimizedText,
      targetRole: nextTargetRole,
    });
    const optimizedFile = await buildResumeTextPdf({
      text: optimizedText,
      title: `${resume.original.fileName.replace(/\.[^.]+$/, "") || "Resume"} - ATS Optimized`,
    });
    fs.writeFileSync(
      optimizedFile.filePath.replace(/\.pdf$/i, ".txt"),
      optimizedText,
      "utf8",
    );

    resume.targetRole = nextTargetRole;
    resume.optimized = {
      fileName: optimizedFile.fileName,
      filePath: optimizedFile.filePath,
      mimeType: optimizedFile.mimeType,
      extractedText: optimizedText,
      atsScore: optimizedScore,
      generatedAt: new Date(),
    };
    resume.atsScore = currentScore;
    resume.suggestions = currentScore.suggestions || [];

    await resume.save();

    return res.json({
      message: "Resume improved successfully",
      resume,
    });
  } catch (error) {
    console.error("Improve resume error:", error);
    return res
      .status(500)
      .json({ error: error.message || "Failed to improve resume" });
  }
};

exports.downloadResume = async (req, res) => {
  try {
    const { id } = req.params;
    const version = String(req.query.version || "optimized").toLowerCase();

    if (!isMongoId(id)) {
      return res.status(400).json({ error: "Invalid resume id" });
    }

    const resume = await Resume.findOne({ _id: id, user: req.user.id });
    if (!resume) {
      return res.status(404).json({ error: "Resume not found" });
    }

    const filePath = buildDownloadPath(resume, version);
    if (!filePath || !fs.existsSync(filePath)) {
      return res.status(404).json({ error: "Resume file not available" });
    }

    const downloadName =
      version === "original"
        ? resume.original.fileName
        : resume.optimized?.fileName ||
        `${resume.original.fileName.replace(/\.[^.]+$/, "")}-optimized.pdf`;

    return res.download(filePath, downloadName);
  } catch (error) {
    console.error("Download resume error:", error);
    return res.status(500).json({ error: "Failed to download resume" });
  }
};

exports.optimizeBullet = async (req, res) => {
  try {
    const { bullet, targetRole = "Software Engineer" } = req.body;
    if (!bullet || !bullet.trim()) {
      return res.status(400).json({ error: "Bullet point is required" });
    }

    const prompt = `Optimize the following resume bullet point for a ${targetRole} position. Use the STAR methodology (Situation, Task, Action, Result) or Google's XYZ formula (Accomplished [X] as measured by [Y], by doing [Z]). Make it highly professional, impact-driven, start with a strong action verb, and include metrics where possible.

    Original bullet point: "${bullet}"

    Output ONLY the single optimized bullet point. Do not add any conversational text, explanations, or quotes.`;

    const optimized = await GroqAgent.generate(prompt, "You are a professional ATS resume optimizer.");

    // Clean up response if there are any extra quotes or bullet prefixes
    let cleaned = optimized.trim().replace(/^["'•\-* ]+|["' ]+$/g, "");
    cleaned = "• " + cleaned;

    return res.json({
      original: bullet,
      optimized: cleaned
    });
  } catch (error) {
    console.error("Optimize bullet error:", error);
    return res.status(500).json({ error: error.message || "Failed to optimize bullet point" });
  }
};

exports.analyzeJob = async (req, res) => {
  try {
    const { id } = req.params;
    const { jobDescription } = req.body;

    if (!isMongoId(id)) {
      return res.status(400).json({ error: "Invalid resume id" });
    }

    if (!jobDescription || typeof jobDescription !== "string" || !jobDescription.trim()) {
      return res.status(400).json({ error: "Job description is required" });
    }

    if (jobDescription.length > 50000) {
      return res.status(400).json({ error: "Job description exceeds maximum length of 50,000 characters." });
    }

    const resume = await Resume.findOne({ _id: id, user: req.user.id });
    if (!resume) {
      return res.status(404).json({ error: "Resume not found or access denied" });
    }

    resume.jobAnalysisStatus = "processing";
    if (isMongoId(req.user.id)) {
      await resume.save();
    }

    const result = await structureJobDescription(jobDescription);

    if (result.success) {
      resume.jobAnalysis = result.data;
      resume.jobAnalysisStatus = "analyzed";
      if (result.data.jobTitle && result.data.jobTitle !== "Target Role") {
        resume.targetRole = result.data.jobTitle;
      }
    } else {
      resume.jobAnalysisStatus = "failed";
      console.warn("Job description structuring warning:", result.error);
    }

    if (isMongoId(req.user.id)) {
      await resume.save();
    }

    if (!result.success) {
      return res.status(422).json({
        error: result.error || "Failed to structure job description",
        resume,
      });
    }

    return res.status(200).json({
      message: "Job description analyzed successfully",
      jobAnalysis: result.data,
      resume,
    });
  } catch (error) {
    console.error("Analyze job error:", error);
    return res.status(500).json({ error: error.message || "Failed to analyze job description" });
  }
};

exports.matchJob = async (req, res) => {
  try {
    const { id } = req.params;
    const { jobDescription } = req.body;

    if (!isMongoId(id)) {
      return res.status(400).json({ error: "Invalid resume id" });
    }

    if (!jobDescription || typeof jobDescription !== "string" || !jobDescription.trim()) {
      return res.status(400).json({ error: "Job description is required" });
    }

    if (jobDescription.length > 50000) {
      return res.status(400).json({ error: "Job description exceeds maximum length of 50,000 characters." });
    }

    const resume = await Resume.findOne({ _id: id, user: req.user.id });
    if (!resume) {
      return res.status(404).json({ error: "Resume not found or access denied" });
    }

    if (!resume.structuredResume || typeof resume.structuredResume !== "object") {
      return res.status(422).json({
        error: "Resume has not been successfully parsed or structured yet. Please upload and process the resume first.",
        structuringStatus: resume.structuringStatus || "pending",
      });
    }

    resume.matchAnalysisStatus = "processing";
    if (isMongoId(req.user.id)) {
      await resume.save();
    }

    // Ensure Job Description is structured
    let jobAnalysis = resume.jobAnalysis;
    if (!jobAnalysis || typeof jobAnalysis !== "object" || !Array.isArray(jobAnalysis.requiredSkills)) {
      const jdResult = await structureJobDescription(jobDescription);
      if (!jdResult.success) {
        resume.matchAnalysisStatus = "failed";
        if (isMongoId(req.user.id)) {
          await resume.save();
        }
        return res.status(422).json({
          error: jdResult.error || "Failed to structure job description for matching",
        });
      }
      jobAnalysis = jdResult.data;
      resume.jobAnalysis = jobAnalysis;
      resume.jobAnalysisStatus = "analyzed";
      if (jobAnalysis.jobTitle && jobAnalysis.jobTitle !== "Target Role") {
        resume.targetRole = jobAnalysis.jobTitle;
      }
    }

    // Execute Explainable Semantic Match Engine
    const matchResult = await matchResumeToJob(jobAnalysis, resume.structuredResume);

    resume.matchAnalysis = matchResult;
    resume.matchAnalysisStatus = "analyzed";

    if (isMongoId(req.user.id)) {
      await resume.save();
    }

    // Build presentation layer on top of raw match data
    const presentation = buildMatchPresentation(
      matchResult,
      resume.jobAnalysis,
      resume.structuredResume
    );

    return res.status(200).json({
      success: true,
      message: "Job match analysis completed successfully",
      matchAnalysis: matchResult,
      presentation,
      resume,
    });
  } catch (error) {
    console.error("[resumeController.matchJob] Error executing match analysis:", error.message);
    try {
      if (req.params?.id && isMongoId(req.params.id) && isMongoId(req.user?.id)) {
        await Resume.updateOne(
          { _id: req.params.id, user: req.user.id },
          { $set: { matchAnalysisStatus: "failed" } }
        );
      }
    } catch (saveErr) {
      console.warn("Failed to mark matchAnalysisStatus as failed:", saveErr.message);
    }

    return res.status(500).json({
      error: "Failed to execute job match analysis. Please try again.",
    });
  }
};
