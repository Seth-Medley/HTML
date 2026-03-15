/**
 * Rewards Pro: Elite v4.3 - Master Background Logic
 * FIX: DeclarativeNetRequest for Mobile Mode & SW Stability
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

// --- MOBILE SPOOFING LOGIC (DNR) ---
const MOBILE_UA = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1";

async function updateMobileHeaders() {
  if (!chrome.declarativeNetRequest) return;

  // Clear existing rules
  const oldRules = await chrome.declarativeNetRequest.getDynamicRules();
  const oldRuleIds = oldRules.map(rule => rule.id);
  
  let newRules = [];
  if (state.isMobile) {
    newRules.push({
      id: 1,
      priority: 1,
      action: {
        type: "modifyHeaders",
        requestHeaders: [{ header: "user-agent", operation: "set", value: MOBILE_UA }]
      },
      condition: { urlFilter: "||bing.com", resourceTypes: ["main_frame", "sub_frame"] }
    });
  }

  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: oldRuleIds,
    addRules: newRules
  });
}

// --- INITIALIZATION ---
function initialize() {
  chrome.tabs.query({ url: "*://*.bing.com/*" }, function(tabs) {
    if (chrome.runtime.lastError) return;
    if (tabs) {
      for (let i = 0; i < tabs.length; i++) {
        chrome.tabs.remove(tabs[i].id).catch(() => {});
      }
    }
  });
  updateMobileHeaders(); // Set initial UA state
}

// Run initialization safely
try {
  initialize();
} catch (e) {
  console.error("Initialization failed, but SW is alive.", e);
}

const researchThemes = {
  "Astronomy": { starters: ["Distance to", "History of"], subjects: ["nebula", "black hole"], actions: ["rotation", "orbit"], contexts: ["in space", "explained"] },
  "Technology": { starters: ["Future of", "Guide to"], subjects: ["neural network", "blockchain"], actions: ["logic", "security"], contexts: ["in modern era", "for developers"] },
  "Nature": { starters: ["Evolution of", "Patterns in"], subjects: ["ecosystem", "glacier"], actions: ["cycles", "stability"], contexts: ["on earth", "globally"] },
  "Cinema & Arts": { starters: ["Review of", "Influence of"], subjects: ["sound design", "cinematography"], actions: ["evolution", "composition"], contexts: ["in Hollywood", "worldwide"] }
};

function selectMissionTheme() {
  const keys = Object.keys(researchThemes);
  state.activeTheme = keys[Math.floor(Math.random() * keys.length)];
}

function generateThemedQuery() {
  const theme = researchThemes[state.activeTheme] || researchThemes["Technology"];
  const start = theme.starters[Math.floor(Math.random() * theme.starters.length)];
  const sub = theme.subjects[Math.floor(Math.random() * theme.subjects.length)];
  const act = theme.actions[Math.floor(Math.random() * theme.actions.length)];
  const ctx = theme.contexts[Math.floor(Math.random() * theme.contexts.length)];
  return `${start} ${sub} ${act} ${ctx}?`;
}

function addLog(message) {
  const time = new Date().toLocaleTimeString([], { hour12: false });
  state.logs.unshift(`[${time}] ${message}`);
  if (state.logs.length > 25) state.logs.pop();
}

function stopAutomation() {
  state.isRunning = false; state.isPaused = false; state.timeLeft = 0;
  if (tickInterval) clearInterval(tickInterval);
  if (state.bingTabId) { chrome.tabs.remove(state.bingTabId).catch(() => {}); state.bingTabId = null; }
  sync();
}

function resetTimer() {
  if (!state.isRunning || state.currentSearch >= state.totalSearches) return;
  const range = Math.max(1, parseInt(state.maxWait) - parseInt(state.minWait) + 1);
  state.totalWait = Math.floor(Math.random() * range) + parseInt(state.minWait);
  state.timeLeft = state.totalWait;
  state.isTypingStarted = false;
  state.pendingTerm = generateThemedQuery();
  sync();
}

function startTick() {
  if (tickInterval) clearInterval(tickInterval);
  tickInterval = setInterval(function() {
    if (state.isRunning && !state.isPaused) {
      state.runtime++;
      if (state.timeLeft > 0) {
        state.timeLeft--;
        if (state.timeLeft % state.jitterFreq === 0 && state.bingTabId) {
          chrome.tabs.sendMessage(state.bingTabId, { action: "HUMAN_JITTER" }).catch(() => {});
        }
        
        const trigger = Math.floor(Math.random() * 4) + 4; 
        if (state.timeLeft === trigger && state.isTypingStarted === false && state.bingTabId !== null) {
          state.isTypingStarted = true;
          chrome.tabs.sendMessage(state.bingTabId, { action: "TYPE_WITH_FOCUS", term: state.pendingTerm }).catch(() => {
            state.isTypingStarted = false;
          });
        }
        
        if (state.timeLeft <= 0) {
          state.currentSearch++;
          if (state.bingTabId) chrome.tabs.sendMessage(state.bingTabId, { action: "EXECUTE_SEARCH" }).catch(() => {});
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
  if (state.bingTabId) {
    chrome.tabs.sendMessage(state.bingTabId, { type: "SYNC", state: state }).catch(() => {});
  }
}

chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
  if (msg.action === "START") {
    state.isRunning = true; state.isPaused = false; state.currentSearch = 0; state.runtime = 0; state.logs = [];
    selectMissionTheme();
    addLog(`Engine v4.3 Active. Theme: ${state.activeTheme}`);
    startTick();
    chrome.tabs.create({ url: "https://www.bing.com/" }, function(tab) { state.bingTabId = tab.id; });
  } 
  else if (msg.action === "STOP") stopAutomation();
  else if (msg.action === "PAUSE") { state.isPaused = true; sync(); }
  else if (msg.action === "RESUME") { state.isPaused = false; sync(); }
  else if (msg.action === "UPDATE_STATE") { 
    Object.assign(state, msg.data); 
    if (msg.data.hasOwnProperty('isMobile')) updateMobileHeaders();
    sync(); 
  }
  else if (msg.action === "GET_STATE") { sendResponse(state); }
  else if (msg.action === "CONTENT_READY") { state.isContentReady = true; resetTimer(); }
  else if (msg.action === "DISMISS_OVERLAY") { state.isFinished = false; sync(); }
});