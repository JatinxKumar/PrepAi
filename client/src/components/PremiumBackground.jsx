import { motion } from "framer-motion";

export default function PremiumBackground() {
  return (
    <div className="fixed inset-0 -z-50 overflow-hidden">
      {/* Base dark background */}
      <div className="absolute inset-0 bg-[#050816]" />

      {/* Animated radial gradients */}
      <motion.div
        className="absolute -inset-1/2 bg-gradient-to-br from-purple-600/30 via-transparent to-cyan-600/20 blur-3xl"
        animate={{
          rotate: 360,
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      <motion.div
        className="absolute -top-1/2 -right-1/4 w-1/2 h-1/2 bg-gradient-radial from-cyan-500/20 to-transparent blur-3xl"
        animate={{
          y: [0, 50, 0],
          x: [0, -30, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="absolute -bottom-1/2 -left-1/4 w-1/2 h-1/2 bg-gradient-radial from-purple-500/15 to-transparent blur-3xl"
        animate={{
          y: [0, -50, 0],
          x: [0, 30, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
      />

      {/* Noise texture */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage:
            "url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22><filter id=%22n%22><feTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%224%22 result=%22noise%22 /></filter><rect width=%22100%22 height=%22100%22 fill=%22white%22 filter=%22url(%23n)%22/></svg>')",
          backgroundSize: "100px 100px",
        }}
      />

      {/* Subtle mesh gradient overlay */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          background: `
            linear-gradient(45deg, rgba(34, 211, 238, 0.1) 25%, transparent 25%),
            linear-gradient(-45deg, rgba(34, 211, 238, 0.1) 25%, transparent 25%),
            linear-gradient(45deg, transparent 75%, rgba(34, 211, 238, 0.05) 75%),
            linear-gradient(-45deg, transparent 75%, rgba(34, 211, 238, 0.05) 75%)
          `,
          backgroundSize: "80px 80px",
          backgroundPosition: "0 0, 0 40px, 40px -40px, -40px 0",
        }}
      />

      {/* Vignette effect */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(5,8,22,0.7)_100%)]" />

      {/* Floating particles */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-cyan-400/40"
          initial={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
          }}
          animate={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            scale: [1, 1.5, 1],
            opacity: [0.2, 0.8, 0.2],
          }}
          transition={{
            duration: 15 + Math.random() * 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Additional glow layer */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-b from-purple-500/5 via-transparent to-cyan-500/5"
        animate={{
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  );
}
