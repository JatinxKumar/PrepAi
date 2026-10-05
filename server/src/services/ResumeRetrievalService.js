/**
 * ResumeRetrievalService.js
 * 
 * Requirement-to-Resume-Evidence Retrieval Engine (RAG Retrieval Phase)
 * 
 * Maps structured Job Description requirements (skills, responsibilities, experience, qualifications)
 * to relevant Resume Evidence chunks using local semantic embeddings and cosine similarity ranking.
 * 
 * Key Principles:
 * - Deterministic query synthesis (Zero LLM calls).
 * - Embedding reuse (Evidence embeddings generated ONCE per retrieval run).
 * - Configurable similarity threshold and Top-K.
 * - No hallucinated evidence; all retrieved items originate from ResumeEvidenceService.
 */

const { buildResumeEvidence } = require("./ResumeEvidenceService");
const { generateEmbedding, generateEmbeddings } = require("./EmbeddingService");
const { rankBySimilarity } = require("./VectorSimilarityService");

const DEFAULT_TOP_K = 3;
const DEFAULT_RETRIEVAL_THRESHOLD = 0.35;

/**
 * Deterministically formats a structured JD requirement into a focused semantic retrieval query.
 * 
 * @param {object|string} requirement - The raw or structured requirement object.
 * @param {string} type - Requirement type identifier (e.g. requiredSkill, responsibility).
 * @returns {{ idText: string, query: string, importance: string, category?: string }}
 */
const formatRequirementQuery = (requirement, type = "general") => {
  if (!requirement) {
    return { idText: "", query: "", importance: "required" };
  }

  // Handle plain string requirements (e.g., responsibilities, qualifications)
  if (typeof requirement === "string") {
    const trimmed = requirement.trim();
    return {
      idText: trimmed,
      query: trimmed,
      importance: type.toLowerCase().includes("preferred") ? "preferred" : "required",
    };
  }

  // Handle structured requirement objects
  const skill = requirement.skill || requirement.name || requirement.tool || requirement.text || "";
  const category = requirement.category || "";
  const importance = requirement.importance || (type.toLowerCase().includes("preferred") ? "preferred" : "required");
  
  let queryText = skill;
  if (category && category !== "general" && category !== "other") {
    queryText = `${skill} (${category})`;
  }

  return {
    idText: skill || requirement.text || "",
    query: queryText,
    importance,
    category: category || undefined,
  };
};

/**
 * Retrieves top relevant evidence for a single requirement from pre-embedded resume evidence chunks.
 * 
 * @param {object|string} requirement - The JD requirement object or string.
 * @param {Array<object>} embeddedEvidence - Evidence objects with precomputed .embedding arrays.
 * @param {object} [options={}] - Options (topK, threshold, type, queryOverride).
 * @returns {Promise<object>} Retrieval result containing requirement metadata and top evidence.
 */
const retrieveEvidenceForRequirement = async (requirement, embeddedEvidence = [], options = {}) => {
  const topK = typeof options.topK === "number" && options.topK > 0 ? options.topK : DEFAULT_TOP_K;
  const threshold = typeof options.threshold === "number" ? options.threshold : DEFAULT_RETRIEVAL_THRESHOLD;
  const type = options.type || "requiredSkill";

  const { idText, query, importance, category } = formatRequirementQuery(requirement, type);
  const queryText = options.queryOverride || query;

  if (!queryText || !Array.isArray(embeddedEvidence) || embeddedEvidence.length === 0) {
    return {
      requirement: idText,
      type,
      importance,
      category,
      query: queryText,
      retrievedEvidence: [],
      hasEvidence: false,
      topScore: 0,
    };
  }

  const queryVector = await generateEmbedding(queryText);
  if (!queryVector || queryVector.length === 0) {
    return {
      requirement: idText,
      type,
      importance,
      category,
      query: queryText,
      retrievedEvidence: [],
      hasEvidence: false,
      topScore: 0,
    };
  }

  // Rank against all pre-embedded evidence chunks
  const ranked = rankBySimilarity(queryVector, embeddedEvidence, embeddedEvidence.length);

  // Filter by threshold & deduplicate by evidenceId
  const seenIds = new Set();
  const filteredEvidence = [];

  for (const item of ranked) {
    if (item.score < threshold) {
      continue;
    }

    const evidenceObj = item.evidence;
    const evidenceId = evidenceObj.id || item.evidenceId;

    if (seenIds.has(evidenceId)) {
      continue;
    }
    seenIds.add(evidenceId);

    filteredEvidence.push({
      evidenceId,
      score: Math.round(item.score * 10000) / 10000,
      section: evidenceObj.section || "general",
      type: evidenceObj.type || "general",
      title: evidenceObj.title || "",
      text: evidenceObj.text || "",
      technologies: Array.isArray(evidenceObj.technologies) ? evidenceObj.technologies : [],
      metadata: evidenceObj.metadata || {},
    });

    if (filteredEvidence.length >= topK) {
      break;
    }
  }

  return {
    requirement: idText,
    type,
    importance,
    category,
    query: queryText,
    retrievedEvidence: filteredEvidence,
    hasEvidence: filteredEvidence.length > 0,
    topScore: filteredEvidence.length > 0 ? filteredEvidence[0].score : 0,
  };
};

/**
 * Top-level retrieval function: processes all JD requirements against a structured resume.
 * Generates resume evidence embeddings ONCE and reuses them across all JD requirements.
 * 
 * @param {object} jobAnalysis - Structured JD object from JobDescriptionService.
 * @param {object} structuredResume - Structured resume object.
 * @param {object} [options={}] - Options (topK, threshold).
 * @returns {Promise<object>} Complete retrieval report.
 */
const retrieveJobEvidence = async (jobAnalysis, structuredResume, options = {}) => {
  const topK = typeof options.topK === "number" && options.topK > 0 ? options.topK : DEFAULT_TOP_K;
  const threshold = typeof options.threshold === "number" ? options.threshold : DEFAULT_RETRIEVAL_THRESHOLD;

  // 1. Build resume evidence chunks deterministically
  const rawEvidence = buildResumeEvidence(structuredResume);
  if (!rawEvidence || rawEvidence.length === 0) {
    return {
      requirements: [],
      totalRequirements: 0,
      totalEvidenceChunks: 0,
      threshold,
      topK,
    };
  }

  // 2. Generate embeddings for all evidence chunks ONCE
  const evidenceTexts = rawEvidence.map((item) => item.text || "");
  const evidenceVectors = await generateEmbeddings(evidenceTexts);

  const embeddedEvidence = rawEvidence.map((item, index) => ({
    ...item,
    embedding: evidenceVectors[index] || [],
  }));

  // 3. Collect all requirement definitions from structured JD
  const requirementConfigs = [];

  const addRequirements = (items, type, defaultImportance) => {
    if (!Array.isArray(items)) return;
    items.forEach((item, index) => {
      if (!item) return;
      requirementConfigs.push({
        id: `${type}-${index}`,
        type,
        data: item,
        defaultImportance,
      });
    });
  };

  if (jobAnalysis && typeof jobAnalysis === "object") {
    addRequirements(jobAnalysis.requiredSkills, "requiredSkill", "required");
    addRequirements(jobAnalysis.preferredSkills, "preferredSkill", "preferred");
    addRequirements(jobAnalysis.responsibilities, "responsibility", "required");
    addRequirements(jobAnalysis.experienceRequirements, "experienceRequirement", "required");
    addRequirements(jobAnalysis.qualifications, "qualification", "required");
    addRequirements(jobAnalysis.toolsAndTechnologies, "toolAndTechnology", "required");
    addRequirements(jobAnalysis.softSkills, "softSkill", "preferred");
  }

  // 4. Retrieve top evidence for each requirement reusing embedded evidence
  const results = [];
  for (const reqConfig of requirementConfigs) {
    const retrieval = await retrieveEvidenceForRequirement(
      reqConfig.data,
      embeddedEvidence,
      {
        topK,
        threshold,
        type: reqConfig.type,
      }
    );

    results.push({
      id: reqConfig.id,
      ...retrieval,
    });
  }

  return {
    requirements: results,
    totalRequirements: results.length,
    totalEvidenceChunks: rawEvidence.length,
    threshold,
    topK,
  };
};

module.exports = {
  retrieveEvidenceForRequirement,
  retrieveJobEvidence,
  formatRequirementQuery,
  DEFAULT_TOP_K,
  DEFAULT_RETRIEVAL_THRESHOLD,
};
