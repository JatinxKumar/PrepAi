import { motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
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
import useAuthStore from "../store/authStore";

gsap.registerPlugin(ScrollTrigger);

const revealUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] },
  }),
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

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray(".landing-reveal").forEach((section) => {
        gsap.fromTo(
          section,
          { opacity: 0, y: 48 },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: section,
              start: "top 82%",
              toggleActions: "play none none none",
            },
          },
        );
      });
    }, pageRef);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setTypedIndex((value) => (value + 1) % 3);
    }, 2200);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div
      ref={pageRef}
      className="min-h-screen bg-[#050816] text-white overflow-x-hidden relative landing-page-container"
    >
      <CursorGlow />

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

      <main>
        {/* Hero Section */}
        <section
          className="relative min-h-[92vh] flex items-center justify-between px-6 sm:px-12 lg:px-16 pt-24 pb-12 overflow-hidden bg-[#050816]"
          ref={heroRef}
        >
          {/* Subtle Ambient Background Gradients */}
          <div className="absolute top-1/4 left-10 w-96 h-96 bg-purple-600/15 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-10 right-1/4 w-[500px] h-[500px] bg-cyan-500/15 rounded-full blur-[140px] pointer-events-none" />

          <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-10">
            {/* Left Side: Content */}
            <div className="w-full lg:max-w-[580px] text-left flex flex-col items-start z-10">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-purple-500/30 bg-purple-500/10 backdrop-blur-md mb-6">
                <Sparkles className="w-4 h-4 text-cyan-300 animate-pulse" />
                <span className="text-xs uppercase tracking-widest font-semibold bg-gradient-to-r from-cyan-300 to-purple-300 bg-clip-text text-transparent">
                  AI Placement Copilot
                </span>
              </div>

              {/* Main Heading */}
              <h1 className="font-heading text-4xl sm:text-5xl xl:text-6xl font-extrabold tracking-tight leading-[1.12] text-white">
                Turn Your Code Into{" "}
                <span className="bg-gradient-to-r from-cyan-300 via-purple-400 to-fuchsia-400 bg-clip-text text-transparent">
                  Placement Power
                </span>
              </h1>

              {/* Subtitle */}
              <p className="mt-6 text-base sm:text-lg text-slate-300 leading-relaxed max-w-xl">
                Connect your GitHub repo. PrepAI analyzes your code, architecture, and tech stack to generate placement-ready stories, viva prep, ATS resume bullets, and mock interviews.
              </p>

              {/* Action CTA Buttons */}
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link
                  to={token ? "/dashboard" : "/auth"}
                  className="group inline-flex items-center gap-3 px-8 py-4 rounded-xl text-base font-bold text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 shadow-[0_0_40px_rgba(168,85,247,0.4)] hover:shadow-[0_0_60px_rgba(168,85,247,0.7)] hover:scale-105 transition-all duration-300"
                >
                  Start for Free
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
                </Link>

                <a
                  href="#how-it-works"
                  className="px-6 py-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all text-sm font-semibold text-slate-300 hover:text-white backdrop-blur-md"
                >
                  See how it works
                </a>
              </div>

              {/* Mini Features Checklist */}
              <div className="mt-10 grid grid-cols-2 gap-4 text-xs sm:text-sm text-slate-400 font-medium">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400" />
                  <span>GitHub Repository Ingestion</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-purple-400" />
                  <span>7 Specialized AI Agents</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>Real-time Viva Simulator</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-pink-400" />
                  <span>ATS Resume Optimizer</span>
                </div>
              </div>
            </div>

            {/* Right Side: Interactive 3D Spline Model */}
            <div className="w-full lg:flex-1 h-[480px] sm:h-[550px] lg:h-[620px] relative flex items-center justify-center">
              <spline-viewer
                url="https://prod.spline.design/I2tSq-VJu2V8nZQO/scene.splinecode"
                style={{ width: "100%", height: "100%", display: "block" }}
              ></spline-viewer>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="relative py-28 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="landing-reveal text-center max-w-2xl mx-auto">
              <p className="text-cyan-200/80 text-sm uppercase tracking-[0.28em]">
                How it works
              </p>
              <h2 className="mt-4 text-4xl md:text-5xl font-semibold tracking-[-0.03em] leading-tight">
                A smooth handoff from GitHub repo to interview prep.
              </h2>
            </div>

            <div className="mt-16 grid md:grid-cols-3 gap-6">
              {steps.map((step, index) => (
                <motion.div
                  key={step.title}
                  className="landing-reveal rounded-[28px] border border-white/10 bg-white/[0.04] px-7 py-8 backdrop-blur-2xl shadow-[0_18px_60px_rgba(9,14,29,0.38)]"
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
            </div>
          </div>
        </section>

        <section id="features" className="relative py-28 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="landing-reveal flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
              <div className="max-w-2xl">
                <p className="text-cyan-200/80 text-sm uppercase tracking-[0.28em]">
                  Features
                </p>
                <h2 className="mt-4 text-4xl md:text-5xl font-semibold tracking-[-0.03em] leading-tight">
                  Everything feels like a thinking system, not a text dump.
                </h2>
              </div>
              <p className="text-slate-400 max-w-xl">
                Every card is designed to make the product feel fast,
                intelligent, and premium under your cursor.
              </p>
            </div>

            <div className="mt-14 grid md:grid-cols-2 xl:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  className="landing-reveal rounded-[28px] border border-white/10 bg-white/[0.04] p-7 backdrop-blur-2xl relative overflow-hidden"
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
            </div>
          </div>
        </section>

        <section id="agents" className="relative py-28 px-6">
          <div className="max-w-6xl mx-auto grid lg:grid-cols-[0.92fr_1.08fr] gap-10 items-center">
            <div className="landing-reveal">
              <p className="text-cyan-200/80 text-sm uppercase tracking-[0.28em]">
                AI agent graph
              </p>
              <h2 className="mt-4 text-4xl md:text-5xl font-semibold tracking-[-0.03em] leading-tight">
                A visible chain of reasoning from code to interview confidence.
              </h2>
              <p className="mt-6 text-slate-400 max-w-xl leading-relaxed">
                The system does not stop at a summary. It reads, reasons,
                converts, scores, and prepares the candidate across multiple
                linked layers.
              </p>
            </div>

            <div className="landing-reveal rounded-[34px] border border-white/10 bg-white/[0.04] p-7 md:p-10 backdrop-blur-2xl">
              <div className="grid sm:grid-cols-5 gap-4 items-center">
                {agentFlow.map((agent, index) => (
                  <React.Fragment key={agent}>
                    <div className="rounded-3xl border border-cyan-400/16 bg-slate-950/55 px-4 py-5 min-h-[118px] flex flex-col justify-between shadow-[0_0_40px_rgba(43,125,255,0.09)]">
                      <div className="w-10 h-10 rounded-2xl bg-white/6 border border-white/10 flex items-center justify-center">
                        <span className="text-cyan-200 text-sm font-semibold">
                          {index + 1}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-slate-100">
                        {agent}
                      </p>
                    </div>
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
              </div>
            </div>
          </div>
        </section>


        <section className="relative py-28 px-6">
          <div className="max-w-5xl mx-auto">
            <div className="landing-reveal rounded-[36px] border border-cyan-400/18 bg-[linear-gradient(135deg,rgba(9,19,41,0.9),rgba(8,8,19,0.86))] px-8 py-14 md:px-14 flex flex-col items-center text-center shadow-[0_0_90px_rgba(43,125,255,0.16)]">
              <p className="text-cyan-200/80 text-sm uppercase tracking-[0.28em]">
                Final call
              </p>
              <h2 className="mt-4 text-4xl md:text-6xl font-semibold tracking-[-0.04em] leading-tight">
                Ready to crack your placement?
              </h2>
              <p className="mt-6 max-w-2xl mx-auto text-lg text-slate-300 leading-relaxed text-center">
                Let the system read your project like an engineer, then turn it
                into a sharper story, cleaner proof, and stronger interview
                performance.
              </p>
              <div className="mt-10 flex justify-center">
                <MagneticButton
                  to={token ? "/dashboard" : "/auth"}
                  label="Start Free Analysis"
                />
              </div>
            </div>
          </div>
        </section>
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


