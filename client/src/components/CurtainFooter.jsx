import React from "react";
import { Link } from "react-router-dom";
import {
  BrainCircuit,
  MessageSquare,
  Sparkles,
  ArrowUpRight,
  Shield,
  Zap,
} from "lucide-react";

export default function CurtainFooter() {
  const marqueeItems = [
    "PrepAI • Build Your Story",
    "Code To Career",
    "AI Interview Preparation",
    "7 Specialized Agents",
    "Repo To Resume",
    "Defend Every Line",
    "Get Hired Faster",
  ];

  return (
    <footer className="fixed bottom-0 inset-x-0 z-0 bg-[#030511] text-slate-300 border-t border-purple-500/20 overflow-hidden pointer-events-auto">
      {/* Background ambient lighting */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 left-1/4 w-96 h-96 bg-purple-600/15 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px]" />
      </div>

      {/* 1. Continuous Scrolling Text Marquee */}
      <div className="relative border-b border-white/8 bg-white/[0.02] py-3.5 overflow-hidden">
        <div className="animate-marquee flex items-center gap-8 whitespace-nowrap">
          {[...marqueeItems, ...marqueeItems, ...marqueeItems].map((item, index) => (
            <div key={index} className="flex items-center gap-6">
              <span className="text-xs md:text-sm font-semibold uppercase tracking-[0.22em] text-slate-300/90 font-mono flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                {item}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400/60 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
            </div>
          ))}
        </div>
      </div>

      {/* 2. Main Footer Content */}
      <div className="relative max-w-7xl mx-auto px-6 py-10 md:py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-10">
          {/* Brand Info (takes 2 columns on lg) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/5 border border-cyan-400/20 flex items-center justify-center shadow-[0_0_25px_rgba(76,201,240,0.25)]">
                <BrainCircuit className="w-5 h-5 text-cyan-300" />
              </div>
              <span className="font-heading text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-cyan-200 bg-clip-text text-transparent">
                PrepAI
              </span>
            </div>

            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              Turn your GitHub code into placement power. Autonomous AI agents synthesize your repository into defendable viva answers, high-impact resume bullets, and mock interviews.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://github.com/JatinxKumar/PrepAi"
                target="_blank"
                rel="noreferrer"
                aria-label="GitHub"
                className="w-9 h-9 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center text-slate-400 footer-link-glow hover:text-white hover:border-purple-400/40"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Twitter / X"
                className="w-9 h-9 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center text-slate-400 footer-link-glow hover:text-white hover:border-purple-400/40"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn"
                className="w-9 h-9 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center text-slate-400 footer-link-glow hover:text-white hover:border-purple-400/40"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </a>
              <a
                href="https://discord.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Community"
                className="w-9 h-9 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center text-slate-400 footer-link-glow hover:text-white hover:border-purple-400/40"
              >
                <MessageSquare className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Product Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-white">
              Product
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#how-it-works" className="footer-link-glow block text-slate-400">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#features" className="footer-link-glow block text-slate-400">
                  Features
                </a>
              </li>
              <li>
                <a href="#agents" className="footer-link-glow block text-slate-400">
                  Agent Graph
                </a>
              </li>
              <li>
                <Link to="/auth" className="footer-link-glow block text-slate-400">
                  Resume Builder
                </Link>
              </li>
              <li>
                <Link to="/auth" className="footer-link-glow block text-slate-400">
                  Viva Simulator
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-white">
              Resources
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <span className="footer-link-glow block text-slate-400 cursor-pointer">
                  Placement Roadmap
                </span>
              </li>
              <li>
                <span className="footer-link-glow block text-slate-400 cursor-pointer">
                  System Design Vault
                </span>
              </li>
              <li>
                <span className="footer-link-glow block text-slate-400 cursor-pointer">
                  FAANG Question Bank
                </span>
              </li>
              <li>
                <span className="footer-link-glow block text-slate-400 cursor-pointer">
                  Documentation
                </span>
              </li>
              <li>
                <span className="footer-link-glow block text-slate-400 cursor-pointer">
                  Engineering Blog
                </span>
              </li>
            </ul>
          </div>

          {/* Legal / Status */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-white">
              Platform
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <span className="footer-link-glow block text-slate-400 cursor-pointer">
                  Privacy Policy
                </span>
              </li>
              <li>
                <span className="footer-link-glow block text-slate-400 cursor-pointer">
                  Terms of Service
                </span>
              </li>
              <li>
                <span className="footer-link-glow block text-slate-400 cursor-pointer">
                  Security Guardrails
                </span>
              </li>
            </ul>

            <div className="pt-2">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-medium text-emerald-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                All AI Agents Operational
              </div>
            </div>
          </div>
        </div>

        {/* 3. Bottom Credits */}
        <div className="mt-10 pt-6 border-t border-white/8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} PrepAI. Turn Your Code Into Placement Power.</p>
          <p className="flex items-center gap-1.5 text-slate-400">
            <span>Built for ambitious engineers</span>
            <Zap className="w-3 h-3 text-cyan-400" />
          </p>
        </div>
      </div>
    </footer>
  );
}
