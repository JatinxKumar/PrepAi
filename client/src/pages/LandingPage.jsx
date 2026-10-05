import { motion } from "framer-motion";
import {
  ArrowRight,
  BrainCircuit,
  Download,
  FileText,
  MessageSquare,
  Search,
  Sparkles,
  Upload,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import BlurText from "../components/BlurText";
import CursorGlow from "../components/CursorGlow";
import DotField from "../components/DotField";
import GradientText from "../components/GradientText";
import SideRays from "../components/SideRays";
import VariableProximity from "../components/VariableProximity";
import CurtainFooter from "../components/CurtainFooter";
import useAuthStore from "../store/authStore";

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.08,
    },
  },
};

const fadeInUp = {
  hidden: { opacity: 0, y: 35 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const agentListContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

const steps = [
  {
    title: "Upload Repo",
    copy: "Drop in your GitHub URL and we ingest the actual project structure.",
    icon: Upload,
  },
  {
    title: "AI Analysis",
    copy: "The system reads files, dependencies, flows, and code signals before writing.",
    icon: Search,
  },
  {
    title: "Placement Ready",
    copy: "You get story, architecture, viva prep, bullets, and mock interview support.",
    icon: Download,
  },
];

const features = [
  {
    title: "Project Story Generator",
    copy: "Turns implementation into a sharp explanation you can actually say in an interview.",
    icon: Sparkles,
  },
  {
    title: "Viva Prep AI",
    copy: "Builds defendable follow-up questions from your real repo, not generic templates.",
    icon: BrainCircuit,
  },
  {
    title: "Resume Builder",
    copy: "Pulls out scope, ownership, and outcomes into recruiter-ready bullets.",
    icon: FileText,
  },
  {
    title: "Mock Interview",
    copy: "Simulates pressure and follow-ups so weak explanations show up early.",
    icon: MessageSquare,
  },
];

const agentFlow = [
  "Code Analyzer",
  "Explanation",
  "Architecture",
  "Resume",
  "Interview",
];

export default function LandingPage() {
  const { token } = useAuthStore();
  const pageRef = useRef(null);
  const heroRef = useRef(null);
  const [typedIndex, setTypedIndex] = useState(0);

  const snapRef = useRef(null);



  useEffect(() => {
    const intervalId = setInterval(() => {
      setTypedIndex((value) => (value + 1) % 3);
    }, 2200);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div
      ref={pageRef}
      className="bg-[#050816] text-white overflow-x-hidden relative landing-page-container font-sans"
    >
      <CursorGlow />

      {/* Sticky Curtain Reveal Footer (Sits at the bottom behind main content) */}
      <CurtainFooter />

      <nav className="fixed inset-x-0 top-0 z-40 border-b border-white/8 bg-[#040816]/70 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto h-20 px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/5 border border-cyan-400/20 flex items-center justify-center shadow-[0_0_30px_rgba(76,201,240,0.15)]">
              <BrainCircuit className="w-6 h-6 text-cyan-300" />
            </div>
            <div>
              <p className="font-heading text-xl font-bold tracking-tight bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-transparent">
                PrepAI
              </p>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-8 text-sm text-slate-300">
            <a
              href="#how-it-works"
              className="hover:text-white transition-colors"
            >
              How it works
            </a>
            <a href="#features" className="hover:text-white transition-colors">
              Features
            </a>
            <a href="#agents" className="hover:text-white transition-colors">
              Agents
            </a>
          </div>

          <Link
            to={token ? "/dashboard" : "/auth"}
            className="px-5 py-2.5 rounded-full border border-cyan-400/20 bg-white/5 text-sm font-semibold text-white hover:border-cyan-300/40 hover:bg-white/10 transition-all"
          >
            {token ? "Open Dashboard" : "Log In"}
          </Link>
        </div>
      </nav>

      {/* Scroll Snap Container — only on landing page */}
      <main
        ref={snapRef}
        style={{
          height: "100vh",
          overflowY: "scroll",
          scrollSnapType: "y mandatory",
          scrollBehavior: "smooth",
        }}
      >
        {/* Main Content Sliding Curtain (covers footer until scrolled past Final Call) */}
        <div className="relative z-10 bg-[#050816] shadow-[0_50px_100px_rgba(0,0,0,0.95)]">
        <section
          style={{ scrollSnapAlign: "start", scrollSnapStop: "always", minHeight: "100vh" }}
          className="relative flex flex-col items-center justify-center px-6 pt-28 pb-20 overflow-hidden"
          ref={heroRef}
        >
          {/* DotField — deepest background layer */}
          <div className="absolute inset-0 z-0">
            <DotField
              dotRadius={2}
              dotSpacing={14}
              bulgeStrength={80}
              glowRadius={180}
              sparkle={false}
              waveAmplitude={0}
              gradientFrom="rgba(139, 92, 246, 0.75)"
              gradientTo="rgba(34, 211, 238, 0.65)"
              glowColor="#0a0a12"
            />
          </div>

          {/* SideRays — on top of dots */}
          <SideRays
            speed={2.0}
            rayColor1="#a855f7"
            rayColor2="#22d3ee"
            intensity={1.5}
            spread={1.8}
            origin="top-right"
            tilt={-10}
            saturation={1.5}
            blend={0.6}
            falloff={1.5}
            opacity={0.8}
          />

          <div className="relative z-10 text-center max-w-3xl mx-auto flex flex-col items-center">
            {/* Line 1 — GradientText: fade-in-up animation */}
            <motion.div
              initial={{ opacity: 0, y: 40, filter: "blur(12px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{
                duration: 0.85,
                delay: 0.1,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <GradientText
                colors={[
                  "#22d3ee",
                  "#60a5fa",
                  "#a78bfa",
                  "#f472b6",
                  "#34d399",
                  "#22d3ee",
                ]}
                animationSpeed={18}
                direction="horizontal"
                yoyo={true}
                className="hero-gradient-text text-6xl sm:text-7xl xl:text-[6rem] font-bold leading-[1.05] tracking-[-0.04em]"
              >
                Prepare Smarter
              </GradientText>
            </motion.div>

            {/* Line 2 — BlurText: fade-in-up animation */}
            <motion.div
              initial={{ opacity: 0, y: 40, filter: "blur(12px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{
                duration: 0.85,
                delay: 0.25,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="w-full"
            >
              <BlurText
                text="Get Hired Faster."
                delay={90}
                animateBy="words"
                direction="bottom"
                stepDuration={0.55}
                className="text-6xl sm:text-7xl xl:text-[6rem] font-bold leading-[1.05] tracking-[-0.04em] bg-gradient-to-r from-cyan-300 via-violet-400 to-purple-300 bg-clip-text text-transparent justify-center"
              />
            </motion.div>

            {/* Subtitle — VariableProximity: fade-in-up */}
            <motion.div
              initial={{ opacity: 0, y: 35 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.45,
                duration: 0.8,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="mt-8 max-w-xl mx-auto"
            >
              <VariableProximity
                label="Connect your GitHub repo. PrepAI reads your code and builds your placement kit — stories, viva prep, resume bullets, mock interview."
                fromFontVariationSettings="'wght' 300, 'opsz' 9"
                toFontVariationSettings="'wght' 700, 'opsz' 40"
                containerRef={heroRef}
                radius={120}
                falloff="gaussian"
                className="text-base text-slate-400 leading-relaxed font-sans"
              />
            </motion.div>

            {/* CTA Buttons: fade-in-up */}
            <motion.div
              initial={{ opacity: 0, y: 35 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.65,
                duration: 0.8,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <MagneticButton
                to={token ? "/dashboard" : "/auth"}
                label="Start for Free"
              />
              <a
                href="#how-it-works"
                className="px-6 py-3.5 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 transition-all text-sm font-medium text-slate-300"
              >
                See how it works
              </a>
            </motion.div>
          </div>
        </section>

        <section id="how-it-works" style={{ scrollSnapAlign: "start", scrollSnapStop: "always", minHeight: "100vh", display: "flex", alignItems: "center" }} className="relative px-6">
          <div className="max-w-6xl mx-auto w-full">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.25 }}
              variants={staggerContainer}
              className="text-center max-w-2xl mx-auto"
            >
              <motion.p variants={fadeInUp} className="text-cyan-200/80 text-sm uppercase tracking-[0.28em]">
                How it works
              </motion.p>
              <motion.h2 variants={fadeInUp} className="mt-4 text-4xl md:text-5xl font-semibold tracking-[-0.03em] leading-tight">
                A smooth handoff from GitHub repo to interview prep.
              </motion.h2>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={staggerContainer}
              className="mt-16 grid md:grid-cols-3 gap-6"
            >
              {steps.map((step, index) => (
                <motion.div
                  key={step.title}
                  variants={fadeInUp}
                  className="rounded-[28px] border border-white/10 bg-white/[0.04] px-7 py-8 backdrop-blur-2xl shadow-[0_18px_60px_rgba(9,14,29,0.38)]"
                  whileHover={{
                    y: -8,
                    rotateX: 4,
                    rotateY: index === 1 ? 0 : index === 0 ? -4 : 4,
                  }}
                  transition={{ type: "spring", stiffness: 180, damping: 18 }}
                >
                  <div className="w-14 h-14 rounded-2xl bg-[linear-gradient(135deg,rgba(69,205,255,0.26),rgba(118,92,255,0.26))] border border-white/10 flex items-center justify-center mb-6">
                    <step.icon className="w-6 h-6 text-cyan-100" />
                  </div>
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500 mb-3">
                    Step 0{index + 1}
                  </p>
                  <h3 className="text-2xl font-semibold mb-3">{step.title}</h3>
                  <p className="text-slate-400 leading-relaxed">{step.copy}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        <section id="features" style={{ scrollSnapAlign: "start", scrollSnapStop: "always", minHeight: "100vh", display: "flex", alignItems: "center" }} className="relative px-6">
          <div className="max-w-7xl mx-auto w-full">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.25 }}
              variants={staggerContainer}
              className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6"
            >
              <div className="max-w-2xl">
                <motion.p variants={fadeInUp} className="text-cyan-200/80 text-sm uppercase tracking-[0.28em]">
                  Features
                </motion.p>
                <motion.h2 variants={fadeInUp} className="mt-4 text-4xl md:text-5xl font-semibold tracking-[-0.03em] leading-tight">
                  Everything feels like a thinking system, not a text dump.
                </motion.h2>
              </div>
              <motion.p variants={fadeInUp} className="text-slate-400 max-w-xl">
                Every card is designed to make the product feel fast,
                intelligent, and premium under your cursor.
              </motion.p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={staggerContainer}
              className="mt-14 grid md:grid-cols-2 xl:grid-cols-4 gap-6"
            >
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  variants={fadeInUp}
                  className="rounded-[28px] border border-white/10 bg-white/[0.04] p-7 backdrop-blur-2xl relative overflow-hidden"
                  whileHover={{
                    y: -10,
                    rotateX: 6,
                    rotateY: index % 2 === 0 ? -5 : 5,
                  }}
                  transition={{ type: "spring", stiffness: 170, damping: 18 }}
                >
                  <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity bg-[radial-gradient(circle_at_top_right,rgba(91,231,255,0.18),transparent_42%),radial-gradient(circle_at_bottom_left,rgba(123,97,255,0.22),transparent_38%)]" />
                  <div className="relative">
                    <div className="w-14 h-14 rounded-2xl border border-white/10 bg-slate-900/70 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(91,231,255,0.12)]">
                      <feature.icon className="w-6 h-6 text-cyan-200" />
                    </div>
                    <h3 className="text-2xl font-semibold mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-slate-400 leading-relaxed">
                      {feature.copy}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        <section id="agents" style={{ scrollSnapAlign: "start", scrollSnapStop: "always", minHeight: "100vh", display: "flex", alignItems: "center" }} className="relative px-6">
          <div className="max-w-6xl mx-auto w-full grid lg:grid-cols-[0.92fr_1.08fr] gap-10 items-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.25 }}
              variants={staggerContainer}
            >
              <motion.p variants={fadeInUp} className="text-cyan-200/80 text-sm uppercase tracking-[0.28em]">
                AI agent graph
              </motion.p>
              <motion.h2 variants={fadeInUp} className="mt-4 text-4xl md:text-5xl font-semibold tracking-[-0.03em] leading-tight">
                A visible chain of reasoning from code to interview confidence.
              </motion.h2>
              <motion.p variants={fadeInUp} className="mt-6 text-slate-400 max-w-xl leading-relaxed">
                The system does not stop at a summary. It reads, reasons,
                converts, scores, and prepares the candidate across multiple
                linked layers.
              </motion.p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.25 }}
              variants={fadeInUp}
              className="rounded-[34px] border border-white/10 bg-white/[0.04] p-7 md:p-10 backdrop-blur-2xl"
            >
              <motion.div
                variants={agentListContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                className="grid sm:grid-cols-5 gap-4 items-center"
              >
                {agentFlow.map((agent, index) => (
                  <React.Fragment key={agent}>
                    <motion.div
                      variants={fadeInUp}
                      className="rounded-3xl border border-cyan-400/16 bg-slate-950/55 px-4 py-5 min-h-[118px] flex flex-col justify-between shadow-[0_0_40px_rgba(43,125,255,0.09)]"
                    >
                      <div className="w-10 h-10 rounded-2xl bg-white/6 border border-white/10 flex items-center justify-center">
                        <span className="text-cyan-200 text-sm font-semibold">
                          {index + 1}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-slate-100">
                        {agent}
                      </p>
                    </motion.div>
                    {index < agentFlow.length - 1 && (
                      <div className="hidden sm:flex items-center justify-center">
                        <motion.div
                          className="h-[2px] w-full bg-gradient-to-r from-cyan-400/40 via-violet-400 to-cyan-400/40"
                          animate={{ backgroundPositionX: ["0%", "100%"] }}
                          transition={{
                            repeat: Infinity,
                            duration: 2.4,
                            ease: "linear",
                          }}
                          style={{ backgroundSize: "200% 100%" }}
                        />
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </section>


        <section style={{ scrollSnapAlign: "start", scrollSnapStop: "always", minHeight: "100vh", display: "flex", alignItems: "center" }} className="relative px-6">
          <div className="max-w-5xl mx-auto w-full">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.25 }}
              variants={staggerContainer}
              className="rounded-[36px] border border-cyan-400/18 bg-[linear-gradient(135deg,rgba(9,19,41,0.9),rgba(8,8,19,0.86))] px-8 py-14 md:px-14 flex flex-col items-center text-center shadow-[0_0_90px_rgba(43,125,255,0.16)]"
            >
              <motion.p variants={fadeInUp} className="text-cyan-200/80 text-sm uppercase tracking-[0.28em]">
                Final call
              </motion.p>
              <motion.h2 variants={fadeInUp} className="mt-4 text-4xl md:text-6xl font-semibold tracking-[-0.04em] leading-tight">
                Ready to crack your placement?
              </motion.h2>
              <motion.p variants={fadeInUp} className="mt-6 max-w-2xl mx-auto text-lg text-slate-300 leading-relaxed text-center">
                Let the system read your project like an engineer, then turn it
                into a sharper story, cleaner proof, and stronger interview
                performance.
              </motion.p>
              <motion.div variants={fadeInUp} className="mt-10 flex justify-center">
                <MagneticButton
                  to={token ? "/dashboard" : "/auth"}
                  label="Start Free Analysis"
                />
              </motion.div>
            </motion.div>
          </div>
        </section>
        </div>

        {/* Curtain Reveal Spacer: Scrolling past Final Call lifts the main content curtain to reveal CurtainFooter */}
        <div
          style={{
            scrollSnapAlign: "start",
            scrollSnapStop: "always",
            minHeight: "520px",
          }}
          className="relative pointer-events-none"
          aria-hidden="true"
        />
      </main>
    </div>
  );
}

function MagneticButton({ to, label }) {
  const buttonRef = useRef(null);

  const handleMove = (event) => {
    const button = buttonRef.current;
    if (!button) return;
    const rect = button.getBoundingClientRect();
    const x = event.clientX - rect.left - rect.width / 2;
    const y = event.clientY - rect.top - rect.height / 2;
    button.style.transform = `translate(${x * 0.14}px, ${y * 0.14}px)`;
  };

  const reset = () => {
    const button = buttonRef.current;
    if (button) button.style.transform = "translate(0px, 0px)";
  };

  return (
    <motion.div
      ref={buttonRef}
      onMouseMove={handleMove}
      onMouseLeave={reset}
      whileHover={{ scale: 1.05, y: -2 }}
      transition={{ type: "spring", stiffness: 400, damping: 15 }}
      className="will-change-transform"
    >
      <Link
        to={to}
        className="group inline-flex items-center gap-3 px-7 py-4 rounded-full text-base font-semibold text-white bg-[linear-gradient(135deg,#6A5ACD,#8A2BE2)] shadow-[0_0_60px_rgba(138,43,226,0.4)] hover:shadow-[0_0_90px_rgba(138,43,226,0.6)] transition-all duration-300 border border-white/10"
      >
        {label}
        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
      </Link>
    </motion.div>
  );
}


