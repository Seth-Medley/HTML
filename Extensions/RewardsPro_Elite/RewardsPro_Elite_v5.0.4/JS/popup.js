/**
 * Rewards Pro: Elite v5.2.13 - Master Popup Controller
 * FULL LENGTH CODE - NO CONDENSING - NO SHORTHAND
 * BUILD EJ: MSI Screensaver Compatibility; Status Light Logic; Selective Card Locking.
 * BASEPLATE: RewardsPro_Elite_v5.0.4/JS/popup.js
 */

let globalHardwareState = null;
let animationFrameId = null;
let animationClock = 0;
let uiStateLock = false; 

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
 * ANIMATION ENGINE: Telemetry Visualizer
 */
function runAnimationEngine() {
  if (!globalHardwareState) {
    animationFrameId = requestAnimationFrame(runAnimationEngine);
    return;
  }

  const s = globalHardwareState;
  const path = document.getElementById('wave-path');
  const dnaBars = document.getElementById('dna-bars');
  
  let renderSpeed = (s.animSpeed || 100) / 5500; 
  let renderAmplitude = s.waveAmp || 15;
  let activeSkin = s.animationSkin || s.heartbeatSkin || "dna";

  const isMissionActive = !!s.isRunning && !s.isPaused;
  if (!isMissionActive) {
    activeSkin = "breath";
    renderSpeed = 0.01; 
    renderAmplitude = 5; 
  }

  animationClock += renderSpeed;

  if (path) {
    let d = "M 0 30 ";
    if (activeSkin === "pulse") {
      const pulseCenter = (animationClock * 150) % 600 - 100; 
      for (let x = 0; x <= 400; x += 5) {
        let yCoord = 30;
        const distFromCenter = Math.abs(x - pulseCenter);
        if (distFromCenter < 40) {
          const spikeVal = Math.sin((x - pulseCenter) * 0.15) * Math.exp(-Math.pow(x - pulseCenter, 2) / 400);
          yCoord = 30 - (renderAmplitude * 2.5 * spikeVal);
        }
        d += "L " + x + " " + yCoord + " ";
      }
    } else if (activeSkin === "sine") {
      for (let x = 0; x <= 400; x += 10) {
        const yCoord = 30 + renderAmplitude * Math.sin((x * 0.05) + animationClock);
        d += "L " + x + " " + yCoord + " ";
      }
    } else if (activeSkin === "osc") {
      for (let x = 0; x <= 400; x += 2) {
        const yCoord = 30 + (renderAmplitude * 0.4) * Math.sin(x * 0.6 + animationClock * 12);
        d += "L " + x + " " + yCoord + " ";
      }
    } else if (activeSkin === "glitch") {
      for (let x = 0; x <= 400; x += 20) {
        const yCoord = (Math.random() > 0.95) ? 30 + (Math.random() - 0.5) * renderAmplitude * 3 : 30;
        d += "L " + x + " " + yCoord + " ";
      }
    } else if (activeSkin === "breath") {
      const swellHeight = Math.sin(animationClock * 0.5) * renderAmplitude;
      d = "M 0 30 Q 100 " + (30 - swellHeight) + " 200 30 T 400 30";
    } else if (activeSkin === "dna" && isMissionActive) {
      if (dnaBars.children.length === 0) {
        for (let i = 0; i < 20; i++) {
          const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
          rect.setAttribute("width", "2");
          rect.setAttribute("fill", s.accentColor || "#58a6ff");
          dnaBars.appendChild(rect);
        }
      }
      const barsList = dnaBars.children;
      for (let i = 0; i < barsList.length; i++) {
        const xPos = i * 20 + 10;
        const phaseShift = Math.sin(animationClock + i * 0.5) * 22;
        barsList[i].setAttribute("x", xPos);
        barsList[i].setAttribute("y", 30 + phaseShift);
        barsList[i].setAttribute("height", Math.abs(phaseShift * -2));
      }
      path.setAttribute("opacity", "0.1");
    } else { d = "M 0 30 L 400 30"; }
    
    if (activeSkin !== "dna") {
      dnaBars.innerHTML = "";
      path.setAttribute("opacity", "1");
    }
    path.setAttribute("d", d);
  }

  animationFrameId = requestAnimationFrame(runAnimationEngine);
}

/**
 * UI SYNC: Master State Application
 */
function updateUI(s) {
  if (!s || !chrome.runtime?.id) { return; }
  globalHardwareState = s;

  const dashboard = document.getElementById('mainDashboard');
  const engineRoom = document.getElementById('settingsPage');
  const report = document.getElementById('debriefPage');

  if (s.isRunning === true && s.currentSearch >= s.totalSearches && s.isDebriefViewed === false) {
    if (report) { report.classList.remove('hidden'); }
    if (dashboard) { dashboard.classList.add('hidden'); }
    const dCount = document.getElementById('debriefCount');
    const dRuntime = document.getElementById('debriefRuntime');
    if (dCount) { dCount.innerText = s.currentSearch + " / " + s.totalSearches; }
    if (dRuntime) {
      const h = Math.floor(s.runtime / 3600).toString().padStart(2, '0');
      const m = Math.floor((s.runtime % 3600) / 60).toString().padStart(2, '0');
      const sc = (s.runtime % 60).toString().padStart(2, '0');
      dRuntime.innerText = h + ":" + m + ":" + sc;
    }
  } else {
    if (report) { report.classList.add('hidden'); }
    if (engineRoom && engineRoom.classList.contains('hidden')) {
      if (dashboard) { dashboard.classList.remove('hidden'); }
    } else { if (dashboard) { dashboard.classList.add('hidden'); } }
  }

  // FIX: STATUS LIGHT LOGIC
  const statusLight = document.getElementById('status-dot');
  if (statusLight) {
    if (s.isRunning && !s.isPaused) {
      statusLight.classList.remove('dot-idle'); statusLight.classList.add('dot-active');
    } else {
      statusLight.classList.remove('dot-active'); statusLight.classList.add('dot-idle');
    }
  }

  const logBox = document.getElementById('missionLog');
  if (logBox && s.logs) {
    logBox.innerHTML = s.logs.map(log => `<div class="log-entry">${log}</div>`).join('');
    if (s.logMono) { logBox.classList.add('log-mono'); }
    else { logBox.classList.remove('log-mono'); }
  }

  const btns = document.querySelectorAll('.pos-btn');
  btns.forEach(btn => {
    if (btn.getAttribute('data-pos') === s.hudPosition) { btn.classList.add('active'); }
    else { btn.classList.remove('active'); }
  });

  if (uiStateLock === false) {
    const idleDeck = document.getElementById('idleActions');
    const activeDeck = document.getElementById('activeActions');
    if (idleDeck && activeDeck) {
      if (s.isRunning === true && s.currentSearch < s.totalSearches) { 
        idleDeck.classList.add('hidden'); activeDeck.classList.remove('hidden'); 
      }
      else { idleDeck.classList.remove('hidden'); activeDeck.classList.add('hidden'); }
    }
  }

  const pBtn = document.getElementById('pauseBtn');
  const rBtn = document.getElementById('resumeBtn');
  if (pBtn && rBtn) {
    if (s.isPaused) { pBtn.classList.add('hidden'); rBtn.classList.remove('hidden'); }
    else { pBtn.classList.remove('hidden'); rBtn.classList.add('hidden'); }
  }

  // SELECTIVE ENGINE ROOM LOCKING
  const isMissionActive = s.isRunning === true && s.currentSearch < s.totalSearches;
  const cardsToLock = ['card-chronos', 'card-search-params', 'card-mission-logic', 'card-engine-customization', 'card-dynamic-effects', 'card-maintenance'];
  
  for (let i = 0; i < cardsToLock.length; i++) {
    const cardEl = document.getElementById(cardsToLock[i]);
    if (cardEl) {
      cardEl.style.opacity = isMissionActive ? "0.4" : "1";
      cardEl.style.pointerEvents = isMissionActive ? "none" : "auto";
      cardEl.style.filter = isMissionActive ? "grayscale(0.5)" : "none";
    }
  }

  const chronosGroup = document.getElementById('chronos-controls-group');
  if (chronosGroup && !isMissionActive) {
    chronosGroup.style.opacity = s.isScheduled ? "1" : "0.4";
    chronosGroup.style.pointerEvents = s.isScheduled ? "auto" : "none";
  }

  const alarmListEl = document.getElementById('activeAlarmsList');
  if (alarmListEl) {
    const activeAlarms = s.alarms || []; 
    if (activeAlarms.length === 0) {
      alarmListEl.innerHTML = '<div style="color:#484f58; text-align:center; padding:15px; font-size:10px;">NO ALARMS QUEUED</div>';
    } else {
      alarmListEl.innerHTML = activeAlarms.map(alarm => `
        <div class="alarm-entry">
          <span>SIGNAL: <span class="alarm-time">${alarm.time}</span></span>
          <button class="del-alarm-btn" data-id="${alarm.id}">DELETE</button>
        </div>
      `).join('');
    }
  }

  const uiElements = [
    { id: 'mobileToggle', state: 'isMobile' }, 
    { id: 'clickSimToggle', state: 'isClickSim' }, 
    { id: 'hudToggle', state: 'isStealth' }, 
    { id: 'cooldownToggle', state: 'isCooldownMode' }, 
    { id: 'awakeToggle', state: 'isKeepAwake' },
    { id: 'scheduleToggle', state: 'isScheduled' }, 
    { id: 'themeSelector', state: 'themeMode' },
    { id: 'skinSelector', state: 'animationSkin' },
    { id: 'accentPicker', state: 'accentColor' }
  ];
  uiElements.forEach(item => {
    const el = document.getElementById(item.id);
    if (el && document.activeElement !== el) {
      if (el.type === 'checkbox') { el.checked = s[item.state]; }
      else { el.value = s[item.state]; }
    }
  });

  // SLIDERS & BADGE MASTER SYNC
  const syncConfigs = [
    { id: 'minWait', state: 'minWait', badge: 'minVal', unit: 's' },
    { id: 'maxWait', state: 'maxWait', badge: 'maxVal', unit: 's' },
    { id: 'jitterFreq', state: 'jitterFreq', badge: 'jitVal', unit: 's' },
    { id: 'ampSlider', state: 'waveAmp', badge: 'ampVal', unit: '' },
    { id: 'speedSlider', state: 'animSpeed', badge: 'speedVal', unit: '%' },
    { id: 'glitchSlider', state: 'glitchFreq', badge: 'glitchValBadge', unit: '' },
    { id: 'opacitySlider', state: 'hudOpacity', badge: 'opacVal', unit: '%' },
    { id: 'blurSlider', state: 'hudBlur', badge: 'blurVal', unit: 'px' },
    { id: 'glowSlider', state: 'neonGlow', badge: 'glowVal', unit: 'px' },
    { id: 'radiusSlider', state: 'hudRadius', badge: 'radVal', unit: 'px' },
    { id: 'scaleSlider', state: 'hudScale', badge: 'scaleVal', unit: 'x' },
    { id: 'customCountInput', state: 'totalSearches' }
  ];

  syncConfigs.forEach(cfg => {
    const el = document.getElementById(cfg.id);
    if (el && document.activeElement !== el) {
      el.value = s[cfg.state];
      if (cfg.badge) {
        const b = document.getElementById(cfg.badge);
        if (b) {
          if (cfg.unit === 'x') b.innerText = (s[cfg.state] / 100).toFixed(1) + "x";
          else b.innerText = s[cfg.state] + cfg.unit;
        }
      }
    }
  });

  // PROGRESS BARS
  const progressText = document.getElementById('sessionProgress');
  if (progressText) { progressText.innerText = s.currentSearch + "/" + s.totalSearches; }
  const bar = document.getElementById('searchProgressBar');
  if (bar) { bar.style.width = (s.totalSearches > 0) ? (s.currentSearch / s.totalSearches * 100) + "%" : "0%"; }
  
  const timerText = document.getElementById('timerDisplay');
  const timerFill = document.getElementById('timerBarFill');
  if (s.isRunning === true && s.currentSearch < s.totalSearches) {
    if (timerText) { timerText.innerText = s.timeLeft + (s.isPaused ? "s (PAUSED)" : "s"); }
    if (timerFill) {
      const percentage = (s.totalWait > 0) ? ((s.totalWait - s.timeLeft) / s.totalWait) * 100 : 0;
      timerFill.style.width = percentage + "%";
    }
  } else {
    if (timerText) { timerText.innerText = "--s"; }
    if (timerFill) { timerFill.style.width = "0%"; }
  }

  const runDisplay = document.getElementById('runtimeDisplay');
  if (runDisplay) {
    const h = Math.floor(s.runtime / 3600).toString().padStart(2, '0');
    const m = Math.floor((s.runtime % 3600) / 60).toString().padStart(2, '0');
    const sc = (s.runtime % 60).toString().padStart(2, '0');
    runDisplay.innerText = h + ":" + m + ":" + sc;
  }

  if (s.themeMode) {
    const activeTheme = s.themeMode === "system" ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light") : s.themeMode;
    document.documentElement.setAttribute("data-theme", activeTheme);
  }
}

function randomizePulse() {
  const node = document.getElementById('quoteDisplay');
  if (node) { node.innerText = quoteBank[Math.floor(Math.random() * quoteBank.length)]; }
}

/**
 * MASTER CLICK LISTENER
 */
document.addEventListener('click', function(event) {
  const target = event.target;
  
  if (target.closest('#startBtn')) {
    event.preventDefault(); 
    uiStateLock = true;
    const idleDeck = document.getElementById('idleActions'); 
    const activeDeck = document.getElementById('activeActions');
    if (idleDeck && activeDeck) { 
      idleDeck.classList.add('hidden'); activeDeck.classList.remove('hidden'); 
    }
    chrome.runtime.sendMessage({ action: "START" });
    setTimeout(function() { uiStateLock = false; }, 2000);
  } 
  else if (target.closest('#stopBtn')) { chrome.runtime.sendMessage({ action: "STOP" }); } 
  else if (target.closest('#pauseBtn')) { chrome.runtime.sendMessage({ action: "PAUSE" }); } 
  else if (target.closest('#resumeBtn')) { chrome.runtime.sendMessage({ action: "RESUME" }); } 
  else if (target.closest('#addAlarmBtn')) {
    const timeEl = document.getElementById('scheduleTime');
    if (timeEl && timeEl.value) {
      const currentAlarms = globalHardwareState.alarms || [];
      const newAlarm = { id: Date.now(), time: timeEl.value };
      const updatedAlarms = [...currentAlarms, newAlarm];
      chrome.runtime.sendMessage({ action: "SAVE_SCHEDULE", isScheduled: globalHardwareState.isScheduled, alarms: updatedAlarms });
    }
  }
  else if (target.classList.contains('del-alarm-btn')) {
    const alarmId = parseInt(target.getAttribute('data-id'), 10);
    const updatedAlarms = (globalHardwareState.alarms || []).filter(a => a.id !== alarmId);
    chrome.runtime.sendMessage({ action: "SAVE_SCHEDULE", isScheduled: globalHardwareState.isScheduled, alarms: updatedAlarms });
  }
  else if (target.closest('#dismissDebriefBtn')) { chrome.runtime.sendMessage({ action: "DISMISS_DEBRIEF" }); }
  else if (target.closest('#openSettingsBtn')) {
    document.getElementById('settingsPage').classList.remove('hidden');
    document.getElementById('mainDashboard').classList.add('hidden');
  } 
  else if (target.closest('#backBtn')) {
    document.getElementById('settingsPage').classList.add('hidden');
    document.getElementById('mainDashboard').classList.remove('hidden');
  } 
  else if (target.closest('[data-pos]')) {
    chrome.runtime.sendMessage({ action: "UPDATE_STATE", data: { hudPosition: target.closest('[data-pos]').getAttribute('data-pos') } });
  }
  else if (target.closest('#runDiagnosticBtn')) { chrome.runtime.sendMessage({ action: "START_DIAGNOSTIC" }); }
  else if (target.closest('#testNotifBtn')) { chrome.runtime.sendMessage({ action: "TEST_NOTIFICATION" }); }
  else if (target.closest('#resetSettingsBtn')) {
    if (confirm("REVERT ALL HARDWARE SETTINGS TO DEFAULTS?")) { chrome.runtime.sendMessage({ action: "RESET_SETTINGS" }); }
  }
  else if (target.closest('#resetLogsBtn')) {
    if (confirm("PERMANENTLY PURGE ALL TELEMETRY LOGS AND WIPE HARDWARE TO DEFAULTS?")) { chrome.runtime.sendMessage({ action: "FACTORY_RESET" }); }
  }
  else if (target.closest('#fontToggle')) {
    const current = globalHardwareState ? globalHardwareState.logMono : false;
    chrome.runtime.sendMessage({ action: "UPDATE_STATE", data: { logMono: !current } });
  }
});

chrome.runtime.onMessage.addListener(function(m) { if (m.type === "SYNC") { updateUI(m.state); } });

document.addEventListener('DOMContentLoaded', function() {
  chrome.storage.local.get("state", function(data) { if (data.state) { updateUI(data.state); } });
  randomizePulse();
  runAnimationEngine();
  
  const toggles = ['mobileToggle', 'clickSimToggle', 'hudToggle', 'cooldownToggle', 'awakeToggle', 'scheduleToggle', 'themeSelector', 'skinSelector'];
  toggles.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.onchange = function(e) {
        if (id === 'scheduleToggle') {
          chrome.runtime.sendMessage({ action: "SAVE_SCHEDULE", isScheduled: e.target.checked, alarms: globalHardwareState.alarms || [] });
        } else if (id === 'mobileToggle') {
          e.target.checked = false;
        } else {
          let u = {};
          const map = { 'customCountInput': 'totalSearches', 'mobileToggle':'isMobile', 'clickSimToggle':'isClickSim', 'hudToggle':'isStealth', 'cooldownToggle':'isCooldownMode', 'awakeToggle':'isKeepAwake', 'themeSelector': 'themeMode', 'skinSelector': 'animationSkin' };
          u[map[id] || id] = (el.type === 'checkbox') ? e.target.checked : e.target.value;
          chrome.runtime.sendMessage({ action: "UPDATE_STATE", data: u });
        }
      };
    }
  });

  const sliders = [
    { id: 'opacitySlider', state: 'hudOpacity', badge: 'opacVal', unit: '%' },
    { id: 'blurSlider', state: 'hudBlur', badge: 'blurVal', unit: 'px' },
    { id: 'glowSlider', state: 'neonGlow', badge: 'glowVal', unit: 'px' },
    { id: 'radiusSlider', state: 'hudRadius', badge: 'radVal', unit: 'px' },
    { id: 'scaleSlider', state: 'hudScale', badge: 'scaleVal', unit: 'x' },
    { id: 'ampSlider', state: 'waveAmp', badge: 'ampVal', unit: '' },
    { id: 'speedSlider', state: 'animSpeed', badge: 'speedVal', unit: '%' },
    { id: 'glitchSlider', state: 'glitchFreq', badge: 'glitchValBadge', unit: '' },
    { id: 'minWait', state: 'minWait', badge: 'minVal', unit: 's' },
    { id: 'maxWait', state: 'maxWait', badge: 'maxVal', unit: 's' },
    { id: 'jitterFreq', state: 'jitterFreq', badge: 'jitVal', unit: 's' }
  ];

  sliders.forEach(cfg => {
    const el = document.getElementById(cfg.id);
    if (el) {
      el.oninput = function(e) {
        const val = parseInt(e.target.value);
        const b = document.getElementById(cfg.badge);
        if (b) {
          if (cfg.unit === 'x') b.innerText = (val / 100).toFixed(1) + "x";
          else b.innerText = val + cfg.unit;
        }
        let u = {}; u[cfg.state] = val;
        chrome.runtime.sendMessage({ action: "UPDATE_STATE", data: u });
      };
    }
  });

  const picker = document.getElementById('accentPicker');
  if (picker) {
    picker.oninput = function(e) { 
      document.documentElement.style.setProperty('--accent', e.target.value); 
      const wave = document.getElementById('wave-path'); if (wave) { wave.style.stroke = e.target.value; } 
    };
    picker.onchange = function(e) { chrome.runtime.sendMessage({ action: "UPDATE_STATE", data: { accentColor: e.target.value } }); };
  }
});

async function runInit() {
  const stored = await chrome.storage.local.get("state");
  if (stored.state) { updateUI(stored.state); }
}
runInit();