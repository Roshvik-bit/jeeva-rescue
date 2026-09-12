import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import { useRescueEmergency } from "../../context/RescueContext";
import { Compass, Building2, Shield, Radio, Phone, Users, MapPin, Layers } from "lucide-react";

export const IncidentMapView = ({ onSelectIncident, selectedIncidentId, onQuickDispatch }) => {
  const { incidents, rescueUnits, rescueDepartments = [], regionalZones = [], t } = useRescueEmergency();
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);
  const unitsLayerRef = useRef(null);
  const departmentsLayerRef = useRef(null);
  const dangerZonesLayerRef = useRef(null);

  const [showDepartments, setShowDepartments] = useState(true);
  const [showRescueUnits, setShowRescueUnits] = useState(true);
  const [showDangerZones, setShowDangerZones] = useState(true);
  const [selectedZoneId, setSelectedZoneId] = useState("all");
  const [mapStyle, setMapStyle] = useState("streets"); // "streets" | "satellite" | "hot"
  const tileLayerRef = useRef(null);

  // Helper to get tile layer options based on OpenStreetMap style
  const getTileConfig = (style) => {
    if (style === "satellite") {
      return {
        url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        attribution: "Tiles &copy; Esri &mdash; Source: Esri, USGS, Maxar",
        maxZoom: 19
      };
    }

    if (style === "hot") {
      return {
        url: "https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png",
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Tiles: <a href="https://www.hotosm.org/">Humanitarian OSM</a>',
        subdomains: "abc",
        maxZoom: 19
      };
    }

    // Default: Clean Standard OpenStreetMap
    return {
      url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      subdomains: "abc",
      maxZoom: 19
    };
  };

  // Switch Tile Layer when mapStyle changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    const config = getTileConfig(mapStyle);
    const newTileLayer = L.tileLayer(config.url, {
      attribution: config.attribution,
      subdomains: config.subdomains || "abc",
      tileSize: config.tileSize || 256,
      zoomOffset: config.zoomOffset || 0,
      className: config.className || "",
      maxZoom: config.maxZoom || 19
    });

    newTileLayer.on("tileerror", () => {
      console.warn("Tile layer error, falling back to standard OpenStreetMap");
    });

    newTileLayer.addTo(map);
    tileLayerRef.current = newTileLayer;
  }, [mapStyle]);

  // Initialize Leaflet Map
  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container) return;

    if (container._leaflet_id) {
      container._leaflet_id = null;
    }

    // Initial center on India overview
    const map = L.map(container, {
      center: [21.7679, 78.8718],
      zoom: 5,
      zoomControl: false
    });

    const config = getTileConfig(mapStyle);
    const initialTiles = L.tileLayer(config.url, {
      attribution: config.attribution,
      subdomains: config.subdomains || "abc",
      tileSize: config.tileSize || 256,
      zoomOffset: config.zoomOffset || 0,
      className: config.className || "",
      maxZoom: config.maxZoom || 19
    }).addTo(map);

    tileLayerRef.current = initialTiles;

    // Zoom control in bottom right
    L.control.zoom({ position: "bottomright" }).addTo(map);

    // Create Layer Groups
    const dangerZones = L.layerGroup().addTo(map);
    const departments = L.layerGroup().addTo(map);
    const units = L.layerGroup().addTo(map);
    const markers = L.layerGroup().addTo(map);

    dangerZonesLayerRef.current = dangerZones;
    departmentsLayerRef.current = departments;
    unitsLayerRef.current = units;
    markersLayerRef.current = markers;
    mapInstanceRef.current = map;

    // Invalidate size on mount
    const timer1 = setTimeout(() => map.invalidateSize(), 150);
    const timer2 = setTimeout(() => map.invalidateSize(), 500);

    const resizeObserver = new ResizeObserver(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    });
    resizeObserver.observe(container);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      resizeObserver.disconnect();
      map.remove();
      mapInstanceRef.current = null;
      if (container) {
        container._leaflet_id = null;
      }
    };
  }, []);

  // Update Markers when incidents, units, departments, or zone filters change
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    const dangerZonesLayer = dangerZonesLayerRef.current;
    const unitsLayer = unitsLayerRef.current;
    const departmentsLayer = departmentsLayerRef.current;

    if (!map || !markersLayer || !departmentsLayer || !unitsLayer) return;

    markersLayer.clearLayers();
    dangerZonesLayer.clearLayers();
    unitsLayer.clearLayers();
    departmentsLayer.clearLayers();

    // 1. Plot Nationwide Rescue Departments & Regional Commands
    if (showDepartments) {
      const filteredDepts = rescueDepartments.filter((dept) => {
        if (selectedZoneId === "all") return true;
        if (selectedZoneId === "chennai") return dept.city.includes("Chennai") || dept.city.includes("Arakkonam");
        return dept.zone === selectedZoneId;
      });

      filteredDepts.forEach((dept) => {
        const isNdrf = dept.agency === "NDRF";
        const isSdrf = dept.agency === "SDRF";
        const bgCol = isNdrf ? "#0f172a" : isSdrf ? "#1e3a8a" : "#831843";
        const borderCol = isNdrf ? "#f59e0b" : isSdrf ? "#38bdf8" : "#f472b6";

        const deptIcon = L.divIcon({
          className: "custom-dept-pin",
          html: `
            <div style="position: relative; width: 32px; height: 32px; cursor: pointer; transition: transform 0.2s ease;"
                 onmouseover="this.style.transform='scale(1.18)'"
                 onmouseout="this.style.transform='scale(1)'">
              <div style="
                width: 30px;
                height: 30px;
                border-radius: 8px;
                background-color: ${bgCol};
                border: 2px solid ${borderCol};
                box-shadow: 0 4px 10px rgba(0,0,0,0.45);
                display: flex;
                align-items: center;
                justify-content: center;
                color: #ffffff;
                font-size: 13px;
              ">
                ${isNdrf ? "🏛️" : isSdrf ? "🛡️" : "🚒"}
              </div>
              <div style="
                position: absolute;
                bottom: -6px;
                left: 50%;
                transform: translateX(-50%);
                background: ${bgCol};
                border: 1px solid ${borderCol};
                color: ${borderCol};
                font-size: 8px;
                font-weight: 800;
                padding: 1px 3.5px;
                border-radius: 4px;
                white-space: nowrap;
                letter-spacing: 0.04em;
                box-shadow: 0 2px 4px rgba(0,0,0,0.3);
              ">
                ${dept.agency}
              </div>
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16]
        });

        const deptMarker = L.marker([dept.lat, dept.lng], { icon: deptIcon, zIndexOffset: 50 });

        const deptPopupHtml = `
          <div style="padding: 12px; font-family: system-ui, -apple-system, sans-serif; width: 270px; color: #1F2937;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
              <span style="font-size: 10px; font-weight: 800; background: ${bgCol}; color: ${borderCol}; padding: 2px 6px; border-radius: 4px; border: 1px solid ${borderCol}; text-transform: uppercase;">
                ${dept.agency} • ${dept.zone} Zone
              </span>
              <span style="font-size: 10px; font-weight: 700; color: #15803d; background: #dcfce7; padding: 2px 6px; border-radius: 4px;">
                ● Ready
              </span>
            </div>
            <h4 style="font-size: 13px; font-weight: 800; color: #0f172a; margin: 4px 0 2px 0; line-height: 1.3;">
              ${dept.name}
            </h4>
            <p style="font-size: 11px; color: #64748b; margin: 0 0 8px 0;">
              📍 ${dept.city}, ${dept.state}
            </p>
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 6px 8px; margin-bottom: 8px; font-size: 11px; display: flex; flex-direction: column; gap: 3px;">
              <div style="display: flex; justify-content: space-between;">
                <span style="color: #64748b;">Emergency Line:</span>
                <strong style="color: #0f172a; font-family: monospace;">${dept.contact.split('/')[0]}</strong>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span style="color: #64748b;">Strength:</span>
                <strong style="color: #0f172a;">${dept.personnelStrength} Responders</strong>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span style="color: #64748b;">SAT-COM:</span>
                <strong style="color: #2563eb; font-family: monospace;">${dept.satcomFreq}</strong>
              </div>
            </div>
            <div style="margin-bottom: 10px;">
              <span style="font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase;">Specialized Fleet:</span>
              <div style="display: flex; flex-wrap: wrap; gap: 4px; margin-top: 3px;">
                ${dept.equipment.slice(0, 3).map(e => `<span style="font-size: 10px; background: #e0f2fe; color: #0369a1; padding: 2px 5px; border-radius: 4px; font-weight: 500;">${e}</span>`).join('')}
              </div>
            </div>
            <button id="btn-focus-${dept.id}" style="
              width: 100%;
              padding: 6px 8px;
              background: #0f172a;
              color: #ffffff;
              font-size: 11px;
              font-weight: 700;
              border: none;
              border-radius: 6px;
              cursor: pointer;
            ">
              🔍 Focus Station Jurisdiction
            </button>
          </div>
        `;

        deptMarker.bindPopup(deptPopupHtml);
        deptMarker.on("popupopen", (e) => {
          const popupEl = e.popup?.getElement();
          const btn = popupEl ? popupEl.querySelector(`#btn-focus-${dept.id}`) : document.getElementById(`btn-focus-${dept.id}`);
          if (btn) {
            btn.onclick = () => {
              map.flyTo([dept.lat, dept.lng], 13, { duration: 1.2 });
            };
          }
        });

        deptMarker.addTo(departmentsLayer);
      });
    }

    // 2. Plot Responding Units
    if (showRescueUnits) {
      rescueUnits.forEach((unit) => {
        const isDispatched = unit.status !== "Available";
        const unitIcon = L.divIcon({
          className: "custom-unit-pin",
          html: `
            <div style="
              width: 28px;
              height: 28px;
              border-radius: 8px;
              background-color: ${isDispatched ? "#6366f1" : "#0284c7"};
              border: 1.5px solid #ffffff;
              box-shadow: 0 4px 8px rgba(0,0,0,0.45);
              display: flex;
              align-items: center;
              justify-content: center;
              color: #ffffff;
              font-size: 12px;
            ">
              🚒
            </div>
          `,
          iconSize: [28, 28],
          iconAnchor: [14, 14]
        });

        const unitMarker = L.marker([unit.lat, unit.lng], { icon: unitIcon, zIndexOffset: 70 });
        unitMarker.bindPopup(`
          <div style="padding: 10px; font-family: system-ui, -apple-system, sans-serif; width: 220px; color: #1F2937;">
            <span style="font-size: 10px; font-weight: 700; color: #0284c7; text-transform: uppercase;">
              ${unit.type} • ${unit.status}
            </span>
            <h4 style="font-size: 12px; font-weight: 700; color: #0f172a; margin: 4px 0;">
              ${unit.name}
            </h4>
            <p style="font-size: 11px; color: #64748b; margin: 0 0 6px 0;">
              Base: ${unit.baseLocation}
            </p>
            <p style="font-size: 11px; color: #334155; font-family: monospace;">
              📞 ${unit.contact}
            </p>
          </div>
        `);
        unitMarker.addTo(unitsLayer);
      });
    }

    // 3. Plot Incidents
    incidents.forEach((inc) => {
      if (!inc.location?.lat || !inc.location?.lng) return;

      const isSelected = selectedIncidentId === inc.id;
      const isCritical = inc.severity === "Critical" && inc.status !== "Resolved";
      const isResolved = inc.status === "Resolved";
      const isFalse = inc.isFalseAlarm || inc.severity === "False Alarm" || inc.priorityScore === 0;

      let pinColor = "#f59e0b";
      if (isFalse) {
        pinColor = "#64748b";
      } else if (isResolved) {
        pinColor = "#10b981";
      } else if (inc.severity === "Critical" || inc.priorityScore >= 8.5 || inc.isAbsoluteEmergency) {
        pinColor = "#ef4444";
      } else if (inc.severity === "High" || inc.priorityScore >= 6.5) {
        pinColor = "#f97316";
      } else if (inc.severity === "Low") {
        pinColor = "#38bdf8";
      }

      const customIcon = L.divIcon({
        className: "custom-incident-pin",
        html: `
          <div style="position: relative; width: 34px; height: 34px; cursor: pointer;">
            ${isCritical && !isFalse
            ? `<div style="position: absolute; inset: -6px; border-radius: 9999px; background: rgba(239, 68, 68, 0.4); animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>`
            : ""
          }
            <div style="
              width: 32px;
              height: 32px;
              border-radius: 9999px;
              background-color: ${pinColor};
              border: 2px solid #ffffff;
              box-shadow: 0 4px 12px rgba(0,0,0,0.6);
              display: flex;
              align-items: center;
              justify-content: center;
              color: #ffffff;
              font-weight: 800;
              font-size: 11px;
              font-family: monospace;
              transform: ${isSelected ? "scale(1.2)" : "scale(1)"};
              transition: transform 0.2s ease;
            ">
              ${isFalse ? "0.0" : (inc.priorityScore || "!")}
            </div>
            ${(inc.corroboratingReportsCount || 1) > 1
            ? `<div style="position: absolute; top: -4px; right: -4px; background: #0f172a; border: 1px solid #f59e0b; color: #f59e0b; border-radius: 9999px; width: 16px; height: 16px; font-size: 9px; font-weight: bold; display: flex; align-items: center; justify-content: center;">${inc.corroboratingReportsCount}</div>`
            : ""
          }
          </div>
        `,
        iconSize: [34, 34],
        iconAnchor: [17, 17]
      });

      const marker = L.marker([inc.location.lat, inc.location.lng], { icon: customIcon, zIndexOffset: 100 });

      const popupHtml = `
        <div style="padding: 12px; font-family: system-ui, -apple-system, sans-serif; width: 240px; color: #1F2937;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
            <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: ${pinColor}; letter-spacing: 0.05em;">
              ${isFalse ? "⚠️ FALSE ALARM" : `${inc.severity} • ${inc.category}`}
            </span>
            <span style="font-size: 10px; font-family: monospace; font-weight: 700; background: #f1f5f9; padding: 2px 6px; border-radius: 4px; color: #334155; border: 1px solid #e2e8f0;">
              Score: ${isFalse ? "0.0/10" : `${inc.priorityScore}/10`}
            </span>
          </div>
          <h4 style="font-size: 13px; font-weight: 700; color: #0f172a; margin: 0 0 4px 0; line-height: 1.3;">
            ${inc.title || inc.location?.address || "Emergency Incident"}
          </h4>
          <p style="font-size: 11px; color: #64748b; margin: 0 0 8px 0;">
            📍 ${inc.location?.address || "Disaster Zone"}
          </p>
          <div style="display: flex; gap: 8px; font-size: 11px; color: #475569; margin-bottom: 10px; font-weight: 600;">
            ${inc.peopleCount != null && !inc.isQuickSOS && !inc.title?.includes("SOS") ? `<span>👥 ${inc.peopleCount} people</span>` : '<span style="color: #dc2626;">🚨 1-Tap SOS Beacon</span>'}
            ${inc.hasMedicalEmergency ? '<span style="color: #dc2626;">🚨 Medical needed</span>' : ""}
          </div>
          <button id="btn-inspect-${inc.id}" style="
            width: 100%;
            padding: 7px 10px;
            background: #1976D2;
            color: #ffffff;
            font-size: 11px;
            font-weight: 700;
            border: none;
            border-radius: 6px;
            cursor: pointer;
          ">
            View Incident Details
          </button>
        </div>
      `;

      marker.bindPopup(popupHtml);
      marker.on("popupopen", (e) => {
        const popupEl = e.popup?.getElement();
        const btn = popupEl ? popupEl.querySelector("button") : document.getElementById(`btn-inspect-${inc.id}`);
        if (btn) {
          btn.onclick = (event) => {
            if (event) event.stopPropagation();
            onSelectIncident(inc);
          };
        }
      });

      marker.on("click", () => {
        onSelectIncident(inc);
      });

      marker.addTo(markersLayer);

      if (showDangerZones && isCritical) {
        L.circle([inc.location.lat, inc.location.lng], {
          radius: 350,
          color: "#ef4444",
          fillColor: "#ef4444",
          fillOpacity: 0.15,
          weight: 1,
          dashArray: "4, 6"
        }).addTo(dangerZonesLayer);
      }
    });
  }, [
    incidents,
    rescueUnits,
    rescueDepartments,
    selectedZoneId,
    selectedIncidentId,
    showDepartments,
    showRescueUnits,
    showDangerZones,
    onSelectIncident
  ]);

  // Center on selected incident if requested
  useEffect(() => {
    if (selectedIncidentId && mapInstanceRef.current) {
      const target = incidents.find((i) => i.id === selectedIncidentId);
      if (target?.location?.lat && target?.location?.lng) {
        mapInstanceRef.current.flyTo([target.location.lat, target.location.lng], 15, {
          duration: 1.2
        });
      }
    }
  }, [selectedIncidentId, incidents]);

  const handleZoneSelect = (zone) => {
    setSelectedZoneId(zone.id);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(zone.center, zone.zoom, { duration: 1.2 });
    }
  };

  const handleResetView = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([21.7679, 78.8718], 5, { duration: 1 });
      setSelectedZoneId("all");
    }
  };

  return (
    <div className="relative w-full h-[480px] sm:h-[540px] lg:h-[580px] rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-slate-100 flex flex-col">
      {/* Top Controls Bar: Regional Quick Filters (Preventing Clutter) */}
      <div className="absolute top-3 left-3 right-3 z-[20] flex flex-col gap-2 pointer-events-none">
        {/* Row 1: Regional Quick Zone Selector Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar pointer-events-auto bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-xl p-1.5 shadow-md max-w-full">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 px-2 shrink-0 flex items-center gap-1">
            <MapPin className="w-3 h-3 text-blue-600" /> Sector:
          </span>
          {regionalZones.map((zone) => {
            const isActive = selectedZoneId === zone.id;
            return (
              <button
                key={zone.id}
                onClick={() => handleZoneSelect(zone)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? "bg-[#1976D2] text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                {zone.label}
              </button>
            );
          })}
        </div>

        {/* Row 2: Layer Toggles & Map Imagery Switcher */}
        <div className="flex flex-wrap items-center justify-between gap-2 pointer-events-auto">
          <div className="flex items-center gap-1.5 bg-white/95 backdrop-blur-md border border-slate-200 rounded-xl p-1 shadow-md">
            {/* Rescue Departments Toggle */}
            <button
              onClick={() => setShowDepartments(!showDepartments)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                showDepartments
                  ? "bg-slate-900 text-amber-400 border border-slate-800 shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
              title="Toggle India Rescue Departments & Regional Bases"
            >
              <span>🏛️ Stations ({rescueDepartments.length})</span>
            </button>

            {/* Field Responders Toggle */}
            <button
              onClick={() => setShowRescueUnits(!showRescueUnits)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                showRescueUnits
                  ? "bg-blue-50 text-blue-700 border border-blue-200 shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
              title="Toggle Mobile Rescue Units & Field Responders"
            >
              <span>🚒 Units ({rescueUnits.length})</span>
            </button>

            {/* Danger Zones Toggle */}
            <button
              onClick={() => setShowDangerZones(!showDangerZones)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                showDangerZones
                  ? "bg-red-50 text-red-700 border border-red-200 shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
              title="Toggle Critical Danger Zones & Hazards"
            >
              <span className="w-2 h-2 rounded-full bg-red-600"></span>
              <span>Hazards</span>
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Map Tiles Switcher */}
            <div className="bg-white/95 backdrop-blur-md border border-slate-200 rounded-xl p-1 flex items-center gap-1 shadow-md">
              <button
                onClick={() => setMapStyle("streets")}
                className={`px-2 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  mapStyle === "streets" ? "bg-blue-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                🗺️ Standard
              </button>

              <button
                onClick={() => setMapStyle("hot")}
                className={`px-2 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  mapStyle === "hot" ? "bg-amber-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                🚑 Relief
              </button>

              <button
                onClick={() => setMapStyle("satellite")}
                className={`px-2 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  mapStyle === "satellite" ? "bg-teal-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                🛰️ Satellite
              </button>
            </div>

            {/* Reset View */}
            <button
              onClick={handleResetView}
              title="Reset View to All-India"
              className="p-2 rounded-xl bg-white/95 backdrop-blur-md border border-slate-200 text-slate-700 hover:text-slate-900 shadow-md hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <Compass className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Map Canvas */}
      <div ref={mapContainerRef} className="w-full flex-1" />

      {/* Legend in Bottom Left */}
      <div className="absolute bottom-3 left-3 z-[20] bg-white/95 backdrop-blur-md border border-slate-200 rounded-xl p-2.5 shadow-md hidden sm:block pointer-events-auto">
        <p className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider mb-1.5">
          Map Legend & Operations Key
        </p>
        <div className="flex flex-wrap items-center gap-3 text-[11px] font-semibold text-slate-700">
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-slate-900 border border-amber-400"></span>
            <span>🏛️ NDRF Base</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-blue-900 border border-sky-400"></span>
            <span>🛡️ SDRF Command</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600"></span>
            <span>🚨 Critical Distress</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span>Medium / High</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
            <span>Resolved</span>
          </div>
        </div>
      </div>
    </div>
  );
};

