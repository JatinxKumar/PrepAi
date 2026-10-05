/**
 * test_resume_match.js
 * 
 * Isolated verification test suite for ResumeMatchService.
 * Validates requirement classification (strong/partial/missing),
 * weighted score computation, explanation generation, and lack of fabricated evidence.
 */

const assert = require("assert");
const { matchResumeToJob, calculateMatchScores } = require("./ResumeMatchService");
const { buildResumeEvidence } = require("./ResumeEvidenceService");

const run = async () => {
  console.log("=== Running ResumeMatchService Isolated Tests ===");

  // 1. Mock Structured Resume
  const mockStructuredResume = {
    basics: {
      name: "Jordan Developer",
      email: "jordan@example.com",
    },
    summary: "Full Stack Engineer with 3+ years building high-throughput web applications and REST APIs.",
    skills: {
      frontend: ["React", "JavaScript", "HTML/CSS"],
      backend: ["Node.js", "Express", "Java", "Spring Boot"],
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
    education: [
      {
        institution: "State University",
        degree: "Bachelor of Science",
        field: "Computer Science",
        startDate: "2018-09",
        endDate: "2022-05",
      },
    ],
  };

  // 2. Mock Structured JD
  const mockStructuredJD = {
    jobTitle: "Senior Backend Engineer",
    company: "CloudScale Systems",
    requiredSkills: [
      { skill: "Node.js", category: "backend", importance: "required" },
      { skill: "Express", category: "backend", importance: "required" },
      { skill: "Docker", category: "devops", importance: "required" },
    ],
    responsibilities: [
      "REST API development and backend services.",
    ],
    preferredSkills: [
      { skill: "AWS", category: "cloud", importance: "preferred" },
      { skill: "React", category: "frontend", importance: "preferred" },
    ],
    qualifications: [
      "Bachelor's degree in Computer Science",
    ],
    experienceRequirements: [],
    toolsAndTechnologies: [],
  };

  // 3. Obtain Baseline Raw Evidence IDs
  const rawEvidence = buildResumeEvidence(mockStructuredResume);
  const knownEvidenceIds = new Set(rawEvidence.map((e) => e.id));

  // 4. Run Match Engine
  const matchReport = await matchResumeToJob(mockStructuredJD, mockStructuredResume);

  console.log("Match Report Overview:");
  console.log(`- Overall Score: ${matchReport.overallScore}/100`);
  console.log(`- Required Score: ${matchReport.requiredScore}/100`);
  console.log(`- Preferred Score: ${matchReport.preferredScore}/100`);
  console.log(`- Summary: Strong: ${matchReport.summary.strong}, Partial: ${matchReport.summary.partial}, Missing: ${matchReport.summary.missing}`);

  // Helper finder
  const findReq = (term) =>
    matchReport.requirements.find(
      (r) =>
        r.requirement.toLowerCase().includes(term.toLowerCase())
    );

  // Test 1: Node.js -> strong
  const nodeReq = findReq("Node.js");
  assert.ok(nodeReq, "Node.js requirement must exist in report");
  assert.strictEqual(nodeReq.status, "strong", "Node.js must be classified as 'strong'");
  assert.ok(nodeReq.evidence.length > 0, "Node.js must have supporting evidence");
  assert.ok(knownEvidenceIds.has(nodeReq.evidence[0].evidenceId), "Evidence ID must exist in raw evidence");
  assert.ok(nodeReq.reason.length > 0, "Node.js must include an explainable reason");

  // Test 2: Express -> strong
  const expressReq = findReq("Express");
  assert.ok(expressReq, "Express requirement must exist in report");
  assert.strictEqual(expressReq.status, "strong", "Express must be classified as 'strong'");
  assert.ok(expressReq.evidence.length > 0, "Express must have supporting evidence");

  // Test 3: REST API development -> strong or partial with supporting evidence
  const apiReq = findReq("REST API");
  assert.ok(apiReq, "REST API requirement must exist in report");
  assert.ok(
    apiReq.status === "strong" || apiReq.status === "partial",
    "REST API should be strong or partial"
  );
  assert.ok(apiReq.evidence.length > 0, "REST API must have supporting evidence");

  // Test 4: React (Preferred) -> strong
  const reactReq = findReq("React");
  assert.ok(reactReq, "React requirement must exist in report");
  assert.strictEqual(reactReq.status, "strong", "React must be classified as 'strong'");
  assert.strictEqual(reactReq.importance, "preferred", "React must have 'preferred' importance");

  // Test 5: Docker (Required) -> missing
  const dockerReq = findReq("Docker");
  assert.ok(dockerReq, "Docker requirement must exist in report");
  assert.strictEqual(dockerReq.status, "missing", "Docker must be classified as 'missing'");
  assert.strictEqual(dockerReq.evidence.length, 0, "Docker must not have fabricated evidence");
  assert.ok(dockerReq.reason.includes("No sufficiently relevant"), "Docker reason must explain lack of evidence");

  // Test 6: AWS (Preferred) -> missing
  const awsReq = findReq("AWS");
  assert.ok(awsReq, "AWS requirement must exist in report");
  assert.strictEqual(awsReq.status, "missing", "AWS must be classified as 'missing'");
  assert.strictEqual(awsReq.evidence.length, 0, "AWS must not have fabricated evidence");

  // Test 7: Degree Qualification -> strong
  const eduReq = findReq("Bachelor");
  assert.ok(eduReq, "Education requirement must exist");
  assert.strictEqual(eduReq.status, "strong", "Education degree must be verified as 'strong'");

  // Test 8: Dedicated Lists Partitioning
  assert.strictEqual(
    matchReport.strongRequirements.length,
    matchReport.summary.strong,
    "strongRequirements count must match summary"
  );
  assert.strictEqual(
    matchReport.missingRequirements.length,
    matchReport.summary.missing,
    "missingRequirements count must match summary"
  );

  // Test 9: Score ranges and weighting checks
  assert.ok(matchReport.overallScore >= 0 && matchReport.overallScore <= 100, "Overall score must be 0-100");
  assert.ok(matchReport.requiredScore >= 0 && matchReport.requiredScore <= 100, "Required score must be 0-100");
  assert.ok(matchReport.preferredScore >= 0 && matchReport.preferredScore <= 100, "Preferred score must be 0-100");

  // Test 10: Score calculation weighting logic
  const mockCustomClassified = [
    { importance: "required", status: "strong" },
    { importance: "required", status: "missing" },
    { importance: "preferred", status: "strong" },
  ];
  const customScores = calculateMatchScores(mockCustomClassified);
  // Required: 1 strong, 1 missing -> 50%
  // Preferred: 1 strong -> 100%
  // Overall: 50 * 0.75 + 100 * 0.25 = 37.5 + 25 = 62.5 -> 63%
  assert.strictEqual(customScores.requiredScore, 50, "Required score should be 50");
  assert.strictEqual(customScores.preferredScore, 100, "Preferred score should be 100");
  assert.strictEqual(customScores.overallScore, 63, "Overall score should reflect 0.75 / 0.25 weighting");

  console.log("✅ ALL RESUME MATCH TESTS PASSED SUCCESSFULLY!");
};

run().catch((err) => {
  console.error("❌ Resume match test failed:", err);
  process.exit(1);
});
