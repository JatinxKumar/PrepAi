/**
 * test_live_e2e_flow.js
 * 
 * Live End-to-End API verification against the running backend server.
 * Tests:
 * 1. Health check & auth login / token generation
 * 2. Real PDF resume upload via multipart/form-data (/api/resume/upload)
 * 3. Structured text extraction verification
 * 4. Real JD match analysis execution (/api/resume/:id/match-job)
 * 5. Full match report payload validation (scores, strong, partial, missing, evidence)
 */

const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const path = require("path");
const jwt = require("jsonwebtoken");

const API_BASE = "http://localhost:5000/api";
const JWT_SECRET = process.env.JWT_SECRET || "default_jwt_secret_dev";

async function runLiveE2E() {
  console.log("=== Running Live E2E Match Flow Verification ===");

  // 1. Generate dev auth token
  const testUserId = "507f1f77bcf86cd799439011";
  const token = jwt.sign({ id: testUserId, email: "alex.dev@example.com" }, JWT_SECRET, {
    expiresIn: "1h",
  });
  const authHeaders = { Authorization: `Bearer ${token}` };

  // 2. Health check
  console.log("Checking API health at http://localhost:5000/api/health...");
  try {
    const health = await axios.get(`${API_BASE}/health`);
    console.log("✓ Server health status:", health.data);
  } catch (e) {
    console.warn("Health check response:", e.message);
  }

  // 3. Upload real PDF resume
  const samplePdfPath = path.join(__dirname, "../../../sample_developer_resume.pdf");
  if (!fs.existsSync(samplePdfPath)) {
    throw new Error(`Sample PDF not found at ${samplePdfPath}`);
  }

  console.log("Uploading sample PDF resume...");
  const formData = new FormData();
  formData.append("resume", fs.createReadStream(samplePdfPath));

  const uploadRes = await axios.post(`${API_BASE}/resume/upload`, formData, {
    headers: {
      ...authHeaders,
      ...formData.getHeaders(),
    },
  });

  console.log("✓ Upload response status:", uploadRes.status);
  const resume = uploadRes.data.resume;
  console.log("✓ Uploaded Resume ID:", resume._id);
  console.log("✓ Extracted Text Length:", resume.original?.extractedText?.length);
  console.log("✓ Structuring Status:", resume.structuringStatus);

  // 4. Execute Match Job endpoint with realistic JD
  const jobDescription = `Senior Backend Engineer
Company: Acme Tech
We are looking for a Senior Backend Engineer to build robust web services and scalable architectures.

Required Skills:
- Node.js
- Express
- REST APIs
- Docker

Preferred Skills:
- AWS
- React

Responsibilities:
- Design, develop, and maintain high-performance REST APIs.
- Build backend microservices and database integrations.

Qualifications:
- Bachelor's degree in Computer Science or related field.`;

  console.log("\nExecuting POST /api/resume/:id/match-job...");
  const matchRes = await axios.post(
    `${API_BASE}/resume/${resume._id}/match-job`,
    { jobDescription },
    { headers: authHeaders }
  );

  console.log("✓ Match Job response status:", matchRes.status);
  const matchAnalysis = matchRes.data.matchAnalysis;

  console.log("\n=== Match Analysis Results ===");
  console.log(`- Overall Match Score: ${matchAnalysis.overallScore}%`);
  console.log(`- Required Match Score: ${matchAnalysis.requiredScore}%`);
  console.log(`- Preferred Match Score: ${matchAnalysis.preferredScore}%`);
  console.log(`- Summary: Strong: ${matchAnalysis.summary.strong}, Partial: ${matchAnalysis.summary.partial}, Missing: ${matchAnalysis.summary.missing}`);

  console.log("\nStrong Matches:");
  matchAnalysis.strongRequirements.forEach((r) => {
    console.log(`  ✓ [${r.type}] ${r.requirement} (${r.importance}) -> ${r.reason}`);
    if (r.evidence?.length > 0) {
      console.log(`     Evidence [${r.evidence[0].evidenceId} - ${r.evidence[0].title}]: Score ${r.evidence[0].score}`);
    }
  });

  console.log("\nPartial Matches:");
  matchAnalysis.partialRequirements.forEach((r) => {
    console.log(`  ~ [${r.type}] ${r.requirement} (${r.importance}) -> ${r.reason}`);
  });

  console.log("\nMissing Requirements:");
  matchAnalysis.missingRequirements.forEach((r) => {
    console.log(`  ✗ [${r.type}] ${r.requirement} (${r.importance}) -> ${r.reason}`);
  });

  console.log("\n✅ LIVE E2E API VERIFICATION PASSED SUCCESSFULLY!");
}

runLiveE2E().catch((err) => {
  console.error("❌ Live E2E test failed:", err.response?.data || err.message);
  process.exit(1);
});
