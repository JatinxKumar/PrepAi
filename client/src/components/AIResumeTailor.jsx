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
      strong: "bg-[#1040C0] text-white border-2 border-[#111111]",
      partial: "bg-[#F0C020] text-[#111111] border-2 border-[#111111]",
      missing: "bg-[#D02020] text-white border-2 border-[#111111]",
    };
    const labels = {
      strong: "Verified",
      partial: "Partial",
      missing: "Missing",
    };
    return (
      <span className={`text-[10px] uppercase font-mono font-bold px-2 py-0.5 ${styles[status] || styles.strong}`}>
        {labels[status] || status}
      </span>
    );
  };

  // --- Section: Match Analysis v2 ---
  if (presentation) {
    const overview = presentation.overview;
    const summary = overview?.summary || { strong: 0, partial: 0, missing: 0 };

    return (
      <div className="max-w-6xl mx-auto space-y-8 font-bauhaus pb-12">
        {/* 1. HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b-2 border-[#111111]">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-[#F0C020] border-2 border-[#111111] shadow-[2px_2px_0px_#111111] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-[#111111]" />
              </div>
              <h1 className="text-3xl font-black uppercase tracking-tight text-[#111111]">
                Match Analysis v2
              </h1>
            </div>
            <p className="text-gray-600 font-mono text-xs max-w-xl leading-relaxed">
              Deterministic, evidence-grounded alignment between your resume and this job description.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="bauhaus-tag text-xs font-mono font-bold">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#1040C0]" />
              Evidence-Based
            </span>
          </div>
        </div>

        {/* 2. OVERALL SCORE SECTION */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bauhaus-card p-8 bg-white"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Award className="w-6 h-6 text-[#1040C0]" />
                <span className="text-xs font-bold uppercase tracking-wider text-[#111111] font-mono">
                  Verified Resume Alignment
                </span>
              </div>
              <div className="flex items-baseline gap-3">
                <span className="text-6xl font-mono font-black text-[#111111] tracking-tight">
                  {overview.overallScore}%
                </span>
                <span className="text-xs text-gray-600 font-mono max-w-lg">
                  {overview.scoreSubtitle} This score measures how strongly your current resume provides
                  verifiable evidence for the requirements identified in this job description. It is not a hiring probability.
                </span>
              </div>
              <div className="mt-4 w-full bg-[#E5E5E5] border border-[#111111] h-3 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${overview.overallScore}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="bg-[#1040C0] h-full"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 min-w-[280px]">
              <div className="border-2 border-[#111111] bg-[#F0F0F0] p-4 flex-1 shadow-[3px_3px_0px_#111111]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono font-bold text-[#111111] uppercase flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-[#1040C0]" /> Required (75%)
                  </span>
                  <span className="text-[10px] uppercase font-mono font-bold px-1.5 py-0.5 bg-[#1040C0] text-white">
                    {overview.requiredScore}%
                  </span>
                </div>
                <div className="w-full bg-white border border-[#111111] h-2 overflow-hidden">
                  <div className="bg-[#1040C0] h-full" style={{ width: `${overview.requiredScore}%` }} />
                </div>
              </div>

              <div className="border-2 border-[#111111] bg-[#F0F0F0] p-4 flex-1 shadow-[3px_3px_0px_#111111]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono font-bold text-[#111111] uppercase flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#D02020]" /> Preferred (25%)
                  </span>
                  <span className="text-[10px] uppercase font-mono font-bold px-1.5 py-0.5 bg-[#F0C020] text-[#111111] border border-[#111111]">
                    {overview.preferredScore}%
                  </span>
                </div>
                <div className="w-full bg-white border border-[#111111] h-2 overflow-hidden">
                  <div className="bg-[#F0C020] h-full" style={{ width: `${overview.preferredScore}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* Summary chips */}
          <div className="mt-6 flex flex-wrap gap-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border-2 border-[#111111] text-[#111111] font-mono text-xs font-bold shadow-[2px_2px_0px_#111111]">
              <Check className="w-3.5 h-3.5 text-[#1040C0] stroke-[3]" />
              {summary.strong} verified strengths
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#F0C020] border-2 border-[#111111] text-[#111111] font-mono text-xs font-bold shadow-[2px_2px_0px_#111111]">
              <MinusCircle className="w-3.5 h-3.5" />
              {summary.partial} partial context
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#D02020] border-2 border-[#111111] text-white font-mono text-xs font-bold shadow-[2px_2px_0px_#111111]">
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
            <div className="w-7 h-7 bg-[#1040C0] border-2 border-[#111111] flex items-center justify-center text-white">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-black uppercase text-[#111111]">What You Already Have</h2>
          </div>
          <p className="text-xs font-mono text-gray-600 max-w-3xl">
            This is what your resume already proves for this job. Each item shows verified evidence from your actual
            resume — skills, projects, experience, or education.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {presentation.verifiedStrengths && presentation.verifiedStrengths.length > 0 ? (
              presentation.verifiedStrengths.slice(0, 9).map((strength) => (
                <div key={strength.id} className="bauhaus-card p-4 bg-white">
                  <div className="flex items-start justify-between gap-2 mb-2 pb-2 border-b-2 border-[#111111]">
                    <span className="text-sm font-bold text-[#111111]">{strength.requirement}</span>
                    <StatusBadge status={strength.status} />
                  </div>
                  <p className="text-xs text-gray-700 leading-relaxed font-mono">{strength.reason}</p>
                  {strength.evidence && (
                    <div className="mt-3 pt-3 border-t border-[#111111]">
                      <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-[#1040C0] mb-1">
                        <Check className="w-3 h-3 stroke-[3]" />
                        Evidence: {strength.evidence.section} — {strength.evidence.title}
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="col-span-full bauhaus-card p-6 text-center bg-white">
                <ShieldAlert className="w-8 h-8 text-[#D02020] mx-auto mb-2" />
                <p className="text-sm font-mono text-[#111111]">No verified matches found. Strengthen your resume evidence.</p>
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
            <div className="w-7 h-7 bg-[#F0C020] border-2 border-[#111111] flex items-center justify-center text-[#111111]">
              <Target className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-black uppercase text-[#111111]">What This Job Needs</h2>
          </div>
          <p className="text-xs font-mono text-gray-600 max-w-3xl">
            Requirements extracted from the job description, grouped by theme.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(presentation.jobNeeds || {}).map(([category, items]) => {
              const Icon = categoryIcons[category] || Database;
              return (
                <div key={category} className="bauhaus-card p-4 bg-white">
                  <div className="flex items-center justify-between mb-3 pb-2 border-b-2 border-[#111111]">
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-[#1040C0]" />
                      <span className="text-xs font-bold uppercase font-mono text-[#111111]">{category}</span>
                    </div>
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 bg-[#F0C020] border border-[#111111] text-[#111111]">
                      {items.length} req
                    </span>
                  </div>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto">
                    {items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 text-xs font-mono">
                        <span className="w-1.5 h-1.5 bg-[#111111] shrink-0" />
                        <span className="text-[#111111] truncate" title={item.text}>
                          {item.text}
                        </span>
                        <span
                          className={`text-[9px] font-mono uppercase font-bold px-1 py-0.2 border border-[#111111] ${item.importance === "required"
                              ? "bg-[#D02020] text-white"
                              : "bg-[#F0C020] text-[#111111]"
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
            <div className="w-7 h-7 bg-[#D02020] border-2 border-[#111111] flex items-center justify-center text-white">
              <XCircle className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-black uppercase text-[#111111]">Key Gaps</h2>
            <span className="text-[11px] font-mono font-bold px-2 py-0.5 bg-[#F0C020] border border-[#111111] text-[#111111]">
              {presentation.groupedGaps?.totalMissingCount || 0} missing · {presentation.groupedGaps?.totalPartialCount || 0} partial
            </span>
          </div>
          <p className="text-xs font-mono text-gray-600 max-w-3xl">
            Requirements with no verified resume evidence, grouped by theme. Expand a group to see details.
          </p>

          {Object.entries(presentation.groupedGaps?.clusters || {}).map(([category, groups]) => (
            <div key={category} className="bauhaus-card overflow-hidden bg-white">
              <div
                onClick={() => toggleGap(category)}
                className="p-4 cursor-pointer flex items-center justify-between hover:bg-[#F0F0F0]"
              >
                <div className="flex items-center gap-2">
                  {React.createElement(categoryIcons[category] || Database, { className: "w-4 h-4 text-[#D02020]" })}
                  <span className="text-sm font-black uppercase text-[#111111]">{category}</span>
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 bg-[#D02020] text-white border border-[#111111]">
                    {groups.length} group{groups.length > 1 ? "s" : ""}
                  </span>
                </div>
                {expandedGaps[category] ? <ChevronUp className="w-4 h-4 text-[#111111]" /> : <ChevronDown className="w-4 h-4 text-[#111111]" />}
              </div>

              <AnimatePresence>
                {expandedGaps[category] && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="border-t-2 border-[#111111]"
                  >
                    <div className="p-4 pt-3 space-y-3 max-h-96 overflow-y-auto bg-[#F0F0F0]">
                      {groups.map((group, gIdx) => (
                        <div key={`${category}-${gIdx}`} className="space-y-2">
                          {group.items.map((item, i) => (
                            <div key={item.requirementId || `gap-${i}`} className="bg-white border-2 border-[#111111] p-3 shadow-[2px_2px_0px_#111111]">
                              <div className="flex items-start justify-between gap-2 mb-1.5">
                                <span className="text-sm font-bold text-[#111111]">{item.requirement}</span>
                                <span className="text-[9px] font-mono px-1.5 py-0.5 bg-[#F0F0F0] border border-[#111111] text-[#111111]">
                                  {item.type}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 mb-1.5">
                                <StatusBadge status={item.status} />
                                <span
                                  className={`text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 border border-[#111111] ${item.importance === "required"
                                      ? "bg-[#D02020] text-white"
                                      : "bg-[#F0C020] text-[#111111]"
                                    }`}
                                >
                                  {item.importance}
                                </span>
                              </div>
                              <p className="text-xs font-mono text-gray-700 leading-relaxed">{item.reason}</p>
                              {item.evidence && item.evidence.length > 0 && (
                                <div className="mt-2 pt-2 border-t border-[#111111]">
                                  <div className="text-[10px] font-mono font-bold text-[#1040C0] mb-1">Best available evidence:</div>
                                  {item.evidence.slice(0, 1).map((ev, ei) => (
                                    <div key={ei} className="text-xs font-mono text-gray-800 italic">
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
            <div className="bauhaus-card p-6 text-center bg-white">
              <CheckCircle2 className="w-8 h-8 text-[#1040C0] mx-auto mb-2" />
              <p className="text-sm font-mono font-bold text-[#111111]">No gaps detected — all requirements are verified.</p>
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
            <div className="w-7 h-7 bg-[#F0C020] border-2 border-[#111111] flex items-center justify-center text-[#111111]">
              <Lightbulb className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-black uppercase text-[#111111]">How to Improve Your Resume</h2>
          </div>
          <p className="text-xs font-mono text-gray-600 max-w-3xl">
            Deterministic, evidence-grounded recommendations based on your actual resume evidence.
          </p>

          <div className="space-y-3">
            {presentation.recommendations && presentation.recommendations.length > 0 ? (
              presentation.recommendations.map((rec, idx) => (
                <div key={idx} className="bauhaus-card p-4 bg-white">
                  <div className="flex items-start gap-3">
                    <div className={`w-7 h-7 border-2 border-[#111111] shrink-0 flex items-center justify-center mt-0.5 ${rec.type === "strengthen"
                        ? "bg-[#1040C0] text-white"
                        : rec.type === "clarify"
                          ? "bg-[#F0C020] text-[#111111]"
                          : rec.type === "unsupported"
                            ? "bg-[#D02020] text-white"
                            : "bg-[#111111] text-white"
                      }`}>
                      {rec.type === "strengthen" && <Zap className="w-3.5 h-3.5" />}
                      {rec.type === "clarify" && <Brain className="w-3.5 h-3.5" />}
                      {rec.type === "unsupported" && <ShieldAlert className="w-3.5 h-3.5" />}
                      {rec.type === "format" && <BookOpen className="w-3.5 h-3.5" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-bold text-[#111111] uppercase">{rec.title}</span>
                        <span className="text-[9px] font-mono px-1.5 py-0.5 bg-[#F0F0F0] border border-[#111111] text-[#111111]">
                          {rec.category}
                        </span>
                      </div>
                      <p className="text-xs font-mono text-gray-700 leading-relaxed">{rec.description}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bauhaus-card p-6 text-center bg-white">
                <Info className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                <p className="text-sm font-mono text-gray-600">No recommendations at this time.</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* 7. GENERATE TAILORED RESUME (DISABLED) */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bauhaus-card p-6 bg-white"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-black uppercase text-[#111111] flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#1040C0]" />
                Generate Tailored Resume
              </h3>
              <p className="text-xs font-mono text-gray-600 mt-1">
                Create an evidence-grounded, tailored resume that preserves all verified facts from your current resume.
              </p>
            </div>
            <button
              type="button"
              disabled
              className="px-6 py-3 font-mono font-bold text-xs uppercase bg-[#E5E5E5] border-2 border-[#111111] text-gray-500 cursor-not-allowed flex items-center gap-2"
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
    <div className="max-w-6xl mx-auto space-y-8 font-bauhaus pb-12">
      {/* 1. HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b-2 border-[#111111]">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-[#F0C020] border-2 border-[#111111] shadow-[2px_2px_0px_#111111] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-[#111111]" />
            </div>
            <h1 className="text-3xl font-black uppercase tracking-tight text-[#111111]">
              AI Resume Vault & Tailor
            </h1>
          </div>
          <p className="text-gray-600 font-mono text-xs max-w-xl leading-relaxed">
            Upload your existing resume and analyze match alignment for any job description.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="bauhaus-tag text-xs font-mono font-bold">
            <span className="w-2 h-2 bg-[#D02020] inline-block mr-1.5" />
            Resume Intelligence
          </span>
        </div>
      </div>

      {/* MAIN CARDS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 2. RESUME UPLOAD CARD */}
        <div className="bauhaus-card p-6 md:p-8 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b-2 border-[#111111]">
              <div>
                <h2 className="text-lg font-black uppercase text-[#111111] flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#1040C0]" />
                  Your Resume
                </h2>
                <p className="text-xs font-mono text-gray-600 mt-1">
                  Upload your existing PDF or DOCX resume.
                </p>
              </div>
              <span className="text-[11px] font-mono font-bold px-2.5 py-1 bg-[#F0C020] border-2 border-[#111111] text-[#111111]">
                STEP 01
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
                className={`mt-4 border-3 border-dashed border-[#111111] p-8 text-center cursor-pointer transition-colors flex flex-col items-center justify-center min-h-[220px] ${isDragging
                    ? "bg-[#F0C020]"
                    : "bg-[#F0F0F0] hover:bg-white"
                  }`}
              >
                <div className="w-14 h-14 bg-white border-2 border-[#111111] shadow-[3px_3px_0px_#111111] flex items-center justify-center mb-4 text-[#1040C0]">
                  <UploadCloud className="w-7 h-7" />
                </div>
                <p className="text-sm font-black uppercase text-[#111111]">
                  Click to upload or drag & drop
                </p>
                <p className="text-xs font-mono text-gray-600 mt-1">
                  Accepted formats: <span className="font-bold text-[#111111]">PDF, DOCX</span> (Max 10MB)
                </p>
              </div>
            ) : (
              /* Selected File State */
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-5 bg-[#F0F0F0] border-2 border-[#111111] shadow-[3px_3px_0px_#111111] flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3.5 overflow-hidden">
                  <div className="w-12 h-12 bg-[#1040C0] border-2 border-[#111111] flex items-center justify-center text-white shrink-0">
                    <FileCheck className="w-6 h-6" />
                  </div>
                  <div className="truncate">
                    <p className="text-sm font-bold text-[#111111] truncate">
                      {file.name}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-mono font-bold uppercase px-1.5 py-0.5 bg-[#F0C020] text-[#111111] border border-[#111111]">
                        {file.name.split(".").pop()}
                      </span>
                      <span className="text-xs text-gray-600 font-mono">
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
                    className="bauhaus-btn-secondary px-3 py-2 text-xs font-mono font-bold uppercase flex items-center gap-1.5"
                  >
                    <RefreshCcw className="w-3.5 h-3.5" />
                    Replace
                  </button>
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    title="Remove file"
                    className="p-2 border-2 border-[#111111] bg-[#D02020] hover:bg-red-700 text-white transition-all text-xs"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t-2 border-[#111111] flex items-center justify-between text-xs font-mono text-gray-600">
            <span className="flex items-center gap-1.5 font-bold text-[#111111]">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#1040C0]" /> Safe file ingestion
            </span>
            <span>Parsing ready</span>
          </div>
        </div>

        {/* 3. JOB DESCRIPTION CARD */}
        <div className="bauhaus-card p-6 md:p-8 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b-2 border-[#111111]">
              <div>
                <h2 className="text-lg font-black uppercase text-[#111111] flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-[#D02020]" />
                  Target Job Description
                </h2>
                <p className="text-xs font-mono text-gray-600 mt-1">
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
                  className="bauhaus-btn-secondary px-2.5 py-1 text-xs font-mono font-bold uppercase flex items-center gap-1.5"
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  Upload JD
                </button>
                <span className="text-[11px] font-mono font-bold px-2.5 py-1 bg-[#F0C020] border-2 border-[#111111] text-[#111111]">
                  STEP 02
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
                className="bauhaus-input w-full p-4 text-xs font-mono text-[#111111] placeholder-gray-500 resize-none leading-relaxed"
              />
              <div className="absolute bottom-3 right-3 text-[10px] font-mono font-bold text-[#111111] bg-[#F0C020] px-2 py-0.5 border border-[#111111]">
                {jobDescription.length} chars
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t-2 border-[#111111] flex items-center justify-between text-xs font-mono text-gray-600">
            <span className="flex items-center gap-1.5 font-bold text-[#111111]">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#1040C0]" /> Key requirements matcher
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
          className="p-4 bg-[#D02020] border-3 border-[#111111] shadow-[4px_4px_0px_#111111] flex items-center gap-3 text-white text-xs font-mono font-bold"
        >
          <AlertCircle className="w-5 h-5 text-white shrink-0" />
          <span>{uploadError}</span>
        </motion.div>
      )}

      {/* 4. ACTION BAR & ANALYZE BUTTON */}
      <div className="bauhaus-card p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 text-xs font-mono font-bold">
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 border border-[#111111] ${file ? "bg-[#1040C0]" : "bg-gray-400"
                }`}
            />
            <span className={file ? "text-[#111111]" : "text-gray-500"}>
              {file ? `Resume: ${file.name}` : "Resume not selected"}
            </span>
          </div>

          <span className="text-gray-400">•</span>

          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 border border-[#111111] ${jobDescription.trim()
                  ? "bg-[#1040C0]"
                  : "bg-gray-400"
                }`}
            />
            <span className={jobDescription.trim() ? "text-[#111111]" : "text-gray-500"}>
              {jobDescription.trim() ? "JD provided" : "JD empty"}
            </span>
          </div>
        </div>

        {/* Primary CTA Button */}
        <button
          type="button"
          disabled={!isFormValid || isAnalyzing}
          onClick={handleAnalyzeMatch}
          className={`w-full sm:w-auto px-8 py-3.5 font-mono font-black uppercase text-xs transition-transform flex items-center justify-center gap-2.5 border-3 border-[#111111] ${isFormValid && !isAnalyzing
              ? "bg-[#D02020] text-white shadow-[4px_4px_0px_#111111] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
              : "bg-[#E5E5E5] text-gray-500 cursor-not-allowed shadow-none"
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
