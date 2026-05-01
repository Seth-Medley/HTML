/**
 * Rewards Pro: Elite v5.2.25 - Master Background Logic
 * FULL LENGTH CODE - NO CONDENSING - NO SHORTHAND
 * BUILD EV: Fixed "No SW" promise rejection (Shielded Init); Async port logic.
 * BASEPLATE: RewardsPro_Elite_v5.0.4/JS/background.js
 */

const DEFAULT_HARDWARE = {
  isRunning: false, isPaused: false, isMobile: false, isStealth: false, 
  isCooldownMode: true, isKeepAwake: true, isClickSim: true,
  isScheduled: false, alarms: [], themeMode: "system",
  minWait: 25, maxWait: 60, jitterFreq: 7, accentColor: "#58a6ff",
  heartbeatSkin: "dna", hudOpacity: 100, hudBlur: 10, neonGlow: 5,
  hudRadius: 10, hudScale: 100, hudPosition: "bottom-left", logMono: false,
  totalSearches: 35, animSpeed: 100, waveAmp: 15, glitchFreq: 5
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

// --- GLOBAL ENGINE STATE ---
let tickInterval = null; 
let huntCycleCounter = 0;

let state = {
  isRunning: false, isPaused: false, isHunting: false, isMobile: false, 
  isStealth: false, isCooldownMode: true, isKeepAwake: true, isClickSim: true,
  isDebriefViewed: false, isDiagnostic: false, isScheduled: false,
  alarms: [], themeMode: "system", batchCounter: 0, targetBatchSize: 6,
  currentSearch: 0, totalSearches: 35, timeLeft: 0, totalWait: 0,
  minWait: 25, maxWait: 60, jitterFreq: 7, accentColor: "#58a6ff",
  heartbeatSkin: "dna", hudOpacity: 100, hudBlur: 10, neonGlow: 5,
  hudRadius: 10, hudScale: 100, hudPosition: "bottom-left", 
  showScanlines: false, waveAmp: 15, animSpeed: 100, glitchFreq: 5,
  logMono: false, bingTabId: null, pendingTerm: null, isTypingStarted: false,
  runtime: 0, logs: [], sessionCategory: null
};

const themeEngine = {
  astrophysics: { label: "ASTROPHYSICS", subjects: ["Event Horizon", "Dark Matter", "Neutron Star", "Quasar", "Gravitational Lensing", "Nebular Hypothesis"], descriptors: ["thermal emission spectroscopy", "spectral shift analysis", "orbital eccentricities"] },
  architecture: { label: "ARCHITECTURE & DESIGN", subjects: ["Brutalist Concrete", "Gothic Arch", "Bauhaus School", "Sustainable Urbanism", "Art Deco Facade"], descriptors: ["structural load calculations", "aesthetic integration", "material durability"] },
  mechanics: { label: "ADVANCED MECHANICS", subjects: ["Internal Combustion", "Aerodynamic Drag", "Torque Vectoring", "Hydraulic Actuation", "Transmission Gearbox"], descriptors: ["frictional coefficient", "mechanical efficiency", "stress fatigue analysis"] },
  botany: { label: "BOTANICAL SCIENCES", subjects: ["Photosynthetic pathways", "Mycorrhizal networks", "Xylem transport", "Angiosperm evolution"], descriptors: ["climatic adaptation", "nutrient sequestration", "cellular morphology"] },
  culinary: { label: "CULINARY ARTS", subjects: ["Molecular Gastronomy", "Sourdough fermentation", "Sous-vide precision", "Maillard reaction"], descriptors: ["flavor profile mapping", "enzymatic degradation"] },
  history: { label: "HISTORICAL CHRONICLES", subjects: ["Peloponnesian War", "Industrial Revolution", "Edo Period Japan", "Byzantine Empire"], descriptors: ["archaeological evidence", "societal stratification"] },
  materials: { label: "MATERIAL SCIENCE", subjects: ["Graphene lattice", "Shape-memory alloys", "Polymer cross-linking", "Lumber grading standards"], descriptors: ["tensile strength metrics", "molecular bonding"] },
  geology: { label: "GEOLOGICAL PHENOMENA", subjects: ["Tectonic subduction", "Sedimentary layering", "Igneous intrusion", "Glacial moraine"], descriptors: ["mineralogical composition", "stratigraphic record"] },
  computing: { label: "QUANTUM COMPUTING", subjects: ["Qubit superposition", "Neural network topology", "Cryptographic hashing", "Distributed ledger"], descriptors: ["latency optimization", "computational overhead"] },
  mythology: { label: "MYTHOLOGICAL LORE", subjects: ["Norse Aesir", "Hellenic Titans", "Aztec cosmology", "Mesopotamian deities"], descriptors: ["symbolic representation", "cultural transmission"] },
  oceanography: { label: "OCEANOGRAPHY", subjects: ["Abyssal plain", "Thermohaline circulation", "Hydrothermal vents", "Pelagic zones"], descriptors: ["bathymetric mapping", "salinity gradients"] },
  automotive: { label: "AUTOMOTIVE TECHNOLOGY", subjects: ["EV Battery cooling", "Regenerative braking", "Chassis rigidity", "Turbocharger compression"], descriptors: ["energy density analysis", "thermal management"] }
};

function generateStickyQuery() {
  const categories = Object.keys(themeEngine);
  const catKey = state.sessionCategory || categories[Math.floor(Math.random() * categories.length)];
  const categoryData = themeEngine[catKey];
  const subject = categoryData.subjects[Math.floor(Math.random() * categoryData.subjects.length)];
  const descriptor = categoryData.descriptors[Math.floor(Math.random() * categoryData.descriptors.length)];
  return Math.random() > 0.5 ? `${subject} ${descriptor}` : `${descriptor} of ${subject}`;
}

function safePulse(action, payload = {}, callback = null) {
  if (!state.bingTabId || !chrome.tabs || !chrome.runtime?.id) return;
  chrome.tabs.sendMessage(parseInt(state.bingTabId, 10), { action: action, ...payload }, (response) => {
    if (chrome.runtime.lastError) return;
    if (callback) callback(response);
  });
}

function sync() { 
  if (!chrome.runtime?.id) { return; }
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

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (state.isRunning && tabId === state.bingTabId && changeInfo.status === "complete") {
    if (state.isHunting) { state.isHunting = false; addLog("Handshake: Breach Successful."); sync(); }
  }
});

function getNextAlarmTime(timeStr) {
  const now = new Date();
  const [hrs, mins] = timeStr.split(':').map(Number);
  let scheduleDate = new Date();
  scheduleDate.setHours(hrs, mins, 0, 0);
  if (scheduleDate.getTime() <= now.getTime() + 2000) { scheduleDate.setDate(scheduleDate.getDate() + 1); }
  return scheduleDate.getTime();
}

async function updateChronosAlarms() {
  if (!chrome.alarms || !chrome.runtime?.id) return;
  try {
    await chrome.alarms.clearAll();
    if (state.isScheduled && state.alarms && state.alarms.length > 0) {
      state.alarms.forEach(alarm => {
        const when = getNextAlarmTime(alarm.time);
        chrome.alarms.create(`CHRONOS_${alarm.id}`, { when: when });
      });
      addLog(`CHRONOS: ${state.alarms.length} windows armed.`);
    } else { addLog("CHRONOS: Disengaged."); }
  } catch (e) {}
}

chrome.alarms.onAlarm.addListener(() => { initiateMission(); });

async function cleanupBingTabs() {
  if (!chrome.tabs || !chrome.runtime?.id) return;
  try {
    const query = { url: "*://*.bing.com/*" };
    const tabs = await chrome.tabs.query(query);
    for (const tab of tabs) { chrome.tabs.remove(tab.id).catch(() => {}); }
  } catch (e) {}
}

function resetTimer() {
  if (!state.isRunning || state.currentSearch >= state.totalSearches) return;
  const waitRange = parseInt(state.maxWait) - parseInt(state.minWait) + 1;
  state.totalWait = Math.floor(Math.random() * waitRange) + parseInt(state.minWait);
  state.timeLeft = state.totalWait;
  state.isTypingStarted = false;
  state.pendingTerm = generateStickyQuery();
  sync();
}

function initiateMission() {
  state.isRunning = true; state.isPaused = false; state.isHunting = true;
  state.currentSearch = 0; state.runtime = 0; state.batchCounter = 0; huntCycleCounter = 0;
  const categories = Object.keys(themeEngine);
  state.sessionCategory = categories[Math.floor(Math.random() * categories.length)];
  addLog(`Hardware Engaged. BREACHING OVERLAY: ${themeEngine[state.sessionCategory].label}`);
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
          if (tab.status === "complete" || huntCycleCounter > 10) {
            state.isHunting = false; addLog("Breach Confirmed.");
          }
        });
        state.timeLeft = state.totalWait; sync(); return; 
      }
      if (state.timeLeft > 0) {
        state.timeLeft--;
        if (state.timeLeft % state.jitterFreq === 0) { safePulse("JITTER"); }
        if (state.timeLeft === 5 && !state.isTypingStarted) {
          safePulse("PING", {}, (response) => {
            if (!response) { state.timeLeft = state.timeLeft + 1; return; }
            state.isTypingStarted = true;
            safePulse("TYPE", { term: state.pendingTerm });
          });
        }
      } else {
        safePulse("PING", {}, (response) => {
          if (!response) return;
          state.currentSearch++;
          addLog(`Action logged: ${state.currentSearch}/${state.totalSearches} -> [${state.pendingTerm}]`);
          safePulse("SEARCH");
          if (state.isClickSim) { setTimeout(() => { safePulse("ENGAGE"); }, 6000); }
          if (state.currentSearch >= state.totalSearches) stopAutomation(true); else resetTimer();
        });
      }
    }
    sync();
  }, 1000);
}

function stopAutomation(isComp = false) {
  const wasDiagnostic = state.isDiagnostic;
  if (tickInterval) { clearInterval(tickInterval); tickInterval = null; }
  state.isRunning = isComp; state.isHunting = false; state.isTypingStarted = false;
  if (state.bingTabId) chrome.tabs.remove(parseInt(state.bingTabId, 10)).catch(() => {});
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
  if (msg.action === "START") { initiateMission(); return false; } 
  if (msg.action === "STOP") { stopAutomation(false); return false; } 
  if (msg.action === "PAUSE") { state.isPaused = true; sync(); return false; }
  if (msg.action === "RESUME") { state.isPaused = false; sync(); return false; }
  if (msg.action === "SAVE_SCHEDULE") {
    state.isScheduled = msg.isScheduled; state.alarms = msg.alarms || [];
    updateChronosAlarms(); sync(); return false;
  } 
  if (msg.action === "UPDATE_STATE") { Object.assign(state, msg.data); sync(); return false; }
  if (msg.action === "FACTORY_RESET") {
    stopAutomation(false); state.logs = []; state.alarms = []; 
    addLog("TELEMETRY WIPE: Windows Purged.");
    if (chrome.alarms) chrome.alarms.clearAll(); sync(); return false;
  }
  if (msg.action === "RESET_SETTINGS") { 
    const currentLogs = [...state.logs]; const currentAlarms = [...state.alarms];
    Object.assign(state, JSON.parse(JSON.stringify(DEFAULT_HARDWARE))); 
    state.logs = currentLogs; state.alarms = currentAlarms;
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

async function runInit() {
  if (!chrome.runtime?.id) return;
  setTimeout(async () => {
    try {
      await cleanupBingTabs();
      const stored = await chrome.storage.local.get("state");
      if (stored.state) { 
        Object.assign(state, stored.state); 
        state.isRunning = false; state.isPaused = false; state.bingTabId = null; 
      }
      updateChronosAlarms(); 
      sync(); 
      addLog("Hardware Reboot Sequence Complete.");
    } catch (e) {}
  }, 150);
}
runInit();