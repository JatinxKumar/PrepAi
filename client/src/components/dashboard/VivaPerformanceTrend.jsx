import React, { useState } from "react";
import { TrendingUp, Award, CheckSquare, Sparkles, ArrowUpRight, Flame } from "lucide-react";

export default function VivaPerformanceTrend({ history = [], onGoToViva }) {
  // Try to read mock viva test results from localStorage or compute from history
  const getInitialSessions = () => {
    try {
      const stored = localStorage.getItem("prepai_viva_scores");
      if (stored) return JSON.parse(stored);
    } catch (e) {
      // ignore
    }

    // Default progression (e.g., Score went from 42% to 88% this month)
    const baseDate = new Date();
    return [
      { id: 1, date: "3 Wks Ago", score: 42, label: "Initial Drill", questions: 5, status: "Needs Practice" },
      { id: 2, date: "2 Wks Ago", score: 58, label: "Architecture Qs", questions: 6, status: "Average" },
      { id: 3, date: "10 Days Ago", score: 71, label: "DB & Concurrency", questions: 8, status: "Proficient" },
      { id: 4, date: "4 Days Ago", score: 82, label: "System Design", questions: 10, status: "Advanced" },
      { id: 5, date: "Yesterday", score: 88, label: "Mock Final Viva", questions: 12, status: "Tier-1 Ready" },
    ];
  };

  const [sessions] = useState(getInitialSessions);
  const [activePoint, setActivePoint] = useState(sessions[sessions.length - 1]);

  const latestScore = sessions[sessions.length - 1]?.score || 0;
  const initialScore = sessions[0]?.score || 0;
  const growth = latestScore - initialScore;

  // SVG Chart dimensions
  const width = 640;
  const height = 200;
  const paddingX = 45;
  const paddingY = 30;

  const minScore = 0;
  const maxScore = 100;

  const getCoordinates = (index, score) => {
    const x = paddingX + (index / (sessions.length - 1)) * (width - paddingX * 2);
    const y = height - paddingY - (score / maxScore) * (height - paddingY * 2);
    return { x, y };
  };

  const points = sessions.map((s, i) => getCoordinates(i, s.score));

  // Build SVG path string for smooth line or polyline
  const pathD = points.reduce((acc, curr, idx) => {
    if (idx === 0) return `M ${curr.x} ${curr.y}`;
    // Bezier control curves
    const prev = points[idx - 1];
    const cp1x = prev.x + (curr.x - prev.x) / 2;
    const cp1y = prev.y;
    const cp2x = prev.x + (curr.x - prev.x) / 2;
    const cp2y = curr.y;
    return `${acc} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${curr.x} ${curr.y}`;
  }, "");

  // Area fill under line
  const areaD = `${pathD} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`;

  return (
    <div className="bauhaus-card p-6 bg-white font-bauhaus border-[3px] border-[#111111] shadow-[6px_6px_0_#111111]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b-2 border-[#111111]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#1040C0] border-2 border-[#111111] text-white flex items-center justify-center shadow-[2px_2px_0_#111111] shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-black uppercase text-[#111111] font-['Outfit']">
                Viva Performance Growth
              </h3>
              <span className="px-2 py-0.5 bg-[#1040C0] text-white text-[10px] font-black uppercase font-['JetBrains_Mono']">
                LAST 5 SESSIONS
              </span>
            </div>
            <p className="text-xs text-[#555555] font-['JetBrains_Mono'] mt-0.5">
              Interactive historical trajectory tracking mock viva evaluation & verbal answers.
            </p>
          </div>
        </div>

        {/* Growth Badge */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#F0FDF4] border-2 border-[#111111] shadow-[2px_2px_0_#111111]">
            <Flame className="w-4 h-4 text-[#D02020]" />
            <span className="text-xs font-black text-[#111111] font-['JetBrains_Mono'] uppercase">
              +{growth}% Growth this month
            </span>
          </div>
          {onGoToViva && (
            <button
              onClick={onGoToViva}
              className="px-3 py-1.5 bg-[#F0C020] text-[#111111] border-2 border-[#111111] text-xs font-black uppercase font-['JetBrains_Mono'] shadow-[2px_2px_0_#111111] hover:bg-[#F0C020]/80 transition-all flex items-center gap-1"
            >
              <span>Practice Viva</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Chart Section */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-4 gap-6 items-center">
        {/* SVG Line Graph */}
        <div className="lg:col-span-3 bg-[#F9F9F9] border-2 border-[#111111] p-4 relative shadow-[3px_3px_0_#111111]">
          {/* Subtle grid lines */}
          <div className="absolute inset-0 pointer-events-none p-4 flex flex-col justify-between opacity-15">
            <div className="border-b border-[#111111] w-full" />
            <div className="border-b border-[#111111] w-full" />
            <div className="border-b border-[#111111] w-full" />
            <div className="border-b border-[#111111] w-full" />
          </div>

          <div className="w-full overflow-x-auto">
            <svg
              viewBox={`0 0 ${width} ${height}`}
              className="w-full h-48 select-none overflow-visible"
            >
              <defs>
                <linearGradient id="vivaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1040C0" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#1040C0" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Horizontal Reference lines with Labels */}
              {[25, 50, 75, 100].map((val) => {
                const y = height - paddingY - (val / maxScore) * (height - paddingY * 2);
                return (
                  <g key={val}>
                    <line
                      x1={paddingX - 10}
                      y1={y}
                      x2={width - paddingX + 10}
                      y2={y}
                      stroke="#E5E5E5"
                      strokeDasharray="4 4"
                      strokeWidth="1.5"
                    />
                    <text
                      x={paddingX - 18}
                      y={y + 3}
                      fontSize="9"
                      fill="#777777"
                      fontFamily="JetBrains Mono"
                      textAnchor="end"
                    >
                      {val}%
                    </text>
                  </g>
                );
              })}

              {/* Shaded Area */}
              <path d={areaD} fill="url(#vivaGradient)" />

              {/* Main Line */}
              <path
                d={pathD}
                fill="none"
                stroke="#1040C0"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Data points */}
              {sessions.map((s, idx) => {
                const pt = points[idx];
                const isActive = activePoint?.id === s.id;
                return (
                  <g
                    key={s.id}
                    className="cursor-pointer group"
                    onClick={() => setActivePoint(s)}
                  >
                    {/* Outer hover ring */}
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={isActive ? "10" : "6"}
                      fill={isActive ? "#F0C020" : "#FFFFFF"}
                      stroke="#111111"
                      strokeWidth="3"
                      className="transition-all duration-200"
                    />
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={isActive ? "4" : "2"}
                      fill="#1040C0"
                    />

                    {/* Point Score badge */}
                    <rect
                      x={pt.x - 16}
                      y={pt.y - 25}
                      width="32"
                      height="16"
                      fill={isActive ? "#111111" : "#F0F0F0"}
                      stroke="#111111"
                      strokeWidth="1.5"
                    />
                    <text
                      x={pt.x}
                      y={pt.y - 14}
                      fontSize="9"
                      fontWeight="bold"
                      fill={isActive ? "#FFFFFF" : "#111111"}
                      fontFamily="JetBrains Mono"
                      textAnchor="middle"
                    >
                      {s.score}%
                    </text>

                    {/* X-axis Date label */}
                    <text
                      x={pt.x}
                      y={height - 8}
                      fontSize="10"
                      fontWeight="bold"
                      fill="#555555"
                      fontFamily="JetBrains Mono"
                      textAnchor="middle"
                    >
                      {s.date}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Selected Session Info Card */}
        <div className="bg-[#FFFEE5] border-2 border-[#111111] p-5 shadow-[4px_4px_0_#111111] flex flex-col justify-between h-full">
          <div>
            <div className="text-[10px] font-black uppercase text-[#555555] font-['JetBrains_Mono'] mb-1">
              SESSION DETAILS
            </div>
            <h4 className="text-base font-black uppercase text-[#111111] font-['Outfit']">
              {activePoint?.label}
            </h4>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-4xl font-black text-[#1040C0] font-['JetBrains_Mono']">
                {activePoint?.score}%
              </span>
              <span className="text-xs uppercase font-bold text-[#555555] font-['JetBrains_Mono']">
                Defense Score
              </span>
            </div>

            <div className="mt-4 space-y-2 border-t border-[#111111]/20 pt-3 text-xs font-['JetBrains_Mono']">
              <div className="flex justify-between">
                <span className="text-[#555555]">Questions:</span>
                <span className="font-bold text-[#111111]">{activePoint?.questions} Defended</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#555555]">Verdict:</span>
                <span className="font-bold text-[#D02020] uppercase">{activePoint?.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#555555]">Timestamp:</span>
                <span className="font-bold text-[#111111]">{activePoint?.date}</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t-2 border-[#111111] text-[10px] text-[#555555] font-['JetBrains_Mono']">
            Click any point on the chart to inspect viva drills.
          </div>
        </div>
      </div>
    </div>
  );
}
