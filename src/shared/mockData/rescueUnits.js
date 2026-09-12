export const RESCUE_UNITS = [
  {
    id: "UNIT-NDRF-01",
    name: "NDRF 4th Battalion - Water Rescue Boat A",
    type: "Rescue Boat",
    baseLocation: "North Waterfront Hub",
    status: "Available", // "Available" | "Dispatched" | "On Scene"
    assignedIncidentId: null,
    capabilities: ["Inflatable Motor Boats", "Lifejackets (50)", "High-Power Sonar", "Divers"],
    personnelCount: 8,
    contact: "+91 94320 11001",
    lat: 13.0827,
    lng: 80.2707
  },
  {
    id: "UNIT-NDRF-02",
    name: "NDRF Deep Water Rescue Squad B",
    type: "Rescue Boat",
    baseLocation: "Central Barrage Depot",
    status: "Available",
    assignedIncidentId: null,
    capabilities: ["Rigid Inflatable Hull", "Flood Evacuation", "Rope Rescue"],
    personnelCount: 6,
    contact: "+91 94320 11002",
    lat: 13.0780,
    lng: 80.2520
  },
  {
    id: "UNIT-MED-108",
    name: "108 Advanced Life Support (ALS) Ambulance #12",
    type: "Medical Team",
    baseLocation: "Govt General Hospital Base",
    status: "Available",
    assignedIncidentId: null,
    capabilities: ["Ventilators", "Defibrillators", "Trauma Care", "Oxygen Supply", "Emergency Doctors"],
    personnelCount: 4,
    contact: "+91 108 000 1212",
    lat: 13.0805,
    lng: 80.2810
  },
  {
    id: "UNIT-MED-109",
    name: "Mobile Trauma & Triage Field Unit #03",
    type: "Medical Team",
    baseLocation: "South Relief Camp",
    status: "Available",
    assignedIncidentId: null,
    capabilities: ["Portable Stretchers", "Emergency Blood Packs", "IV Fluids", "Burns Kit"],
    personnelCount: 5,
    contact: "+91 108 000 1213",
    lat: 13.0450,
    lng: 80.2450
  },
  {
    id: "UNIT-SDRF-ENG",
    name: "SDRF Heavy Earthmover & Debris Clearance #05",
    type: "Road Clearance Unit",
    baseLocation: "West Ring Road Depot",
    status: "Available",
    assignedIncidentId: null,
    capabilities: ["JCB Excavator", "Hydraulic Cutters", "Concrete Breakers", "Search Dog Unit"],
    personnelCount: 6,
    contact: "+91 94440 22005",
    lat: 13.0650,
    lng: 80.2200
  },
  {
    id: "UNIT-FIRE-HAZ",
    name: "Fire & Disaster HAZMAT Tender #09",
    type: "Fire Tender",
    baseLocation: "Central Fire Station",
    status: "Available",
    assignedIncidentId: null,
    capabilities: ["High-Pressure Water Cannon", "Chemical Foam", "Thermal Imaging Cameras"],
    personnelCount: 6,
    contact: "+91 101 000 0009",
    lat: 13.0720,
    lng: 80.2600
  },
  {
    id: "UNIT-DRONE-01",
    name: "Airborne Thermal Drone Recon Squad #01",
    type: "Recon Drone",
    baseLocation: "Command HQ Rooftop",
    status: "Available",
    assignedIncidentId: null,
    capabilities: ["Infrared Night Vision", "Megaphone Audio Broadcast", "Lifebuoy Drop"],
    personnelCount: 2,
    contact: "+91 94111 88001",
    lat: 13.0878,
    lng: 80.2785
  },
  // --- NORTHERN ZONE UNITS ---
  {
    id: "UNIT-NDRF-08-AIR",
    name: "NDRF 8th Bn - Delhi NCR Airborne Recon & Search",
    type: "Recon Drone",
    baseLocation: "NDRF 8th Bn Base (Ghaziabad / Delhi NCR)",
    region: "North",
    status: "Available",
    assignedIncidentId: null,
    capabilities: ["Autonomous Drone Fleet", "Infrared Thermal Sensors", "Loudspeaker Beacon"],
    personnelCount: 4,
    contact: "+91 120 2766618",
    lat: 28.6692,
    lng: 77.4538
  },
  {
    id: "UNIT-SDRF-UK-ROPE",
    name: "Uttarakhand SDRF High-Altitude Avalanche Squad",
    type: "Road Clearance Unit",
    baseLocation: "Uttarakhand SDRF Base (Dehradun)",
    region: "North",
    status: "Available",
    assignedIncidentId: null,
    capabilities: ["Avalanche Transceivers", "Mountain Evacuation Stretcher", "Heavy Hydraulic Winch"],
    personnelCount: 8,
    contact: "+91 135 2710334",
    lat: 30.3165,
    lng: 78.0322
  },

  // --- WESTERN ZONE UNITS ---
  {
    id: "UNIT-MH-MUM-BOAT",
    name: "Mumbai Marine & Storm Surge Heavy Rescue Craft",
    type: "Rescue Boat",
    baseLocation: "Mumbai Disaster Management Cell (Mumbai)",
    region: "West",
    status: "Available",
    assignedIncidentId: null,
    capabilities: ["Twin Engine Rescue Craft", "SCUBA Heavy Divers", "Flooding Dewatering Skids"],
    personnelCount: 6,
    contact: "022-22694725",
    lat: 19.0760,
    lng: 72.8777
  },
  {
    id: "UNIT-NDRF-05-HAZ",
    name: "NDRF 5th Bn - Pune Industrial CBRN & Hazmat Unit",
    type: "Fire Tender",
    baseLocation: "NDRF 5th Bn Base (Pune)",
    region: "West",
    status: "Available",
    assignedIncidentId: null,
    capabilities: ["Chemical Decontamination Tent", "Positive Pressure Suits", "Gas Leak Detectors"],
    personnelCount: 7,
    contact: "+91 2114 247000",
    lat: 18.5204,
    lng: 73.8567
  },

  // --- EASTERN ZONE UNITS ---
  {
    id: "UNIT-ODISHA-ODRAF-01",
    name: "ODRAF Cyclone Rapid Water & Tree Clearance Squad",
    type: "Road Clearance Unit",
    baseLocation: "ODRAF Command Base (Bhubaneswar / Cuttack)",
    region: "East",
    status: "Available",
    assignedIncidentId: null,
    capabilities: ["Chain Saws (15)", "Hydraulic Tower Crane", "Inflatable Cyclone Boats", "Sniffer Dog Squad"],
    personnelCount: 10,
    contact: "0674-2534177",
    lat: 20.2961,
    lng: 85.8245
  },
  {
    id: "UNIT-NDRF-02-KOL-MED",
    name: "NDRF 2nd Bn - Kolkata Mobile Field Surgery & ALS",
    type: "Medical Team",
    baseLocation: "NDRF 2nd Bn Base (Kolkata)",
    region: "East",
    status: "Available",
    assignedIncidentId: null,
    capabilities: ["Mobile Operating Theatre", "Trauma Doctors", "Ventilators (4)", "Blood Bank Fridge"],
    personnelCount: 6,
    contact: "+91 3473 245005",
    lat: 22.5726,
    lng: 88.3639
  },

  // --- CENTRAL ZONE UNITS ---
  {
    id: "UNIT-NDRF-11-RIVER",
    name: "NDRF 11th Bn - Varanasi Ganges Deep Water Unit",
    type: "Rescue Boat",
    baseLocation: "NDRF 11th Bn Base (Varanasi)",
    region: "Central",
    status: "Available",
    assignedIncidentId: null,
    capabilities: ["High-Thrust Inflatable Boats", "Deep Sonar Profilers", "Underwater Searchlights"],
    personnelCount: 6,
    contact: "+91 542 2501101",
    lat: 25.3176,
    lng: 82.9739
  },

  // --- NORTH-EAST ZONE UNITS ---
  {
    id: "UNIT-NDRF-01-ASSAM",
    name: "NDRF 1st Bn - Brahmaputra Torrential Flood Squad",
    type: "Rescue Boat",
    baseLocation: "NDRF 1st Bn Base (Guwahati)",
    region: "North-East",
    status: "Available",
    assignedIncidentId: null,
    capabilities: ["Heavy Rigid Hull Rafts", "Helicopter Air-Drop Sling", "Submersible Flood Pumps"],
    personnelCount: 8,
    contact: "+91 361 2849005",
    lat: 26.1445,
    lng: 91.7362
  },

  // --- ADDITIONAL SOUTHERN UNITS ---
  {
    id: "UNIT-KL-KOC-DIVE",
    name: "Kerala Fire & Rescue Deep Diving Taskforce",
    type: "Rescue Boat",
    baseLocation: "Kerala Marine Rescue Base (Kochi)",
    region: "South",
    status: "Available",
    assignedIncidentId: null,
    capabilities: ["Commercial SCUBA Gear", "Emergency Decompression Chamber", "Sonar Tracking"],
    personnelCount: 5,
    contact: "0484-2354000",
    lat: 9.9312,
    lng: 76.2673
  },
  {
    id: "UNIT-KA-BLR-ALS",
    name: "Karnataka SDRF Advanced Life Support Triage Van",
    type: "Medical Team",
    baseLocation: "Karnataka SDRF Base (Bengaluru)",
    region: "South",
    status: "Available",
    assignedIncidentId: null,
    capabilities: ["Emergency Triage Modules", "Defibrillators", "Portable Ventilators"],
    personnelCount: 4,
    contact: "080-22971500",
    lat: 12.9716,
    lng: 77.5946
  }
];
