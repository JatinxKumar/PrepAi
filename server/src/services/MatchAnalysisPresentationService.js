/**
 * MatchAnalysisPresentationService.js
 * 
 * Deterministic Presentation & Grouping Engine for Match Analysis.
 * 
 * Transforms raw atomic matchAnalysis + jobAnalysis + structuredResume into a polished,
 * organized, and actionable product-ready view:
 * 1. "What You Already Have" (verifiedStrengths: explicit & semantic evidence from resume)
 * 2. "What This Job Needs" (jobRequirementsGrouped: categorized domain/technical/responsibility breakdown)
 * 3. "Key Gaps" (groupedGaps: grouped missing/partial requirements preventing 20+ repetitive cards)
 * 4. "How to Improve Your Resume" (actionableRecommendations: honest, evidence-grounded suggestions)
 * 
 * 100% deterministic. ZERO LLM calls. Preserves all raw atomic match data and scores untouched.
 */

// Generic category classification mapping (domain-agnostic)
const CATEGORY_KEYWORDS = {
  "Systems & Infrastructure": [
    "system", "systems", "distributed", "storage", "filesystem", "file systems", "file system",
    "cluster", "clusters", "linux", "kernel", "hpc", "gpu", "compute", "cloud", "aws", "azure",
    "gcp", "docker", "kubernetes", "k8s", "infra", "infrastructure", "devops", "network", "networking",
    "hardware", "architecture", "scalability", "high performance", "io", "lustre", "exascaler",
  ],
  "Technical & Programming Skills": [
    "c++", "c/c++", "c#", "java", "python", "javascript", "typescript", "golang", "go", "rust",
    "react", "node", "nodejs", "express", "sql", "nosql", "database", "databases", "mongodb",
    "postgresql", "postgres", "redis", "api", "apis", "rest", "graphql", "microservices",
    "framework", "libraries", "algorithm", "algorithms", "data structures",
  ],
  "Core Responsibilities": [
    "develop", "development", "build", "building", "design", "designing", "implement",
    "troubleshoot", "troubleshooting", "debug", "debugging", "maintain", "maintaining",
    "architect", "test", "testing", "deploy", "deploying", "optimize", "optimizing",
    "support", "engineering", "contract", "contracts",
  ],
  "Business & Client Engagement": [
    "client", "customer", "stakeholder", "stakeholders", "partnership", "partnerships",
    "partner", "business", "account", "accounts", "enterprise", "sales", "presales",
    "management", "market", "strategy", "strategic", "vendor", "vendor management",
  ],
  "Education & Qualifications": [
    "bachelor", "master", "phd", "degree", "computer science", "engineering", "gpa",
    "qualification", "qualifications", "certification", "certifications", "education",
  ],
  "Experience & Seniority": [
    "years", "experience", "senior", "lead", "staff", "principal", "track record",
  ],
};

/**
 * Normalizes text to extract core root tokens for safe deduplication/clustering.
 */
const normalizeText = (text) => {
  if (!text || typeof text !== "string") return "";
  return text
    .toLowerCase()
    .replace(/[^\w\s/+]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

/**
 * Assigns a high-level category deterministically based on type, JD category, or keyword heuristics.
 */
const categorizeRequirement = (req) => {
  const type = (req.type || "").toLowerCase();
  const cat = (req.category || "").toLowerCase();
  const text = normalizeText(req.requirement || req.text || "");

  if (type.includes("education") || type.includes("qualification")) {
    return "Education & Qualifications";
  }

  if (type.includes("experience") && (text.includes("year") || text.includes("experience"))) {
    return "Experience & Seniority";
  }

  if (cat && cat !== "general" && cat !== "other") {
    if (cat.includes("system") || cat.includes("cloud") || cat.includes("infra") || cat.includes("devops") || cat.includes("storage")) {
      return "Systems & Infrastructure";
    }
    if (cat.includes("backend") || cat.includes("frontend") || cat.includes("language") || cat.includes("database") || cat.includes("framework")) {
      return "Technical & Programming Skills";
    }
    if (cat.includes("business") || cat.includes("client") || cat.includes("management")) {
      return "Business & Client Engagement";
    }
  }

  // Scan keyword dictionaries
  for (const [groupName, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const kw of keywords) {
      if (text.includes(kw)) {
        return groupName;
      }
    }
  }

  if (type.includes("responsibility")) {
    return "Core Responsibilities";
  }

  if (type.includes("skill") || type.includes("tool")) {
    return "Technical & Programming Skills";
  }

  return "Domain & General Requirements";
};

/**
 * Groups similar or parenthesized requirements (e.g. "Lustre", "EXAScaler", "File systems (Lustre, EXAScaler)").
 */
const groupSimilarItems = (items) => {
  if (!Array.isArray(items) || items.length === 0) return [];

  const groups = [];
  const processedIndices = new Set();

  for (let i = 0; i < items.length; i++) {
    if (processedIndices.has(i)) continue;

    const currentItem = items[i];
    const currentText = currentItem.requirement || currentItem.text || "";
    const normCurrent = normalizeText(currentText);

    const group = {
      title: currentText,
      category: currentItem.presentationCategory || categorizeRequirement(currentItem),
      importance: currentItem.importance || "required",
      status: currentItem.status || "missing",
      items: [currentItem],
    };
    processedIndices.add(i);

    // Look for parent-child or closely related variations
    for (let j = i + 1; j < items.length; j++) {
      if (processedIndices.has(j)) continue;

      const candidate = items[j];
      const candidateText = candidate.requirement || candidate.text || "";
      const normCandidate = normalizeText(candidateText);

      // Check if one contains the other or both mention the exact same key entity
      const isSubConcept =
        (normCurrent.length > 3 && normCandidate.length > 3) &&
        (normCurrent.includes(normCandidate) || normCandidate.includes(normCurrent));

      // Same status and compatible category
      if (isSubConcept && candidate.status === currentItem.status) {
        group.items.push(candidate);
        processedIndices.add(j);
        // Prefer the more descriptive title
        if (candidateText.length > group.title.length) {
          group.title = candidateText;
        }
      }
    }

    groups.push(group);
  }

  return groups;
};

/**
 * Builds the "What You Already Have" section from verified strong/partial evidence.
 */
const buildVerifiedStrengths = (matchAnalysis) => {
  const verified = [];
  const seenEntities = new Set();

  const strongList = matchAnalysis?.strongRequirements || [];
  const partialList = matchAnalysis?.partialRequirements || [];
  const allMatched = [...strongList, ...partialList];

  for (const item of allMatched) {
    const text = item.requirement || "";
    const norm = normalizeText(text);
    if (!norm || seenEntities.has(norm)) continue;
    seenEntities.add(norm);

    const topEvidence = (item.evidence && item.evidence[0]) || null;

    verified.push({
      id: item.requirementId || `strength-${verified.length}`,
      requirement: text,
      status: item.status,
      importance: item.importance || "required",
      type: item.type || "skill",
      category: categorizeRequirement(item),
      reason: item.reason || "Demonstrated in resume evidence.",
      evidence: topEvidence
        ? {
            evidenceId: topEvidence.evidenceId,
            section: topEvidence.section || "experience",
            title: topEvidence.title || "Resume Item",
            score: topEvidence.score || 0,
            text: topEvidence.text || topEvidence.reason || "",
          }
        : null,
    });
  }

  return verified;
};

/**
 * Builds the "What This Job Needs" section categorized by domain/skills/responsibilities.
 */
const buildJobRequirementsSummary = (jobAnalysis) => {
  if (!jobAnalysis || typeof jobAnalysis !== "object") return {};

  const categories = {
    "Technical & Programming Skills": [],
    "Systems & Infrastructure": [],
    "Core Responsibilities": [],
    "Business & Client Engagement": [],
    "Education & Experience": [],
  };

  const addReq = (text, category, importance) => {
    if (!text || typeof text !== "string" || !text.trim()) return;
    const item = { text: text.trim(), category, importance };
    const group = categorizeRequirement(item);
    if (categories[group]) {
      categories[group].push(item);
    } else {
      categories["Technical & Programming Skills"].push(item);
    }
  };

  (jobAnalysis.requiredSkills || []).forEach((s) => addReq(s.skill, s.category, "required"));
  (jobAnalysis.preferredSkills || []).forEach((s) => addReq(s.skill, s.category, "preferred"));
  (jobAnalysis.toolsAndTechnologies || []).forEach((t) => addReq(typeof t === "string" ? t : t.name, "tool", "required"));
  (jobAnalysis.responsibilities || []).forEach((r) => addReq(r, "responsibility", "required"));
  (jobAnalysis.qualifications || []).forEach((q) => addReq(q, "qualification", "required"));
  (jobAnalysis.experienceRequirements || []).forEach((e) => addReq(e, "experience", "required"));

  // Remove empty categories
  const result = {};
  for (const [catName, reqs] of Object.entries(categories)) {
    if (reqs.length > 0) {
      result[catName] = reqs;
    }
  }

  return result;
};

/**
 * Builds the "Key Gaps" section by clustering missing and partial requirements.
 */
const buildGroupedGaps = (matchAnalysis) => {
  const missing = (matchAnalysis?.missingRequirements || []).map((m) => ({
    ...m,
    status: "missing",
    presentationCategory: categorizeRequirement(m),
  }));

  const partial = (matchAnalysis?.partialRequirements || []).map((p) => ({
    ...p,
    status: "partial",
    presentationCategory: categorizeRequirement(p),
  }));

  const combined = [...missing, ...partial];
  const grouped = groupSimilarItems(combined);

  // Categorize into category clusters
  const clusters = {};
  for (const group of grouped) {
    const cat = group.category;
    if (!clusters[cat]) {
      clusters[cat] = [];
    }
    clusters[cat].push(group);
  }

  return {
    totalMissingCount: missing.length,
    totalPartialCount: partial.length,
    clusters,
    flatGroups: grouped,
  };
};

/**
 * Generates evidence-grounded, honest recommendations without encouraging invented experience.
 */
const buildActionableRecommendations = (matchAnalysis, structuredResume) => {
  const recommendations = [];

  const strongReqs = matchAnalysis?.strongRequirements || [];
  const partialReqs = matchAnalysis?.partialRequirements || [];
  const missingReqs = matchAnalysis?.missingRequirements || [];

  // 1. Strengthen existing evidence (Skills present in resume that match JD)
  if (strongReqs.length > 0) {
    const keySkills = strongReqs.slice(0, 3).map((r) => r.requirement).join(", ");
    recommendations.push({
      type: "strengthen",
      title: "Prominently highlight verified skills",
      description: `Your verified experience with ${keySkills} directly aligns with the role. Ensure these technologies are emphasized in your summary and primary project bullet points.`,
      category: "Verified Alignment",
    });
  }

  // 2. Clarify partial matches where related background exists
  if (partialReqs.length > 0) {
    const partialNames = partialReqs.slice(0, 2).map((r) => r.requirement).join(" and ");
    recommendations.push({
      type: "clarify",
      title: `Surface concrete project details for ${partialNames}`,
      description: `Your resume shows background related to ${partialNames}, but specific metrics or explicit tooling could be clarified in your experience bullets to achieve a strong match.`,
      category: "Partial Matches",
    });
  }

  // 3. Address missing requirements honestly (Never invent skills)
  if (missingReqs.length > 0) {
    const topMissing = missingReqs.slice(0, 4).map((r) => r.requirement).join(", ");
    recommendations.push({
      type: "unsupported",
      title: "Do not fabricate unsupported requirements",
      description: `The current resume contains no verified evidence for ${topMissing}. If you possess authentic coursework, side projects, or transferable experience with these concepts, add verified proof. Otherwise, focus on showcasing your proven strengths.`,
      category: "Skill Gaps",
    });
  }

  // 4. Structural formatting recommendation
  if (structuredResume?.projects?.length > 0) {
    recommendations.push({
      type: "format",
      title: "Align project bullet points with JD responsibilities",
      description: "Structure your project accomplishments using the Action-Impact formula (e.g. 'Engineered [System] using [Technology] to achieve [Metric]').",
      category: "Formatting",
    });
  }

  return recommendations;
};

/**
 * Main presentation builder generating the complete polished Match Analysis experience.
 * 
 * @param {object} matchAnalysis - Raw match report from ResumeMatchService.
 * @param {object} jobAnalysis - Structured JD object from JobDescriptionService.
 * @param {object} structuredResume - Structured resume from ResumeStructuringService.
 * @returns {object} Polished match presentation data.
 */
const buildMatchPresentation = (matchAnalysis, jobAnalysis, structuredResume) => {
  if (!matchAnalysis || typeof matchAnalysis !== "object") {
    return null;
  }

  const verifiedStrengths = buildVerifiedStrengths(matchAnalysis);
  const jobNeeds = buildJobRequirementsSummary(jobAnalysis);
  const groupedGaps = buildGroupedGaps(matchAnalysis);
  const recommendations = buildActionableRecommendations(matchAnalysis, structuredResume);

  return {
    overview: {
      overallScore: matchAnalysis.overallScore || 0,
      requiredScore: matchAnalysis.requiredScore || 0,
      preferredScore: matchAnalysis.preferredScore || 0,
      scoreLabel: `${matchAnalysis.overallScore || 0}% Verified Match`,
      scoreSubtitle: "Based on skills, experience, education, and evidence found in your current resume.",
      summary: matchAnalysis.summary || { strong: 0, partial: 0, missing: 0 },
    },
    verifiedStrengths,
    jobNeeds,
    groupedGaps,
    recommendations,
    // Preserve full raw data internally
    rawMatchAnalysis: matchAnalysis,
  };
};

module.exports = {
  buildMatchPresentation,
  categorizeRequirement,
  groupSimilarItems,
  buildVerifiedStrengths,
  buildJobRequirementsSummary,
  buildGroupedGaps,
  buildActionableRecommendations,
};
