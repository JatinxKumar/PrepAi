const mongoose = require("mongoose");

const resumeAssetSchema = new mongoose.Schema(
	{
		fileName: { type: String },
		filePath: { type: String },
		mimeType: { type: String },
		extractedText: { type: String, default: "" },
	},
	{ _id: false },
);

const optimizedResumeSchema = new mongoose.Schema(
	{
		fileName: { type: String },
		filePath: { type: String },
		mimeType: { type: String },
		extractedText: { type: String, default: "" },
		atsScore: { type: mongoose.Schema.Types.Mixed, default: null },
		generatedAt: { type: Date },
	},
	{ _id: false },
);

const resumeSchema = new mongoose.Schema(
	{
		user: { type: String, required: true, index: true },
		targetRole: { type: String, default: "Software Engineer" },
		original: { type: resumeAssetSchema, default: () => ({}) },
		optimized: { type: optimizedResumeSchema, default: () => ({}) },
		atsScore: { type: mongoose.Schema.Types.Mixed, default: null },
		suggestions: { type: [String], default: [] },
	},
	{
		timestamps: true,
	},
);

module.exports = mongoose.model("Resume", resumeSchema);
