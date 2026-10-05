import React, { useState, useRef } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  UploadCloud,
  Trash2,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  RefreshCcw,
  FileCheck,
  Briefcase,
  Loader2,
  ChevronDown,
  ChevronUp,
  Check,
  MinusCircle,
  XCircle,
  Award,
  Target,
  ShieldAlert,
  Zap,
  Brain,
  Lightbulb,
  BookOpen,
  Layers,
  Database,
  Code2,
  Cpu,
  Users,
  GraduationCap,
  Info,
} from "lucide-react";
import useAuthStore from "../store/authStore";

const API_URL = import.meta.env.VITE_API_URL || "/api";

export default function AIResumeTailor() {
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState("");
  const [uploadError, setUploadError] = useState(null);
  const [uploadedResume, setUploadedResume] = useState(null);
  const [jobAnalysis, setJobAnalysis] = useState(null);
  const [matchAnalysis, setMatchAnalysis] = useState(null);
  const [presentation, setPresentation] = useState(null);
  const [expandedReqs, setExpandedReqs] = useState({});
  const [expandedGaps, setExpandedGaps] = useState({});

  const { token } = useAuthStore();
  const fileInputRef = useRef(null);
  const jdFileInputRef = useRef(null);

  // Format file size nicely (KB / MB)
  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Handle resume file selection
  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (selected) {
      validateAndSetFile(selected);
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      validateAndSetFile(droppedFile);
    }
  };

  const validateAndSetFile = (selectedFile) => {
    const ext = selectedFile.name.split(".").pop().toLowerCase();
    if (ext === "pdf" || ext === "docx" || ext === "doc" || ext === "txt" || ext === "md") {
      setFile(selectedFile);
      setUploadError(null);
      setUploadedResume(null);
      setJobAnalysis(null);
      setMatchAnalysis(null);
      setPresentation(null);
    } else {
      setUploadError("Please select a valid PDF, DOCX, DOC, TXT, or MD file.");
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setUploadError(null);
    setUploadedResume(null);
    setJobAnalysis(null);
    setMatchAnalysis(null);
    setPresentation(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Optional: JD File Upload handler (reads text files)
  const handleJDUpload = (e) => {
    const jdFile = e.target.files?.[0];
    if (!jdFile) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      if (typeof text === "string") {
        setJobDescription(text);
      }
    };
    reader.readAsText(jdFile);
  };

  // Toggle requirement evidence accordion
  const toggleExpand = (reqId) => {
    setExpandedReqs((prev) => ({
      ...prev,
      [reqId]: !prev[reqId],
    }));
  };

  // Toggle gap group expansion
  const toggleGap = (groupId) => {
    setExpandedGaps((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  // Workflow Handler: Upload Resume -> Parse -> Match Job Engine
  const handleAnalyzeMatch = async () => {
    if (!file || !jobDescription.trim()) return;

    setIsAnalyzing(true);
    setUploadError(null);
    setAnalysisStep("Uploading & Ingesting Resume...");

    const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

    try {
      let currentResume = uploadedResume;

      // Step 1: Upload resume if not already uploaded
      if (!currentResume) {
        const formData = new FormData();
        formData.append("resume", file);

        const uploadResponse = await axios.post(`${API_URL}/resume/upload`, formData, {
          headers: {
            ...authHeaders,
            "Content-Type": "multipart/form-data",
          },
        });

        if (uploadResponse.data && uploadResponse.data.resume) {
          currentResume = uploadResponse.data.resume;
          setUploadedResume(currentResume);
        } else {
          throw new Error("Resume upload failed.");
        }
      }

      // Step 2: Execute Match Job Endpoint
      setAnalysisStep("Analyzing resume against job...");
      const matchResponse = await axios.post(
        `${API_URL}/resume/${currentResume._id}/match-job`,
        { jobDescription: jobDescription.trim() },
        { headers: authHeaders }
      );

      if (matchResponse.data && matchResponse.data.matchAnalysis) {
        setMatchAnalysis(matchResponse.data.matchAnalysis);
        if (matchResponse.data.presentation) {
          setPresentation(matchResponse.data.presentation);
        }
        if (matchResponse.data.resume) {
          setUploadedResume(matchResponse.data.resume);
          if (matchResponse.data.resume.jobAnalysis) {
            setJobAnalysis(matchResponse.data.resume.jobAnalysis);
          }
        }
      } else {
        throw new Error("Invalid response received from match engine.");
      }
    } catch (err) {
      console.error("Resume / Job match error:", err);
      const message =
        err.response?.data?.error ||
        err.message ||
        "Failed to process request. Please try again.";
      setUploadError(message);
    } finally {
      setIsAnalyzing(false);
      setAnalysisStep("");
    }
  };

  const isFormValid = Boolean(file && jobDescription.trim().length > 0);

  const categoryIcons = {
    "Systems & Infrastructure": Cpu,
    "Technical & Programming Skills": Code2,
    "Core Responsibilities": Layers,
    "Business & Client Engagement": Users,
    "Education & Qualifications": GraduationCap,
    "Experience & Seniority": Brain,
    "Domain & General Requirements": Database,
  };

  const StatusBadge = ({ status }) => {
    const styles = {
      strong: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
      partial: "bg-amber-500/20 text-amber-300 border-amber-500/30",
      missing: "bg-red-500/20 text-red-300 border-red-500/30",
    };
    const labels = {
      strong: "Verified",
      partial: "Partial",
      missing: "Missing",
    };
    return (
      <span className={`text-[10px] uppercase font-mono px-1.5 py-0.5 rounded ${styles[status] || styles.strong}`}>
        {labels[status] || status}
      </span>
    );
  };

  // --- Section: Match Analysis v2 ---
  if (presentation) {
    const overview = presentation.overview;
    const summary = overview?.summary || { strong: 0, partial: 0, missing: 0 };

    return (
      <div className="max-w-6xl mx-auto space-y-8 font-sans pb-12">
        {/* 1. HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.15)]">
                <Sparkles className="w-5 h-5 text-purple-400" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-white font-heading">
                Match Analysis v2
              </h1>
            </div>
            <p className="text-slate-400 text-sm max-w-xl leading-relaxed">
              Deterministic, evidence-grounded alignment between your resume and this job description.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-white/5 border border-white/10 text-slate-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Evidence-Based
            </span>
          </div>
        </div>

        {/* 2. OVERALL SCORE SECTION */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-purple-500/30 bg-gradient-to-br from-purple-950/40 via-purple-900/20 to-transparent p-8 backdrop-blur-xl"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Award className="w-6 h-6 text-purple-400" />
                <span className="text-xs font-semibold uppercase tracking-wider text-purple-300 font-mono">
                  Verified Resume Alignment
                </span>
              </div>
              <div className="flex items-baseline gap-3">
                <span className="text-6xl font-extrabold text-white tracking-tight font-heading">
                  {overview.overallScore}%
                </span>
                <span className="text-sm text-slate-400 max-w-lg">
                  {overview.scoreSubtitle} This score measures how strongly your current resume provides
                  verifiable evidence for the requirements identified in this job description. It is not a hiring probability.
                </span>
              </div>
              <div className="mt-4 w-full bg-white/10 rounded-full h-2 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${overview.overallScore}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="bg-gradient-to-r from-purple-500 to-cyan-400 h-full rounded-full"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 min-w-[280px]">
              <div className="rounded-xl border border-indigo-500/30 bg-[#0a1122]/60 p-4 flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-indigo-300 flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5" /> Required (75% weight)
                  </span>
                  <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    {overview.requiredScore}%
                  </span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-indigo-400 h-full rounded-full" style={{ width: `${overview.requiredScore}%` }} />
                </div>
              </div>

              <div className="rounded-xl border border-cyan-500/30 bg-[#0a1122]/60 p-4 flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-cyan-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> Preferred (25% weight)
                  </span>
                  <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    {overview.preferredScore}%
                  </span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-cyan-400 h-full rounded-full" style={{ width: `${overview.preferredScore}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* Summary chips */}
          <div className="mt-6 flex flex-wrap gap-3">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs">
              <Check className="w-3.5 h-3.5" />
              {summary.strong} verified strengths
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs">
              <MinusCircle className="w-3.5 h-3.5" />
              {summary.partial} partial context
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-300 text-xs">
              <XCircle className="w-3.5 h-3.5" />
              {summary.missing} unverified requirements
            </div>
          </div>
        </motion.div>

        {/* 3. WHAT YOU ALREADY HAVE */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-white">What You Already Have</h2>
          </div>
          <p className="text-xs text-slate-400 max-w-3xl">
            This is what your resume already proves for this job. Each item above shows verified evidence from your actual
            resume — skills, projects, experience, or education.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {presentation.verifiedStrengths && presentation.verifiedStrengths.length > 0 ? (
              presentation.verifiedStrengths.slice(0, 9).map((strength) => (
                <div key={strength.id} className="rounded-xl border border-emerald-500/20 bg-[#0a1122]/60 p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-sm font-semibold text-emerald-100">{strength.requirement}</span>
                    <StatusBadge status={strength.status} />
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{strength.reason}</p>
                  {strength.evidence && (
                    <div className="mt-3 pt-3 border-t border-white/5">
                      <div className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-400 mb-1">
                        <Check className="w-3 h-3" />
                        Evidence: {strength.evidence.section} — {strength.evidence.title}
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="col-span-full rounded-xl border border-slate-700/50 bg-white/[0.02] p-6 text-center">
                <ShieldAlert className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                <p className="text-sm text-slate-400">No verified matches found. Strengthen your resume evidence.</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* 4. WHAT THIS JOB NEEDS */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Target className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-white">What This Job Needs</h2>
          </div>
          <p className="text-xs text-slate-400 max-w-3xl">
            Requirements extracted from the job description, grouped by theme. Expand a group to see the individual requirements.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(presentation.jobNeeds || {}).map(([category, items]) => {
              const Icon = categoryIcons[category] || Database;
              return (
                <div key={category} className="rounded-xl border border-indigo-500/20 bg-[#0a1122]/60 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-indigo-400" />
                      <span className="text-sm font-semibold text-white">{category}</span>
                    </div>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {items.length} req
                    </span>
                  </div>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 text-xs">
                        <span className="w-1 h-1 rounded-full bg-slate-500 shrink-0" />
                        <span className="text-slate-300 truncate" title={item.text}>
                          {item.text}
                        </span>
                        <span
                          className={`text-[9px] font-mono px-1 py-0.2 rounded ${item.importance === "required"
                              ? "bg-red-500/15 text-red-300 border border-red-500/20"
                              : "bg-cyan-500/15 text-cyan-300 border border-cyan-500/20"
                            }`}
                        >
                          {item.importance}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* 5. KEY GAPS */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-400">
              <XCircle className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-white">Key Gaps</h2>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-400">
              {presentation.groupedGaps?.totalMissingCount || 0} missing · {presentation.groupedGaps?.totalPartialCount || 0} partial
            </span>
          </div>
          <p className="text-xs text-slate-400 max-w-3xl">
            Requirements with no verified resume evidence, grouped by theme. Expand a group to see individual requirements and what's missing.
          </p>

          {Object.entries(presentation.groupedGaps?.clusters || {}).map(([category, groups]) => (
            <div key={category} className="rounded-xl border border-red-500/20 bg-[#0a1122]/60 overflow-hidden">
              <div
                onClick={() => toggleGap(category)}
                className="p-4 cursor-pointer flex items-center justify-between hover:bg-white/[0.02]"
              >
                <div className="flex items-center gap-2">
                  {React.createElement(categoryIcons[category] || Database, { className: "w-4 h-4 text-red-400" })}
                  <span className="text-sm font-semibold text-white">{category}</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/30">
                    {groups.length} group{groups.length > 1 ? "s" : ""}
                  </span>
                </div>
                {expandedGaps[category] ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </div>

              <AnimatePresence>
                {expandedGaps[category] && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="border-t border-white/5"
                  >
                    <div className="p-4 pt-2 space-y-3 max-h-96 overflow-y-auto">
                      {groups.map((group, gIdx) => (
                        <div key={`${category}-${gIdx}`} className="space-y-2">
                          {group.items.map((item, i) => (
                            <div key={item.requirementId || `gap-${i}`} className="rounded-lg bg-white/[0.03] border border-white/10 p-3">
                              <div className="flex items-start justify-between gap-2 mb-1.5">
                                <span className="text-sm font-semibold text-slate-200">{item.requirement}</span>
                                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-slate-400">
                                  {item.type}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 mb-1.5">
                                <StatusBadge status={item.status} />
                                <span
                                  className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${item.importance === "required"
                                      ? "bg-red-500/15 text-red-300 border border-red-500/20"
                                      : "bg-cyan-500/15 text-cyan-300 border border-cyan-500/20"
                                    }`}
                                >
                                  {item.importance}
                                </span>
                              </div>
                              <p className="text-xs text-slate-400 leading-relaxed">{item.reason}</p>
                              {item.evidence && item.evidence.length > 0 && (
                                <div className="mt-2 pt-2 border-t border-white/5">
                                  <div className="text-[10px] font-mono text-emerald-400 mb-1">Best available evidence:</div>
                                  {item.evidence.slice(0, 1).map((ev, ei) => (
                                    <div key={ei} className="text-xs text-slate-300 italic">
                                      {ev.title || ev.section} — {ev.reason}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}

          {Object.keys(presentation.groupedGaps?.clusters || {}).length === 0 && (
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-6 text-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              <p className="text-sm text-emerald-300">No gaps detected — all requirements are verified.</p>
            </div>
          )}
        </motion.div>

        {/* 6. HOW TO IMPROVE YOUR RESUME */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Lightbulb className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-white">How to Improve Your Resume</h2>
          </div>
          <p className="text-xs text-slate-400 max-w-3xl">
            Deterministic, evidence-grounded recommendations. Every suggestion is based on your actual resume evidence
            — never inventing experience, skills, or achievements.
          </p>

          <div className="space-y-3">
            {presentation.recommendations && presentation.recommendations.length > 0 ? (
              presentation.recommendations.map((rec, idx) => (
                <div key={idx} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="flex items-start gap-3">
                    <div className={`w-6 h-6 rounded-lg shrink-0 flex items-center justify-center mt-0.5 ${rec.type === "strengthen"
                        ? "bg-emerald-500/20 text-emerald-400"
                        : rec.type === "clarify"
                          ? "bg-amber-500/20 text-amber-400"
                          : rec.type === "unsupported"
                            ? "bg-red-500/20 text-red-400"
                            : "bg-cyan-500/20 text-cyan-400"
                      }`}>
                      {rec.type === "strengthen" && <Zap className="w-3.5 h-3.5" />}
                      {rec.type === "clarify" && <Brain className="w-3.5 h-3.5" />}
                      {rec.type === "unsupported" && <ShieldAlert className="w-3.5 h-3.5" />}
                      {rec.type === "format" && <BookOpen className="w-3.5 h-3.5" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-white">{rec.title}</span>
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-slate-400">
                          {rec.category}
                        </span>
                      </div>
                      <p className="text-sm text-slate-300 leading-relaxed">{rec.description}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-xl border border-slate-700/50 bg-white/[0.02] p-6 text-center">
                <Info className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                <p className="text-sm text-slate-400">No recommendations at this time.</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* 7. GENERATE TAILORED RESUME (DISABLED) */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="rounded-2xl border border-purple-500/20 bg-gradient-to-br from-purple-950/20 via-white/[0.02] to-transparent p-6 backdrop-blur-xl"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                Generate Tailored Resume
              </h3>
              <p className="text-sm text-slate-400 mt-1">
                Create an evidence-grounded, tailored resume that preserves all verified facts from your current resume.
              </p>
            </div>
            <button
              type="button"
              disabled
              className="px-6 py-3 rounded-xl font-semibold text-sm bg-white/5 border border-white/10 text-slate-500 cursor-not-allowed flex items-center gap-2"
            >
              <Loader2 className="w-4 h-4" />
              Coming next
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // --- Original input UI (upload + JD) when no analysis yet ---
  return (
    <div className="max-w-6xl mx-auto space-y-8 font-sans pb-12">
      {/* 1. HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.15)]">
              <Sparkles className="w-5 h-5 text-purple-400" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white font-heading">
              AI Resume Tailor
            </h1>
          </div>
          <p className="text-slate-400 text-sm max-w-xl leading-relaxed">
            Upload your existing resume and analyze match alignment for any job description.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-white/5 border border-white/10 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
            Resume Intelligence
          </span>
        </div>
      </div>

      {/* MAIN CARDS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 2. RESUME UPLOAD CARD */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 md:p-8 backdrop-blur-xl flex flex-col justify-between shadow-[0_10px_30px_rgba(0,0,0,0.3)]">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-cyan-400" />
                  Your Resume
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Upload your existing PDF or DOCX resume.
                </p>
              </div>
              <span className="text-[11px] font-mono px-2.5 py-1 rounded bg-white/5 border border-white/10 text-slate-400">
                Step 01
              </span>
            </div>

            {/* Hidden File Inputs */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pdf,.docx,.doc"
              className="hidden"
            />

            {!file ? (
              /* Dropzone State */
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`mt-4 border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center min-h-[220px] ${isDragging
                    ? "border-cyan-400 bg-cyan-400/10 scale-[0.99]"
                    : "border-white/15 hover:border-cyan-400/40 bg-white/[0.02] hover:bg-white/[0.04]"
                  }`}
              >
                <div className="w-14 h-14 rounded-2xl bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center mb-4 text-cyan-300 shadow-[0_0_20px_rgba(34,211,238,0.12)]">
                  <UploadCloud className="w-7 h-7" />
                </div>
                <p className="text-sm font-semibold text-slate-200">
                  Click to upload or drag & drop
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Accepted formats: <span className="text-slate-400 font-medium">PDF, DOCX</span> (Max 10MB)
                </p>
              </div>
            ) : (
              /* Selected File State */
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-5 rounded-xl border border-cyan-400/30 bg-cyan-950/20 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3.5 overflow-hidden">
                  <div className="w-12 h-12 rounded-xl bg-cyan-400/10 border border-cyan-400/30 flex items-center justify-center text-cyan-300 shrink-0">
                    <FileCheck className="w-6 h-6" />
                  </div>
                  <div className="truncate">
                    <p className="text-sm font-semibold text-white truncate">
                      {file.name}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-mono font-bold uppercase px-1.5 py-0.5 rounded bg-cyan-400/20 text-cyan-300 border border-cyan-400/30">
                        {file.name.split(".").pop()}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        {formatFileSize(file.size)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    title="Replace file"
                    className="p-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all text-xs flex items-center gap-1.5 font-medium"
                  >
                    <RefreshCcw className="w-3.5 h-3.5" />
                    Replace
                  </button>
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    title="Remove file"
                    className="p-2 rounded-lg border border-red-500/20 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-all text-xs"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1.5 text-slate-400">
              <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" /> Safe file ingestion
            </span>
            <span>Parsing ready</span>
          </div>
        </div>

        {/* 3. JOB DESCRIPTION CARD */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 md:p-8 backdrop-blur-xl flex flex-col justify-between shadow-[0_10px_30px_rgba(0,0,0,0.3)]">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-purple-400" />
                  Target Job Description
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Paste the job description for the role you're applying to.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="file"
                  ref={jdFileInputRef}
                  onChange={handleJDUpload}
                  accept=".txt,.md,.pdf,.docx"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => jdFileInputRef.current?.click()}
                  className="px-2.5 py-1.5 rounded-lg border border-purple-500/20 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 text-xs font-medium transition-all flex items-center gap-1.5"
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  Upload JD
                </button>
                <span className="text-[11px] font-mono px-2.5 py-1 rounded bg-white/5 border border-white/10 text-slate-400">
                  Step 02
                </span>
              </div>
            </div>

            {/* Textarea */}
            <div className="mt-4 relative">
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the company's job description here (role summary, technical requirements, responsibilities)..."
                rows={7}
                className="w-full rounded-xl border border-white/15 bg-[#070b19]/80 p-4 text-sm text-slate-100 placeholder-slate-500 focus:border-purple-400/50 focus:ring-1 focus:ring-purple-400/30 outline-none transition-all resize-none leading-relaxed font-sans"
              />
              <div className="absolute bottom-3 right-3 text-[11px] font-mono text-slate-500 bg-[#070b19]/90 px-2 py-0.5 rounded border border-white/5">
                {jobDescription.length} chars
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1.5 text-slate-400">
              <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" /> Key requirements matcher
            </span>
            <span>{jobDescription.trim().length > 0 ? "JD Ready" : "Awaiting JD"}</span>
          </div>
        </div>
      </div>

      {/* ERROR FEEDBACK BANNER */}
      {uploadError && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl border border-red-500/30 bg-red-500/10 flex items-center gap-3 text-red-300 text-sm"
        >
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          <span>{uploadError}</span>
        </motion.div>
      )}

      {/* 4. ACTION BAR & ANALYZE BUTTON */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 text-xs font-medium">
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${file ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" : "bg-slate-600"
                }`}
            />
            <span className={file ? "text-slate-200" : "text-slate-500"}>
              {file ? `Resume: ${file.name}` : "Resume not selected"}
            </span>
          </div>

          <span className="text-slate-600">•</span>

          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${jobDescription.trim()
                  ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"
                  : "bg-slate-600"
                }`}
            />
            <span className={jobDescription.trim() ? "text-slate-200" : "text-slate-500"}>
              {jobDescription.trim() ? "JD provided" : "JD empty"}
            </span>
          </div>
        </div>

        {/* Primary CTA Button */}
        <button
          type="button"
          disabled={!isFormValid || isAnalyzing}
          onClick={handleAnalyzeMatch}
          className={`w-full sm:w-auto px-8 py-3.5 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-2.5 shadow-lg ${isFormValid && !isAnalyzing
              ? "bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 text-white hover:shadow-[0_0_30px_rgba(168,85,247,0.4)] hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              : "bg-white/5 border border-white/10 text-slate-500 cursor-not-allowed"
            }`}
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>{analysisStep || "Analyzing resume against job..."}</span>
            </>
          ) : (
            <>
              <span>Analyze Job Match</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
