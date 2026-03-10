/**
 * Rewards Pro: Elite v4 - Master Background Logic
 * FULL-LENGTH: Natural Language Engine, Strict Gatekeeper, and Jitter
 */

let tickInterval = null; 
let safetyObserver = null;
let missionStartTime = null;

// STARTUP CLEANUP: Kills existing Bing tabs instantly on extension reload.
chrome.tabs.query({ url: "*://*.bing.com/*" }, function(tabs) {
  for (let i = 0; i < tabs.length; i++) {
    chrome.tabs.remove(tabs[i].id).catch(function() {
        // Tab already handled or gone
    });
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
  logs: [] 
};

// --- EXPANDED NATURAL LANGUAGE DICTIONARY ---
const starters = [
  "What is the", "How does", "Why is", "Effects of", "Can", "Future of", 
  "Understanding", "History of", "Definition of", "Review of", "Guide to", 
  "Simple explanation of", "Common issues with", "Best practices for"
];

const subjects = [
  "quantum", "solar", "marine", "stellar", "thermal", "arctic", "kinetic", 
  "organic", "binary", "lunar", "atomic", "global", "hidden", "ancient", 
  "modern", "future", "digital", "neural", "genetic", "tectonic", 
  "synthetic", "vector", "legacy", "matrix", "nexus", "orbital", "carbon", 
  "silicon", "atomic", "molecular", "atmospheric", "volcanic", "cosmic", 
  "gravity", "entropy", "nebula", "protocol", "encrypted", "optical"
];

const actions = [
  "energy", "gravity", "evolution", "stability", "frequency", "patterns", 
  "dynamics", "logic", "signals", "cycles", "growth", "fusion", "entropy", 
  "motion", "balance", "tides", "currents", "velocity", "density", "impact", 
  "logic", "automation", "efficiency", "structure", "feedback", "vibration", 
  "resistance", "conduction", "transmission", "oscillation", "expansion"
];

const contexts = [
  "in space", "on earth", "explained", "vs reality", "benefits", 
  "for beginners", "today", "effects", "discovery", "history", "future use", 
  "research", "science", "meaning", "definition", "limitations", "risks", 
  "advantages", "in technology", "for students", "worldwide", "locally"
];

function generateHumanQuery() {
  const start = starters[Math.floor(Math.random() * starters.length)];
  const sub = subjects[Math.floor(Math.random() * subjects.length)];
  const act = actions[Math.floor(Math.random() * actions.length)];
  const ctx = contexts[Math.floor(Math.random() * contexts.length)];
  
  // High-fidelity natural language construction
  const query = `${start} ${sub} ${act} ${ctx}?`;
  return query;
}

function formatRuntime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return [h, m, s].map(v => v < 10 ? "0" + v : v).join(":");
}

function addLog(message) {
  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  state.logs.unshift(`[${time}] ${message}`);
  if (state.logs.length > 25) {
      state.logs.pop();
  }
}

function generateFinalReport() {
  const avgDelay = state.currentSearch > 0 ? (state.runtime / state.currentSearch).toFixed(1) : 0;
  addLog("--- MISSION STATS ---");
  addLog(`Avg Delay: ${avgDelay}s/search`);
  addLog(`Total Time: ${formatRuntime(state.runtime)}`);
  addLog(`Mission Status: COMPLETED`);
  addLog("---------------------");
}

const MOBILE_UA = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1";

async function updateMobileHeaders(enable) {
  const ruleId = 1;
  const action = enable ? { 
    addRules: [{ 
      id: ruleId, 
      priority: 1, 
      action: { type: "modifyHeaders", requestHeaders: [{ header: "user-agent", operation: "set", value: MOBILE_UA }] }, 
      condition: { urlFilter: "bing.com", resourceTypes: ["main_frame", "sub_frame", "xmlhttprequest"] } 
    }] 
  } : { 
    removeRuleIds: [ruleId] 
  };
  await chrome.declarativeNetRequest.updateSessionRules(action);
}

function resetTimer() {
  // STRICT GATEKEEPER: Stop if target is already met
  if (state.isRunning === false || state.isTimerLocked === true || state.timeLeft > 0 || state.currentSearch >= state.totalSearches) {
    if (state.currentSearch >= state.totalSearches) {
        stopAutomation("Target Goal Reached.");
    }
    return;
  }
  
  state.isTimerLocked = true;
  const maxWait = parseInt(state.minWait) + 25;
  state.totalWait = Math.floor(Math.random() * (maxWait - state.minWait + 1)) + parseInt(state.minWait);
  state.timeLeft = state.totalWait;
  state.isTypingStarted = false;
  state.pendingTerm = generateHumanQuery();
  
  if (safetyObserver) {
      clearTimeout(safetyObserver);
  }
  
  // Prevent rapid multi-triggering during page navigation
  setTimeout(function() {
    state.isTimerLocked = false;
  }, 3000);
}

function stopAutomation(reason) {
  const isGoalMet = state.currentSearch >= state.totalSearches;
  
  if (isGoalMet) {
      generateFinalReport();
      state.isFinished = true; // Sets flag for popup overlay
  } else {
      addLog(`MISSION HALTED: ${reason || "User Command"}`);
  }
  
  state.isRunning = false; 
  state.isPaused = false; 
  state.timeLeft = 0;
  
  if (tickInterval) {
      clearInterval(tickInterval);
  }
  if (safetyObserver) {
      clearTimeout(safetyObserver);
  }
  tickInterval = null;
  
  updateMobileHeaders(false);
  
  if (state.bingTabId) {
    chrome.tabs.remove(state.bingTabId).catch(function() {});
    state.bingTabId = null;
  }

  // PASSIVE NOTIFICATION
  chrome.notifications.create({
    type: 'basic',
    iconUrl: '/Icon/Icon.png',
    title: 'Rewards Pro: Elite',
    message: isGoalMet ? "Mission Complete! Your target search goal has been reached." : (reason || "Automation session stopped."),
    priority: 1
  }).catch(function() {});
  
  chrome.runtime.sendMessage({ type: "SYNC", state: state }).catch(function() {});
}

function startSearchSequence(isInitial) {
  if (state.isRunning === false || state.isPaused === true) {
      return;
  }
  
  if (state.currentSearch >= state.totalSearches) {
    stopAutomation("Mission Complete!");
    return;
  }
  
  state.isContentReady = false; 
  state.isTypingStarted = false;
  state.pendingTerm = generateHumanQuery();
  
  if (isInitial === true || state.bingTabId === null) {
    chrome.tabs.create({ url: "https://www.bing.com/", active: true }, function(tab) { 
      state.bingTabId = tab.id; 
    });
  }
}

function startTick() {
  if (tickInterval) {
      clearInterval(tickInterval);
  }
  
  tickInterval = setInterval(function() {
    if (state.isRunning === true && state.isPaused === false) {
      state.runtime++; 

      if (state.timeLeft > 0) {
        state.timeLeft--;
        
        // Human Jitter simulation trigger
        if (state.timeLeft % 7 === 0 && state.bingTabId) {
          chrome.tabs.sendMessage(state.bingTabId, { action: "HUMAN_JITTER" }).catch(function() {});
        }

        // Typing simulation trigger (5s mark)
        if (state.timeLeft === 5 && state.isTypingStarted === false && state.bingTabId !== null) {
          state.isTypingStarted = true;
          addLog(`Formulating: "${state.pendingTerm}"`);
          chrome.tabs.sendMessage(state.bingTabId, { action: "TYPE_WITH_FOCUS", term: state.pendingTerm }).catch(function() {
            state.isTypingStarted = false;
          });
        }
        
        // Search execution at zero
        if (state.timeLeft <= 0) {
          if (state.bingTabId !== null && state.isContentReady === true) {
            state.currentSearch++;
            chrome.tabs.sendMessage(state.bingTabId, { action: "EXECUTE_SEARCH" }).catch(function() {});
            
            if (safetyObserver) {
                clearTimeout(safetyObserver);
            }
            
            // GATEKEEPER: Check immediately after execution to prevent overrun
            if (state.currentSearch >= state.totalSearches) {
                setTimeout(function() { stopAutomation("Target Reached!"); }, 2500);
            } else {
                safetyObserver = setTimeout(function() {
                  if (state.timeLeft <= 0 && state.isRunning === true) {
                      resetTimer();
                  }
                }, 10000);
            }
          } else {
            startSearchSequence(false);
          }
        }
      }
    }
    
    // UI Heartbeat Sync
    chrome.runtime.sendMessage({ type: "SYNC", state: state }).catch(function() {});
    if (state.bingTabId && state.isContentReady) {
      chrome.tabs.sendMessage(state.bingTabId, { type: "SYNC", state: state }).catch(function() {});
    }
  }, 1000);
}

chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
  if (msg.action === "START") {
    state.isRunning = true; 
    state.isPaused = false; 
    state.isFinished = false; 
    state.currentSearch = 0; 
    state.runtime = 0; 
    state.logs = [];
    addLog("Elite Engine Online.");
    startTick();
    updateMobileHeaders(state.isMobile).then(function() { 
        startSearchSequence(true); 
    });
  } else if (msg.action === "STOP") {
    stopAutomation("Manual Stop.");
  } else if (msg.action === "PAUSE") {
    state.isPaused = true;
    addLog("Mission Paused.");
  } else if (msg.action === "RESUME") {
    state.isPaused = false;
    addLog("Mission Resumed.");
  } else if (msg.action === "DISMISS_OVERLAY") {
    state.isFinished = false;
  } else if (msg.action === "CONTENT_READY") {
    state.isContentReady = true;
    if (state.timeLeft <= 0 && state.currentSearch < state.totalSearches) {
        resetTimer();
    }
  } else if (msg.action === "TOGGLE_MOBILE") {
    state.isMobile = msg.value;
    state.totalSearches = msg.value ? 20 : 30;
    addLog(`Mode: ${msg.value ? "Mobile" : "PC"}`);
  } else if (msg.action === "UPDATE_WAIT") {
    state.minWait = msg.value;
  } else if (msg.action === "TOGGLE_STEALTH") {
    state.isStealth = msg.value;
  } else if (msg.action === "GET_STATE") {
    sendResponse(state);
  }
});

chrome.tabs.onRemoved.addListener(function(tabId) { 
    if (tabId === state.bingTabId) {
        stopAutomation("Automated tab closed."); 
    }
});