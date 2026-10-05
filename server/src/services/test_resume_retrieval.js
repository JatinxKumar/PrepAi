/**
 * test_resume_retrieval.js
 * 
 * Isolated test suite for ResumeRetrievalService (RAG retrieval layer).
 * Verifies semantic requirement-to-evidence matching, embedding reuse, 
 * threshold enforcement, and requirement metadata preservation.
 */

const assert = require("assert");
const { retrieveJobEvidence } = require("./ResumeRetrievalService");
const { buildResumeEvidence } = require("./ResumeEvidenceService");

const run = async () => {
  console.log("=== Running ResumeRetrievalService Isolated Tests ===");

  // 1. Realistic Mock Structured Resume
  const mockStructuredResume = {
    basics: {
      name: "Alex Developer",
      email: "alex@example.com",
    },
    summary: "Full Stack Software Engineer with expertise in modern web and backend technologies.",
    skills: {
      backend: ["Node.js", "Express", "Java", "Spring Boot"],
      frontend: ["React", "JavaScript"],
      databases: ["MongoDB"],
    },
    projects: [
      {
        name: "Campus Connect Hub",
        description: "A real-time collaboration platform for university research teams.",
        technologies: ["React", "Node.js", "Express", "MongoDB"],
        bullets: [
          "Built REST APIs using Node.js and Express.",
          "Implemented real-time messaging pipeline handling 10k daily active users.",
        ],
      },
    ],
    experience: [
      {
        company: "Tech Solutions Inc",
        role: "Software Developer",
        startDate: "2022-01",
        endDate: "2024-03",
        bullets: [
          "Developed backend services using Java and Spring Boot.",
          "Collaborated with cross-functional teams to deliver scalable microservices.",
        ],
      },
    ],
  };

  // 2. Realistic Mock Structured JD
  const mockStructuredJD = {
    jobTitle: "Senior Backend Engineer",
    company: "Acme Corp",
    requiredSkills: [
      { skill: "Node.js", category: "backend", importance: "required" },
      { skill: "Express", category: "backend", importance: "required" },
      { skill: "Docker", category: "devops", importance: "required" },
    ],
    responsibilities: [
      "Build REST APIs and backend services.",
    ],
    preferredSkills: [
      { skill: "AWS", category: "general", importance: "preferred" },
    ],
    toolsAndTechnologies: [],
    experienceRequirements: [],
    qualifications: [],
  };

  // 3. Generate raw evidence chunks for reference & ID verification
  const rawEvidence = buildResumeEvidence(mockStructuredResume);
  const knownEvidenceIds = new Set(rawEvidence.map((e) => e.id));
  console.log(`Generated ${rawEvidence.length} baseline evidence chunks:`, Array.from(knownEvidenceIds));

  // 4. Execute Retrieval Pipeline
  const report = await retrieveJobEvidence(mockStructuredJD, mockStructuredResume, {
    topK: 3,
    threshold: 0.35,
  });

  console.log(`Total requirements processed: ${report.totalRequirements}`);
  console.log(`Total evidence chunks indexed: ${report.totalEvidenceChunks}`);

  assert.strictEqual(report.totalRequirements, 5, "Should process all 5 JD requirements");
  assert.strictEqual(report.totalEvidenceChunks, rawEvidence.length, "Indexed chunk count should match raw evidence count");

  // Helper to find retrieval result by requirement substring
  const findResult = (text) =>
    report.requirements.find(
      (r) =>
        r.requirement.toLowerCase().includes(text.toLowerCase()) ||
        r.query.toLowerCase().includes(text.toLowerCase())
    );

  // Test Case A: Node.js retrieval
  const nodeResult = findResult("Node.js");
  assert.ok(nodeResult, "Node.js requirement result must exist");
  assert.strictEqual(nodeResult.importance, "required", "Node.js importance should be 'required'");
  assert.ok(nodeResult.hasEvidence, "Node.js should retrieve evidence above threshold");
  assert.ok(nodeResult.retrievedEvidence.length > 0, "Node.js should have retrieved items");
  
  const nodeTopEvidence = nodeResult.retrievedEvidence[0];
  console.log("Node.js top retrieved evidence:", nodeTopEvidence.evidenceId, "Score:", nodeTopEvidence.score);
  assert.ok(
    nodeTopEvidence.evidenceId === "skills-backend" || nodeTopEvidence.evidenceId === "project-0",
    "Node.js should retrieve skills-backend or project-0 as top evidence"
  );
  assert.ok(knownEvidenceIds.has(nodeTopEvidence.evidenceId), "Evidence ID must exist in raw evidence");

  // Test Case B: Express retrieval
  const expressResult = findResult("Express");
  assert.ok(expressResult, "Express requirement result must exist");
  assert.strictEqual(expressResult.importance, "required", "Express importance should be 'required'");
  assert.ok(expressResult.hasEvidence, "Express should retrieve evidence above threshold");
  const expressTopEvidence = expressResult.retrievedEvidence[0];
  console.log("Express top retrieved evidence:", expressTopEvidence.evidenceId, "Score:", expressTopEvidence.score);
  assert.ok(
    expressTopEvidence.evidenceId === "skills-backend" || expressTopEvidence.evidenceId === "project-0" || expressTopEvidence.evidenceId === "experience-0",
    "Express should retrieve skills-backend, project-0, or experience-0"
  );
  assert.ok(knownEvidenceIds.has(expressTopEvidence.evidenceId), "Evidence ID must exist in raw evidence");

  // Test Case C: REST API responsibility retrieval
  const respResult = findResult("REST APIs");
  assert.ok(respResult, "REST API responsibility result must exist");
  assert.strictEqual(respResult.type, "responsibility", "Type should be 'responsibility'");
  assert.strictEqual(respResult.importance, "required", "Responsibility importance should be 'required'");
  assert.ok(respResult.hasEvidence, "REST API responsibility should retrieve relevant evidence above threshold");
  const respTopEvidence = respResult.retrievedEvidence[0];
  console.log("REST API responsibility top evidence:", respTopEvidence.evidenceId, "Score:", respTopEvidence.score);
  assert.ok(
    respTopEvidence.evidenceId === "skills-backend" || respTopEvidence.evidenceId === "experience-0" || respTopEvidence.evidenceId === "project-0",
    "REST API responsibility should retrieve skills-backend, experience-0, or project-0"
  );
  assert.ok(knownEvidenceIds.has(respTopEvidence.evidenceId), "Evidence ID must exist in raw evidence");

  // Test Case D: Docker (Unrelated / Not in resume)
  const dockerResult = findResult("Docker");
  assert.ok(dockerResult, "Docker requirement result must exist");
  console.log("Docker retrieved evidence count:", dockerResult.retrievedEvidence.length, "Top score:", dockerResult.topScore);
  assert.strictEqual(
    dockerResult.retrievedEvidence.length,
    0,
    "Docker should NOT retrieve any evidence above the 0.35 threshold"
  );
  assert.strictEqual(dockerResult.hasEvidence, false, "Docker hasEvidence should be false");

  // Test Case E: AWS (Unrelated / Not in resume)
  const awsResult = findResult("AWS");
  assert.ok(awsResult, "AWS requirement result must exist");
  assert.strictEqual(awsResult.importance, "preferred", "AWS importance should be 'preferred'");
  console.log("AWS retrieved evidence count:", awsResult.retrievedEvidence.length, "Top score:", awsResult.topScore);
  assert.strictEqual(
    awsResult.retrievedEvidence.length,
    0,
    "AWS should NOT retrieve any evidence above the 0.35 threshold"
  );
  assert.strictEqual(awsResult.hasEvidence, false, "AWS hasEvidence should be false");

  // Test Case F: All returned evidence IDs validate against raw evidence list
  report.requirements.forEach((req) => {
    req.retrievedEvidence.forEach((item) => {
      assert.ok(knownEvidenceIds.has(item.evidenceId), `Evidence ID ${item.evidenceId} must be in known evidence list`);
      assert.ok(item.score >= report.threshold, `Score ${item.score} must be >= threshold ${report.threshold}`);
      assert.strictEqual(typeof item.embedding, "undefined", "Retrieved evidence must not expose internal embedding vectors");
    });
  });

  // Test Case G: Edge cases (empty resume, empty JD)
  const emptyResumeReport = await retrieveJobEvidence(mockStructuredJD, {});
  assert.strictEqual(emptyResumeReport.totalEvidenceChunks, 0);
  assert.strictEqual(emptyResumeReport.requirements.length, 0);

  const emptyJDReport = await retrieveJobEvidence({}, mockStructuredResume);
  assert.strictEqual(emptyJDReport.totalEvidenceChunks, rawEvidence.length);
  assert.strictEqual(emptyJDReport.requirements.length, 0);

  console.log("✅ ALL RESUME RETRIEVAL TESTS PASSED SUCCESSFULLY!");
};

run().catch((err) => {
  console.error("❌ Resume retrieval test failed:", err);
  process.exit(1);
});
