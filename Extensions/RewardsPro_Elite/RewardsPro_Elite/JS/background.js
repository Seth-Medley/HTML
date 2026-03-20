/**
 * Rewards Pro: Elite v4.4.4 - Master Background Logic
 * SECURITY: Variable Batching (2-3 searches) to break bot detection patterns.
 */

let tickInterval = null; 
let state = {
  isRunning: false, isPaused: false, isMobile: false, isStealth: false,
  isCooldownMode: true, isKeepAwake: true, batchCounter: 0, targetBatchSize: 3,
  currentSearch: 0, totalSearches: 30, timeLeft: 0, totalWait: 0,
  minWait: 20, maxWait: 45, jitterFreq: 7, 
  accentColor: "#58a6ff", heartbeatSkin: "pulse",
  bingTabId: null, isContentReady: false, pendingTerm: null,
  isTypingStarted: false, runtime: 0, logs: [], activeTheme: "General"
};

const MOBILE_UA = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1";

async function updateMobileHeaders() {
  if (!chrome.declarativeNetRequest) return;
  const oldRules = await chrome.declarativeNetRequest.getDynamicRules();
  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: oldRules.map(r => r.id),
    addRules: state.isMobile ? [{
      id: 1, priority: 1,
      action: { type: "modifyHeaders", requestHeaders: [
        { header: "user-agent", operation: "set", value: MOBILE_UA },
        { header: "sec-ch-ua-mobile", operation: "set", value: "?1" },
        { header: "sec-ch-ua-platform", operation: "set", value: '"iOS"' }
      ] },
      condition: { urlFilter: "||bing.com", resourceTypes: ["main_frame", "sub_frame"] }
    }] : []
  });
}

function handlePowerState() {
  if (state.isRunning && state.isKeepAwake) {
    chrome.power.requestKeepAwake('display');
  } else {
    chrome.power.releaseKeepAwake();
  }
}

// RESTORED: Extension Startup Cleanup
function initialize() {
  chrome.tabs.query({ url: "*://*.bing.com/*" }, function(tabs) {
    if (tabs) {
      for (let i = 0; i < tabs.length; i++) {
        chrome.tabs.remove(tabs[i].id).catch(() => {});
      }
    }
  });
  updateMobileHeaders();
}

try { initialize(); } catch (e) { console.warn("Cleanup suppressed."); }

const researchThemes = {
  "Astronomy": { starters: ["Distance to", "History of"], subjects: ["nebula", "black hole"], actions: ["rotation", "orbit"], contexts: ["in space", "explained"] },
  "Technology": { starters: ["Future of", "Guide to"], subjects: ["neural network", "blockchain"], actions: ["logic", "security"], contexts: ["in modern era", "for developers"] },
  "Nature": { starters: ["Evolution of", "Patterns in"], subjects: ["ecosystem", "glacier"], actions: ["cycles", "stability"], contexts: ["on earth", "globally"] },
  "Cinema & Arts": { starters: ["Review of", "Influence of"], subjects: ["sound design", "cinematography"], actions: ["evolution", "composition"], contexts: ["in Hollywood", "worldwide"] }
};

function addLog(msg) {
  const time = new Date().toLocaleTimeString([], { hour12: false });
  state.logs.unshift(`[${time}] ${msg}`);
  if (state.logs.length > 25) state.logs.pop();
  sync();
}

function stopAutomation() {
  state.isRunning = false; state.isPaused = false;
  handlePowerState();
  if (tickInterval) clearInterval(tickInterval);
  if (state.bingTabId) { chrome.tabs.remove(state.bingTabId).catch(() => {}); state.bingTabId = null; }
  addLog("Mission Ended.");
}

function resetTimer() {
  if (!state.isRunning || state.currentSearch >= state.totalSearches) return;

  // SECURITY: Variable Batching Logic
  if (state.isCooldownMode && state.batchCounter >= state.targetBatchSize) {
    state.batchCounter = 0;
    // Set a new random target for the next batch (2 or 3) to break the pattern
    state.targetBatchSize = Math.floor(Math.random() * 2) + 2; 
    state.totalWait = 920; 
    addLog(`SECURITY: Batch Complete. Sleeping for 15m.`);
  } else {
    const range = parseInt(state.maxWait) - parseInt(state.minWait) + 1;
    state.totalWait = Math.floor(Math.random() * range) + parseInt(state.minWait);
  }

  state.timeLeft = state.totalWait;
  state.isTypingStarted = false;
  
  // Pick a random theme for EVERY search to increase entropy
  const themes = Object.keys(researchThemes);
  const selectedTheme = themes[Math.floor(Math.random() * themes.length)];
  state.activeTheme = selectedTheme;
  
  const t = researchThemes[selectedTheme];
  state.pendingTerm = `${t.starters[Math.floor(Math.random()*2)]} ${t.subjects[Math.floor(Math.random()*2)]} ${t.actions[Math.floor(Math.random()*2)]}`;
  
  if (state.timeLeft < 60) addLog(`Cooldown: ${state.totalWait}s | Next: ${state.activeTheme}`);
  sync();
}

function startTick() {
  if (tickInterval) clearInterval(tickInterval);
  tickInterval = setInterval(() => {
    if (state.isRunning && !state.isPaused) {
      state.runtime++;
      if (state.timeLeft > 0) {
        state.timeLeft--;
        if (state.timeLeft % state.jitterFreq === 0 && state.bingTabId) {
          chrome.tabs.sendMessage(state.bingTabId, { action: "JITTER" }).catch(() => {});
        }
        if (state.timeLeft === 5 && !state.isTypingStarted && state.bingTabId) {
          state.isTypingStarted = true;
          chrome.tabs.sendMessage(state.bingTabId, { action: "TYPE", term: state.pendingTerm }).catch(() => {});
        }
        if (state.timeLeft <= 0) {
          state.currentSearch++;
          state.batchCounter++;
          if (state.bingTabId) chrome.tabs.sendMessage(state.bingTabId, { action: "SEARCH" }).catch(() => {});
          if (state.currentSearch >= state.totalSearches) stopAutomation();
          else resetTimer();
        }
      }
    }
    sync();
  }, 1000);
}

function sync() { 
  if (!chrome.runtime?.id) return;
  chrome.runtime.sendMessage({ type: "SYNC", state: state }).catch(() => {}); 
  if (state.bingTabId) { chrome.tabs.sendMessage(state.bingTabId, { type: "SYNC", state: state }).catch(() => {}); }
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === "START") {
    state.isRunning = true; state.isPaused = false; state.currentSearch = 0; state.runtime = 0; state.logs = []; state.batchCounter = 0;
    state.targetBatchSize = Math.floor(Math.random() * 2) + 2; // Initial random batch size
    handlePowerState();
    addLog(`Protocol Active. Initial Batch: ${state.targetBatchSize}`);
    startTick();
    chrome.tabs.create({ url: "https://www.bing.com/" }, (tab) => { state.bingTabId = tab.id; });
  } 
  else if (msg.action === "STOP") stopAutomation();
  else if (msg.action === "PAUSE") { state.isPaused = true; addLog("Engine Paused."); sync(); }
  else if (msg.action === "RESUME") { state.isPaused = false; addLog("Engine Resumed."); sync(); }
  else if (msg.action === "UPDATE_STATE") { 
    Object.assign(state, msg.data); 
    if (msg.data.hasOwnProperty('isRunning') || msg.data.hasOwnProperty('isKeepAwake')) handlePowerState();
    if (msg.data.hasOwnProperty('isMobile')) updateMobileHeaders();
    sync(); 
  }
  else if (msg.action === "GET_STATE") sendResponse(state);
  else if (msg.action === "CONTENT_READY") resetTimer();
});