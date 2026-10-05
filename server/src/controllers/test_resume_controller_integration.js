/**
 * test_resume_controller_integration.js
 * 
 * Integration test for resumeController.matchJob API endpoint logic.
 * Tests ownership authentication, input validation, structured resume requirement,
 * match analysis generation, and error resilience.
 */

const assert = require("assert");
const { matchJob } = require("./resumeController");
const Resume = require("../models/Resume");

// Mock Response Builder
const createMockRes = () => {
  const res = {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.body = data;
      return this;
    },
  };
  return res;
};

const run = async () => {
  console.log("=== Running Resume Controller matchJob Integration Tests ===");

  const validUserId = "507f1f77bcf86cd799439011";
  const otherUserId = "507f1f77bcf86cd799439022";
  const validResumeId = "507f1f77bcf86cd799439033";

  // Test 1: Invalid Resume ID format
  {
    const req = {
      params: { id: "invalid-id" },
      body: { jobDescription: "Looking for Node.js engineer" },
      user: { id: validUserId },
    };
    const res = createMockRes();
    await matchJob(req, res);
    assert.strictEqual(res.statusCode, 400, "Invalid ID should return 400");
    assert.ok(res.body.error.includes("Invalid"), "Error should mention invalid id");
    console.log("✓ Invalid resume ID test passed (400)");
  }

  // Test 2: Empty Job Description
  {
    const req = {
      params: { id: validResumeId },
      body: { jobDescription: "   " },
      user: { id: validUserId },
    };
    const res = createMockRes();
    await matchJob(req, res);
    assert.strictEqual(res.statusCode, 400, "Empty JD should return 400");
    console.log("✓ Empty JD test passed (400)");
  }

  // Test 3: JD exceeding 50,000 chars
  {
    const req = {
      params: { id: validResumeId },
      body: { jobDescription: "A".repeat(50001) },
      user: { id: validUserId },
    };
    const res = createMockRes();
    await matchJob(req, res);
    assert.strictEqual(res.statusCode, 400, "Exceeded length JD should return 400");
    assert.ok(res.body.error.includes("50,000"), "Error message should mention limit");
    console.log("✓ Max JD length test passed (400)");
  }

  // Test 4: Resume not found or non-owner
  {
    // Mock Resume.findOne returning null
    const origFindOne = Resume.findOne;
    Resume.findOne = async () => null;

    const req = {
      params: { id: validResumeId },
      body: { jobDescription: "Looking for React developer" },
      user: { id: otherUserId },
    };
    const res = createMockRes();
    await matchJob(req, res);
    assert.strictEqual(res.statusCode, 404, "Non-owner resume should return 404");

    Resume.findOne = origFindOne;
    console.log("✓ Non-owner resume test passed (404)");
  }

  // Test 5: Resume without structuredResume
  {
    const mockResumeDoc = {
      _id: validResumeId,
      user: validUserId,
      structuringStatus: "pending",
      structuredResume: null,
      save: async () => {},
    };

    const origFindOne = Resume.findOne;
    Resume.findOne = async () => mockResumeDoc;

    const req = {
      params: { id: validResumeId },
      body: { jobDescription: "Looking for Java developer" },
      user: { id: validUserId },
    };
    const res = createMockRes();
    await matchJob(req, res);
    assert.strictEqual(res.statusCode, 422, "Resume without structuredResume should return 422");
    assert.ok(res.body.error.includes("structured"), "Error message should mention structuring");

    Resume.findOne = origFindOne;
    console.log("✓ Unstructured resume test passed (422)");
  }

  // Test 6: Successful Match Job Execution
  {
    const mockStructuredResume = {
      basics: { name: "Dev" },
      skills: { backend: ["Node.js", "Express"] },
      projects: [
        {
          name: "Project A",
          technologies: ["Node.js", "Express"],
          bullets: ["Built REST APIs using Node.js and Express."],
        },
      ],
    };

    const mockJobAnalysis = {
      jobTitle: "Backend Developer",
      requiredSkills: [{ skill: "Node.js", category: "backend", importance: "required" }],
      preferredSkills: [],
      responsibilities: ["Build REST APIs"],
    };

    let savedStatus = "";
    let savedMatchAnalysis = null;

    const mockResumeDoc = {
      _id: validResumeId,
      user: validUserId,
      structuredResume: mockStructuredResume,
      structuringStatus: "structured",
      jobAnalysis: mockJobAnalysis,
      jobAnalysisStatus: "analyzed",
      matchAnalysisStatus: "none",
      matchAnalysis: null,
      save: async function () {
        savedStatus = this.matchAnalysisStatus;
        savedMatchAnalysis = this.matchAnalysis;
      },
    };

    const origFindOne = Resume.findOne;
    Resume.findOne = async () => mockResumeDoc;

    const req = {
      params: { id: validResumeId },
      body: { jobDescription: "We need a Node.js backend developer to build REST APIs." },
      user: { id: validUserId },
    };
    const res = createMockRes();
    await matchJob(req, res);

    assert.strictEqual(res.statusCode, 200, "Valid matchJob should return 200");
    assert.strictEqual(res.body.success, true, "Response success should be true");
    assert.ok(res.body.matchAnalysis, "Response must include matchAnalysis");
    assert.ok(res.body.matchAnalysis.overallScore > 0, "Overall score should be > 0");
    assert.strictEqual(mockResumeDoc.matchAnalysisStatus, "analyzed", "Status should be updated to analyzed");

    Resume.findOne = origFindOne;
    console.log("✓ Successful matchJob execution test passed (200)");
  }

  console.log("✅ ALL CONTROLLER INTEGRATION TESTS PASSED SUCCESSFULLY!");
};

run().catch((err) => {
  console.error("❌ Controller integration test failed:", err);
  process.exit(1);
});
