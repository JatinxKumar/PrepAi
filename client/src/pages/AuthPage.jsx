import React, { useState } from "react";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  ArrowLeft,
  BrainCircuit,
  Eye,
  EyeOff,
  Loader2,
  Sparkles,
  Check,
  ShieldCheck,
  Code2,
  Terminal,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { signInWithGoogle } from "../config/firebase";
import useAuthStore from "../store/authStore";

const API_URL = import.meta.env.VITE_API_URL || "/api";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const endpoint = isLogin ? "/auth/login" : "/auth/signup";
      const payload = isLogin
        ? { email: form.email, password: form.password }
        : form;
      const response = await axios.post(`${API_URL}${endpoint}`, payload);

      login(response.data.user, response.data.token);
      navigate("/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.error ||
          "Something went wrong. Is the backend running?",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError("");
    try {
      const result = await signInWithGoogle();
      const idToken = await result.user.getIdToken();

      const response = await axios.post(`${API_URL}/auth/google`, { idToken });

      login(response.data.user, response.data.token);
      navigate("/dashboard");
    } catch (err) {
      console.error("Google Login Error:", err);
      const errorMessage =
        err.response?.data?.error || err.message || "Google Sign-In failed.";
      setError(`Auth Error: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#F0F0F0] font-bauhaus selection:bg-[#F0C020] selection:text-[#111111]">
      {/* =========================================================================
          LEFT BRANDING COLUMN (Split Screen / Hero side)
          ========================================================================= */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#111111] text-white p-12 xl:p-16 flex-col justify-between relative overflow-hidden border-r-[4px] border-[#111111]">
        {/* Subtle Bauhaus grid pattern on black */}
        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(255,255,255,0.12) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.12) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        {/* Brand Header */}
        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center gap-3 group">
            <div className="w-11 h-11 bg-[#D02020] border-2 border-white flex items-center justify-center text-white shadow-[3px_3px_0_#FFFFFF] group-hover:bg-[#F0C020] group-hover:text-[#111111] transition-colors">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <span className="font-['Outfit'] text-2xl font-black tracking-tight text-white">
              PREP<span className="text-[#D02020]">AI</span>
            </span>
          </Link>
        </div>

        {/* Center Hero Content */}
        <div className="relative z-10 my-auto py-10 max-w-lg">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#F0C020] text-[#111111] text-xs font-black uppercase font-['JetBrains_Mono'] mb-6 border-2 border-white shadow-[3px_3px_0_#FFFFFF]">
            <Sparkles className="w-3.5 h-3.5 text-[#111111]" />
            PLACEMENT READINESS ENGINE
          </div>

          <h1 className="text-4xl xl:text-5xl font-black uppercase tracking-tight text-white font-['Outfit'] leading-tight mb-5">
            Welcome back to <span className="text-[#F0C020]">PrepAI</span>.
          </h1>

          <p className="text-gray-300 text-sm xl:text-base leading-relaxed font-sans mb-8">
            Transform your GitHub repositories into verified placement proof,
            defendable system architectures, and rigorous interview defense drills.
          </p>

          {/* Feature Highlights with Bauhaus Geometric Badges */}
          <div className="space-y-4">
            <div className="flex items-start gap-3.5 p-3.5 bg-white/5 border-2 border-white/20">
              <div className="w-7 h-7 bg-[#D02020] border border-white flex items-center justify-center shrink-0 text-white font-bold text-xs">
                01
              </div>
              <div>
                <h4 className="text-sm font-black uppercase font-['Outfit'] text-white">
                  7-Agent Code Parsing
                </h4>
                <p className="text-xs text-gray-400 font-sans mt-0.5">
                  Deep AST inspection across schemas, state machines, and API topologies.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-3.5 bg-white/5 border-2 border-white/20">
              <div className="w-7 h-7 bg-[#1040C0] border border-white flex items-center justify-center shrink-0 text-white font-bold text-xs">
                02
              </div>
              <div>
                <h4 className="text-sm font-black uppercase font-['Outfit'] text-white">
                  100% Code-Grounded Truth
                </h4>
                <p className="text-xs text-gray-400 font-sans mt-0.5">
                  Zero hallucinations. Every bullet point and viva drill is verified by source.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-3.5 bg-white/5 border-2 border-white/20">
              <div className="w-7 h-7 bg-[#F0C020] border border-white flex items-center justify-center shrink-0 text-[#111111] font-bold text-xs">
                03
              </div>
              <div>
                <h4 className="text-sm font-black uppercase font-['Outfit'] text-white">
                  Technical Viva Drills
                </h4>
                <p className="text-xs text-gray-400 font-sans mt-0.5">
                  Anticipate tough interviewer follow-ups on bottlenecks and tradeoffs.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 pt-6 border-t border-white/15 flex items-center justify-between text-xs text-gray-400 font-['JetBrains_Mono']">
          <span>© 2026 PrepAI. All rights reserved.</span>
          <span className="text-[#F0C020] font-bold uppercase flex items-center gap-1.5">
            <span className="w-2 h-2 bg-[#F0C020] inline-block" />
            Cockpit Online
          </span>
        </div>
      </div>

      {/* =========================================================================
          RIGHT AUTH FORM COLUMN (Clean Bauhaus Panel)
          ========================================================================= */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-10 xl:p-16 bauhaus-canvas-bg min-h-screen relative">
        {/* Back to Home Button */}
        <Link
          to="/"
          className="absolute top-6 right-6 sm:top-10 sm:right-10 inline-flex items-center gap-2 text-xs font-black uppercase font-['JetBrains_Mono'] text-[#111111] px-3.5 py-2 bg-white border-2 border-[#111111] shadow-[2px_2px_0_#111111] hover:bg-[#F0C020] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
        </Link>

        {/* Mobile Header (Visible on small screens only) */}
        <div className="lg:hidden w-full max-w-md mb-6 flex items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-9 h-9 bg-[#D02020] border-2 border-[#111111] flex items-center justify-center text-white shadow-[2px_2px_0_#111111]">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <span className="font-['Outfit'] text-xl font-black text-[#111111]">
              PREP<span className="text-[#D02020]">AI</span>
            </span>
          </Link>
        </div>

        {/* Main Auth Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-md bg-white border-[3px] border-[#111111] shadow-[6px_6px_0_#111111] p-6 sm:p-8 relative"
        >
          {/* Header Title */}
          <div className="mb-6">
            <div className="inline-block px-2 py-0.5 bg-[#F0C020] border border-[#111111] text-[10px] font-bold uppercase tracking-wider font-['JetBrains_Mono'] text-[#111111] mb-2">
              AUTHENTICATION GATEWAY
            </div>
            <h2 className="text-3xl font-black uppercase tracking-tight text-[#111111] font-['Outfit']">
              {isLogin ? "Welcome Back!" : "Create Account"}
            </h2>
            <p className="text-xs text-[#555555] font-sans mt-1">
              {isLogin
                ? "Enter your credentials to enter your placement cockpit."
                : "Set up your workspace to inspect repositories and viva kits."}
            </p>
          </div>

          {/* Login / Sign Up Tab Switcher */}
          <div className="grid grid-cols-2 gap-2 p-1.5 bg-[#F0F0F0] border-2 border-[#111111] mb-6">
            <button
              type="button"
              onClick={() => {
                setIsLogin(true);
                setError("");
              }}
              className={`py-2 text-xs font-black uppercase font-['JetBrains_Mono'] tracking-wider transition-all ${
                isLogin
                  ? "bg-[#F0C020] text-[#111111] border-2 border-[#111111] shadow-[2px_2px_0_#111111]"
                  : "bg-transparent text-[#555555] border-2 border-transparent hover:text-[#111111]"
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => {
                setIsLogin(false);
                setError("");
              }}
              className={`py-2 text-xs font-black uppercase font-['JetBrains_Mono'] tracking-wider transition-all ${
                !isLogin
                  ? "bg-[#F0C020] text-[#111111] border-2 border-[#111111] shadow-[2px_2px_0_#111111]"
                  : "bg-transparent text-[#555555] border-2 border-transparent hover:text-[#111111]"
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Quick Google Sign In */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 py-3 bg-white border-2 border-[#111111] shadow-[3px_3px_0_#111111] hover:bg-[#F0C020] hover:shadow-[4px_4px_0_#111111] active:translate-x-0.5 active:translate-y-0.5 transition-all text-xs font-black uppercase font-['JetBrains_Mono'] text-[#111111] cursor-pointer mb-6"
          >
            <img
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              className="w-4 h-4"
              alt="Google"
            />
            Continue with Google
          </button>

          {/* Divider */}
          <div className="relative flex items-center justify-center mb-6">
            <div className="border-t-2 border-[#111111] w-full" />
            <span className="bg-white px-3 text-[10px] font-bold uppercase font-['JetBrains_Mono'] text-[#555555] absolute">
              OR CONTINUE WITH EMAIL
            </span>
          </div>

          {/* Form */}
          <AnimatePresence mode="wait">
            <motion.form
              key={isLogin ? "login" : "signup"}
              initial={{ opacity: 0, x: isLogin ? -10 : 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: isLogin ? 10 : -10 }}
              transition={{ duration: 0.2 }}
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              {/* Full Name (Sign Up only) */}
              {!isLogin && (
                <div>
                  <label className="block text-xs font-bold uppercase font-['JetBrains_Mono'] text-[#111111] mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Jatin Kumar"
                    required={!isLogin}
                    className="w-full bg-[#F0F0F0] border-2 border-[#111111] px-3.5 py-2.5 text-xs font-['JetBrains_Mono'] text-[#111111] placeholder-[#888888] focus:bg-white focus:shadow-[3px_3px_0_#111111] outline-none transition-all"
                  />
                </div>
              )}

              {/* Email Address */}
              <div>
                <label className="block text-xs font-bold uppercase font-['JetBrains_Mono'] text-[#111111] mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  required
                  className="w-full bg-[#F0F0F0] border-2 border-[#111111] px-3.5 py-2.5 text-xs font-['JetBrains_Mono'] text-[#111111] placeholder-[#888888] focus:bg-white focus:shadow-[3px_3px_0_#111111] outline-none transition-all"
                />
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold uppercase font-['JetBrains_Mono'] text-[#111111]">
                    Password
                  </label>
                  {isLogin && (
                    <span className="text-[11px] text-[#555555] font-['JetBrains_Mono']">
                      Required
                    </span>
                  )}
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                    className="w-full bg-[#F0F0F0] border-2 border-[#111111] px-3.5 py-2.5 pr-10 text-xs font-['JetBrains_Mono'] text-[#111111] placeholder-[#888888] focus:bg-white focus:shadow-[3px_3px_0_#111111] outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#111111] hover:text-[#D02020] transition-colors p-1"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3 bg-[#D02020] text-white border-2 border-[#111111] shadow-[2px_2px_0_#111111] text-xs font-bold font-['JetBrains_Mono']">
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-[#D02020] hover:bg-[#b51818] text-white border-2 border-[#111111] shadow-[4px_4px_0_#111111] active:translate-x-0.5 active:translate-y-0.5 transition-all text-xs font-black uppercase font-['Outfit'] tracking-wider flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Processing...
                  </>
                ) : (
                  <>
                    {isLogin ? "Login to Cockpit" : "Create Account"}{" "}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </motion.form>
          </AnimatePresence>

          {/* Bottom Switch text */}
          <div className="mt-6 pt-4 border-t-2 border-[#111111] text-center text-xs font-['JetBrains_Mono'] text-[#555555]">
            {isLogin ? (
              <p>
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(false);
                    setError("");
                  }}
                  className="font-bold text-[#111111] underline hover:text-[#D02020] transition-colors cursor-pointer"
                >
                  Sign Up
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(true);
                    setError("");
                  }}
                  className="font-bold text-[#111111] underline hover:text-[#D02020] transition-colors cursor-pointer"
                >
                  Login
                </button>
              </p>
            )}
          </div>
        </motion.div>

        {/* Small Terms footnote */}
        <p className="text-center text-[11px] font-['JetBrains_Mono'] text-[#777777] mt-6 max-w-sm">
          By signing in, you agree to PrepAI's Code Grounding Verification and Placement Prep Terms.
        </p>
      </div>
    </div>
  );
}
