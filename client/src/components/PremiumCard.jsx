import { motion } from "framer-motion";

export default function PremiumCard({
  children,
  className = "",
  hover = true,
  animate = true,
  delay = 0,
}) {
  return (
    <motion.div
      initial={animate ? { opacity: 0, y: 20 } : undefined}
      animate={animate ? { opacity: 1, y: 0 } : undefined}
      transition={{ delay, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      whileHover={
        hover
          ? {
              y: -4,
              boxShadow: "0 20px 60px rgba(34, 211, 238, 0.15)",
            }
          : undefined
      }
      className={`relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/[0.04] backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] transition-all ${className}`}
    >
      {/* Inner border glow */}
      <div className="absolute inset-0 rounded-[1.75rem] border border-white/5 pointer-events-none" />

      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-cyan-500/5 pointer-events-none" />

      {/* Animated light streak */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent opacity-0 group-hover:opacity-100"
        animate={
          hover
            ? {
                backgroundPosition: ["0%", "100%"],
              }
            : undefined
        }
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      {/* Content */}
      <div className="relative z-10">{children}</div>

      {/* Hover glow effect */}
      {hover && (
        <motion.div className="absolute -inset-1 rounded-[1.75rem] bg-gradient-to-r from-purple-500/20 to-cyan-500/20 blur-xl opacity-0 -z-10 group-hover:opacity-50 transition-opacity duration-300" />
      )}
    </motion.div>
  );
}
