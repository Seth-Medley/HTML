/**
 * Rewards Pro: Elite v4.4.0 - Master Background Logic
 * Restored: Startup cleanup and full theme dictionary.
 */

let tickInterval = null; 
let state = {
  isRunning: false, isPaused: false, isMobile: false, isStealth: false,
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

function initialize() {
  chrome.tabs.query({ url: "*://*.bing.com/*" }, function(tabs) {
    if (tabs) {
      for (let i = 0; i < tabs.length; i++) { chrome.tabs.remove(tabs[i].id).catch(() => {}); }
    }
  });
  updateMobileHeaders();
}

try { initialize(); } catch (e) { console.warn("Init cleanup suppressed."); }

const researchThemes = {
  "Astronomy": { starters: ["Distance to", "History of"], subjects: ["nebula", "black hole"], actions: ["rotation", "orbit"], contexts: ["in space", "explained"] },
  "Technology": { starters: ["Future of", "Guide to"], subjects: ["neural network", "blockchain"], actions: ["logic", "security"], contexts: ["today", "for developers"] },
  "Nature": { starters: ["Evolution of", "Patterns in"], subjects: ["ecosystem", "glacier"], actions: ["cycles", "stability"], contexts: ["globally", "locally"] },
  "Cinema & Arts": { starters: ["Review of", "Influence of"], subjects: ["sound design", "cinematography"], actions: ["evolution", "composition"], contexts: ["worldwide", "locally"] }
};

function addLog(msg) {
  const time = new Date().toLocaleTimeString([], { hour12: false });
  state.logs.unshift(`[${time}] ${msg}`);
  if (state.logs.length > 25) state.logs.pop();
  sync();
}

function stopAutomation() {
  state.isRunning = false; state.isPaused = false;
  if (tickInterval) clearInterval(tickInterval);
  if (state.bingTabId) { chrome.tabs.remove(state.bingTabId).catch(() => {}); state.bingTabId = null; }
  addLog("Mission Ended.");
}

function resetTimer() {
  if (!state.isRunning || state.currentSearch >= state.totalSearches) return;
  const range = parseInt(state.maxWait) - parseInt(state.minWait) + 1;
  state.totalWait = Math.floor(Math.random() * range) + parseInt(state.minWait);
  state.timeLeft = state.totalWait;
  state.isTypingStarted = false;
  const themes = Object.keys(researchThemes);
  state.activeTheme = themes[Math.floor(Math.random() * themes.length)];
  const t = researchThemes[state.activeTheme];
  state.pendingTerm = `${t.starters[Math.floor(Math.random()*2)]} ${t.subjects[Math.floor(Math.random()*2)]} ${t.actions[Math.floor(Math.random()*2)]}`;
  addLog(`Cooldown: ${state.totalWait}s | Theme: ${state.activeTheme}`);
  sync();
}

function startTick() {
  if (tickInterval) clearInterval(tickInterval);
  tickInterval = setInterval(() => {
    if (state.isRunning && !state.isPaused) {
      state.runtime++;
      if (state.timeLeft > 0) {
        state.timeLeft--;
        if (state.timeLeft % state.jitterFreq === 0 && state.bingTabId) { chrome.tabs.sendMessage(state.bingTabId, { action: "JITTER" }).catch(() => {}); }
        if (state.timeLeft === 5 && !state.isTypingStarted && state.bingTabId) {
          state.isTypingStarted = true;
          chrome.tabs.sendMessage(state.bingTabId, { action: "TYPE", term: state.pendingTerm }).catch(() => {});
        }
        if (state.timeLeft <= 0) {
          state.currentSearch++;
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
    state.isRunning = true; state.isPaused = false; state.currentSearch = 0; state.runtime = 0; state.logs = [];
    addLog("Protocol Initiated.");
    startTick();
    chrome.tabs.create({ url: "https://www.bing.com/" }, (tab) => { state.bingTabId = tab.id; });
  } 
  else if (msg.action === "STOP") stopAutomation();
  else if (msg.action === "PAUSE") { state.isPaused = true; addLog("Engine Paused."); sync(); }
  else if (msg.action === "RESUME") { state.isPaused = false; addLog("Engine Resumed."); sync(); }
  else if (msg.action === "UPDATE_STATE") { 
    Object.assign(state, msg.data); 
    if (msg.data.hasOwnProperty('isMobile')) updateMobileHeaders();
    sync(); 
  }
  else if (msg.action === "GET_STATE") sendResponse(state);
  else if (msg.action === "CONTENT_READY") resetTimer();
});