const Project = require('../models/Project');
const GitHubService = require('../services/GitHubService');
const AgentOrchestrator = require('../services/AgentOrchestrator');

exports.analyzeProject = async (req, res) => {
  try {
    const { repositoryUrl, name } = req.body;
    const userId = req.user.id; // From authMiddleware

    if (!repositoryUrl) {
      return res.status(400).json({ error: "Repository URL is required" });
    }

    const githubRegex = /^https?:\/\/(www\.)?github\.com\/[\w-]+\/[\w.-]+\/?$/;
    if (!githubRegex.test(repositoryUrl)) {
      return res.status(400).json({ error: "Invalid GitHub URL. Please use https://github.com/user/repo" });
    }

    // 1. Fetch Repository Data
    console.log(`Fetching repo: ${repositoryUrl}`);
    const repoData = await GitHubService.fetchRepoContents(repositoryUrl);

    // 2. Run AI Agent Pipeline
    console.log('Running AI Agents...');
    const results = await AgentOrchestrator.runFullAnalysisPipeline(repoData);

    // 3. Save to Database
    const project = new Project({
      user: userId,
      name: name || repoData.repository || 'My Project',
      repositoryUrl,
      analysis: {
        overview: results.overview,
        explanation: results.explanation,
        architecture: results.architecture,
        techStack: results.techStack,
        improvements: results.improvements,
        demoScript: results.demoScript,
        healthScore: results.healthScore
      },
      projectDNA: results.projectDNA,
      vivaPrep: results.vivaPrep,
      resumePoints: results.resumePoints,
    });

    try {
      await project.save();
    } catch (dbError) {
      console.warn("Could not save project to database. Persistence disabled for this session.");
    }

    res.status(200).json({
      message: "Analysis Complete",
      project
    });

  } catch (error) {
    console.error("Analysis Controller Error:", error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
};

exports.compareProjects = async (req, res) => {
  try {
    const { projectAUrl, projectBUrl } = req.body;
    const githubRegex = /^https?:\/\/(www\.)?github\.com\/[\w-]+\/[\w.-]+\/?$/;

    if (!githubRegex.test(projectAUrl || '') || !githubRegex.test(projectBUrl || '')) {
      return res.status(400).json({ error: "Please enter two valid GitHub repository URLs" });
    }

    const [repoA, repoB] = await Promise.all([
      GitHubService.fetchRepoContents(projectAUrl),
      GitHubService.fetchRepoContents(projectBUrl),
    ]);

    const scoreA = AgentOrchestrator.scoreProject(repoA);
    const scoreB = AgentOrchestrator.scoreProject(repoB);
    const metrics = [
      ['Performance', 'performance'],
      ['Code Quality', 'codeQuality'],
      ['Scalability', 'scalability'],
      ['UI/UX', 'uiux'],
    ].map(([label, key]) => ({
      label,
      key,
      projectA: scoreA[key],
      projectB: scoreB[key],
      winner: scoreA[key] === scoreB[key] ? 'Tie' : scoreA[key] > scoreB[key] ? 'A' : 'B',
    }));

    res.json({
      projectA: { name: repoA.repository, url: projectAUrl, score: scoreA },
      projectB: { name: repoB.repository, url: projectBUrl, score: scoreB },
      winner: scoreA.overall === scoreB.overall ? 'Tie' : scoreA.overall > scoreB.overall ? 'A' : 'B',
      metrics,
    });
  } catch (error) {
    res.status(500).json({ error: error.message || "Failed to compare projects" });
  }
};

exports.getUserProjects = async (req, res) => {
  try {
    const projects = await Project.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json({ projects });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch projects" });
  }
};
