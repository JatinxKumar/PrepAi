import { motion } from "framer-motion";

export default function PremiumProgressBar({
  value,
  max = 100,
  label,
  color = "cyan",
}) {
  const percentage = Math.min((value / max) * 100, 100);

  const colorMap = {
    cyan: "from-cyan-400 to-blue-500",
    purple: "from-purple-400 to-pink-500",
    emerald: "from-emerald-400 to-cyan-400",
    amber: "from-amber-400 to-orange-500",
    blue: "from-blue-400 to-purple-500",
  };

  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-semibold text-gray-300">{label}</span>
          <span className="text-xs font-bold text-gray-400">
            {value}/{max}
          </span>
        </div>
      )}

      <div className="relative h-3 rounded-full bg-white/5 border border-white/10 overflow-hidden backdrop-blur-sm">
        {/* Background shine */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-50" />

        {/* Progress bar */}
        <motion.div
          className={`h-full rounded-full bg-gradient-to-r ${colorMap[color]} shadow-[0_0_20px_rgba(34,211,238,0.4)]`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        >
          {/* Animated shine inside bar */}
          <motion.div
            className="h-full w-full bg-gradient-to-r from-transparent via-white/30 to-transparent"
            animate={{
              x: ["-100%", "100%"],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        </motion.div>

        {/* Glow effect */}
        <motion.div
          className={`absolute top-0 right-0 h-full w-12 bg-gradient-to-l ${colorMap[color]} blur-lg opacity-50`}
          animate={{
            boxShadow: [
              `inset 0 0 20px rgba(34, 211, 238, 0.3)`,
              `inset 0 0 40px rgba(34, 211, 238, 0.6)`,
              `inset 0 0 20px rgba(34, 211, 238, 0.3)`,
            ],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>
    </div>
  );
}
