/**
 * Rewards Pro: Elite v4.2 - Master Background Logic
 * FULL-LENGTH: Topic Affinity (4 Themes), NPA v2 Timing, and HUD Sync
 */

let tickInterval = null; 
let safetyObserver = null;

chrome.tabs.query({ url: "*://*.bing.com/*" }, function(tabs) {
  for (let i = 0; i < tabs.length; i++) {
    chrome.tabs.remove(tabs[i].id).catch(function() {});
  }
});

let state = {
  isRunning: false,
  isPaused: false,
  isMobile: false,
  isStealth: false,
  isFinished: false,
  currentSearch: 0,
  totalSearches: 30, 
  timeLeft: 0,
  totalWait: 0,
  minWait: 20,
  bingTabId: null,
  isContentReady: false,
  pendingTerm: null,
  isTypingStarted: false,
  isTimerLocked: false,
  runtime: 0,
  logs: [],
  activeTheme: "General"
};

const researchThemes = {
  "Astronomy": {
    starters: ["Discovery of", "Distance to", "History of", "Effects of"],
    subjects: ["nebula", "exoplanet", "quasar", "supernova", "black hole", "galaxy"],
    actions: ["rotation", "orbit", "expansion", "radiation", "magnetic field"],
    contexts: ["in space", "near the sun", "visualized", "vs dark matter"]
  },
  "Technology": {
    starters: ["Future of", "Understanding", "Benefits of", "Risks of"],
    subjects: ["neural network", "blockchain", "encryption", "nanotech", "automation"],
    actions: ["processing", "security", "integration", "efficiency", "data sync"],
    contexts: ["in modern era", "simplified", "for developers", "vs legacy systems"]
  },
  "Nature": {
    starters: ["Evolution of", "Impact of", "Protection of", "Research on"],
    subjects: ["ecosystem", "glacier", "coral reef", "rainforest", "tectonic plate"],
    actions: ["stability", "erosion", "vibration", "cycles", "migration"],
    contexts: ["on earth", "globally", "locally", "for students"]
  },
  "Cinema & Arts": {
    starters: ["History of", "Development of", "Review of", "Influence of"],
    subjects: ["cinematography", "digital editing", "sound design", "visual effects", "script writing"],
    actions: ["evolution", "composition", "logic", "patterns", "oscillation"],
    contexts: ["in Hollywood", "worldwide", "today", "for beginners"]
  }
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
  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  state.logs.unshift(`[${time}] ${message}`);
  if (state.logs.length > 25) state.logs.pop();
}

function stopAutomation(reason) {
  const isGoalMet = state.currentSearch >= state.totalSearches;
  if (isGoalMet) state.isFinished = true;
  else addLog(`MISSION HALTED: ${reason || "User Command"}`);
  state.isRunning = false; state.isPaused = false; state.timeLeft = 0;
  if (tickInterval) clearInterval(tickInterval);
  if (safetyObserver) clearTimeout(safetyObserver);
  if (state.bingTabId) { chrome.tabs.remove(state.bingTabId).catch(function() {}); state.bingTabId = null; }
  chrome.runtime.sendMessage({ type: "SYNC", state: state }).catch(function() {});
}

function resetTimer() {
  if (state.isRunning === false || state.isTimerLocked === true || state.timeLeft > 0 || state.currentSearch >= state.totalSearches) {
    if (state.currentSearch >= state.totalSearches) stopAutomation("Target Goal Reached.");
    return;
  }
  state.isTimerLocked = true;
  state.totalWait = Math.floor(Math.random() * 25) + parseInt(state.minWait);
  state.timeLeft = state.totalWait;
  state.isTypingStarted = false;
  state.pendingTerm = generateThemedQuery();
  if (safetyObserver) clearTimeout(safetyObserver);
  setTimeout(() => { state.isTimerLocked = false; }, 3000);
}

function startTick() {
  if (tickInterval) clearInterval(tickInterval);
  tickInterval = setInterval(function() {
    if (state.isRunning === true && state.isPaused === false) {
      state.runtime++;
      if (state.timeLeft > 0) {
        state.timeLeft--;
        if (state.timeLeft % 7 === 0 && state.bingTabId && state.isContentReady) {
          chrome.tabs.sendMessage(state.bingTabId, { action: "HUMAN_JITTER" }).catch(function() {});
        }
        const trigger = Math.floor(Math.random() * 4) + 4; 
        if (state.timeLeft === trigger && state.isTypingStarted === false && state.bingTabId !== null && state.isContentReady) {
          state.isTypingStarted = true;
          addLog(`Formulating (${state.activeTheme}): "${state.pendingTerm}"`);
          chrome.tabs.sendMessage(state.bingTabId, { action: "TYPE_WITH_FOCUS", term: state.pendingTerm }).catch(function() {
            state.isTypingStarted = false;
          });
        }
        if (state.timeLeft <= 0 && state.isContentReady) {
          state.currentSearch++;
          chrome.tabs.sendMessage(state.bingTabId, { action: "EXECUTE_SEARCH" }).catch(function() {});
          if (state.currentSearch >= state.totalSearches) {
              setTimeout(function() { stopAutomation("Target Reached!"); }, 2500);
          } else {
              safetyObserver = setTimeout(function() { if (state.timeLeft <= 0 && state.isRunning) resetTimer(); }, 10000);
          }
        }
      }
    }
    chrome.runtime.sendMessage({ type: "SYNC", state: state }).catch(function() {});
    if (state.bingTabId && state.isContentReady) {
      chrome.tabs.sendMessage(state.bingTabId, { type: "SYNC", state: state }).catch(function() {});
    }
  }, 1000);
}

chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
  if (msg.action === "START") {
    state.isRunning = true; state.isPaused = false; state.isFinished = false; state.currentSearch = 0; state.runtime = 0; state.logs = [];
    selectMissionTheme();
    addLog(`Elite Engine Online. Theme: ${state.activeTheme}`);
    startTick();
    chrome.tabs.create({ url: "https://www.bing.com/", active: true }, function(tab) { state.bingTabId = tab.id; });
  } else if (msg.action === "STOP") stopAutomation("Manual Stop.");
  else if (msg.action === "PAUSE") state.isPaused = true;
  else if (msg.action === "RESUME") state.isPaused = false;
  else if (msg.action === "CONTENT_READY") { state.isContentReady = true; if (state.timeLeft <= 0) resetTimer(); }
  else if (msg.action === "GET_STATE") sendResponse(state);
  else if (msg.action === "DISMISS_OVERLAY") state.isFinished = false;
  else if (msg.action === "UPDATE_WAIT") state.minWait = msg.value;
  else if (msg.action === "TOGGLE_MOBILE") { state.isMobile = msg.value; state.totalSearches = msg.value ? 20 : 30; }
  else if (msg.action === "TOGGLE_STEALTH") state.isStealth = msg.value;
});