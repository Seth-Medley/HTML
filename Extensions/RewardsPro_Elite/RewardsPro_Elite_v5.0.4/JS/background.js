/**
 * Rewards Pro: Elite v5.0.7 - Master Background Logic
 * FULL LENGTH CODE - NO CONDENSING - NO SHORTHAND
 * BUILD AJ: Telemetry reset logic on debrief dismissal.
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
  isScheduled: false,
  scheduledTime: "06:00",
  themeMode: "system", 
  batchCounter: 0,
  targetBatchSize: 6,
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
 * KEYWORD LIBRARY
 * A diverse collection of terms to simulate human search variety.
 */
const keywordBank = [
  "Tennessee weather forecast", "ETSU campus map", "GitHub trending repositories",
  "Marvel Cinematic Universe timeline", "Thor Love and Thunder review", "Fortnite map updates",
  "CSS Flexbox vs Grid guide", "Samsung S25 Ultra specs", "DoorDash driver earnings 2026",
  "Pigeon Forge attractions", "Smoky Mountains hiking trails", "MoCA adapter setup guide",
  "Roblox Studio scripting tutorials", "HTML5 canvas animation", "JavaScript async await",
  "Best barbecue in Memphis", "Nashville Predators schedule", "Windows 11 vs Windows 12 features",
  "Android 16 release date", "Lightweight HTML editors", "Stack Overflow top questions",
  "FreeCodeCamp certification paths", "Halogen work light maintenance", "TP-Link Archer router settings",
  "Johnson City TN news", "Freedom Hall events schedule", "Neon Trees concert tour",
  "Beach resort lazy river", "Sunshere Knoxville history", "Escape Game Pigeon Forge",
  "Matte clay vs styling paste", "New student orientation ETSU", "Masonic lodge history Tennessee",
  "Best seafood restaurants East Tennessee", "Boston butt slow cooker recipes", "Fortnite pro building tips",
  "React vs Vue in 2026", "TypeScript best practices", "Modern web design trends",
  "Samsung One UI 9 features", "Galaxy Watch Ultra review", "Mobile app development 2026"
];

const DEFAULT_HARDWARE = {
  isMobile: false,
  isStealth: false,
  isCooldownMode: true,
  isKeepAwake: true,
  isScheduled: false,
  scheduledTime: "06:00",
  themeMode: "system",
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
  logMono: false
};

/**
 * UTILITY: Badge Telemetry
 */
function updateBadge() {
  if (!state.isRunning) {
    chrome.action.setBadgeText({
      text: ""
    });
    return;
  }
  
  if (state.currentSearch >= state.totalSearches && !state.isDiagnostic) {
    chrome.action.setBadgeText({
      text: "DONE"
    });
    chrome.action.setBadgeBackgroundColor({
      color: "#3fb950"
    });
  } else if (state.isPaused) {
    chrome.action.setBadgeText({
      text: "II"
    });
    chrome.action.setBadgeBackgroundColor({
      color: "#d29922"
    });
  } else {
    const badgeText = state.isDiagnostic ? "TEST" : state.currentSearch.toString();
    chrome.action.setBadgeText({
      text: badgeText
    });
    chrome.action.setBadgeBackgroundColor({
      color: state.accentColor
    });
  }
}

/**
 * UTILITY: Global Sync
 */
function sync() { 
  if (!chrome.runtime?.id) {
    return;
  }
  
  chrome.storage.local.set({
    state: state
  });
  
  chrome.runtime.sendMessage({
    type: "SYNC",
    state: state
  }).catch(function() {
    // Popup context closed.
  }); 
  
  if (state.bingTabId !== null && state.bingTabId !== undefined) {
    const validatedTabId = parseInt(state.bingTabId, 10);
    
    if (Number.isInteger(validatedTabId) && validatedTabId > 0) {
      setTimeout(function() {
        chrome.tabs.sendMessage(validatedTabId, {
          type: "SYNC",
          state: state
        }, function() {
          if (chrome.runtime.lastError) {
            // Handled silent fail.
          }
        });
      }, 75);
    }
  }
}

/**
 * LOGIC: Telemetry Logger
 */
function addLog(msg) {
  const timestamp = new Date().toLocaleTimeString([], {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
  
  state.logs.unshift(`[${timestamp}] ${msg}`);
  
  if (state.logs.length > 50) {
    state.logs.pop();
  }
  
  console.log(`[ELITE LOG]: ${msg}`);
  sync();
}

/**
 * NOTIFICATION: Hardware Signal
 */
function triggerCompletionNotification(isManual = false) {
  if (!chrome.notifications) {
    addLog("NOTIF ERROR: API locked.");
    return;
  }

  const titleText = isManual ? "HARDWARE TEST SIGNAL" : "MISSION SECURED";
  const bodyText = isManual ? "The notification engine is operational." : `Automation finalized. ${state.currentSearch} searches logged.`;
  
  const options = {
    type: "basic",
    title: titleText,
    message: bodyText + " Click to view report.",
    iconUrl: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
    priority: 2
  };

  chrome.notifications.create("SIGNAL_" + Date.now(), options, function(id) {
    if (chrome.runtime.lastError) {
      addLog("NOTIF FAIL: OS block.");
    } else {
      addLog("NOTIF SIGNAL: Toast deployed.");
    }
  });
}

chrome.notifications.onClicked.addListener(function() {
  chrome.tabs.create({
    url: chrome.runtime.getURL("popup.html")
  });
});

/**
 * TAB CLEANUP: Global Sweep
 */
async function cleanupBingTabs() {
  const query = {
    url: "*://*.bing.com/*"
  };
  
  const tabs = await chrome.tabs.query(query);
  
  for (const tab of tabs) {
    chrome.tabs.remove(tab.id).catch(function() {});
  }
  
  if (tabs.length > 0) {
    addLog(`CLEANUP: Decommissioned ${tabs.length} orphan instances.`);
  }
}

chrome.tabs.onRemoved.addListener(function(tabId) {
  if (state.isRunning && tabId === state.bingTabId) {
    addLog("SAFETY: Mission tab closed. Standby engaged.");
    stopAutomation(false);
  }
});

/**
 * CHRONOS: Precision Scheduling
 */
function getNextAlarmTime(timeStr) {
  const now = new Date();
  const [hrs, mins] = timeStr.split(':').map(Number);
  let scheduleDate = new Date();
  scheduleDate.setHours(hrs, mins, 0, 0);
  
  if (scheduleDate.getTime() <= now.getTime() + 60000) {
    scheduleDate.setDate(scheduleDate.getDate() + 1);
  }
  return scheduleDate.getTime();
}

async function updateChronosAlarm() {
  if (!chrome.alarms) {
    return;
  }
  
  await chrome.alarms.clear("CHRONOS_LAUNCH");
  
  if (state.isScheduled && state.scheduledTime) {
    const when = getNextAlarmTime(state.scheduledTime);
    chrome.alarms.create("CHRONOS_LAUNCH", {
      when: when
    });
    addLog(`CHRONOS: Armed for ${new Date(when).toLocaleTimeString()}`);
  }
}

chrome.alarms.onAlarm.addListener(function(alarm) {
  if (alarm.name === "CHRONOS_LAUNCH") {
    chrome.storage.local.get("state", function(data) {
      if (data.state && data.state.isScheduled) {
        initiateMission();
      }
    });
  }
});

/**
 * ENGINE: Timer Controller
 */
function resetTimer() {
  if (!state.isRunning || state.currentSearch >= state.totalSearches) {
    return;
  }
  
  if (state.isDiagnostic) {
    state.totalWait = 10;
  } else if (state.isCooldownMode && state.batchCounter >= state.targetBatchSize) {
    state.batchCounter = 0;
    state.targetBatchSize = Math.floor(Math.random() * 6) + 5;
    state.totalWait = 60;
    addLog("SECURITY: Deep Sleep protocol engaged.");
  } else {
    const waitRange = parseInt(state.maxWait) - parseInt(state.minWait) + 1;
    state.totalWait = Math.floor(Math.random() * waitRange) + parseInt(state.minWait);
  }
  
  state.timeLeft = state.totalWait;
  state.isTypingStarted = false;
  
  const randomIndex = Math.floor(Math.random() * keywordBank.length);
  state.pendingTerm = state.isDiagnostic ? "Diagnostic Sweep" : keywordBank[randomIndex];
  
  sync();
}

/**
 * ENGINE: Master Engagement
 */
function initiateMission() {
  state.isRunning = true;
  state.isPaused = false;
  state.isDiagnostic = false;
  state.isDebriefViewed = false;
  state.currentSearch = 0;
  state.runtime = 0;
  state.batchCounter = 0;
  
  addLog("Hardware Engaged.");
  
  resetTimer();
  startTick();
  
  chrome.tabs.create({
    url: "https://www.bing.com/"
  }, function(tab) {
    state.bingTabId = tab.id;
    sync();
  });
}

/**
 * ENGINE: Master Heartbeat Loop
 */
function startTick() {
  if (tickInterval) {
    clearInterval(tickInterval);
  }
  
  tickInterval = setInterval(function() {
    if (state.isRunning && !state.isPaused && state.currentSearch < state.totalSearches) {
      state.runtime = state.runtime + 1;
      
      if (state.timeLeft > 0) {
        state.timeLeft = state.timeLeft - 1;
        
        if (state.timeLeft % state.jitterFreq === 0 && state.bingTabId) {
          chrome.tabs.sendMessage(parseInt(state.bingTabId, 10), {
            action: "JITTER"
          }, function() { if (chrome.runtime.lastError) {} });
        }
        
        if (state.timeLeft === 5 && !state.isTypingStarted && state.bingTabId) {
          chrome.tabs.sendMessage(parseInt(state.bingTabId, 10), {
            action: "PING"
          }, function(response) {
            if (chrome.runtime.lastError || !response) {
              state.timeLeft = state.timeLeft + 1;
              return;
            }
            state.isTypingStarted = true;
            chrome.tabs.sendMessage(parseInt(state.bingTabId, 10), {
              action: "TYPE",
              term: state.pendingTerm
            }, function() { if (chrome.runtime.lastError) {} });
          });
        }
      }

      if (state.timeLeft <= 0) {
        if (!state.bingTabId) {
          return;
        }
        
        chrome.tabs.sendMessage(parseInt(state.bingTabId, 10), {
          action: "PING"
        }, function(response) {
          if (chrome.runtime.lastError || !response) {
            return;
          }

          state.currentSearch = state.currentSearch + 1;
          state.batchCounter = state.batchCounter + 1;
          
          addLog(`Action logged: ${state.currentSearch}/${state.totalSearches}`);
          
          chrome.tabs.sendMessage(parseInt(state.bingTabId, 10), {
            action: "SEARCH"
          }, function() { if (chrome.runtime.lastError) {} });

          if (state.currentSearch >= state.totalSearches) {
            stopAutomation(true);
          } else {
            resetTimer();
          }
        });
      }
    }
    sync();
    updateBadge();
  }, 1000);
}

/**
 * ENGINE: Decommissioning
 */
function stopAutomation(isComp = false) {
  if (state.isDiagnostic) {
    state.isRunning = false;
    state.isDiagnostic = false;
    state.currentSearch = 0;
    state.isPaused = false;
    
    if (tickInterval) {
      clearInterval(tickInterval);
    }
    
    triggerCompletionNotification(true);
    
    setTimeout(function() {
      if (state.bingTabId) {
        chrome.tabs.remove(parseInt(state.bingTabId, 10)).catch(function() {});
      }
      state.bingTabId = null;
      sync();
    }, 2000);
    
    addLog("TEST COMPLETE.");
    updateBadge();
    return;
  }

  state.isRunning = isComp;
  state.isPaused = false;
  
  if (tickInterval && !isComp) {
    clearInterval(tickInterval);
    state.isRunning = false;
  }
  
  if (isComp) {
    addLog("MISSION SECURED.");
    triggerCompletionNotification(false);
    
    setTimeout(function() {
      if (state.bingTabId) {
        chrome.tabs.remove(parseInt(state.bingTabId, 10)).catch(function() {});
      }
      state.bingTabId = null;
      sync();
    }, 3000);

  } else {
    if (state.bingTabId) {
      chrome.tabs.remove(parseInt(state.bingTabId, 10)).catch(function() {});
    }
    state.bingTabId = null;
    addLog("Manual Termination.");
    sync();
  }
  
  updateBadge();
}

/**
 * ENGINE: Relaunch Helper
 */
function relaunchMission() {
  addLog("CONFIG: Relaunching mission with new settings...");
  
  if (tickInterval) {
    clearInterval(tickInterval);
  }
  
  if (state.bingTabId) {
    chrome.tabs.remove(parseInt(state.bingTabId, 10)).catch(function() {});
  }
  state.bingTabId = null;
  
  setTimeout(function() {
    initiateMission();
  }, 500);
}

/**
 * INTERFACE: Message Router
 */
chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
  if (msg.action === "START") {
    initiateMission();
    sendResponse({ status: "started" });
  } else if (msg.action === "START_DIAGNOSTIC") {
    state.isRunning = true;
    state.isPaused = false;
    state.isDiagnostic = true;
    state.isDebriefViewed = false;
    state.currentSearch = 0;
    state.runtime = 0;
    state.totalSearches = 1;
    addLog("TEST INITIATED.");
    startTick();
    chrome.tabs.create({
      url: "https://www.bing.com/"
    }, function(tab) {
      state.bingTabId = tab.id;
      sync();
    });
    sendResponse({ status: "diagnostic_started" });
  } else if (msg.action === "STOP") {
    stopAutomation(false);
    sendResponse({ status: "stopped" });
  } else if (msg.action === "PAUSE") {
    state.isPaused = true;
    addLog("Engine Standby.");
    sync();
    sendResponse({ status: "paused" });
  } else if (msg.action === "RESUME") {
    state.isPaused = false;
    addLog("Engine Resumed.");
    sync();
    sendResponse({ status: "resumed" });
  } else if (msg.action === "FACTORY_RESET") {
    state.logs = [];
    addLog("Logs Purged.");
    sync();
    sendResponse({ status: "reset_logs" });
  } else if (msg.action === "RESET_SETTINGS") {
    Object.assign(state, DEFAULT_HARDWARE);
    addLog("HARDWARE RESET.");
    sync();
    sendResponse({ status: "reset_settings" });
  } else if (msg.action === "DISMISS_DEBRIEF") {
    // FIX: Resets the dashboard telemetry to 0 immediately upon dismissal.
    state.isRunning = false;
    state.isDebriefViewed = true;
    state.currentSearch = 0;
    state.runtime = 0;
    sync();
    sendResponse({ status: "dismissed" });
  } else if (msg.action === "SAVE_SCHEDULE") {
    state.isScheduled = msg.isScheduled;
    state.scheduledTime = msg.scheduledTime;
    updateChronosAlarm();
    sendResponse({ status: "scheduled" });
  } else if (msg.action === "TEST_NOTIFICATION") {
    triggerCompletionNotification(true);
    sendResponse({ status: "notified" });
  } else if (msg.action === "UPDATE_STATE") {
    if (state.isRunning) {
      const goalChanged = msg.data.hasOwnProperty('totalSearches') && msg.data.totalSearches !== state.totalSearches;
      const mobileChanged = msg.data.hasOwnProperty('isMobile') && msg.data.isMobile !== state.isMobile;
      
      if (goalChanged || mobileChanged) {
        Object.assign(state, msg.data);
        relaunchMission();
        sendResponse({ status: "relaunched" });
        return false;
      }
    }
    
    Object.assign(state, msg.data);
    sync();
    sendResponse({ status: "updated" });
  } else if (msg.action === "GET_STATE") {
    sendResponse(state);
  } else {
    sendResponse({ status: "unknown" });
  }
  
  return false; 
});

/**
 * INITIALIZATION: Boot Sequence
 */
async function runInit() {
  await cleanupBingTabs();
  
  const stored = await chrome.storage.local.get("state");
  if (stored.state) {
    Object.assign(state, stored.state);
    state.isRunning = false;
    state.isPaused = false;
    state.bingTabId = null; 
  }
  
  updateBadge();
  updateChronosAlarm();
  sync();
  
  addLog("Hardware Reboot Sequence Complete.");
}

runInit();