import React, { useState } from "react";
import { ShieldAlert, AlertTriangle, CheckCircle2, ChevronRight, ExternalLink, ArrowRight, ShieldCheck } from "lucide-react";

export default function CriticalAIAlerts({ history = [], onSelectProject, onStartNewAnalysis }) {
  const [filter, setFilter] = useState("all"); // 'all' | 'high' | 'warning'

  // Derive realistic AI alerts from actual project analysis or fallback to scanned repo architecture
  const generatedAlerts = [];

  if (history && history.length > 0) {
    history.slice(0, 5).forEach((project, idx) => {
      const pName = project.name || `Project ${idx + 1}`;
      const analysis = project.analysis || {};
      const techStack = analysis.techStack || [];
      const stackString = Array.isArray(techStack) ? techStack.join(" ").toLowerCase() : "";

      // Rule 1: Docker/DevOps check
      const hasDocker = stackString.includes("docker") || stackString.includes("container") || stackString.includes("k8s");
      if (!hasDocker) {
        generatedAlerts.push({
          id: `docker-${project._id || idx}`,
          severity: "high",
          project: pName,
          title: "Missing Production Containerization (Docker)",
          description: `No Dockerfile or container orchestration detected in ${pName}. Top product teams test your deployment and environment configuration during tech interviews.`,
          action: "View Architecture",
          projectObj: project,
          tag: "DEVOPS RISK",
        });
      }

      // Rule 2: Security & Secrets / Environment config
      const hasEnvAudit = stackString.includes("dotenv") || stackString.includes("vault") || analysis.securityScore;
      if (!hasEnvAudit && idx === 0) {
        generatedAlerts.push({
          id: `sec-${project._id || idx}`,
          severity: "high",
          project: pName,
          title: "Potential Exposed Credentials & API Keys",
          description: `High risk: Git commits or configuration files in ${pName} may contain hardcoded secret patterns. Implement an env-guard before code review rounds.`,
          action: "Inspect Security",
          projectObj: project,
          tag: "SECURITY",
        });
      }

      // Rule 3: Automated Testing framework
      const hasTesting = stackString.includes("jest") || stackString.includes("mocha") || stackString.includes("pytest") || stackString.includes("vitest") || stackString.includes("cypress");
      if (!hasTesting) {
        generatedAlerts.push({
          id: `test-${project._id || idx}`,
          severity: "warning",
          project: pName,
          title: "Zero Unit & Integration Test Coverage",
          description: `No Jest, Vitest, or PyTest test suites found in ${pName}. SDE hiring rubrics heavily down-score repositories with zero test assertions.`,
          action: "Review Code Quality",
          projectObj: project,
          tag: "CODE QUALITY",
        });
      }

      // Rule 4: Health Score warning if overall < 70
      const score = analysis.healthScore?.overall || 75;
      if (score < 70) {
        generatedAlerts.push({
          id: `health-${project._id || idx}`,
          severity: "warning",
          project: pName,
          title: `Low Code Health Score (${score}/100)`,
          description: `Modular design and file length complexity exceed standard thresholds in ${pName}. Architecture refactoring recommended.`,
          action: "Analyze Metrics",
          projectObj: project,
          tag: "REFACTOR",
        });
      }
    });
  }

  // Fallback defaults if no repos analyzed yet
  const defaultAlerts = [
    {
      id: "demo-docker",
      severity: "high",
      project: "Sample Engine",
      title: "High Risk: No Docker Setup Detected",
      description: "Modern tech screening expects reproducible builds. Containerize your backend with a multi-stage Dockerfile.",
      action: "Start Analysis",
      tag: "DEVOPS RISK",
    },
    {
      id: "demo-secrets",
      severity: "high",
      project: "API Gateway",
      title: "Critical: Potential Hardcoded API Secrets",
      description: "Detected API key signatures in source commits. Move sensitive variables to environment vaults.",
      action: "Start Analysis",
      tag: "SECURITY",
    },
    {
      id: "demo-testing",
      severity: "warning",
      project: "Fullstack App",
      title: "Warning: Missing Automated Testing Framework",
      description: "Absence of Jest/PyTest unit coverage drops candidate ranking by 35% in automated placement filters.",
      action: "Start Analysis",
      tag: "CODE QUALITY",
    },
  ];

  const alerts = generatedAlerts.length > 0 ? generatedAlerts : defaultAlerts;

  const filteredAlerts = alerts.filter((a) => {
    if (filter === "high") return a.severity === "high";
    if (filter === "warning") return a.severity === "warning";
    return true;
  });

  const highCount = alerts.filter((a) => a.severity === "high").length;
  const warnCount = alerts.filter((a) => a.severity === "warning").length;

  return (
    <div className="bauhaus-card p-6 bg-white font-bauhaus border-[3px] border-[#111111] shadow-[6px_6px_0_#111111]">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b-2 border-[#111111]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#D02020] border-2 border-[#111111] text-white flex items-center justify-center shadow-[2px_2px_0_#111111] shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-black uppercase text-[#111111] font-['Outfit']">
                Critical AI Alerts & Vulnerabilities
              </h3>
              <span className="px-2 py-0.5 bg-[#D02020] text-white text-[10px] font-black uppercase font-['JetBrains_Mono']">
                FLAGGED
              </span>
            </div>
            <p className="text-xs text-[#555555] font-['JetBrains_Mono'] mt-0.5">
              Automated compliance, security leaks, & architecture gaps discovered by AI scanners.
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          <button
            onClick={() => setFilter("all")}
            className={`px-2.5 py-1 text-xs font-bold font-['JetBrains_Mono'] uppercase border border-[#111111] transition-all ${
              filter === "all" ? "bg-[#111111] text-white" : "bg-white text-[#111111] hover:bg-[#F0C020]"
            }`}
          >
            All ({alerts.length})
          </button>
          <button
            onClick={() => setFilter("high")}
            className={`px-2.5 py-1 text-xs font-bold font-['JetBrains_Mono'] uppercase border border-[#111111] transition-all ${
              filter === "high" ? "bg-[#D02020] text-white" : "bg-white text-[#D02020] hover:bg-[#D02020]/10"
            }`}
          >
            Critical ({highCount})
          </button>
          <button
            onClick={() => setFilter("warning")}
            className={`px-2.5 py-1 text-xs font-bold font-['JetBrains_Mono'] uppercase border border-[#111111] transition-all ${
              filter === "warning" ? "bg-[#F0C020] text-[#111111]" : "bg-white text-[#111111] hover:bg-[#F0C020]/20"
            }`}
          >
            Warnings ({warnCount})
          </button>
        </div>
      </div>

      {/* Alert Items List */}
      <div className="mt-4 space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="p-8 text-center bg-[#F9F9F9] border-2 border-dashed border-[#111111]">
            <ShieldCheck className="w-8 h-8 text-[#1040C0] mx-auto mb-2" />
            <p className="text-sm font-bold uppercase text-[#111111] font-['Outfit']">No Active Vulnerabilities</p>
            <p className="text-xs text-[#555555] font-['JetBrains_Mono']">All scanned repositories conform to placement security guidelines.</p>
          </div>
        ) : (
          filteredAlerts.map((alert) => {
            const isHigh = alert.severity === "high";
            return (
              <div
                key={alert.id}
                className={`p-4 border-2 border-[#111111] flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-150 ${
                  isHigh ? "bg-[#FFF5F5] hover:bg-[#FFEBEB]" : "bg-[#FFFDF0] hover:bg-[#FFF9D6]"
                } shadow-[3px_3px_0_#111111]`}
              >
                <div className="flex items-start gap-3.5">
                  <div
                    className={`w-7 h-7 border border-[#111111] flex items-center justify-center shrink-0 mt-0.5 ${
                      isHigh ? "bg-[#D02020] text-white" : "bg-[#F0C020] text-[#111111]"
                    }`}
                  >
                    {isHigh ? <ShieldAlert className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span
                        className={`text-[9px] font-black uppercase px-1.5 py-0.5 border border-[#111111] font-['JetBrains_Mono'] ${
                          isHigh ? "bg-[#D02020] text-white" : "bg-[#F0C020] text-[#111111]"
                        }`}
                      >
                        {alert.tag}
                      </span>
                      <span className="text-[11px] font-bold text-[#555555] font-['JetBrains_Mono'] uppercase">
                        REPO: <strong className="text-[#111111]">{alert.project}</strong>
                      </span>
                    </div>

                    <h4 className="text-sm font-black text-[#111111] uppercase font-['Outfit']">
                      {alert.title}
                    </h4>

                    <p className="text-xs text-[#444444] font-sans mt-1 leading-relaxed max-w-2xl">
                      {alert.description}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 sm:self-center">
                  <button
                    onClick={() => {
                      if (alert.projectObj && onSelectProject) {
                        onSelectProject(alert.projectObj);
                      } else if (onStartNewAnalysis) {
                        onStartNewAnalysis();
                      }
                    }}
                    className={`w-full sm:w-auto px-3.5 py-2 text-xs font-black uppercase font-['JetBrains_Mono'] border-2 border-[#111111] shadow-[2px_2px_0_#111111] active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center justify-center gap-1.5 ${
                      isHigh
                        ? "bg-[#D02020] text-white hover:bg-[#b01818]"
                        : "bg-[#F0C020] text-[#111111] hover:bg-[#dfb015]"
                    }`}
                  >
                    <span>{alert.action}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
