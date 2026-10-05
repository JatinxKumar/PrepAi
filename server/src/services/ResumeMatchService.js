/**
 * ResumeMatchService.js
 * 
 * Explainable Resume ↔ Job Match Engine (Post-Retrieval Classification & Scoring Layer).
 * 
 * Consumes:
 * - Structured Job Description (jobAnalysis)
 * - Semantic Retrieval Report (from ResumeRetrievalService)
 * - Structured Resume / Evidence (structuredResume)
 * 
 * Produces:
 * - Requirement-level classifications ("strong" | "partial" | "missing")
 * - Explainable evidence-backed justifications
 * - Distinct, weighted required vs preferred scores and overall match percentage
 * - Dedicated lists of strong, partial, and missing requirements
 * 
 * ZERO LLM calls for the deterministic baseline classifier. ZERO fabricated evidence.
 */

const { retrieveJobEvidence } = require("./ResumeRetrievalService");

const MATCH_THRESHOLDS = {
  // Semantic similarity bands
  strongSemantic: 0.50,
  partialSemantic: 0.35,
  
  // Weights for final score computation
  weightRequired: 0.75,
  weightPreferred: 0.25,
  
  // Status point values
  pointsStrong: 1.0,
  pointsPartial: 0.5,
  pointsMissing: 0.0,
};

// Conservative, safe alias mapping for normalization
const SAFE_ALIASES = {
  "node": "nodejs",
  "node.js": "nodejs",
  "nodejs": "nodejs",
  "react": "reactjs",
  "react.js": "reactjs",
  "reactjs": "reactjs",
  "postgres": "postgresql",
  "postgresql": "postgresql",
  "mongo": "mongodb",
  "mongodb": "mongodb",
  "k8s": "kubernetes",
  "kubernetes": "kubernetes",
  "golang": "go",
  "ts": "typescript",
  "typescript": "typescript",
  "js": "javascript",
  "javascript": "javascript",
};

/**
 * Normalizes a tech or skill token for exact/safe alias matching.
 */
const normalizeToken = (str) => {
  if (!str || typeof str !== "string") return "";
  const cleaned = str.toLowerCase().trim().replace(/[^a-z0-9.+]/g, "");
  return SAFE_ALIASES[cleaned] || cleaned;
};

/**
 * Checks if a requirement is explicitly mentioned in an evidence object's technologies or text.
 */
const checkExplicitMatch = (reqText, evidenceItem) => {
  if (!reqText || !evidenceItem) return false;
  const normReq = normalizeToken(reqText);
  if (!normReq) return false;

  // Check technologies array
  if (Array.isArray(evidenceItem.technologies)) {
    const hasTech = evidenceItem.technologies.some((tech) => {
      const normTech = normalizeToken(tech);
      return normTech === normReq || normTech.includes(normReq) || normReq.includes(normTech);
    });
    if (hasTech) return true;
  }

  // Check title & text
  const normText = (evidenceItem.text || "").toLowerCase();
  const rawReq = reqText.toLowerCase().trim();
  if (normText.includes(rawReq)) return true;

  return false;
};

/**
 * Generates an explainable human-readable justification for the classification.
 */
const generateEvidenceReason = (reqText, status, evidenceList, isExplicit) => {
  if (status === "missing" || !evidenceList || evidenceList.length === 0) {
    return "No sufficiently relevant resume evidence was retrieved for this requirement.";
  }

  const topEvidence = evidenceList[0];
  const sectionName = topEvidence.section || "resume";
  const title = topEvidence.title || "Experience";

  if (status === "strong") {
    if (isExplicit) {
      return `${sectionName.charAt(0).toUpperCase() + sectionName.slice(1)} item "${title}" explicitly demonstrates ${reqText}.`;
    }
    return `Strong semantic evidence found in ${sectionName} ("${title}") supporting ${reqText}.`;
  }

  // Partial
  if (isExplicit) {
    return `Explicit mention of ${reqText} found in ${sectionName} ("${title}"), though broader application details are limited.`;
  }
  return `Related background found in ${sectionName} ("${title}"), but direct hands-on evidence for ${reqText} is partial.`;
};

/**
 * Evaluates an education requirement against resume education records.
 */
const evaluateEducationRequirement = (reqItem, structuredResume) => {
  const reqText = typeof reqItem === "string" ? reqItem : reqItem.text || reqItem.requirement || "";
  const eduRecords = Array.isArray(structuredResume?.education) ? structuredResume.education : [];

  if (eduRecords.length === 0) {
    return {
      status: "missing",
      confidence: 0.90,
      evidence: [],
      reason: "No education entries found in the resume to verify degree requirements.",
    };
  }

  const lowerReq = reqText.toLowerCase();
  for (const edu of eduRecords) {
    const degree = (edu.degree || "").toLowerCase();
    const field = (edu.field || "").toLowerCase();
    const institution = (edu.institution || "").toLowerCase();
    const combined = `${degree} in ${field} from ${institution}`.toLowerCase();

    // Check degree level & field matches
    const degreeMatch = 
      (lowerReq.includes("bachelor") && (degree.includes("bachelor") || degree.includes("b.s") || degree.includes("b.e") || degree.includes("b.tech"))) ||
      (lowerReq.includes("master") && (degree.includes("master") || degree.includes("m.s") || degree.includes("m.tech"))) ||
      (lowerReq.includes("phd") && degree.includes("phd"));

    const fieldMatch = 
      (lowerReq.includes("computer science") && (field.includes("computer science") || field.includes("cs") || combined.includes("computer"))) ||
      (lowerReq.includes("engineering") && (field.includes("engineering") || degree.includes("engineering")));

    if (degreeMatch || (fieldMatch && degree)) {
      return {
        status: "strong",
        confidence: 0.92,
        evidence: [
          {
            evidenceId: "education-0",
            section: "education",
            title: edu.institution || "Education",
            reason: `Resume lists ${edu.degree || "Degree"} in ${edu.field || "Field"} from ${edu.institution || "Institution"}.`,
          },
        ],
        reason: `Resume explicitly verifies education: ${edu.degree || "Degree"} in ${edu.field || "Field"}.`,
      };
    }
  }

  return {
    status: "partial",
    confidence: 0.75,
    evidence: [],
    reason: `Resume contains education entries, but degree/field does not explicitly match "${reqText}".`,
  };
};

/**
 * Evaluates an experience requirement (e.g., years of experience).
 */
const evaluateExperienceRequirement = (reqItem, structuredResume, retrievedEvidence) => {
  const reqText = typeof reqItem === "string" ? reqItem : reqItem.text || reqItem.requirement || "";
  const expRecords = Array.isArray(structuredResume?.experience) ? structuredResume.experience : [];

  if (expRecords.length === 0) {
    return {
      status: "missing",
      confidence: 0.90,
      evidence: [],
      reason: "No work experience entries found in the resume to verify duration.",
    };
  }

  // Check if semantic evidence exists in retrieved list
  if (retrievedEvidence && retrievedEvidence.length > 0) {
    const top = retrievedEvidence[0];
    if (top.score >= MATCH_THRESHOLDS.strongSemantic) {
      return {
        status: "strong",
        confidence: 0.85,
        evidence: retrievedEvidence.slice(0, 2).map((e) => ({
          evidenceId: e.evidenceId,
          score: e.score,
          section: e.section,
          title: e.title,
          reason: `Demonstrated experience verified in ${e.section} ("${e.title}").`,
        })),
        reason: `Strong verified experience found across ${expRecords.length} professional role(s).`,
      };
    }
  }

  return {
    status: "partial",
    confidence: 0.70,
    evidence: retrievedEvidence || [],
    reason: `Resume contains professional experience, but exact verified duration for "${reqText}" cannot be fully confirmed without explicit dates.`,
  };
};

/**
 * Classifies a single retrieved requirement based on deterministic rules and semantic evidence.
 */
const classifyRequirement = (retrievalItem, structuredResume, thresholds = MATCH_THRESHOLDS) => {
  const { id, type, requirement, importance, retrievedEvidence = [] } = retrievalItem;

  // Handle Education requirements
  if (type === "qualification" || type === "educationRequirement") {
    const eduEval = evaluateEducationRequirement(requirement, structuredResume);
    return {
      requirementId: id,
      type,
      requirement,
      importance,
      status: eduEval.status,
      confidence: eduEval.confidence,
      evidence: eduEval.evidence,
      reason: eduEval.reason,
    };
  }

  // Handle Experience duration requirements
  if (type === "experienceRequirement") {
    const expEval = evaluateExperienceRequirement(requirement, structuredResume, retrievedEvidence);
    return {
      requirementId: id,
      type,
      requirement,
      importance,
      status: expEval.status,
      confidence: expEval.confidence,
      evidence: expEval.evidence,
      reason: expEval.reason,
    };
  }

  // If no retrieved evidence passes retrieval threshold -> MISSING
  if (!retrievedEvidence || retrievedEvidence.length === 0) {
    return {
      requirementId: id,
      type,
      requirement,
      importance,
      status: "missing",
      confidence: 0.95,
      evidence: [],
      reason: "No sufficiently relevant resume evidence was retrieved for this requirement.",
    };
  }

  const topEvidence = retrievedEvidence[0];
  const topScore = topEvidence.score || 0;

  // Check explicit mention across retrieved evidence chunks
  const isExplicit = retrievedEvidence.some((ev) => checkExplicitMatch(requirement, ev));
  const hasProjectOrExp = retrievedEvidence.some(
    (ev) => ev.section === "projects" || ev.section === "experience"
  );

  const isSkillOrTool = type.toLowerCase().includes("skill") || type.toLowerCase().includes("tool");

  let status = "missing";
  let confidence = 0.50;

  if (isSkillOrTool) {
    if (isExplicit && (topScore >= thresholds.partialSemantic || hasProjectOrExp)) {
      status = "strong";
      confidence = topScore >= thresholds.strongSemantic ? 0.95 : 0.88;
    } else if (isExplicit) {
      status = "partial";
      confidence = 0.75;
    } else if (topScore >= thresholds.strongSemantic) {
      // Related semantic match but not explicit skill name in resume
      status = "partial";
      confidence = 0.70;
    } else {
      status = "missing";
      confidence = 0.90;
    }
  } else {
    // Responsibilities and general requirements (natural language)
    if (isExplicit || topScore >= thresholds.strongSemantic) {
      status = "strong";
      confidence = 0.88;
    } else if (topScore >= thresholds.partialSemantic) {
      status = "partial";
      confidence = 0.75;
    } else {
      status = "missing";
      confidence = 0.85;
    }
  }

  const mappedEvidence = retrievedEvidence.map((e) => ({
    evidenceId: e.evidenceId,
    score: e.score,
    section: e.section,
    title: e.title,
    reason: generateEvidenceReason(requirement, status, [e], isExplicit),
  }));

  return {
    requirementId: id,
    type,
    requirement,
    importance,
    status,
    confidence,
    evidence: status === "missing" ? [] : mappedEvidence,
    reason: generateEvidenceReason(requirement, status, retrievedEvidence, isExplicit),
  };
};

/**
 * Calculates weighted scores for required, preferred, and overall match.
 */
const calculateMatchScores = (classifiedRequirements, thresholds = MATCH_THRESHOLDS) => {
  const requiredList = classifiedRequirements.filter((r) => r.importance === "required");
  const preferredList = classifiedRequirements.filter((r) => r.importance === "preferred");

  const computeCategoryScore = (list) => {
    if (!list || list.length === 0) return 100;
    let earnedPoints = 0;
    for (const item of list) {
      if (item.status === "strong") earnedPoints += thresholds.pointsStrong;
      else if (item.status === "partial") earnedPoints += thresholds.pointsPartial;
      else earnedPoints += thresholds.pointsMissing;
    }
    return Math.round((earnedPoints / list.length) * 100);
  };

  const requiredScore = computeCategoryScore(requiredList);
  const preferredScore = computeCategoryScore(preferredList);

  let overallScore = 0;
  if (requiredList.length > 0 && preferredList.length > 0) {
    overallScore = Math.round(
      requiredScore * thresholds.weightRequired + preferredScore * thresholds.weightPreferred
    );
  } else if (requiredList.length > 0) {
    overallScore = requiredScore;
  } else if (preferredList.length > 0) {
    overallScore = preferredScore;
  } else {
    overallScore = 0;
  }

  const summary = {
    total: classifiedRequirements.length,
    strong: classifiedRequirements.filter((r) => r.status === "strong").length,
    partial: classifiedRequirements.filter((r) => r.status === "partial").length,
    missing: classifiedRequirements.filter((r) => r.status === "missing").length,
  };

  return {
    overallScore: Math.max(0, Math.min(100, overallScore)),
    requiredScore: Math.max(0, Math.min(100, requiredScore)),
    preferredScore: Math.max(0, Math.min(100, preferredScore)),
    summary,
  };
};

/**
 * High-level orchestration function to generate a complete explainable match report.
 * 
 * @param {object} jobAnalysis - Structured JD object.
 * @param {object} structuredResume - Structured resume object.
 * @param {object} [options={}] - Options (retrievalReport, thresholds, topK, threshold).
 * @returns {Promise<object>} Complete explainable match report.
 */
const matchResumeToJob = async (jobAnalysis, structuredResume, options = {}) => {
  const thresholds = { ...MATCH_THRESHOLDS, ...(options.thresholds || {}) };

  // 1. Obtain retrieval report (either provided or generated via ResumeRetrievalService)
  let retrievalReport = options.retrievalReport;
  if (!retrievalReport) {
    retrievalReport = await retrieveJobEvidence(jobAnalysis, structuredResume, {
      topK: options.topK || 3,
      threshold: options.threshold || 0.35,
    });
  }

  // 2. Classify each requirement
  const requirements = (retrievalReport.requirements || []).map((req) =>
    classifyRequirement(req, structuredResume, thresholds)
  );

  // 3. Partition into dedicated lists
  const strongRequirements = requirements.filter((r) => r.status === "strong");
  const partialRequirements = requirements.filter((r) => r.status === "partial");
  const missingRequirements = requirements.filter((r) => r.status === "missing");

  // 4. Calculate explainable weighted scores
  const scoreData = calculateMatchScores(requirements, thresholds);

  return {
    ...scoreData,
    requirements,
    strongRequirements,
    partialRequirements,
    missingRequirements,
    meta: {
      totalEvidenceChunks: retrievalReport.totalEvidenceChunks || 0,
      thresholds,
    },
  };
};

module.exports = {
  matchResumeToJob,
  classifyRequirement,
  calculateMatchScores,
  checkExplicitMatch,
  MATCH_THRESHOLDS,
  SAFE_ALIASES,
};
