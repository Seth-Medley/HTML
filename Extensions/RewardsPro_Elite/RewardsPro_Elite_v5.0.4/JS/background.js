/**
 * Rewards Pro: Elite v5.1.67 - Master Background Logic
 * FULL LENGTH CODE - NO CONDENSING - NO SHORTHAND
 * BUILD DF: Combinatorial Theme Engine (MAX EXPANSION); Session Sticky Category; Terminal Telemetry.
 * BASEPLATE: Build DE
 */

// --- GLOBAL ENGINE STATE ---
let tickInterval = null; 

let state = {
  isRunning: false,
  isPaused: false,
  isMobile: false,
  isStealth: false, 
  isCooldownMode: true,
  isKeepAwake: true,
  isClickSim: true,
  isDebriefViewed: false,
  isDiagnostic: false,
  isScheduled: false,
  scheduledTime: "06:00",
  themeMode: "system", 
  batchCounter: 0,
  targetBatchSize: 6,
  currentSearch: 0,
  totalSearches: 30,
  timeLeft: 0,
  totalWait: 0,
  minWait: 25, // Updated for Human Velocity
  maxWait: 60, // Updated for Human Velocity
  jitterFreq: 7, 
  accentColor: "#58a6ff",
  heartbeatSkin: "pulse", 
  hudOpacity: 100,
  hudBlur: 10,
  neonGlow: 5,
  hudRadius: 10,
  hudScale: 100,
  hudPosition: "bottom-left", 
  showScanlines: false,
  waveAmp: 15,
  animSpeed: 100,
  glitchFreq: 5,
  logMono: false,
  bingTabId: null,
  pendingTerm: null,
  isTypingStarted: false,
  runtime: 0,
  logs: [],
  sessionCategory: null // BUILD DC: Sticky Subject Locking
};

/**
 * THEME ENGINE: Categorical Database
 * Expanded for massive variety and search entropy before deployment.
 */
const themeEngine = {
  space: {
    label: "SPACE EXPLORATION",
    subjects: ["Nebula", "Exoplanet", "Supernova", "Black Hole", "Quasar", "Galactic Cluster", "Solar Flare", "Mars Rover", "Deep Space", "Astronaut", "Pulsar", "Gravity Wave", "Comet", "Orbital Mechanic", "Cosmic Microwave Background"],
    descriptors: ["atmospheric composition", "imaging archives", "physics research", "thermal signature mapping", "orbital trajectory", "interstellar medium analysis", "spectroscopy data", "formation history", "relativistic effect", "radiation belt"]
  },
  nature: {
    label: "NATURAL PHENOMENA",
    subjects: ["Bioluminescent organisms", "Tropical rainforest", "Arctic tundra", "Deep sea trenches", "Migratory patterns", "Geothermal vents", "Mountain ecosystem", "Coral reef", "Desert flora", "Atmospheric river", "Glacial calving", "Plate tectonic", "Mycelial network", "Pollinator behavior", "Sedimentary layer"],
    descriptors: ["conservation status 2026", "biodiversity impact", "climate adaptation", "reproductive cycle", "microbiome analysis", "geological formation", "satellite surveillance", "ecosystem resilience", "evolutionary path", "nutrient cycle"]
  },
  technology: {
    label: "ADVANCED TECHNOLOGY",
    subjects: ["Quantum processor", "Neural network", "Solid-state battery", "Blockchain ledger", "Augmented reality", "Cybersecurity protocol", "Nanotechnology", "Edge computing", "Autonomous drone", "Renewable energy grid", "Robotic exoskeleton", "Holographic display", "Wireless power transfer", "Graphene semiconductor", "Fusion ignition"],
    descriptors: ["latency optimization", "commercial scalability", "material breakthrough", "encryption efficiency", "system architecture", "deployment roadmap", "regulatory compliance", "computational density", "prototyping phase", "user-interface design"]
  },
  history: {
    label: "HISTORICAL CHRONICLES",
    subjects: ["Ancient civilizations", "Medieval warfare", "Renaissance art", "Industrial revolution", "Maritime exploration", "Stonehenge construction", "Silk Road trade", "Viking settlement", "Pyramids of Giza", "Samurai code", "French Revolution", "Age of Discovery", "Magna Carta signing", "Aztec empire architecture", "Mayan calendar systems"],
    descriptors: ["archaeological evidence", "cultural impact", "societal structure", "technological advancement", "economic significance", "unsolved mystery", "preservation effort", "mythology origin", "migration route", "architectural style"]
  },
  science: {
    label: "SCIENTIFIC FRONTIERS",
    subjects: ["Particle accelerator", "Genetic engineering", "Stem cell therapy", "Dark matter", "Cryogenics", "Microplastics", "Sustainable agriculture", "Synthetic biology", "Neuroplasticity", "Acoustic levitation", "CRISPR-Cas9 gene editing", "Large Hadron Collider", "Quantum entanglement", "Molecular assembly", "Photosynthetic efficiency"],
    descriptors: ["theoretical model", "peer-reviewed study", "experimental design", "laboratory finding", "ethical consideration", "future application", "funding source", "global initiative", "data visualization", "chemical bond"]
  },
  geology: {
    label: "GEOLOGICAL SYSTEMS",
    subjects: ["Magma chambers", "Sedimentary strata", "Tectonic plate subduction", "Erosion patterns", "Fossilized remains", "Crystal lattice formations", "Igneous intrusion", "Metamorphic rock cycles", "Hydrological basins", "Stratospheric ash clouds"],
    descriptors: ["seismic activity monitoring", "mineral density analysis", "geological epoch research", "tectonic drift measurements", "vulcanology reports", "subterranean pressure models", "crustal deformation"]
  },
  literature: {
    label: "CLASSICAL LITERATURE",
    subjects: ["Elizabethan drama", "Existentialist philosophy", "Victorian prose", "Modernist poetry", "Transcendentalist essays", "Dystopian fiction", "Gothic literature", "Utopian allegories", "Satirical manuscripts", "Epic poetry cycles"],
    descriptors: ["thematic deconstruction", "literary symbolism", "narrative structure analysis", "historical context study", "authorial voice critique", "philosophical underpinnings", "translation nuances"]
  },
  aviation: {
    label: "AERONAUTICAL ENGINEERING",
    subjects: ["Supersonic flight", "Avionics systems", "Jet propulsion", "Unmanned aerial vehicles", "Vtol technology", "Stealth airframes", "Rocket aerodynamics", "High-altitude balloons", "Commercial airliners", "Helicopter rotor dynamics"],
    descriptors: ["lift coefficient optimization", "thrust-to-weight ratio", "flight envelope expansion", "composite material stress test", "navigation logic", "fuel efficiency benchmarks", "air traffic control telemetry"]
  },
  mythology: {
    label: "ANCIENT MYTHOLOGY",
    subjects: ["Greek deities", "Norse sagas", "Egyptian pantheon", "Mesopotamian legends", "Celtic folklore", "Aztec creation myths", "Hindu epics", "Roman mythology", "Japanese Shinto legends", "Arthurian romances"],
    descriptors: ["archetypal representations", "mythological cross-comparisons", "cultural lore evolution", "sacred geometry in myth", "symbolic interpretations", "oral tradition preservation", "linguistic origin"]
  },
  architecture: {
    label: "MODERN ARCHITECTURE",
    subjects: ["Brutalist structures", "Parametric design", "Sustainable skyscrapers", "Neofuturistic buildings", "Modular housing", "Biophilic urbanism", "Adaptive reuse", "Structural expressionism", "Minimalist aesthetics", "Smart city layouts"],
    descriptors: ["urban density models", "material longevity reports", "aesthetic functionalism", "structural load distribution", "environmental footprint", "blueprint optimization", "spatial flow analysis"]
  }
};

/**
 * UTILITY: Sticky Query Generator
 * Constructs complex phrases from the locked session category.
 */
function generateStickyQuery() {
  const catKey = state.sessionCategory || "space";
  const categoryData = themeEngine[catKey];
  
  const subject = categoryData.subjects[Math.floor(Math.random() * categoryData.subjects.length)];
  const descriptor = categoryData.descriptors[Math.floor(Math.random() * categoryData.descriptors.length)];
  
  const coinFlip = Math.random() > 0.5;
  if (coinFlip) { return `${subject} ${descriptor}`; } 
  else { return `${descriptor} of ${subject}`; }
}

const DEFAULT_HARDWARE = {
  isMobile: false, isStealth: false, isCooldownMode: true, isKeepAwake: true,
  isScheduled: false, scheduledTime: "06:00", themeMode: "system",
  minWait: 25, maxWait: 60, jitterFreq: 7, accentColor: "#58a6ff",
  heartbeatSkin: "pulse", hudOpacity: 100, hudBlur: 10, neonGlow: 5,
  hudRadius: 10, hudScale: 100, hudPosition: "bottom-left",
  showScanlines: false, waveAmp: 15, animSpeed: 100, glitchFreq: 5, logMono: false
};

function updateBadge() {
  if (!state.isRunning) { chrome.action.setBadgeText({ text: "" }); return; }
  if (state.currentSearch >= state.totalSearches && !state.isDiagnostic) {
    chrome.action.setBadgeText({ text: "DONE" });
    chrome.action.setBadgeBackgroundColor({ color: "#3fb950" });
  } else if (state.isPaused) {
    chrome.action.setBadgeText({ text: "II" });
    chrome.action.setBadgeBackgroundColor({ color: "#d29922" });
  } else {
    const badgeText = state.isDiagnostic ? "TEST" : state.currentSearch.toString();
    chrome.action.setBadgeText({ text: badgeText });
    chrome.action.setBadgeBackgroundColor({ color: state.accentColor });
  }
}

function sync() { 
  if (!chrome.runtime?.id) { return; }
  chrome.storage.local.set({ state: state });
  chrome.runtime.sendMessage({ type: "SYNC", state: state }).catch(function() {}); 
  if (state.bingTabId !== null && state.bingTabId !== undefined) {
    const validatedTabId = parseInt(state.bingTabId, 10);
    if (Number.isInteger(validatedTabId) && validatedTabId > 0) {
      setTimeout(function() {
        chrome.tabs.sendMessage(validatedTabId, { type: "SYNC", state: state }, function() { if (chrome.runtime.lastError) {} });
      }, 75);
    }
  }
}

function addLog(msg) {
  const timestamp = new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
  state.logs.unshift(`[${timestamp}] ${msg}`);
  if (state.logs.length > 50) { state.logs.pop(); }
  sync();
}

function triggerCompletionNotification(isManual = false) {
  if (!chrome.notifications) { return; }
  const titleText = isManual ? "HARDWARE TEST SIGNAL" : "MISSION SECURED";
  const bodyText = isManual ? "The notification engine is operational." : `Automation finalized. ${state.currentSearch} searches logged.`;
  const options = {
    type: "basic", title: titleText, message: bodyText + " Click to view report.",
    iconUrl: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
    priority: 2
  };
  chrome.notifications.create("SIGNAL_" + Date.now(), options, function(id) { if (chrome.runtime.lastError) {} });
}

chrome.notifications.onClicked.addListener(function() { chrome.tabs.create({ url: chrome.runtime.getURL("popup.html") }); });

async function cleanupBingTabs() {
  const query = { url: "*://*.bing.com/*" };
  const tabs = await chrome.tabs.query(query);
  for (const tab of tabs) { chrome.tabs.remove(tab.id).catch(function() {}); }
  if (tabs.length > 0) { addLog(`CLEANUP: Decommissioned ${tabs.length} orphan instances.`); }
}

chrome.tabs.onRemoved.addListener(function(tabId) {
  if (state.isRunning && tabId === state.bingTabId) {
    addLog("SAFETY: Mission tab closed. Standby engaged.");
    stopAutomation(false);
  }
});

function getNextAlarmTime(timeStr) {
  const now = new Date(); const [hrs, mins] = timeStr.split(':').map(Number);
  let scheduleDate = new Date(); scheduleDate.setHours(hrs, mins, 0, 0);
  if (scheduleDate.getTime() <= now.getTime() + 60000) { scheduleDate.setDate(scheduleDate.getDate() + 1); }
  return scheduleDate.getTime();
}

async function updateChronosAlarm() {
  if (!chrome.alarms) { return; }
  await chrome.alarms.clear("CHRONOS_LAUNCH");
  if (state.isScheduled && state.scheduledTime) {
    const when = getNextAlarmTime(state.scheduledTime);
    chrome.alarms.create("CHRONOS_LAUNCH", { when: when });
    addLog(`CHRONOS: Armed for ${new Date(when).toLocaleTimeString()}`);
  }
}

chrome.alarms.onAlarm.addListener(function(alarm) {
  if (alarm.name === "CHRONOS_LAUNCH") {
    chrome.storage.local.get("state", function(data) { if (data.state && data.state.isScheduled) { initiateMission(); } });
  }
});

function resetTimer() {
  if (!state.isRunning || state.currentSearch >= state.totalSearches) { return; }
  
  if (state.isDiagnostic) {
    state.totalWait = 10;
  } else if (state.isCooldownMode && state.batchCounter >= state.targetBatchSize) {
    state.batchCounter = 0;
    state.targetBatchSize = Math.floor(Math.random() * 6) + 5;
    state.totalWait = 120;
    addLog("SECURITY: Deep Sleep protocol engaged.");
  } else {
    const waitRange = parseInt(state.maxWait) - parseInt(state.minWait) + 1;
    state.totalWait = Math.floor(Math.random() * waitRange) + parseInt(state.minWait);
  }
  
  state.timeLeft = state.totalWait;
  state.isTypingStarted = false;
  
  if (state.isDiagnostic) {
    state.pendingTerm = "Hardware Diagnostic Sweep";
  } else {
    state.pendingTerm = generateStickyQuery();
  }
  
  sync();
}

function initiateMission() {
  state.isRunning = true; state.isPaused = false; state.isDiagnostic = false; state.isDebriefViewed = false;
  state.currentSearch = 0; state.runtime = 0; state.batchCounter = 0;
  
  // SESSION LOCK: Pick a sticky category at mission launch
  const categories = Object.keys(themeEngine);
  state.sessionCategory = categories[Math.floor(Math.random() * categories.length)];
  const label = themeEngine[state.sessionCategory].label;
  
  addLog("Hardware Engaged.");
  addLog(`MISSION CATEGORY LOCKED: ${label}`);
  
  resetTimer();
  startTick();
  chrome.tabs.create({ url: "https://www.bing.com/" }, function(tab) {
    state.bingTabId = tab.id; sync();
  });
}

function startTick() {
  if (tickInterval) { clearInterval(tickInterval); }
  tickInterval = setInterval(function() {
    if (state.isRunning && !state.isPaused && state.currentSearch < state.totalSearches) {
      state.runtime = state.runtime + 1;
      if (state.timeLeft > 0) {
        state.timeLeft = state.timeLeft - 1;
        if (state.timeLeft % state.jitterFreq === 0 && state.bingTabId) {
          chrome.tabs.sendMessage(parseInt(state.bingTabId, 10), { action: "JITTER" }, function() { if (chrome.runtime.lastError) {} });
        }
        if (state.timeLeft === 5 && !state.isTypingStarted && state.bingTabId) {
          chrome.tabs.sendMessage(parseInt(state.bingTabId, 10), { action: "PING" }, function(response) {
            if (chrome.runtime.lastError || !response) { state.timeLeft = state.timeLeft + 1; return; }
            state.isTypingStarted = true;
            chrome.tabs.sendMessage(parseInt(state.bingTabId, 10), { action: "TYPE", term: state.pendingTerm }, function() { if (chrome.runtime.lastError) {} });
          });
        }
      }

      if (state.timeLeft <= 0) {
        if (!state.bingTabId) { return; }
        chrome.tabs.sendMessage(parseInt(state.bingTabId, 10), { action: "PING" }, function(response) {
          if (chrome.runtime.lastError || !response) { return; }
          state.currentSearch = state.currentSearch + 1;
          state.batchCounter = state.batchCounter + 1;
          
          // TELEMETRY: Log specific categorical search result
          addLog(`Action logged: ${state.currentSearch}/${state.totalSearches} -> [${state.pendingTerm}]`);
          
          chrome.tabs.sendMessage(parseInt(state.bingTabId, 10), { action: "SEARCH" }, function() { if (chrome.runtime.lastError) {} });
          if (state.isClickSim) {
            setTimeout(function() {
              if (state.bingTabId) { chrome.tabs.sendMessage(parseInt(state.bingTabId, 10), { action: "ENGAGE" }, function() { if (chrome.runtime.lastError) {} }); }
            }, 6000);
          }
          if (state.currentSearch >= state.totalSearches) { stopAutomation(true); } 
          else { resetTimer(); }
        });
      }
    }
    sync(); updateBadge();
  }, 1000);
}

function stopAutomation(isComp = false) {
  if (state.isDiagnostic) {
    state.isRunning = false; state.isDiagnostic = false; state.currentSearch = 0; state.isPaused = false;
    if (tickInterval) { clearInterval(tickInterval); }
    triggerCompletionNotification(true);
    setTimeout(function() { if (state.bingTabId) { chrome.tabs.remove(parseInt(state.bingTabId, 10)).catch(function() {}); } state.bingTabId = null; sync(); }, 2000);
    addLog("TEST COMPLETE."); updateBadge(); return;
  }
  state.isRunning = isComp; state.isPaused = false;
  if (tickInterval && !isComp) { clearInterval(tickInterval); state.isRunning = false; }
  if (isComp) {
    addLog("MISSION SECURED."); triggerCompletionNotification(false);
    setTimeout(function() { if (state.bingTabId) { chrome.tabs.remove(parseInt(state.bingTabId, 10)).catch(function() {}); } state.bingTabId = null; sync(); }, 3000);
  } else {
    if (state.bingTabId) { chrome.tabs.remove(parseInt(state.bingTabId, 10)).catch(function() {}); }
    state.bingTabId = null; addLog("Manual Termination."); sync();
  }
  updateBadge();
}

function relaunchMission() {
  addLog("CONFIG: Relaunching mission with new settings...");
  if (tickInterval) { clearInterval(tickInterval); }
  if (state.bingTabId) { chrome.tabs.remove(parseInt(state.bingTabId, 10)).catch(function() {}); }
  state.bingTabId = null;
  setTimeout(function() { initiateMission(); }, 500);
}

chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
  if (msg.action === "START") { initiateMission(); sendResponse({ status: "started" }); } 
  else if (msg.action === "START_DIAGNOSTIC") {
    state.isRunning = true; state.isPaused = false; state.isDiagnostic = true; state.isDebriefViewed = false;
    state.currentSearch = 0; state.runtime = 0; state.totalSearches = 1;
    addLog("TEST INITIATED."); startTick();
    chrome.tabs.create({ url: "https://www.bing.com/" }, function(tab) { state.bingTabId = tab.id; sync(); });
    sendResponse({ status: "diagnostic_started" });
  } 
  else if (msg.action === "STOP") { stopAutomation(false); sendResponse({ status: "stopped" }); } 
  else if (msg.action === "PAUSE") { state.isPaused = true; addLog("Engine Standby."); sync(); sendResponse({ status: "paused" }); } 
  else if (msg.action === "RESUME") { state.isPaused = false; addLog("Engine Resumed."); sync(); sendResponse({ status: "resumed" }); } 
  else if (msg.action === "FACTORY_RESET") { state.logs = []; addLog("Logs Purged."); sync(); sendResponse({ status: "reset_logs" }); } 
  else if (msg.action === "RESET_SETTINGS") { Object.assign(state, DEFAULT_HARDWARE); addLog("HARDWARE RESET."); sync(); sendResponse({ status: "reset_settings" }); } 
  else if (msg.action === "DISMISS_DEBRIEF") { state.isRunning = false; state.isDebriefViewed = true; state.currentSearch = 0; state.runtime = 0; sync(); sendResponse({ status: "dismissed" }); } 
  else if (msg.action === "SAVE_SCHEDULE") { state.isScheduled = msg.isScheduled; state.scheduledTime = msg.scheduledTime; updateChronosAlarm(); sendResponse({ status: "scheduled" }); } 
  else if (msg.action === "TEST_NOTIFICATION") { triggerCompletionNotification(true); sendResponse({ status: "notified" }); } 
  else if (msg.action === "UPDATE_STATE") {
    if (state.isRunning) {
      const goalChanged = msg.data.hasOwnProperty('totalSearches') && msg.data.totalSearches !== state.totalSearches;
      const mobileChanged = msg.data.hasOwnProperty('isMobile') && msg.data.isMobile !== state.isMobile;
      if (goalChanged || mobileChanged) { Object.assign(state, msg.data); relaunchMission(); sendResponse({ status: "relaunched" }); return false; }
    }
    Object.assign(state, msg.data); sync(); sendResponse({ status: "updated" });
  } 
  else if (msg.action === "GET_STATE") { sendResponse(state); } 
  else { sendResponse({ status: "unknown" }); }
  return false; 
});

async function runInit() {
  await cleanupBingTabs();
  const stored = await chrome.storage.local.get("state");
  if (stored.state) {
    Object.assign(state, stored.state);
    state.isRunning = false; state.isPaused = false; state.bingTabId = null; 
  }
  updateBadge(); updateChronosAlarm(); sync();
  addLog("Hardware Reboot Sequence Complete.");
}

runInit();