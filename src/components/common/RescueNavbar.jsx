import React from "react";
import { useRescueEmergency } from "../../context/RescueContext";
import {
  ShieldAlert,
  Globe,
  Volume2,
  Activity,
  Trash2
} from "lucide-react";

export const RescueNavbar = () => {
  const {
    language,
    setLanguage,
    t,
    isOnline,
    toggleOnlineStatus,
    incidents,
    clearAllIncidents,
    playEmergencyAudio
  } = useRescueEmergency();

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

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        {/* Brand: JEEVA | Rescue Command */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5 text-left">
            <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center shadow-xs overflow-hidden p-0.5">
              <img src="/logo-white.png" alt="JEEVA Command" className="w-full h-full object-contain" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-slate-900 leading-none">
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
          </div>
        </div>

        {/* Live Operations & Status Indicators */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Active Incident Counter Pill */}
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700">
            <Activity className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
            <span>{incidents.filter(i => i.status !== "Resolved" && i.status !== "REJECTED").length} Active Incidents</span>
          </div>

          {/* Online / Offline Status Button */}
          <button
            onClick={() => toggleOnlineStatus()}
            title={isOnline ? "Click to simulate Offline Mode" : "Click to simulate Online Reconnection"}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
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
            <span>{isOnline ? "Live Command" : "Offline Mode"}</span>
          </button>

          {/* Multilingual Selector */}
          <div className="relative">
            <label htmlFor="language-select-rescue" className="sr-only">Select Language</label>
            <div className="flex items-center bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus-within:border-blue-500">
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

          {/* Siren Alert Test */}
          <button
            onClick={() => playEmergencyAudio("siren")}
            title="Test Emergency Siren Tone"
            className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:text-red-600 hover:bg-red-50 transition-colors"
            aria-label="Sound Siren"
          >
            <Volume2 className="w-4 h-4 text-red-600" />
          </button>

          {/* Clear Incidents Operational Trigger */}
          <button
            onClick={() => {
              if (window.confirm("Are you sure you want to clear all operational incidents for a fresh operational cycle?")) {
                clearAllIncidents();
              }
            }}
            title="Clear Incidents (Drill / Testing)"
            className="p-2 rounded-lg border border-slate-200 text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
            aria-label="Clear Incidents"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
