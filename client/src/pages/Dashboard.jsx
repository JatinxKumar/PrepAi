import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import {
    BarChart3,
    BookOpen,
    BrainCircuit,
    Briefcase,
    Calendar,
    Check,
    CheckSquare,
    ChevronDown,
    ChevronRight,
    Download,
    ExternalLink,
    FileText,
    FileUp,
    GitCompare,
    History,
    LayoutDashboard,
    Lightbulb,
    Loader2,
    LogOut,
    MessageSquare,
    PlayCircle,
    RefreshCcw,
    Settings,
    Shield,
    Sparkles,
    Target,
    Trash2,
    Trophy,
    UploadCloud,
    Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AIResumeTailor from "../components/AIResumeTailor";
import SideRays from "../components/SideRays";
import useAuthStore from "../store/authStore";

const API_URL = import.meta.env.VITE_API_URL || "/api";


const HISTORY_KEY = "project-dna-history";

const readLocalHistory = () => {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
  } catch {
    return [];
  }
};

const saveLocalHistory = (projects) => {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(projects.slice(0, 50)));
};

const mergeHistory = (...groups) => {
  const seen = new Set();
  return groups
    .flat()
    .filter(Boolean)
    .filter((project) => {
      const key = project._id || project.repositoryUrl;
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
};

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("upload");
  const [analysisData, setAnalysisData] = useState(null);
  const [history, setHistory] = useState(() => readLocalHistory());
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingHistory, setIsFetchingHistory] = useState(false);
  const [projectPendingDelete, setProjectPendingDelete] = useState(null);
  const [resumeVersion, setResumeVersion] = useState(0);
  const { user, token, logout } = useAuthStore();
  const navigate = useNavigate();

  const tabs = [
    { id: "upload", label: "New Analysis", icon: UploadCloud },
    { id: "history", label: "History", icon: History },
    { id: "story", label: "Project Story", icon: BookOpen },
    { id: "analysis", label: "Analysis Results", icon: FileText },
    { id: "compare", label: "Compare Projects", icon: GitCompare },
    { id: "viva", label: "Viva Prep", icon: CheckSquare },

    { id: "resume", label: "Resume Vault", icon: Briefcase },
    { id: "interview", label: "Mock Interview", icon: MessageSquare },
  ];

  useEffect(() => {
    if (activeTab === "history") {
      fetchHistory();
    }
  }, [activeTab]);

  useEffect(() => {
    if (!isLoading) return;

    const intervalId = setInterval(fetchHistory, 5000);
    return () => clearInterval(intervalId);
  }, [isLoading, token]);

  const fetchHistory = async () => {
    const localHistory = readLocalHistory();
    if (localHistory.length) {
      setHistory(localHistory);
    }
    setIsFetchingHistory(localHistory.length === 0);
    try {
      const response = await axios.get(`${API_URL}/projects/user`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 4000,
      });
      const updatedHistory = mergeHistory(
        response.data.projects || [],
        localHistory,
      );
      setHistory(updatedHistory);
      saveLocalHistory(updatedHistory);
    } catch (error) {
      console.error("Failed to fetch history:", error);
      setHistory(localHistory);
    } finally {
      setIsFetchingHistory(false);
    }
  };

  const handleAnalyze = async (repoUrl) => {
    setIsLoading(true);
    try {
      const response = await axios.post(
        `${API_URL}/projects/analyze`,
        {
          repositoryUrl: repoUrl,
          name: repoUrl.split("/").pop().replace(".git", ""),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const completedProject = {
        ...response.data.project,
        _id: response.data.project?._id || `${Date.now()}-${repoUrl}`,
        createdAt: response.data.project?.createdAt || new Date().toISOString(),
      };
      setAnalysisData(completedProject);
      const updatedHistory = mergeHistory(
        [completedProject],
        history,
        readLocalHistory(),
      );
      setHistory(updatedHistory);
      saveLocalHistory(updatedHistory);
      fetchHistory();
      setActiveTab("story");
    } catch (error) {
      console.error("Analysis failed:", error);
      alert(error.response?.data?.error || "Failed to analyze project.");
    } finally {
      setIsLoading(false);
    }
  };

  const loadProjectFromHistory = (project) => {
    setAnalysisData(project);
    setActiveTab("story");
  };

  const handleDeleteHistoryItem = async (projectId) => {
    const localHistory = readLocalHistory();
    const nextHistory = localHistory.filter(
      (project) => project._id !== projectId,
    );
    setHistory(nextHistory);
    saveLocalHistory(nextHistory);

    if (analysisData?._id === projectId) {
      setAnalysisData(null);
      setActiveTab("history");
    }

    if (!projectId || String(projectId).includes("http")) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/projects/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (error) {
      console.error("Failed to delete history item:", error);
      fetchHistory();
    }
  };

  const requestDeleteHistoryItem = (project) => {
    setProjectPendingDelete(project);
  };

  const confirmDeleteHistoryItem = async () => {
    if (!projectPendingDelete) return;
    const projectId = projectPendingDelete._id;
    setProjectPendingDelete(null);
    await handleDeleteHistoryItem(projectId);
  };

  const handleLogout = () => {
    const shouldLogout = window.confirm("Are you sure you want to logout?");
    if (!shouldLogout) return;

    logout();
    navigate("/");
  };

  const handleDownloadPDF = () => {
    window.print();
  };

  return (
    <div className="flex h-screen bg-[#0b0f19] text-white overflow-hidden print:bg-white print:text-black">
      {/* Sidebar */}
      <motion.aside
        initial={{ x: -280 }}
        animate={{ x: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="w-64 border-r border-white/5 bg-black/40 backdrop-blur-md flex flex-col shrink-0 print:hidden"
      >
        <div className="p-6 border-b border-white/5">
          <Link to="/" className="flex items-center gap-2 group">
            <BrainCircuit className="text-purple-500 w-7 h-7 group-hover:scale-110 transition-transform" />
            <h2 className="text-2xl font-black font-sans tracking-tight">
              prepAi<span className="text-purple-500">.</span>
            </h2>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto custom-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 relative ${
                activeTab === tab.id
                  ? "bg-purple-500/20 text-purple-400 border border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.15)]"
                  : "text-gray-400 hover:bg-white/5 hover:text-white border border-transparent"
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span className="font-medium text-sm">{tab.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/5 relative group">
          <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors cursor-pointer">
            <div className="h-9 w-9 shrink-0 rounded-full bg-gradient-to-tr from-purple-600 to-fuchsia-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
              {user?.name ? user.name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase() : "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">
                {user?.name || "User"}
              </p>
            </div>
            <button className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors">
               <Settings className="w-4 h-4" />
            </button>
          </div>
          
          {/* Tooltip/Popover */}
          <div className="absolute bottom-full left-4 right-4 mb-2 bg-[#1a1b2e] border border-white/10 rounded-xl shadow-xl p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
             <p className="text-xs text-gray-400 truncate mb-3 px-1">{user?.email || "user@example.com"}</p>
             <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors text-sm font-medium"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
          </div>
        </div>
      </motion.aside>

      {/* Main Content Area */}

      <main className="flex-1 relative overflow-y-auto custom-scrollbar">
        <SideRays
          speed={1.5}
          rayColor1="#a855f7"
          rayColor2="#22d3ee"
          intensity={1.0}
          spread={1.5}
          origin="top-right"
          tilt={0}
          saturation={1.2}
          blend={0.5}
          falloff={1.8}
          opacity={0.3}
          className="absolute inset-0 z-0 pointer-events-none opacity-30"
        />
        <div className="p-8 max-w-6xl mx-auto min-h-full print:p-0">
          <div className="flex justify-between items-center mb-8 print:hidden">
            <div>
              <h1 className="text-3xl font-bold">
                {tabs.find((t) => t.id === activeTab)?.label}
              </h1>
              {analysisData &&
                activeTab !== "upload" &&
                activeTab !== "history" && (
                  <p className="text-gray-400 mt-1">
                    Viewing:{" "}
                    <span className="text-purple-400 font-medium">
                      {analysisData.name}
                    </span>
                  </p>
                )}
            </div>
            
            <div className="flex items-center gap-3">
              {analysisData && (
                <button
                  onClick={handleDownloadPDF}
                  className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-500 rounded-xl transition-all text-sm font-semibold shadow-lg shadow-purple-600/20"
                >
                  <Download className="w-4 h-4" /> Export PDF
                </button>
              )}
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === "upload" && (
                <UploadSection
                  onAnalyze={handleAnalyze}
                  isLoading={isLoading}
                />
              )}
              {activeTab === "history" && (
                <HistorySection
                  history={history}
                  isLoading={isFetchingHistory}
                  onSelect={loadProjectFromHistory}
                  onDelete={requestDeleteHistoryItem}
                />
              )}
              {activeTab === "story" && <StorySection data={analysisData} />}
              {activeTab === "analysis" && (
                <AnalysisSection data={analysisData} />
              )}
              {activeTab === "compare" && <CompareSection token={token} />}
              {activeTab === "viva" && <VivaSection data={analysisData} />}

              {activeTab === "resume" && <AIResumeTailor />}
              {activeTab === "interview" && (
                <MockInterviewSection data={analysisData} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <PlacementReportCard data={analysisData} />
      <ConfirmDialog
        open={Boolean(projectPendingDelete)}
        title="Delete history item?"
        description={
          projectPendingDelete
            ? `${projectPendingDelete.name} will be removed from your history.`
            : ""
        }
        confirmLabel="Delete"
        confirmTone="danger"
        onCancel={() => setProjectPendingDelete(null)}
        onConfirm={confirmDeleteHistoryItem}
      />

      <style>{`
        @media print {
          body { background: white !important; color: black !important; }
          main, aside, header, .print:hidden, .glass-card, .landing-page-container { display: none !important; }
          .print:block { display: block !important; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        }
      `}</style>
    </div>
  );
}

function HistorySection({ history, isLoading, onSelect, onDelete }) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="w-10 h-10 text-purple-500 animate-spin" />
        <p className="text-gray-400">Loading your history...</p>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="glass-card p-12 text-center rounded-3xl border-dashed border-2 border-white/10">
        <History className="w-12 h-12 text-gray-600 mx-auto mb-4" />
        <h3 className="text-xl font-bold mb-2">No History Yet</h3>
        <p className="text-gray-500">
          Analyze your first project to see it here!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {history.map((project) => (
        <motion.div
          key={project._id}
          whileHover={{ x: 10 }}
          className="glass-card p-6 rounded-2xl flex items-center justify-between group cursor-pointer border border-white/5 hover:border-purple-500/30 transition-all"
          onClick={() => onSelect(project)}
        >
          <div className="flex items-center gap-6">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
              <Code2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold group-hover:text-purple-400 transition-colors">
                {project.name}
              </h3>
              <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />{" "}
                  {new Date(project.createdAt).toLocaleDateString()}
                </span>
                <span className="flex items-center gap-1">
                  <ExternalLink className="w-3.5 h-3.5" />{" "}
                  {project.repositoryUrl.split("/").pop()}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(project);
              }}
              className="p-3 bg-white/5 rounded-xl hover:bg-red-500/20 hover:text-red-300 transition-all"
              title="Delete project"
            >
              <Trash2 className="w-5 h-5" />
            </button>
            <button className="p-3 bg-white/5 rounded-xl hover:bg-purple-500 hover:text-white transition-all">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

/* ─────────────────── UPLOAD SECTION ─────────────────── */
function UploadSection({ onAnalyze, isLoading }) {
  const [repoUrl, setRepoUrl] = useState("");
  const [toast, setToast] = useState(null);
  const [activeStage, setActiveStage] = useState(0);

  const pipelineStages = [
    {
      title: "Repo Scan",
      short: "Reading files",
      detail: "Finding entry points, folders, routes, and config.",
      icon: Code2,
      color: "text-blue-400",
      glow: "shadow-blue-500/20",
    },
    {
      title: "Story",
      short: "Building narrative",
      detail: "Turning raw code into a clear project explanation.",
      icon: BookOpen,
      color: "text-yellow-400",
      glow: "shadow-yellow-500/20",
    },
    {
      title: "Architecture",
      short: "Mapping system",
      detail: "Connecting frontend, backend, APIs, storage, and data flow.",
      icon: BrainCircuit,
      color: "text-purple-400",
      glow: "shadow-purple-500/20",
    },
    {
      title: "Viva",
      short: "Preparing defense",
      detail: "Creating sharp questions with answers tied to your repo.",
      icon: CheckSquare,
      color: "text-emerald-400",
      glow: "shadow-emerald-500/20",
    },
    {
      title: "Resume",
      short: "Writing proof",
      detail: "Converting features and ownership into resume-ready bullets.",
      icon: Briefcase,
      color: "text-orange-400",
      glow: "shadow-orange-500/20",
    },
    {
      title: "Demo",
      short: "Shaping walkthrough",
      detail: "Creating a tight flow for explaining the project live.",
      icon: PlayCircle,
      color: "text-pink-400",
      glow: "shadow-pink-500/20",
    },
    {
      title: "Interview",
      short: "Stress testing",
      detail: "Preparing follow-ups so weak spots show up early.",
      icon: MessageSquare,
      color: "text-cyan-400",
      glow: "shadow-cyan-500/20",
    },
  ];

  useEffect(() => {
    if (!isLoading) {
      setActiveStage(0);
      return;
    }

    const intervalId = setInterval(() => {
      setActiveStage((stage) => (stage + 1) % pipelineStages.length);
    }, 1400);

    return () => clearInterval(intervalId);
  }, [isLoading]);

  const showToast = (message, type = "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const githubRegex = /^https?:\/\/(www\.)?github\.com\/[\w-]+\/[\w.-]+\/?$/;

    if (!repoUrl.trim()) return;

    if (!githubRegex.test(repoUrl.trim())) {
      showToast("Please enter a valid GitHub Repository URL");
      return;
    }

    onAnalyze(repoUrl.trim());
  };

  return (
    <div className="space-y-8 relative">
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-2xl bg-red-500 text-white font-bold shadow-[0_10px_40px_rgba(239,68,68,0.4)] flex items-center gap-3 border border-red-400/50 backdrop-blur-md"
          >
            <Shield className="w-5 h-5" />
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="glass-card p-12 border-dashed border-2 border-white/15 hover:border-purple-500/50 transition-all duration-500 flex flex-col items-center justify-center text-center rounded-3xl group">
        <div className="w-20 h-20 bg-purple-500/10 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
          {isLoading ? (
            <Loader2 className="w-10 h-10 text-purple-400 animate-spin" />
          ) : (
            <UploadCloud className="w-10 h-10 text-purple-400" />
          )}
        </div>

        <h3 className="text-xl font-semibold mb-2">
          {isLoading
            ? "Agents are analyzing your code..."
            : "Paste your GitHub Repository URL"}
        </h3>
        <p className="text-gray-500 mb-8 max-w-md mx-auto">
          {isLoading
            ? "This may take 30–60 seconds while our 7 AI agents work."
            : "Analyze any repository to generate your personalized placement kit."}
        </p>

        <form
          onSubmit={handleSubmit}
          className="flex w-full max-w-lg bg-black/50 rounded-full p-1.5 border border-white/10 focus-within:border-purple-500/50 focus-within:shadow-[0_0_20px_rgba(168,85,247,0.15)] transition-all"
        >
          <input
            type="text"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            placeholder="https://github.com/username/repo"
            className="flex-1 bg-transparent border-none outline-none px-6 text-sm text-white placeholder-gray-600"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !repoUrl.trim()}
            className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-2.5 rounded-full font-semibold transition-colors text-sm flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Analyzing
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" /> Analyze
              </>
            )}
          </button>
        </form>
      </div>

      {isLoading && (
        <AgentPipeline stages={pipelineStages} activeStage={activeStage} />
      )}
    </div>
  );
}

function AgentPipeline({ stages, activeStage }) {
  const currentStage = stages[activeStage];
  const CurrentIcon = currentStage.icon;

  return (
    <div className="glass-card rounded-3xl border border-white/5 overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="p-6 md:p-8">
          <div className="flex items-center justify-between gap-4 mb-8">
            <div>
              <p className="text-xs uppercase tracking-widest text-purple-300 font-semibold">
                Live analysis
              </p>
              <h3 className="text-2xl font-bold mt-1">
                Building your project kit
              </h3>
            </div>
            <div className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-gray-300">
              {activeStage + 1}/{stages.length}
            </div>
          </div>

          <div className="relative">
            <div className="absolute left-6 right-6 top-6 h-px bg-white/10 hidden md:block" />
            <div
              className="absolute left-6 top-6 h-px bg-purple-500 hidden md:block transition-all duration-500"
              style={{ width: `${(activeStage / (stages.length - 1)) * 100}%` }}
            />

            <div className="grid grid-cols-2 md:grid-cols-7 gap-3 relative">
              {stages.map((stage, index) => {
                const Icon = stage.icon;
                const isDone = index < activeStage;
                const isActive = index === activeStage;

                return (
                  <button
                    key={stage.title}
                    type="button"
                    className={`group min-h-28 rounded-2xl border p-3 text-left transition-all ${
                      isActive
                        ? `bg-white/10 border-purple-400/60 shadow-xl ${stage.glow}`
                        : isDone
                          ? "bg-emerald-500/10 border-emerald-500/20"
                          : "bg-black/20 border-white/5 opacity-70"
                    }`}
                  >
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center mb-3 ${
                        isActive
                          ? "bg-purple-500/20"
                          : isDone
                            ? "bg-emerald-500/15"
                            : "bg-white/5"
                      }`}
                    >
                      {isDone ? (
                        <Check className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <Icon
                          className={`w-5 h-5 ${isActive ? stage.color : "text-gray-500"}`}
                        />
                      )}
                    </div>
                    <p className="font-semibold text-sm text-white">
                      {stage.title}
                    </p>
                    <p className="text-[11px] text-gray-500 mt-1 leading-snug">
                      {stage.short}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="border-t lg:border-t-0 lg:border-l border-white/5 bg-black/20 p-6 md:p-8 flex flex-col justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStage.title}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
            >
              <div
                className={`w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-5 ${currentStage.color}`}
              >
                <CurrentIcon className="w-8 h-8" />
              </div>
              <p className="text-sm text-gray-500 mb-1">Now working on</p>
              <h4 className="text-3xl font-bold mb-3">{currentStage.title}</h4>
              <p className="text-gray-300 leading-relaxed">
                {currentStage.detail}
              </p>
              <div className="mt-6 h-2 rounded-full bg-white/5 overflow-hidden">
                <motion.div
                  key={activeStage}
                  className="h-full bg-purple-500"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 1.3, ease: "linear" }}
                />
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────── STORY SECTION ─────────────────── */
function StorySection({ data }) {
  if (!data)
    return (
      <EmptyState
        title="Project Story"
        message="Analyze a repo to build your project story."
      />
    );
  const story = (data.analysis?.explanation || "Building your project story...")
    .replace(/\*\*/g, "")
    .replace(/={3,}/g, "")
    .replace(/-{3,}/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  const improvements = cleanGeneratedText(
    data.analysis?.improvements || "No suggestions available.",
  );
  const demoScript = cleanGeneratedText(
    data.analysis?.demoScript || "Demo flow not ready yet.",
  );

  return (
    <div className="space-y-8">
      <div className="glass-card p-8 rounded-3xl border border-white/5">
        <div className="flex items-start justify-between gap-6">
          <div>
            <p className="text-xs uppercase tracking-widest text-yellow-300 font-semibold mb-3">
              Project story
            </p>
            <h3 className="text-3xl font-bold mb-4">{data.name}</h3>
            <p className="text-gray-300 text-lg leading-relaxed max-w-3xl">
              {getShortText(story, 360)}
            </p>
          </div>
          <div className="hidden md:flex w-16 h-16 rounded-2xl bg-yellow-500/10 text-yellow-400 items-center justify-center shrink-0">
            <BookOpen className="w-8 h-8" />
          </div>
        </div>
        {story.length > 360 && (
          <ExpandableText text={story} label="Full story" />
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ResultCard
          title="Key Improvements"
          color="text-cyan-400"
          icon={Lightbulb}
        >
          <PointList points={extractUsefulPoints(improvements).slice(0, 4)} />
        </ResultCard>

        <ResultCard title="Demo Flow" color="text-pink-400" icon={PlayCircle}>
          <PointList points={extractUsefulPoints(demoScript).slice(0, 4)} />
        </ResultCard>
      </div>
    </div>
  );
}

/* ─────────────────── ANALYSIS SECTION ─────────────────── */
function AnalysisSection({ data }) {
  if (!data)
    return (
      <EmptyState
        title="Analysis Results"
        message="Analyze a repo to see the technical breakdown."
      />
    );
  const overview = cleanGeneratedText(data.analysis?.overview || "No data.");
  const architecture = cleanGeneratedText(
    data.analysis?.architecture || "No data.",
  );
  const overviewPoints = extractUsefulPoints(overview);
  const architecturePoints = extractUsefulPoints(architecture);
  const healthScore = getProjectHealthScore(data);

  return (
    <div className="space-y-6">
      <ProjectHealthPanel score={healthScore} />
      <MaintainabilityGraph score={healthScore.overall} />

      <div className="glass-card p-8 rounded-3xl border border-white/5">
        <div className="flex items-start justify-between gap-6 mb-8">
          <div>
            <p className="text-xs uppercase tracking-widest text-blue-300 font-semibold mb-3">
              Analysis snapshot
            </p>
            <h3 className="text-3xl font-bold mb-3">{data.name}</h3>
            <p className="text-gray-300 text-lg leading-relaxed max-w-3xl">
              {getShortText(overview, 300)}
            </p>
          </div>
          <div className="hidden md:flex w-16 h-16 rounded-2xl bg-blue-500/10 text-blue-400 items-center justify-center shrink-0">
            <LayoutDashboard className="w-8 h-8" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {overviewPoints.slice(0, 3).map((point, i) => (
            <InsightTile key={i} index={i + 1} text={point} />
          ))}
        </div>
        <ExpandableText text={overview} label="Full technical notes" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-6">
        <ResultCard title="Tech Stack" color="text-emerald-400" icon={FileText}>
          <div className="flex flex-wrap gap-2">
            {(data.analysis?.techStack || []).map((tech, i) => (
              <span
                key={i}
                className="px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-300 text-sm font-medium"
              >
                {tech}
              </span>
            ))}
          </div>
        </ResultCard>

        <div className="glass-card p-8 rounded-3xl border border-white/5">
          <h3 className="text-xl font-bold mb-6 text-purple-400 flex items-center gap-3">
            <BrainCircuit className="w-6 h-6" /> Architecture Flow
          </h3>
          <ArchitectureFlow />
        </div>
      </div>

      <div className="glass-card p-8 rounded-3xl border border-white/5">
        <h3 className="text-xl font-bold mb-5 text-purple-400 flex items-center gap-3">
          <BrainCircuit className="w-6 h-6" /> Architecture Notes
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {architecturePoints.slice(0, 4).map((point, i) => (
            <div
              key={i}
              className="p-4 rounded-2xl bg-white/5 border border-white/5"
            >
              <p className="text-sm text-gray-300 leading-relaxed">{point}</p>
            </div>
          ))}
        </div>
        <ExpandableText text={architecture} label="Full architecture" />
      </div>
    </div>
  );
}

function CompareSection({ token }) {
  const [projectAUrl, setProjectAUrl] = useState("");
  const [projectBUrl, setProjectBUrl] = useState("");
  const [result, setResult] = useState(null);
  const [isComparing, setIsComparing] = useState(false);

  const handleCompare = async (e) => {
    e.preventDefault();
    if (!projectAUrl.trim() || !projectBUrl.trim()) return;

    setIsComparing(true);
    try {
      const response = await axios.post(
        `${API_URL}/projects/compare`,
        {
          projectAUrl: projectAUrl.trim(),
          projectBUrl: projectBUrl.trim(),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setResult(response.data);
    } catch (error) {
      alert(error.response?.data?.error || "Failed to compare projects.");
    } finally {
      setIsComparing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="glass-card p-8 rounded-3xl border border-white/5">
        <div className="flex items-start justify-between gap-6 mb-8">
          <div>
            <p className="text-xs uppercase tracking-widest text-purple-300 font-semibold mb-3">
              Project battle
            </p>
            <h3 className="text-3xl font-bold mb-3">Compare two repos</h3>
            <p className="text-gray-400 max-w-2xl">
              Paste two GitHub URLs. The system scores structure, tools, quality
              signals, and production readiness.
            </p>
          </div>
          <GitCompare className="w-12 h-12 text-purple-400 hidden md:block" />
        </div>

        <form
          onSubmit={handleCompare}
          className="grid grid-cols-1 lg:grid-cols-[1fr_1fr_auto] gap-4"
        >
          <input
            value={projectAUrl}
            onChange={(e) => setProjectAUrl(e.target.value)}
            placeholder="Project A GitHub URL"
            className="bg-black/50 border border-white/10 rounded-2xl px-5 py-4 text-sm outline-none focus:border-purple-500/50"
          />
          <input
            value={projectBUrl}
            onChange={(e) => setProjectBUrl(e.target.value)}
            placeholder="Project B GitHub URL"
            className="bg-black/50 border border-white/10 rounded-2xl px-5 py-4 text-sm outline-none focus:border-purple-500/50"
          />
          <button
            type="submit"
            disabled={isComparing || !projectAUrl.trim() || !projectBUrl.trim()}
            className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 px-7 py-4 rounded-2xl font-semibold flex items-center justify-center gap-2"
          >
            {isComparing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trophy className="w-4 h-4" />
            )}
            Compare
          </button>
        </form>
      </div>

      {result && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <CompareProjectCard
              label="Project A"
              project={result.projectA}
              isWinner={result.winner === "A"}
            />
            <CompareProjectCard
              label="Project B"
              project={result.projectB}
              isWinner={result.winner === "B"}
            />
          </div>

          <div className="glass-card p-8 rounded-3xl border border-white/5">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
              <BarChart3 className="w-6 h-6 text-purple-400" /> Metric winners
            </h3>
            <div className="space-y-5">
              {result.metrics.map((metric) => (
                <div
                  key={metric.key}
                  className="grid grid-cols-1 md:grid-cols-[150px_1fr_80px_1fr_80px] gap-3 items-center"
                >
                  <p className="font-semibold text-gray-200">{metric.label}</p>
                  <ScoreBar value={metric.projectA} color="bg-blue-500" />
                  <p className="text-sm text-blue-300 font-bold">
                    {metric.projectA}
                  </p>
                  <ScoreBar value={metric.projectB} color="bg-purple-500" />
                  <p className="text-sm text-purple-300 font-bold">
                    {metric.projectB}
                  </p>
                  <p className="md:col-span-5 text-sm text-gray-500">
                    {metric.winner === "Tie"
                      ? "Tie"
                      : `Project ${metric.winner} wins ${metric.label}`}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────── VIVA SECTION ─────────────────── */
function VivaSection({ data }) {
  const [expandedIndex, setExpandedIndex] = useState(null);

  if (!data?.vivaPrep?.length)
    return (
      <EmptyState
        title="Viva Prep"
        message="Analyze a project first to generate viva questions."
      />
    );

  return (
    <div className="space-y-4">
      {data.vivaPrep.map((item, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="glass-card rounded-2xl overflow-hidden border border-white/5"
        >
          <button
            onClick={() => setExpandedIndex(expandedIndex === i ? null : i)}
            className="w-full flex items-center justify-between p-6 text-left hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-4">
              <span className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 text-sm font-bold shrink-0">
                Q{i + 1}
              </span>
              <span className="font-medium text-lg">{item.question}</span>
            </div>
            {expandedIndex === i ? (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronRight className="w-5 h-5 text-gray-400" />
            )}
          </button>
          <AnimatePresence>
            {expandedIndex === i && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="px-6 pb-6 border-t border-white/5 pt-4">
                  <p className="text-gray-300 text-sm leading-relaxed bg-white/5 p-4 rounded-xl border border-white/5">
                    {item.answer}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}
    </div>
  );
}

/* ─────────────────── MOCK INTERVIEW SECTION ─────────────────── */
function MockInterviewSection({ data }) {
  const [messages, setMessages] = useState([
    {
      sender: "ai",
      message: data
        ? `You built "${data.name}". Start with the architecture: what are the main parts, and what problem does this solve?`
        : "Analyze a repo first, then this interview will use your actual project.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);

  // Voice Simulator State
  const [isRecording, setIsRecording] = useState(false);
  const [speakQuestions, setSpeakQuestions] = useState(true);

  const interviewQuestions = [
    `What problem does ${data?.name || "this project"} solve, and who is it for?`,
    "Walk me through the main user flow from first screen to final action.",
    "Where does the core logic live in the codebase?",
    "How does data move between UI, API, and storage?",
    "What was one tradeoff you made while building it?",
    "What would break first if 1,000 users used this at the same time?",
    "What security or validation checks are important here?",
    "What would you improve if you had one more week?",
  ];

  // Speak AI questions
  useEffect(() => {
    if (!speakQuestions || messages.length === 0) return;
    const lastMsg = messages[messages.length - 1];
    if (lastMsg.sender === "ai") {
      try {
        const utterance = new SpeechSynthesisUtterance(lastMsg.message);
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);
      } catch (e) {
        console.error("Text-to-speech error:", e);
      }
    }
  }, [messages, speakQuestions]);

  // Speech Recognition (Voice to Text)
  const handleVoiceInput = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert(
        "Speech recognition is not supported in this browser. Please try Chrome.",
      );
      return;
    }

    if (isRecording) {
      setIsRecording(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onstart = () => setIsRecording(true);
    recognition.onresult = (event) => {
      const speechText = event.results[0][0].transcript;
      setInput(speechText);
      setIsRecording(false);
    };
    recognition.onerror = () => setIsRecording(false);
    recognition.onend = () => setIsRecording(false);
    recognition.start();
  };

  const getInterviewReply = (answer, nextIndex) => {
    const normalized = answer.toLowerCase();
    const isWeakAnswer =
      answer.trim().length < 20 ||
      ["no", "nothing", "idk", "dont know", "don't know"].some((word) =>
        normalized.includes(word),
      );

    if (isWeakAnswer) {
      return `That answer will not land in an interview. Try this structure: problem, your role, one technical decision, and one result. Let's retry: ${interviewQuestions[nextIndex]}`;
    }

    if (
      normalized.includes("react") ||
      normalized.includes("frontend") ||
      normalized.includes("ui")
    ) {
      return `Good, you touched the frontend. Now go one layer deeper: ${interviewQuestions[nextIndex]}`;
    }

    if (
      normalized.includes("supabase") ||
      normalized.includes("database") ||
      normalized.includes("api") ||
      normalized.includes("backend")
    ) {
      return `Nice, that gives me the data side. Now defend the decision: ${interviewQuestions[nextIndex]}`;
    }

    return `Good. Now let's test the next part: ${interviewQuestions[nextIndex]}`;
  };

  const handleSend = (e) => {
    if (e) e.preventDefault();
    if (!input.trim() || !data) return;

    const userMsg = input.trim();
    setMessages((prev) => [...prev, { sender: "user", message: userMsg }]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const nextIndex = (questionIndex + 1) % interviewQuestions.length;
      const reply = getInterviewReply(userMsg, nextIndex);
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          message: reply,
        },
      ]);
      setQuestionIndex(nextIndex);
    }, 800);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-220px)]">
      {/* Simulation options */}
      <div className="flex items-center justify-between mb-4 bg-white/5 border border-white/5 p-4 rounded-2xl">
        <div className="flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-purple-500"></span>
          </span>
          <span className="text-sm font-semibold text-gray-300">
            Mock Simulator Active
          </span>
        </div>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-xs font-semibold text-gray-400 cursor-pointer">
            <input
              type="checkbox"
              checked={speakQuestions}
              onChange={(e) => setSpeakQuestions(e.target.checked)}
              className="rounded bg-black/35 border-white/10 text-purple-600 focus:ring-0 w-4 h-4"
            />
            Speak Questions (TTS)
          </label>
        </div>
      </div>

      <div className="flex-1 glass-card p-6 rounded-3xl flex flex-col gap-4 overflow-hidden relative border border-white/5">
        <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-4 ${msg.sender === "user" ? "flex-row-reverse" : ""}`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${msg.sender === "ai" ? "bg-purple-500/20" : "bg-blue-500/20"}`}
              >
                {msg.sender === "ai" ? (
                  <MessageSquare className="w-5 h-5 text-purple-400" />
                ) : (
                  <span className="font-bold text-blue-400">U</span>
                )}
              </div>
              <div
                className={`p-5 rounded-2xl max-w-2xl text-sm leading-relaxed ${
                  msg.sender === "ai"
                    ? "bg-white/5 rounded-tl-none border border-white/5 text-gray-200"
                    : "bg-purple-600/20 rounded-tr-none border border-purple-500/20 text-gray-200 text-right"
                }`}
              >
                {msg.message}
              </div>
            </motion.div>
          ))}
          {isTyping && (
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0">
                <MessageSquare className="w-5 h-5 text-purple-400" />
              </div>
              <div className="bg-white/5 p-4 rounded-2xl rounded-tl-none border border-white/5 flex gap-1 items-center">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce" />
                <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce [animation-delay:0.2s]" />
                <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          )}
        </div>

        <form
          onSubmit={handleSend}
          className="mt-6 relative print:hidden flex gap-3"
        >
          <div className="relative flex-1">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={!data}
              placeholder={
                data
                  ? isRecording
                    ? "Listening to your voice..."
                    : "Type or speak your answer..."
                  : "Analyze a repo to start"
              }
              className={`w-full bg-black/60 border ${isRecording ? "border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.2)]" : "border-white/10"} focus:border-purple-500/50 rounded-2xl px-6 py-4 pr-16 text-sm text-white placeholder-gray-500 focus:outline-none transition-all`}
            />
            {/* Mic button */}
            <button
              type="button"
              onClick={handleVoiceInput}
              disabled={!data}
              className={`absolute right-4 top-1/2 -translate-y-1/2 p-2.5 rounded-xl transition-all ${
                isRecording
                  ? "bg-red-500/20 text-red-400 animate-pulse border border-red-500/30"
                  : "text-gray-400 hover:text-white bg-white/5"
              }`}
              title="Voice to Text Input"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" x2="12" y1="19" y2="22" />
              </svg>
            </button>
          </div>
          <button
            type="submit"
            disabled={!input.trim() || !data}
            className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white px-6 rounded-xl font-bold transition-all text-sm flex items-center gap-2 shrink-0"
          >
            Send <Sparkles className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}

/* ─────────────────── PLACEMENT REPORT CARD FOR PRINT ─────────────────── */
function PlacementReportCard({ data }) {
  if (!data) return null;
  const healthScore = getProjectHealthScore(data);
  const overview = cleanGeneratedText(data.analysis?.overview || "");
  const architecture = cleanGeneratedText(data.analysis?.architecture || "");
  const explanation = (data.analysis?.explanation || "")
    .replace(/\*\*/g, "")
    .replace(/={3,}/g, "")
    .replace(/-{3,}/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  const techStack = data.analysis?.techStack || [];

  return (
    <div className="hidden print:block p-10 bg-white text-black min-h-screen font-sans border-[12px] border-double border-purple-600/30">
      {/* Header */}
      <div className="border-b-4 border-purple-600 pb-6 mb-8 flex justify-between items-end">
        <div>
          <p className="text-purple-600 text-xs font-bold uppercase tracking-widest font-mono">
            prepAi VERIFIED PREPARATION
          </p>
          <h1 className="text-4xl font-extrabold mt-1 tracking-tight text-gray-900">
            {data.name}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Verified Technical Capability & Placement Readiness Certificate
          </p>
        </div>
        <div className="text-right">
          <div className="bg-purple-600 text-white px-5 py-3 rounded-2xl inline-block shadow-md">
            <p className="text-[10px] uppercase font-bold tracking-wider font-mono">
              Overall Readiness
            </p>
            <p className="text-3xl font-black">
              {healthScore.overall}{" "}
              <span className="text-xs font-normal">/ 100</span>
            </p>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        <div className="border border-gray-200 rounded-2xl p-5 bg-gray-50">
          <h3 className="font-bold text-gray-800 border-b pb-2 mb-3">
            Code maintainability & quality
          </h3>
          <div className="space-y-2.5">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Performance Index</span>
              <span className="font-bold text-gray-900">
                {healthScore.performance}/100
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Code Quality Score</span>
              <span className="font-bold text-gray-900">
                {healthScore.codeQuality}/100
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Architecture Scalability</span>
              <span className="font-bold text-gray-900">
                {healthScore.scalability}/100
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">UI/UX Quality</span>
              <span className="font-bold text-gray-900">
                {healthScore.uiux}/100
              </span>
            </div>
          </div>
        </div>

        <div className="border border-gray-200 rounded-2xl p-5 bg-gray-50 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-gray-800 border-b pb-2 mb-3">
              Technology Stack
            </h3>
            <div className="flex flex-wrap gap-2 mt-2">
              {techStack.map((tech, i) => (
                <span
                  key={i}
                  className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-semibold"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-bold text-gray-800 border-b pb-2 mb-3">
            Executive project narrative
          </h3>
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
            {explanation || overview}
          </p>
        </div>

        <div>
          <h3 className="text-lg font-bold text-gray-800 border-b pb-2 mb-3">
            Technical architecture & flow
          </h3>
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
            {architecture}
          </p>
        </div>

        <div>
          <h3 className="text-lg font-bold text-gray-800 border-b pb-2 mb-3">
            Recruiter highlights
          </h3>
          <div className="grid grid-cols-2 gap-4 mt-2">
            {(healthScore.signals || []).map((signal, i) => (
              <div
                key={i}
                className="flex items-start gap-2 text-sm text-gray-600"
              >
                <span className="text-purple-600 font-bold">•</span>
                <span>{signal}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 mt-12 pt-6 flex justify-between items-center text-xs text-gray-400">
        <p>Generated by prepAi operating system</p>
        <p>© {new Date().getFullYear()} prepAi Inc. All rights reserved.</p>
      </div>
    </div>
  );
}

/* ─────────────────── SHARED COMPONENTS ─────────────────── */
function cleanGeneratedText(text = "") {
  return String(text)
    .replace(/\*\*/g, "")
    .replace(/={3,}/g, "")
    .replace(/-{3,}/g, "")
    .replace(/^\s*#+\s*/gm, "")
    .replace(/^\s*\d+\.\s*/gm, "")
    .replace(/^\s*[-*]\s*/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function getProjectHealthScore(project) {
  const saved = project?.analysis?.healthScore;
  if (saved?.overall) return saved;

  const text =
    `${project?.analysis?.overview || ""} ${project?.analysis?.architecture || ""}`.toLowerCase();
  const stack = project?.analysis?.techStack || [];
  const has = (word) =>
    text.includes(word) ||
    stack.some((tech) => tech.toLowerCase().includes(word));
  const performance = Math.min(
    95,
    58 + (has("vite") ? 10 : 0) + (has("query") ? 8 : 0) + stack.length * 2,
  );
  const codeQuality = Math.min(
    95,
    56 +
      (has("typescript") ? 12 : 0) +
      (has("test") ? 10 : 0) +
      (has("component") ? 6 : 0),
  );
  const scalability = Math.min(
    95,
    54 +
      (has("supabase") || has("mongodb") || has("database") ? 12 : 0) +
      (has("api") ? 8 : 0),
  );
  const uiux = Math.min(
    95,
    60 +
      (has("tailwind") ? 10 : 0) +
      (has("radix") ? 8 : 0) +
      (has("react") ? 5 : 0),
  );
  const overall = Math.round(
    (performance + codeQuality + scalability + uiux) / 4,
  );

  return {
    overall,
    performance,
    codeQuality,
    scalability,
    uiux,
    signals: [
      has("typescript")
        ? "Typed codebase signal found"
        : "Type safety can be stronger",
      has("test") ? "Testing signal found" : "Testing setup not obvious",
      has("database") || has("supabase") || has("mongodb")
        ? "Data layer detected"
        : "Data layer not obvious",
      has("tailwind") || has("radix")
        ? "Modern UI tooling detected"
        : "UI system can be stronger",
    ],
  };
}

function GaugeChart({ score }) {
  const percentage = score / 100;
  const needleRotation = -90 + percentage * 180;

  let scoreColor = "text-red-400";
  let trackColor = "stroke-red-500";
  let zoneText = "LEGACY CODE";
  if (score >= 85) {
    scoreColor = "text-emerald-400";
    trackColor = "stroke-emerald-400";
    zoneText = "MAINTAINABLE";
  } else if (score >= 70) {
    scoreColor = "text-cyan-400";
    trackColor = "stroke-cyan-400";
    zoneText = "MODERATE";
  } else if (score >= 50) {
    scoreColor = "text-amber-400";
    trackColor = "stroke-amber-400";
    zoneText = "REFACTOR RECOMMEND";
  }

  return (
    <div className="relative flex flex-col items-center justify-center">
      <svg className="w-48 h-28" viewBox="0 0 100 50">
        <defs>
          <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f87171" />
            <stop offset="50%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#34d399" />
          </linearGradient>
        </defs>
        <path
          d="M 15 50 A 35 35 0 0 1 85 50"
          fill="none"
          stroke="rgba(255, 255, 255, 0.08)"
          strokeWidth="8"
          strokeLinecap="round"
        />
        <path
          d="M 15 50 A 35 35 0 0 1 85 50"
          fill="none"
          stroke="url(#gaugeGrad)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray="110"
          strokeDashoffset={110 - percentage * 110}
          className="transition-all duration-1000 ease-out"
        />
        <circle cx="50" cy="50" r="4" fill="#a855f7" />
        <line
          x1="50"
          y1="50"
          x2="50"
          y2="20"
          stroke="#ffffff"
          strokeWidth="2.5"
          strokeLinecap="round"
          transform={`rotate(${needleRotation} 50 50)`}
          className="transition-transform duration-1000 ease-out"
        />
      </svg>
      <div className="text-center -mt-2">
        <span className="text-3xl font-black text-white">{score}</span>
        <span className="text-xs text-gray-500 font-bold">/100</span>
        <p
          className={`text-[10px] font-bold tracking-wider mt-1 ${scoreColor}`}
        >
          {zoneText}
        </p>
      </div>
    </div>
  );
}

function MaintainabilityGraph({ score }) {
  const dataPoints = [
    Math.round(score * 0.92),
    Math.round(score * 0.95),
    Math.round(score * 0.94),
    Math.round(score * 0.97),
    score,
  ];

  const width = 500;
  const height = 150;
  const padding = 30;

  const points = dataPoints.map((val, idx) => {
    const x = padding + (idx * (width - 2 * padding)) / (dataPoints.length - 1);
    const y = height - padding - (val / 100) * (height - 2 * padding);
    return { x, y, value: val };
  });

  const pathD =
    `M ${points[0].x} ${points[0].y} ` +
    points
      .slice(1)
      .map((p) => `L ${p.x} ${p.y}`)
      .join(" ");
  const areaD = `${pathD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

  return (
    <div className="glass-card p-6 rounded-3xl border border-white/5 bg-black/40">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="font-bold text-lg text-white">
            Code Maintainability Graph
          </h4>
          <p className="text-xs text-gray-500">
            Historical scoring over latest iterations
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-cyan-400" />
          <span className="text-xs text-gray-400 font-medium">
            Maintainability Index
          </span>
        </div>
      </div>
      <div className="relative w-full overflow-hidden">
        <svg className="w-full h-auto" viewBox={`0 0 ${width} ${height}`}>
          <defs>
            <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(34, 211, 238, 0.3)" />
              <stop offset="100%" stopColor="rgba(34, 211, 238, 0)" />
            </linearGradient>
          </defs>
          {[20, 40, 60, 80, 100].map((gridVal) => {
            const y =
              height - padding - (gridVal / 100) * (height - 2 * padding);
            return (
              <g key={gridVal}>
                <line
                  x1={padding}
                  y1={y}
                  x2={width - padding}
                  y2={y}
                  stroke="rgba(255,255,255,0.05)"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
                <text
                  x={padding - 10}
                  y={y + 4}
                  fill="rgba(255,255,255,0.3)"
                  fontSize="9"
                  textAnchor="end"
                >
                  {gridVal}
                </text>
              </g>
            );
          })}
          <path d={areaD} fill="url(#areaGrad)" />
          <path
            d={pathD}
            fill="none"
            stroke="#22d3ee"
            strokeWidth="3"
            strokeLinecap="round"
          />
          {points.map((p, idx) => (
            <g key={idx} className="group">
              <circle
                cx={p.x}
                cy={p.y}
                r="5"
                fill="#0d1220"
                stroke="#22d3ee"
                strokeWidth="2.5"
              />
              <circle
                cx={p.x}
                cy={p.y}
                r="8"
                fill="#22d3ee"
                className="opacity-0 hover:opacity-20 transition-opacity"
              />
              <rect
                x={p.x - 18}
                y={p.y - 25}
                width="36"
                height="18"
                rx="4"
                fill="#a855f7"
                className="opacity-80"
              />
              <text
                x={p.x}
                y={p.y - 13}
                fill="#fff"
                fontSize="9"
                fontWeight="bold"
                textAnchor="middle"
              >
                {p.value}
              </text>
            </g>
          ))}
          {["Commit 1", "Commit 2", "Commit 3", "Commit 4", "Latest"].map(
            (label, idx) => {
              const x = padding + (idx * (width - 2 * padding)) / 4;
              return (
                <text
                  key={idx}
                  x={x}
                  y={height - 8}
                  fill="rgba(255,255,255,0.4)"
                  fontSize="9"
                  textAnchor="middle"
                >
                  {label}
                </text>
              );
            },
          )}
        </svg>
      </div>
    </div>
  );
}

function ProjectHealthPanel({ score }) {
  const metrics = [
    { label: "Performance", value: score.performance, color: "bg-blue-500" },
    {
      label: "Code Quality",
      value: score.codeQuality,
      color: "bg-emerald-500",
    },
    { label: "Scalability", value: score.scalability, color: "bg-purple-500" },
    { label: "UI/UX", value: score.uiux, color: "bg-pink-500" },
  ];

  return (
    <div className="glass-card p-8 rounded-3xl border border-white/5 overflow-hidden relative">
      <div className="absolute inset-y-0 right-0 w-1/3 bg-purple-500/5 pointer-events-none" />
      <div className="relative grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8">
        <div className="flex flex-col items-center justify-center rounded-3xl bg-black/30 border border-white/5 p-6">
          <p className="text-xs uppercase tracking-widest text-purple-300 font-semibold mb-4">
            Project health score
          </p>
          <GaugeChart score={score.overall} />
        </div>

        <div>
          <div className="flex items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-2xl font-bold">Engineering signals</h3>
              <p className="text-gray-500 text-sm mt-1">
                Scored from repo structure, tools, dependencies, and analysis
                signals.
              </p>
            </div>
            <BarChart3 className="w-9 h-9 text-purple-400" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {metrics.map((metric) => (
              <div
                key={metric.label}
                className="p-4 rounded-2xl bg-white/5 border border-white/5"
              >
                <div className="flex justify-between text-sm mb-3">
                  <span className="text-gray-300 font-medium">
                    {metric.label}
                  </span>
                  <span className="font-bold">{metric.value}</span>
                </div>
                <ScoreBar value={metric.value} color={metric.color} />
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-5">
            {(score.signals || []).slice(0, 4).map((signal) => (
              <div
                key={signal}
                className="flex items-center gap-2 text-sm text-gray-300"
              >
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                {signal}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ScoreBar({ value, color = "bg-purple-500" }) {
  return (
    <div className="h-2.5 rounded-full bg-white/10 overflow-hidden">
      <motion.div
        className={`h-full rounded-full ${color}`}
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      />
    </div>
  );
}

function CompareProjectCard({ label, project, isWinner }) {
  return (
    <div
      className={`glass-card p-7 rounded-3xl border ${isWinner ? "border-emerald-400/40" : "border-white/5"}`}
    >
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <p className="text-xs uppercase tracking-widest text-gray-500 font-semibold">
            {label}
          </p>
          <h3 className="text-xl font-bold mt-2">{project.name}</h3>
        </div>
        {isWinner && (
          <div className="px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-300 text-xs font-bold flex items-center gap-1">
            <Trophy className="w-3.5 h-3.5" /> Winner
          </div>
        )}
      </div>
      <div className="flex items-end gap-3 mb-5">
        <span className="text-5xl font-black">{project.score.overall}</span>
        <span className="text-gray-500 mb-2">/ 100</span>
      </div>
      <ScoreBar
        value={project.score.overall}
        color={isWinner ? "bg-emerald-500" : "bg-purple-500"}
      />
    </div>
  );
}

function getShortText(text, maxLength) {
  if (!text || text.length <= maxLength) return text;
  const sliced = text.slice(0, maxLength);
  const lastStop = Math.max(sliced.lastIndexOf("."), sliced.lastIndexOf("\n"));
  return `${sliced.slice(0, lastStop > 120 ? lastStop + 1 : maxLength).trim()}...`;
}

function extractUsefulPoints(text = "") {
  const stopWords = [
    "High-Level Technical Overview",
    "System Architecture Description",
    "Overview",
    "Additional Notes",
    "Component Interactions",
    "Infrastructure Choices",
    "Data Flow",
  ];

  const points = cleanGeneratedText(text)
    .split(/\n+/)
    .map((line) => line.trim())
    .filter((line) => line.length > 35)
    .filter(
      (line) =>
        !stopWords.some((word) => line.toLowerCase() === word.toLowerCase()),
    )
    .map((line) => line.replace(/:$/, ""));

  return points.length
    ? points
    : ["Analysis is ready. Open the full notes for details."];
}

function InsightTile({ index, text }) {
  return (
    <div className="p-5 rounded-2xl bg-white/5 border border-white/5">
      <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-300 flex items-center justify-center text-sm font-bold mb-4">
        {index}
      </div>
      <p className="text-sm text-gray-300 leading-relaxed">
        {getShortText(text, 170)}
      </p>
    </div>
  );
}

function PointList({ points }) {
  return (
    <div className="space-y-3">
      {points.map((point, i) => (
        <div key={i} className="flex gap-3">
          <Check className="w-4 h-4 text-emerald-400 mt-1 shrink-0" />
          <p className="text-sm text-gray-300 leading-relaxed">
            {getShortText(point, 190)}
          </p>
        </div>
      ))}
    </div>
  );
}

function ArchitectureFlow() {
  const steps = [
    { label: "React UI", icon: LayoutDashboard, color: "text-blue-400" },
    { label: "State + Calls", icon: Zap, color: "text-yellow-400" },
    { label: "API / Supabase", icon: BrainCircuit, color: "text-purple-400" },
    { label: "Database", icon: FileText, color: "text-emerald-400" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
      {steps.map((step, i) => {
        const Icon = step.icon;
        return (
          <div
            key={step.label}
            className="relative p-4 rounded-2xl bg-white/5 border border-white/5 min-h-28"
          >
            <Icon className={`w-6 h-6 ${step.color} mb-4`} />
            <p className="font-semibold text-sm">{step.label}</p>
            {i < steps.length - 1 && (
              <ChevronRight className="hidden sm:block absolute -right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600 z-10" />
            )}
          </div>
        );
      })}
    </div>
  );
}

function ExpandableText({ text, label }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mt-6">
      <button
        type="button"
        onClick={() => setIsOpen((value) => !value)}
        className="flex items-center gap-2 text-sm text-purple-300 hover:text-purple-200 transition-colors"
      >
        {isOpen ? (
          <ChevronDown className="w-4 h-4" />
        ) : (
          <ChevronRight className="w-4 h-4" />
        )}
        {isOpen ? "Hide details" : label}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-4 p-5 rounded-2xl bg-black/30 border border-white/5 text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
              {text}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  confirmTone = "default",
  onCancel,
  onConfirm,
}) {
  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-6"
        onClick={onCancel}
      >
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.96 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-md glass-card rounded-3xl border border-white/10 p-7"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-300 flex items-center justify-center mb-5">
            <Trash2 className="w-5 h-5" />
          </div>
          <h3 className="text-2xl font-bold mb-3">{title}</h3>
          <p className="text-gray-400 leading-relaxed">{description}</p>

          <div className="mt-7 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-3 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors text-sm font-semibold"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className={`px-5 py-3 rounded-2xl text-sm font-semibold transition-colors ${
                confirmTone === "danger"
                  ? "bg-red-500/90 hover:bg-red-500 text-white"
                  : "bg-purple-600 hover:bg-purple-500 text-white"
              }`}
            >
              {confirmLabel}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function ResultCard({ title, color, icon: Icon, className = "", children }) {
  return (
    <div
      className={`glass-card p-8 rounded-3xl border border-white/5 ${className}`}
    >
      <h3 className={`text-xl font-bold mb-5 ${color} flex items-center gap-3`}>
        <Icon className="w-6 h-6" /> {title}
      </h3>
      {children}
    </div>
  );
}

function EmptyState({ title, message }) {
  return (
    <div className="space-y-6">
      <div className="glass-card h-80 flex flex-col items-center justify-center rounded-3xl text-gray-500 gap-6 border-dashed border-2 border-white/10">
        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center">
          <Sparkles className="w-10 h-10 text-gray-600" />
        </div>
        <div className="text-center">
          <h3 className="text-xl font-semibold text-gray-300 mb-2">
            {title} Pending
          </h3>
          <p className="max-w-xs mx-auto text-sm">{message}</p>
        </div>
      </div>
    </div>
  );
}

const Code2 = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="16 18 22 12 16 6" />
    <polyline points="8 6 2 12 8 18" />
  </svg>
);
