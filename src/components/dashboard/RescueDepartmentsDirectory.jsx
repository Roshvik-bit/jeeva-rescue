import React, { useState, useMemo } from "react";
import { useRescueEmergency } from "../../context/RescueContext";
import { 
  Building2, 
  Shield, 
  MapPin, 
  Phone, 
  Radio, 
  Users, 
  Search, 
  ExternalLink, 
  CheckCircle2, 
  Truck,
  Filter,
  Navigation
} from "lucide-react";

export const RescueDepartmentsDirectory = ({ onFocusDepartmentOnMap }) => {
  const { rescueDepartments = [], rescueUnits = [], regionalZones = [], t } = useRescueEmergency();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedZone, setSelectedZone] = useState("all");
  const [selectedAgency, setSelectedAgency] = useState("all");

  // Filter departments based on search, zone, agency
  const filteredDepartments = useMemo(() => {
    return rescueDepartments.filter((dept) => {
      // Zone filter
      if (selectedZone !== "all" && dept.zone !== selectedZone) {
        return false;
      }

      // Agency filter
      if (selectedAgency !== "all" && dept.agency !== selectedAgency) {
        return false;
      }

      // Text search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = dept.name.toLowerCase().includes(q);
        const matchesCity = dept.city.toLowerCase().includes(q);
        const matchesState = dept.state.toLowerCase().includes(q);
        const matchesEquip = dept.equipment.some((e) => e.toLowerCase().includes(q));
        if (!matchesName && !matchesCity && !matchesState && !matchesEquip) {
          return false;
        }
      }

      return true;
    });
  }, [rescueDepartments, searchQuery, selectedZone, selectedAgency]);

  // Aggregate stats
  const totalPersonnel = useMemo(() => {
    return rescueDepartments.reduce((acc, d) => acc + (d.personnelStrength || 0), 0);
  }, [rescueDepartments]);

  const totalNdrf = useMemo(() => {
    return rescueDepartments.filter((d) => d.agency === "NDRF").length;
  }, [rescueDepartments]);

  const totalSdrf = useMemo(() => {
    return rescueDepartments.filter((d) => d.agency === "SDRF" || d.agency.includes("Fire")).length;
  }, [rescueDepartments]);

  return (
    <div className="space-y-5">
      {/* Header & National Overview Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
                <Building2 className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                National Rescue Departments & Disaster Hubs
              </h2>
            </div>
            <p className="text-xs text-slate-500 max-w-2xl">
              Official pan-India directory of National Disaster Response Force (NDRF) Battalions, State Disaster Response Forces (SDRF), and Fire & Coastal Marine Emergency Commands.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>24/7 Strategic Alert</span>
            </span>
          </div>
        </div>

        {/* National Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-slate-100">
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Command Bases
            </span>
            <span className="text-xl font-extrabold text-slate-900 font-mono mt-0.5 block">
              {rescueDepartments.length}
            </span>
            <span className="text-[10px] text-slate-400">Covering all 28 States & UTs</span>
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Total Responders
            </span>
            <span className="text-xl font-extrabold text-blue-700 font-mono mt-0.5 block">
              {totalPersonnel.toLocaleString()}+
            </span>
            <span className="text-[10px] text-slate-400">Trained Specialized Forces</span>
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              NDRF Battalions
            </span>
            <span className="text-xl font-extrabold text-amber-700 font-mono mt-0.5 block">
              {totalNdrf}
            </span>
            <span className="text-[10px] text-slate-400">Federal Heavy Response</span>
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              SDRF / State Commands
            </span>
            <span className="text-xl font-extrabold text-teal-700 font-mono mt-0.5 block">
              {totalSdrf}
            </span>
            <span className="text-[10px] text-slate-400">State & Coastal Commands</span>
          </div>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by city, state, agency or equipment..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all text-slate-800 placeholder:text-slate-400 font-medium"
            />
          </div>

          {/* Agency Filter */}
          <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Agency:
            </span>
            {[
              { id: "all", label: "All Agencies" },
              { id: "NDRF", label: "🏛️ NDRF" },
              { id: "SDRF", label: "🛡️ SDRF" },
              { id: "State Fire & Disaster", label: "🚒 State Fire" }
            ].map((ag) => {
              const active = selectedAgency === ag.id;
              return (
                <button
                  key={ag.id}
                  onClick={() => setSelectedAgency(ag.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    active
                      ? "bg-slate-900 text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200"
                  }`}
                >
                  {ag.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Zone Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-slate-100 no-scrollbar">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
            Zone:
          </span>
          {[
            { id: "all", label: "All Zones" },
            { id: "North", label: "North India" },
            { id: "South", label: "South India" },
            { id: "West", label: "West India" },
            { id: "East", label: "East India" },
            { id: "Central", label: "Central India" },
            { id: "North-East", label: "North-East" }
          ].map((z) => {
            const active = selectedZone === z.id;
            return (
              <button
                key={z.id}
                onClick={() => setSelectedZone(z.id)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  active
                    ? "bg-[#1976D2] text-white shadow-2xs font-bold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                {z.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Directory Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDepartments.map((dept) => {
          const isNdrf = dept.agency === "NDRF";
          const isSdrf = dept.agency === "SDRF";
          const badgeBg = isNdrf ? "bg-slate-900 text-amber-400 border-slate-800" : isSdrf ? "bg-blue-900 text-sky-300 border-blue-800" : "bg-rose-900 text-rose-200 border-rose-800";

          return (
            <div
              key={dept.id}
              className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Card Top Header */}
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black border uppercase tracking-wider ${badgeBg}`}>
                    {dept.agency} • {dept.zone} Zone
                  </span>
                  <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <span>Ready</span>
                  </span>
                </div>

                {/* Station Name */}
                <h3 className="font-extrabold text-sm text-slate-900 leading-snug mb-1">
                  {dept.name}
                </h3>

                {/* City & State Location */}
                <p className="flex items-center gap-1 text-xs text-slate-500 font-medium mb-3">
                  <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                  <span>{dept.city}, {dept.state}</span>
                </p>

                {/* Operational Details Box */}
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-2.5 space-y-1.5 text-xs mb-3">
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="flex items-center gap-1 text-[11px] text-slate-500">
                      <Phone className="w-3 h-3 text-slate-400" /> Emergency Line:
                    </span>
                    <strong className="font-mono text-slate-800 text-[11px]">
                      {dept.contact.split("/")[0]}
                    </strong>
                  </div>

                  <div className="flex items-center justify-between text-slate-600">
                    <span className="flex items-center gap-1 text-[11px] text-slate-500">
                      <Users className="w-3 h-3 text-slate-400" /> Active Strength:
                    </span>
                    <strong className="text-slate-800 text-[11px]">
                      {dept.personnelStrength} Responders
                    </strong>
                  </div>

                  <div className="flex items-center justify-between text-slate-600">
                    <span className="flex items-center gap-1 text-[11px] text-slate-500">
                      <Radio className="w-3 h-3 text-blue-500" /> SAT-COM Freq:
                    </span>
                    <strong className="font-mono text-blue-700 text-[11px]">
                      {dept.satcomFreq}
                    </strong>
                  </div>
                </div>

                {/* Equipment Badges */}
                <div className="mb-4">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Specialized Fleet & Equipment:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {dept.equipment.map((item, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] bg-slate-100 border border-slate-200 text-slate-700 px-2 py-0.5 rounded-md font-medium"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                <button
                  onClick={() => onFocusDepartmentOnMap(dept)}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-[#1976D2] text-white hover:bg-blue-700 transition-colors shadow-xs cursor-pointer"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Locate on Map</span>
                </button>

                <a
                  href={`tel:${dept.emergencyHotline.split(" ")[0]}`}
                  className="p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
                  title="Direct Emergency Hotline"
                >
                  <Phone className="w-4 h-4" />
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {filteredDepartments.length === 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
          <Building2 className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-slate-800 text-sm">No Rescue Departments Found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search query or selecting a different geographical zone.
          </p>
        </div>
      )}
    </div>
  );
};
