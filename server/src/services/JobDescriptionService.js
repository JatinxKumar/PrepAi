const GroqAgent = require("./GroqAgent");

const JD_SYSTEM_INSTRUCTION = `You are a strict, deterministic Job Description parsing engine. Your sole task is to extract structured JSON requirements from raw job description text.

CRITICAL EXTRACTION CONSTRAINTS:
1. Extract ONLY information present in the job description text. NEVER infer or invent tools, skills, or requirements.
2. Distinguish STRICTLY between REQUIRED skills (must-have, mandatory, essential) and PREFERRED skills (nice-to-have, plus, optional, bonus).
3. Output ONLY a raw, valid JSON object conforming to the schema below. Do NOT wrap in markdown fences like \`\`\`json. Do NOT include commentary.
4. Leave missing or unknown fields as empty string "", empty array [], or null.

JSON SCHEMA TO CONFORM TO:
{
  "jobTitle": "",
  "company": "",
  "seniority": "",
  "location": "",
  "employmentType": "",
  "requiredSkills": [
    {
      "skill": "",
      "category": "",
      "importance": "required"
    }
  ],
  "preferredSkills": [
    {
      "skill": "",
      "category": "",
      "importance": "preferred"
    }
  ],
  "responsibilities": [],
  "qualifications": [],
  "educationRequirements": [],
  "experienceRequirements": [],
  "keywords": [],
  "toolsAndTechnologies": [],
  "softSkills": []
}`;

const cleanLLMOutput = (rawOutput) => {
  if (!rawOutput) return "";
  let cleaned = rawOutput.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  }
  return cleaned.trim();
};

const normalizeStructuredJD = (parsed) => {
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("Parsed job description is not a valid JSON object");
  }

  const normalizeSkillArray = (arr, defaultImportance) => {
    if (!Array.isArray(arr)) return [];
    return arr.map((item) => {
      if (typeof item === "string") {
        return { skill: item, category: "general", importance: defaultImportance };
      }
      return {
        skill: item.skill || "",
        category: item.category || "general",
        importance: item.importance || defaultImportance,
      };
    }).filter((s) => Boolean(s.skill));
  };

  return {
    jobTitle: parsed.jobTitle || "Target Role",
    company: parsed.company || "",
    seniority: parsed.seniority || "",
    location: parsed.location || "",
    employmentType: parsed.employmentType || "",
    requiredSkills: normalizeSkillArray(parsed.requiredSkills, "required"),
    preferredSkills: normalizeSkillArray(parsed.preferredSkills, "preferred"),
    responsibilities: Array.isArray(parsed.responsibilities) ? parsed.responsibilities : [],
    qualifications: Array.isArray(parsed.qualifications) ? parsed.qualifications : [],
    educationRequirements: Array.isArray(parsed.educationRequirements) ? parsed.educationRequirements : [],
    experienceRequirements: Array.isArray(parsed.experienceRequirements) ? parsed.experienceRequirements : [],
    keywords: Array.isArray(parsed.keywords) ? parsed.keywords : [],
    toolsAndTechnologies: Array.isArray(parsed.toolsAndTechnologies) ? parsed.toolsAndTechnologies : [],
    softSkills: Array.isArray(parsed.softSkills) ? parsed.softSkills : [],
  };
};

/**
 * Converts raw job description text into a structured JSON representation using Groq.
 * @param {string} jobText - The raw job description text.
 * @returns {Promise<{ success: boolean, data?: object, error?: string }>}
 */
const structureJobDescription = async (jobText) => {
  if (!jobText || typeof jobText !== "string" || !jobText.trim()) {
    return {
      success: false,
      error: "Job description text is empty or invalid.",
    };
  }

  const textLength = jobText.length;
  console.log(`[JobDescriptionService] Initiating JD structuring for text length: ${textLength}`);

  try {
    const userPrompt = `Extract structured requirements from the following raw job description:\n\n${jobText}`;

    const rawResponse = await GroqAgent.generate(
      userPrompt,
      JD_SYSTEM_INSTRUCTION,
      3,
      2000
    );

    const cleanedJsonString = cleanLLMOutput(rawResponse);
    let parsedObject = null;

    try {
      parsedObject = JSON.parse(cleanedJsonString);
    } catch (jsonErr) {
      console.error("[JobDescriptionService] Failed to parse JSON response from LLM.");
      return {
        success: false,
        error: `JSON parse failure: ${jsonErr.message}`,
      };
    }

    const normalizedData = normalizeStructuredJD(parsedObject);
    console.log("[JobDescriptionService] Job Description structuring succeeded and normalized.");

    return {
      success: true,
      data: normalizedData,
    };
  } catch (error) {
    console.error("[JobDescriptionService] Unexpected error during JD structuring:", error.message);
    return {
      success: false,
      error: error.message || "Failed to structure job description text.",
    };
  }
};

module.exports = {
  structureJobDescription,
  normalizeStructuredJD,
  cleanLLMOutput,
};
