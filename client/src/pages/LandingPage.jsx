import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Upload,
  Search,
  Download,
  Sparkles,
  BrainCircuit,
  FileText,
  MessageSquare,
  ChevronDown,
  Check,
  Code2,
  Terminal,
  Layers,
  Cpu,
  ShieldCheck,
  Circle,
  Square,
  Triangle,
  Menu,
  X,
  Target,
  Zap,
} from "lucide-react";
import useAuthStore from "../store/authStore";

// ==========================================
// DATA & SPECIFICATIONS
// ==========================================

const statsData = [
  { value: "7", label: "Specialized AI Agents", shape: "circle", bg: "#1040C0", textColor: "text-white" },
  { value: "100%", label: "Code-Grounded Truth", shape: "square", bg: "#D02020", textColor: "text-white" },
  { value: "0", label: "Generic Hallucinations", shape: "rotated-square", bg: "#FFFFFF", textColor: "text-black" },
  { value: "3x", label: "Faster Interview Readiness", shape: "circle", bg: "#121212", textColor: "text-white" },
];

const stepsData = [
  {
    step: "01",
    title: "Ingest Repository",
    tag: "Source Analysis",
    copy: "Drop your GitHub URL. PrepAI unpacks real commits, dependencies, schemas, and architectural topologies directly from source.",
    icon: Upload,
    accent: "#D02020",
    shape: "square",
  },
  {
    step: "02",
    title: "Multi-Agent Extraction",
    tag: "Reasoning Graph",
    copy: "Our 7-agent network cross-examines your design decisions, identifying edge cases, tradeoffs, and defensive interview angles.",
    icon: Search,
    accent: "#1040C0",
    shape: "circle",
  },
  {
    step: "03",
    title: "Placement Kit Output",
    tag: "Interview Ready",
    copy: "Walk into viva & tech screens with structured architecture walkthroughs, defendable stories, and verified resume bullets.",
    icon: Download,
    accent: "#F0C020",
    shape: "triangle",
  },
];

const featuresData = [
  {
    title: "Project Story Generator",
    tag: "Narrative Engine",
    copy: "Transforms raw commits into structured STAR-method technical narratives that sound like senior engineering leadership.",
    icon: Sparkles,
    cornerColor: "#D02020",
    shape: "square",
  },
  {
    title: "Viva Prep AI",
    tag: "Deep Technical Defense",
    copy: "Anticipates tough interviewer questions based on your actual tech stack, database bottlenecks, and concurrency constraints.",
    icon: BrainCircuit,
    cornerColor: "#1040C0",
    shape: "circle",
  },
  {
    title: "Resume Bullet Engine",
    tag: "Measurable Impact",
    copy: "Pulls out quantified impact, scope, and technical complexity into clean, ATS-compliant bullet points grounded in code.",
    icon: FileText,
    cornerColor: "#F0C020",
    shape: "triangle",
  },
  {
    title: "Mock Interview Simulator",
    tag: "Interactive Defense",
    copy: "Pressure-tests your project understanding in real time with progressive follow-ups until your explanations are airtight.",
    icon: MessageSquare,
    cornerColor: "#D02020",
    shape: "circle",
  },
  {
    title: "System Architecture Mapper",
    tag: "Topology Visualizer",
    copy: "Reconstructs component boundaries, API flows, state machines, and data stores into crisp architectural mental models.",
    icon: Layers,
    cornerColor: "#1040C0",
    shape: "square",
  },
  {
    title: "Code Quality & Vulnerabilities",
    tag: "Static Verification",
    copy: "Flags security oversights, memory leaks, and anti-patterns before recruiters or technical evaluators spot them.",
    icon: ShieldCheck,
    cornerColor: "#F0C020",
    shape: "circle",
  },
];

const agentGraph = [
  { id: "01", name: "Code Analyzer", role: "AST & Dependency Parsing", bg: "#FFFFFF", shape: "square" },
  { id: "02", name: "Story Synthesizer", role: "Engineering Narrative", bg: "#F0C020", shape: "circle" },
  { id: "03", name: "Architecture Architect", role: "System & Flow Diagrams", bg: "#FFFFFF", shape: "triangle" },
  { id: "04", name: "Resume Tailor", role: "Metrics & ATS Optimization", bg: "#D02020", shape: "square", darkText: true },
  { id: "05", name: "Viva Inquisitor", role: "Adversarial Technical Drill", bg: "#1040C0", shape: "circle", darkText: true },
];

const benefitsList = [
  "No fabricated experience — 100% extracted from genuine commits",
  "Tailored for both engineering managers & algorithm screeners",
  "Covers architecture decisions, failure modes, and database tradeoffs",
  "Generates defendable answers for 'Why this tech stack?'",
  "Exportable summaries for quick 15-minute pre-interview review",
  "Local semantic analysis ensures total code privacy",
];

const faqData = [
  {
    q: "How does PrepAI differ from generic AI chat prompts?",
    a: "Generic LLMs hallucinate fictional libraries and recite textbook definitions. PrepAI constructs a semantic AST map of your actual repository files, extracting concrete component dependencies, schemas, and routes so every answer is 100% defendable.",
  },
  {
    q: "What types of repositories and languages are supported?",
    a: "PrepAI works with fullstack web apps, microservices, mobile apps, and systems code across JavaScript/TypeScript, Python, Go, Java, C++, Rust, and related modern stacks.",
  },
  {
    q: "Does PrepAI train on or share my private code?",
    a: "Never. Your code and repositories are parsed in transient sandboxes with strict privacy guarantees. We do not store or expose proprietary repository logic.",
  },
  {
    q: "How does the Placement Kit help in live interviews?",
    a: "Interviews fail when candidates cannot articulate why they chose a database, how components communicate, or how their app handles failure. PrepAI equips you with the exact technical vocabulary and architectural diagrams to explain your work with confidence.",
  },
];

// ==========================================
// REUSABLE GEOMETRIC ATOMS
// ==========================================

function BauhausLogo() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="relative flex items-center justify-center text-[#D02020]">
        <Sparkles className="w-5 h-5 text-[#D02020]" />
      </div>
      <span className="font-extrabold tracking-tight text-xl uppercase font-['Outfit'] text-[#121212]">
        Prep<span className="text-[#D02020]">AI</span>
      </span>
    </div>
  );
}

function GeometricCornerBadge({ shape = "square", color = "#D02020" }) {
  if (shape === "circle") {
    return (
      <div
        className="w-3.5 h-3.5 rounded-full border border-[#121212]"
        style={{ backgroundColor: color }}
      />
    );
  }
  if (shape === "triangle") {
    return (
      <div
        className="w-3.5 h-3.5 bauhaus-triangle-clip border border-[#121212]"
        style={{ backgroundColor: color }}
      />
    );
  }
  return (
    <div
      className="w-3.5 h-3.5 rounded-none border border-[#121212]"
      style={{ backgroundColor: color }}
    />
  );
}

// ==========================================
// MAIN BAUHAUS LANDING PAGE
// ==========================================

export default function LandingPage() {
  const { token } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  const toggleFaq = (index) => {
    setOpenFaqIndex(openFaqIndex === index ? -1 : index);
  };

  return (
    <div className="bauhaus-page min-h-screen bg-[#F0F0F0] text-[#121212] selection:bg-[#F0C020] selection:text-[#121212]">
      {/* =========================================================================
          1. NAVIGATION (Constructivist Border Grid)
          ========================================================================= */}
      <header className="sticky top-0 z-50 bg-[#F0F0F0] border-b-4 border-[#121212]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <BauhausLogo />
          </Link>

          {/* Desktop Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-bold uppercase tracking-wider">
            <a
              href="#how-it-works"
              className="text-[#121212] hover:text-[#D02020] transition-colors py-2 border-b-2 border-transparent hover:border-[#D02020]"
            >
              How It Works
            </a>
            <a
              href="#features"
              className="text-[#121212] hover:text-[#1040C0] transition-colors py-2 border-b-2 border-transparent hover:border-[#1040C0]"
            >
              Features
            </a>
            <a
              href="#architecture"
              className="text-[#121212] hover:text-[#F0C020] transition-colors py-2 border-b-2 border-transparent hover:border-[#F0C020]"
            >
              AI Agents
            </a>
            <a
              href="#faq"
              className="text-[#121212] hover:text-[#121212] transition-colors py-2 border-b-2 border-transparent hover:border-[#121212]"
            >
              FAQ
            </a>
          </nav>

          {/* Header Action Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              to={token ? "/dashboard" : "/auth"}
              className="bauhaus-btn-press px-6 py-2.5 bg-[#D02020] text-white font-extrabold uppercase tracking-wider text-sm border-2 border-[#121212] bauhaus-shadow-sm hover:bg-[#D02020]/90"
            >
              {token ? "Dashboard" : "Log In"}
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 border-2 border-[#121212] bg-white bauhaus-shadow-sm"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Dropdown */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden border-t-2 border-[#121212] bg-[#F0F0F0] px-6 py-6 flex flex-col gap-4 font-bold uppercase tracking-wider text-sm overflow-hidden"
            >
              <a
                href="#how-it-works"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 border-b border-[#121212]/20"
              >
                How It Works
              </a>
              <a
                href="#features"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 border-b border-[#121212]/20"
              >
                Features
              </a>
              <a
                href="#architecture"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 border-b border-[#121212]/20"
              >
                AI Agents
              </a>
              <a
                href="#faq"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 border-b border-[#121212]/20"
              >
                FAQ
              </a>
              <Link
                to={token ? "/dashboard" : "/auth"}
                className="text-center py-3 bg-[#D02020] text-white font-extrabold border-2 border-[#121212] bauhaus-shadow-sm"
              >
                {token ? "Open Dashboard" : "Get Started"}
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* =========================================================================
          2. HERO SECTION: Constructivist Poster Composition
          ========================================================================= */}
      <section className="relative border-b-4 border-[#121212] bg-[#F0F0F0] overflow-hidden">
        {/* Subtle dot background */}
        <div className="absolute inset-0 bauhaus-grid-pattern opacity-60 pointer-events-none" />

        <div className="max-w-7xl mx-auto grid lg:grid-cols-12 min-h-[calc(100vh-84px)] items-stretch">
          {/* Left Column: Bold Architectural Typographic Layout */}
          <div className="lg:col-span-7 p-6 sm:p-10 lg:p-16 flex flex-col justify-between border-b-4 lg:border-b-0 lg:border-r-4 border-[#121212] z-10">
            <div>
              {/* Constructivist Category Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#F0C020] border-2 border-[#121212] bauhaus-shadow-sm mb-6">
                <span className="w-2.5 h-2.5 bg-[#D02020] rounded-none border border-[#121212]" />
                <span className="text-xs font-black uppercase tracking-widest text-[#121212]">
                  Placement Intelligence Platform
                </span>
              </div>

              {/* Massive Geometric Headline */}
              <h1 className="text-5xl sm:text-6xl md:text-7xl xl:text-8xl font-black uppercase tracking-tighter leading-[0.92]">
                <span className="text-[#121212] block">TURN CODE</span>
                <span className="inline-block bg-[#D02020] text-white px-3 py-1 my-2 border-2 border-[#121212] shadow-[4px_4px_0px_0px_#121212]">
                  INTO CAREER
                </span>
                <span className="text-[#121212] block">OFFERS.</span>
              </h1>

              {/* Functional Subheading */}
              <p className="mt-8 text-lg sm:text-xl font-medium text-[#121212]/80 max-w-xl leading-relaxed">
                Connect your GitHub repository. PrepAI constructs your complete,
                defendable interview kit — architectural breakdowns, viva Q&A,
                and evidence-grounded resume bullets.
              </p>
            </div>

            {/* Action Bar & Primary Buttons */}
            <div className="mt-10 sm:mt-12 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <Link
                to={token ? "/dashboard" : "/auth"}
                className="bauhaus-btn-press flex items-center justify-center gap-3 px-8 py-4 bg-[#D02020] text-white text-base font-extrabold uppercase tracking-wider border-4 border-[#121212] bauhaus-shadow-lg hover:bg-[#D02020]/95"
              >
                <span>{token ? "Enter Dashboard" : "Start For Free"}</span>
                <ArrowRight className="w-5 h-5" />
              </Link>

              <a
                href="#how-it-works"
                className="bauhaus-btn-press flex items-center justify-center gap-2 px-6 py-4 bg-white text-[#121212] text-base font-extrabold uppercase tracking-wider border-4 border-[#121212] bauhaus-shadow-lg hover:bg-white/90"
              >
                <span>Explore Workflow</span>
              </a>
            </div>

            {/* Bottom Meta Badges */}
            <div className="mt-12 pt-8 border-t-2 border-[#121212] grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl sm:text-3xl font-black text-[#121212]">7</p>
                <p className="text-xs font-bold uppercase tracking-wider text-[#121212]/70 mt-1">
                  AI Agents
                </p>
              </div>
              <div className="border-x-2 border-[#121212]">
                <p className="text-2xl sm:text-3xl font-black text-[#D02020]">100%</p>
                <p className="text-xs font-bold uppercase tracking-wider text-[#121212]/70 mt-1">
                  Repo Verified
                </p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-black text-[#1040C0]">0s</p>
                <p className="text-xs font-bold uppercase tracking-wider text-[#121212]/70 mt-1">
                  Fabrication
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Bauhaus Blue Panel with Abstract Geometric Composition */}
          <div className="lg:col-span-5 bg-[#1040C0] p-8 sm:p-12 flex flex-col items-center justify-center relative overflow-hidden text-white">
            {/* Dot grid texture over primary blue */}
            <div className="absolute inset-0 bauhaus-dot-pattern-light opacity-30 pointer-events-none" />

            {/* Constructivist Poster Shapes Composition */}
            <div className="relative w-full max-w-[360px] aspect-square flex items-center justify-center">
              {/* Large Yellow Circle */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="absolute w-64 h-64 sm:w-72 sm:h-72 rounded-full bg-[#F0C020] border-4 border-[#121212] shadow-[8px_8px_0px_0px_#121212]"
              />

              {/* Rotated 45-degree Red Square */}
              <motion.div
                initial={{ rotate: 0, opacity: 0 }}
                animate={{ rotate: 45, opacity: 1 }}
                transition={{ duration: 0.7, delay: 0.15, ease: "easeOut" }}
                className="absolute w-44 h-44 sm:w-52 sm:h-52 bg-[#D02020] border-4 border-[#121212] shadow-[8px_8px_0px_0px_#121212]"
              />

              {/* Foreground Stark White Card with Code Snippet */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="relative z-10 w-full bg-white text-[#121212] p-5 border-4 border-[#121212] shadow-[8px_8px_0px_0px_#121212]"
              >
                <div className="flex items-center justify-between border-b-2 border-[#121212] pb-3 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-[#D02020] border border-[#121212]" />
                    <span className="w-3 h-3 bg-[#F0C020] border border-[#121212]" />
                    <span className="w-3 h-3 bg-[#1040C0] border border-[#121212]" />
                  </div>
                  <span className="text-xs font-mono font-bold tracking-widest uppercase">
                    AST_ANALYZER.SH
                  </span>
                </div>

                <div className="space-y-2 font-mono text-xs">
                  <div className="flex items-center gap-2 text-[#D02020] font-bold">
                    <Terminal className="w-4 h-4" />
                    <span>$ prepai analyze --repo=github.com/app</span>
                  </div>
                  <div className="p-2 bg-[#F0F0F0] border-2 border-[#121212] text-[11px] leading-tight font-medium">
                    <p className="text-[#1040C0] font-bold">✓ 34 Source Files Indexed</p>
                    <p className="text-[#121212]">✓ Architecture: Distributed Event Queue</p>
                    <p className="text-[#D02020] font-bold">✓ 12 Defendable Viva Questions Ready</p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t-2 border-[#121212] flex items-center justify-between text-xs font-bold uppercase">
                  <span>Confidence Score</span>
                  <span className="px-2 py-0.5 bg-[#F0C020] border border-[#121212] font-black">
                    98.4%
                  </span>
                </div>
              </motion.div>
            </div>

            {/* Poster Caption */}
            <div className="mt-8 text-center relative z-10">
              <p className="text-xs font-mono font-bold uppercase tracking-widest text-[#F0C020]">
                FORM FOLLOWS FUNCTION • DESSAU 1925
              </p>
              <p className="text-sm font-bold uppercase tracking-wider text-white mt-1">
                Deterministic Code Verification Architecture
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          3. STATS STRIP: Bold Yellow Color Blocking
          ========================================================================= */}
      <section className="bg-[#F0C020] border-b-4 border-[#121212] py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {statsData.map((stat, i) => (
              <div
                key={stat.label}
                className="bg-white border-4 border-[#121212] p-6 bauhaus-shadow flex flex-col justify-between"
              >
                <div className="flex items-start justify-between">
                  <span className="text-5xl sm:text-6xl font-black text-[#121212] leading-none">
                    {stat.value}
                  </span>
                  <div
                    className="w-8 h-8 border-2 border-[#121212] flex items-center justify-center font-bold text-xs"
                    style={{
                      backgroundColor: stat.bg,
                      borderRadius: stat.shape === "circle" ? "9999px" : "0px",
                      transform: stat.shape === "rotated-square" ? "rotate(45deg)" : "none",
                    }}
                  >
                    <span
                      className={stat.textColor}
                      style={{
                        transform: stat.shape === "rotated-square" ? "rotate(-45deg)" : "none",
                      }}
                    >
                      ★
                    </span>
                  </div>
                </div>
                <p className="mt-4 text-sm font-extrabold uppercase tracking-wider text-[#121212]">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          4. HOW IT WORKS: 3-Column Geometric Flow
          ========================================================================= */}
      <section id="how-it-works" className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 border-b-4 border-[#121212] bg-[#F0F0F0]">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="border-b-4 border-[#121212] pb-6 mb-16 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="inline-block px-3 py-1 bg-[#D02020] text-white border-2 border-[#121212] text-xs font-black uppercase tracking-widest mb-3">
                Workflow Engineering
              </div>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tighter text-[#121212]">
                HOW IT WORKS
              </h2>
            </div>
            <p className="text-base sm:text-lg font-bold uppercase tracking-wider text-[#121212]/70 max-w-md">
              From raw GitHub repository URL to defensive interview capability in 3 deliberate steps.
            </p>
          </div>

          {/* 3 Step Cards Grid */}
          <div className="grid md:grid-cols-3 gap-8">
            {stepsData.map((step, idx) => (
              <div
                key={step.title}
                className="bg-white border-4 border-[#121212] bauhaus-shadow-lg p-8 flex flex-col justify-between relative group hover:-translate-y-1 transition-transform"
              >
                {/* Geometric corner indicator */}
                <div className="absolute top-4 right-4">
                  <GeometricCornerBadge shape={step.shape} color={step.accent} />
                </div>

                <div>
                  {/* Step Counter Badge */}
                  <div
                    className="inline-flex items-center justify-center w-14 h-14 border-4 border-[#121212] text-xl font-black mb-6 text-white"
                    style={{ backgroundColor: step.accent }}
                  >
                    {step.step}
                  </div>

                  <span className="block text-xs font-black uppercase tracking-widest text-[#121212]/60 mb-2">
                    {step.tag}
                  </span>

                  <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-[#121212] mb-4">
                    {step.title}
                  </h3>

                  <p className="text-base font-medium text-[#121212]/80 leading-relaxed">
                    {step.copy}
                  </p>
                </div>

                <div className="mt-8 pt-4 border-t-2 border-[#121212] flex items-center justify-between text-xs font-bold uppercase">
                  <span>Phase {idx + 1} of 3</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          5. FEATURES SECTION: Grid of Geometric Functional Units
          ========================================================================= */}
      <section id="features" className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 border-b-4 border-[#121212] bg-[#FFFFFF]">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="border-b-4 border-[#121212] pb-6 mb-16 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="inline-block px-3 py-1 bg-[#1040C0] text-white border-2 border-[#121212] text-xs font-black uppercase tracking-widest mb-3">
                Functional Capabilities
              </div>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tighter text-[#121212]">
                CORE FEATURES
              </h2>
            </div>
            <p className="text-base sm:text-lg font-bold uppercase tracking-wider text-[#121212]/70 max-w-md">
              Constructed to make your technical presentation articulate, verified, and impossible to poke holes in.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuresData.map((feat) => {
              const IconComp = feat.icon;
              return (
                <div
                  key={feat.title}
                  className="bg-[#F0F0F0] border-4 border-[#121212] bauhaus-shadow p-8 flex flex-col justify-between relative hover:-translate-y-1 transition-transform"
                >
                  {/* Decorative shape top right */}
                  <div className="absolute top-4 right-4">
                    <GeometricCornerBadge shape={feat.shape} color={feat.cornerColor} />
                  </div>

                  <div>
                    {/* Icon Container */}
                    <div className="w-14 h-14 bg-white border-2 border-[#121212] bauhaus-shadow-sm flex items-center justify-center mb-6">
                      <IconComp className="w-7 h-7 text-[#121212]" />
                    </div>

                    <span className="block text-xs font-black uppercase tracking-widest text-[#1040C0] mb-2">
                      {feat.tag}
                    </span>

                    <h3 className="text-2xl font-black uppercase tracking-tight text-[#121212] mb-3">
                      {feat.title}
                    </h3>

                    <p className="text-base font-medium text-[#121212]/80 leading-relaxed">
                      {feat.copy}
                    </p>
                  </div>

                  <div className="mt-8 pt-4 border-t-2 border-[#121212] flex items-center justify-between text-xs font-bold uppercase">
                    <span className="text-[#121212]">Autonomous Capability</span>
                    <span
                      className="w-3 h-3 border border-[#121212]"
                      style={{ backgroundColor: feat.cornerColor }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =========================================================================
          6. AI AGENTS GRAPH: Deep Bauhaus Blue Color Blocking
          ========================================================================= */}
      <section id="architecture" className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 border-b-4 border-[#121212] bg-[#1040C0] text-white">
        <div className="max-w-7xl mx-auto">
          <div className="border-b-4 border-[#121212] pb-6 mb-16 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="inline-block px-3 py-1 bg-[#F0C020] text-[#121212] border-2 border-[#121212] text-xs font-black uppercase tracking-widest mb-3">
                Agent Architecture
              </div>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tighter text-white">
                THE REASONING CHAIN
              </h2>
            </div>
            <p className="text-base sm:text-lg font-bold uppercase tracking-wider text-white/90 max-w-md">
              A sequential pipeline of 5 specialized agents that inspect, dissect, and synthesize your codebase.
            </p>
          </div>

          {/* Sequential Agent Graph Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {agentGraph.map((agent, index) => (
              <div
                key={agent.name}
                className="bg-white text-[#121212] border-4 border-[#121212] bauhaus-shadow p-6 flex flex-col justify-between relative hover:-translate-y-1 transition-transform"
              >
                <div className="flex items-center justify-between border-b-2 border-[#121212] pb-3 mb-4">
                  <span className="text-2xl font-black font-mono">#{agent.id}</span>
                  <GeometricCornerBadge
                    shape={agent.shape}
                    color={agent.bg === "#FFFFFF" ? "#D02020" : agent.bg}
                  />
                </div>

                <div>
                  <h3 className="text-xl font-black uppercase tracking-tight text-[#121212] mb-2">
                    {agent.name}
                  </h3>
                  <p className="text-xs font-bold uppercase tracking-wider text-[#121212]/70 leading-relaxed">
                    {agent.role}
                  </p>
                </div>

                <div className="mt-6 pt-3 border-t-2 border-[#121212] flex items-center justify-between text-[11px] font-black uppercase text-[#1040C0]">
                  <span>Step {index + 1}</span>
                  <span>Active</span>
                </div>
              </div>
            ))}
          </div>

          {/* Explanatory Diagram Box */}
          <div className="mt-12 bg-white text-[#121212] border-4 border-[#121212] bauhaus-shadow-lg p-8 sm:p-10 flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="max-w-2xl">
              <span className="inline-block px-3 py-1 bg-[#D02020] text-white border-2 border-[#121212] text-xs font-black uppercase tracking-widest mb-3">
                Zero Blackbox
              </span>
              <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-tight mb-2">
                Every interview claim backed by source code line references.
              </h3>
              <p className="text-base font-medium text-[#121212]/80 leading-relaxed">
                If an agent generates a resume bullet or a viva response, it links directly to the concrete controller, route, schema, or algorithm in your GitHub repository.
              </p>
            </div>

            <div className="shrink-0">
              <Link
                to={token ? "/dashboard" : "/auth"}
                className="bauhaus-btn-press inline-flex items-center gap-3 px-8 py-4 bg-[#F0C020] text-[#121212] text-sm font-black uppercase tracking-wider border-4 border-[#121212] bauhaus-shadow hover:bg-[#F0C020]/90"
              >
                <span>Analyze Your Repo</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          7. BENEFITS: Bold Red Color Blocking
          ========================================================================= */}
      <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 border-b-4 border-[#121212] bg-[#D02020] text-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            {/* Left Narrative */}
            <div className="lg:col-span-5">
              <div className="inline-block px-3 py-1 bg-[#F0C020] text-[#121212] border-2 border-[#121212] text-xs font-black uppercase tracking-widest mb-4">
                Placement Defense
              </div>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tighter leading-none text-white">
                WHY IT MATTERS IN THE ROOM.
              </h2>
              <p className="mt-6 text-lg font-medium text-white/90 leading-relaxed">
                Technical interviewers can smell shallow project familiarity within 90 seconds. PrepAI equips you with rigorous, architectural clarity so you own your code.
              </p>

              <div className="mt-8">
                <Link
                  to={token ? "/dashboard" : "/auth"}
                  className="bauhaus-btn-press inline-flex items-center gap-3 px-8 py-4 bg-white text-[#121212] text-sm font-black uppercase tracking-wider border-4 border-[#121212] shadow-[6px_6px_0px_0px_#121212]"
                >
                  <span>Build Your Placement Kit</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>

            {/* Right Checklist Grid */}
            <div className="lg:col-span-7 bg-white text-[#121212] border-4 border-[#121212] bauhaus-shadow-lg p-6 sm:p-10">
              <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight border-b-2 border-[#121212] pb-4 mb-6">
                Verified Candidate Standards
              </h3>

              <div className="space-y-4">
                {benefitsList.map((benefit, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-4 p-3 bg-[#F0F0F0] border-2 border-[#121212] bauhaus-shadow-sm"
                  >
                    <div className="w-7 h-7 rounded-full bg-[#F0C020] border-2 border-[#121212] flex items-center justify-center shrink-0">
                      <Check className="w-4 h-4 text-[#121212] stroke-[3]" />
                    </div>
                    <p className="text-sm sm:text-base font-bold text-[#121212] leading-snug">
                      {benefit}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          8. FAQ SECTION: Bauhaus Accordion (Red Open / Yellow Content)
          ========================================================================= */}
      <section id="faq" className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 border-b-4 border-[#121212] bg-[#F0F0F0]">
        <div className="max-w-4xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="inline-block px-3 py-1 bg-[#1040C0] text-white border-2 border-[#121212] text-xs font-black uppercase tracking-widest mb-3">
              Clear Answers
            </div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tighter text-[#121212]">
              FREQUENTLY ASKED QUESTIONS
            </h2>
            <p className="mt-4 text-base sm:text-lg font-bold uppercase tracking-wider text-[#121212]/70">
              Strictly honest answers about privacy, accuracy, and output.
            </p>
          </div>

          {/* Accordion Group */}
          <div className="space-y-4">
            {faqData.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div
                  key={faq.q}
                  className="border-4 border-[#121212] bauhaus-shadow overflow-hidden transition-all"
                >
                  {/* Header */}
                  <button
                    onClick={() => toggleFaq(index)}
                    className={`w-full p-6 text-left flex items-center justify-between transition-colors ${
                      isOpen ? "bg-[#D02020] text-white" : "bg-white text-[#121212] hover:bg-gray-50"
                    }`}
                  >
                    <span className="text-lg sm:text-xl font-black uppercase tracking-tight pr-4">
                      {faq.q}
                    </span>
                    <div
                      className={`w-8 h-8 border-2 border-[#121212] flex items-center justify-center shrink-0 transition-transform ${
                        isOpen ? "rotate-180 bg-[#F0C020] text-[#121212]" : "bg-white text-[#121212]"
                      }`}
                    >
                      <ChevronDown className="w-5 h-5 stroke-[3]" />
                    </div>
                  </button>

                  {/* Body Content */}
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                        className="bg-[#FFF9C4] text-[#121212] border-t-4 border-[#121212] p-6 sm:p-8"
                      >
                        <p className="text-base sm:text-lg font-medium leading-relaxed">
                          {faq.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =========================================================================
          9. FINAL CALL TO ACTION: Massive Yellow Panel with Decorative Shapes
          ========================================================================= */}
      <section className="relative py-20 sm:py-28 px-4 sm:px-6 lg:px-8 border-b-4 border-[#121212] bg-[#F0C020] overflow-hidden">
        {/* Large Decorative Overlapping Corner Shapes */}
        <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full bg-[#1040C0] opacity-40 border-4 border-[#121212] pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-72 h-72 rotate-45 bg-[#D02020] opacity-40 border-4 border-[#121212] pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-block px-3 py-1 bg-white text-[#121212] border-2 border-[#121212] text-xs font-black uppercase tracking-widest mb-4">
            Get Placement Ready Today
          </div>

          <h2 className="text-5xl sm:text-6xl md:text-7xl font-black uppercase tracking-tighter text-[#121212] leading-[0.92]">
            STOP GUESSING. <br />
            START DEFENDING YOUR CODE.
          </h2>

          <p className="mt-8 text-lg sm:text-xl font-bold uppercase tracking-wider text-[#121212]/80 max-w-2xl mx-auto leading-relaxed">
            Upload your GitHub repository and walk into your next interview backed by full architectural proof.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-5">
            <Link
              to={token ? "/dashboard" : "/auth"}
              className="bauhaus-btn-press flex items-center justify-center gap-3 px-10 py-5 bg-[#D02020] text-white text-lg font-black uppercase tracking-wider border-4 border-[#121212] bauhaus-shadow-lg hover:bg-[#D02020]/90"
            >
              <span>{token ? "Open Dashboard" : "Start Free Analysis"}</span>
              <ArrowRight className="w-6 h-6" />
            </Link>

            <Link
              to={token ? "/dashboard" : "/auth"}
              className="bauhaus-btn-press flex items-center justify-center gap-2 px-8 py-5 bg-white text-[#121212] text-lg font-black uppercase tracking-wider border-4 border-[#121212] bauhaus-shadow-lg hover:bg-white/90"
            >
              <span>Sign In With GitHub</span>
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================================================
          10. FOOTER: Constructivist Stark Black Grounding
          ========================================================================= */}
      <footer className="bg-[#121212] text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 pb-12 border-b-2 border-white/20">
            {/* Brand column */}
            <div className="md:col-span-5">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-6 h-6 text-[#F0C020]" />
                <span className="font-extrabold tracking-tight text-2xl uppercase font-['Outfit'] text-white">
                  Prep<span className="text-[#D02020]">AI</span>
                </span>
              </div>

              <p className="mt-4 text-sm font-medium text-white/70 max-w-sm leading-relaxed">
                Autonomous placement kit generation platform built on local semantic embeddings and AST code analysis.
              </p>
            </div>

            {/* Links Columns */}
            <div className="md:col-span-3">
              <h4 className="text-sm font-black uppercase tracking-widest text-[#F0C020] mb-4">
                Architecture
              </h4>
              <ul className="space-y-2.5 text-sm font-bold uppercase tracking-wider text-white/70">
                <li>
                  <a href="#how-it-works" className="hover:text-white transition-colors">
                    How It Works
                  </a>
                </li>
                <li>
                  <a href="#features" className="hover:text-white transition-colors">
                    Agent Network
                  </a>
                </li>
                <li>
                  <a href="#architecture" className="hover:text-white transition-colors">
                    Semantic Retrieval
                  </a>
                </li>
                <li>
                  <a href="#faq" className="hover:text-white transition-colors">
                    FAQ
                  </a>
                </li>
              </ul>
            </div>

            <div className="md:col-span-4">
              <h4 className="text-sm font-black uppercase tracking-widest text-[#D02020] mb-4">
                System Status
              </h4>
              <div className="p-4 bg-white/5 border-2 border-white/20 text-xs font-mono">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white/60">Semantic Model:</span>
                  <span className="text-[#F0C020] font-bold">all-MiniLM-L6-v2</span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white/60">Execution:</span>
                  <span className="text-green-400 font-bold">Local ONNX</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/60">Code Security:</span>
                  <span className="text-cyan-300 font-bold">Zero-Retention</span>
                </div>
              </div>
            </div>
          </div>

          {/* Copyright Row */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-bold uppercase tracking-wider text-white/60">
            <p>© {new Date().getFullYear()} PrepAI. Form Follows Function.</p>
            <p className="font-mono text-[11px]">Constructed with Pure Bauhaus Modernism</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
