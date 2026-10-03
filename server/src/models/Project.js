const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  repositoryUrl: { type: String },
  analysis: {
    overview: { type: String },
    explanation: { type: String },
    architecture: { type: String },
    techStack: [String],
    improvements: { type: String },
    demoScript: { type: String },
    healthScore: {
      overall: { type: Number },
      performance: { type: Number },
      codeQuality: { type: Number },
      scalability: { type: Number },
      uiux: { type: Number },
      signals: [String],
    },
  },
  projectDNA: {
    projectName: { type: String },
    category: { type: String },
    complexity: { type: String },
    architecture: { type: String },
    frontend: { type: String },
    backend: { type: String },
    database: { type: String },
    authentication: { type: String },
    apis: [String],
    features: [String],
    components: { type: Number, default: 0 },
    routes: { type: Number, default: 0 },
    models: { type: Number, default: 0 },
    services: { type: Number, default: 0 },
    files: { type: Number, default: 0 },
    linesOfCode: { type: Number, default: 0 }
  },
  vivaPrep: [{
    question: { type: String },
    answer: { type: String },
  }],
  resumePoints: [String],
  mockInterviewChat: [{
    sender: { type: String, enum: ['ai', 'user'] },
    message: { type: String },
    timestamp: { type: Date, default: Date.now },
  }],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Project', projectSchema);
