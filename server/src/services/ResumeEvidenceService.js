/**
 * ResumeEvidenceService.js
 * 
 * Transforms a structuredResume object into a deterministic array of 
 * evidence chunk objects for downstream semantic matching and RAG retrieval.
 * 
 * IMPORTANT: This service performs ONLY deterministic transformations.
 * It NEVER calls LLMs or infers/invents facts.
 */

const capitalize = (str) => {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
};

const sanitizeString = (val) => {
  if (typeof val === "string") return val.trim();
  if (typeof val === "number") return String(val);
  return "";
};

const ensurePeriod = (str) => {
  if (!str) return "";
  const trimmed = str.trim();
  if (trimmed.endsWith(".") || trimmed.endsWith("!") || trimmed.endsWith("?")) {
    return trimmed;
  }
  return `${trimmed}.`;
};

const sanitizeArray = (arr) => {
  if (!Array.isArray(arr)) return [];
  return arr.map(sanitizeString).filter((s) => s.length > 0);
};

/**
 * Transforms structured resume JSON into a list of normalized evidence chunks.
 * 
 * @param {object} structuredResume - The normalized structured resume.
 * @returns {Array<object>} List of evidence objects.
 */
const buildResumeEvidence = (structuredResume) => {
  if (!structuredResume || typeof structuredResume !== "object") {
    return [];
  }

  const evidenceList = [];

  // 1. SUMMARY EVIDENCE
  const summaryText = sanitizeString(structuredResume.summary);
  if (summaryText) {
    evidenceList.push({
      id: "summary-0",
      section: "summary",
      type: "summary",
      title: "Professional Summary",
      text: `Professional Summary: ${summaryText}`,
      technologies: [],
      metadata: { index: 0 },
    });
  }

  // 2. SKILLS EVIDENCE (grouped by category)
  if (structuredResume.skills && typeof structuredResume.skills === "object") {
    const categories = Object.keys(structuredResume.skills);

    categories.forEach((catKey) => {
      const skillItems = sanitizeArray(structuredResume.skills[catKey]);
      if (skillItems.length > 0) {
        const catName = capitalize(catKey);
        evidenceList.push({
          id: `skills-${catKey}`,
          section: "skills",
          type: "skills",
          title: `Skills: ${catName}`,
          text: `Skills (${catName}): ${skillItems.join(", ")}.`,
          technologies: skillItems,
          metadata: { category: catKey },
        });
      }
    });
  }

  // 3. EXPERIENCE EVIDENCE
  if (Array.isArray(structuredResume.experience)) {
    structuredResume.experience.forEach((exp, idx) => {
      if (!exp || typeof exp !== "object") return;

      const role = sanitizeString(exp.role);
      const company = sanitizeString(exp.company);
      const location = sanitizeString(exp.location);
      const startDate = sanitizeString(exp.startDate);
      const endDate = sanitizeString(exp.endDate);
      const bullets = sanitizeArray(exp.bullets);

      if (!role && !company && bullets.length === 0) return;

      const titleParts = [];
      if (role) titleParts.push(role);
      if (company) titleParts.push(`at ${company}`);
      const title = titleParts.join(" ") || `Experience ${idx + 1}`;

      const dateStr = startDate || endDate ? `${startDate}${endDate ? " - " + endDate : ""}` : "";
      
      const textParts = [];
      textParts.push(`Role: ${role || "Position"}${company ? " at " + company : ""}.`);
      if (dateStr) textParts.push(`Period: ${dateStr}.`);
      if (location) textParts.push(`Location: ${location}.`);
      if (bullets.length > 0) {
        textParts.push(`Responsibilities & Accomplishments: ${bullets.join(" ")}`);
      }

      evidenceList.push({
        id: `experience-${idx}`,
        section: "experience",
        type: "experience",
        title,
        text: textParts.join(" "),
        technologies: [],
        metadata: {
          index: idx,
          company,
          role,
        },
      });
    });
  }

  // 4. PROJECTS EVIDENCE
  if (Array.isArray(structuredResume.projects)) {
    structuredResume.projects.forEach((proj, idx) => {
      if (!proj || typeof proj !== "object") return;

      const name = sanitizeString(proj.name);
      const description = sanitizeString(proj.description);
      const technologies = sanitizeArray(proj.technologies);
      const bullets = sanitizeArray(proj.bullets);

      if (!name && !description && bullets.length === 0) return;

      const title = name || `Project ${idx + 1}`;

      const textParts = [];
      textParts.push(`Project: ${ensurePeriod(title)}`);
      if (description) textParts.push(`Description: ${ensurePeriod(description)}`);
      if (technologies.length > 0) textParts.push(`Technologies: ${ensurePeriod(technologies.join(", "))}`);
      if (bullets.length > 0) textParts.push(`Details: ${bullets.map(ensurePeriod).join(" ")}`);

      evidenceList.push({
        id: `project-${idx}`,
        section: "projects",
        type: "project",
        title,
        text: textParts.join(" "),
        technologies,
        metadata: {
          index: idx,
        },
      });
    });
  }

  // 5. EDUCATION EVIDENCE
  if (Array.isArray(structuredResume.education)) {
    structuredResume.education.forEach((edu, idx) => {
      if (!edu || typeof edu !== "object") return;

      const institution = sanitizeString(edu.institution);
      const degree = sanitizeString(edu.degree);
      const field = sanitizeString(edu.field);
      const startDate = sanitizeString(edu.startDate);
      const endDate = sanitizeString(edu.endDate);
      const details = sanitizeArray(edu.details);

      if (!institution && !degree && !field && details.length === 0) return;

      const titleParts = [];
      if (degree) titleParts.push(degree);
      if (field) titleParts.push(`in ${field}`);
      if (institution) titleParts.push(`from ${institution}`);
      const title = titleParts.join(" ") || `Education ${idx + 1}`;

      const dateStr = startDate || endDate ? `${startDate}${endDate ? " - " + endDate : ""}` : "";

      const textParts = [];
      textParts.push(`Education: ${title}.`);
      if (dateStr) textParts.push(`Period: ${dateStr}.`);
      if (details.length > 0) textParts.push(`Details: ${details.join(" ")}`);

      evidenceList.push({
        id: `education-${idx}`,
        section: "education",
        type: "education",
        title,
        text: textParts.join(" "),
        technologies: [],
        metadata: {
          index: idx,
        },
      });
    });
  }

  // 6. ACHIEVEMENTS EVIDENCE
  if (Array.isArray(structuredResume.achievements)) {
    structuredResume.achievements.forEach((ach, idx) => {
      let achText = "";
      if (typeof ach === "string") {
        achText = ach.trim();
      } else if (ach && typeof ach === "object") {
        achText = sanitizeString(ach.title || ach.name || ach.description);
      }

      if (achText) {
        evidenceList.push({
          id: `achievement-${idx}`,
          section: "achievements",
          type: "achievement",
          title: `Achievement ${idx + 1}`,
          text: `Achievement: ${achText}`,
          technologies: [],
          metadata: { index: idx },
        });
      }
    });
  }

  // 7. CERTIFICATIONS EVIDENCE
  if (Array.isArray(structuredResume.certifications)) {
    structuredResume.certifications.forEach((cert, idx) => {
      let certText = "";
      if (typeof cert === "string") {
        certText = cert.trim();
      } else if (cert && typeof cert === "object") {
        certText = sanitizeString(cert.name || cert.title || cert.issuer);
      }

      if (certText) {
        evidenceList.push({
          id: `certification-${idx}`,
          section: "certifications",
          type: "certification",
          title: certText,
          text: `Certification: ${certText}`,
          technologies: [],
          metadata: { index: idx },
        });
      }
    });
  }

  return evidenceList;
};

module.exports = {
  buildResumeEvidence,
};
