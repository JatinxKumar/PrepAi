const crypto = require("crypto");

const ROLE_KEYWORDS = {
  "software engineer": [
    "javascript",
    "typescript",
    "react",
    "node",
    "api",
    "testing",
    "database",
    "system design",
  ],
  "frontend developer": [
    "react",
    "ui",
    "css",
    "typescript",
    "accessibility",
    "performance",
    "component",
    "responsive",
  ],
  "backend developer": [
    "api",
    "node",
    "express",
    "database",
    "authentication",
    "scalability",
    "microservice",
    "cache",
  ],
  "full stack developer": [
    "react",
    "node",
    "api",
    "database",
    "testing",
    "deployment",
    "authentication",
    "performance",
  ],
  "data analyst": [
    "sql",
    "dashboard",
    "reporting",
    "python",
    "excel",
    "visualization",
    "analysis",
    "metrics",
  ],
  "devops engineer": [
    "docker",
    "ci/cd",
    "deployment",
    "cloud",
    "kubernetes",
    "monitoring",
    "automation",
    "infrastructure",
  ],
  "product manager": [
    "roadmap",
    "stakeholder",
    "analytics",
    "requirements",
    "launch",
    "prioritization",
    "user research",
  ],
  "mobile developer": [
    "react native",
    "flutter",
    "ios",
    "android",
    "performance",
    "state management",
    "api",
  ],
};

const ACTION_VERBS = [
  "built",
  "designed",
  "developed",
  "implemented",
  "optimized",
  "shipped",
  "owned",
  "led",
  "created",
  "reduced",
  "improved",
  "delivered",
  "automated",
  "refactored",
  "launched",
  "scaled",
  "architected",
  "increased",
  "decreased",
];

const SECTION_PATTERNS = [
  {
    key: "summary",
    pattern: /^(summary|profile|objective|about)\b/i,
    label: "Summary",
  },
  {
    key: "skills",
    pattern: /^(skills|technical skills|core skills|stack)\b/i,
    label: "Skills",
  },
  {
    key: "experience",
    pattern:
      /^(experience|work experience|professional experience|employment)\b/i,
    label: "Experience",
  },
  {
    key: "projects",
    pattern: /^(projects|project experience|selected projects)\b/i,
    label: "Projects",
  },
  {
    key: "education",
    pattern: /^(education|academics)\b/i,
    label: "Education",
  },
  {
    key: "certifications",
    pattern: /^(certifications|certificates)\b/i,
    label: "Certifications",
  },
];

const GENERIC_PHRASES = [
  "hard working",
  "team player",
  "good communication",
  "quick learner",
  "responsible for",
  "worked on",
  "various tasks",
  "many projects",
];

const readLines = (text = "") =>
  String(text)
    .replace(/\r/g, "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

const normalize = (text = "") => String(text).toLowerCase();

const fingerprint = (text = "") =>
  crypto
    .createHash("sha1")
    .update(normalize(text).replace(/\s+/g, " "))
    .digest("hex")
    .slice(0, 12);

const countMatches = (text, regex) => (text.match(regex) || []).length;

const hasContactSignal = (text) => {
  const email = /[\w.+-]+@[\w-]+\.[\w.-]+/i.test(text);
  const phone =
    /(?:\+?\d{1,3}[-\s.]?)?(?:\(?\d{3}\)?[-\s.]?)?\d{3}[-\s.]?\d{4}/.test(text);
  const linkedin = /linkedin\.com/i.test(text);
  const github = /github\.com/i.test(text);
  const portfolio = /portfolio|website|https?:\/\//i.test(text);
  return { email, phone, linkedin, github, portfolio };
};

const detectSections = (text) => {
  const lines = readLines(text);
  const found = new Set();

  lines.forEach((line) => {
    SECTION_PATTERNS.forEach((section) => {
      if (section.pattern.test(line)) {
        found.add(section.key);
      }
    });
  });

  return found;
};

const resolveRoleKeywords = (targetRole = "") => {
  const normalizedRole = normalize(targetRole);
  const entry = Object.entries(ROLE_KEYWORDS).find(([role]) =>
    normalizedRole.includes(role),
  );
  return entry ? entry[1] : ROLE_KEYWORDS["software engineer"];
};

const collectKeywords = (text, targetRole) => {
  const keywords = resolveRoleKeywords(targetRole);
  const normalized = normalize(text);
  const matched = keywords.filter((keyword) => normalized.includes(keyword));
  const missing = keywords.filter((keyword) => !normalized.includes(keyword));
  return { matched, missing, keywords };
};

const buildSuggestions = ({ sections, contact, matched, missing, text }) => {
  const suggestions = [];

  if (!contact.email || !contact.phone) {
    suggestions.push(
      "Add a clear email and phone number at the top so recruiters can contact you quickly.",
    );
  }
  if (!sections.has("summary")) {
    suggestions.push(
      "Add a short 2-3 line professional summary with your role, stack, and strongest outcome.",
    );
  }
  if (!sections.has("skills")) {
    suggestions.push(
      "Create a dedicated skills section so ATS can detect your core technologies instantly.",
    );
  }
  if (!sections.has("projects") && !sections.has("experience")) {
    suggestions.push(
      "Add project or experience entries with measurable outcomes instead of only generic statements.",
    );
  }
  if (countMatches(text, /\b\d+%?|\$\d+|\b\d+(?:\.\d+)?x\b/gi) < 2) {
    suggestions.push(
      "Add numbers, percentages, or scale metrics to make impact more credible.",
    );
  }
  if (countMatches(text, /\n[-*•]/g) < 4) {
    suggestions.push(
      "Use bullet points under each role or project so the resume is easier to scan.",
    );
  }
  if (matched.length < Math.max(3, Math.floor(missing.length / 2))) {
    suggestions.push(
      "Align the wording with the target role by using the missing role keywords naturally.",
    );
  }
  if (GENERIC_PHRASES.some((phrase) => normalize(text).includes(phrase))) {
    suggestions.push(
      "Replace generic claims with specific achievements, tools, and outcomes.",
    );
  }

  return [...new Set(suggestions)].slice(0, 6);
};

const scoreResume = ({ text = "", targetRole = "Software Engineer" }) => {
  const normalized = normalize(text);
  const sections = detectSections(text);
  const contact = hasContactSignal(text);
  const { matched, missing, keywords } = collectKeywords(text, targetRole);

  const contactScore = Math.min(
    15,
    (contact.email ? 5 : 0) +
      (contact.phone ? 4 : 0) +
      (contact.linkedin ? 2 : 0) +
      (contact.github ? 2 : 0) +
      (contact.portfolio ? 2 : 0),
  );
  const structureScore = Math.min(
    20,
    sections.size * 3 +
      (sections.has("summary") ? 3 : 0) +
      (sections.has("skills") ? 4 : 0) +
      (sections.has("projects") || sections.has("experience") ? 4 : 0),
  );
  const impactScore = Math.min(
    15,
    countMatches(text, /\b\d+%?|\$\d+|\b\d+(?:\.\d+)?x\b/g) * 3 +
      Math.min(countMatches(text, /\n[-*•]/g), 3) * 2 +
      Math.min(
        countMatches(
          normalized,
          new RegExp(`\\b(${ACTION_VERBS.join("|")})\\b`, "g"),
        ),
        4,
      ) *
        2,
  );
  const keywordMatchScore = Math.min(
    25,
    Math.round((matched.length / Math.max(keywords.length, 1)) * 25),
  );
  const readabilityScore = Math.min(
    15,
    Math.max(
      0,
      4 +
        Math.min(countMatches(text, /\n/g), 8) +
        (countMatches(text, /\n[-*•]/g) >= 3 ? 4 : 0) -
        countMatches(
          normalized,
          /\b(responsible for|worked on|various tasks)\b/g,
        ) *
          2,
    ),
  );
  const roleAlignmentScore = Math.min(
    10,
    matched.length >= 6
      ? 10
      : matched.length >= 4
        ? 8
        : matched.length >= 2
          ? 5
          : 2,
  );

  const overall = Math.max(
    40,
    Math.min(
      100,
      Math.round(
        contactScore +
          structureScore +
          impactScore +
          keywordMatchScore +
          readabilityScore +
          roleAlignmentScore,
      ),
    ),
  );

  const strengths = [];
  if (contact.email && contact.phone)
    strengths.push("Contact details are easy to find.");
  if (sections.has("skills"))
    strengths.push("Skills section is present for ATS parsing.");
  if (sections.has("projects") || sections.has("experience"))
    strengths.push("Work evidence exists in projects or experience.");
  if (matched.length >= 4)
    strengths.push("Good keyword overlap with the target role.");
  if (countMatches(text, /\b\d+%?|\$\d+|\b\d+(?:\.\d+)?x\b/g) >= 2)
    strengths.push("Quantified achievements are visible.");

  const gaps = [];
  if (!contact.linkedin) gaps.push("Add a LinkedIn profile link.");
  if (!contact.github && /developer|engineer|technical/i.test(targetRole))
    gaps.push(
      "Add a GitHub profile link if you are applying for technical roles.",
    );
  if (!sections.has("summary")) gaps.push("Add a concise summary section.");
  if (!sections.has("certifications"))
    gaps.push("Add certifications if you have role-relevant ones.");
  if (missing.length)
    gaps.push(`Missing role keywords: ${missing.slice(0, 5).join(", ")}`);

  const suggestions = buildSuggestions({
    sections,
    contact,
    matched,
    missing,
    text,
  });

  return {
    overall,
    contact: contactScore,
    structure: structureScore,
    impact: impactScore,
    keywordMatch: keywordMatchScore,
    readability: readabilityScore,
    roleAlignment: roleAlignmentScore,
    fingerprint: fingerprint(text),
    matchedKeywords: matched,
    missingKeywords: missing,
    strengths,
    gaps,
    suggestions,
  };
};

module.exports = {
  scoreResume,
  resolveRoleKeywords,
  fingerprint,
};
