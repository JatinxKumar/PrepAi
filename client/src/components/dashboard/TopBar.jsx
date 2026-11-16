import React, { useState, useRef, useEffect } from "react";
import {
  Search,
  Bell,
  Plus,
  User,
  Settings,
  LogOut,
  ChevronDown,
  Sparkles,
  Check,
  History,
  Code2,
} from "lucide-react";

export default function TopBar({
  user,
  activeTabLabel,
  activeRepoName,
  onOpenCommandPalette,
  onStartNewAnalysis,
  onOpenProfile,
  onLogout,
  history = [],
}) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const notifRef = useRef(null);
  const userMenuRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .substring(0, 2)
        .toUpperCase()
    : "U";

  // Notifications derived from actual events
  const notifications = [
    {
      id: "sys-ready",
      title: "Placement Engine Online",
      detail: "7-agent autonomous code pipeline active and ready.",
      time: "Just now",
      read: false,
    },
    ...(history.slice(0, 3).map((item, idx) => ({
      id: `repo-${item._id || idx}`,
      title: `Repo Analyzed: ${item.name}`,
      detail: `${item.vivaPrep?.length || 0} viva defense drills generated.`,
      time: new Date(item.createdAt).toLocaleDateString(),
      read: true,
    }))),
  ];

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 print:hidden border-b-[3px] border-[#111111] pb-5 font-bauhaus">
      {/* Left: Active Section Info */}
      <div>
        <div className="inline-block px-2 py-0.5 bg-[#F0C020] border-2 border-[#111111] text-[10px] font-bold uppercase tracking-wider font-['JetBrains_Mono'] mb-1.5 shadow-[2px_2px_0_#111111]">
          COMMAND COCKPIT
        </div>
        <h1 className="text-3xl font-black tracking-tight text-[#111111] uppercase font-['Outfit'] flex items-center gap-2.5">
          {activeTabLabel}
        </h1>
        {activeRepoName && (
          <p className="text-xs text-[#555555] mt-1.5 flex items-center gap-2 font-['JetBrains_Mono']">
            <span>ACTIVE REPO:</span>
            <span className="text-[#111111] font-bold px-2 py-0.5 bg-white border border-[#111111] shadow-[2px_2px_0_#111111]">
              {activeRepoName}
            </span>
          </p>
        )}
      </div>

      {/* Right Controls: Search, Notifications, Avatar, CTA */}
      <div className="flex items-center flex-wrap gap-2.5 sm:gap-3">
        {/* Global Search / Command Palette Trigger */}
        <button
          onClick={onOpenCommandPalette}
          className="flex items-center gap-2 px-3 py-2 bg-white border-2 border-[#111111] shadow-[3px_3px_0_#111111] hover:bg-[#F0F0F0] active:translate-x-0.5 active:translate-y-0.5 transition-all text-xs font-['JetBrains_Mono'] text-[#555555] cursor-pointer"
          title="Global Search (Ctrl+K)"
        >
          <Search className="w-3.5 h-3.5 text-[#111111]" />
          <span className="hidden md:inline">Quick Jump...</span>
          <kbd className="px-1.5 py-0.2 bg-[#F0F0F0] border border-[#111111] text-[10px] font-bold text-[#111111]">
            Ctrl K
          </kbd>
        </button>

        {/* Notifications Bell Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2.5 bg-white border-2 border-[#111111] shadow-[3px_3px_0_#111111] hover:bg-[#F0C020] active:translate-x-0.5 active:translate-y-0.5 transition-all relative cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-4 h-4 text-[#111111]" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-[#D02020] border border-[#111111]" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white border-[3px] border-[#111111] shadow-[6px_6px_0_#111111] z-50 animate-in fade-in duration-100">
              <div className="flex items-center justify-between p-3 border-b-2 border-[#111111] bg-[#F0F0F0]">
                <span className="text-xs font-black uppercase font-['Outfit'] text-[#111111]">
                  Activity Updates
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 bg-[#F0C020] border border-[#111111] font-['JetBrains_Mono']">
                  {notifications.length}
                </span>
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-[#E0E0E0] custom-scrollbar">
                {notifications.map((n) => (
                  <div key={n.id} className="p-3 hover:bg-[#F9F9F9] transition-colors">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-bold text-[#111111] font-['Outfit'] uppercase">
                        {n.title}
                      </p>
                      <span className="text-[10px] text-[#777777] font-['JetBrains_Mono']">
                        {n.time}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#555555] font-sans leading-relaxed">
                      {n.detail}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Avatar Menu Dropdown */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-1.5 bg-white border-2 border-[#111111] shadow-[3px_3px_0_#111111] hover:bg-[#F0C020] transition-all cursor-pointer"
          >
            <div className="w-7 h-7 bg-[#1040C0] border border-[#111111] text-white flex items-center justify-center text-xs font-black font-['JetBrains_Mono']">
              {initials}
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-[#111111]" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white border-[3px] border-[#111111] shadow-[6px_6px_0_#111111] z-50 animate-in fade-in duration-100">
              <div className="p-3 border-b-2 border-[#111111] bg-[#F0F0F0]">
                <p className="text-xs font-black uppercase font-['Outfit'] text-[#111111] truncate">
                  {user?.name || "Developer"}
                </p>
                <p className="text-[10px] text-[#555555] font-['JetBrains_Mono'] truncate">
                  {user?.email || "user@example.com"}
                </p>
              </div>

              <div className="p-1 space-y-0.5">
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    onOpenProfile();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold uppercase font-['JetBrains_Mono'] text-[#111111] hover:bg-[#F0C020] text-left transition-colors"
                >
                  <User className="w-3.5 h-3.5" /> Edit Profile
                </button>
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    onOpenProfile();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold uppercase font-['JetBrains_Mono'] text-[#111111] hover:bg-[#F0C020] text-left transition-colors"
                >
                  <Settings className="w-3.5 h-3.5" /> Workspace Config
                </button>
                <div className="border-t border-[#111111] my-1" />
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    onLogout();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold uppercase font-['JetBrains_Mono'] text-[#D02020] hover:bg-[#D02020] hover:text-white text-left transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" /> Sign Out
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Start New Analysis CTA Button */}
        <button
          onClick={onStartNewAnalysis}
          className="bauhaus-btn-primary px-4 py-2.5 text-xs"
        >
          <Plus className="w-4 h-4 mr-1.5" /> New Analysis
        </button>
      </div>
    </div>
  );
}
