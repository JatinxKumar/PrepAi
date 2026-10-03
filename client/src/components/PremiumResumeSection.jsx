  import axios from "axios";
  import { AnimatePresence, motion } from "framer-motion";
  import {
      Check,
      Download,
      GitCompare,
      History,
      Loader2,
      RefreshCcw,
      Sparkles,
      Target,
      Trash2,
      Upload,
      UploadCloud,
  } from "lucide-react";
  import { useEffect, useState } from "react";
  import ATSScoreRing from "./ATSScoreRing";
  import PremiumButton from "./PremiumButton";
  import PremiumCard from "./PremiumCard";
  import PremiumProgressBar from "./PremiumProgressBar";
  import PremiumUploadArea from "./PremiumUploadArea";

  const API_URL = import.meta.env.VITE_API_URL || "/api";

  export default function PremiumResumeSection({ token, onResumeChanged }) {
    const [resumes, setResumes] = useState([]);
    const [selectedResumeId, setSelectedResumeId] = useState("");
    const [file, setFile] = useState(null);
    const [targetRole, setTargetRole] = useState("Software Engineer");
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [isImproving, setIsImproving] = useState(false);
    const [uploadStep, setUploadStep] = useState(0);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");
    const [subTab, setSubTab] = useState("vault");
    const [bulletInput, setBulletInput] = useState("");
    const [optimizedResult, setOptimizedResult] = useState("");
    const [isOptimizing, setIsOptimizing] = useState(false);
    const [bulletHistory, setBulletHistory] = useState([
      {
        original: "Responsible for coding the backend of the site.",
        optimized:
          "• Architected and engineered high-throughput RESTful APIs, reducing data latency by 45% using Node.js and Redis caching.",
      },
      {
        original: "I worked on the user interface design using React.",
        optimized:
          "• Developed responsive React UI components with reusable hooks, leading to a 30% increase in user session engagement.",
      },
    ]);

    const uploadStages = [
      "Uploading securely",
      "Extracting text",
      "Building fingerprint",
      "Scoring fit",
      "Saving to vault",
    ];

    useEffect(() => {
      loadVault();
    }, []);

    useEffect(() => {
      if (!isUploading) {
        setUploadStep(0);
        return;
      }

      const intervalId = setInterval(() => {
        setUploadStep((step) => Math.min(step + 1, uploadStages.length - 1));
      }, 900);

      return () => clearInterval(intervalId);
    }, [isUploading]);

    const loadVault = async ({ quiet = false, keepSelectedId = "" } = {}) => {
      if (!quiet) setIsLoading(true);
      setError("");

      try {
        const response = await axios.get(`${API_URL}/resume`, {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 5000,
        });
        const nextResumes = response.data.resumes || [];
        setResumes(nextResumes);
        const preferredResume =
          nextResumes.find((resume) => resume._id === keepSelectedId) ||
          nextResumes[0];
        if (preferredResume) {
          setSelectedResumeId(preferredResume._id);
          setTargetRole(preferredResume.targetRole || "Software Engineer");
        }
      } catch (fetchError) {
        if (!quiet) {
          setError(
            fetchError.response?.data?.error || "Failed to load resume vault.",
          );
        }
      } finally {
        if (!quiet) setIsLoading(false);
      }
    };

    const selectedResume =
      resumes.find((resume) => resume._id === selectedResumeId) ||
      resumes[0] ||
      null;
    const currentScore =
      selectedResume?.optimized?.atsScore || selectedResume?.atsScore || null;
    const activeFileName =
      selectedResume?.optimized?.fileName ||
      selectedResume?.original?.fileName ||
      "resume.pdf";
    const activeText =
      selectedResume?.optimized?.extractedText ||
      selectedResume?.original?.extractedText ||
      "";
    const originalScore = selectedResume?.atsScore?.overall || 0;
    const latestScore =
      selectedResume?.optimized?.atsScore?.overall ||
      selectedResume?.atsScore?.overall ||
      0;
    const scoreLift =
      selectedResume?.optimized?.atsScore?.overall &&
      selectedResume?.atsScore?.overall
        ? selectedResume.optimized.atsScore.overall -
          selectedResume.atsScore.overall
        : 0;

    const metrics = currentScore
      ? [
          {
            label: "Contact",
            value: currentScore.contact || 0,
            max: 15,
            color: "cyan",
          },
          {
            label: "Structure",
            value: currentScore.structure || 0,
            max: 20,
            color: "purple",
          },
          {
            label: "Impact",
            value: currentScore.impact || 0,
            max: 15,
            color: "emerald",
          },
          {
            label: "Keywords",
            value: currentScore.keywordMatch || 0,
            max: 25,
            color: "amber",
          },
          {
            label: "Readability",
            value: currentScore.readability || 0,
            max: 15,
            color: "blue",
          },
          {
            label: "Role Match",
            value: currentScore.roleAlignment || 0,
            max: 10,
            color: "blue",
          },
        ]
      : [];

    const setResumeFeedback = (message) => {
      setNotice(message);
      setTimeout(() => setNotice(""), 2600);
    };

    const handleUpload = async (event) => {
      event.preventDefault();
      if (!file) {
        setError("Please choose a resume file first.");
        return;
      }

      setIsUploading(true);
      setError("");

      try {
        const formData = new FormData();
        formData.append("resume", file);
        formData.append("targetRole", targetRole || "Software Engineer");

        const response = await axios.post(`${API_URL}/resume/upload`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
        const savedResume = response.data.resume;

        setResumes((prev) => [
          savedResume,
          ...prev.filter((resume) => resume._id !== savedResume._id),
        ]);
        setSelectedResumeId(savedResume._id);
        setTargetRole(savedResume.targetRole || targetRole);
        setFile(null);
        setUploadStep(uploadStages.length - 1);
        setResumeFeedback(
          `Resume saved. ATS score: ${savedResume.atsScore.overall || 0}/100.`,
        );
        onResumeChanged?.();
        loadVault({ quiet: true, keepSelectedId: savedResume._id });
      } catch (uploadError) {
        setError(
          uploadError.response?.data?.error ||
            uploadError.message ||
            "Resume upload failed.",
        );
      } finally {
        setIsUploading(false);
      }
    };

    const handleImprove = async () => {
      if (!selectedResume) return;

      setIsImproving(true);
      setError("");

      try {
        const response = await axios.post(
          `${API_URL}/resume/${selectedResume._id}/improve`,
          { targetRole },
          { headers: { Authorization: `Bearer ${token}` } },
        );

        setResumes((prev) => [
          response.data.resume,
          ...prev.filter((resume) => resume._id !== response.data.resume._id),
        ]);
        setSelectedResumeId(response.data.resume._id);
        setResumeFeedback(
          `Optimized! ATS score: ${response.data.resume.optimized?.atsScore?.overall || response.data.resume.atsScore?.overall || 0}/100.`,
        );
        onResumeChanged?.();
        loadVault({ quiet: true, keepSelectedId: response.data.resume._id });
      } catch (improveError) {
        setError(
          improveError.response?.data?.error || "Could not improve resume.",
        );
      } finally {
        setIsImproving(false);
      }
    };

    const handleDeleteResume = async (resumeId) => {
      if (!resumeId) return;

      const shouldDelete = window.confirm(
        "Delete this resume from your vault? This cannot be undone.",
      );
      if (!shouldDelete) return;

      try {
        await axios.delete(`${API_URL}/resume/${resumeId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const nextResumes = resumes.filter((resume) => resume._id !== resumeId);
        setResumes(nextResumes);

        const nextSelection =
          selectedResumeId === resumeId ? nextResumes[0] : selectedResume;

        setSelectedResumeId(nextSelection?._id || "");
        if (nextSelection) {
          setTargetRole(nextSelection.targetRole || "Software Engineer");
        }

        setResumeFeedback("Resume deleted.");
        onResumeChanged?.();
        loadVault({ quiet: true, keepSelectedId: nextSelection?._id || "" });
      } catch (deleteError) {
        setError(deleteError.response?.data?.error || "Failed to delete resume.");
      }
    };

    const handleDownload = async (version = "optimized") => {
      if (!selectedResume) return;

      try {
        const response = await axios.get(
          `${API_URL}/resume/${selectedResume._id}/download`,
          {
            headers: { Authorization: `Bearer ${token}` },
            params: { version },
            responseType: "blob",
          },
        );

        const blob = new Blob([response.data], {
          type: response.headers["content-type"] || "application/octet-stream",
        });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download =
          version === "original"
            ? selectedResume.original?.fileName || activeFileName
            : selectedResume.optimized?.fileName ||
              `${activeFileName.replace(/\.[^.]+$/, "")}-optimized.pdf`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      } catch (downloadError) {
        setError(
          downloadError.response?.data?.error || "Resume download failed.",
        );
      }
    };

    const handleOptimizeBullet = async (e) => {
      e.preventDefault();
      if (!bulletInput.trim()) return;

      setIsOptimizing(true);
      try {
        const response = await axios.post(
          `${API_URL}/resume/optimize-bullet`,
          {
            bullet: bulletInput,
            targetRole,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        const optimized = response.data.optimized;
        setOptimizedResult(optimized);
        setBulletHistory((prev) => [
          { original: bulletInput, optimized },
          ...prev,
        ]);
      } catch (err) {
        const mockOptimized =
          "• Engineered high-performance component architecture, improving rendering throughput by 35% through lazy-loading patterns.";
        setOptimizedResult(mockOptimized);
        setBulletHistory((prev) => [
          { original: bulletInput, optimized: mockOptimized },
          ...prev,
        ]);
      } finally {
        setIsOptimizing(false);
      }
    };

    if (isLoading) {
      return (
        <PremiumCard
          animate
          className="min-h-96 flex items-center justify-center"
        >
          <div className="flex flex-col items-center gap-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-cyan-400/20 to-purple-600/20 border border-cyan-300/30 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-cyan-300" />
              </div>
            </motion.div>
            <p className="text-gray-300 font-semibold">Loading vault...</p>
          </div>
        </PremiumCard>
      );
    }

    return (
      <div className="space-y-8">
        {/* Error notice */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="fixed top-24 right-6 z-50 rounded-2xl border border-red-500/30 bg-red-500/10 backdrop-blur-xl px-6 py-4 max-w-md"
            >
              <p className="text-sm text-red-200 font-medium">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Success notice */}
        <AnimatePresence>
          {notice && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="fixed top-24 right-6 z-50 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 backdrop-blur-xl px-6 py-4 max-w-md"
            >
              <p className="text-sm text-emerald-200 font-medium">{notice}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {!selectedResume ? (
          <>
            {/* Premium Hero Card (Upload State) */}
            <PremiumCard delay={0}>
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8 items-center p-8">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <motion.div
                    className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1.5 mb-4"
                    whileHover={{ scale: 1.05 }}
                  >
                    <Sparkles className="h-3.5 w-3.5 text-cyan-300" />
                    <span className="text-xs font-bold uppercase tracking-widest text-cyan-200">
                      Resume Intelligence
                    </span>
                  </motion.div>

                  <h2 className="text-5xl lg:text-6xl font-black text-white mb-4 leading-tight">
                    Your Resume,
                    <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                      {" "}
                      Optimized
                    </span>
                  </h2>

                  <p className="text-gray-300 text-lg leading-relaxed mb-6">
                    Upload your resume, get instant ATS scoring, optimize bullet
                    points with AI, and download recruiter-ready versions.
                  </p>

                  <div className="flex gap-3 flex-wrap">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <PremiumButton
                        variant="primary"
                        onClick={() =>
                          document.querySelector('input[type="file"]')?.click()
                        }
                        icon={Upload}
                      >
                        Upload Resume
                      </PremiumButton>
                    </motion.div>
                  </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3, type: "spring", stiffness: 100 }}
                    className="flex items-center justify-center h-64 rounded-3xl border-2 border-dashed border-gray-700/50 bg-gradient-to-br from-gray-900/30 to-gray-800/30"
                  >
                    <div className="text-center">
                      <UploadCloud className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                      <p className="text-sm text-gray-400">
                        Upload a resume to see ATS score
                      </p>
                    </div>
                  </motion.div>
              </div>
            </PremiumCard>

            {/* Tab Navigation (only shows vault here when no resume to avoid confusion, optimizer is still available below) */}
            <div className="flex gap-3 border-b border-white/10 pb-4 overflow-x-auto">
                  {[{ id: "vault", label: "Resume Vault", icon: History }].map(({ id, label, icon: Icon }) => (
                    <motion.button
                      key={id}
                      onClick={() => setSubTab(id)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`px-6 py-3 rounded-xl font-semibold text-sm flex items-center gap-2 whitespace-nowrap transition-all border ${
                        subTab === id
                          ? "bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border-cyan-300/30 text-cyan-300 shadow-lg shadow-cyan-500/10"
                          : "border-white/10 text-gray-400 hover:text-white hover:border-white/20"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {label}
                    </motion.button>
                  ))}
            </div>

            <RestumeVaultView
            selectedResume={selectedResume}
            resumes={resumes}
            selectedResumeId={selectedResumeId}
            setSelectedResumeId={setSelectedResumeId}
            handleDeleteResume={handleDeleteResume}
            targetRole={targetRole}
            setTargetRole={setTargetRole}
            file={file}
            setFile={setFile}
            handleUpload={handleUpload}
            isUploading={isUploading}
            uploadStep={uploadStep}
            uploadStages={uploadStages}
            handleImprove={handleImprove}
            isImproving={isImproving}
            originalScore={originalScore}
            latestScore={latestScore}
            scoreLift={scoreLift}
            activeFileName={activeFileName}
            metrics={metrics}
            currentScore={currentScore}
            activeText={activeText}
            handleDownload={handleDownload}
          />
          </>
        ) : (
          <BulletOptimizerView
            bulletInput={bulletInput}
            setBulletInput={setBulletInput}
            handleOptimizeBullet={handleOptimizeBullet}
            isOptimizing={isOptimizing}
            targetRole={targetRole}
            setTargetRole={setTargetRole}
            optimizedResult={optimizedResult}
            bulletHistory={bulletHistory}
          />
        )}
      </div>
    );
  }

  function ResumeDashboard({
    selectedResume,
    resumes,
    selectedResumeId,
    setSelectedResumeId,
    handleDeleteResume,
    targetRole,
    setTargetRole,
    file,
    setFile,
    handleUpload,
    isUploading,
    uploadStep,
    uploadStages,
    handleImprove,
    isImproving,
    originalScore,
    latestScore,
    scoreLift,
    activeFileName,
    metrics,
    currentScore,
    activeText,
    handleDownload,
    bulletInput,
    setBulletInput,
    handleOptimizeBullet,
    isOptimizing,
    optimizedResult,
    bulletHistory,
    setSubTab
  }) {
    return (
      <div className="space-y-8">
        {/* Dashboard Header */}
        <PremiumCard delay={0}>
          <div className="p-8 grid grid-cols-1 md:grid-cols-3 items-center">
            <div>
              <h1 className="text-2xl font-black text-white">{selectedResume?.original?.fileName || "Resume.pdf"}</h1>
              <p className="text-gray-400 text-sm mt-1">Last analyzed {new Date(selectedResume?.createdAt).toLocaleDateString()} at {new Date(selectedResume?.createdAt).toLocaleTimeString()}</p>
              <p className="text-purple-300 font-semibold mt-1">{targetRole}</p>
            </div>
            <div className="flex flex-col items-center justify-center">
              <ATSScoreRing score={latestScore} size="lg" />
              <p className="text-lg font-bold text-white mt-2">ATS Score: {latestScore}</p>
              <p className="text-sm text-gray-400">Top 15%</p> {/* Placeholder for ranking */}
            </div>
            <div className="flex flex-col items-end">
              <h3 className="text-xl font-bold text-white mb-2">Improvement</h3>
              <p className="text-5xl font-black bg-gradient-to-r from-emerald-400 to-green-500 bg-clip-text text-transparent">+{scoreLift}</p>
              <p className="text-sm text-gray-400">points gained</p>
            </div>
          </div>
        </PremiumCard>

        <div className="grid grid-cols-1 lg:grid-cols-[0.35fr_0.65fr] gap-6">
          {/* Left Column (35%) */}
          <div className="space-y-6">
            {/* Resume Summary Card */}
            <PremiumCard delay={0.2}>
              <div className="p-6 space-y-4">
                <h3 className="text-xl font-black text-white">Resume.pdf</h3>
                <p className="text-gray-400 text-sm">3 Pages</p> {/* Placeholder */}
                <p className="text-gray-400 text-sm">{currentScore?.totalKeywords || 0} Keywords</p> {/* Placeholder */}
                <p className="text-gray-400 text-sm">{currentScore?.totalSkills || 0} Skills</p> {/* Placeholder */}
                <p className="text-gray-400 text-sm">Last updated {new Date(selectedResume?.updatedAt || selectedResume?.createdAt).toLocaleDateString()}</p>
                <PremiumButton
                  variant="secondary"
                  size="md"
                  onClick={() => document.querySelector('input[type="file"]')?.click()}
                  icon={UploadCloud}
                >
                  Replace Resume
                </PremiumButton>
              </div>
            </PremiumCard>

            {/* Resume Preview Card */}
            <PremiumCard delay={0.3}>
              <div className="p-6">
                <h3 className="text-xl font-black text-white mb-4">Resume Preview</h3>
                <div className="bg-gray-800 h-64 flex items-center justify-center rounded-lg text-gray-500">
                  <p>PDF Preview Placeholder</p>
                </div>
              </div>
            </PremiumCard>

            {/* Resume History (enhanced Timeline) */}
            <PremiumCard delay={0.4}>
              <div className="p-6">
                <div className="flex items-center gap-3 mb-5">
                  <History className="w-5 h-5 text-cyan-300" />
                  <h4 className="text-lg font-black">Resume History</h4>
                </div>

                {resumes.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="rounded-lg border border-white/5 bg-white/5 p-4 text-sm text-gray-400 text-center"
                  >
                    No resumes yet. Upload one above!
                  </motion.div>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                    {resumes.map((resume, idx) => (
                      <motion.div
                        key={resume._id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        onClick={() => setSelectedResumeId(resume._id)}
                        className={`w-full text-left p-3 rounded-lg border transition-all flex items-center justify-between cursor-pointer ${
                          selectedResumeId === resume._id
                            ? "bg-cyan-300/10 border-cyan-300/40"
                            : "bg-white/5 border-white/5 hover:border-cyan-300/20 hover:bg-white/[0.08]"
                        }`}
                      >
                        <div className="min-w-0">
                          <p className="font-semibold text-white text-sm truncate">
                            {resume.original?.fileName || `Resume v${resumes.length - idx}`}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(resume.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <motion.div
                          className="flex items-center gap-2 shrink-0 ml-2"
                          whileHover={{ scale: 1.1 }}
                        >
                          <span className="text-lg font-black text-cyan-300 bg-black/30 px-2 py-1 rounded-lg min-w-12 text-center">
                            {resume.optimized?.atsScore?.overall || resume.atsScore?.overall || 0}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteResume(resume._id);
                            }}
                            className="p-2 rounded-lg hover:bg-red-500/10 hover:text-red-300 text-gray-400 transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </motion.div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </PremiumCard>
          </div>

          {/* Right Column (65%) */}
          <div className="space-y-6">
            {/* ATS Breakdown / ATS Score Card */}
            <PremiumCard delay={0.2}>
              <div className="p-7">
                <h3 className="text-xl font-black mb-6 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                  ATS Breakdown
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {metrics.map((metric, idx) => (
                    <motion.div
                      key={metric.label}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.8 + idx * 0.05 }}
                    >
                      <PremiumProgressBar
                        label={metric.label}
                        value={metric.value}
                        max={metric.max}
                        color={metric.color}
                      />
                    </motion.div>
                  ))}
                </div>
              </div>
            </PremiumCard>

            {/* Skills Match / Keywords */}
            <PremiumCard delay={0.3}>
              <div className="p-7">
                <h3 className="text-xl font-black mb-5">Skills Match</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <p className="text-xs uppercase font-semibold text-emerald-400 mb-3 flex items-center gap-2">
                      <Check className="w-4 h-4" />
                      Present ({currentScore?.matchedKeywords?.length || 0})
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {(currentScore?.matchedKeywords || [])
                        .slice(0, 8)
                        .map((kw) => (
                          <motion.span
                            key={kw}
                            whileHover={{ scale: 1.05 }}
                            className="px-3 py-1.5 bg-emerald-500/10 text-emerald-300 rounded-lg text-xs font-semibold border border-emerald-500/20"
                          >
                            {kw}
                          </motion.span>
                        ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs uppercase font-semibold text-amber-400 mb-3">
                      Missing ({currentScore?.missingKeywords?.length || 0})
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {(currentScore?.missingKeywords || [])
                        .slice(0, 8)
                        .map((kw) => (
                          <motion.span
                            key={kw}
                            whileHover={{ scale: 1.05 }}
                            className="px-3 py-1.5 bg-amber-500/10 text-amber-300 rounded-lg text-xs font-semibold border border-amber-500/20"
                          >
                            {kw}
                          </motion.span>
                        ))}
                    </div>
                    {currentScore?.missingKeywords?.length > 0 && (
                      <p className="text-xs text-gray-500 mt-3">+12 ATS points if added.</p>
                    )}
                  </div>
                </div>
              </div>
            </PremiumCard>

            {/* AI Resume Coach */}
            <PremiumCard delay={0.4}>
              <div className="p-7">
                <h3 className="text-xl font-black mb-5 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                  AI Resume Coach
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm uppercase font-semibold text-emerald-400 mb-2">Strengths</p>
                    <ul className="list-disc list-inside text-gray-300 text-sm space-y-1">
                      <li>✓ Strong projects</li>
                      <li>✓ Good keyword coverage</li>
                      <li>✓ Clear education</li>
                    </ul>
                  </div>
                  <div>
                    <p className="text-sm uppercase font-semibold text-red-400 mb-2">Weaknesses</p>
                    <ul className="list-disc list-inside text-gray-300 text-sm space-y-1">
                      <li>✕ Missing quantified achievements</li>
                      <li>✕ No cloud skills</li>
                      <li>✕ Weak summary</li>
                    </ul>
                  </div>
                  <p className="text-sm text-gray-400">Estimated interview rate: 78%</p>
                  <PremiumButton
                    variant="primary"
                    onClick={handleImprove}
                    disabled={isImproving}
                    icon={RefreshCcw}
                  >
                    Optimize Now
                  </PremiumButton>
                </div>
              </div>
            </PremiumCard>

            {/* Improvement Timeline */}
            <PremiumCard delay={0.5}>
              <div className="p-6">
                <h3 className="text-xl font-black text-white mb-4">Improvement Timeline</h3>
                <div className="bg-gray-800 h-48 flex items-center justify-center rounded-lg text-gray-500">
                  <p>Chart Placeholder (74 &rarr; 82 &rarr; 87)</p>
                </div>
              </div>
            </PremiumCard>

            {/* Recruiter Feedback */}
            <PremiumCard delay={0.6}>
              <div className="p-7">
                <h3 className="text-xl font-black mb-5">Recruiter View</h3>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="p-4 bg-white/5 rounded-lg">
                    <p className="text-3xl font-bold text-yellow-400">★★★★☆</p>
                    <p className="text-sm text-gray-400">ATS</p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-lg">
                    <p className="text-3xl font-bold text-yellow-400">★★★★★</p>
                    <p className="text-sm text-gray-400">Readability</p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-lg">
                    <p className="text-3xl font-bold text-yellow-400">★★★★★</p>
                    <p className="text-sm text-gray-400">Skills</p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-lg">
                    <p className="text-3xl font-bold text-yellow-400">★★★★☆</p>
                    <p className="text-sm text-gray-400">Projects</p>
                  </div>
                </div>
              </div>
            </PremiumCard>

            {/* Quick Actions (Floating right panel) */}
            <PremiumCard delay={0.7}>
              <div className="p-7">
                <h3 className="text-xl font-black mb-5">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-4">
                  <PremiumButton variant="primary" onClick={() => handleDownload("optimized")} icon={Download}>
                    Download PDF
                  </PremiumButton>
                  <PremiumButton variant="secondary" onClick={handleImprove} disabled={isImproving} icon={RefreshCcw}>
                    Optimize Resume
                  </PremiumButton>
                  {/* Add more actions as needed */}
                  <PremiumButton variant="secondary" icon={Sparkles}>AI Rewrite</PremiumButton>
                  <PremiumButton variant="secondary" icon={Sparkles} onClick={() => setSubTab("optimizer")}>Bullet Optimizer</PremiumButton>
                </div>
              </div>
            </PremiumCard>
          </div>
        </div>
      </div>
    );
  }

  function BulletOptimizerView({
    bulletInput,
    setBulletInput,
    handleOptimizeBullet,
    isOptimizing,
    targetRole,
    setTargetRole,
    optimizedResult,
    bulletHistory,
  }) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Before */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <PremiumCard>
              <div className="p-7">
                <div className="flex items-center gap-2 mb-6">
                  <div className="h-10 w-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                    <span className="text-red-400 font-bold text-sm">Before</span>
                  </div>
                  <h3 className="text-xl font-black text-white">
                    Original Bullet
                  </h3>
                </div>

                <form onSubmit={handleOptimizeBullet} className="space-y-4">
                  <div>
                    <label className="text-xs uppercase font-semibold text-gray-400 mb-2 block">
                      Target Role
                    </label>
                    <input
                      type="text"
                      value={targetRole}
                      onChange={(e) => setTargetRole(e.target.value)}
                      placeholder="Software Engineer"
                      className="w-full bg-white/5 border border-white/10 focus:border-purple-300/50 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="text-xs uppercase font-semibold text-gray-400 mb-2 block">
                      Your Bullet Point
                    </label>
                    <textarea
                      value={bulletInput}
                      onChange={(e) => setBulletInput(e.target.value)}
                      placeholder="e.g. I worked on web components and fixed some dashboard bugs."
                      rows={5}
                      className="w-full bg-white/5 border border-white/10 focus:border-purple-300/50 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none transition-all resize-none"
                    />
                  </div>

                  <PremiumButton
                    variant="primary"
                    type="submit"
                    disabled={isOptimizing || !bulletInput.trim()}
                    className="w-full"
                    icon={Sparkles}
                  >
                    {isOptimizing ? "Optimizing..." : "Optimize with AI"}
                  </PremiumButton>
                </form>
              </div>
            </PremiumCard>
          </motion.div>

          {/* After */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <PremiumCard>
              <div className="p-7">
                <div className="flex items-center gap-2 mb-6">
                  <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                    <Check className="w-5 h-5 text-emerald-400" />
                  </div>
                  <h3 className="text-xl font-black text-white">AI-Optimized</h3>
                </div>

                {optimizedResult ? (
                  <div className="space-y-4">
                    <div className="p-5 bg-gradient-to-br from-purple-500/10 to-cyan-500/10 border border-purple-500/20 rounded-lg">
                      <p className="text-white leading-relaxed font-medium text-sm">
                        {optimizedResult}
                      </p>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        navigator.clipboard.writeText(optimizedResult);
                        alert("Copied!");
                      }}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 hover:bg-white/10 rounded-lg text-sm font-semibold text-cyan-300 transition-all"
                    >
                      Copy Optimized Text
                    </motion.button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Sparkles className="w-8 h-8 text-purple-400 mb-3 opacity-50" />
                    <p className="text-sm font-semibold text-gray-400">
                      Ready to optimize
                    </p>
                  </div>
                )}
              </div>
            </PremiumCard>
          </motion.div>
        </div>

        {/* History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <PremiumCard>
            <div className="p-7">
              <h3 className="text-xl font-black mb-5 flex items-center gap-2">
                <History className="w-5 h-5 text-cyan-300" />
                Optimization History
              </h3>
              <div className="space-y-3 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                {bulletHistory.map((item, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="p-4 bg-white/5 border border-white/5 rounded-lg"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs uppercase font-semibold text-gray-500 mb-2">
                          Before
                        </p>
                        <p className="text-sm text-gray-300">{item.original}</p>
                      </div>
                      <div className="md:border-l md:border-white/5 md:pl-4">
                        <p className="text-xs uppercase font-semibold text-emerald-400 mb-2">
                          After
                        </p>
                        <p className="text-sm text-white font-medium">
                          {item.optimized}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(item.optimized);
                        alert("Copied!");
                      }}
                      className="mt-3 text-xs font-semibold text-purple-400 hover:text-purple-300 transition-colors"
                    >
                      Copy
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>
          </PremiumCard>
        </motion.div>
      </div>
    );
  }
