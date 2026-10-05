const { buildResumeEvidence } = require("./ResumeEvidenceService");
const assert = require("assert");

console.log("=== Running ResumeEvidenceService Isolated Tests ===");

// Representative Mock structuredResume matching exact project schema
const mockStructuredResume = {
  personal: {
    name: "Alex Morgan",
    email: "alex@example.com",
    phone: "555-0199",
    location: "San Francisco, CA",
  },
  summary: "Experienced Full Stack Engineer specializing in scalable web applications and cloud integrations.",
  skills: {
    languages: ["TypeScript", "JavaScript", "Python"],
    frameworks: ["React", "Node.js", "Express", "TailwindCSS"],
  },
  experience: [
    {
      company: "Acme Corp",
      role: "Senior Software Engineer",
      location: "San Francisco, CA",
      startDate: "2022",
      endDate: "Present",
      bullets: [
        "Architected high-throughput microservices reducing response latency by 35%.",
        "Mentored team of 5 junior engineers and established CI/CD best practices.",
      ],
    },
  ],
  projects: [
    {
      name: "Campus Connect Hub",
      description: "A real-time collaboration platform for university research teams.",
      technologies: ["React", "Node.js", "MongoDB", "Socket.io"],
      bullets: [
        "Built real-time messaging pipeline handling 10k daily active users.",
        "Implemented JWT authentication with role-based access control.",
      ],
    },
  ],
  education: [
    {
      institution: "Stanford University",
      degree: "Bachelor of Science",
      field: "Computer Science",
      startDate: "2018",
      endDate: "2022",
      details: ["Graduated Magna Cum Laude", "President of AI Club"],
    },
  ],
  achievements: [
    "First Place Winner at HackSF 2023 for building AI-assisted accessibility tool.",
  ],
  certifications: [
    "AWS Certified Solutions Architect – Associate",
  ],
};

const evidenceList = buildResumeEvidence(mockStructuredResume);

console.log(`Generated ${evidenceList.length} evidence objects.\n`);

// Verification 1: Check total expected evidence count
// 1 summary + 2 skills (languages, frameworks) + 1 experience + 1 project + 1 education + 1 achievement + 1 certification = 8 evidence objects
assert.strictEqual(evidenceList.length, 8, `Expected 8 evidence objects, got ${evidenceList.length}`);

// Verification 2: Check evidence sections and types
const sections = evidenceList.map((e) => e.section);
const expectedSections = [
  "summary",
  "skills",
  "skills",
  "experience",
  "projects",
  "education",
  "achievements",
  "certifications",
];
assert.deepStrictEqual(sections, expectedSections, "Evidence sections do not match expected section sequence");

// Verification 3: Check Project evidence
const projectEvidence = evidenceList.find((e) => e.type === "project");
assert.ok(projectEvidence, "Project evidence object should exist");
assert.strictEqual(projectEvidence.id, "project-0");
assert.strictEqual(projectEvidence.title, "Campus Connect Hub");
assert.deepStrictEqual(
  projectEvidence.technologies,
  ["React", "Node.js", "MongoDB", "Socket.io"],
  "Project technologies were not preserved correctly"
);
assert.ok(
  projectEvidence.text.includes("Built real-time messaging pipeline"),
  "Project bullets should be present in evidence text"
);

// Verification 4: Check Experience evidence
const expEvidence = evidenceList.find((e) => e.type === "experience");
assert.ok(expEvidence, "Experience evidence object should exist");
assert.strictEqual(expEvidence.id, "experience-0");
assert.strictEqual(expEvidence.title, "Senior Software Engineer at Acme Corp");
assert.ok(
  expEvidence.text.includes("Architected high-throughput microservices"),
  "Experience bullets should be present in evidence text"
);

// Verification 5: Check no empty evidence text objects exist
evidenceList.forEach((e, idx) => {
  assert.ok(e.id, `Evidence at index ${idx} missing ID`);
  assert.ok(e.title, `Evidence at index ${idx} missing title`);
  assert.ok(e.text && e.text.trim().length > 0, `Evidence at index ${idx} has empty text`);
});

console.log("Summary Evidence Sample:");
console.log(JSON.stringify(evidenceList[0], null, 2));

console.log("\nProject Evidence Sample:");
console.log(JSON.stringify(projectEvidence, null, 2));

console.log("\n✅ ALL RESUME EVIDENCE TESTS PASSED SUCCESSFULLY!");
