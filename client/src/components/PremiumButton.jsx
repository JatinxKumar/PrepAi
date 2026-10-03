import { motion } from "framer-motion";
import { ArrowRight, Loader2 } from "lucide-react";

export default function PremiumButton({
  children,
  onClick,
  isLoading,
  disabled,
  variant = "primary",
  icon: Icon,
  size = "md",
  className = "",
}) {
  const baseClasses =
    "relative inline-flex items-center justify-center gap-2.5 font-bold transition-all rounded-full overflow-hidden group";

  const sizeClasses = {
    sm: "px-5 py-2.5 text-xs",
    md: "px-7 py-3.5 text-sm",
    lg: "px-9 py-4 text-base",
  };

  const variantClasses = {
    primary: `bg-gradient-to-r from-purple-500/90 to-cyan-500/90 backdrop-blur-xl border border-white/20 text-white shadow-[0_0_30px_rgba(168,85,247,0.25),0_0_60px_rgba(34,211,238,0.15)]`,
    secondary: `bg-white/5 backdrop-blur-xl border border-white/10 text-white hover:border-white/20 shadow-[0_0_20px_rgba(255,255,255,0.05)]`,
    ghost: `border border-white/10 text-white hover:bg-white/5 transition-all`,
  };

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled || isLoading}
      whileHover={{
        scale: disabled ? 1 : 1.02,
        y: disabled ? 0 : -1,
      }}
      whileTap={{
        scale: disabled ? 1 : 0.98,
        y: disabled ? 0 : 2,
      }}
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${
        disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
      } ${className}`}
    >
      {/* Shine effect */}
      {variant === "primary" && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          animate={{
            x: ["100%", "-100%"],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            repeatDelay: 1,
          }}
          style={{
            pointerEvents: "none",
          }}
        />
      )}

      {/* Glow effect */}
      {variant === "primary" && (
        <motion.div
          className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500/0 via-cyan-500/0 to-purple-500/0 blur-xl"
          animate={{
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{
            pointerEvents: "none",
          }}
        />
      )}

      {/* Inner gradient overlay */}
      <div className="absolute inset-0.5 rounded-full bg-gradient-to-b from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      {/* Content */}
      <motion.div
        className="relative z-10 flex items-center justify-center gap-2"
        animate={{
          opacity: isLoading ? 0.6 : 1,
        }}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : Icon ? (
          <Icon className="w-4 h-4 transition-transform group-hover:scale-110" />
        ) : null}

        <span>{children}</span>

        {!isLoading && variant === "primary" && (
          <motion.div
            animate={{
              x: [0, 3, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <ArrowRight className="w-4 h-4" />
          </motion.div>
        )}
      </motion.div>
    </motion.button>
  );
}
