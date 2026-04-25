/**
 * Rewards Pro: Elite v5.1.56 - Master Popup Controller
 * FULL LENGTH CODE - NO CONDENSING - NO SHORTHAND
 * BUILD CX: Restored Engine Test & Notif Handshakes; Complete Manifest Sync.
 * RESOLVES: Broken Test Tool button; Broken Notification button; Full hardware reset.
 */

let globalHardwareState = null;
let animationFrameId = null;
let animationClock = 0;
let uiStateLock = false; // Protects deck swaps from sync loop interference.

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
 * Build CX: Traveling Wave logic. STANDBY Breath when idle; Full sweep when Active.
 */
function runAnimationEngine() {
  if (!globalHardwareState) {
    animationFrameId = requestAnimationFrame(runAnimationEngine);
    return;
  }

  const s = globalHardwareState;
  const path = document.getElementById('wave-path');
  const dnaBars = document.getElementById('dna-bars');
  
  // Normalizing metrics for high-end cinematic telemetry feel.
  let renderSpeed = (s.animSpeed || 100) / 5500; 
  let renderAmplitude = s.waveAmp || 15;
  let activeSkin = s.animationSkin || s.heartbeatSkin || "pulse";

  // TELEMETRY OVERRIDE: Low-power standby swell if engine is not Active.
  const isMissionActive = !!s.isRunning && !s.isPaused;
  if (!isMissionActive) {
    activeSkin = "breath";
    renderSpeed = 0.01; 
    renderAmplitude = 5; 
  }

  animationClock += renderSpeed;

  // 1. SVG WAVE PATH GENERATION
  if (path) {
    let d = "M 0 30 ";
    
    if (activeSkin === "pulse") {
      // Traveling EKG Wave Logic: Signature sweeps across the path smoothly.
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
    } else {
      d = "M 0 30 L 400 30";
    }
    path.setAttribute("d", d);
  }

  // 2. DNA HELIX GENERATION
  if (dnaBars) {
    if (activeSkin === "dna" && isMissionActive) {
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
      if (path) { path.setAttribute("opacity", "0.1"); }
    } else {
      dnaBars.innerHTML = "";
      if (path) { path.setAttribute("opacity", "1"); }
    }
  }

  animationFrameId = requestAnimationFrame(runAnimationEngine);
}

/**
 * UI SYNC: Master State Application
 * Build CX: Fully populated manifest to ensure Resets update all components.
 */
function updateUI(s) {
  if (!s || !chrome.runtime?.id) {
    return;
  }
  
  globalHardwareState = s;

  // --- 1. VIEW MANAGEMENT ---
  const dashboard = document.getElementById('mainDashboard');
  const engineRoom = document.getElementById('settingsPage');
  const report = document.getElementById('debriefPage');

  if (s.isRunning === true && s.currentSearch >= s.totalSearches && s.isDebriefViewed === false) {
    if (report) { report.classList.remove('hidden'); }
    if (dashboard) { dashboard.classList.add('hidden'); }
    if (engineRoom) { engineRoom.classList.add('hidden'); }
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
    } else {
      if (dashboard) { dashboard.classList.add('hidden'); }
    }
  }

  // --- 2. THEME & ACCENT HANDSHAKE ---
  if (s.accentColor) {
    document.documentElement.style.setProperty('--accent', s.accentColor);
    const wave = document.getElementById('wave-path');
    if (wave) { wave.style.stroke = s.accentColor; }
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

  // --- 3. METRIC SYNC ---
  const progressText = document.getElementById('sessionProgress');
  if (progressText) { progressText.innerText = s.currentSearch + "/" + s.totalSearches; }
  const bar = document.getElementById('searchProgressBar');
  if (bar) { bar.style.width = (s.currentSearch / s.totalSearches * 100) + "%"; }
  const runText = document.getElementById('runtimeDisplay');
  if (runText) {
    const h = Math.floor(s.runtime / 3600).toString().padStart(2, '0');
    const m = Math.floor((s.runtime % 3600) / 60).toString().padStart(2, '0');
    const sc = (s.runtime % 60).toString().padStart(2, '0');
    runText.innerText = h + ":" + m + ":" + sc;
  }

  // --- 4. ENGINE STATUS & TIMER ---
  const modeTag = document.getElementById('engine-mode-tag');
  if (modeTag) {
    if (s.isPaused) { modeTag.innerText = "ENGINE: STANDBY"; }
    else if (s.isRunning) { modeTag.innerText = "ENGINE: ACTIVE"; }
    else { modeTag.innerText = "ENGINE: OFFLINE"; }
  }

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
  const statusDot = document.getElementById('status-dot');
  if (statusDot) {
    statusDot.className = ''; 
    if (s.isPaused) { statusDot.classList.add('dot-paused'); }
    else if (s.isRunning) { statusDot.classList.add('dot-active'); }
    else { statusDot.classList.add('dot-idle'); }
  }

  // --- 5. ACTION DECK (UI STATE LOCK) ---
  if (uiStateLock === false) {
    const idleDeck = document.getElementById('idleActions');
    const activeDeck = document.getElementById('activeActions');
    if (idleDeck && activeDeck) {
      if (s.isRunning === true && s.currentSearch < s.totalSearches) {
        idleDeck.classList.add('hidden');
        activeDeck.classList.remove('hidden');
      } else {
        idleDeck.classList.remove('hidden');
        activeDeck.classList.add('hidden');
      }
    }
  }

  const pBtn = document.getElementById('pauseBtn');
  const rBtn = document.getElementById('resumeBtn');
  if (pBtn && rBtn) {
    if (s.isPaused) { pBtn.classList.add('hidden'); rBtn.classList.remove('hidden'); }
    else { pBtn.classList.remove('hidden'); rBtn.classList.add('hidden'); }
  }

  // --- 6. MISSION LOGS ---
  const logBox = document.getElementById('missionLog');
  if (logBox && s.logs) {
    logBox.innerHTML = s.logs.map(log => `<div class="log-entry">${log}</div>`).join('');
    if (s.logMono) { logBox.classList.add('log-mono'); }
    else { logBox.classList.remove('log-mono'); }
  }

  // --- 7. HARDWARE SAFETY INTERLOCK ---
  const isMissionLocked = s.isRunning === true && s.currentSearch < s.totalSearches;

  const cardsToLock = ['card-chronos', 'card-search-params', 'card-mission-logic', 'card-engine-customization', 'card-dynamic-effects', 'card-maintenance'];
  for (let i = 0; i < cardsToLock.length; i++) {
    const cardEl = document.getElementById(cardsToLock[i]);
    if (cardEl) {
      cardEl.style.opacity = isMissionLocked ? "0.5" : "1";
      cardEl.style.pointerEvents = isMissionLocked ? "none" : "auto";
      cardEl.style.filter = isMissionLocked ? "grayscale(0.5)" : "none";
    }
  }

  const timeIn = document.getElementById('scheduleTime');
  const saveBn = document.getElementById('saveScheduleBtn');
  if (timeIn) { timeIn.disabled = !s.isScheduled || isMissionLocked; }
  if (saveBn) { saveBn.disabled = !s.isScheduled || isMissionLocked; }

  // --- 8. SYNC MANIFEST: SLIDERS & BADGES (COMPLETE LIST) ---
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

  for (let i = 0; i < syncConfigs.length; i++) {
    const cfg = syncConfigs[i];
    const el = document.getElementById(cfg.id);
    if (el && document.activeElement !== el) {
      if (cfg.id === 'customCountInput') { 
        el.value = (s.totalSearches !== undefined && s.totalSearches !== null) ? s.totalSearches : 30; 
      } else { 
        el.value = s[cfg.state]; 
      }
      if (cfg.badge) {
        const badgeEl = document.getElementById(cfg.badge);
        if (badgeEl) {
          if (cfg.unit === 'x') { badgeEl.innerText = (s[cfg.state] / 100).toFixed(1) + "x"; }
          else { badgeEl.innerText = s[cfg.state] + cfg.unit; }
        }
      }
    }
  }

  // --- 9. SYNC MANIFEST: TOGGLES & SELECTORS (COMPLETE LIST) ---
  const uiElements = [
    { id: 'mobileToggle', state: 'isMobile' }, 
    { id: 'hudToggle', state: 'isStealth' }, 
    { id: 'cooldownToggle', state: 'isCooldownMode' }, 
    { id: 'awakeToggle', state: 'isKeepAwake' }, 
    { id: 'scheduleToggle', state: 'isScheduled' }, 
    { id: 'themeSelector', state: 'themeMode' }, 
    { id: 'skinSelector', state: 'animationSkin' }, 
    { id: 'accentPicker', state: 'accentColor' }
  ];
  for (let i = 0; i < uiElements.length; i++) {
    const el = document.getElementById(uiElements[i].id);
    if (el && document.activeElement !== el) {
      if (el.type === 'checkbox') { el.checked = s[uiElements[i].state]; }
      else { el.value = s[uiElements[i].state] || "pulse"; }
    }
  }

  const btns = document.querySelectorAll('.pos-btn');
  btns.forEach(function(btn) {
    if (btn.getAttribute('data-pos') === s.hudPosition) { btn.classList.add('active'); }
    else { btn.classList.remove('active'); }
  });
}

function randomizePulse() {
  const node = document.getElementById('quoteDisplay');
  if (node) { node.innerText = quoteBank[Math.floor(Math.random() * quoteBank.length)]; }
}

// ============================================================================
// GLOBAL OMNI-LISTENER: Persistent Handshake & Restored Diagnostic Buttons
// ============================================================================

document.addEventListener('click', function(event) {
  const target = event.target;
  
  if (target.closest('#startBtn')) {
    event.preventDefault();
    uiStateLock = true;
    const idleDeck = document.getElementById('idleActions');
    const activeDeck = document.getElementById('activeActions');
    if (idleDeck && activeDeck) {
      idleDeck.classList.add('hidden');
      activeDeck.classList.remove('hidden');
    }
    chrome.runtime.sendMessage({ action: "START" });
    setTimeout(function() { uiStateLock = false; }, 2000);
  } 
  else if (target.closest('#stopBtn')) { event.preventDefault(); chrome.runtime.sendMessage({ action: "STOP" }); } 
  else if (target.closest('#pauseBtn')) { event.preventDefault(); chrome.runtime.sendMessage({ action: "PAUSE" }); } 
  else if (target.closest('#resumeBtn')) { event.preventDefault(); chrome.runtime.sendMessage({ action: "RESUME" }); } 
  else if (target.closest('#dismissDebriefBtn')) { event.preventDefault(); chrome.runtime.sendMessage({ action: "DISMISS_DEBRIEF" }); }
  else if (target.closest('#openSettingsBtn')) {
    const sPage = document.getElementById('settingsPage');
    const dPage = document.getElementById('mainDashboard');
    if (sPage && dPage) { sPage.classList.remove('hidden'); dPage.classList.add('hidden'); }
  } 
  else if (target.closest('#backBtn')) {
    const sPage = document.getElementById('settingsPage');
    const dPage = document.getElementById('mainDashboard');
    if (sPage && dPage) { sPage.classList.add('hidden'); dPage.classList.remove('hidden'); }
  } 
  else if (target.closest('#saveScheduleBtn')) {
    const timeEl = document.getElementById('scheduleTime');
    if (timeEl) {
      chrome.runtime.sendMessage({ action: "SAVE_SCHEDULE", isScheduled: globalHardwareState.isScheduled, scheduledTime: timeEl.value });
      alert("Launch telemetry secured.");
    }
  } 
  else if (target.closest('[data-pos]')) {
    chrome.runtime.sendMessage({ action: "UPDATE_STATE", data: { hudPosition: target.closest('[data-pos]').getAttribute('data-pos') } });
  }
  else if (target.closest('#testNotifBtn')) { 
    // BUILD CX FIX: Restored Notification handshake
    event.preventDefault(); 
    chrome.runtime.sendMessage({ action: "TEST_NOTIFICATION" }); 
  }
  else if (target.closest('#runDiagnosticBtn')) { 
    // BUILD CX FIX: Restored Engine Diagnostic handshake
    event.preventDefault(); 
    chrome.runtime.sendMessage({ action: "START_DIAGNOSTIC" }); 
  }
  else if (target.closest('#resetSettingsBtn')) { 
    event.preventDefault(); 
    if (confirm("REVERT ALL HARDWARE SETTINGS TO DEFAULTS?")) { 
      const goalEl = document.getElementById('customCountInput');
      if (goalEl) { goalEl.value = 30; }
      chrome.runtime.sendMessage({ action: "UPDATE_STATE", data: { totalSearches: 30 } });
      chrome.runtime.sendMessage({ action: "RESET_SETTINGS" }); 
    } 
  }
  else if (target.closest('#resetLogsBtn')) { 
    event.preventDefault(); 
    if (confirm("PERMANENTLY PURGE TELEMETRY LOGS?")) { 
      const goalEl = document.getElementById('customCountInput');
      if (goalEl) { goalEl.value = 30; }
      chrome.runtime.sendMessage({ action: "UPDATE_STATE", data: { totalSearches: 30 } });
      chrome.runtime.sendMessage({ action: "FACTORY_RESET" }); 
    } 
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

  // CORE INPUT MAPPING
  const coreIDs = ['customCountInput', 'mobileToggle', 'hudToggle', 'cooldownToggle', 'awakeToggle', 'scheduleToggle', 'themeSelector', 'skinSelector'];
  coreIDs.forEach(function(id) {
    const el = document.getElementById(id);
    if (el) {
      el.onchange = function(e) {
        let u = {};
        const map = { 
          'customCountInput': 'totalSearches', 'mobileToggle': 'isMobile', 'hudToggle': 'isStealth', 
          'cooldownToggle': 'isCooldownMode', 'awakeToggle': 'isKeepAwake', 'scheduleToggle': 'isScheduled', 
          'skinSelector': 'animationSkin', 'themeSelector': 'themeMode' 
        };
        u[map[id] || id] = (el.type === 'checkbox') ? e.target.checked : (parseInt(e.target.value) || e.target.value);
        chrome.runtime.sendMessage({ action: "UPDATE_STATE", data: u });
      };
    }
  });

  // SLIDER BINDINGS (BUILD CX COMPLETE LIST)
  const sliderList = [
    { id: 'opacitySlider', state: 'hudOpacity' }, { id: 'blurSlider', state: 'hudBlur' }, 
    { id: 'glowSlider', state: 'neonGlow' }, { id: 'radiusSlider', state: 'hudRadius' }, 
    { id: 'scaleSlider', state: 'hudScale' }, { id: 'ampSlider', state: 'waveAmp' }, 
    { id: 'speedSlider', state: 'animSpeed' }, { id: 'glitchSlider', state: 'glitchFreq' },
    { id: 'minWait', state: 'minWait' }, { id: 'maxWait', state: 'maxWait' }, { id: 'jitterFreq', state: 'jitterFreq' }
  ];
  sliderList.forEach(function(cfg) {
    const el = document.getElementById(cfg.id);
    if (el) {
      el.oninput = function(e) {
        let u = {}; u[cfg.state] = parseInt(e.target.value);
        chrome.runtime.sendMessage({ action: "UPDATE_STATE", data: u });
      };
    }
  });

  const picker = document.getElementById('accentPicker');
  if (picker) {
    picker.oninput = function(e) { 
        document.documentElement.style.setProperty('--accent', e.target.value); 
        const wave = document.getElementById('wave-path');
        if (wave) { wave.style.stroke = e.target.value; }
    };
    picker.onchange = function(e) { chrome.runtime.sendMessage({ action: "UPDATE_STATE", data: { accentColor: e.target.value } }); };
  }
});