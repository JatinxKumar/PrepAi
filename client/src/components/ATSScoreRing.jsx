import { motion } from "framer-motion";

export default function ATSScoreRing({ score = 78, size = "lg" }) {
  const sizeClasses = {
    sm: "w-32 h-32",
    md: "w-48 h-48",
    lg: "w-64 h-64",
    xl: "w-80 h-80",
  };

  const radiusMap = {
    sm: 48,
    md: 72,
    lg: 96,
    xl: 120,
  };

  const radius = radiusMap[size];
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const getScoreColor = (s) => {
    if (s >= 85) return "from-emerald-400 via-cyan-300 to-blue-400";
    if (s >= 70) return "from-cyan-400 via-purple-400 to-pink-400";
    return "from-amber-300 via-orange-400 to-pink-400";
  };

  const getScoreTone = (s) => {
    if (s >= 85) return "text-emerald-300";
    if (s >= 70) return "text-cyan-300";
    return "text-amber-300";
  };

  return (
    <div
      className={`relative inline-flex items-center justify-center ${sizeClasses[size]}`}
    >
      {/* Outer glow */}
      <motion.div
        className={`absolute inset-0 rounded-full bg-gradient-to-r ${getScoreColor(score)} blur-2xl opacity-40`}
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Rotating gradient ring */}
      <svg
        className="absolute inset-0 w-full h-full"
        style={{ transform: "rotate(-90deg)" }}
      >
        {/* Background circle */}
        <circle
          cx="50%"
          cy="50%"
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="8"
        />

        {/* Animated progress ring */}
        <motion.circle
          cx="50%"
          cy="50%"
          r={radius}
          fill="none"
          strokeWidth="8"
          strokeLinecap="round"
          stroke="url(#scoreGradient)"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{
            duration: 2.4,
            ease: "easeOut",
          }}
          style={{
            filter: `drop-shadow(0 0 20px ${score >= 85 ? "#34d399" : score >= 70 ? "#22d3ee" : "#fcd34d"})`,
          }}
        />

        {/* Gradient definition */}
        <defs>
          <linearGradient
            id="scoreGradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            {score >= 85 ? (
              <>
                <stop offset="0%" stopColor="#4ade80" />
                <stop offset="50%" stopColor="#22d3ee" />
                <stop offset="100%" stopColor="#60a5fa" />
              </>
            ) : score >= 70 ? (
              <>
                <stop offset="0%" stopColor="#22d3ee" />
                <stop offset="50%" stopColor="#a78bfa" />
                <stop offset="100%" stopColor="#ec4899" />
              </>
            ) : (
              <>
                <stop offset="0%" stopColor="#fcd34d" />
                <stop offset="50%" stopColor="#fb923c" />
                <stop offset="100%" stopColor="#f472b6" />
              </>
            )}
          </linearGradient>

          {/* Rotating highlight */}
          <linearGradient
            id="highlightGradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="rgba(255,255,255,0)" />
            <stop offset="50%" stopColor="rgba(255,255,255,0.8)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </linearGradient>
        </defs>

        {/* Rotating highlight */}
        <motion.circle
          cx="50%"
          cy="50%"
          r={radius}
          fill="none"
          strokeWidth="6"
          stroke="url(#highlightGradient)"
          strokeDasharray="30 200"
          animate={{ strokeDashoffset: [-200, 200] }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "linear",
          }}
          style={{
            opacity: 0.6,
            filter: "blur(1px)",
          }}
        />
      </svg>

      {/* Inner glass container */}
      <div className="relative z-10 flex flex-col items-center justify-center">
        {/* Animated background */}
        <motion.div
          className="absolute inset-0 rounded-full bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-2xl"
          animate={{
            opacity: [0.5, 0.7, 0.5],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Content */}
        <div className="relative z-20 text-center">
          <motion.p
            className="text-xs uppercase tracking-[0.2em] text-gray-400 font-bold"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            ATS Score
          </motion.p>

          {/* Counter number */}
          <motion.p
            className={`text-6xl font-black mt-2 ${getScoreTone(score)} tabular-nums`}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              delay: 0.3,
              duration: 0.8,
              type: "spring",
              stiffness: 100,
            }}
          >
            {score}
          </motion.p>

          <motion.p
            className="text-xs text-gray-500 mt-1 font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            out of 100
          </motion.p>

          {/* Pulse indicator */}
          <motion.div
            className={`mt-3 h-1.5 w-1.5 rounded-full bg-gradient-to-r ${getScoreColor(score)}`}
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.6, 1, 0.6],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </div>
      </div>

      {/* Floating particles */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          className={`absolute w-1 h-1 rounded-full ${i % 2 === 0 ? "bg-cyan-400" : "bg-purple-400"}`}
          animate={{
            x: Math.cos((i / 3) * Math.PI * 2) * 140,
            y: Math.sin((i / 3) * Math.PI * 2) * 140,
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.8, 0.3],
          }}
          transition={{
            duration: 4 + i,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
