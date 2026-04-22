/**
 * Rewards Pro: Elite v5.1.21 - Master Popup Controller
 * FULL LENGTH CODE - NO CONDENSING - NO SHORTHAND
 * BUILD BK: Targeted Safety Interlock. Toggles/Inputs lock; Sliders remain active.
 */

let globalHardwareState = null;

const quoteBank = [
  "Simplicity is the soul of efficiency.",
  "First, solve the problem. Then, write the code.",
  "Hardware is easy to protect. Software is a ghost.",
  "Telemetry is the only truth in a silent mission.",
  "Precision is the difference between a tool and a toy.",
  "In code we trust; in telemetry we verify.",
  "The best error message is the one that never appears."
];

/**
 * UI SYNC: Master State Application
 * Every label, slider, and button is explicitly targeted with safety guards.
 */
function updateUI(s) {
  if (!s || !chrome.runtime?.id) {
    return;
  }
  
  globalHardwareState = s;

  // --- 1. VIEW MANAGEMENT (DEBRIEF & OVERLAY LOGIC) ---
  const mainDashboard = document.getElementById('mainDashboard');
  const settingsPage = document.getElementById('settingsPage');
  const debriefPage = document.getElementById('debriefPage');

  // Priority Check: If mission is complete but report hasn't been viewed, force Debrief View.
  if (s.isRunning === true && s.currentSearch >= s.totalSearches && s.isDebriefViewed === false) {
    if (debriefPage) debriefPage.classList.remove('hidden');
    if (mainDashboard) mainDashboard.classList.add('hidden');
    if (settingsPage) settingsPage.classList.add('hidden');

    const dCount = document.getElementById('debriefCount');
    const dRuntime = document.getElementById('debriefRuntime');
    
    if (dCount) {
      dCount.innerText = s.currentSearch + " / " + s.totalSearches;
    }
    
    if (dRuntime) {
      const hours = Math.floor(s.runtime / 3600).toString().padStart(2, '0');
      const minutes = Math.floor((s.runtime % 3600) / 60).toString().padStart(2, '0');
      const seconds = (s.runtime % 60).toString().padStart(2, '0');
      dRuntime.innerText = hours + ":" + minutes + ":" + seconds;
    }
  } else {
    if (debriefPage) debriefPage.classList.add('hidden');
    // Maintain Toggle: Settings vs Dashboard
    if (settingsPage && settingsPage.classList.contains('hidden')) {
      if (mainDashboard) mainDashboard.classList.remove('hidden');
    }
  }

  // --- 2. MASTER THEME & SLIDER ACCENT APPLICATION ---
  if (s.accentColor) {
    document.documentElement.style.setProperty('--accent', s.accentColor);
    
    // Natively targets all slider thumbs for real-time accenting
    const allSliders = document.querySelectorAll('input[type="range"]');
    for (let i = 0; i < allSliders.length; i++) {
      allSliders[i].style.accentColor = s.accentColor;
    }
  }
  
  if (s.themeMode) {
    const activeTheme = s.themeMode === "system" 
      ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light") 
      : s.themeMode;
    document.documentElement.setAttribute("data-theme", activeTheme);
  }

  // --- 3. DASHBOARD METRICS ---
  const sessionProgress = document.getElementById('sessionProgress');
  if (sessionProgress) {
    sessionProgress.innerText = s.currentSearch + "/" + s.totalSearches;
  }

  const progressBar = document.getElementById('searchProgressBar');
  if (progressBar) {
    progressBar.style.width = (s.currentSearch / s.totalSearches * 100) + "%";
  }
  
  const runtimeDisplay = document.getElementById('runtimeDisplay');
  if (runtimeDisplay) {
    const hours = Math.floor(s.runtime / 3600).toString().padStart(2, '0');
    const minutes = Math.floor((s.runtime % 3600) / 60).toString().padStart(2, '0');
    const seconds = (s.runtime % 60).toString().padStart(2, '0');
    runtimeDisplay.innerText = hours + ":" + minutes + ":" + seconds;
  }

  // --- 4. NEXT ACTION TIMER ---
  const timerDisplay = document.getElementById('timerDisplay');
  const timerBarFill = document.getElementById('timerBarFill');
  
  if (s.isRunning === true && s.currentSearch < s.totalSearches) {
    if (timerDisplay) {
      timerDisplay.innerText = s.timeLeft + (s.isPaused ? "s (PAUSED)" : "s");
    }
    if (timerBarFill) {
      const percentage = (s.totalWait > 0) ? ((s.totalWait - s.timeLeft) / s.totalWait) * 100 : 0;
      timerBarFill.style.width = percentage + "%";
    }
  } else {
    if (timerDisplay) {
      timerDisplay.innerText = "--s";
    }
    if (timerBarFill) {
      timerBarFill.style.width = "0%";
    }
  }

  // --- 5. LED STATUS SIGNAL ---
  const statusDot = document.getElementById('status-dot');
  if (statusDot) {
    statusDot.className = ''; 
    if (s.isPaused) {
      statusDot.classList.add('dot-paused');
    } else if (s.isRunning) {
      statusDot.classList.add('dot-active');
    } else {
      statusDot.classList.add('dot-idle');
    }
  }

  // --- 6. ACTION DECK INTERLOCKS ---
  const idleActions = document.getElementById('idleActions');
  const activeActions = document.getElementById('activeActions');
  if (idleActions && activeActions) {
    if (s.isRunning === true && s.currentSearch < s.totalSearches) {
      idleActions.classList.add('hidden');
      activeActions.classList.remove('hidden');
    } else {
      idleActions.classList.remove('hidden');
      activeActions.classList.add('hidden');
    }
  }
  
  const pauseBtn = document.getElementById('pauseBtn');
  const resumeBtn = document.getElementById('resumeBtn');
  if (pauseBtn && resumeBtn) {
    if (s.isPaused) {
      pauseBtn.classList.add('hidden');
      resumeBtn.classList.remove('hidden');
    } else {
      pauseBtn.classList.remove('hidden');
      resumeBtn.classList.add('hidden');
    }
  }

  // --- 7. MISSION LOGS & TELEMETRY ---
  const logBox = document.getElementById('missionLog');
  if (logBox && s.logs) {
    logBox.innerHTML = s.logs.map(function(log) {
      return '<div class="log-entry">' + log + '</div>';
    }).join('');
    
    if (s.logMono) {
      logBox.classList.add('log-mono');
    } else {
      logBox.classList.remove('log-mono');
    }
  }

  // --- 8. HARDWARE SAFETY INTERLOCK (TARGETED LOCK) ---
  const isMissionLocked = s.isRunning === true && s.currentSearch < s.totalSearches;

  // 8.1. RANGE SLIDERS: REMAIN FULLY ACTIVE
  const sliderConfigs = [
    { id: 'minWait', badge: 'minVal', state: 'minWait', unit: 's' },
    { id: 'maxWait', badge: 'maxVal', state: 'maxWait', unit: 's' },
    { id: 'jitterFreq', badge: 'jitVal', state: 'jitterFreq', unit: 's' },
    { id: 'opacitySlider', badge: 'opacVal', state: 'hudOpacity', unit: '%' },
    { id: 'blurSlider', badge: 'blurVal', state: 'hudBlur', unit: 'px' },
    { id: 'glowSlider', badge: 'glowVal', state: 'neonGlow', unit: 'px' },
    { id: 'radiusSlider', badge: 'radVal', state: 'hudRadius', unit: 'px' },
    { id: 'scaleSlider', badge: 'scaleVal', state: 'hudScale', unit: 'x' },
    { id: 'ampSlider', badge: 'ampVal', state: 'waveAmp', unit: '' },
    { id: 'speedSlider', badge: 'speedVal', state: 'animSpeed', unit: '%' },
    { id: 'glitchSlider', badge: 'glitchValBadge', state: 'glitchFreq', unit: '' }
  ];

  for (let i = 0; i < sliderConfigs.length; i++) {
    const el = document.getElementById(sliderConfigs[i].id);
    const b = document.getElementById(sliderConfigs[i].badge);
    if (el && b && document.activeElement !== el) {
      el.value = s[sliderConfigs[i].state];
      el.disabled = false; // SLIDERS NEVER LOCKED
      if (sliderConfigs[i].unit === 'x') {
        b.innerText = (s[sliderConfigs[i].state] / 100).toFixed(1) + "x";
      } else {
        b.innerText = s[sliderConfigs[i].state] + sliderConfigs[i].unit;
      }
    }
  }

  // 8.2. TOGGLES & SWITCHES: LOCKED DURING MISSION
  const toggleConfigs = [
    { id: 'scheduleToggle', state: 'isScheduled' },
    { id: 'mobileToggle', state: 'isMobile' },
    { id: 'hudToggle', state: 'isStealth' },
    { id: 'cooldownToggle', state: 'isCooldownMode' },
    { id: 'awakeToggle', state: 'isKeepAwake' },
    { id: 'scanlineToggle', state: 'showScanlines' }
  ];

  for (let i = 0; i < toggleConfigs.length; i++) {
    const t = document.getElementById(toggleConfigs[i].id);
    if (t) {
      t.checked = s[toggleConfigs[i].state];
      t.disabled = isMissionLocked; // LOCKED
    }
  }

  // 8.3. DROPDOWNS & NUMBER INPUTS: LOCKED DURING MISSION
  const inputConfigs = [
    { id: 'themeSelector', state: 'themeMode' },
    { id: 'skinSelector', state: 'heartbeatSkin' },
    { id: 'accentPicker', state: 'accentColor' },
    { id: 'customCountInput', state: 'totalSearches' },
    { id: 'scheduleTime', state: 'scheduledTime' }
  ];

  for (let i = 0; i < inputConfigs.length; i++) {
    const el = document.getElementById(inputConfigs[i].id);
    if (el) {
      el.disabled = isMissionLocked; // LOCKED
      if (inputConfigs[i].id === 'customCountInput') el.value = s.totalSearches;
      else if (inputConfigs[i].id === 'scheduleTime') el.value = s.scheduledTime;
      else if (inputConfigs[i].id === 'accentPicker') el.value = s.accentColor;
      else el.value = s[inputConfigs[i].state];
    }
  }

  // 8.4. ALIGNMENT BUTTONS: LOCKED DURING MISSION
  const alignBtns = document.querySelectorAll('.pos-btn');
  alignBtns.forEach(function(btn) {
    btn.disabled = isMissionLocked; // LOCKED
    if (btn.getAttribute('data-pos') === s.hudPosition) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  const saveBtn = document.getElementById('saveScheduleBtn');
  if (saveBtn) {
    saveBtn.disabled = !s.isScheduled || isMissionLocked; // LOCKED
  }
}

/**
 * UTILITY: Daily Pulse Randomizer
 */
function randomizePulse() {
  const display = document.getElementById('quoteDisplay');
  if (display) {
    const randomIndex = Math.floor(Math.random() * quoteBank.length);
    display.innerText = quoteBank[randomIndex];
  }
}

// ============================================================================
// GLOBAL OMNI-LISTENER: Failsafe Event Routing
// ============================================================================

document.addEventListener('click', function(event) {
  const target = event.target;

  if (target.closest('#startBtn')) {
    event.preventDefault();
    chrome.runtime.sendMessage({ action: "START" });
  } 
  else if (target.closest('#stopBtn')) {
    event.preventDefault();
    chrome.runtime.sendMessage({ action: "STOP" });
  } 
  else if (target.closest('#pauseBtn')) {
    event.preventDefault();
    chrome.runtime.sendMessage({ action: "PAUSE" });
  } 
  else if (target.closest('#resumeBtn')) {
    event.preventDefault();
    chrome.runtime.sendMessage({ action: "RESUME" });
  } 
  else if (target.closest('#dismissDebriefBtn')) {
    event.preventDefault();
    chrome.runtime.sendMessage({ action: "DISMISS_DEBRIEF" });
  }
  else if (target.closest('#openSettingsBtn')) {
    event.preventDefault();
    const settings = document.getElementById('settingsPage');
    const dashboard = document.getElementById('mainDashboard');
    if (settings) settings.classList.remove('hidden');
    if (dashboard) dashboard.classList.add('hidden');
  } 
  else if (target.closest('#backBtn')) {
    event.preventDefault();
    const settings = document.getElementById('settingsPage');
    const dashboard = document.getElementById('mainDashboard');
    if (settings) settings.classList.add('hidden');
    if (dashboard) dashboard.classList.remove('hidden');
  } 
  else if (target.closest('#saveScheduleBtn') && !target.disabled) {
    event.preventDefault();
    const scheduleTime = document.getElementById('scheduleTime');
    if (scheduleTime) {
      chrome.runtime.sendMessage({ 
        action: "SAVE_SCHEDULE", 
        isScheduled: globalHardwareState.isScheduled,
        scheduledTime: scheduleTime.value 
      });
      alert("Launch telemetry secured.");
    }
  } 
  else if (target.closest('[data-pos]') && !target.disabled) {
    event.preventDefault();
    const pos = target.closest('[data-pos]').getAttribute('data-pos');
    chrome.runtime.sendMessage({ action: "UPDATE_STATE", data: { hudPosition: pos } });
  }
  else if (target.closest('#testNotifBtn')) {
    event.preventDefault();
    chrome.runtime.sendMessage({ action: "TEST_NOTIFICATION" });
  }
  else if (target.closest('#runDiagnosticBtn')) {
    event.preventDefault();
    chrome.runtime.sendMessage({ action: "START_DIAGNOSTIC" });
  }
  else if (target.closest('#resetSettingsBtn')) {
    event.preventDefault();
    if (confirm("REVERT ALL HARDWARE SETTINGS TO DEFAULTS?")) {
      chrome.runtime.sendMessage({ action: "RESET_SETTINGS" });
    }
  }
  else if (target.closest('#resetLogsBtn')) {
    event.preventDefault();
    if (confirm("PERMANENTLY PURGE TELEMETRY LOGS?")) {
      chrome.runtime.sendMessage({ action: "FACTORY_RESET" });
    }
  }
  else if (target.closest('#fontToggle')) {
    event.preventDefault();
    const currentState = globalHardwareState ? globalHardwareState.logMono : false;
    chrome.runtime.sendMessage({ action: "UPDATE_STATE", data: { logMono: !currentState } });
  }
});

// ============================================================================
// SYSTEM INITIALIZATION & INPUT LISTENERS
// ============================================================================

chrome.runtime.onMessage.addListener(function(message) {
  if (message.type === "SYNC") {
    updateUI(message.state);
  }
});

document.addEventListener('DOMContentLoaded', function() {
  chrome.storage.local.get("state", function(storedData) {
    if (storedData.state) {
      updateUI(storedData.state);
    }
  });
  
  randomizePulse(); 

  // --- CONFIGURATION INPUTS (Number, Time) ---
  const customCountInput = document.getElementById('customCountInput');
  if (customCountInput) {
    customCountInput.onchange = (e) => {
      chrome.runtime.sendMessage({ action: "UPDATE_STATE", data: { totalSearches: parseInt(e.target.value) } });
    };
  }

  // --- GHOST PERSONALIZATION CONTROLS ---
  const accentPicker = document.getElementById('accentPicker');
  if (accentPicker) {
    accentPicker.oninput = (e) => {
      document.documentElement.style.setProperty('--accent', e.target.value);
      const allSliders = document.querySelectorAll('input[type="range"]');
      allSliders.forEach(function(s) { s.style.accentColor = e.target.value; });
    };
    accentPicker.onchange = (e) => {
      chrome.runtime.sendMessage({ action: "UPDATE_STATE", data: { accentColor: e.target.value } });
    };
  }

  const themeSelector = document.getElementById('themeSelector');
  if (themeSelector) {
    themeSelector.onchange = (e) => {
      chrome.runtime.sendMessage({ action: "UPDATE_STATE", data: { themeMode: e.target.value } });
    };
  }

  const skinSelector = document.getElementById('skinSelector');
  if (skinSelector) {
    skinSelector.onchange = (e) => {
      chrome.runtime.sendMessage({ action: "UPDATE_STATE", data: { heartbeatSkin: e.target.value } });
    };
  }

  // --- OMNI-RANGE LISTENER ---
  const rangeIDs = [
    'opacitySlider', 'blurSlider', 'glowSlider', 'radiusSlider', 'scaleSlider', 
    'ampSlider', 'speedSlider', 'glitchSlider', 'minWait', 'maxWait', 'jitterFreq'
  ];
  rangeIDs.forEach(function(id) {
    const el = document.getElementById(id);
    if (el) {
      el.onchange = function(e) {
        let u = {};
        const key = id === 'glitchSlider' ? 'glitchFreq' : id;
        u[key] = parseInt(e.target.value);
        chrome.runtime.sendMessage({ action: "UPDATE_STATE", data: u });
      };
    }
  });

  // --- OMNI-TOGGLE LISTENER ---
  const toggleConfigs = [
    { id: 'mobileToggle', state: 'isMobile' },
    { id: 'hudToggle', state: 'isStealth' },
    { id: 'cooldownToggle', state: 'isCooldownMode' },
    { id: 'awakeToggle', state: 'isKeepAwake' },
    { id: 'scanlineToggle', state: 'showScanlines' },
    { id: 'scheduleToggle', state: 'isScheduled' }
  ];
  toggleConfigs.forEach(function(config) {
    const el = document.getElementById(config.id);
    if (el) {
      el.onchange = function(e) {
        let u = {};
        u[config.state] = e.target.checked;
        chrome.runtime.sendMessage({ action: "UPDATE_STATE", data: u });
      };
    }
  });
});