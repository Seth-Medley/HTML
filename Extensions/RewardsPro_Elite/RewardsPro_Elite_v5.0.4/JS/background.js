/**
 * Rewards Pro: Elite v5.2.12 - Master Background Logic
 * FULL LENGTH CODE - NO CONDENSING - NO SHORTHAND
 * BUILD EI: Fixed Factory Reset (Search Goal 30); Scoping Fix; Recursive Handshake.
 * BASEPLATE: RewardsPro_Elite_v5.0.4/JS/background.js
 */

// FIX: GLOBAL MANIFEST FOR FACTORY RESET
const DEFAULT_HARDWARE = {
  isRunning: false, isPaused: false, isMobile: false, isStealth: false, 
  isCooldownMode: true, isKeepAwake: true, isClickSim: true,
  isScheduled: false, alarms: [], themeMode: "system",
  minWait: 25, maxWait: 60, jitterFreq: 7, accentColor: "#58a6ff",
  heartbeatSkin: "dna", hudOpacity: 100, hudBlur: 10, neonGlow: 5,
  hudRadius: 10, hudScale: 100, hudPosition: "bottom-left", logMono: false,
  totalSearches: 30, animSpeed: 100, waveAmp: 15, glitchFreq: 5
};

function triggerCompletionNotification(isManual = false) {
  if (!chrome.notifications) { return; }
  const titleText = isManual ? "HARDWARE TEST SIGNAL" : "MISSION SECURED";
  const bodyText = isManual ? "The notification engine is operational." : `Automation finalized. ${state.currentSearch} searches logged.`;
  const options = {
    type: "basic", title: titleText, message: bodyText + " Click to view report.",
    iconUrl: "/Icon/icon.png", 
    priority: 2
  };
  chrome.notifications.create("SIGNAL_" + Date.now(), options, function(id) { if (chrome.runtime.lastError) {} });
}

// --- GLOBAL ENGINE STATE ---
let tickInterval = null; 

let state = {
  isRunning: false, isPaused: false, isMobile: false, isStealth: false, 
  isCooldownMode: true, isKeepAwake: true, isClickSim: true,
  isDebriefViewed: false, isDiagnostic: false, isScheduled: false,
  alarms: [], themeMode: "system", batchCounter: 0, targetBatchSize: 6,
  currentSearch: 0, totalSearches: 30, timeLeft: 0, totalWait: 0,
  minWait: 25, maxWait: 60, jitterFreq: 7, accentColor: "#58a6ff",
  heartbeatSkin: "dna", hudOpacity: 100, hudBlur: 10, neonGlow: 5,
  hudRadius: 10, hudScale: 100, hudPosition: "bottom-left", 
  showScanlines: false, waveAmp: 15, animSpeed: 100, glitchFreq: 5,
  logMono: false, bingTabId: null, pendingTerm: null, isTypingStarted: false,
  runtime: 0, logs: [], sessionCategory: null
};

/**
 * THEME ENGINE: Categorical Database
 */
const themeEngine = {
  space: { label: "SPACE EXPLORATION", subjects: ["Nebula", "Exoplanet", "Supernova", "Black Hole", "Quasar", "Mars Rover", "Astronaut"], descriptors: ["atmospheric composition", "imaging archives", "physics research", "orbital trajectory"] },
  nature: { label: "NATURAL PHENOMENA", subjects: ["Bioluminescent organisms", "Tropical rainforest", "Arctic tundra", "Deep sea trenches", "Coral reef"], descriptors: ["conservation status 2026", "biodiversity impact study", "climate adaptation"] },
  technology: { label: "ADVANCED TECHNOLOGY", subjects: ["Quantum processor", "Neural network", "Solid-state battery", "Blockchain ledger", "Nanotechnology"], descriptors: ["latency optimization", "commercial scalability", "material breakthrough"] },
  history: { label: "HISTORICAL CHRONICLES", subjects: ["Ancient civilizations", "samurai code", "Pyramids of Giza", "Industrial revolution"], descriptors: ["archaeological evidence", "cultural impact", "societal structure"] }
};

function generateStickyQuery() {
  const catKey = state.sessionCategory || "space";
  const categoryData = themeEngine[catKey];
  const subject = categoryData.subjects[Math.floor(Math.random() * categoryData.subjects.length)];
  const descriptor = categoryData.descriptors[Math.floor(Math.random() * categoryData.descriptors.length)];
  return Math.random() > 0.5 ? `${subject} ${descriptor}` : `${descriptor} of ${subject}`;
}

/**
 * SYNC PROTOCOL: HUD HANDSHAKE
 */
function sync() { 
  if (!chrome.runtime?.id) { return; }
  chrome.storage.local.set({ state: state }); 
  chrome.runtime.sendMessage({ type: "SYNC", state: state }).catch(() => {}); 
  
  if (state.bingTabId !== null && state.bingTabId !== undefined) {
    const validatedTabId = parseInt(state.bingTabId, 10);
    if (Number.isInteger(validatedTabId) && validatedTabId > 0) {
      setTimeout(() => {
        chrome.tabs.sendMessage(validatedTabId, { type: "SYNC", state: state }, () => {
          if (chrome.runtime.lastError) {}
        });
      }, 75);
    }
  }
}

function addLog(msg) {
  const timestamp = new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
  state.logs.unshift(`[${timestamp}] ${msg}`);
  if (state.logs.length > 50) state.logs.pop();
  sync();
}

/**
 * CHRONOS: Precision Sequencing
 */
function getNextAlarmTime(timeStr) {
  const now = new Date();
  const [hrs, mins] = timeStr.split(':').map(Number);
  let scheduleDate = new Date();
  scheduleDate.setHours(hrs, mins, 0, 0);
  if (scheduleDate.getTime() <= now.getTime() + 2000) { 
    scheduleDate.setDate(scheduleDate.getDate() + 1); 
  }
  return scheduleDate.getTime();
}

async function updateChronosAlarms() {
  await chrome.alarms.clearAll();
  if (state.isScheduled && state.alarms && state.alarms.length > 0) {
    state.alarms.forEach(alarm => {
      const when = getNextAlarmTime(alarm.time);
      chrome.alarms.create(`CHRONOS_${alarm.id}`, { when: when });
    });
    addLog(`CHRONOS: ${state.alarms.length} mission windows armed.`);
  } else { addLog("CHRONOS: Schedule disengaged."); }
}

chrome.alarms.onAlarm.addListener(() => { initiateMission(); });

async function cleanupBingTabs() {
  const query = { url: "*://*.bing.com/*" };
  const tabs = await chrome.tabs.query(query);
  for (const tab of tabs) { chrome.tabs.remove(tab.id).catch(() => {}); }
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
  state.isRunning = true; state.isPaused = false; state.isDiagnostic = false; 
  state.currentSearch = 0; state.runtime = 0; state.batchCounter = 0;
  const categories = Object.keys(themeEngine);
  state.sessionCategory = categories[Math.floor(Math.random() * categories.length)];
  addLog(`Hardware Engaged. CATEGORY LOCKED: ${themeEngine[state.sessionCategory].label}`);
  resetTimer();
  if (tickInterval) clearInterval(tickInterval);
  startTick();
  chrome.tabs.create({ url: "https://www.bing.com/" }, (tab) => { state.bingTabId = tab.id; sync(); });
}

/**
 * TICK LOOP: CHRONOS AUTOMATIC IGNITION
 * Recursive handshake verify + Click Sim Handshake.
 */
function startTick() {
  tickInterval = setInterval(() => {
    if (state.isRunning && !state.isPaused && state.currentSearch < state.totalSearches) {
      state.runtime++;
      if (state.timeLeft > 0) {
        state.timeLeft--;
        if (state.timeLeft % state.jitterFreq === 0 && state.bingTabId) {
          chrome.tabs.sendMessage(parseInt(state.bingTabId, 10), { action: "JITTER" }, () => { if (chrome.runtime.lastError) {} });
        }
        
        // HANDSHAKE: Automatic ignition retry loop
        if (state.timeLeft === 5 && !state.isTypingStarted && state.bingTabId) {
          chrome.tabs.sendMessage(parseInt(state.bingTabId, 10), { action: "PING" }, (response) => {
            if (chrome.runtime.lastError || !response) { 
               state.timeLeft = state.timeLeft + 1; // Wait 1s and retry
               return; 
            }
            state.isTypingStarted = true;
            chrome.tabs.sendMessage(parseInt(state.bingTabId, 10), { action: "TYPE", term: state.pendingTerm }, () => { if (chrome.runtime.lastError) {} });
          });
        }
      } else if (state.bingTabId) {
        // HANDSHAKE: Final Search verify
        chrome.tabs.sendMessage(parseInt(state.bingTabId, 10), { action: "PING" }, (response) => {
          if (chrome.runtime.lastError || !response) { return; }
          state.currentSearch++;
          addLog(`Action logged: ${state.currentSearch}/${state.totalSearches} -> [${state.pendingTerm}]`);
          chrome.tabs.sendMessage(parseInt(state.bingTabId, 10), { action: "SEARCH" }, () => { if (chrome.runtime.lastError) {} });
          
          if (state.isClickSim) {
            setTimeout(() => { 
               if (state.bingTabId) { chrome.tabs.sendMessage(parseInt(state.bingTabId, 10), { action: "ENGAGE" }); }
            }, 6000);
          }
          if (state.currentSearch >= state.totalSearches) stopAutomation(true); else resetTimer();
        });
      }
    }
    sync();
  }, 1000);
}

function stopAutomation(isComp = false) {
  const wasDiagnostic = state.isDiagnostic;
  state.isRunning = isComp; 
  if (tickInterval && !isComp) { clearInterval(tickInterval); state.isRunning = false; }
  if (state.bingTabId) chrome.tabs.remove(parseInt(state.bingTabId, 10)).catch(() => {});
  state.bingTabId = null;
  addLog(isComp ? "MISSION SECURED." : "Manual Termination.");
  if (isComp && wasDiagnostic) { triggerCompletionNotification(true); }
  sync();
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === "START") { initiateMission(); sendResponse({ status: "started" }); } 
  else if (msg.action === "START_DIAGNOSTIC") {
    stopAutomation(false);
    state.isRunning = true; state.isPaused = false; state.isDiagnostic = true; state.isDebriefViewed = false;
    state.currentSearch = 0; state.runtime = 0; state.totalSearches = 1;
    state.totalWait = 5; state.timeLeft = 5; 
    state.pendingTerm = "Rewards Pro Hardware Test";
    addLog("DIAGNOSTIC INITIATED."); startTick();
    chrome.tabs.create({ url: "https://www.bing.com/" }, function(tab) { state.bingTabId = tab.id; sync(); });
    sendResponse({ status: "diagnostic_started" });
  } 
  else if (msg.action === "STOP") { stopAutomation(false); sendResponse({ status: "stopped" }); } 
  else if (msg.action === "PAUSE") { state.isPaused = true; addLog("Standby."); sync(); }
  else if (msg.action === "RESUME") { state.isPaused = false; addLog("Resumed."); sync(); }
  else if (msg.action === "SAVE_SCHEDULE") {
    state.isScheduled = msg.isScheduled;
    state.alarms = msg.alarms || [];
    updateChronosAlarms();
    sync();
    sendResponse({ status: "scheduled" });
  } 
  else if (msg.action === "UPDATE_STATE") {
    Object.assign(state, msg.data);
    sync();
    sendResponse({ status: "updated" });
  }
  else if (msg.action === "TEST_NOTIFICATION") { triggerCompletionNotification(true); sendResponse({ status: "notified" }); } 
  // FIX: FACTORY RESET HARDWARE WIPE
  else if (msg.action === "FACTORY_RESET") {
    stopAutomation(false);
    Object.assign(state, JSON.parse(JSON.stringify(DEFAULT_HARDWARE)));
    state.logs = []; state.alarms = []; 
    addLog("FACTORY WIPE: SYSTEMS REVERTED TO 30 SEARCH GOAL.");
    chrome.alarms.clearAll(); sync();
  }
  else if (msg.action === "RESET_SETTINGS") { 
    Object.assign(state, JSON.parse(JSON.stringify(DEFAULT_HARDWARE))); 
    addLog("Settings Reverted."); sync(); 
  }
  else if (msg.action === "DISMISS_DEBRIEF") { state.isRunning = false; state.isDebriefViewed = true; state.currentSearch = 0; state.runtime = 0; sync(); }
  return false; 
});

async function runInit() {
  await cleanupBingTabs();
  const stored = await chrome.storage.local.get("state");
  if (stored.state) {
    Object.assign(state, stored.state);
    state.isRunning = false; state.isPaused = false; state.bingTabId = null; 
  }
  updateChronosAlarms(); sync();
  addLog("Hardware Reboot Sequence Complete.");
}
runInit();