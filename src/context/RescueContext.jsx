import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import {
  RESCUE_UNITS,
  RESCUE_DEPARTMENTS,
  REGIONAL_ZONES,
  translations,
  storageService,
  supabaseService
} from "@jeeva/shared";

const RescueContext = createContext();

export const RescueProvider = ({ children }) => {
  const [language, setLanguage] = useState("en");
  const [isOnline, setIsOnline] = useState(true);

  // Operational Incidents Store (Loads cached incidents or clean start)
  const [incidents, setIncidents] = useState(() => {
    const saved = storageService.getIncidents();
    const filteredSaved = (saved || []).filter(
      (inc) =>
        inc &&
        !inc.id.startsWith("INC-2026-00") &&
        inc.id !== "TEST-INIT-001" &&
        inc.id !== "JEEVA-2026-TEST" &&
        inc.status !== "Archived" &&
        inc.status !== "Deleted"
    );
    if (saved && saved.length !== filteredSaved.length) {
      storageService.saveIncidents(filteredSaved);
    }
    return filteredSaved.map((inc) => ({
      ...inc,
      priorityScore: inc.priorityScore > 10 ? Number((inc.priorityScore / 10).toFixed(1)) : inc.priorityScore
    }));
  });

  const [rescueUnits, setRescueUnits] = useState(RESCUE_UNITS);
  const [rescueDepartments] = useState(RESCUE_DEPARTMENTS);
  const [selectedRegion, setSelectedRegion] = useState("all");
  const [activeTab, setActiveTab] = useState("dashboard");
  const [activeModal, setActiveModal] = useState(null);
  const [inspectedIncident, setInspectedIncident] = useState(null);
  const [dispatchingIncident, setDispatchingIncident] = useState(null);

  // Toast Notifications
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((toast) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev, { id, duration: 4500, ...toast }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Save incidents to local storage mirror
  useEffect(() => {
    storageService.saveIncidents(incidents);
  }, [incidents]);

  // Emergency Siren audio element
  const activeSirenAudioRef = useRef(null);

  const playSynthSiren = () => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      osc.frequency.setValueAtTime(650, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(950, ctx.currentTime + 0.35);
      osc.frequency.linearRampToValueAtTime(650, ctx.currentTime + 0.7);
      osc.frequency.linearRampToValueAtTime(950, ctx.currentTime + 1.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 1.4);
    } catch (_) {}
  };

  const playSynthBeep = () => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch (_) {}
  };

  const playEmergencyAudio = useCallback((toneType = "siren") => {
    try {
      if (toneType === "siren") {
        if (
          activeSirenAudioRef.current &&
          !activeSirenAudioRef.current.paused &&
          activeSirenAudioRef.current.currentTime > 0 &&
          activeSirenAudioRef.current.currentTime < 5
        ) {
          return;
        }

        if (activeSirenAudioRef.current) {
          try {
            activeSirenAudioRef.current.pause();
            activeSirenAudioRef.current.currentTime = 0;
          } catch (_) {}
        }

        const audio = new Audio("/sounds/android-emergency-alert-tone_cLPHXHO9.mp3");
        audio.volume = 0.95;
        activeSirenAudioRef.current = audio;

        audio.addEventListener("ended", () => {
          activeSirenAudioRef.current = null;
        });

        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch((err) => {
            console.warn("HTML5 Audio prevented, fallback to synth:", err);
            playSynthSiren();
          });
        }
        return;
      }

      if (toneType === "beep") {
        playSynthBeep();
      }
    } catch (err) {
      console.warn("Audio playback exception:", err);
    }
  }, []);

  const stopEmergencyAudio = useCallback(() => {
    if (activeSirenAudioRef.current) {
      try {
        activeSirenAudioRef.current.pause();
        activeSirenAudioRef.current.currentTime = 0;
      } catch (_) {}
      activeSirenAudioRef.current = null;
    }
  }, []);

  // Preload audio
  useEffect(() => {
    try {
      const audio = new Audio("/sounds/android-emergency-alert-tone_cLPHXHO9.mp3");
      audio.preload = "auto";
      audio.load();
    } catch (_) {}
  }, []);

  // Supabase Initial Fetch & Real-time Live Listener for Rescue Command
  useEffect(() => {
    if (!supabaseService.isConfigured()) return;

    // 1. Initial Cloud Fetch
    supabaseService.fetchIncidents().then((cloudIncidents) => {
      if (cloudIncidents) {
        const cleanCloud = cloudIncidents.filter(
          (i) =>
            i &&
            !i.id.startsWith("INC-2026-00") &&
            i.id !== "TEST-INIT-001" &&
            i.id !== "JEEVA-2026-TEST" &&
            i.status !== "Archived" &&
            i.status !== "Deleted"
        );
        setIncidents(cleanCloud);
        storageService.saveIncidents(cleanCloud);
      }
    });

    // 2. Real-time Live WebSockets Subscription
    const unsubscribe = supabaseService.subscribeToIncidents(
      (newIncident) => {
        setIncidents((prev) => {
          if (prev.some((i) => i.id === newIncident.id)) return prev;
          return [newIncident, ...prev];
        });
        playEmergencyAudio("siren");
        addToast({
          type: "warning",
          title: "Real-time Incident Alert",
          message: `Distress alert #${newIncident.id} received in real-time from Supabase.`
        });
      },
      (updatedIncident) => {
        setIncidents((prev) =>
          prev.map((i) => (i.id === updatedIncident.id ? { ...i, ...updatedIncident } : i))
        );
      }
    );

    // Periodic background reconciliation (every 4 seconds) to guarantee zero dropped incidents
    const reconciler = setInterval(() => {
      if (typeof navigator !== "undefined" && !navigator.onLine) return;
      supabaseService.fetchIncidents().then((cloudIncidents) => {
        if (!cloudIncidents) return;
        const cleanCloud = cloudIncidents.filter(
          (i) =>
            i &&
            !i.id.startsWith("INC-2026-00") &&
            i.id !== "TEST-INIT-001" &&
            i.id !== "JEEVA-2026-TEST" &&
            i.status !== "Archived" &&
            i.status !== "Deleted"
        );
        setIncidents((prev) => {
          const prevMap = new Map(prev.map((i) => [i.id, i]));
          let hasDiff = false;
          if (cleanCloud.length !== prev.length) {
            hasDiff = true;
          } else {
            for (const c of cleanCloud) {
              const p = prevMap.get(c.id);
              if (!p || p.status !== c.status || p.assignedUnit !== c.assignedUnit) {
                hasDiff = true;
                break;
              }
            }
          }
          if (hasDiff) {
            storageService.saveIncidents(cleanCloud);
            return cleanCloud;
          }
          return prev;
        });
      });
    }, 4000);

    return () => {
      if (typeof unsubscribe === "function") unsubscribe();
      clearInterval(reconciler);
    };
  }, [addToast, playEmergencyAudio]);

  // Online / Offline toggle
  const toggleOnlineStatus = useCallback(
    (forcedState) => {
      const nextState = typeof forcedState === "boolean" ? forcedState : !isOnline;
      setIsOnline(nextState);

      if (nextState) {
        addToast({
          type: "success",
          title: "Command Center Online",
          message: "Real-time telemetry and database connection active."
        });
      } else {
        addToast({
          type: "warning",
          title: "Offline Simulation Active",
          message: "Command Center operating in cached offline mode."
        });
      }
    },
    [isOnline, addToast]
  );

  // Dispatch rescue unit to incident
  const dispatchRescueUnit = useCallback(
    (incidentId, unitId) => {
      const unit = rescueUnits.find((u) => u.id === unitId);
      const unitName = unit ? unit.name : unitId;

      setIncidents((prev) =>
        prev.map((inc) => {
          if (inc.id === incidentId) {
            return {
              ...inc,
              status: "Dispatched",
              assignedUnit: unitId
            };
          }
          return inc;
        })
      );

      setRescueUnits((prev) =>
        prev.map((u) => {
          if (u.id === unitId) {
            return {
              ...u,
              status: "Dispatched",
              assignedIncidentId: incidentId
            };
          }
          return u;
        })
      );

      if (supabaseService.isConfigured()) {
        supabaseService.updateIncident(incidentId, { status: "Dispatched", assignedUnit: unitId });
      }

      playEmergencyAudio("beep");
      addToast({
        type: "success",
        title: "Unit Dispatched",
        message: `${unitName} assigned and en route to Incident #${incidentId}!`
      });
    },
    [rescueUnits, addToast, playEmergencyAudio]
  );

  // Update incident status
  const updateIncidentStatus = useCallback(
    (incidentId, newStatus) => {
      let freedUnitId = null;

      setIncidents((prev) =>
        prev.map((inc) => {
          if (inc.id === incidentId) {
            if (newStatus === "Resolved" && inc.assignedUnit) {
              freedUnitId = inc.assignedUnit;
            }
            return { ...inc, status: newStatus };
          }
          return inc;
        })
      );

      if (freedUnitId) {
        setRescueUnits((prev) =>
          prev.map((u) => {
            if (u.id === freedUnitId) {
              return { ...u, status: "Available", assignedIncidentId: null };
            }
            return u;
          })
        );
      }

      if (supabaseService.isConfigured()) {
        supabaseService.updateIncident(incidentId, { status: newStatus });
      }

      addToast({
        type: "info",
        title: "Status Updated",
        message: `Incident #${incidentId} updated to "${newStatus}".`
      });
    },
    [addToast]
  );

  // Clear all incidents across the command center and Supabase
  const clearAllIncidents = useCallback(async () => {
    setIncidents([]);
    storageService.clearIncidents();
    if (supabaseService.isConfigured()) {
      await supabaseService.clearAllIncidents();
    }
    addToast({
      type: "info",
      title: "Incidents Cleared",
      message: "All operational incidents have been cleared."
    });
  }, [addToast]);

  const t = { ...translations.en, ...(translations[language] || {}) };

  return (
    <RescueContext.Provider
      value={{
        language,
        setLanguage,
        t,
        isOnline,
        toggleOnlineStatus,
        incidents,
        rescueUnits,
        rescueDepartments,
        regionalZones: REGIONAL_ZONES,
        selectedRegion,
        setSelectedRegion,
        activeTab,
        setActiveTab,
        activeModal,
        setActiveModal,
        inspectedIncident,
        setInspectedIncident,
        dispatchingIncident,
        setDispatchingIncident,
        toasts,
        addToast,
        removeToast,
        dispatchRescueUnit,
        updateIncidentStatus,
        clearAllIncidents,
        playEmergencyAudio,
        stopEmergencyAudio
      }}
    >
      {children}
    </RescueContext.Provider>
  );
};

export const useRescueEmergency = () => {
  const context = useContext(RescueContext);
  if (!context) {
    throw new Error("useRescueEmergency must be used within a RescueProvider");
  }
  return context;
};

// Also export as useEmergency for backward compatibility with existing dashboard components
export const useEmergency = useRescueEmergency;
