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
    Menu,
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
    User,
    Zap,
    X,
    Plus,
    ArrowUpRight,
    Edit3,
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

export default function Dashboard({ initialTab = "overview" }) {
  const [activeTab, setActiveTab] = useState(initialTab === "new-analysis" ? "upload" : initialTab);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [analysisData, setAnalysisData] = useState(null);
  const [history, setHistory] = useState(() => readLocalHistory());
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingHistory, setIsFetchingHistory] = useState(false);
  const [projectPendingDelete, setProjectPendingDelete] = useState(null);
  const [resumeVersion, setResumeVersion] = useState(0);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const { user, token, logout, updateUser } = useAuthStore();
  const navigate = useNavigate();

  const tabs = [
    { id: "overview", label: "Overview", icon: LayoutDashboard, path: "/dashboard" },
    { id: "upload", label: "New Analysis", icon: UploadCloud, path: "/new-analysis" },
    { id: "story", label: "Project Story", icon: BookOpen, path: "/project-story" },
    { id: "analysis", label: "Analysis Results", icon: FileText, path: "/analysis-results" },
    { id: "compare", label: "Compare Projects", icon: GitCompare, path: "/compare-projects" },
    { id: "viva", label: "Viva Prep", icon: CheckSquare, path: "/viva-prep" },
    { id: "resume", label: "Resume Vault", icon: Briefcase, path: "/resume-vault" },
    { id: "interview", label: "Mock Interview", icon: MessageSquare, path: "/mock-interview" },
  ];

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

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
        timeout: 15000,
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
          timeout: 120000, // 2 minutes — AI multi-agent analysis needs time
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
      navigate("/project-story");
    } catch (error) {
      console.error("[PrepAI] Analysis failed — full error object:", error);
      console.error("[PrepAI] Response status:", error.response?.status);
      console.error("[PrepAI] Response data:", error.response?.data);
      console.error("[PrepAI] Error code:", error.code);
      // Re-throw so UploadSection can show inline toast
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const loadProjectFromHistory = (project) => {
    setAnalysisData(project);
    setActiveTab("story");
    navigate("/project-story");
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

  // Real computed stats from user history
  const totalRepos = history.length;
  const avgConfidence = totalRepos > 0
    ? Math.round(
        history.reduce((acc, p) => {
          const score = p?.analysis?.healthScore?.overall || getProjectHealthScore(p)?.overall || 75;
          return acc + score;
        }, 0) / totalRepos
      )
    : 0;
  const totalVivaQuestions = history.reduce((acc, p) => {
    return acc + (p?.vivaPrep?.length || 0);
  }, 0);

  const getPlacementRank = (score, count) => {
    if (count === 0) return { rank: "Unranked", tier: "Analyze 1st Project", color: "text-zinc-500", bg: "bg-zinc-500/10", border: "border-zinc-500/20" };
    if (score >= 85) return { rank: "Top 5%", tier: "Tier-1 SDE Ready", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" };
    if (score >= 70) return { rank: "Top 18%", tier: "Mid-Senior Candidate", color: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/20" };
    if (score >= 50) return { rank: "Top 40%", tier: "Junior Developer", color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" };
    return { rank: "Foundational", tier: "Needs Project Depth", color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" };
  };

  const placementRank = getPlacementRank(avgConfidence, totalRepos);

  const handleTabClick = (tab) => {
    if (tab.path) {
      navigate(tab.path);
    }
    setActiveTab(tab.id);
    setMobileNavOpen(false);
  };

  return (
    <div className="flex h-screen bauhaus-canvas-bg text-[#111111] overflow-hidden font-bauhaus print:bg-white print:text-black">
      {/* Mobile Top Navbar (Visible on < md) */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b-[3px] border-[#111111] z-40 flex items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 bg-[#D02020] border border-[#111111]" />
          <span className="font-extrabold tracking-tight text-lg uppercase font-['Outfit'] text-[#111111]">
            PREP<span className="text-[#D02020]">AI</span>
          </span>
        </Link>
        <button
          type="button"
          onClick={() => setMobileNavOpen(!mobileNavOpen)}
          className="p-2 border-2 border-[#111111] bg-[#F0C020] text-[#111111] bauhaus-shadow-sm active:translate-x-0.5 active:translate-y-0.5"
          aria-label="Toggle navigation"
        >
          {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Nav Backdrop Overlay */}
      <AnimatePresence>
        {mobileNavOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileNavOpen(false)}
            className="md:hidden fixed inset-0 bg-[#111111]/70 z-40 backdrop-blur-xs"
          />
        )}
      </AnimatePresence>

      {/* Sidebar: Desktop & Mobile Drawer */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-72 md:w-64 border-r-[3px] border-[#111111] bg-white flex flex-col shrink-0 print:hidden transition-transform duration-200 ease-out ${
          mobileNavOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b-[3px] border-[#111111] flex items-center justify-between bg-white">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-4 h-4 bg-[#D02020] border-2 border-[#111111] shadow-[2px_2px_0_#111111]" />
            <span className="font-extrabold tracking-tight text-xl uppercase font-['Outfit'] text-[#111111]">
              PREP<span className="text-[#D02020]">AI</span>
            </span>
          </Link>
          <button
            type="button"
            onClick={() => setMobileNavOpen(false)}
            className="md:hidden p-1 border border-[#111111] hover:bg-[#F0C020]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-3 space-y-2 overflow-y-auto custom-scrollbar">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab)}
                className={`w-full flex items-center gap-3 px-3.5 py-3 text-xs font-bold uppercase tracking-wider transition-all duration-100 ${
                  isActive
                    ? "bg-[#F0C020] text-[#111111]"
                    : "text-[#111111] hover:bg-black/5"
                }`}
              >
                <tab.icon className="w-4 h-4 text-[#111111]" />
                <span className="flex-1 text-left font-['JetBrains_Mono'] text-[#111111]">{tab.label}</span>
                {isActive && (
                  <div className="w-2 h-2 bg-[#D02020]" />
                )}
              </button>
            );
          })}
        </nav>

        {/* User Card with Edit Button */}
        <div className="p-3 border-t-[3px] border-[#111111] bg-[#F0F0F0]">
          <div 
            onClick={() => setProfileModalOpen(true)}
            className="flex items-center gap-3 p-2.5 bg-white border-2 border-[#111111] shadow-[3px_3px_0_#111111] hover:bg-[#F0C020] transition-colors cursor-pointer"
            title="Click to edit profile"
          >
            <div className="h-8 w-8 shrink-0 bg-[#1040C0] border-2 border-[#111111] flex items-center justify-center text-white font-black text-xs font-['JetBrains_Mono']">
              {user?.name ? user.name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase() : "U"}
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-xs font-bold text-[#111111] truncate flex items-center gap-1.5 uppercase font-['Outfit']">
                {user?.name || "Developer"}
                <Edit3 className="w-3 h-3 text-[#111111]" />
              </p>
              <p className="text-[11px] text-[#555555] truncate font-['JetBrains_Mono']">{user?.email || "user@example.com"}</p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleLogout();
              }}
              title="Logout"
              className="p-1.5 text-[#111111] hover:bg-[#D02020] hover:text-white border border-[#111111] transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 relative overflow-y-auto custom-scrollbar pt-16 md:pt-0">
        <div className="p-4 sm:p-8 max-w-6xl mx-auto min-h-full print:p-0 relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 print:hidden border-b-[3px] border-[#111111] pb-5">
            <div>
              <div className="inline-block px-2 py-0.5 bg-[#F0C020] border-2 border-[#111111] text-[10px] font-bold uppercase tracking-wider font-['JetBrains_Mono'] mb-2">
                PLACEMENT DASHBOARD
              </div>
              <h1 className="text-3xl font-black tracking-tight text-[#111111] uppercase font-['Outfit'] flex items-center gap-2.5">
                {tabs.find((t) => t.id === activeTab)?.label}
              </h1>
              {analysisData &&
                activeTab !== "upload" &&
                activeTab !== "overview" &&
                activeTab !== "history" && (
                  <p className="text-xs text-[#555555] mt-2 flex items-center gap-2 font-['JetBrains_Mono']">
                    <span>ACTIVE REPO:</span>
                    <span className="text-[#111111] font-bold px-2 py-0.5 bg-white border border-[#111111]">
                      {analysisData.name}
                    </span>
                  </p>
                )}
            </div>
            
            <div className="flex items-center gap-3">
              {activeTab !== "upload" && (
                <button
                  onClick={() => {
                    navigate("/new-analysis");
                    setActiveTab("upload");
                  }}
                  className="bauhaus-btn-primary px-4 py-2.5 text-xs"
                >
                  <Plus className="w-4 h-4 mr-1.5" /> Start New Analysis
                </button>
              )}
              {analysisData && (
                <button
                  onClick={handleDownloadPDF}
                  className="bauhaus-btn-secondary px-4 py-2.5 text-xs"
                >
                  <Download className="w-4 h-4 mr-1.5" /> Export PDF
                </button>
              )}
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === "overview" && (
                <OverviewSection
                  history={history}
                  stats={{
                    totalRepos,
                    avgConfidence,
                    totalVivaQuestions,
                    placementRank,
                  }}
                  onStartNewAnalysis={() => {
                    navigate("/new-analysis");
                    setActiveTab("upload");
                  }}
                  onSelectProject={loadProjectFromHistory}
                />
              )}
              {activeTab === "upload" && (
                <UploadSection
                  onAnalyze={handleAnalyze}
                  isLoading={isLoading}
                  stats={{
                    totalRepos,
                    avgConfidence,
                    totalVivaQuestions,
                  }}
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

      {/* Edit Profile Modal */}
      <ProfileEditModal
        open={profileModalOpen}
        user={user}
        onClose={() => setProfileModalOpen(false)}
        onSave={(updatedData) => {
          updateUser(updatedData);
          setProfileModalOpen(false);
        }}
      />

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

/* ─────────────────── PROFILE EDIT MODAL ─────────────────── */
function ProfileEditModal({ open, user, onClose, onSave }) {
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");

  useEffect(() => {
    setName(user?.name || "");
    setEmail(user?.email || "");
  }, [user, open]);

  if (!open) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({ name: name.trim(), email: email.trim() });
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-[#111111]/75 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 15 }}
          className="w-full max-w-md bg-white border-[3px] border-[#111111] p-6 sm:p-8 shadow-[8px_8px_0_#111111] relative font-bauhaus"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-[#111111]">
            <div className="w-10 h-10 bg-[#1040C0] border-2 border-[#111111] text-white flex items-center justify-center shadow-[2px_2px_0_#111111]">
              <User className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold tracking-wider font-['JetBrains_Mono'] text-[#555555]">
                ACCOUNT SETTINGS
              </div>
              <h3 className="text-2xl font-black text-[#111111] uppercase font-['Outfit']">Edit Profile</h3>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#111111] font-['JetBrains_Mono'] mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                className="bauhaus-input w-full"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#111111] font-['JetBrains_Mono'] mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="bauhaus-input w-full"
                required
              />
            </div>

            <div className="pt-4 flex items-center justify-end gap-3 border-t-2 border-[#111111]">
              <button
                type="button"
                onClick={onClose}
                className="bauhaus-btn-secondary px-4 py-2.5 text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bauhaus-btn-primary px-5 py-2.5 text-xs"
              >
                Save Changes
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/* ─────────────────── OVERVIEW SECTION ($10M SaaS Dashboard) ─────────────────── */
function OverviewSection({ history, stats, onStartNewAnalysis, onSelectProject }) {
  const recentProjects = history.slice(0, 4);
  const { totalRepos, avgConfidence, totalVivaQuestions, placementRank } = stats;

  return (
    <div className="space-y-8 font-bauhaus">
      {/* =========================================================================
          7. WELCOME BANNER: Bauhaus Blue (#1040C0) + Yellow Tag + Geometric Graphic
          ========================================================================= */}
      <div className="relative overflow-hidden bg-[#1040C0] border-[3px] border-[#111111] p-8 sm:p-10 shadow-[6px_6px_0_#111111]">
        {/* Geometric Bauhaus Art on Right */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 hidden lg:flex items-center gap-3 opacity-90 pointer-events-none">
          <div className="w-16 h-16 bg-[#F0C020] border-[3px] border-[#111111] shadow-[4px_4px_0_#111111] rotate-12" />
          <div className="w-20 h-20 rounded-full bg-[#D02020] border-[3px] border-[#111111] shadow-[4px_4px_0_#111111]" />
          <div className="w-16 h-16 bg-white border-[3px] border-[#111111] shadow-[4px_4px_0_#111111] -rotate-6" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 max-w-3xl">
          <div>
            <div className="bauhaus-tag mb-3">
              <Sparkles className="w-3.5 h-3.5" /> PLACEMENT PREPAREDNESS ENGINE
            </div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white uppercase font-['Outfit'] leading-tight">
              Placement Command Center
            </h2>
            <p className="mt-2 text-sm text-white/90 leading-relaxed font-sans max-w-xl">
              Track multi-agent code analysis, architecture breakdown, viva defense drills, and ATS resume verification across your codebases.
            </p>
          </div>

          <div className="shrink-0">
            <button
              onClick={onStartNewAnalysis}
              className="bauhaus-btn-primary px-6 py-4 text-sm"
            >
              <Plus className="w-4 h-4 mr-2" /> Start New Analysis
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================================
          5. STAT CARDS: Bauhaus Top Colour Block (red/blue/yellow/ink)
          ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Repos Analyzed - RED block */}
        <div className="bauhaus-card flex flex-col justify-between">
          <div>
            <div className="h-3 bg-[#D02020] border-b-[3px] border-[#111111]" />
            <div className="p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider font-['JetBrains_Mono'] text-[#555555]">
                  TOTAL REPOS
                </span>
                <div className="w-7 h-7 bg-white border-2 border-[#111111] flex items-center justify-center text-[#111111] shadow-[2px_2px_0_#111111]">
                  <Code2 className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-[#111111] font-['JetBrains_Mono']">
                  {totalRepos}
                </span>
                <span className="text-xs uppercase font-bold text-[#555555] font-['JetBrains_Mono']">analyzed</span>
              </div>
            </div>
          </div>
          <div className="px-5 py-2.5 bg-[#F0F0F0] border-t-2 border-[#111111] text-[11px] font-bold text-[#111111] uppercase font-['JetBrains_Mono']">
            Indexed Codebases
          </div>
        </div>

        {/* Card 2: Average Confidence - BLUE block */}
        <div className="bauhaus-card flex flex-col justify-between">
          <div>
            <div className="h-3 bg-[#1040C0] border-b-[3px] border-[#111111]" />
            <div className="p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider font-['JetBrains_Mono'] text-[#555555]">
                  AVG CONFIDENCE
                </span>
                <div className="w-7 h-7 bg-white border-2 border-[#111111] flex items-center justify-center text-[#111111] shadow-[2px_2px_0_#111111]">
                  <Target className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-[#111111] font-['JetBrains_Mono']">
                  {avgConfidence}%
                </span>
                <span className="text-xs uppercase font-bold text-[#555555] font-['JetBrains_Mono']">health</span>
              </div>
            </div>
          </div>
          <div className="px-5 py-2.5 bg-[#F0F0F0] border-t-2 border-[#111111] text-[11px] font-bold text-[#111111] uppercase font-['JetBrains_Mono']">
            Architecture & Quality
          </div>
        </div>

        {/* Card 3: Viva Questions - YELLOW block */}
        <div className="bauhaus-card flex flex-col justify-between">
          <div>
            <div className="h-3 bg-[#F0C020] border-b-[3px] border-[#111111]" />
            <div className="p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider font-['JetBrains_Mono'] text-[#555555]">
                  VIVA QUESTIONS
                </span>
                <div className="w-7 h-7 bg-white border-2 border-[#111111] flex items-center justify-center text-[#111111] shadow-[2px_2px_0_#111111]">
                  <CheckSquare className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-[#111111] font-['JetBrains_Mono']">
                  {totalVivaQuestions}
                </span>
                <span className="text-xs uppercase font-bold text-[#555555] font-['JetBrains_Mono']">drills</span>
              </div>
            </div>
          </div>
          <div className="px-5 py-2.5 bg-[#F0F0F0] border-t-2 border-[#111111] text-[11px] font-bold text-[#111111] uppercase font-['JetBrains_Mono']">
            Interview Defense Q&A
          </div>
        </div>

        {/* Card 4: Placement Readiness - INK block */}
        <div className="bauhaus-card flex flex-col justify-between">
          <div>
            <div className="h-3 bg-[#111111] border-b-[3px] border-[#111111]" />
            <div className="p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider font-['JetBrains_Mono'] text-[#555555]">
                  READINESS RANK
                </span>
                <div className="w-7 h-7 bg-white border-2 border-[#111111] flex items-center justify-center text-[#111111] shadow-[2px_2px_0_#111111]">
                  <Trophy className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-[#111111] font-['Outfit'] uppercase">
                  {placementRank.rank}
                </span>
              </div>
            </div>
          </div>
          <div className="px-5 py-2.5 bg-[#F0C020] border-t-2 border-[#111111] text-[10px] font-bold text-[#111111] uppercase font-['JetBrains_Mono'] truncate">
            {placementRank.tier}
          </div>
        </div>
      </div>

      {/* =========================================================================
          RECENT REPOSITORIES
          ========================================================================= */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b-2 border-[#111111] pb-3">
          <h3 className="text-xl font-black text-[#111111] uppercase font-['Outfit'] flex items-center gap-2">
            <History className="w-5 h-5 text-[#1040C0]" /> Recent Analyzed Repositories
          </h3>
          {history.length > 0 && (
            <span className="text-xs font-bold text-[#555555] uppercase font-['JetBrains_Mono']">
              [{recentProjects.length} OF {history.length}]
            </span>
          )}
        </div>

        {history.length === 0 ? (
          <div className="bg-white border-[3px] border-dashed border-[#111111] p-12 text-center shadow-[6px_6px_0_#111111]">
            <div className="w-14 h-14 bg-[#F0C020] border-2 border-[#111111] flex items-center justify-center mx-auto mb-4 text-[#111111] shadow-[3px_3px_0_#111111]">
              <Code2 className="w-7 h-7" />
            </div>
            <h4 className="text-xl font-black text-[#111111] mb-2 uppercase font-['Outfit']">No Projects Analyzed Yet</h4>
            <p className="text-sm text-[#555555] max-w-sm mx-auto mb-6 font-sans">
              Connect your first GitHub repository to generate placement proof, architecture models, and viva questions.
            </p>
            <button
              onClick={onStartNewAnalysis}
              className="bauhaus-btn-primary px-6 py-3 text-xs"
            >
              <Plus className="w-4 h-4 mr-1.5" /> Start First Analysis
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recentProjects.map((project) => (
              <div
                key={project._id}
                onClick={() => onSelectProject(project)}
                className="bauhaus-card p-6 cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#F0C020] border-2 border-[#111111] flex items-center justify-center text-[#111111] font-bold text-sm shadow-[2px_2px_0_#111111]">
                        <Code2 className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-lg font-black text-[#111111] uppercase font-['Outfit'] group-hover:text-[#D02020] transition-colors">
                          {project.name}
                        </h4>
                        <p className="text-xs text-[#555555] truncate max-w-[220px] font-['JetBrains_Mono']">
                          {project.repositoryUrl}
                        </p>
                      </div>
                    </div>
                    <div className="p-1.5 border border-[#111111] bg-white group-hover:bg-[#111111] group-hover:text-white transition-colors">
                      <ArrowUpRight className="w-4 h-4" />
                    </div>
                  </div>

                  <p className="text-xs text-[#333333] line-clamp-2 leading-relaxed mt-3 font-sans">
                    {project.analysis?.overview || "Repository parsed with 7-agent pipeline. Click to inspect story and architecture."}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t-2 border-[#111111] flex items-center justify-between text-xs font-['JetBrains_Mono']">
                  <span className="flex items-center gap-1.5 text-[#555555]">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(project.createdAt).toLocaleDateString()}
                  </span>
                  <span className="font-bold text-[#111111] text-[10px] uppercase px-2 py-0.5 bg-[#F0C020] border border-[#111111]">
                    {project.vivaPrep?.length || 0} VIVA DRILLS
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function HistorySection({ history, isLoading, onSelect, onDelete }) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 font-bauhaus">
        <div className="w-10 h-10 border-[3px] border-[#111111] border-t-[#D02020] animate-spin" />
        <p className="text-xs uppercase font-bold text-[#555555] font-['JetBrains_Mono']">Loading history...</p>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="bg-white border-[3px] border-dashed border-[#111111] p-12 text-center shadow-[6px_6px_0_#111111] font-bauhaus">
        <div className="w-14 h-14 bg-[#F0C020] border-2 border-[#111111] flex items-center justify-center mx-auto mb-4 text-[#111111] shadow-[3px_3px_0_#111111]">
          <History className="w-7 h-7" />
        </div>
        <h3 className="text-2xl font-black mb-2 uppercase font-['Outfit'] text-[#111111]">No History Yet</h3>
        <p className="text-sm text-[#555555] font-sans">
          Analyze your first project to inspect its full placement kit!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 font-bauhaus">
      <div className="flex items-center justify-between border-b-2 border-[#111111] pb-3">
        <h3 className="text-xl font-black text-[#111111] uppercase font-['Outfit'] flex items-center gap-2">
          <History className="w-5 h-5 text-[#1040C0]" /> Repository Analysis Vault
        </h3>
        <span className="text-xs font-bold text-[#555555] uppercase font-['JetBrains_Mono']">
          [{history.length} SAVED]
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {history.map((project) => (
          <div
            key={project._id}
            className="bauhaus-card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer group"
            onClick={() => onSelect(project)}
          >
            <div className="flex items-start sm:items-center gap-4">
              <div className="w-12 h-12 bg-[#1040C0] border-2 border-[#111111] flex items-center justify-center text-white shrink-0 shadow-[2px_2px_0_#111111]">
                <Code2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-xl font-black text-[#111111] uppercase font-['Outfit'] group-hover:text-[#D02020] transition-colors">
                  {project.name}
                </h4>
                <div className="flex flex-wrap items-center gap-4 mt-1 text-xs text-[#555555] font-['JetBrains_Mono']">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />{" "}
                    {new Date(project.createdAt).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <ExternalLink className="w-3.5 h-3.5" />{" "}
                    {project.repositoryUrl.split("/").pop()}
                  </span>
                  <span className="font-bold text-[#111111] uppercase px-2 py-0.5 bg-[#F0C020] border border-[#111111]">
                    {project.vivaPrep?.length || 0} VIVA Qs
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(project);
                }}
                className="p-2.5 bg-white border-2 border-[#111111] hover:bg-[#D02020] hover:text-white transition-colors shadow-[2px_2px_0_#111111]"
                title="Delete project"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button 
                type="button"
                className="px-4 py-2 bg-[#F0C020] border-2 border-[#111111] text-[#111111] font-bold text-xs uppercase font-['JetBrains_Mono'] flex items-center gap-1.5 shadow-[2px_2px_0_#111111] group-hover:bg-[#111111] group-hover:text-white transition-all"
              >
                <span>Inspect</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────── UPLOAD SECTION ─────────────────── */
function UploadSection({ onAnalyze, isLoading, stats }) {
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
    setTimeout(() => setToast(null), 6000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const githubRegex = /^https?:\/\/(www\.)?github\.com\/[\w-]+\/[\w.-]+\/?$/;

    if (!repoUrl.trim()) return;

    if (!githubRegex.test(repoUrl.trim())) {
      showToast("Please enter a valid GitHub Repository URL");
      return;
    }

    try {
      await onAnalyze(repoUrl.trim());
    } catch (error) {
      // Build a human-readable error message
      let msg = "Analysis Failed: ";
      if (error.code === "ECONNABORTED") {
        msg += "Request timed out. The server may be overloaded — please try again.";
      } else if (error.response) {
        const status = error.response.status;
        const serverMsg = error.response.data?.error || error.response.data?.message || "";
        msg += `${status} — ${serverMsg || (status === 502 ? "Bad Gateway. Server is unreachable." : status === 500 ? "Internal Server Error." : "Unexpected server error.")}`.trim();
      } else if (error.request) {
        msg += "No response from server. Check your network connection.";
      } else {
        msg += error.message || "Unknown error occurred.";
      }
      showToast(msg);
    }
  };

  const totalRepos = stats?.totalRepos ?? 0;
  const avgConfidence = stats?.avgConfidence ?? 0;
  const totalVivaQuestions = stats?.totalVivaQuestions ?? 0;

  return (
    <div className="space-y-8 relative">
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-2xl bg-red-500/90 text-white font-semibold shadow-[0_10px_40px_rgba(239,68,68,0.4)] flex items-center gap-3 border border-red-400/30 backdrop-blur-md text-sm"
          >
            <Shield className="w-4 h-4" />
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* =========================================================================
          MAIN ANALYZER INPUT: Bauhaus Constructivist Command Box
          ========================================================================= */}
      <div className="bauhaus-card p-8 sm:p-12 relative overflow-hidden font-bauhaus">
        <div className="flex flex-col items-center justify-center text-center max-w-2xl mx-auto">
          {/* Top Tag Badge */}
          <div className="bauhaus-tag mb-6">
            <span className="w-2 h-2 bg-[#D02020] border border-[#111111]" />
            <span>
              {isLoading ? "MULTI-AGENT ENGINE RUNNING" : "AUTONOMOUS CODEBASE EXTRACTION"}
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-[#111111] uppercase font-['Outfit'] mb-3">
            {isLoading
              ? "Synthesizing Repository Knowledge..."
              : "Paste GitHub Repository URL"}
          </h2>

          <p className="text-sm text-[#555555] mb-8 max-w-lg leading-relaxed font-sans">
            {isLoading
              ? "7 specialized AI agents are mapping dependencies, architecture flows, and generating interview defense materials."
              : "PrepAI inspects your full commit history, file tree, schemas, and endpoints to build your verified placement kit."}
          </p>

          {/* Input Form with Bauhaus Hard Border and Primary Button */}
          <form
            onSubmit={handleSubmit}
            className="w-full flex flex-col sm:flex-row items-stretch sm:items-center gap-3 p-2 bg-[#F0F0F0] border-[3px] border-[#111111] shadow-[4px_4px_0_#111111]"
          >
            <div className="flex-1 flex items-center px-3 gap-3 bg-white border-2 border-[#111111]">
              <Code2 className="w-5 h-5 text-[#111111] shrink-0" />
              <input
                type="text"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                placeholder="https://github.com/username/repository"
                className="w-full bg-transparent border-none outline-none text-sm text-[#111111] placeholder-[#888888] py-3 font-['JetBrains_Mono']"
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !repoUrl.trim()}
              className="bauhaus-btn-primary px-8 py-3.5 text-xs whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent animate-spin mr-2" />
                  <span>Analyzing Repo...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-1.5" />
                  <span>Analyze</span>
                </>
              )}
            </button>
          </form>

          {/* Supported tags below input */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3 text-xs font-bold text-[#555555] font-['JetBrains_Mono'] uppercase">
            <span className="flex items-center gap-1.5 text-[#111111]">
              <span className="w-2 h-2 bg-[#D02020] border border-[#111111]" /> PUBLIC REPOS
            </span>
            <span>•</span>
            <span>NODE / PYTHON / GO / REACT</span>
            <span>•</span>
            <span>AST CODE ANALYSIS</span>
          </div>
        </div>
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
    <div className="bauhaus-card overflow-hidden font-bauhaus">
      <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="p-6 md:p-8">
          <div className="flex items-center justify-between gap-4 mb-8 border-b-2 border-[#111111] pb-4">
            <div>
              <p className="text-xs uppercase tracking-widest text-[#D02020] font-bold font-['JetBrains_Mono']">
                LIVE MULTI-AGENT EXTRACTION
              </p>
              <h3 className="text-2xl font-black mt-1 uppercase font-['Outfit'] text-[#111111]">
                Building Your Placement Kit
              </h3>
            </div>
            <div className="px-3 py-1 bg-[#F0C020] border-2 border-[#111111] text-xs font-bold font-['JetBrains_Mono']">
              STAGE {activeStage + 1} / {stages.length}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-7 gap-3">
            {stages.map((stage, index) => {
              const Icon = stage.icon;
              const isDone = index < activeStage;
              const isActive = index === activeStage;

              return (
                <div
                  key={stage.title}
                  className={`border-[2px] p-3 text-left transition-all ${
                    isActive
                      ? "bg-[#D02020] text-white border-[#111111] shadow-[4px_4px_0_#111111]"
                      : isDone
                        ? "bg-[#F0C020] text-[#111111] border-[#111111]"
                        : "bg-white text-[#555555] border-[#CCCCCC]"
                  }`}
                >
                  <div className="w-8 h-8 border border-[#111111] bg-white flex items-center justify-center mb-2 text-[#111111]">
                    {isDone ? (
                      <Check className="w-4 h-4 text-[#111111]" />
                    ) : (
                      <Icon className="w-4 h-4 text-[#111111]" />
                    )}
                  </div>
                  <p className="font-bold text-xs uppercase font-['JetBrains_Mono']">
                    {stage.title}
                  </p>
                  <p className="text-[10px] mt-1 font-sans leading-snug line-clamp-1">
                    {stage.short}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="border-t lg:border-t-0 lg:border-l-[3px] border-[#111111] bg-[#F0F0F0] p-6 md:p-8 flex flex-col justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStage.title}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
            >
              <div className="w-14 h-14 bg-white border-[3px] border-[#111111] shadow-[3px_3px_0_#111111] flex items-center justify-center mb-4 text-[#111111]">
                <CurrentIcon className="w-7 h-7 text-[#1040C0]" />
              </div>
              <p className="text-xs uppercase font-bold text-[#555555] font-['JetBrains_Mono'] mb-1">CURRENT ACTIVE AGENT</p>
              <h4 className="text-2xl font-black mb-2 uppercase font-['Outfit'] text-[#111111]">{currentStage.title}</h4>
              <p className="text-sm text-[#333333] leading-relaxed font-sans">
                {currentStage.detail}
              </p>
              <div className="mt-5 h-3 border-2 border-[#111111] bg-white overflow-hidden">
                <motion.div
                  key={activeStage}
                  className="h-full bg-[#D02020]"
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
    <div className="space-y-8 font-bauhaus">
      <div className="bauhaus-card p-8 relative">
        <div className="flex items-start justify-between gap-6">
          <div>
            <div className="bauhaus-tag mb-3">
              PROJECT STORY & NARRATIVE
            </div>
            <h3 className="text-3xl font-black mb-4 uppercase font-['Outfit'] text-[#111111]">{data.name}</h3>
            <p className="text-[#333333] text-base leading-relaxed max-w-3xl font-sans">
              {getShortText(story, 360)}
            </p>
          </div>
          <div className="hidden md:flex w-16 h-16 bg-[#F0C020] border-2 border-[#111111] shadow-[3px_3px_0_#111111] text-[#111111] items-center justify-center shrink-0">
            <BookOpen className="w-8 h-8" />
          </div>
        </div>
        {story.length > 360 && (
          <ExpandableText text={story} label="Read Complete Story" />
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ResultCard
          title="Key Improvements"
          color="text-[#1040C0]"
          icon={Lightbulb}
        >
          <PointList points={extractUsefulPoints(improvements).slice(0, 4)} />
        </ResultCard>

        <ResultCard title="Demo Flow" color="text-[#D02020]" icon={PlayCircle}>
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
    <div className="space-y-6 font-bauhaus">
      <ProjectHealthPanel score={healthScore} />
      <MaintainabilityGraph score={healthScore.overall} />

      <div className="bauhaus-card p-8">
        <div className="flex items-start justify-between gap-6 mb-8 border-b-2 border-[#111111] pb-4">
          <div>
            <div className="bauhaus-tag mb-3">
              TECHNICAL SPECIFICATION
            </div>
            <h3 className="text-3xl font-black mb-2 uppercase font-['Outfit'] text-[#111111]">{data.name}</h3>
            <p className="text-[#333333] text-base leading-relaxed max-w-3xl font-sans">
              {getShortText(overview, 300)}
            </p>
          </div>
          <div className="hidden md:flex w-16 h-16 bg-[#1040C0] border-2 border-[#111111] shadow-[3px_3px_0_#111111] text-white items-center justify-center shrink-0">
            <LayoutDashboard className="w-8 h-8" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {overviewPoints.slice(0, 3).map((point, i) => (
            <InsightTile key={i} index={i + 1} text={point} />
          ))}
        </div>
        <ExpandableText text={overview} label="Full Technical Notes" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-6">
        <ResultCard title="Tech Stack" color="text-[#1040C0]" icon={FileText}>
          <div className="flex flex-wrap gap-2">
            {(data.analysis?.techStack || []).map((tech, i) => (
              <span
                key={i}
                className="px-3 py-1 bg-[#F0F0F0] border-2 border-[#111111] text-[#111111] text-xs font-bold font-['JetBrains_Mono'] uppercase"
              >
                {tech}
              </span>
            ))}
          </div>
        </ResultCard>

        <div className="bauhaus-card p-8">
          <h3 className="text-xl font-black mb-6 text-[#111111] uppercase font-['Outfit'] flex items-center gap-3">
            <BrainCircuit className="w-6 h-6 text-[#D02020]" /> Architecture Flow
          </h3>
          <ArchitectureFlow />
        </div>
      </div>

      <div className="bauhaus-card p-8">
        <h3 className="text-xl font-black mb-5 text-[#111111] uppercase font-['Outfit'] flex items-center gap-3 border-b-2 border-[#111111] pb-3">
          <BrainCircuit className="w-6 h-6 text-[#1040C0]" /> Architecture Breakdown
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {architecturePoints.slice(0, 4).map((point, i) => (
            <div
              key={i}
              className="p-4 bg-[#F0F0F0] border-2 border-[#111111]"
            >
              <p className="text-xs text-[#222222] font-['JetBrains_Mono'] leading-relaxed">{point}</p>
            </div>
          ))}
        </div>
        <ExpandableText text={architecture} label="Full Architecture Notes" />
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
    <div className="space-y-6 font-bauhaus">
      <div className="bauhaus-card p-8">
        <div className="flex items-start justify-between gap-6 mb-8 border-b-2 border-[#111111] pb-4">
          <div>
            <div className="bauhaus-tag mb-3">
              HEAD-TO-HEAD REPO BATTLE
            </div>
            <h3 className="text-3xl font-black mb-2 uppercase font-['Outfit'] text-[#111111]">Compare Two Repositories</h3>
            <p className="text-[#555555] max-w-2xl font-sans text-sm">
              Paste two GitHub URLs. The system scores architecture, dependencies, engineering signals, and production readiness.
            </p>
          </div>
          <div className="w-12 h-12 bg-[#F0C020] border-2 border-[#111111] shadow-[2px_2px_0_#111111] flex items-center justify-center text-[#111111] hidden md:flex">
            <GitCompare className="w-6 h-6" />
          </div>
        </div>

        <form
          onSubmit={handleCompare}
          className="grid grid-cols-1 lg:grid-cols-[1fr_1fr_auto] gap-4"
        >
          <input
            value={projectAUrl}
            onChange={(e) => setProjectAUrl(e.target.value)}
            placeholder="Project A GitHub URL"
            className="bauhaus-input"
          />
          <input
            value={projectBUrl}
            onChange={(e) => setProjectBUrl(e.target.value)}
            placeholder="Project B GitHub URL"
            className="bauhaus-input"
          />
          <button
            type="submit"
            disabled={isComparing || !projectAUrl.trim() || !projectBUrl.trim()}
            className="bauhaus-btn-primary px-8 py-3.5 text-xs disabled:opacity-50"
          >
            {isComparing ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent animate-spin mr-2" />
            ) : (
              <Trophy className="w-4 h-4 mr-2" />
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

          <div className="bauhaus-card p-8">
            <h3 className="text-xl font-black mb-6 uppercase font-['Outfit'] text-[#111111] flex items-center gap-3 border-b-2 border-[#111111] pb-3">
              <BarChart3 className="w-6 h-6 text-[#1040C0]" /> Metric Breakdown & Winner Analysis
            </h3>
            <div className="space-y-5">
              {result.metrics.map((metric) => (
                <div
                  key={metric.key}
                  className="grid grid-cols-1 md:grid-cols-[150px_1fr_80px_1fr_80px] gap-3 items-center border-b border-[#E2E2E2] pb-3"
                >
                  <p className="font-bold text-[#111111] uppercase text-xs font-['JetBrains_Mono']">{metric.label}</p>
                  <ScoreBar value={metric.projectA} color="bg-[#1040C0]" />
                  <p className="text-sm text-[#1040C0] font-black font-['JetBrains_Mono']">
                    {metric.projectA}
                  </p>
                  <ScoreBar value={metric.projectB} color="bg-[#D02020]" />
                  <p className="text-sm text-[#D02020] font-black font-['JetBrains_Mono']">
                    {metric.projectB}
                  </p>
                  <p className="md:col-span-5 text-xs text-[#555555] font-['JetBrains_Mono'] uppercase font-bold">
                    {metric.winner === "Tie"
                      ? "Score: Tie"
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
    <div className="space-y-4 font-bauhaus">
      <div className="flex items-center justify-between border-b-2 border-[#111111] pb-3">
        <h3 className="text-xl font-black text-[#111111] uppercase font-['Outfit'] flex items-center gap-2">
          <CheckSquare className="w-5 h-5 text-[#D02020]" /> Viva & Technical Defense Questions
        </h3>
        <span className="text-xs font-bold text-[#555555] uppercase font-['JetBrains_Mono']">
          [{data.vivaPrep.length} QUESTIONS]
        </span>
      </div>

      {data.vivaPrep.map((item, i) => (
        <div
          key={i}
          className="bauhaus-card overflow-hidden"
        >
          <button
            onClick={() => setExpandedIndex(expandedIndex === i ? null : i)}
            className="w-full flex items-center justify-between p-5 text-left bg-white hover:bg-[#F0C020] transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <span className="w-8 h-8 bg-[#111111] text-white flex items-center justify-center text-xs font-black font-['JetBrains_Mono'] shrink-0">
                Q{i + 1}
              </span>
              <span className="font-bold text-base text-[#111111] font-['Outfit'] uppercase">{item.question}</span>
            </div>
            {expandedIndex === i ? (
              <ChevronDown className="w-5 h-5 text-[#111111] shrink-0" />
            ) : (
              <ChevronRight className="w-5 h-5 text-[#111111] shrink-0" />
            )}
          </button>
          <AnimatePresence>
            {expandedIndex === i && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="p-6 border-t-[3px] border-[#111111] bg-[#F0F0F0]">
                  <div className="text-[10px] uppercase font-bold text-[#555555] font-['JetBrains_Mono'] mb-2">
                    MODEL DEFENSE ANSWER
                  </div>
                  <p className="text-[#111111] text-sm leading-relaxed bg-white p-4 border-2 border-[#111111] font-sans">
                    {item.answer}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
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
    <div className="flex flex-col h-[calc(100vh-220px)] font-bauhaus">
      {/* Simulation options */}
      <div className="flex items-center justify-between mb-4 bg-white border-[3px] border-[#111111] p-4 shadow-[4px_4px_0_#111111]">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 bg-[#D02020] border border-[#111111]" />
          <span className="text-xs uppercase font-bold text-[#111111] font-['JetBrains_Mono']">
            MOCK SIMULATOR ACTIVE
          </span>
        </div>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-xs font-bold text-[#111111] uppercase font-['JetBrains_Mono'] cursor-pointer">
            <input
              type="checkbox"
              checked={speakQuestions}
              onChange={(e) => setSpeakQuestions(e.target.checked)}
              className="w-4 h-4 accent-[#D02020] border-2 border-[#111111]"
            />
            Voice Audio (TTS)
          </label>
        </div>
      </div>

      <div className="flex-1 bauhaus-card p-6 flex flex-col gap-4 overflow-hidden relative">
        <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex gap-4 ${msg.sender === "user" ? "flex-row-reverse" : ""}`}
            >
              <div
                className={`w-9 h-9 border-2 border-[#111111] flex items-center justify-center shrink-0 font-bold text-xs ${
                  msg.sender === "ai" ? "bg-[#1040C0] text-white shadow-[2px_2px_0_#111111]" : "bg-[#F0C020] text-[#111111] shadow-[2px_2px_0_#111111]"
                }`}
              >
                {msg.sender === "ai" ? (
                  <MessageSquare className="w-4 h-4 text-white" />
                ) : (
                  <span className="font-['JetBrains_Mono'] font-black">U</span>
                )}
              </div>
              <div
                className={`p-4 max-w-2xl text-xs sm:text-sm leading-relaxed border-2 border-[#111111] shadow-[3px_3px_0_#111111] ${
                  msg.sender === "ai"
                    ? "bg-[#F0F0F0] text-[#111111] font-sans"
                    : "bg-white text-[#111111] font-sans"
                }`}
              >
                {msg.message}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex gap-4">
              <div className="w-9 h-9 border-2 border-[#111111] bg-[#1040C0] text-white flex items-center justify-center shrink-0 shadow-[2px_2px_0_#111111]">
                <MessageSquare className="w-4 h-4 text-white" />
              </div>
              <div className="bg-[#F0F0F0] p-4 border-2 border-[#111111] flex gap-1.5 items-center shadow-[3px_3px_0_#111111]">
                <div className="w-2 h-2 bg-[#111111] animate-bounce" />
                <div className="w-2 h-2 bg-[#111111] animate-bounce [animation-delay:0.2s]" />
                <div className="w-2 h-2 bg-[#111111] animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          )}
        </div>

        <form
          onSubmit={handleSend}
          className="mt-4 relative print:hidden flex gap-3 pt-3 border-t-2 border-[#111111]"
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
                    : "Type your engineering response..."
                  : "Analyze a repo to start interview"
              }
              className="bauhaus-input w-full pr-14"
            />
            {/* Mic button */}
            <button
              type="button"
              onClick={handleVoiceInput}
              disabled={!data}
              className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 border border-[#111111] transition-all ${
                isRecording
                  ? "bg-[#D02020] text-white animate-pulse"
                  : "bg-white text-[#111111] hover:bg-[#F0C020]"
              }`}
              title="Voice to Text Input"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
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
            className="bauhaus-btn-primary px-6 text-xs whitespace-nowrap disabled:opacity-50"
          >
            <span>Send</span>
            <Sparkles className="w-3.5 h-3.5 ml-1.5" />
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
    <div className="hidden print:block p-10 bg-white text-[#111111] min-h-screen font-bauhaus border-[8px] border-[#111111]">
      {/* Header */}
      <div className="border-b-[4px] border-[#111111] pb-6 mb-8 flex justify-between items-end">
        <div>
          <p className="text-[#D02020] text-xs font-bold uppercase tracking-widest font-['JetBrains_Mono']">
            PREPAI VERIFIED PREPARATION
          </p>
          <h1 className="text-4xl font-black mt-1 tracking-tight text-[#111111] uppercase font-['Outfit']">
            {data.name}
          </h1>
          <p className="text-[#555555] text-sm mt-1 font-sans">
            Verified Technical Capability & Placement Readiness Certificate
          </p>
        </div>
        <div className="text-right">
          <div className="bg-[#F0C020] text-[#111111] px-5 py-3 border-[3px] border-[#111111] shadow-[4px_4px_0_#111111] inline-block">
            <p className="text-[10px] uppercase font-bold tracking-wider font-['JetBrains_Mono']">
              Overall Readiness
            </p>
            <p className="text-3xl font-black font-['Outfit']">
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

  let scoreColor = "text-[#D02020]";
  let zoneText = "LEGACY CODE";
  if (score >= 85) {
    scoreColor = "text-[#1040C0]";
    zoneText = "MAINTAINABLE";
  } else if (score >= 70) {
    scoreColor = "text-[#111111]";
    zoneText = "MODERATE";
  } else if (score >= 50) {
    scoreColor = "text-[#D02020]";
    zoneText = "REFACTOR RECOMMEND";
  }

  return (
    <div className="relative flex flex-col items-center justify-center">
      <svg className="w-48 h-28" viewBox="0 0 100 50">
        <path
          d="M 15 50 A 35 35 0 0 1 85 50"
          fill="none"
          stroke="#E5E5E5"
          strokeWidth="10"
        />
        <path
          d="M 15 50 A 35 35 0 0 1 85 50"
          fill="none"
          stroke="#1040C0"
          strokeWidth="10"
          strokeDasharray="110"
          strokeDashoffset={110 - percentage * 110}
          className="transition-all duration-1000 ease-out"
        />
        <circle cx="50" cy="50" r="5" fill="#111111" />
        <line
          x1="50"
          y1="50"
          x2="50"
          y2="18"
          stroke="#D02020"
          strokeWidth="3.5"
          strokeLinecap="square"
          transform={`rotate(${needleRotation} 50 50)`}
          className="transition-transform duration-1000 ease-out"
        />
      </svg>
      <div className="text-center -mt-2">
        <span className="text-3xl font-black font-mono text-[#111111]">{score}</span>
        <span className="text-xs text-gray-500 font-mono font-bold">/100</span>
        <p
          className={`text-[10px] font-mono font-bold tracking-widest mt-1 uppercase ${scoreColor}`}
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

  return (
    <div className="bauhaus-card p-6">
      <div className="flex items-center justify-between mb-4 pb-3 border-b-2 border-[#111111]">
        <div>
          <h4 className="font-extrabold text-lg text-[#111111] uppercase tracking-wide">
            Code Maintainability Graph
          </h4>
          <p className="text-xs font-mono text-gray-600">
            Historical scoring over latest iterations
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3.5 h-3.5 bg-[#1040C0] border border-[#111111]" />
          <span className="text-xs font-mono font-bold text-[#111111] uppercase">
            Maintainability Index
          </span>
        </div>
      </div>
      <div className="relative w-full overflow-hidden bg-white border-2 border-[#111111] p-3">
        <svg className="w-full h-auto" viewBox={`0 0 ${width} ${height}`}>
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
                  stroke="#E0E0E0"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                />
                <text
                  x={padding - 8}
                  y={y + 4}
                  fill="#666"
                  fontSize="9"
                  fontFamily="JetBrains Mono, monospace"
                  textAnchor="end"
                >
                  {gridVal}
                </text>
              </g>
            );
          })}
          <path
            d={pathD}
            fill="none"
            stroke="#1040C0"
            strokeWidth="3.5"
          />
          {points.map((p, idx) => (
            <g key={idx} className="group">
              <rect
                x={p.x - 4}
                y={p.y - 4}
                width="8"
                height="8"
                fill="#F0C020"
                stroke="#111111"
                strokeWidth="2"
              />
              <rect
                x={p.x - 16}
                y={p.y - 25}
                width="32"
                height="18"
                fill="#111111"
              />
              <text
                x={p.x}
                y={p.y - 13}
                fill="#fff"
                fontSize="9"
                fontWeight="bold"
                fontFamily="JetBrains Mono, monospace"
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
                  fill="#111111"
                  fontSize="9"
                  fontWeight="bold"
                  fontFamily="JetBrains Mono, monospace"
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
    { label: "Performance", value: score.performance, color: "bg-[#1040C0]" },
    {
      label: "Code Quality",
      value: score.codeQuality,
      color: "bg-[#111111]",
    },
    { label: "Scalability", value: score.scalability, color: "bg-[#D02020]" },
    { label: "UI/UX", value: score.uiux, color: "bg-[#F0C020]" },
  ];

  return (
    <div className="bauhaus-card p-8 relative overflow-hidden">
      <div className="relative grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8">
        <div className="flex flex-col items-center justify-center bg-[#F0F0F0] border-2 border-[#111111] p-6 shadow-[3px_3px_0px_#111111]">
          <p className="text-xs uppercase tracking-widest font-mono font-bold text-[#111111] mb-4">
            Project health score
          </p>
          <GaugeChart score={score.overall} />
        </div>

        <div>
          <div className="flex items-center justify-between gap-4 mb-6 pb-4 border-b-2 border-[#111111]">
            <div>
              <h3 className="text-2xl font-black uppercase tracking-tight text-[#111111]">Engineering signals</h3>
              <p className="text-gray-600 text-sm mt-1 font-mono">
                Scored from repo structure, tools, dependencies, and analysis signals.
              </p>
            </div>
            <BarChart3 className="w-8 h-8 text-[#1040C0]" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {metrics.map((metric) => (
              <div
                key={metric.label}
                className="p-4 bg-white border-2 border-[#111111] shadow-[2px_2px_0px_#111111]"
              >
                <div className="flex justify-between text-sm mb-3">
                  <span className="text-[#111111] font-mono font-bold uppercase text-xs">
                    {metric.label}
                  </span>
                  <span className="font-mono font-black">{metric.value}</span>
                </div>
                <ScoreBar value={metric.value} color={metric.color} />
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-5">
            {(score.signals || []).slice(0, 4).map((signal) => (
              <div
                key={signal}
                className="flex items-center gap-2 text-xs font-mono font-bold text-[#111111] bg-[#F0F0F0] p-2.5 border border-[#111111]"
              >
                <Check className="w-4 h-4 text-[#1040C0] shrink-0 stroke-[3]" />
                {signal}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ScoreBar({ value, color = "bg-[#1040C0]" }) {
  return (
    <div className="h-3 bg-[#E5E5E5] border border-[#111111] overflow-hidden">
      <motion.div
        className={`h-full ${color}`}
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
      className={`bauhaus-card p-7 ${isWinner ? "border-[#1040C0] border-4" : ""}`}
    >
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <p className="text-xs uppercase tracking-widest font-mono font-bold text-gray-500">
            {label}
          </p>
          <h3 className="text-xl font-black uppercase text-[#111111] mt-2">{project.name}</h3>
        </div>
        {isWinner && (
          <div className="px-3 py-1 bg-[#F0C020] text-[#111111] border-2 border-[#111111] text-xs font-mono font-black uppercase flex items-center gap-1 shadow-[2px_2px_0px_#111111]">
            <Trophy className="w-3.5 h-3.5" /> Winner
          </div>
        )}
      </div>
      <div className="flex items-end gap-3 mb-5">
        <span className="text-5xl font-mono font-black text-[#111111]">{project.score.overall}</span>
        <span className="text-gray-500 font-mono font-bold mb-2">/ 100</span>
      </div>
      <ScoreBar
        value={project.score.overall}
        color={isWinner ? "bg-[#1040C0]" : "bg-[#111111]"}
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
    <div className="p-5 bg-white border-2 border-[#111111] shadow-[3px_3px_0px_#111111]">
      <div className="w-8 h-8 bg-[#F0C020] border-2 border-[#111111] text-[#111111] flex items-center justify-center text-sm font-mono font-bold mb-4">
        {index}
      </div>
      <p className="text-sm text-[#111111] leading-relaxed">
        {getShortText(text, 170)}
      </p>
    </div>
  );
}

function PointList({ points }) {
  return (
    <div className="space-y-3">
      {points.map((point, i) => (
        <div key={i} className="flex gap-3 bg-white p-3 border-2 border-[#111111] shadow-[2px_2px_0px_#111111]">
          <Check className="w-4 h-4 text-[#1040C0] mt-1 shrink-0 stroke-[3]" />
          <p className="text-sm text-[#111111] font-mono leading-relaxed">
            {getShortText(point, 190)}
          </p>
        </div>
      ))}
    </div>
  );
}

function ArchitectureFlow() {
  const steps = [
    { label: "React UI", icon: LayoutDashboard, color: "text-[#1040C0]" },
    { label: "State + Calls", icon: Zap, color: "text-[#D02020]" },
    { label: "API / Supabase", icon: BrainCircuit, color: "text-[#111111]" },
    { label: "Database", icon: FileText, color: "text-[#1040C0]" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
      {steps.map((step, i) => {
        const Icon = step.icon;
        return (
          <div
            key={step.label}
            className="relative p-4 bg-white border-2 border-[#111111] shadow-[3px_3px_0px_#111111] min-h-28"
          >
            <Icon className={`w-6 h-6 ${step.color} mb-4`} />
            <p className="font-extrabold uppercase font-mono text-xs text-[#111111]">{step.label}</p>
            {i < steps.length - 1 && (
              <ChevronRight className="hidden sm:block absolute -right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#111111] z-10 font-bold" />
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
        className="flex items-center gap-2 text-xs font-mono font-black uppercase text-[#1040C0] hover:underline"
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
            <div className="mt-4 p-5 bg-white border-2 border-[#111111] shadow-[3px_3px_0px_#111111] font-mono text-xs text-[#111111] leading-relaxed whitespace-pre-wrap">
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
        className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-6"
        onClick={onCancel}
      >
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.96 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-md bauhaus-card p-7"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="w-12 h-12 bg-[#F0C020] border-2 border-[#111111] text-[#111111] flex items-center justify-center mb-5 shadow-[2px_2px_0px_#111111]">
            <Trash2 className="w-5 h-5 text-[#D02020]" />
          </div>
          <h3 className="text-2xl font-black uppercase tracking-tight text-[#111111] mb-3">{title}</h3>
          <p className="text-gray-700 font-mono text-xs leading-relaxed">{description}</p>

          <div className="mt-7 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="bauhaus-btn-secondary px-5 py-2.5 text-xs font-mono font-bold uppercase"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className={`px-5 py-2.5 text-xs font-mono font-bold uppercase border-2 border-[#111111] shadow-[3px_3px_0px_#111111] transition-transform active:translate-x-0.5 active:translate-y-0.5 ${
                confirmTone === "danger"
                  ? "bg-[#D02020] hover:bg-red-700 text-white"
                  : "bg-[#1040C0] hover:bg-blue-800 text-white"
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
      className={`bauhaus-card p-8 ${className}`}
    >
      <h3 className={`text-xl font-black uppercase tracking-tight mb-5 pb-3 border-b-2 border-[#111111] ${color} flex items-center gap-3`}>
        <Icon className="w-6 h-6" /> {title}
      </h3>
      {children}
    </div>
  );
}

function EmptyState({ title, message }) {
  return (
    <div className="space-y-6">
      <div className="bauhaus-card h-80 flex flex-col items-center justify-center text-[#111111] gap-6 border-dashed border-3 border-[#111111] bg-white">
        <div className="w-16 h-16 bg-[#F0C020] border-2 border-[#111111] flex items-center justify-center shadow-[3px_3px_0px_#111111]">
          <Sparkles className="w-8 h-8 text-[#111111]" />
        </div>
        <div className="text-center">
          <h3 className="text-xl font-black uppercase tracking-tight text-[#111111] mb-2">
            {title} Pending
          </h3>
          <p className="max-w-xs mx-auto text-xs font-mono text-gray-600">{message}</p>
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
