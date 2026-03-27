/**
 * Rewards Pro: Elite v5.0.4 - Master Popup Controller
 * FULL LENGTH CODE - NO CONDENSING - NO SHORTHAND
 * BUILD AG: Explicitly Expanded Hardware Listeners and UI Sync.
 */

let globalHardwareState = null;

/**
 * UI SYNC: Global Hardware State Application
 * Updates every specific label, slider, and progress bar individually.
 */
function updateUI(state) {
  if (!state || !chrome.runtime?.id) {
    return;
  }
  
  globalHardwareState = state; 

  // --- 1. DASHBOARD TELEMETRY ---
  const sessionProgress = document.getElementById('sessionProgress');
  if (sessionProgress) {
    sessionProgress.innerText = state.currentSearch + "/" + state.totalSearches;
  }

  const progressBar = document.getElementById('searchProgressBar');
  if (progressBar) {
    const progressPercentage = (state.currentSearch / state.totalSearches) * 100;
    progressBar.style.width = progressPercentage + "%";
  }

  const runtimeDisplay = document.getElementById('runtimeDisplay');
  if (runtimeDisplay) {
    const hours = Math.floor(state.runtime / 3600).toString().padStart(2, '0');
    const minutes = Math.floor((state.runtime % 3600) / 60).toString().padStart(2, '0');
    const seconds = (state.runtime % 60).toString().padStart(2, '0');
    runtimeDisplay.innerText = hours + ":" + minutes + ":" + seconds;
  }

  // --- 2. ACTION TIMER LOGIC ---
  const timerDisplay = document.getElementById('timerDisplay');
  const timerBar = document.getElementById('timerBarFill');
  if (state.isRunning && !state.isPaused) {
    if (timerDisplay) {
      timerDisplay.innerText = state.timeLeft + "s";
    }
    if (timerBar) {
      const timerPct = (state.totalWait > 0) ? ((state.totalWait - state.timeLeft) / state.totalWait) * 100 : 0;
      timerBar.style.width = timerPct + "%";
    }
  } else { 
    if (timerDisplay) {
      timerDisplay.innerText = "--s";
    }
    if (timerBar) {
      timerBar.style.width = "0%";
    }
  }

  // --- 3. INTERLOCK VISUALS ---
  const idleActions = document.getElementById('idleActions');
  const activeActions = document.getElementById('activeActions');
  const pauseBtn = document.getElementById('pauseBtn');
  const resumeBtn = document.getElementById('resumeBtn');
  
  if (state.isRunning) {
    if (idleActions) idleActions.classList.add('hidden');
    if (activeActions) activeActions.classList.remove('hidden');
    if (pauseBtn) pauseBtn.classList.toggle('hidden', state.isPaused);
    if (resumeBtn) resumeBtn.classList.toggle('hidden', !state.isPaused);
  } else {
    if (idleActions) idleActions.classList.remove('hidden');
    if (activeActions) activeActions.classList.add('hidden');
  }

  // --- 4. ENGINE ROOM: MISSION LOG ---
  const logBox = document.getElementById('missionLog');
  if (logBox && state.logs) {
    logBox.innerHTML = state.logs.map(function(log) {
      return '<div class="log-entry">' + log + '</div>';
    }).join('');
  }

  // --- 5. ENGINE ROOM: MISSION CONTROLS ---
  document.getElementById('mobileToggle').checked = state.isMobile;
  document.getElementById('hudToggle').checked = state.isStealth;
  document.getElementById('cooldownToggle').checked = state.isCooldownMode;
  document.getElementById('awakeToggle').checked = state.isKeepAwake;
  
  const customCount = document.getElementById('customCountInput');
  if (customCount) {
    customCount.value = state.totalSearches;
    customCount.disabled = state.isRunning;
  }

  // --- 6. ENGINE ROOM: CHRONOS SCHEDULING ---
  const schedToggle = document.getElementById('scheduleToggle');
  if (schedToggle) {
    schedToggle.checked = state.isScheduled;
  }
  const schedTime = document.getElementById('scheduleTime');
  if (schedTime) {
    schedTime.value = state.scheduledTime;
    schedTime.disabled = !state.isScheduled;
  }

  // --- 7. ENGINE ROOM: DELAY & JITTER ---
  document.getElementById('minWait').value = state.minWait;
  document.getElementById('minVal').innerText = state.minWait + "s";
  document.getElementById('maxWait').value = state.maxWait;
  document.getElementById('maxVal').innerText = state.maxWait + "s";
  document.getElementById('jitterFreq').value = state.jitterFreq;
  document.getElementById('jitVal').innerText = state.jitterFreq + "s";

  // --- 8. ENGINE ROOM: GHOST PERSONALIZATION ---
  document.getElementById('scanlineToggle').checked = state.showScanlines;
  document.getElementById('accentPicker').value = state.accentColor;
  document.getElementById('themeSelector').value = state.themeMode;
  document.getElementById('skinSelector').value = state.heartbeatSkin;
  
  document.getElementById('opacitySlider').value = state.hudOpacity;
  document.getElementById('opacVal').innerText = state.hudOpacity + "%";
  
  document.getElementById('blurSlider').value = state.hudBlur;
  document.getElementById('blurVal').innerText = state.hudBlur + "px";
  
  document.getElementById('glowSlider').value = state.neonGlow;
  document.getElementById('glowVal').innerText = state.neonGlow + "px";
  
  document.getElementById('radiusSlider').value = state.hudRadius;
  document.getElementById('radVal').innerText = state.hudRadius + "px";
  
  document.getElementById('scaleSlider').value = state.hudScale;
  document.getElementById('scaleVal').innerText = (state.hudScale / 100).toFixed(1) + "x";
  
  document.getElementById('ampSlider').value = state.waveAmp;
  document.getElementById('ampVal').innerText = state.waveAmp;
  
  document.getElementById('speedSlider').value = state.animSpeed;
  document.getElementById('speedVal').innerText = state.animSpeed + "%";
  
  document.getElementById('glitchSlider').value = state.glitchFreq;
  document.getElementById('glitchValBadge').innerText = state.glitchFreq;
}

// --- MISSION CONTROL LISTENERS ---

document.getElementById('startBtn').onclick = function() {
  chrome.runtime.sendMessage({ action: "START" });
};

document.getElementById('stopBtn').onclick = function() {
  chrome.runtime.sendMessage({ action: "STOP" });
};

document.getElementById('pauseBtn').onclick = function() {
  chrome.runtime.sendMessage({ action: "PAUSE" });
};

document.getElementById('resumeBtn').onclick = function() {
  chrome.runtime.sendMessage({ action: "RESUME" });
};

// --- NAVIGATION LISTENERS ---

document.getElementById('openSettingsBtn').onclick = function() {
  document.getElementById('settingsPage').classList.remove('hidden');
};

document.getElementById('backBtn').onclick = function() {
  document.getElementById('settingsPage').classList.add('hidden');
};

document.getElementById('dismissDebriefBtn').onclick = function() {
  document.getElementById('debriefPage').classList.add('hidden');
  chrome.runtime.sendMessage({ action: "DISMISS_DEBRIEF" });
};

// --- SYSTEM MAINTENANCE LISTENERS ---

document.getElementById('testNotifBtn').onclick = function() {
  chrome.runtime.sendMessage({ action: "TEST_NOTIFICATION" });
};

document.getElementById('runDiagnosticBtn').onclick = function() {
  chrome.runtime.sendMessage({ action: "START_DIAGNOSTIC" });
};

document.getElementById('resetSettingsBtn').onclick = function() {
  const confirmReset = confirm("REVERT ALL HARDWARE SETTINGS TO DEFAULTS?");
  if (confirmReset) {
    chrome.runtime.sendMessage({ action: "RESET_SETTINGS" });
  }
};

document.getElementById('resetLogsBtn').onclick = function() {
  const confirmPurge = confirm("PERMANENTLY PURGE TELEMETRY LOGS?");
  if (confirmPurge) {
    chrome.runtime.sendMessage({ action: "FACTORY_RESET" });
  }
};

// --- CONFIGURATION: MISSION CONTROLS ---

document.getElementById('customCountInput').onchange = function(event) {
  const newGoal = parseInt(event.target.value);
  if (newGoal > 0) {
    chrome.runtime.sendMessage({ 
      action: "UPDATE_STATE", 
      data: { totalSearches: newGoal } 
    });
  }
};

document.getElementById('mobileToggle').onchange = function(event) {
  chrome.runtime.sendMessage({ 
    action: "UPDATE_STATE", 
    data: { isMobile: event.target.checked } 
  });
};

document.getElementById('hudToggle').onchange = function(event) {
  chrome.runtime.sendMessage({ 
    action: "UPDATE_STATE", 
    data: { isStealth: event.target.checked } 
  });
};

document.getElementById('cooldownToggle').onchange = function(event) {
  chrome.runtime.sendMessage({ 
    action: "UPDATE_STATE", 
    data: { isCooldownMode: event.target.checked } 
  });
};

document.getElementById('awakeToggle').onchange = function(event) {
  chrome.runtime.sendMessage({ 
    action: "UPDATE_STATE", 
    data: { isKeepAwake: event.target.checked } 
  });
};

// --- CONFIGURATION: CHRONOS SCHEDULING ---

document.getElementById('scheduleToggle').onchange = function(event) {
  const isEnabled = event.target.checked;
  document.getElementById('scheduleTime').disabled = !isEnabled;
  chrome.runtime.sendMessage({ 
    action: "UPDATE_STATE", 
    data: { isScheduled: isEnabled } 
  });
};

document.getElementById('saveScheduleBtn').onclick = function() {
  const timeValue = document.getElementById('scheduleTime').value;
  chrome.runtime.sendMessage({ 
    action: "UPDATE_STATE", 
    data: { scheduledTime: timeValue } 
  });
};

// --- CONFIGURATION: DELAY & JITTER SLIDERS ---

document.getElementById('minWait').oninput = function(event) {
  const val = parseInt(event.target.value);
  document.getElementById('minVal').innerText = val + "s";
  chrome.runtime.sendMessage({ action: "UPDATE_STATE", data: { minWait: val } });
};

document.getElementById('maxWait').oninput = function(event) {
  const val = parseInt(event.target.value);
  document.getElementById('maxVal').innerText = val + "s";
  chrome.runtime.sendMessage({ action: "UPDATE_STATE", data: { maxWait: val } });
};

document.getElementById('jitterFreq').oninput = function(event) {
  const val = parseInt(event.target.value);
  document.getElementById('jitVal').innerText = val + "s";
  chrome.runtime.sendMessage({ action: "UPDATE_STATE", data: { jitterFreq: val } });
};

// --- CONFIGURATION: GHOST PERSONALIZATION ---

document.getElementById('scanlineToggle').onchange = function(event) {
  chrome.runtime.sendMessage({ 
    action: "UPDATE_STATE", 
    data: { showScanlines: event.target.checked } 
  });
};

document.getElementById('accentPicker').onchange = function(event) {
  chrome.runtime.sendMessage({ 
    action: "UPDATE_STATE", 
    data: { accentColor: event.target.value } 
  });
};

document.getElementById('themeSelector').onchange = function(event) {
  chrome.runtime.sendMessage({ 
    action: "UPDATE_STATE", 
    data: { themeMode: event.target.value } 
  });
};

document.getElementById('skinSelector').onchange = function(event) {
  chrome.runtime.sendMessage({ 
    action: "UPDATE_STATE", 
    data: { heartbeatSkin: event.target.value } 
  });
};

// --- GHOST PERSONALIZATION SLIDERS ---

document.getElementById('opacitySlider').oninput = function(event) {
  const val = parseInt(event.target.value);
  document.getElementById('opacVal').innerText = val + "%";
  chrome.runtime.sendMessage({ action: "UPDATE_STATE", data: { hudOpacity: val } });
};

document.getElementById('blurSlider').oninput = function(event) {
  const val = parseInt(event.target.value);
  document.getElementById('blurVal').innerText = val + "px";
  chrome.runtime.sendMessage({ action: "UPDATE_STATE", data: { hudBlur: val } });
};

document.getElementById('glowSlider').oninput = function(event) {
  const val = parseInt(event.target.value);
  document.getElementById('glowVal').innerText = val + "px";
  chrome.runtime.sendMessage({ action: "UPDATE_STATE", data: { neonGlow: val } });
};

document.getElementById('radiusSlider').oninput = function(event) {
  const val = parseInt(event.target.value);
  document.getElementById('radVal').innerText = val + "px";
  chrome.runtime.sendMessage({ action: "UPDATE_STATE", data: { hudRadius: val } });
};

document.getElementById('scaleSlider').oninput = function(event) {
  const val = parseInt(event.target.value);
  document.getElementById('scaleVal').innerText = (val / 100).toFixed(1) + "x";
  chrome.runtime.sendMessage({ action: "UPDATE_STATE", data: { hudScale: val } });
};

document.getElementById('ampSlider').oninput = function(event) {
  const val = parseInt(event.target.value);
  document.getElementById('ampVal').innerText = val;
  chrome.runtime.sendMessage({ action: "UPDATE_STATE", data: { waveAmp: val } });
};

document.getElementById('speedSlider').oninput = function(event) {
  const val = parseInt(event.target.value);
  document.getElementById('speedVal').innerText = val + "%";
  chrome.runtime.sendMessage({ action: "UPDATE_STATE", data: { animSpeed: val } });
};

document.getElementById('glitchSlider').oninput = function(event) {
  const val = parseInt(event.target.value);
  document.getElementById('glitchValBadge').innerText = val;
  chrome.runtime.sendMessage({ action: "UPDATE_STATE", data: { glitchFreq: val } });
};

// --- HUD ALIGNMENT LISTENERS ---

const posButtons = document.querySelectorAll('.pos-btn');
posButtons.forEach(function(btn) {
  btn.onclick = function() {
    const newPos = btn.getAttribute('data-pos');
    chrome.runtime.sendMessage({ 
      action: "UPDATE_STATE", 
      data: { hudPosition: newPos } 
    });
  };
});

/**
 * INITIALIZATION: Boot Sequence
 */
chrome.runtime.onMessage.addListener(function(message) {
  if (message.type === "SYNC") {
    updateUI(message.state);
  }
  return true;
});

document.addEventListener('DOMContentLoaded', async function() {
  const storedData = await chrome.storage.local.get("state");
  if (storedData.state) {
    updateUI(storedData.state);
  }
});