/**
 * Rewards Pro: Elite v4.9.20 - Master Background Logic
 * FULL LENGTH CODE - NO CONDENSING
 * IMPLEMENTS: Runtime Counter Freeze and Hardware Diagnostic logic.
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
  isDebriefViewed: false,
  isDiagnostic: false,
  batchCounter: 0,
  targetBatchSize: 3,
  currentSearch: 0,
  totalSearches: 30,
  timeLeft: 0,
  totalWait: 0,
  minWait: 20,
  maxWait: 45,
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
  logs: []
};

/**
 * Badge Telemetry
 */
function updateBadge() {
  if (!state.isRunning) {
    chrome.action.setBadgeText({ text: "" });
    return;
  }
  
  if (state.currentSearch >= state.totalSearches) {
    chrome.action.setBadgeText({ text: "DONE" });
    chrome.action.setBadgeBackgroundColor({ color: "#3fb950" });
  } else if (state.isPaused) {
    chrome.action.setBadgeText({ text: "II" });
    chrome.action.setBadgeBackgroundColor({ color: "#d29922" });
  } else if (state.timeLeft > 120) {
    chrome.action.setBadgeText({ text: "SLP" });
    chrome.action.setBadgeBackgroundColor({ color: "#8b949e" });
  } else {
    const textValue = state.isDiagnostic ? "DIAG" : state.currentSearch.toString();
    chrome.action.setBadgeText({ text: textValue });
    chrome.action.setBadgeBackgroundColor({ color: state.accentColor });
  }
}

/**
 * Mobile Mode Spoofing
 */
async function updateMobileHeaders() {
  if (!chrome.declarativeNetRequest) return;
  const oldRules = await chrome.declarativeNetRequest.getDynamicRules();
  const ruleIds = oldRules.map(function(rule) { return rule.id; });
  const rules = [];
  if (state.isMobile) {
    rules.push({
      id: 1, priority: 1,
      action: { type: "modifyHeaders", requestHeaders: [
        { header: "user-agent", operation: "set", value: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1" },
        { header: "sec-ch-ua-mobile", operation: "set", value: "?1" },
        { header: "sec-ch-ua-platform", operation: "set", value: '"iOS"' }
      ] },
      condition: { urlFilter: "||bing.com", resourceTypes: ["main_frame", "sub_frame"] }
    });
  }
  await chrome.declarativeNetRequest.updateDynamicRules({ removeRuleIds: ruleIds, addRules: rules });
}

function handlePowerState() {
  if (state.isRunning && state.isKeepAwake) { chrome.power.requestKeepAwake('display'); }
  else { chrome.power.releaseKeepAwake(); }
}

function addLog(message) {
  const timestamp = new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
  state.logs.unshift(`[${timestamp}] ${message}`);
  if (state.logs.length > 50) state.logs.pop();
  sync();
}

/**
 * Timer Controller
 */
function resetTimer() {
  if (!state.isRunning || state.currentSearch >= state.totalSearches) return;

  if (state.isDiagnostic) {
    state.totalWait = 10; 
  } else if (state.isCooldownMode && state.batchCounter >= state.targetBatchSize) {
    state.batchCounter = 0; state.targetBatchSize = Math.floor(Math.random() * 2) + 2; 
    state.totalWait = 900; 
    addLog(`SECURITY: Deep Sleep (15m) active.`);
  } else {
    const range = parseInt(state.maxWait) - parseInt(state.minWait) + 1;
    state.totalWait = Math.floor(Math.random() * range) + parseInt(state.minWait);
  }
  
  state.timeLeft = state.totalWait;
  state.isTypingStarted = false;
  state.pendingTerm = state.isDiagnostic ? "Diagnostic Verification" : ("Simulation Query " + Math.floor(Math.random() * 9999));
  
  sync();
}

/**
 * Master Clock
 */
function startTick() {
  if (tickInterval) clearInterval(tickInterval);
  tickInterval = setInterval(function() {
    // HARD FREEZE: Stop incrementing runtime on completion
    if (state.isRunning && !state.isPaused && state.currentSearch < state.totalSearches) {
      state.runtime++;
      
      if (state.timeLeft > 0) {
        state.timeLeft--;
        if (state.timeLeft % state.jitterFreq === 0 && state.bingTabId) {
          chrome.tabs.sendMessage(state.bingTabId, { action: "JITTER" }).catch(function() {});
        }
        if (state.timeLeft === 5 && !state.isTypingStarted && state.bingTabId) {
          state.isTypingStarted = true;
          chrome.tabs.sendMessage(state.bingTabId, { action: "TYPE", term: state.pendingTerm }).catch(function() {});
        }
        if (state.timeLeft <= 0) {
          state.currentSearch++; state.batchCounter++;
          addLog(`${state.isDiagnostic ? "DIAGNOSTIC" : "Sequence"} logged: ${state.currentSearch}/${state.totalSearches}`);
          if (state.bingTabId) chrome.tabs.sendMessage(state.bingTabId, { action: "SEARCH" }).catch(function() {});
          
          if (state.currentSearch >= state.totalSearches) {
            stopAutomation(true);
            clearInterval(tickInterval);
          } else {
            resetTimer();
          }
        }
      }
    }
    sync(); updateBadge();
  }, 1000);
}

function stopAutomation(isCompletion = false) {
  state.isRunning = isCompletion;
  state.isPaused = false;
  handlePowerState();
  if (tickInterval && !isCompletion) { clearInterval(tickInterval); state.isRunning = false; }
  if (state.bingTabId) { chrome.tabs.remove(state.bingTabId).catch(function() {}); state.bingTabId = null; }
  if (isCompletion) addLog(`MISSION SECURED. ${state.isDiagnostic ? "DIAGNOSTIC COMPLETE." : "VIEW DEBRIEF."}`);
  else addLog("Protocol Terminated.");
  updateBadge(); sync();
}

function sync() { 
  if (!chrome.runtime?.id) return;
  chrome.storage.local.set({ state: state });
  chrome.runtime.sendMessage({ type: "SYNC", state: state }).catch(function(err) {}); 
  if (state.bingTabId) { chrome.tabs.sendMessage(state.bingTabId, { type: "SYNC", state: state }).catch(function(err) {}); }
}

chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
  if (msg.action === "START") {
    state.isRunning = true; state.isPaused = false; state.isDiagnostic = false; state.isDebriefViewed = false;
    state.currentSearch = 0; state.runtime = 0; state.batchCounter = 0; state.targetBatchSize = 3; state.totalSearches = 30;
    addLog("Protocol Engaged."); handlePowerState(); sync(); startTick();
    chrome.tabs.create({ url: "https://www.bing.com/" }, function(tab) { state.bingTabId = tab.id; });
  } 
  else if (msg.action === "START_DIAGNOSTIC") {
    state.isRunning = true; state.isPaused = false; state.isDiagnostic = true; state.isDebriefViewed = false;
    state.currentSearch = 0; state.runtime = 0; state.totalSearches = 1;
    addLog("SYSTEM DIAGNOSTIC INITIATED."); handlePowerState(); sync(); startTick();
    chrome.tabs.create({ url: "https://www.bing.com/" }, function(tab) { state.bingTabId = tab.id; });
  }
  else if (msg.action === "STOP") stopAutomation(false);
  else if (msg.action === "PAUSE") { state.isPaused = true; addLog("Engine Paused."); updateBadge(); sync(); }
  else if (msg.action === "RESUME") { state.isPaused = false; addLog("Engine Resumed."); updateBadge(); sync(); }
  else if (msg.action === "FACTORY_RESET") { state.logs = []; addLog("FACTORY RESET: Logs purged."); sync(); }
  else if (msg.action === "DISMISS_DEBRIEF") { state.isRunning = false; state.isDebriefViewed = true; if (tickInterval) clearInterval(tickInterval); sync(); }
  else if (msg.action === "UPDATE_STATE") {
    Object.assign(state, msg.data);
    if (msg.data.hasOwnProperty('isKeepAwake')) handlePowerState();
    if (msg.data.hasOwnProperty('isMobile')) updateMobileHeaders();
    sync();
  }
  else if (msg.action === "GET_STATE") { sendResponse(state); return true; }
  else if (msg.action === "CONTENT_READY") resetTimer();
  sendResponse({}); return true;
});

async function runInit() {
  const stored = await chrome.storage.local.get("state");
  if (stored.state) {
    state.logs = stored.state.logs || [];
    state.accentColor = stored.state.accentColor || "#58a6ff";
    state.hudPosition = stored.state.hudPosition || "bottom-left";
    state.logMono = stored.state.logMono || false;
  }
  chrome.tabs.query({ url: "*://*.bing.com/*" }, function(tabs) { if (tabs) tabs.forEach(function(t) { chrome.tabs.remove(t.id).catch(function() {}); }); });
  updateMobileHeaders(); updateBadge(); sync();
}
runInit();