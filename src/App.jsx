import React from "react";
import { RescueProvider, useRescueEmergency } from "./context/RescueContext";
import { RescueNavbar } from "./components/common/RescueNavbar";
import { NavbarModals } from "./components/common/NavbarModals";
import { ToastContainer } from "./components/common/ToastContainer";
import { ErrorBoundary } from "./components/common/ErrorBoundary";
import { DashboardPortal } from "./components/dashboard/DashboardPortal";
import { ShieldAlert, Activity } from "lucide-react";

const RescueAppContent = () => {
  const { t } = useRescueEmergency();

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F9FC] text-[#1F2937] selection:bg-blue-600 selection:text-white">
      {/* Command Center Global Header */}
      <RescueNavbar />

      {/* Global Interactive Navbar Popups & Modals */}
      <NavbarModals />

      {/* Global Toast Notifications */}
      <ToastContainer />

      {/* Main Operational Workspace - Dedicated Dashboard Portal */}
      <main className="flex-1">
        <ErrorBoundary>
          <DashboardPortal />
        </ErrorBoundary>
      </main>

      {/* Command Operations Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 px-4 text-xs text-slate-500 hidden sm:block">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-slate-700">
            <ShieldAlert className="w-4 h-4 text-blue-600" />
            <span className="font-bold text-slate-900">{t.appName || "JEEVA"}</span>
            <span>• Incident Management & Field Rescue Operations</span>
          </div>

          <div className="flex items-center gap-2 text-slate-500 text-xs">
            <Activity className="w-3.5 h-3.5 text-teal-600 animate-pulse" />
            <span>Real-time Operational Link Established with Supabase</span>
          </div>

          <p className="text-[11px] text-slate-400">
            National Disaster Response Agency • Confidential Command Access
          </p>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <RescueProvider>
      <RescueAppContent />
    </RescueProvider>
  );
}
