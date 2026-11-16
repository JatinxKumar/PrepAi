import React, { useState, useEffect } from "react";
import {
  Search,
  X,
  ArrowRight,
  Code2,
  FileText,
  MessageSquare,
  GitCompare,
  Plus,
  BookOpen,
  LayoutDashboard,
  CheckSquare,
  User,
  LogOut,
} from "lucide-react";

export default function CommandPalette({
  isOpen,
  onClose,
  tabs = [],
  history = [],
  onSelectTab,
  onSelectProject,
  onOpenProfile,
  onLogout,
}) {
  const [query, setQuery] = useState("");

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // Trigger open via parent
        }
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredTabs = tabs.filter((t) =>
    t.label.toLowerCase().includes(query.toLowerCase())
  );

  const filteredProjects = history.filter(
    (p) =>
      p.name?.toLowerCase().includes(query.toLowerCase()) ||
      p.repositoryUrl?.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-[#111111]/70 backdrop-blur-xs font-bauhaus animate-in fade-in duration-150">
      <div
        className="w-full max-w-xl bg-white border-[3px] border-[#111111] shadow-[8px_8px_0_#111111] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 p-4 border-b-2 border-[#111111] bg-[#F0F0F0]">
          <Search className="w-5 h-5 text-[#111111] shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command, section, or repository name..."
            autoFocus
            className="flex-1 bg-transparent border-none outline-none text-sm font-['JetBrains_Mono'] text-[#111111] placeholder-[#777777]"
          />
          <kbd className="hidden sm:inline-block px-2 py-0.5 bg-white border border-[#111111] text-[10px] font-bold font-['JetBrains_Mono'] text-[#555555]">
            ESC
          </kbd>
          <button
            onClick={onClose}
            className="p-1 border border-[#111111] bg-white hover:bg-[#D02020] hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results Area */}
        <div className="max-h-96 overflow-y-auto p-3 space-y-4 custom-scrollbar">
          {/* Navigation Section */}
          {filteredTabs.length > 0 && (
            <div>
              <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#777777] font-['JetBrains_Mono']">
                Sections & Tools
              </div>
              <div className="space-y-1 mt-1">
                {filteredTabs.map((tab) => {
                  const Icon = tab.icon || LayoutDashboard;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        onSelectTab(tab);
                        onClose();
                      }}
                      className="w-full flex items-center justify-between p-2.5 text-left bg-white hover:bg-[#F0C020] border-2 border-transparent hover:border-[#111111] hover:shadow-[2px_2px_0_#111111] transition-all group"
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="w-4 h-4 text-[#111111]" />
                        <span className="text-xs font-bold uppercase font-['Outfit'] text-[#111111]">
                          {tab.label}
                        </span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-[#111111] opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Analyzed Projects */}
          {filteredProjects.length > 0 && (
            <div>
              <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#777777] font-['JetBrains_Mono']">
                Repositories in History ({filteredProjects.length})
              </div>
              <div className="space-y-1 mt-1">
                {filteredProjects.map((project) => (
                  <button
                    key={project._id}
                    onClick={() => {
                      onSelectProject(project);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-2.5 text-left bg-white hover:bg-[#F0C020] border-2 border-transparent hover:border-[#111111] hover:shadow-[2px_2px_0_#111111] transition-all group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-6 h-6 bg-[#1040C0] text-white border border-[#111111] flex items-center justify-center shrink-0">
                        <Code2 className="w-3.5 h-3.5" />
                      </div>
                      <div className="truncate">
                        <p className="text-xs font-bold uppercase font-['Outfit'] text-[#111111] truncate">
                          {project.name}
                        </p>
                        <p className="text-[10px] text-[#555555] font-['JetBrains_Mono'] truncate">
                          {project.repositoryUrl}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 bg-white border border-[#111111] shrink-0 font-['JetBrains_Mono']">
                      Select
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div>
            <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#777777] font-['JetBrains_Mono']">
              Quick Shortcuts
            </div>
            <div className="grid grid-cols-2 gap-2 mt-1">
              <button
                onClick={() => {
                  onSelectTab({ id: "upload", path: "/new-analysis" });
                  onClose();
                }}
                className="flex items-center gap-2 p-2 bg-[#F0F0F0] border border-[#111111] hover:bg-[#F0C020] text-left transition-colors"
              >
                <Plus className="w-3.5 h-3.5 text-[#111111]" />
                <span className="text-[11px] font-bold uppercase font-['JetBrains_Mono'] text-[#111111]">
                  New Analysis
                </span>
              </button>
              <button
                onClick={() => {
                  onOpenProfile();
                  onClose();
                }}
                className="flex items-center gap-2 p-2 bg-[#F0F0F0] border border-[#111111] hover:bg-[#F0C020] text-left transition-colors"
              >
                <User className="w-3.5 h-3.5 text-[#111111]" />
                <span className="text-[11px] font-bold uppercase font-['JetBrains_Mono'] text-[#111111]">
                  Edit Profile
                </span>
              </button>
            </div>
          </div>

          {filteredTabs.length === 0 && filteredProjects.length === 0 && (
            <div className="text-center py-8 text-[#777777] text-xs font-['JetBrains_Mono']">
              No matching commands or repositories found for "{query}".
            </div>
          )}
        </div>

        {/* Footer Hint */}
        <div className="px-4 py-2 bg-[#F0F0F0] border-t-2 border-[#111111] flex items-center justify-between text-[10px] font-['JetBrains_Mono'] text-[#777777]">
          <span>Navigation Quick Jump</span>
          <span>Press ESC to exit</span>
        </div>
      </div>
    </div>
  );
}
