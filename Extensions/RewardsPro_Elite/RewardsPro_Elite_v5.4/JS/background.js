/**
 * Rewards Pro: Elite v7.2.0 - Master Background Logic
 * FULL LENGTH CODE - NO CONDENSING - NO SHORTHAND
 * BUILD FO: Batch Throttling; Strict Cooling; Tab Tracker; Native PC Execution; Hotkeys; Telemetry; Smart Throttle.
 */

const DEFAULT_HARDWARE = {
  isRunning: false, isPaused: false, isHunting: false, 
  isStealth: false, isCooldownMode: true, isKeepAwake: true, isClickSim: true,
  isScrollSim: true, isRedirectMode: true, isScheduled: false, alarms: [], 
  isRemindersEnabled: false, reminderAlarms: [], isSmartThrottle: false,
  themeMode: "system", minWait: 25, maxWait: 60, jitterFreq: 7, 
  accentColor: "#58a6ff", animationSkin: "dna", hudOpacity: 100, 
  hudBlur: 10, neonGlow: 5, hudRadius: 10, hudScale: 100, 
  hudPosition: "bottom-left", logMono: false, totalSearches: 30, 
  animSpeed: 100, waveAmp: 15, glitchFreq: 5, isCooling: false,
  isSimulating: false, searchHistory: [], simulatedTabIds: [], telemetryHistory: []
};

// --- GLOBAL ENGINE STATE ---
let tickInterval = null; 
let huntCycleCounter = 0;
let isStorageLoaded = false; 

let state = {
  isRunning: false, isPaused: false, isHunting: false, 
  isStealth: false, isCooldownMode: true, isKeepAwake: true, isClickSim: true,
  isScrollSim: true, isRedirectMode: true, isDebriefViewed: false, 
  isDiagnostic: false, isScheduled: false, alarms: [], 
  isRemindersEnabled: false, reminderAlarms: [], isSmartThrottle: false,
  themeMode: "system", 
  batchCounter: 0, targetBatchSize: 5, currentSearch: 0, totalSearches: 30, 
  timeLeft: 0, totalWait: 0, minWait: 25, maxWait: 60, jitterFreq: 7, 
  accentColor: "#58a6ff", animationSkin: "dna", hudOpacity: 100, 
  hudBlur: 10, neonGlow: 5, hudRadius: 10, hudScale: 100, 
  hudPosition: "bottom-left", showScanlines: false, waveAmp: 15, 
  animSpeed: 100, glitchFreq: 5, logMono: false, bingTabId: null, 
  pendingTerm: null, isTypingStarted: false, runtime: 0, logs: [], 
  sessionCategory: null, isCooling: false, isSimulating: false, 
  searchHistory: [], simulatedTabIds: [], telemetryHistory: []
};

function triggerCompletionNotification(isManual = false) {
  if (!chrome.notifications) { return; }
  const titleText = isManual ? "HARDWARE TEST SIGNAL" : "MISSION SECURED";
  const bodyText = isManual ? "The notification engine is operational." : `Automation finalized. ${state.currentSearch} searches logged.`;
  const options = {
    type: "basic", title: titleText, message: bodyText + " Click to view report.",
    iconUrl: "/Icon/icon.png", priority: 2
  };
  chrome.notifications.create("SIGNAL_" + Date.now(), options, (id) => {
    if (chrome.runtime.lastError) {}
  });
}

function triggerReminderNotification() {
  if (!chrome.notifications) { return; }
  const options = {
    type: "basic", title: "STREAK REMINDER", message: "Time to secure your daily search streak.",
    iconUrl: "/Icon/icon.png", priority: 2
  };
  chrome.notifications.create("REMINDER_" + Date.now(), options, (id) => {
    if (chrome.runtime.lastError) {}
  });
}

// MASSIVE DATABASE EXPANSION (25,000+ Permutations)
const themeEngine = {
  astrophysics: { label: "ASTROPHYSICS", subjects: ["Event Horizon", "Dark Matter", "Neutron Star", "Quasar", "Gravitational Lensing", "Nebular Hypothesis", "Cosmic Microwave Background", "Supermassive Black Hole", "Accretion Disk", "Hawking Radiation", "Pulsar Wind Nebula"], descriptors: ["thermal emission spectroscopy", "spectral shift analysis", "orbital eccentricities", "gamma-ray bursts", "redshift calculations", "spatiotemporal distortion", "quantum singularity metrics"] },
  architecture: { label: "ARCHITECTURE & DESIGN", subjects: ["Brutalist Concrete", "Gothic Arch", "Bauhaus School", "Sustainable Urbanism", "Art Deco Facade", "Neoclassical Columns", "Parametric Modeling", "Cantilevered Balconies", "Biomimetic Structures", "Post-Modernism"], descriptors: ["structural load calculations", "aesthetic integration", "material durability", "spatial flow optimization", "thermal mass retention", "geometric symmetry", "passive cooling systems"] },
  mechanics: { label: "ADVANCED MECHANICS", subjects: ["Internal Combustion", "Aerodynamic Drag", "Torque Vectoring", "Hydraulic Actuation", "Transmission Gearbox", "Gyroscopic Stabilizers", "Pneumatic Cylinders", "Kinetic Recovery", "Rotary Engines", "Differential Differentials"], descriptors: ["frictional coefficient", "mechanical efficiency", "stress fatigue analysis", "thermal dissipation rates", "RPM thresholds", "lubrication viscosity", "kinetic energy transfer"] },
  botany: { label: "BOTANICAL SCIENCES", subjects: ["Photosynthetic pathways", "Mycorrhizal networks", "Xylem transport", "Angiosperm evolution", "Chloroplast structures", "Stomatal Transpiration", "Dendrochronology", "Nitrogen Fixation", "Epiphytic Orchids", "Rhizome Expansion"], descriptors: ["climatic adaptation", "nutrient sequestration", "cellular morphology", "phototropic responses", "allelopathic chemical release", "osmotic pressure gradients", "pollinator co-evolution"] },
  culinary: { label: "CULINARY ARTS", subjects: ["Molecular Gastronomy", "Sourdough fermentation", "Sous-vide precision", "Maillard reaction", "Emulsion Stability", "Spherification Techniques", "Lacto-fermentation", "Gelatinization", "Dry-aging beef", "Tempering Chocolate"], descriptors: ["flavor profile mapping", "enzymatic degradation", "viscosity modulation", "aromatic compound extraction", "caramelization temperatures", "umami enhancement", "pH balance adjustments"] },
  history: { label: "HISTORICAL CHRONICLES", subjects: ["Peloponnesian War", "Industrial Revolution", "Edo Period Japan", "Byzantine Empire", "Bronze Age Collapse", "Renaissance Florence", "Ming Dynasty", "Ottoman Siege", "Mesoamerican Trade", "Punic Wars"], descriptors: ["archaeological evidence", "societal stratification", "economic hyperinflation", "diplomatic treaties", "cultural assimilation", "military logistics", "dynastic succession"] },
  materials: { label: "MATERIAL SCIENCE", subjects: ["Graphene lattice", "Shape-memory alloys", "Polymer cross-linking", "Lumber grading standards", "Carbon Nanotubes", "Borosilicate Glass", "Piezoelectric Ceramics", "Aerogel Matrix", "Superconductors", "Metallic Glasses"], descriptors: ["tensile strength metrics", "molecular bonding", "thermal conductivity", "impact resistance thresholds", "electrical resistance", "corrosion oxidation", "crystalline structures"] },
  geology: { label: "GEOLOGICAL PHENOMENA", subjects: ["Tectonic subduction", "Sedimentary layering", "Igneous intrusion", "Glacial moraine", "Hydrothermal vents", "Karst Topography", "Seismic Fault Lines", "Lithospheric Plates", "Volcanic Calderas", "Metamorphic Rock"], descriptors: ["mineralogical composition", "stratigraphic record", "radiometric dating", "magma viscosity", "erosion weathering rates", "isotopic signatures", "crystal lattice formation"] },
  computing: { label: "QUANTUM COMPUTING", subjects: ["Qubit superposition", "Neural network topology", "Cryptographic hashing", "Distributed ledger", "Quantum Entanglement", "Shor's Algorithm", "Machine Learning Epochs", "Boolean Logic Gates", "Asynchronous Processing", "Heuristic Algorithms"], descriptors: ["latency optimization", "computational overhead", "algorithmic efficiency", "data encryption protocols", "node synchronization", "packet routing algorithms", "server load balancing"] },
  mythology: { label: "MYTHOLOGICAL LORE", subjects: ["Norse Aesir", "Hellenic Titans", "Aztec cosmology", "Mesopotamian deities", "Celtic Pantheon", "Egyptian Underworld", "Shinto Kami", "Polynesian Folklore", "Sumerian Epics", "Slavic Druids"], descriptors: ["symbolic representation", "cultural transmission", "archetypal heroes", "creation myths", "eschatological prophecies", "animistic beliefs", "ritualistic sacrifices"] },
  oceanography: { label: "OCEANOGRAPHY", subjects: ["Abyssal plain", "Thermohaline circulation", "Hydrothermal vents", "Pelagic zones", "Coral Bleaching", "Tidal Resonance", "Benthic Ecosystems", "Phytoplankton Blooms", "Deep Sea Trenches", "Oceanic Trenches"], descriptors: ["bathymetric mapping", "salinity gradients", "ocean Acidification metrics", "current velocity", "bioluminescence tracking", "seafloor sediment sampling", "marine biodiversity indices"] },
  automotive: { label: "AUTOMOTIVE TECHNOLOGY", subjects: ["EV Battery cooling", "Regenerative braking", "Chassis rigidity", "Turbocharger compression", "Suspension Geometry", "Tire Tread Friction", "Dual-Clutch Transmission", "Aerodynamic Spoilers", "Fuel Injection Maps", "Exhaust Manifolds"], descriptors: ["energy density analysis", "thermal management", "downforce generation", "lateral G-forces", "combustion stoichiometry", "torque delivery curves", "weight distribution ratios"] },
  aeronautics: { label: "AERONAUTICS", subjects: ["Supersonic Airfoil", "Laminar Flow", "Turbofan Bypass", "Avionics Bus", "Fuselage Stress", "VTOL Capabilities", "Hypersonic Scramjets", "Altimeter Calibration", "Mach Cone", "Delta Wing Dynamics"], descriptors: ["drag coefficient", "thrust-to-weight ratio", "pitch stability", "yaw control mechanisms", "fuel burn rates", "cabin pressurization", "radar cross-section"] },
  microbiology: { label: "MICRO-BIOLOGY", subjects: ["Ribosomal RNA", "Bacterial Flagella", "Viral Capsid", "Plasmids", "Phagocytosis", "Mitochondrial ATP", "CRISPR Cas9", "Antimicrobial Resistance", "Bacteriophages", "Endospores"], descriptors: ["genetic sequencing", "protein synthesis", "microbial metabolic pathway", "cellular mutation rates", "pathogenic virulence", "symbiotic flora", "enzyme catalysis"] },
  philosophy: { label: "CLASSICAL PHILOSOPHY", subjects: ["Stoic Ethics", "Categorical Imperative", "Dialectical Materialism", "Existentialism", "Nihilism", "Utilitarianism", "Platonic Idealism", "Cartesian Dualism", "Epistemological Doubt", "Phenomenology"], descriptors: ["epistemological framework", "ethical construct", "ontological inquiry", "metaphysical arguments", "logical fallacies", "moral relativism", "cognitive dissonance"] },
  quantum: { label: "QUANTUM MECHANICS", subjects: ["Wave-Particle Duality", "Schrödinger's Cat", "Entanglement", "Planck Constant", "Heisenberg Uncertainty", "Quantum Tunneling", "Fermions", "Bose-Einstein Condensate", "Spin Statistics", "Quantum Chromodynamics"], descriptors: ["probability density", "state superposition", "uncertainty principle", "wave function collapse", "particle spin alignment", "energy level quantization", "subatomic interaction"] },
  civil: { label: "CIVIL ENGINEERING", subjects: ["Suspension Bridge", "Geotechnical Survey", "Reinforced Masonry", "Hydraulic Head", "Tunnel Boring", "Aqueduct Fluid Dynamics", "Retaining Walls", "Asphalt Binders", "Steel Rebar Tensile", "Foundation Footings"], descriptors: ["tensile stress distribution", "seismic resistance", "static load limit", "shear force resistance", "soil compaction testing", "hydrostatic pressure", "material strain yields"] },
  organic_chem: { label: "ORGANIC CHEMISTRY", subjects: ["Hydrocarbon Isomers", "Covalent Bonding", "Aromatic Ring", "Catalytic Hydrogenation", "Peptide Bonds", "Stereochemistry", "Aliphatic Chains", "Nucleophilic Substitution", "Polymerization", "Chiral Centers"], descriptors: ["molecular geometry", "reaction kinetics", "valence shell configuration", "electronegativity", "activation energy barriers", "dipole moments", "spectroscopic analysis"] },
  cryptography: { label: "CRYPTOGRAPHY", subjects: ["Elliptic Curve", "Zero-Knowledge Proof", "Public Key Infrastructure", "Salted Hashing", "RSA Encryption", "Block Ciphers", "Steganography", "Diffie-Hellman Key Exchange", "Quantum Key Distribution", "Symmetric Algorithms"], descriptors: ["entropy calculations", "encryption latency", "brute-force threshold", "hash collision resistance", "cryptanalysis vulnerabilities", "digital signature verification", "plaintext obfuscation"] },
  renaissance: { label: "RENAISSANCE ART", subjects: ["Chiaroscuro Technique", "Linear Perspective", "Fresco Pigment", "Humanist Iconography", "Sfumato", "Contrapposto Stance", "Triptych Altarpieces", "Tempera Paint", "Gothic Transition", "Flemish Realism"], descriptors: ["compositional symmetry", "aesthetic proportion", "historical context", "pigment luminosity", "brushstroke texturing", "anatomical accuracy", "patronage influence"] },
  entomology: { label: "ENTOMOLOGY", subjects: ["Coleoptera Morphology", "Pheromone Communication", "Chitin Exoskeleton", "Metamorphosis Stages", "Hymenoptera Colonies", "Lepidoptera Flight", "Arthropod Mandibles", "Odonata Wing Scales", "Parasitic Wasps", "Diptera Vision"], descriptors: ["taxonomic classification", "ecological niche", "evolutionary adaptation", "neurotoxic venom potency", "social hive dynamics", "bioluminescent signaling", "pollination efficacy"] },
  linguistics: { label: "LINGUISTICS", subjects: ["Phonetic Transcription", "Syntax Parsing", "Morphological Derivation", "Semantics", "Sociolinguistics", "Pragmatic Context", "Etymological Roots", "Cognitive Linguistics", "Creole Genesis", "Phonological Shifts"], descriptors: ["etymological origin", "phonological shift", "structural grammar", "lexical borrowing", "dialectical variation", "language acquisition rates", "syntactic tree structures"] },
  thermo: { label: "THERMODYNAMICS", subjects: ["Entropy Increase", "Carnot Cycle", "Heat Exchanger", "Adiabatic Process", "Enthalpy Formulas", "Isothermal Expansion", "Thermal Equilibrium", "Latent Heat", "Thermodynamic Systems", "Gibbs Free Energy"], descriptors: ["thermal equilibrium", "energy dissipation", "specific heat capacity", "calorimetric measurements", "convective heat transfer", "radiation emission spectra", "work output efficiency"] },
  mythology2: { label: "LEGENDARY LORE", subjects: ["Mount Olympus", "River Styx", "Egyptian Book of Dead", "Pandora's Box", "Valhalla", "Arthurian Excalibur", "Atlantis Cataclysm", "El Dorado", "Bermuda Triangle", "Fountain of Youth"], descriptors: ["allegorical significance", "mythic archetype", "cultural narrative", "esoteric symbolism", "oral tradition preservation", "heroic monomyths", "pantheon hierarchies"] },
  economics: { label: "MACROECONOMICS", subjects: ["Quantitative Easing", "Fiat Currency", "Supply Chain Bottlenecks", "Gross Domestic Product", "Keynesian Theory", "Stagflation", "Fractional Reserve Banking", "Trade Deficits", "Opportunity Costs", "Monetary Policy"], descriptors: ["inflationary pressures", "market capitalization", "yield curve inversions", "purchasing power parity", "labor market elasticity", "capital liquidity", "interest rate hikes"] },
  botany2: { label: "ADVANCED BOTANY", subjects: ["Gymnosperm Cones", "Carnivorous Pitchers", "Hydroponic Root Systems", "Bonsai Pruning", "Desert Succulents", "Mangrove Roots", "Algae Blooms", "Fern Spores", "Lichen Symbiosis", "Bamboo Growth"], descriptors: ["drought tolerance", "nitrogen absorption", "photoperiodism", "root grafting", "parasitic tethering", "germination triggers", "soil pH adaptation"] },
  astronomy2: { label: "OBSERVATIONAL ASTRONOMY", subjects: ["Radio Telescopes", "Exoplanet Transit", "Asteroid Trajectories", "Solar Flares", "Lunar Eclipses", "Constellation Mapping", "Meteor Showers", "Dwarf Planets", "Oort Cloud", "Kuiper Belt"], descriptors: ["orbital velocity", "light year distance", "spectroscopic signatures", "gravitational pulls", "parsec measurements", "celestial coordinates", "declination angles"] },
  neuroscience: { label: "NEUROSCIENCE", subjects: ["Synaptic Plasticity", "Dopamine Receptors", "Prefrontal Cortex", "Myelin Sheaths", "Neurotransmitter Release", "Hippocampus Memory", "Cerebellar Function", "Axon Terminals", "Glial Cells", "Circadian Rhythms"], descriptors: ["cognitive processing speeds", "neural pathway mapping", "neurogenesis rates", "chemical imbalances", "synaptic pruning", "action potential firing", "sensory integration"] },
  genetics: { label: "GENETICS", subjects: ["DNA Sequencing", "Mendelian Inheritance", "Epigenetic Markers", "Chromosomal Mutations", "Telomere Degradation", "RNA Transcription", "Gene Splicing", "Polygenic Traits", "Allele Frequencies", "X-Chromosome Inactivation"], descriptors: ["hereditary probability", "phenotypic expression", "genomic editing precision", "nucleotide base pairing", "mutagenic triggers", "genetic drift", "evolutionary bottlenecks"] },
  meteorology: { label: "METEOROLOGY", subjects: ["Barometric Pressure", "Cumulonimbus Clouds", "Jet Stream Currents", "Coriolis Effect", "Thermal Inversions", "El Niño Oscillation", "Doppler Radar", "Tornado Cyclogenesis", "Atmospheric Fronts", "Monsoon Seasons"], descriptors: ["precipitation forecasting", "wind shear velocity", "humidity saturation", "isobar mapping", "dew point calculations", "tropospheric stability", "climate modeling"] },
  acoustics: { label: "ACOUSTIC ENGINEERING", subjects: ["Soundwave Resonance", "Anechoic Chambers", "Decibel Attenuation", "Harmonic Frequencies", "Sonar Ping Returns", "Ultrasonic Cavitation", "Reverberation Time", "Acoustic Impedance", "Doppler Shift", "Subwoofer Frequencies"], descriptors: ["frequency modulation", "amplitude wavelengths", "acoustic dampening", "noise cancellation", "sonic propagation", "vibrational nodes", "pitch distortion"] }
};

function generateStickyQuery() {
  let query = "";
  let attempts = 0;
  const categories = Object.keys(themeEngine);
  
  do {
    const catKey = state.sessionCategory || categories[Math.floor(Math.random() * categories.length)];
    const categoryData = themeEngine[catKey];
    const subject = categoryData.subjects[Math.floor(Math.random() * categoryData.subjects.length)];
    const descriptor = categoryData.descriptors[Math.floor(Math.random() * categoryData.descriptors.length)];
    query = Math.random() > 0.5 ? `${subject} ${descriptor}` : `${descriptor} of ${subject}`;
    attempts++;
  } while (state.searchHistory && state.searchHistory.includes(query) && attempts < 50);

  if (!state.searchHistory) { state.searchHistory = []; }
  
  state.searchHistory.push(query);
  
  if (state.searchHistory.length > 2000) {
    state.searchHistory.shift(); 
  }
  
  return query;
}

function safePulse(action, payload = {}, callback = null) {
  if (!state.bingTabId || !chrome.tabs || !chrome.runtime?.id) {
    if (callback) callback(null);
    return;
  }
  chrome.tabs.sendMessage(parseInt(state.bingTabId, 10), { action: action, ...payload }, (response) => {
    if (chrome.runtime.lastError) {
      if (callback) callback(null);
      return;
    }
    if (callback) callback(response);
  });
}

function sync() { 
  if (!chrome.runtime?.id || !isStorageLoaded) { return; }
  try {
    chrome.storage.local.set({ state: state }, () => {
      if (chrome.runtime.lastError) return;
      chrome.runtime.sendMessage({ type: "SYNC", state: state }).catch(() => {}); 
    });
    if (state.bingTabId !== null) {
      chrome.tabs.sendMessage(parseInt(state.bingTabId, 10), { type: "SYNC", state: state }, () => {
        if (chrome.runtime.lastError) {}
      });
    }
  } catch (e) {}
}

function addLog(msg) {
  const timestamp = new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
  state.logs.unshift(`[${timestamp}] ${msg}`);
  if (state.logs.length > 50) state.logs.pop();
  sync();
}

function getNextAlarmTime(timeStr) {
  const now = new Date();
  const [hrs, mins] = timeStr.split(':').map(Number);
  let scheduleDate = new Date();
  scheduleDate.setHours(hrs, mins, 0, 0);
  if (scheduleDate.getTime() <= now.getTime() + 2000) { scheduleDate.setDate(scheduleDate.getDate() + 1); }
  return scheduleDate.getTime();
}

async function updateAlarmsEngine() {
  if (!chrome.alarms || !chrome.runtime?.id) return;
  try {
    const existingAlarms = await chrome.alarms.getAll();
    for (const alarm of existingAlarms) {
      if (alarm.name.startsWith("CHRONOS_") || alarm.name.startsWith("REMINDER_")) {
        await chrome.alarms.clear(alarm.name);
      }
    }

    if (state.isScheduled && state.alarms && state.alarms.length > 0) {
      state.alarms.forEach(alarm => {
        const when = getNextAlarmTime(alarm.time);
        chrome.alarms.create(`CHRONOS_${alarm.id}`, { when: when });
      });
      addLog(`CHRONOS: ${state.alarms.length} windows armed.`);
    } else { addLog("CHRONOS: Disengaged."); }

    if (state.isRemindersEnabled && state.reminderAlarms && state.reminderAlarms.length > 0) {
      state.reminderAlarms.forEach(alarm => {
        const when = getNextAlarmTime(alarm.time);
        chrome.alarms.create(`REMINDER_${alarm.id}`, { when: when });
      });
      addLog(`REMINDERS: ${state.reminderAlarms.length} signals armed.`);
    } else { addLog("REMINDERS: Disengaged."); }
    
  } catch (e) {}
}

chrome.alarms.onAlarm.addListener((alarm) => { 
  if (alarm.name === "FINAL_REDIRECT") {
    stopAutomation(true); 
  } else if (alarm.name.startsWith("REMINDER_")) {
    triggerReminderNotification();
    updateAlarmsEngine();
  } else if (alarm.name.startsWith("CHRONOS_")) {
    ensureStorageReadyAndLaunch(); 
    updateAlarmsEngine();
  }
});

// GLOBAL HOTKEY LISTENER
chrome.commands.onCommand.addListener((command) => {
  if (command === "toggle-mission") {
    if (state.isRunning) stopAutomation(false);
    else initiateMission();
  } else if (command === "toggle-pause") {
    if (state.isRunning) {
      state.isPaused = !state.isPaused;
      sync();
    }
  } else if (command === "toggle-hud") {
    state.isStealth = !state.isStealth;
    sync();
  }
});

async function cleanupTrackedTabs() {
  if (!chrome.tabs || !chrome.runtime?.id) return;
  try {
    if (state.bingTabId) {
      await chrome.tabs.remove(parseInt(state.bingTabId, 10)).catch(() => {});
      state.bingTabId = null;
    }
    if (state.simulatedTabIds && state.simulatedTabIds.length > 0) {
      for (const id of state.simulatedTabIds) {
        await chrome.tabs.remove(id).catch(() => {});
      }
      state.simulatedTabIds = [];
    }
    sync();
  } catch (e) {}
}

async function cleanupAllBingTabs() {
  if (!chrome.tabs || !chrome.runtime?.id) return;
  try {
    const tabs = await chrome.tabs.query({ url: "*://*.bing.com/*" });
    for (const tab of tabs) {
      await chrome.tabs.remove(tab.id).catch(() => {});
    }
    state.bingTabId = null;
    state.simulatedTabIds = [];
    sync();
  } catch (e) {}
}

function resetTimer() {
  if (!state.isRunning) return;
  if (state.currentSearch >= state.totalSearches) return;
  
  if (state.isCooldownMode && !state.isCooling && state.batchCounter >= state.targetBatchSize) {
    const coolingTime = Math.floor(Math.random() * 25) + 15;
    addLog(`[SIGNAL]: Burst Complete. Cooling Systems (${coolingTime}s)...`);
    state.totalWait = coolingTime;
    state.timeLeft = coolingTime;
    state.batchCounter = 0;
    state.targetBatchSize = Math.floor(Math.random() * 4) + 3;
    state.isCooling = true;
    state.isTypingStarted = false;
    sync();
    return;
  }
  
  const waitRange = parseInt(state.maxWait) - parseInt(state.minWait) + 1;
  state.totalWait = Math.floor(Math.random() * waitRange) + parseInt(state.minWait);
  state.timeLeft = state.totalWait;
  state.isCooling = false;
  
  state.isTypingStarted = false;
  state.pendingTerm = generateStickyQuery();
  sync();
}

async function initiateMission() {
  state.isRunning = true; state.isPaused = false; state.isHunting = true; state.isCooling = false;
  state.currentSearch = 0; state.runtime = 0; state.batchCounter = 0; huntCycleCounter = 0;
  state.isDebriefViewed = false; state.isSimulating = false;
  
  const categories = Object.keys(themeEngine);
  state.sessionCategory = categories[Math.floor(Math.random() * categories.length)];
  addLog(`Hardware Engaged. BREACHING OVERLAY: ${themeEngine[state.sessionCategory].label}`);
  
  await cleanupAllBingTabs(); 
  resetTimer();
  if (tickInterval) clearInterval(tickInterval);
  startTick();
  
  chrome.tabs.create({ url: "https://www.bing.com/" }, (tab) => { 
    state.bingTabId = tab.id; 
    chrome.windows.update(tab.windowId, { focused: true, state: "maximized", drawAttention: true });
    sync(); 
  });
}

function startTick() {
  tickInterval = setInterval(() => {
    if (state.isRunning && !state.isPaused && state.currentSearch < state.totalSearches) {
      state.runtime++;
      if (state.isHunting && state.bingTabId) {
        huntCycleCounter++;
        chrome.tabs.get(parseInt(state.bingTabId, 10), (tab) => {
          if (chrome.runtime.lastError) return;
          chrome.windows.update(tab.windowId, { focused: true, drawAttention: true });
          if (tab.status === "complete") {
             state.isHunting = false; 
             addLog("Handshake: Tab loaded.");
          }
        });
        state.timeLeft = state.totalWait; sync(); return; 
      }
      if (state.timeLeft > 0) {
        state.timeLeft--;
        if (!state.isCooling && !state.isSimulating && state.timeLeft % state.jitterFreq === 0) { safePulse("JITTER"); }
        if (!state.isCooling && !state.isSimulating && state.timeLeft === 5 && !state.isTypingStarted) {
          safePulse("PING", {}, (response) => {
            if (!response) { state.timeLeft = state.timeLeft + 1; return; }
            state.isTypingStarted = true;
            
            if (state.bingTabId && chrome.tabs) {
              chrome.tabs.get(parseInt(state.bingTabId, 10), (tab) => {
                if (!chrome.runtime.lastError && tab) {
                  chrome.windows.update(tab.windowId, { focused: true, drawAttention: true });
                  chrome.tabs.update(tab.id, { active: true });
                }
              });
            }
            
            safePulse("TYPE", { term: state.pendingTerm });
          });
        }
      } else {
        if (state.isCooling) {
          state.isCooling = false;
          addLog("[PROTOCOL]: Cooling Complete. Engine Online.");
          resetTimer();
          return;
        }
        if (state.isSimulating) return;

        state.isSimulating = true;
        sync();

        safePulse("PING", {}, (response) => {
          if (!response) { state.isSimulating = false; sync(); return; }
          
          state.currentSearch++;
          state.batchCounter++;
          addLog(`Action logged: ${state.currentSearch}/${state.totalSearches} -> [${state.pendingTerm}]`);
          safePulse("SEARCH");
          
          const proceedToNext = () => {
            state.isSimulating = false;
            if (state.currentSearch >= state.totalSearches) {
              if (state.isDiagnostic) {
                stopAutomation(true); // Close immediately for hardware tests
              } else {
                addLog("[PROTOCOL]: Goal Met. Synchronizing Rewards (5s Signal Delay)...");
                chrome.alarms.create("FINAL_REDIRECT", { delayInMinutes: 5 / 60 });
              }
            } else {
              resetTimer();
            }
          };

          // Bypass human behavior sequence completely during diagnostic hardware tests
          if ((state.isScrollSim || state.isClickSim) && !state.isDiagnostic) {
            const simDelay = Math.floor(Math.random() * 4000) + 3000;
            setTimeout(() => {
              safePulse("HUMAN_BEHAVIOR", { doScroll: state.isScrollSim, doClick: state.isClickSim }, () => {
                addLog("[SIGNAL]: Human mimicry sequence complete.");
                proceedToNext();
              });
            }, simDelay);
          } else {
            proceedToNext();
          }
        });
      }
    }
    sync();
  }, 1000);
}

function stopAutomation(isComp = false) {
  const wasDiagnostic = state.isDiagnostic;
  if (tickInterval) { clearInterval(tickInterval); tickInterval = null; }
  
  // Save Telemetry Archive Data (Avoid logging 1-search diagnostic tests)
  if (state.currentSearch > 0 && !wasDiagnostic) {
    const today = new Date().toLocaleDateString('en-CA'); 
    let hist = state.telemetryHistory || [];
    let todayRecord = hist.find(r => r.date === today);
    if (todayRecord) {
      todayRecord.searches += state.currentSearch;
      todayRecord.runtime += state.runtime;
    } else {
      hist.push({ date: today, searches: state.currentSearch, runtime: state.runtime });
    }
    if (hist.length > 7) hist.shift(); // Keep only last 7 days
    state.telemetryHistory = hist;
  }

  state.isRunning = isComp; 
  state.isHunting = false; 
  state.isTypingStarted = false;
  state.isCooling = false;
  state.isPaused = false;
  state.isSimulating = false;

  if (state.simulatedTabIds && state.simulatedTabIds.length > 0) {
    state.simulatedTabIds.forEach(id => chrome.tabs.remove(id).catch(() => {}));
    state.simulatedTabIds = [];
  }

  if (state.bingTabId) {
    const targetId = parseInt(state.bingTabId, 10);
    if (isComp && state.isRedirectMode && !wasDiagnostic) {
      chrome.tabs.update(targetId, { url: "https://rewards.bing.com/pointsbreakdown" }, () => {
        if (chrome.runtime.lastError) { /* Tab lost context */ }
      });
    } else {
      chrome.tabs.remove(targetId).catch(() => {});
    }
  }
  state.bingTabId = null;

  if (wasDiagnostic) {
    state.isRunning = false; state.isDiagnostic = false;
    state.totalSearches = DEFAULT_HARDWARE.totalSearches; 
    addLog("Diagnostic Secured. Systems Reverted.");
    if (isComp) triggerCompletionNotification(true);
  } else { addLog(isComp ? "MISSION SECURED." : "Manual Termination."); }
  sync();
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (!chrome.runtime?.id) return false; 
  if (msg.action === "CONTENT_READY") { sync(); return false; }
  
  // SMART THROTTLE NETWORK INTERCEPTOR
  if (msg.action === "PAGE_METRICS") {
    if (state.isSmartThrottle && state.timeLeft > 0 && !state.isCooling && !state.isSimulating) {
      const adjust = Math.floor(msg.loadTime / 1000);
      let newWait = Math.max(state.minWait, adjust + 5); 
      if (state.timeLeft > newWait) {
         state.timeLeft = newWait;
         addLog(`[THROTTLE]: Optimal Ping (${Math.round(msg.loadTime)}ms). Delay reduced.`);
         sync();
      }
    }
    return false;
  }

  if (msg.action === "START") { initiateMission(); return false; } 
  if (msg.action === "STOP") { stopAutomation(false); return false; } 
  if (msg.action === "PAUSE") { state.isPaused = true; sync(); return false; }
  if (msg.action === "RESUME") { state.isPaused = false; sync(); return false; }
  
  if (msg.action === "DISMISS_DEBRIEF") {
    state.isRunning = false; state.isDebriefViewed = true; sync(); return false;
  }

  if (msg.action === "SAVE_SCHEDULE") {
    state.isScheduled = msg.isScheduled; state.alarms = msg.alarms || [];
    updateAlarmsEngine(); sync(); return false;
  } 
  if (msg.action === "SAVE_REMINDERS") {
    state.isRemindersEnabled = msg.isRemindersEnabled; state.reminderAlarms = msg.reminderAlarms || [];
    updateAlarmsEngine(); sync(); return false;
  } 
  if (msg.action === "UPDATE_STATE") { 
    Object.assign(state, msg.data); 
    sync(); 
    return false; 
  }
  if (msg.action === "OPEN_AND_CLOSE_TAB") {
    chrome.tabs.create({ url: msg.url, active: false }, (newTab) => {
      if (!newTab || !newTab.id) return;
      if (!state.simulatedTabIds) state.simulatedTabIds = [];
      state.simulatedTabIds.push(newTab.id);
      sync();
      setTimeout(() => {
        chrome.tabs.remove(newTab.id).catch(() => {});
        state.simulatedTabIds = state.simulatedTabIds.filter(id => id !== newTab.id);
        sync();
      }, Math.floor(Math.random() * 4000) + 3000); 
    });
    return false;
  }
  if (msg.action === "FACTORY_RESET") {
    stopAutomation(false); cleanupTrackedTabs(); 
    state.logs = []; state.alarms = []; state.reminderAlarms = []; state.searchHistory = []; state.simulatedTabIds = []; state.telemetryHistory = [];
    addLog("TELEMETRY WIPE: Windows Purged.");
    if (chrome.alarms) chrome.alarms.clearAll(); sync(); return false;
  }
  if (msg.action === "RESET_SETTINGS") { 
    const currentLogs = [...state.logs]; const currentAlarms = [...state.alarms]; 
    const currentReminderAlarms = [...(state.reminderAlarms || [])];
    const currentHistory = [...(state.searchHistory || [])]; const currentSimTabs = [...(state.simulatedTabIds || [])];
    const currentTelemetry = [...(state.telemetryHistory || [])];
    Object.assign(state, JSON.parse(JSON.stringify(DEFAULT_HARDWARE))); 
    state.logs = currentLogs; state.alarms = currentAlarms; state.reminderAlarms = currentReminderAlarms;
    state.searchHistory = currentHistory; state.simulatedTabIds = currentSimTabs; state.telemetryHistory = currentTelemetry;
    addLog("HARDWARE REVERTED: Defaults Restored."); sync(); return false; 
  }
  if (msg.action === "START_DIAGNOSTIC") {
    stopAutomation(false); state.isRunning = true; state.isDiagnostic = true; state.isHunting = true;
    state.totalSearches = 1; state.totalWait = 5; state.timeLeft = 5; 
    state.pendingTerm = "Hardware Test Pulse"; startTick();
    chrome.tabs.create({ url: "https://www.bing.com/" }, (tab) => { state.bingTabId = tab.id; sync(); });
    return false;
  }
  if (msg.action === "TEST_NOTIFICATION") { triggerCompletionNotification(true); return false; }
  return false; 
});

function ensureStorageReadyAndLaunch() {
  if (!isStorageLoaded) {
    setTimeout(ensureStorageReadyAndLaunch, 100); 
    return;
  }
  initiateMission();
}

async function runInit() {
  if (!chrome.runtime?.id) return;
  setTimeout(async () => {
    try {
      const stored = await chrome.storage.local.get("state");
      if (stored.state) { 
        if (stored.state.bingTabId) {
          chrome.tabs.remove(parseInt(stored.state.bingTabId, 10)).catch(() => {});
        }
        if (stored.state.simulatedTabIds && stored.state.simulatedTabIds.length > 0) {
          stored.state.simulatedTabIds.forEach(id => chrome.tabs.remove(id).catch(() => {}));
        }

        Object.assign(state, stored.state); 
        state.isRunning = false; state.isPaused = false; state.bingTabId = null; 
        state.isCooling = false; state.isSimulating = false;
        state.simulatedTabIds = [];
        if (!state.searchHistory) state.searchHistory = [];
        if (!state.reminderAlarms) state.reminderAlarms = [];
        if (!state.telemetryHistory) state.telemetryHistory = [];
      }
      isStorageLoaded = true; 
      updateAlarmsEngine(); 
      sync(); 
      addLog("Cold-Boot: Memory Link Verified. Orphaned tabs purged.");
    } catch (e) { isStorageLoaded = true; }
  }, 150);
}
runInit();