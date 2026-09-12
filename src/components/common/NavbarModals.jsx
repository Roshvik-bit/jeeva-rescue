import React, { useState, useMemo } from "react";
import { useRescueEmergency } from "../../context/RescueContext";
import {
  ShieldAlert,
  AlertTriangle,
  Flame,
  Activity,
  CheckCircle2,
  X,
  Search,
  Truck,
  ExternalLink,
  MapPin,
  Clock,
  Radio,
  Volume2,
  Wifi,
  WifiOff,
  Building2,
  Users,
  Navigation
} from "lucide-react";

export const NavbarModals = () => {
  const {
    activeModal,
    setActiveModal,
    incidents,
    rescueUnits,
    rescueDepartments,
    isOnline,
    toggleOnlineStatus,
    playEmergencyAudio,
    setActiveTab,
    setInspectedIncident,
    setDispatchingIncident,
    t
  } = useRescueEmergency();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSeverity, setSelectedSeverity] = useState("all");

  if (!activeModal) return null;

  // 1. INCIDENTS POPUP MODAL
  if (activeModal === "incidents") {
    const activeIncidents = incidents.filter(
      (i) => i.status !== "Resolved" && i.status !== "REJECTED" && !i.isFalseAlarm
    );

    const filtered = activeIncidents.filter((inc) => {
      if (selectedSeverity !== "all" && inc.severity !== selectedSeverity) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = (inc.title || "").toLowerCase().includes(q);
        const matchesAddress = (inc.location?.address || "").toLowerCase().includes(q);
        const matchesCategory = (inc.category || "").toLowerCase().includes(q);
        if (!matchesTitle && !matchesAddress && !matchesCategory) return false;
      }
      return true;
    });

    return (
      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn"
        onClick={() => setActiveModal(null)}
      >
        <div
          className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50 shrink-0">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-red-100 text-red-700">
                <ShieldAlert className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 leading-tight">
                  Active Emergency Incidents
                </h3>
                <p className="text-xs text-slate-500">
                  {activeIncidents.length} active incident(s) currently awaiting field resolution
                </p>
              </div>
            </div>

            <button
              onClick={() => setActiveModal(null)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search & Severity Filter Bar */}
          <div className="p-3 border-b border-slate-100 bg-white flex flex-col sm:flex-row items-center gap-2 shrink-0">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search incident by title, location, category..."
                className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800"
              />
            </div>

            <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto">
              {["all", "Critical", "High", "Medium"].map((sev) => (
                <button
                  key={sev}
                  onClick={() => setSelectedSeverity(sev)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap cursor-pointer transition-all ${
                    selectedSeverity === sev
                      ? "bg-slate-900 text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {sev === "all" ? "All Severities" : sev}
                </button>
              ))}
            </div>
          </div>

          {/* Incidents List Body */}
          <div className="p-4 overflow-y-auto space-y-3 flex-1">
            {filtered.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs">
                <ShieldAlert className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="font-semibold text-slate-700">No matching active incidents</p>
                <p className="text-slate-400 mt-0.5">All incidents in this category are resolved or filtered out.</p>
              </div>
            ) : (
              filtered.map((inc) => {
                const isCritical = inc.severity === "Critical" || inc.priorityScore >= 8.5;
                return (
                  <div
                    key={inc.id}
                    className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs hover:border-slate-300 hover:shadow-sm transition-all space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider ${
                              isCritical
                                ? "bg-red-100 text-red-800 border border-red-200"
                                : "bg-amber-100 text-amber-800 border border-amber-200"
                            }`}
                          >
                            {inc.severity} • {inc.category}
                          </span>
                          <span className="font-mono text-[11px] text-slate-400">
                            #{inc.id}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 leading-snug">
                          {inc.title || inc.location?.address || "Emergency Distress Incident"}
                        </h4>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-[10px] font-mono text-slate-400 uppercase block">Score</span>
                        <span className={`text-base font-extrabold font-mono ${isCritical ? "text-red-600" : "text-amber-600"}`}>
                          {inc.priorityScore}/10
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-red-500" />
                        <span>{inc.location?.address || "Coordinates recorded"}</span>
                      </span>
                      {inc.peopleCount && (
                        <span className="flex items-center gap-1 text-slate-700 font-semibold">
                          <Users className="w-3.5 h-3.5 text-blue-600" />
                          <span>{inc.peopleCount} civilians</span>
                        </span>
                      )}
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        Status: {inc.status || "Pending"}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                      <button
                        onClick={() => {
                          setActiveModal(null);
                          setDispatchingIncident(inc);
                        }}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <Truck className="w-3.5 h-3.5" />
                        <span>Dispatch Unit</span>
                      </button>

                      <button
                        onClick={() => {
                          setActiveModal(null);
                          setInspectedIncident(inc);
                        }}
                        className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-[#1976D2] hover:bg-blue-700 text-white transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>View Details</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
            <span className="text-xs text-slate-500 font-medium">
              Click any incident to inspect live details or deploy response teams.
            </span>
            <button
              onClick={() => {
                setActiveModal(null);
                setActiveTab("incidents");
              }}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Open Full Incident Queue →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. CRITICAL ALERTS POPUP MODAL
  if (activeModal === "alerts") {
    const criticalIncidents = incidents.filter(
      (i) => (i.severity === "Critical" || i.priorityScore >= 8.0 || i.isAbsoluteEmergency) && i.status !== "Resolved"
    );

    return (
      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-slate-900/65 backdrop-blur-sm animate-fadeIn"
        onClick={() => setActiveModal(null)}
      >
        <div
          className="relative w-full max-w-xl bg-white border border-red-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-red-100 bg-red-50 shrink-0">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-red-600 text-white animate-pulse">
                <Flame className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-base font-extrabold text-red-950 leading-tight">
                  High-Priority & Critical Alerts
                </h3>
                <p className="text-xs text-red-700">
                  Immediate life-safety threats requiring rapid resource deployment
                </p>
              </div>
            </div>

            <button
              onClick={() => setActiveModal(null)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-red-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4 overflow-y-auto space-y-3 flex-1">
            {criticalIncidents.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                <p className="font-bold text-slate-800 text-sm">No Active Critical Emergencies</p>
                <p className="text-slate-500 mt-1">
                  All critical incidents have been triaged, dispatched, or resolved.
                </p>
              </div>
            ) : (
              criticalIncidents.map((inc) => (
                <div
                  key={inc.id}
                  className="bg-red-50/40 border border-red-200 rounded-xl p-3.5 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded bg-red-600 text-white text-[10px] font-extrabold uppercase tracking-wider animate-pulse">
                      🚨 Absolute Urgency
                    </span>
                    <span className="font-mono text-xs font-bold text-red-700">
                      Score: {inc.priorityScore}/10
                    </span>
                  </div>

                  <h4 className="font-extrabold text-sm text-slate-900 leading-snug">
                    {inc.title || inc.location?.address}
                  </h4>

                  <p className="text-xs text-slate-600">
                    📍 {inc.location?.address || "Field Location"} • {inc.peopleCount ? `${inc.peopleCount} trapped civilians` : "Urgent distress"}
                  </p>

                  <div className="pt-2 border-t border-red-100 flex items-center justify-end gap-2">
                    <button
                      onClick={() => {
                        setActiveModal(null);
                        setDispatchingIncident(inc);
                      }}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-red-600 hover:bg-red-700 text-white transition-colors cursor-pointer shadow-xs"
                    >
                      Emergency Dispatch
                    </button>
                    <button
                      onClick={() => {
                        setActiveModal(null);
                        setInspectedIncident(inc);
                      }}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 transition-colors cursor-pointer"
                    >
                      Inspect Report
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
            <button
              onClick={() => playEmergencyAudio("siren")}
              className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-red-600 text-xs font-bold hover:bg-red-50 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>Sound Siren Test</span>
            </button>

            <button
              onClick={() => setActiveModal(null)}
              className="px-4 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. SYSTEM & NETWORK STATUS MODAL
  if (activeModal === "status") {
    return (
      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn"
        onClick={() => setActiveModal(null)}
      >
        <div
          className="relative w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-teal-100 text-teal-700">
                <Activity className="w-5 h-5 animate-pulse" />
              </span>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 leading-tight">
                  Operational System Status
                </h3>
                <p className="text-xs text-slate-500">
                  Real-time telemetry, database health & network uplinks
                </p>
              </div>
            </div>

            <button
              onClick={() => setActiveModal(null)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-5 space-y-4 text-xs">
            {/* Supabase Status */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="font-bold text-slate-800 block">Supabase Realtime WebSockets</span>
                <span className="text-slate-500 text-[11px]">Database channel: `incidents`</span>
              </div>
              <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Active</span>
              </span>
            </div>

            {/* Offline Sync State */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="font-bold text-slate-800 block">Network Connectivity</span>
                <span className="text-slate-500 text-[11px]">
                  {isOnline ? "Live bi-directional telemetry" : "Local IndexedDB cached fallback"}
                </span>
              </div>
              <button
                onClick={() => toggleOnlineStatus()}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                  isOnline
                    ? "bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                    : "bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
                }`}
              >
                {isOnline ? "Simulate Offline" : "Reconnect Online"}
              </button>
            </div>

            {/* Audio & Telemetry test */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="font-bold text-slate-800 block">Emergency Siren Engine</span>
                <span className="text-slate-500 text-[11px]">Audio alert buzzer system</span>
              </div>
              <button
                onClick={() => playEmergencyAudio("siren")}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-red-50 border border-red-200 text-red-700 hover:bg-red-100 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Test Audio</span>
              </button>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-[11px] text-blue-900 space-y-1">
              <p className="font-bold flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-blue-600" />
                <span>National Emergency Encryption: Active</span>
              </p>
              <p className="text-blue-700 leading-relaxed">
                JEEVA Command Center maintains encrypted TLS 1.3 sync with state disaster agencies and municipal dispatch towers.
              </p>
            </div>
          </div>

          <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
            <button
              onClick={() => setActiveModal(null)}
              className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 cursor-pointer"
            >
              Close Status
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};
