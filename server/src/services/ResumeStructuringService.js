const GroqAgent = require("./GroqAgent");

const STRUCTURING_SYSTEM_INSTRUCTION = `You are a strict, deterministic resume parsing engine. Your sole task is to extract information from raw resume text into structured JSON.

CRITICAL CONSTRAINTS:
1. Extract ONLY information present in the resume text.
2. NEVER infer, invent, extrapolate, or hallucinate facts, dates, skills, or experience.
3. Output ONLY a raw, valid JSON object. Do NOT wrap the JSON in markdown code blocks like \`\`\`json. Do NOT include introductory or concluding text.
4. For missing or unknown fields, leave them as empty string "", empty array [], or null as defined in the schema.

JSON SCHEMA TO CONFORM TO:
{
  "personal": {
    "name": "",
    "email": "",
    "phone": "",
    "location": "",
    "linkedin": "",
    "github": "",
    "portfolio": ""
  },
  "summary": "",
  "skills": {
    "languages": [],
    "frameworks": [],
    "databases": [],
    "tools": [],
    "other": []
  },
  "experience": [
    {
      "company": "",
      "role": "",
      "location": "",
      "startDate": "",
      "endDate": "",
      "bullets": []
    }
  ],
  "projects": [
    {
      "name": "",
      "description": "",
      "technologies": [],
      "bullets": []
    }
  ],
  "education": [
    {
      "institution": "",
      "degree": "",
      "field": "",
      "startDate": "",
      "endDate": "",
      "details": []
    }
  ],
  "achievements": [],
  "certifications": []
}`;

const normalizeStructuredResume = (parsed) => {
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("Parsed structured resume is not a valid JSON object");
  }

  return {
    personal: {
      name: parsed.personal?.name || "",
      email: parsed.personal?.email || "",
      phone: parsed.personal?.phone || "",
      location: parsed.personal?.location || "",
      linkedin: parsed.personal?.linkedin || "",
      github: parsed.personal?.github || "",
      portfolio: parsed.personal?.portfolio || "",
    },
    summary: parsed.summary || "",
    skills: {
      languages: Array.isArray(parsed.skills?.languages) ? parsed.skills.languages : [],
      frameworks: Array.isArray(parsed.skills?.frameworks) ? parsed.skills.frameworks : [],
      databases: Array.isArray(parsed.skills?.databases) ? parsed.skills.databases : [],
      tools: Array.isArray(parsed.skills?.tools) ? parsed.skills.tools : [],
      other: Array.isArray(parsed.skills?.other) ? parsed.skills.other : [],
    },
    experience: Array.isArray(parsed.experience)
      ? parsed.experience.map((exp) => ({
          company: exp.company || "",
          role: exp.role || "",
          location: exp.location || "",
          startDate: exp.startDate || "",
          endDate: exp.endDate || "",
          bullets: Array.isArray(exp.bullets) ? exp.bullets : [],
        }))
      : [],
    projects: Array.isArray(parsed.projects)
      ? parsed.projects.map((proj) => ({
          name: proj.name || "",
          description: proj.description || "",
          technologies: Array.isArray(proj.technologies) ? proj.technologies : [],
          bullets: Array.isArray(proj.bullets) ? proj.bullets : [],
        }))
      : [],
    education: Array.isArray(parsed.education)
      ? parsed.education.map((edu) => ({
          institution: edu.institution || "",
          degree: edu.degree || "",
          field: edu.field || "",
          startDate: edu.startDate || "",
          endDate: edu.endDate || "",
          details: Array.isArray(edu.details) ? edu.details : [],
        }))
      : [],
    achievements: Array.isArray(parsed.achievements) ? parsed.achievements : [],
    certifications: Array.isArray(parsed.certifications) ? parsed.certifications : [],
  };
};

const cleanLLMOutput = (rawOutput) => {
  if (!rawOutput) return "";
  let cleaned = rawOutput.trim();
  // Strip markdown code fences if present
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  }
  return cleaned.trim();
};

/**
 * Parses raw resume text into a normalized, structured JSON representation using Groq.
 * @param {string} extractedText - The raw extracted text from PDF/DOCX.
 * @returns {Promise<{ success: boolean, data?: object, error?: string }>}
 */
const structureResumeText = async (extractedText) => {
  if (!extractedText || typeof extractedText !== "string" || !extractedText.trim()) {
    return {
      success: false,
      error: "Extracted resume text is empty or invalid.",
    };
  }

  const textLength = extractedText.length;
  console.log(`[ResumeStructuringService] Initiating structuring for text length: ${textLength}`);

  try {
    const userPrompt = `Extract structured data from the following raw resume text:\n\n${extractedText}`;

    const rawResponse = await GroqAgent.generate(
      userPrompt,
      STRUCTURING_SYSTEM_INSTRUCTION,
      3,
      2000
    );

    const cleanedJsonString = cleanLLMOutput(rawResponse);
    let parsedObject = null;

    try {
      parsedObject = JSON.parse(cleanedJsonString);
    } catch (jsonErr) {
      console.error("[ResumeStructuringService] Failed to parse JSON response from LLM.");
      return {
        success: false,
        error: `JSON parse failure: ${jsonErr.message}`,
      };
    }

    const normalizedData = normalizeStructuredResume(parsedObject);
    console.log("[ResumeStructuringService] Structuring succeeded and normalized.");

    return {
      success: true,
      data: normalizedData,
    };
  } catch (error) {
    console.error("[ResumeStructuringService] Unexpected error during resume structuring:", error.message);
    return {
      success: false,
      error: error.message || "Failed to structure resume text.",
    };
  }
};

module.exports = {
  structureResumeText,
  normalizeStructuredResume,
  cleanLLMOutput,
};
