import { motion } from "framer-motion";
import { TrendingUp, ArrowRight } from "lucide-react";
import PremiumCard from "./PremiumCard";

export default function BeforeAfterComparison({ resume }) {
  const originalScore = resume?.atsScore?.overall || 0;
  const optimizedScore = resume?.optimized?.atsScore?.overall || originalScore;
  const improvement = optimizedScore - originalScore;
  const percentageGain = originalScore > 0 ? ((improvement / originalScore) * 100).toFixed(1) : 0;

  const improvements = [
    { label: "Keywords Added", value: "+12", color: "cyan" },
    { label: "Grammar Fixes", value: "+8", color: "purple" },
    { label: "Format Issues", value: "+5", color: "emerald" },
  ];

  return (
    <PremiumCard delay={0.3}>
      <div className="p-8">
        <motion.h3
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-2xl font-bold text-white mb-8 flex items-center gap-2"
        >
          <TrendingUp className="w-6 h-6 text-emerald-400" />
          Before vs After
        </motion.h3>

        {/* Comparison chart */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Before */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.35 }}
            className="rounded-2xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-600/30 p-6"
          >
            <div className="text-sm text-gray-400 font-semibold uppercase tracking-wide mb-4">
              Current Version
            </div>
            <div className="flex flex-col items-center justify-center py-8">
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <div className="relative w-32 h-32 rounded-full flex items-center justify-center">
                  {/* Background circle */}
                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 120 120">
                    <circle
                      cx="60"
                      cy="60"
                      r="55"
                      fill="none"
                      stroke="rgba(107, 114, 128, 0.2)"
                      strokeWidth="8"
                    />
                    <motion.circle
                      cx="60"
                      cy="60"
                      r="55"
                      fill="none"
                      stroke="url(#gradBefore)"
                      strokeWidth="8"
                      strokeDasharray={originalScore * 3.46}
                      strokeDashoffset={0}
                      strokeLinecap="round"
                      initial={{ strokeDashoffset: 345.6 }}
                      animate={{ strokeDashoffset: 345.6 - originalScore * 3.46 }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                    />
                    <defs>
                      <linearGradient
                        id="gradBefore"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="100%"
                      >
                        <stop offset="0%" stopColor="rgba(249, 115, 22, 1)" />
                        <stop offset="100%" stopColor="rgba(234, 88, 12, 1)" />
                      </linearGradient>
                    </defs>
                  </svg>

                  {/* Center text */}
                  <div className="text-center">
                    <div className="text-4xl font-black text-amber-400">
                      {originalScore}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">/100</div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Arrow */}
          <div className="flex items-center justify-center">
            <motion.div
              animate={{ x: [0, 10, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <ArrowRight className="w-8 h-8 text-cyan-400 hidden md:block" />
            </motion.div>
          </div>

          {/* After */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.35 }}
            className="rounded-2xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-400/30 p-6 relative overflow-hidden"
          >
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/10 to-cyan-600/10 opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="text-sm text-emerald-300 font-semibold uppercase tracking-wide mb-4">
              Optimized Version
            </div>
            <div className="flex flex-col items-center justify-center py-8">
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.2 }}
              >
                <div className="relative w-32 h-32 rounded-full flex items-center justify-center">
                  {/* Background circle */}
                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 120 120">
                    <circle
                      cx="60"
                      cy="60"
                      r="55"
                      fill="none"
                      stroke="rgba(16, 185, 129, 0.2)"
                      strokeWidth="8"
                    />
                    <motion.circle
                      cx="60"
                      cy="60"
                      r="55"
                      fill="none"
                      stroke="url(#gradAfter)"
                      strokeWidth="8"
                      strokeDasharray={optimizedScore * 3.46}
                      strokeDashoffset={0}
                      strokeLinecap="round"
                      initial={{ strokeDashoffset: 345.6 }}
                      animate={{ strokeDashoffset: 345.6 - optimizedScore * 3.46 }}
                      transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
                    />
                    <defs>
                      <linearGradient
                        id="gradAfter"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="100%"
                      >
                        <stop offset="0%" stopColor="rgba(16, 185, 129, 1)" />
                        <stop offset="100%" stopColor="rgba(34, 197, 94, 1)" />
                      </linearGradient>
                    </defs>
                  </svg>

                  {/* Center text */}
                  <div className="text-center">
                    <div className="text-4xl font-black text-emerald-400">
                      {optimizedScore}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">/100</div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Improvement stats */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="rounded-2xl bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-400/20 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-bold text-white uppercase tracking-wide">
              Improvement Breakdown
            </h4>
            <div className="text-right">
              <div className="text-2xl font-black text-emerald-400">
                +{improvement}
              </div>
              <div className="text-xs text-gray-400">
                ({percentageGain}% better)
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {improvements.map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.05 }}
                className={`rounded-lg bg-${item.color}-500/10 border border-${item.color}-400/20 p-3 text-center`}
              >
                <div className={`text-lg font-bold text-${item.color}-400`}>
                  {item.value}
                </div>
                <div className="text-xs text-gray-400 mt-1">{item.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </PremiumCard>
  );
}
