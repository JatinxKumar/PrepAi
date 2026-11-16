import React, { useState } from "react";
import { Briefcase, AlertCircle, CheckCircle2, ArrowRight, Zap, Search, Sparkles } from "lucide-react";

export default function JobRoleSkillGaps({ history = [], onGoToResume }) {
  const [selectedRole, setSelectedRole] = useState("sde1");

  // Trending Job Roles with industry benchmarks and required skills
  const roleBenchmarks = {
    sde1: {
      title: "SDE 1 (Product / Tech)",
      description: "Core algorithms, REST/gRPC APIs, database caching, containerization, and unit tests.",
      requiredKeywords: [
        { name: "Docker", category: "DevOps", priority: "High" },
        { name: "Redis", category: "Data", priority: "High" },
        { name: "Microservices", category: "Architecture", priority: "High" },
        { name: "AWS", category: "Cloud", priority: "Medium" },
        { name: "PostgreSQL", category: "Database", priority: "Medium" },
        { name: "Jest / Unit Tests", category: "Quality", priority: "High" },
        { name: "CI/CD Pipeline", category: "DevOps", priority: "Medium" },
        { name: "Kafka / RabbitMQ", category: "Messaging", priority: "Low" },
      ],
    },
    frontend: {
      title: "Frontend Developer (React / Next.js)",
      description: "State machines, responsive design, bundle optimization, SSR, and web performance.",
      requiredKeywords: [
        { name: "TypeScript", category: "Language", priority: "High" },
        { name: "Next.js", category: "Framework", priority: "High" },
        { name: "Tailwind CSS", category: "Styling", priority: "Medium" },
        { name: "Redux / Zustand", category: "State", priority: "High" },
        { name: "Web Vitals / Lighthouse", category: "Performance", priority: "High" },
        { name: "Jest / Playwright", category: "Testing", priority: "Medium" },
        { name: "GraphQL", category: "API", priority: "Low" },
      ],
    },
    fullstack: {
      title: "Fullstack Engineer",
      description: "End-to-end features, auth flow, schema migrations, and deployment pipeline.",
      requiredKeywords: [
        { name: "Node.js / Express", category: "Backend", priority: "High" },
        { name: "React", category: "Frontend", priority: "High" },
        { name: "Docker", category: "DevOps", priority: "High" },
        { name: "Redis", category: "Cache", priority: "High" },
        { name: "JWT / OAuth2", category: "Security", priority: "High" },
        { name: "MongoDB / SQL", category: "Database", priority: "Medium" },
        { name: "AWS / Cloudflare", category: "Cloud", priority: "Medium" },
      ],
    },
    ai_ml: {
      title: "AI / ML Engineer (GenAI)",
      description: "LLM agents, vector embeddings, prompt orchestration, evaluation, and latency reduction.",
      requiredKeywords: [
        { name: "LangChain / LlamaIndex", category: "GenAI", priority: "High" },
        { name: "Vector DB (Pinecone/Milvus)", category: "Database", priority: "High" },
        { name: "Python / FastAPI", category: "Backend", priority: "High" },
        { name: "OpenAI / Gemini API", category: "LLM", priority: "High" },
        { name: "Docker", category: "DevOps", priority: "Medium" },
        { name: "PyTorch", category: "ML", priority: "Medium" },
      ],
    },
  };

  // Extract all tech detected across user's history
  const userDetectedTech = new Set();
  history.forEach((project) => {
    if (project.analysis?.techStack && Array.isArray(project.analysis.techStack)) {
      project.analysis.techStack.forEach((t) => userDetectedTech.add(t.toLowerCase()));
    }
    // Also scan repo name and overview text
    const textBlob = `${project.name} ${project.analysis?.overview || ""}`.toLowerCase();
    ["react", "node", "express", "mongodb", "tailwind", "zustand", "python", "fastapi"].forEach((kw) => {
      if (textBlob.includes(kw)) userDetectedTech.add(kw);
    });
  });

  const currentRoleData = roleBenchmarks[selectedRole];

  // Evaluate which keywords exist in user repo vs missing
  const evaluation = currentRoleData.requiredKeywords.map((item) => {
    const term = item.name.toLowerCase();
    const isPresent =
      Array.from(userDetectedTech).some((tech) => tech.includes(term) || term.includes(tech)) ||
      (term.includes("react") && userDetectedTech.has("react")) ||
      (term.includes("tailwind") && userDetectedTech.has("tailwind"));

    return {
      ...item,
      status: isPresent ? "present" : "missing",
    };
  });

  const missingList = evaluation.filter((k) => k.status === "missing");
  const presentList = evaluation.filter((k) => k.status === "present");
  const matchPercentage = Math.round((presentList.length / evaluation.length) * 100);

  return (
    <div className="bauhaus-card p-6 bg-white font-bauhaus border-[3px] border-[#111111] shadow-[6px_6px_0_#111111]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b-2 border-[#111111]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#F0C020] border-2 border-[#111111] text-[#111111] flex items-center justify-center shadow-[2px_2px_0_#111111] shrink-0 font-bold">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-black uppercase text-[#111111] font-['Outfit']">
                Trending Job Role Keyword & Skill Gaps
              </h3>
              <span className="px-2 py-0.5 bg-[#F0C020] text-[#111111] text-[10px] font-black uppercase font-['JetBrains_Mono'] border border-[#111111]">
                ATS BENCHMARK
              </span>
            </div>
            <p className="text-xs text-[#555555] font-['JetBrains_Mono'] mt-0.5">
              Live gap analysis comparing your codebases against active hiring rubrics.
            </p>
          </div>
        </div>

        {/* Role Selector Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 self-start sm:self-auto">
          {Object.entries(roleBenchmarks).map(([key, role]) => (
            <button
              key={key}
              onClick={() => setSelectedRole(key)}
              className={`px-3 py-1 text-xs font-bold font-['JetBrains_Mono'] uppercase border border-[#111111] transition-all ${
                selectedRole === key
                  ? "bg-[#111111] text-white"
                  : "bg-white text-[#111111] hover:bg-[#F0C020]"
              }`}
            >
              {key === "sde1" ? "SDE 1" : key === "frontend" ? "Frontend" : key === "fullstack" ? "Fullstack" : "GenAI / ML"}
            </button>
          ))}
        </div>
      </div>

      {/* Role Summary Banner */}
      <div className="mt-4 p-4 bg-[#F0F0F0] border-2 border-[#111111] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-[#555555] font-['JetBrains_Mono']">
            ACTIVE TARGET ROLE:
          </span>
          <h4 className="text-base font-black text-[#111111] uppercase font-['Outfit']">
            {currentRoleData.title}
          </h4>
          <p className="text-xs text-[#555555] font-sans mt-0.5">
            {currentRoleData.description}
          </p>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <div className="text-right">
            <div className="text-[10px] font-bold uppercase text-[#555555] font-['JetBrains_Mono']">
              ATS MATCH
            </div>
            <div className="text-2xl font-black text-[#111111] font-['JetBrains_Mono']">
              {matchPercentage}%
            </div>
          </div>

          {onGoToResume && (
            <button
              onClick={onGoToResume}
              className="px-3.5 py-2 bg-[#1040C0] text-white border-2 border-[#111111] text-xs font-black uppercase font-['JetBrains_Mono'] shadow-[2px_2px_0_#111111] hover:bg-[#0c3299] transition-all flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#F0C020]" />
              <span>Tailor Resume</span>
            </button>
          )}
        </div>
      </div>

      {/* Missing Keywords Table */}
      <div className="mt-4 overflow-x-auto border-2 border-[#111111]">
        <table className="w-full text-left border-collapse font-bauhaus text-xs">
          <thead>
            <tr className="bg-[#111111] text-white font-['JetBrains_Mono'] uppercase text-[11px]">
              <th className="p-3 border-r border-white/20">Keyword / Skill</th>
              <th className="p-3 border-r border-white/20">Domain</th>
              <th className="p-3 border-r border-white/20">Recruiter Priority</th>
              <th className="p-3 border-r border-white/20">Current Status</th>
              <th className="p-3">Recommended Next Step</th>
            </tr>
          </thead>
          <tbody className="divide-y-2 divide-[#111111]">
            {evaluation.map((item, index) => {
              const isMissing = item.status === "missing";
              return (
                <tr
                  key={index}
                  className={`hover:bg-black/5 transition-colors ${
                    isMissing ? "bg-[#FFF9F9]" : "bg-[#F7FFF7]"
                  }`}
                >
                  {/* Skill Name */}
                  <td className="p-3 font-bold text-[#111111] font-['JetBrains_Mono'] border-r-2 border-[#111111]">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2 h-2 ${
                          isMissing ? "bg-[#D02020]" : "bg-[#1040C0]"
                        }`}
                      />
                      <span className="text-sm font-black font-['Outfit'] uppercase">
                        {item.name}
                      </span>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="p-3 font-medium text-[#555555] font-['JetBrains_Mono'] border-r-2 border-[#111111] uppercase">
                    {item.category}
                  </td>

                  {/* Priority */}
                  <td className="p-3 font-bold font-['JetBrains_Mono'] border-r-2 border-[#111111]">
                    <span
                      className={`px-2 py-0.5 border text-[10px] font-black uppercase ${
                        item.priority === "High"
                          ? "bg-[#D02020] text-white border-[#111111]"
                          : item.priority === "Medium"
                          ? "bg-[#F0C020] text-[#111111] border-[#111111]"
                          : "bg-white text-[#555555] border-[#111111]"
                      }`}
                    >
                      {item.priority}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="p-3 font-bold font-['JetBrains_Mono'] border-r-2 border-[#111111]">
                    {isMissing ? (
                      <span className="inline-flex items-center gap-1 text-[#D02020] uppercase text-[11px] font-black">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        Missing in Codebase
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[#1040C0] uppercase text-[11px] font-black">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        Verified Present
                      </span>
                    )}
                  </td>

                  {/* Recommended Action */}
                  <td className="p-3 text-[#333333] font-sans text-xs">
                    {isMissing ? (
                      <span className="text-[#D02020] font-medium">
                        Add {item.name} implementation to your active repo or resume bullet points.
                      </span>
                    ) : (
                      <span className="text-[#555555]">
                        Highlight production metrics & interview defense for {item.name}.
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer Insight */}
      <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-[#555555] font-['JetBrains_Mono'] gap-2">
        <span>
          * Scanned from analyzed repositories & system architecture outputs.
        </span>
        <span className="font-bold text-[#111111] uppercase">
          {missingList.length} Critical gaps remaining for {currentRoleData.title}
        </span>
      </div>
    </div>
  );
}
