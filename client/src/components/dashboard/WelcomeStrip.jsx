import React from "react";
import { Sparkles, Trophy, ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";

export default function WelcomeStrip({
  user,
  history = [],
  resumeCount = 0,
  onStartNewAnalysis,
}) {
  const firstName = user?.name ? user.name.split(" ")[0] : "Developer";

  // Calculate real placement readiness score (0 - 100%)
  // 1. Repositories (up to 3 repos gives up to 40%)
  const repoScore = Math.min(40, (history.length / 3) * 40);

  // 2. Viva drills available/practiced (up to 30%)
  const totalViva = history.reduce(
    (acc, p) => acc + (p.vivaPrep?.length || 0),
    0
  );
  const vivaScore = totalViva > 0 ? Math.min(30, (totalViva / 15) * 30) : 0;

  // 3. Resume uploaded/verified (30%)
  const resumeScore = resumeCount > 0 ? 30 : 0;

  const totalReadiness = Math.round(repoScore + vivaScore + resumeScore);

  // Dynamic status tier based on real readiness
  const getTier = (score) => {
    if (score >= 85) return { label: "PLACEMENT READY", color: "bg-[#1040C0] text-white" };
    if (score >= 60) return { label: "ADVANCED PROFILE", color: "bg-[#F0C020] text-[#111111]" };
    if (score >= 30) return { label: "IN PROGRESS", color: "bg-[#F0C020] text-[#111111]" };
    return { label: "SETUP REQUIRED", color: "bg-[#D02020] text-white" };
  };

  const tier = getTier(totalReadiness);

  return (
    <div className="bg-white border-[3px] border-[#111111] shadow-[6px_6px_0_#111111] p-6 sm:p-8 font-bauhaus relative overflow-hidden">
      {/* Decorative top stripe */}
      <div className="absolute top-0 left-0 right-0 h-2 bg-[#1040C0]" />

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Left greeting and headline */}
        <div className="max-w-xl">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 bg-[#F0F0F0] border border-[#111111] text-[10px] font-bold uppercase font-['JetBrains_Mono'] mb-3">
            <span className="w-2 h-2 bg-[#D02020] inline-block" />
            PLACEMENT COMMAND CENTER
          </div>

          <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-[#111111] font-['Outfit']">
            Welcome back, {firstName}!
          </h2>

          <p className="text-xs sm:text-sm text-[#555555] font-sans mt-2 leading-relaxed">
            {totalReadiness === 0
              ? "Your placement pipeline is idle. Connect a GitHub repository to trigger the 7-agent extraction engine."
              : `Your profile readiness is active at ${totalReadiness}%. Complete recommended drills to maximize screening scores.`}
          </p>
        </div>

        {/* Right: Dynamic Placement Readiness Gauge Bar */}
        <div className="w-full lg:w-96 bg-[#F0F0F0] border-2 border-[#111111] p-4 shadow-[3px_3px_0_#111111]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-black uppercase font-['Outfit'] text-[#111111] flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5 text-[#1040C0]" /> Placement Readiness
            </span>
            <span className="text-xs font-black font-['JetBrains_Mono'] text-[#111111]">
              {totalReadiness}%
            </span>
          </div>

          {/* Hard Multi-Segment Progress Bar */}
          <div className="h-4 bg-white border-2 border-[#111111] p-0.5 flex overflow-hidden">
            <div
              className="h-full bg-[#1040C0] transition-all duration-500"
              style={{ width: `${totalReadiness}%` }}
            />
          </div>

          {/* Breakdown checklist badges */}
          <div className="flex items-center justify-between mt-3 text-[10px] font-['JetBrains_Mono'] uppercase">
            <span className={`font-bold ${history.length > 0 ? "text-[#1040C0]" : "text-[#777777]"}`}>
              {history.length > 0 ? "✓" : "○"} {history.length}/3 Repos
            </span>
            <span className={`font-bold ${totalViva > 0 ? "text-[#1040C0]" : "text-[#777777]"}`}>
              {totalViva > 0 ? "✓" : "○"} {totalViva} Viva Qs
            </span>
            <span className={`font-bold ${resumeCount > 0 ? "text-[#1040C0]" : "text-[#777777]"}`}>
              {resumeCount > 0 ? "✓" : "○"} Resume
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
