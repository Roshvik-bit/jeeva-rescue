import React, { useState } from "react";
import { useRescueEmergency } from "../../context/RescueContext";
import {
  ShieldAlert,
  Globe,
  Volume2,
  Activity,
  Trash2,
  LayoutDashboard,
  Map as MapIcon,
  Bell,
  Building2,
  Flame,
  Menu,
  X
} from "lucide-react";

export const RescueNavbar = () => {
  const {
    language,
    setLanguage,
    t,
    isOnline,
    toggleOnlineStatus,
    incidents,
    rescueDepartments = [],
    clearAllIncidents,
    playEmergencyAudio,
    activeTab,
    setActiveTab,
    activeModal,
    setActiveModal
  } = useRescueEmergency();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const languages = [
    { code: "en", label: "English" },
    { code: "hi", label: "हिन्दी (Hindi)" },
    { code: "kn", label: "ಕನ್ನಡ (Kannada)" },
    { code: "bn", label: "বাংলা (Bengali)" },
    { code: "ta", label: "தமிழ் (Tamil)" },
    { code: "te", label: "తెలుగు (Telugu)" },
    { code: "ml", label: "മലയാളം (Malayalam)" },
    { code: "mr", label: "मराठी (Marathi)" }
  ];

  const activeIncidentsCount = incidents.filter(
    (i) => i.status !== "Resolved" && i.status !== "REJECTED" && !i.isFalseAlarm
  ).length;

  const criticalAlertsCount = incidents.filter(
    (i) => (i.severity === "Critical" || i.priorityScore >= 8.5) && i.status !== "Resolved"
  ).length;

  const navLinks = [
    {
      id: "dashboard",
      label: t.dashboard || "Dashboard",
      icon: <LayoutDashboard className="w-4 h-4" />,
      action: () => {
        setActiveTab("dashboard");
        setMobileMenuOpen(false);
      },
      isActive: activeTab === "dashboard" && !activeModal
    },
    {
      id: "incidents",
      label: t.incidents || "Incidents",
      icon: <ShieldAlert className="w-4 h-4" />,
      action: () => {
        setActiveModal("incidents");
        setMobileMenuOpen(false);
      },
      count: activeIncidentsCount,
      countBadgeColor: "bg-blue-100 text-blue-800 border-blue-200",
      isActive: activeModal === "incidents"
    },
    {
      id: "map",
      label: t.map || "Map",
      icon: <MapIcon className="w-4 h-4" />,
      action: () => {
        setActiveTab("map");
        setMobileMenuOpen(false);
      },
      isActive: activeTab === "map" && !activeModal
    },
    {
      id: "alerts",
      label: t.alerts || "Alerts",
      icon: <Bell className="w-4 h-4" />,
      action: () => {
        setActiveModal("alerts");
        setMobileMenuOpen(false);
      },
      count: criticalAlertsCount,
      countBadgeColor: "bg-red-100 text-red-700 border-red-200 animate-pulse",
      isActive: activeModal === "alerts"
    },
    {
      id: "resources",
      label: "Rescue Bases",
      icon: <Building2 className="w-4 h-4" />,
      action: () => {
        setActiveTab("resources");
        setMobileMenuOpen(false);
      },
      count: rescueDepartments.length,
      countBadgeColor: "bg-slate-100 text-slate-700 border-slate-200",
      isActive: activeTab === "resources" && !activeModal
    }
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        {/* Brand: JEEVA | Rescue Command */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setActiveTab("dashboard")}
            className="flex items-center gap-2.5 text-left group focus:outline-none cursor-pointer"
            title="Go to Dashboard"
          >
            <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-xs overflow-hidden p-0.5 group-hover:border-blue-400 transition-colors">
              <img
                src="/logo-white.png"
                alt="JEEVA Command"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex flex-col justify-center">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-slate-900 leading-none group-hover:text-blue-600 transition-colors">
                  {t.appName || "JEEVA"}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200 uppercase tracking-wider">
                  Rescue Command
                </span>
              </div>
              <span className="text-[11px] text-slate-500 font-medium hidden sm:inline mt-0.5">
                Disaster Incident Management & Fleet Dispatch System
              </span>
            </div>
          </button>
        </div>

        {/* Interactive Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 bg-slate-50/80 p-1 rounded-xl border border-slate-200/80">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={link.action}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                link.isActive
                  ? "bg-[#1976D2] text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/70"
              }`}
            >
              <span className={link.isActive ? "text-white" : "text-slate-500"}>
                {link.icon}
              </span>
              <span>{link.label}</span>
              {link.count !== undefined && (
                <span
                  className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full border ${
                    link.isActive
                      ? "bg-white/20 text-white border-white/30"
                      : link.countBadgeColor
                  }`}
                >
                  {link.count}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Live Operations & Status Indicators */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Active Incident Counter Pill (Clickable -> Opens Incidents Popup) */}
          <button
            onClick={() => setActiveModal("incidents")}
            title="Click to inspect all active incidents"
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-xs font-semibold text-slate-700 hover:text-blue-700 transition-all cursor-pointer shadow-2xs group"
          >
            <Activity className="w-3.5 h-3.5 text-blue-600 animate-pulse group-hover:scale-110 transition-transform" />
            <span>{activeIncidentsCount} Active Incidents</span>
          </button>

          {/* Online / Offline Status Button (Clickable -> Opens System Status Modal) */}
          <button
            onClick={() => setActiveModal("status")}
            title="Click to view Live Telemetry & System Status"
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer shadow-2xs ${
              isOnline
                ? "bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                : "bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isOnline ? "bg-green-600 animate-pulse" : "bg-red-600"
              }`}
            />
            <span className="hidden sm:inline">{isOnline ? "Live Command" : "Offline"}</span>
            <span className="sm:hidden">{isOnline ? "Live" : "Off"}</span>
          </button>

          {/* Multilingual Selector */}
          <div className="relative hidden sm:block">
            <label htmlFor="language-select-rescue" className="sr-only">
              Select Language
            </label>
            <div className="flex items-center bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-700 focus-within:border-blue-500">
              <Globe className="w-3.5 h-3.5 text-slate-400 mr-1.5 shrink-0" />
              <select
                id="language-select-rescue"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-transparent text-slate-700 text-xs focus:outline-none cursor-pointer pr-1"
              >
                {languages.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Siren Alert Test Button */}
          <button
            onClick={() => playEmergencyAudio("siren")}
            title="Test Emergency Siren Tone"
            className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:text-red-600 hover:bg-red-50 hover:border-red-200 transition-colors cursor-pointer"
            aria-label="Sound Siren"
          >
            <Volume2 className="w-4 h-4 text-red-600" />
          </button>

          {/* Clear Incidents Operational Trigger */}
          <button
            onClick={() => {
              if (
                window.confirm(
                  "Are you sure you want to clear all operational incidents for a fresh operational cycle?"
                )
              ) {
                clearAllIncidents();
              }
            }}
            title="Clear Incidents (Drill / Testing)"
            className="p-2 rounded-lg border border-slate-200 text-slate-400 hover:text-red-600 hover:bg-red-50 hover:border-red-200 transition-colors cursor-pointer hidden sm:flex"
            aria-label="Clear Incidents"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          {/* Mobile Navigation Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-2 animate-fadeIn">
          <div className="grid grid-cols-2 gap-2">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={link.action}
                className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  link.isActive
                    ? "bg-[#1976D2] text-white shadow-xs"
                    : "bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>{link.icon}</span>
                  <span>{link.label}</span>
                </div>
                {link.count !== undefined && (
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${
                      link.isActive
                        ? "bg-white/20 text-white"
                        : "bg-slate-200 text-slate-700"
                    }`}
                  >
                    {link.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <button
              onClick={() => {
                setActiveModal("status");
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-1.5 text-slate-600 font-semibold py-1 px-2 rounded-lg hover:bg-slate-50"
            >
              <Activity className="w-3.5 h-3.5 text-teal-600" />
              <span>System Telemetry</span>
            </button>

            <button
              onClick={() => {
                if (
                  window.confirm(
                    "Are you sure you want to clear all operational incidents for a fresh operational cycle?"
                  )
                ) {
                  clearAllIncidents();
                  setMobileMenuOpen(false);
                }
              }}
              className="flex items-center gap-1.5 text-red-600 font-semibold py-1 px-2 rounded-lg hover:bg-red-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Incidents</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

