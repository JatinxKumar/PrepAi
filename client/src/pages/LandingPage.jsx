import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  BrainCircuit,
  Check,
  CheckCircle2,
  ChevronDown,
  Copy,
  Download,
  FileText,
  Layers,
  Menu,
  MessageSquare,
  Search,
  ShieldCheck,
  Sparkles,
  Terminal,
  Upload,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import useAuthStore from "../store/authStore";

// ==========================================
// DATA & SPECIFICATIONS
// ==========================================

const statsData = [
  {
    value: "01",
    label: "Connect a repository",
    shape: "circle",
    bg: "#1040C0",
    textColor: "text-white",
  },
  {
    value: "02",
    label: "Review your project",
    shape: "square",
    bg: "#D02020",
    textColor: "text-white",
  },
  {
    value: "03",
    label: "Prepare for interviews",
    shape: "rotated-square",
    bg: "#FFFFFF",
    textColor: "text-black",
  },
];

const stepsData = [
  {
    step: "01",
    title: "Add Your Repository",
    tag: "Start here",
    copy: "Add your GitHub repository URL to get started.",
    icon: Upload,
    accent: "#D02020",
    shape: "square",
  },
  {
    step: "02",
    title: "Analyse Your Code",
    tag: "Understand the project",
    copy: "PrepAI examines your project structure, source files and dependencies to understand how your application works.",
    icon: Search,
    accent: "#1040C0",
    shape: "circle",
  },
  {
    step: "03",
    title: "Generate Your Placement Kit",
    tag: "Prepare your materials",
    copy: "Get project explanations, technical viva questions, architecture insights and resume-ready bullet points.",
    icon: Download,
    accent: "#F0C020",
    shape: "triangle",
  },
];

const featuresData = [
  {
    title: "Project Story",
    tag: "Project explanation",
    copy: "Get a structured overview of your project, its architecture and how its main parts work together.",
    icon: Sparkles,
    cornerColor: "#D02020",
    shape: "square",
  },
  {
    title: "Technical Viva Preparation",
    tag: "Practice questions",
    copy: "Review technical questions and suggested answers based on the project analysis.",
    icon: BrainCircuit,
    cornerColor: "#1040C0",
    shape: "circle",
  },
  {
    title: "AI Resume Builder",
    tag: "Project-based resume points",
    copy: "Generate resume bullet point drafts from the features and technologies identified in your project.",
    icon: FileText,
    cornerColor: "#F0C020",
    shape: "triangle",
  },
  {
    title: "Mock Interview",
    tag: "Interview practice",
    copy: "Practise discussing your project in a chat-based interview and get follow-up questions.",
    icon: MessageSquare,
    cornerColor: "#D02020",
    shape: "circle",
  },
  {
    title: "Architecture Summary",
    tag: "Architecture overview",
    copy: "Explore a written summary of the system architecture, data flow and component interactions.",
    icon: Layers,
    cornerColor: "#1040C0",
    shape: "square",
  },
  {
    title: "Code Quality Analysis",
    tag: "Potential improvements",
    copy: "Review suggested improvements based on the repository analysis. Suggestions may need your own technical review.",
    icon: ShieldCheck,
    cornerColor: "#F0C020",
    shape: "circle",
  },
];

const agentGraph = [
  {
    id: "01",
    name: "Project DNA Extractor",
    role: "Summarises repository structure and technologies",
    bg: "#FFFFFF",
    shape: "square",
  },
  {
    id: "02",
    name: "Project Story",
    role: "Generates a structured project explanation",
    bg: "#F0C020",
    shape: "circle",
  },
  {
    id: "03",
    name: "Architecture Summary",
    role: "Describes system structure and data flow",
    bg: "#FFFFFF",
    shape: "triangle",
  },
  {
    id: "04",
    name: "Viva Questions",
    role: "Drafts technical questions and answers",
    bg: "#D02020",
    shape: "square",
  },
  {
    id: "05",
    name: "Resume Points",
    role: "Drafts project based resume bullets",
    bg: "#1040C0",
    shape: "circle",
  },
  {
    id: "06",
    name: "Improvement Suggestions",
    role: "Suggests potential project improvements",
    bg: "#F0C020",
    shape: "triangle",
  },
  {
    id: "07",
    name: "Demo Script",
    role: "Drafts a short project walkthrough",
    bg: "#FFFFFF",
    shape: "square",
  },
];

const benefitsList = [
  "Understand your project structure.",
  "Prepare for technical viva questions.",
  "Explain your technology choices.",
  "Identify possible improvements.",
  "Generate resume points based on your project.",
  "Practise explaining your work confidently.",
];

const faqData = [
  {
    q: "How does PrepAI differ from generic AI chat prompts?",
    a: "PrepAI reads your actual repository files, so you do not have to paste code into a chat. It builds context from the repository file tree and selected source files, then generates a fixed set of outputs in one run: project story, architecture summary, technical viva questions, project-based resume points, improvement suggestions and a demo script. Everything is saved under your project so you can come back to it later. The output is AI-generated, so check it against your code and practise explaining it in your own words.",
  },
  {
    q: "What types of repositories and languages are supported?",
    a: "PrepAI analyses repositories accessible through GitHub and reads selected files rather than every file. The local scanner recognises JavaScript, TypeScript, Python, Go, Java, C/C++, C#, PHP, Ruby, HTML, CSS, JSON, Markdown, shell and YAML files. If cloning is unavailable, the GitHub API fallback reads a narrower set, mainly JavaScript/TypeScript, JSON, Markdown, CSS/SCSS and HTML. Coverage depends on the repository and fallback path.",
  },
  {
    q: "Does PrepAI train on or share my private code?",
    a: "PrepAI does not train any model, but the selected repository files are sent to Groq, an external AI provider, to generate the analysis. The generated analysis and the repository URL are saved with your project in the application database, while embeddings are created locally with all-MiniLM-L6-v2. The current GitHub flow works with repositories that do not require private-repository credentials. Do not submit sensitive code unless Groq's current data handling terms meet your needs, as PrepAI cannot promise immediate deletion by Groq.",
  },
  {
    q: "How does the Placement Kit help me prepare?",
    a: "The Placement Kit gives you a clear set of materials to review before an interview, so you can check how your project is described and where you need more depth. Compare the generated project explanation, architecture summary, viva questions, resume points and improvement suggestions against your own code, then practise explaining them in your own words. It is meant to sharpen your preparation, not to replace your own understanding.",
  },
];

const prepaiSummaryPrompt = `Summarise this product in clear, professional language for students, developers and recruiters:

PrepAI is an AI-powered placement preparation platform for students and developers. It helps users understand the projects they have built and prepare to explain them in technical interviews.

Users connect a GitHub repository URL. PrepAI fetches the repository file tree and selected source files, then builds project context from the files it can read. Its analysis pipeline has seven stages: Project DNA extraction, Project Story generation, Architecture Summary, Viva Questions, Resume Points, Improvement Suggestions and Demo Script generation.

The platform produces project explanations, written architecture and data-flow summaries, technical viva questions with draft answers, project-based resume highlights, improvement suggestions and a short demo script. These are preparation materials, so users should review them against their own source code and practise explaining them in their own words.

PrepAI generates semantic embeddings locally with all-MiniLM-L6-v2 and sends repository context to Groq for AI generation. It is useful for students and developers who want to turn a real project into clear interview preparation material. It does not guarantee interview success, and AI-generated content should be checked for accuracy.

Website: https://prepai.jatinxkumar.xyz`;

// ==========================================
// REUSABLE GEOMETRIC ATOMS
// ==========================================

function BauhausLogo() {
  return (
    <div className="flex items-center gap-2">
      <Sparkles className="w-5 h-5 text-[#D02020] shrink-0" />
      <span className="font-black tracking-tight text-xl uppercase font-['Outfit'] text-[#121212]">
        PREP<span className="text-[#D02020]">AI</span>
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
  const [openFaqIndex, setOpenFaqIndex] = useState(-1);
  const [summaryStatus, setSummaryStatus] = useState("");
  const statusTimerRef = useRef(null);

  // Message 3 second baad apne aap hat jayega
  const showStatus = (message) => {
    setSummaryStatus(message);
    clearTimeout(statusTimerRef.current);
    statusTimerRef.current = setTimeout(() => setSummaryStatus(""), 3000);
  };

  // Component unmount hone par timer clean up
  useEffect(() => {
    return () => clearTimeout(statusTimerRef.current);
  }, []);

  const toggleFaq = (index) => {
    setOpenFaqIndex(openFaqIndex === index ? -1 : index);
  };

  const copySummaryPrompt = async (successMessage = "Prompt copied!") => {
    try {
      await navigator.clipboard.writeText(prepaiSummaryPrompt);
      showStatus(successMessage);
    } catch {
      showStatus("Could not copy the prompt. Please try again.");
    }
  };

  // Gemini ke liye: pehle copy, phir tab open (Gemini URL se prompt prefill support nahi karta)
  const openProviderWithCopiedPrompt = (providerName, providerUrl) => {
    copySummaryPrompt(`Prompt copied — paste it into ${providerName}.`);
    window.open(providerUrl, "_blank", "noopener,noreferrer");
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
              Analysis Pipeline
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
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
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
                Analysis Pipeline
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
                  Placement Preparation Platform
                </span>
              </div>

              {/* Massive Geometric Headline */}
              <h1 className="text-5xl font-black uppercase tracking-tighter leading-[0.92]">
                <span className="text-[#121212] block">TURN YOUR PROJECTS</span>
                <span className="inline-block bg-[#D02020] text-white px-3 py-1 my-2 border-2 border-[#121212] shadow-[4px_4px_0px_0px_#121212]">
                  INTO INTERVIEW
                </span>
                <span className="text-[#121212] block">CONFIDENCE.</span>
              </h1>

              {/* Functional Subheading */}
              <p className="mt-8 text-lg sm:text-xl font-medium text-[#121212]/80 max-w-xl leading-relaxed">
                Connect your GitHub repository and let PrepAI understand your
                code. Generate project explanations, technical interview
                questions, architecture insights and resume-ready bullet points
                based on your repository.
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
            <div className="mt-12 pt-8 border-t-2 border-[#121212] text-sm font-bold uppercase tracking-wider text-[#121212]/70">
              Project preparation from your repository
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
                    PROJECT_SCAN.SH
                  </span>
                </div>

                <div className="space-y-2 font-mono text-xs">
                  <div className="flex items-center gap-2 text-[#D02020] font-bold">
                    <Terminal className="w-4 h-4" />
                    <span>Sample analysis preview</span>
                  </div>
                  <div className="p-2 bg-[#F0F0F0] border-2 border-[#121212] text-[11px] leading-tight font-medium">
                    <p className="text-[#1040C0] font-bold">
                      Project structure and files
                    </p>
                    <p className="text-[#121212]">
                      Architecture and technology summary
                    </p>
                    <p className="text-[#D02020] font-bold">
                      Interview questions and resume points
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t-2 border-[#121212] flex items-center justify-between text-xs font-bold uppercase">
                  <span>Example interface</span>
                  <span className="px-2 py-0.5 bg-[#F0C020] border border-[#121212] font-black">
                    Sample
                  </span>
                </div>
              </motion.div>
            </div>

            {/* Poster Caption */}
            <div className="mt-8 text-center relative z-10">
              <p className="text-xs font-mono font-bold uppercase tracking-widest text-[#F0C020]">
                FROM REPO TO INTERVIEW
              </p>
              <p className="text-sm font-bold uppercase tracking-wider text-white mt-1">
                Sample repository analysis preview
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
                      transform:
                        stat.shape === "rotated-square"
                          ? "rotate(45deg)"
                          : "none",
                    }}
                  >
                    <span
                      className={stat.textColor}
                      style={{
                        transform:
                          stat.shape === "rotated-square"
                            ? "rotate(-45deg)"
                            : "none",
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
      <section
        id="how-it-works"
        className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 border-b-4 border-[#121212] bg-[#F0F0F0]"
      >
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="border-b-4 border-[#121212] pb-6 mb-16 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="inline-block px-3 py-1 bg-[#D02020] text-white border-2 border-[#121212] text-xs font-black uppercase tracking-widest mb-3">
                Three Steps
              </div>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tighter text-[#121212]">
                HOW IT WORKS
              </h2>
            </div>
            <p className="text-base sm:text-lg font-bold uppercase tracking-wider text-[#121212]/70 max-w-md">
              From a GitHub repository to useful project and interview
              preparation materials.
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
                  <GeometricCornerBadge
                    shape={step.shape}
                    color={step.accent}
                  />
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
      <section
        id="features"
        className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 border-b-4 border-[#121212] bg-[#FFFFFF]"
      >
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="border-b-4 border-[#121212] pb-6 mb-16 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="inline-block px-3 py-1 bg-[#1040C0] text-white border-2 border-[#121212] text-xs font-black uppercase tracking-widest mb-3">
                Project Tools
              </div>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tighter text-[#121212]">
                CORE FEATURES
              </h2>
            </div>
            <p className="text-base sm:text-lg font-bold uppercase tracking-wider text-[#121212]/70 max-w-md">
              Tools to help you understand your project and prepare to discuss
              it.
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
                    <GeometricCornerBadge
                      shape={feat.shape}
                      color={feat.cornerColor}
                    />
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
      <section
        id="architecture"
        className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 border-b-4 border-[#121212] bg-[#1040C0] text-white"
      >
        <div className="max-w-7xl mx-auto">
          <div className="border-b-4 border-[#121212] pb-6 mb-16 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="inline-block px-3 py-1 bg-[#F0C020] text-[#121212] border-2 border-[#121212] text-xs font-black uppercase tracking-widest mb-3">
                Analysis Pipeline
              </div>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tighter text-white">
                HOW ANALYSIS WORKS
              </h2>
            </div>
            <p className="text-base sm:text-lg font-bold uppercase tracking-wider text-white/90 max-w-md">
              The analysis pipeline runs seven steps to summarise a repository
              and prepare project materials.
            </p>
          </div>

          {/* Sequential Agent Graph Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {agentGraph.map((agent, index) => (
              <div
                key={agent.name}
                className="bg-white text-[#121212] border-4 border-[#121212] bauhaus-shadow p-6 flex flex-col justify-between relative hover:-translate-y-1 transition-transform"
              >
                <div className="flex items-center justify-between border-b-2 border-[#121212] pb-3 mb-4">
                  <span className="text-2xl font-black font-mono">
                    #{agent.id}
                  </span>
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
                </div>
              </div>
            ))}
          </div>

          {/* Explanatory Diagram Box */}
          <div className="mt-12 bg-white text-[#121212] border-4 border-[#121212] bauhaus-shadow-lg p-8 sm:p-10 flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="max-w-2xl">
              <span className="inline-block px-3 py-1 bg-[#D02020] text-white border-2 border-[#121212] text-xs font-black uppercase tracking-widest mb-3">
                How analysis works
              </span>
              <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-tight mb-2">
                AI-generated materials based on repository context.
              </h3>
              <p className="text-base font-medium text-[#121212]/80 leading-relaxed">
                PrepAI reads selected repository files and project structure,
                then sends repository context to Groq to generate analysis.
                Review generated details against your source code before using
                them.
              </p>
            </div>

            <div className="shrink-0">
              <Link
                to={token ? "/dashboard" : "/auth"}
                className="bauhaus-btn-press inline-flex items-center gap-3 px-8 py-4 bg-[#F0C020] text-[#121212] text-sm font-black uppercase tracking-wider border-4 border-[#121212] bauhaus-shadow hover:bg-[#F0C020]/90"
              >
                <span>Analyse Your Repo</span>
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
                Project Preparation
              </div>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tighter leading-none text-white">
                BE READY TO EXPLAIN YOUR PROJECT.
              </h2>
              <p className="mt-6 text-lg font-medium text-white/90 leading-relaxed">
                Build a clearer understanding of your work and prepare to
                discuss it in technical interviews.
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
                Ways PrepAI Can Help
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
      <section
        id="faq"
        className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 border-b-4 border-[#121212] bg-[#F0F0F0]"
      >
        <div className="max-w-4xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="inline-block px-3 py-1 bg-[#1040C0] text-white border-2 border-[#121212] text-xs font-black uppercase tracking-widest mb-3">
              FAQ
            </div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tighter text-[#121212]">
              FREQUENTLY ASKED QUESTIONS
            </h2>
            <p className="mt-4 text-base sm:text-lg font-bold uppercase tracking-wider text-[#121212]/70">
              Answers about how PrepAI works, what it analyses and how data is
              processed.
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
                      isOpen
                        ? "bg-[#D02020] text-white"
                        : "bg-white text-[#121212] hover:bg-gray-50"
                    }`}
                  >
                    <span className="text-lg sm:text-xl font-black uppercase tracking-tight pr-4">
                      {faq.q}
                    </span>
                    <div
                      className={`w-8 h-8 border-2 border-[#121212] flex items-center justify-center shrink-0 transition-transform ${
                        isOpen
                          ? "rotate-180 bg-[#F0C020] text-[#121212]"
                          : "bg-white text-[#121212]"
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
      <section
        className="relative py-20 sm:py-28 px-4 sm:px-6 lg:px-8 border-b-4 border-[#121212] bg-[#F0C020] overflow-hidden"
        style={{ clipPath: "inset(0)" }}
      >
        {/* Large Decorative Overlapping Corner Shapes */}
        <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full bg-[#1040C0] opacity-40 border-4 border-[#121212] pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-72 h-72 rotate-45 bg-[#D02020] opacity-40 border-4 border-[#121212] pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-block px-3 py-1 bg-white text-[#121212] border-2 border-[#121212] text-xs font-black uppercase tracking-widest mb-4">
            Get Placement Ready Today
          </div>

          <h2 className="text-5xl sm:text-6xl md:text-7xl font-black uppercase tracking-tighter text-[#121212] leading-[0.92]">
            UNDERSTAND YOUR PROJECT. <br />
            PREPARE TO EXPLAIN IT.
          </h2>

          <div className="mt-8 w-full flex justify-center px-4">
            <p className="w-full max-w-3xl text-center text-lg sm:text-xl font-bold uppercase tracking-wider text-[#121212]/80 leading-relaxed">
              Connect a GitHub repository to generate project explanations,
              interview questions and resume points.
            </p>
          </div>

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
          10. AI SUMMARY: Share PrepAI With Your Preferred Assistant
          ========================================================================= */}
      <section className="px-4 sm:px-6 lg:px-8 py-10 sm:py-14 bg-[#F0F0F0]">
        <div className="max-w-7xl mx-auto">
          <div className="rounded-[2rem] bg-[#121212] border-2 border-[#121212]/70 shadow-[6px_6px_0_#D02020] px-6 py-6 sm:px-8 sm:py-7 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-center gap-3 text-white">
              <div className="w-11 h-11 shrink-0 rounded-full bg-[#F0C020] border-2 border-white/20 flex items-center justify-center">
                <Sparkles
                  className="w-5 h-5 text-[#121212]"
                  aria-hidden="true"
                />
              </div>
              <div>
                <h2
                  className="text-xl sm:text-2xl font-black tracking-tight"
                  style={{ color: "#FFFFFF" }}
                >
                  Summarise with AI
                </h2>
                <p className="mt-1 text-sm text-white/65">
                  Open an assistant with the PrepAI summary prompt already filled in, or copy it.
                  first.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 sm:gap-4 md:justify-end">
              {/* ChatGPT: prompt URL se prefill hota hai */}
              <a
                href={`https://chatgpt.com/?q=${encodeURIComponent(prepaiSummaryPrompt)}`}
                target="_blank"
                rel="noopener noreferrer"
                title="Open the PrepAI summary prompt in ChatGPT"
                aria-label="Open the PrepAI summary prompt in ChatGPT"
                className="group w-12 h-12 rounded-full border-2 border-white/25 bg-white/5 hover:bg-[#F0C020] hover:border-[#F0C020] flex items-center justify-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F0C020] focus-visible:ring-offset-2 focus-visible:ring-offset-[#121212]"
              >
                <img
                  src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAAsTAAALEwEAmpwYAAADe0lEQVR4nNWXW4jOURTFP0bJkEa8SCGMyCWUy7g1JuFNwgPJk5LiyYMZkUQ0rhkZCZNrNG7PZrxr8ODJZRByKVIyg3GdnzbrsB3n/32hKdbb/6xzzl7f2fuss79c7n8BMBU4DTwG3gH3gRPA5I4O3AWoJRvtwG6gc0cJqFWgN8B6YDDQFRgCbATaxO8EFgIXgDvAA+ASsAro8TfHHoJPyjPHUpIPD7PW5wVwShusz+AHAedcoHvAcmAY0B+YDzSJawVG5o8YQQVnGByN9wC2uOO3zSstNYk9ioCTmnclVwhAZ2AWUAV80sIix88EnroCPAL0LbBnsVtTlm/iDKA5TqDjxwLvNXwZmOC4PsACYAkwILH3Lq2rzAq+CPioSSaiOiGgXkP7gU7umlYpDQGfgeNAP7d2pbi9qeClwGtN2BjudELAbQ0N1fdo4JpLx0XgjKsN23Md0A3YrLENKQF1Io9G47GAkJ4RtpFLx1tgtps3UEIC7ssXDDPj4J2AFxnVHgu4qqEncZ1I3NKoYMuB626OFXVpLKC3yBeJk4kFmLMFmNtVKGhzlhBdQ/OG5+Jf/WRKQEkgEgJaxJXo+6y+rcCK3bwil8YAq5dpUZxQxCamtw/0SMS4SECDxvep2g/re1lC7GpxTe5EzKInRkIbxW3zi7dr8GKUw4nO55udra5OCFgm7pDE7gt7RvPGa/xhXAchR/XhyMVNc9cvoC4SWqy0GM5GqW1JFH3wjJ6eKFOBhBwtjwopq9gqVJABjW7Pr0ic1ktfW99hBuP8H12hcsenhBBdzav5BCiG4VlwU0/OEflA5hFgpjLQzZst80FmtEHm9PVkCgg4puGDPwUXucnZcTfZaLDoNl3DBtkusuHRWms9gOFWSoBOL9hx6y+GFLVfK9xYPxWYPTABLXqAurjCOiDulFsbUO3S9sFat1wKwFpN2pHgBgCLgXlALzc+QU8zurJjEgICbgLTk8ENwBRNfOqdLgVrQtSMtLs1FY63I0dFvUa3pXDnzI8H54S/647vqvar1f3qrXHnqyfe8KhgUA9glNu8SV2OteLDrTbUeAact8Y0Yx8rZMPJ3O8CmKRWOh/sl0/Jk8o2pefP/jkB3dVG2ftwF7ihazgX2CMRbfqlpRl/Vmr+KHghqMBqXAGmUBOuaYeBb/+KrOc317SU2LNu39mt97+GL2fjt/smHdlcAAAAAElFTkSuQmCC"
                  alt="chatgpt--v2"
                ></img>
                <span className="sr-only">ChatGPT</span>
              </a>

              {/* Claude: ChatGPT ki tarah URL se prompt prefill hota hai */}
              <a
                href={`https://claude.ai/new?q=${encodeURIComponent(prepaiSummaryPrompt)}`}
                target="_blank"
                rel="noopener noreferrer"
                title="Open the PrepAI summary prompt in Claude"
                aria-label="Open the PrepAI summary prompt in Claude"
                className="group w-12 h-12 rounded-full border-2 border-white/25 bg-white/5 hover:bg-[#D02020] hover:border-[#D02020] flex items-center justify-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F0C020] focus-visible:ring-offset-2 focus-visible:ring-offset-[#121212]"
              >
                <img
                  width="48"
                  height="48"
                  src="https://img.icons8.com/sf-regular-filled/48/FFFFFF/claude-ai.png"
                  alt="claude-ai"
                />
                <span className="sr-only">Claude</span>
              </a>

              {/* Gemini: URL prefill support nahi karta, isliye copy + open */}
              <a
                href={`https://www.google.com/search?udm=50&q=${encodeURIComponent(prepaiSummaryPrompt)}`}
                target="_blank"
                rel="noopener noreferrer"
                title="Open the PrepAI summary prompt in Google AI Mode"
                aria-label="Open the PrepAI summary prompt in Google AI Mode"
                className="group w-12 h-12 rounded-full border-2 border-white/25 bg-white/5 hover:bg-[#1040C0] hover:border-[#1040C0] flex items-center justify-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F0C020] focus-visible:ring-offset-2 focus-visible:ring-offset-[#121212]"
              >
                <img
                  width="30"
                  height="30"
                  src="https://img.icons8.com/ios-glyphs/30/FFFFFF/gemini-ai.png"
                  alt="gemini-ai"
                />
                <span className="sr-only">Gemini</span>
              </a>

              <div
                className="w-px h-8 bg-white/25 mx-1 hidden sm:block"
                aria-hidden="true"
              />

              <button
                type="button"
                onClick={() => copySummaryPrompt()}
                title="Copy the PrepAI summary prompt"
                aria-label="Copy the PrepAI summary prompt"
                className="w-12 h-12 rounded-full border-2 border-white/25 bg-white/5 hover:bg-white hover:border-white flex items-center justify-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F0C020] focus-visible:ring-offset-2 focus-visible:ring-offset-[#121212]"
              >
                {summaryStatus.startsWith("Prompt copied") ? (
                  <CheckCircle2
                    className="w-5 h-5 text-[#F0C020]"
                    aria-hidden="true"
                  />
                ) : (
                  <Copy className="w-5 h-5 text-white" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
          <p
            className="min-h-5 mt-4 text-center text-sm font-bold text-[#121212]/70"
            aria-live="polite"
          >
            {summaryStatus}
          </p>
        </div>
      </section>

      {/* =========================================================================
          11. FOOTER: Constructivist Stark Black Grounding
          ========================================================================= */}
      <footer className="bg-[#121212] text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 pb-12 border-b-2 border-white/20">
            {/* Brand column */}
            <div className="md:col-span-5">
              <div className="flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-[#D02020] shrink-0" />
                <span className="font-black tracking-tight text-2xl uppercase font-['Outfit'] text-white">
                  PREP<span className="text-[#D02020]">AI</span>
                </span>
              </div>

              <p className="mt-4 text-sm font-medium text-white/70 max-w-sm leading-relaxed">
                PrepAI helps developers understand their projects and prepare
                for technical interviews using repository-based analysis and AI.
              </p>
            </div>

            {/* Links Columns */}
            <div className="md:col-span-3">
              <h4 className="text-sm font-black uppercase tracking-widest text-[#F0C020] mb-4">
                Explore
              </h4>
              <ul className="space-y-2.5 text-sm font-bold uppercase tracking-wider text-white/70">
                <li>
                  <a
                    href="#how-it-works"
                    className="hover:text-white transition-colors"
                  >
                    How It Works
                  </a>
                </li>
                <li>
                  <a
                    href="#features"
                    className="hover:text-white transition-colors"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a
                    href="#architecture"
                    className="hover:text-white transition-colors"
                  >
                    Analysis Pipeline
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
              <h6
                className="w-full text-center text-2xl sm:text-3xl font-black uppercase tracking-[0.4em] text-white mb-12"
                style={{ color: "#FFFFFF" }}
              >
                Connect
              </h6>
              <div className="w-full flex flex-wrap items-center justify-center gap-5 sm:gap-6">
                <a
                  href="https://x.com/"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="X: jatinxkumar"
                  className="group inline-flex items-center justify-center p-2 text-white/60 hover:text-white transition-colors"
                >
                  <svg
                    viewBox="0 0 19 19"
                    className="w-9 h-9 brightness-0 invert opacity-60 group-hover:opacity-100"
                    aria-hidden="true"
                  >
                    <use href="/icons.svg#x-icon" />
                  </svg>
                </a>
                <a
                  href="https://github.com/jatinxkumar"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="GitHub: jatinxkumar"
                  className="group inline-flex items-center justify-center p-2 text-white/60 hover:text-white transition-colors"
                >
                  <svg
                    viewBox="0 0 19 19"
                    className="w-9 h-9 brightness-0 invert opacity-60 group-hover:opacity-100"
                    aria-hidden="true"
                  >
                    <use href="/icons.svg#github-icon" />
                  </svg>
                </a>
                <a
                  href="https://www.linkedin.com/in/jatinxkumar"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="LinkedIn: jatinxkumar"
                  className="group inline-flex items-center justify-center p-2 text-white/60 hover:text-white transition-colors"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="w-9 h-9 fill-current"
                    aria-hidden="true"
                  >
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.35V9h3.414v1.561h.049c.476-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 .002-4.124 2.062 2.062 0 0 1-.002 4.124zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </a>
                <a
                  href="https://www.instagram.com/___.jatinkumar.___/"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Instagram: ___.jatinkumar.___"
                  className="group inline-flex items-center justify-center p-2 text-white/60 hover:text-white transition-colors"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="w-9 h-9 fill-current"
                    aria-hidden="true"
                  >
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Copyright Row */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-bold uppercase tracking-wider text-white/60">
            <p>© {new Date().getFullYear()} PrepAI. All rights reserved.</p>
            <p className="font-mono text-[11px]">
              Your Code. Your Interview. Your Success.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
