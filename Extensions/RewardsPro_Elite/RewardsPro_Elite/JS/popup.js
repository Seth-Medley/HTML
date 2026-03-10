/**
 * Rewards Pro: Elite v4 - Popup Controller
 * FULL-LENGTH: Dynamic Visibility, Log Sync, and Inspiration Engine
 */

const quoteBank = [
  "Code is like humor. When you have to explain it, it’s bad.",
  "Simplicity is the soul of efficiency.",
  "First, solve the problem. Then, write the code.",
  "The best way to predict the future is to invent it.",
  "Optimism is a force multiplier.",
  "Make it work, make it right, make it fast.",
  "Small daily improvements are the key to long-term results.",
  "Precision is the difference between a tool and a toy."
];

function formatTime(seconds) {
  const h = Math.floor(seconds / 3600), m = Math.floor((seconds % 3600) / 60), s = seconds % 60;
  return [h, m, s].map(v => v < 10 ? "0" + v : v).join(":");
}

function updateUI(state) {
  const els = {
    progress: document.getElementById('sessionProgress'),
    pBar: document.getElementById('searchProgressBar'),
    timerText: document.getElementById('timerDisplay'),
    tBar: document.getElementById('timerBarFill'),
    runtime: document.getElementById('runtimeDisplay'),
    dot: document.getElementById('status-dot'),
    mobile: document.getElementById('mobileToggle'),
    stealth: document.getElementById('stealthToggle'),
    slider: document.getElementById('waitSlider'),
    sVal: document.getElementById('sliderValue'),
    log: document.getElementById('missionLog'),
    overlay: document.getElementById('completeOverlay'),
    statText: document.getElementById('finalStatText'),
    idleContainer: document.getElementById('idleActions'),
    activeContainer: document.getElementById('activeActions'),
    stop: document.getElementById('stopBtn'),
    pause: document.getElementById('pauseBtn'),
    resume: document.getElementById('resumeBtn')
  };

  if (!els.runtime) return;

  els.mobile.checked = state.isMobile;
  els.stealth.checked = state.isStealth;
  els.slider.value = state.minWait;
  els.sVal.innerText = `${state.minWait}s`;
  els.runtime.innerText = formatTime(state.runtime);

  if (state.isFinished) {
    els.overlay.classList.remove('hidden');
    els.statText.innerText = `Finished in ${formatTime(state.runtime)}. Total searches: ${state.currentSearch}.`;
  } else {
    els.overlay.classList.add('hidden');
  }

  if (state.logs?.length > 0) els.log.innerHTML = state.logs.map(l => `<div class="log-entry">${l}</div>`).join('');
  els.progress.innerText = `${state.currentSearch}/${state.totalSearches}`;
  els.pBar.style.width = `${(state.currentSearch / state.totalSearches) * 100}%`;

  if (!state.isRunning) {
    els.dot.className = "dot-idle"; els.timerText.innerText = "--s"; els.tBar.style.width = "0%";
    els.idleContainer.classList.remove('hidden');
    els.activeContainer.classList.add('hidden');
  } else {
    els.dot.className = state.isPaused ? "dot-paused" : "dot-active";
    els.timerText.innerText = `${state.timeLeft}s`;
    els.tBar.style.width = `${((state.totalWait - state.timeLeft) / state.totalWait) * 100}%`;
    els.idleContainer.classList.add('hidden');
    els.activeContainer.classList.remove('hidden');

    if (state.isPaused) { els.pause.classList.add('hidden'); els.resume.classList.remove('hidden'); }
    else { els.pause.classList.remove('hidden'); els.resume.classList.add('hidden'); }
  }
}

document.getElementById('openSettingsBtn').onclick = () => document.getElementById('settingsPage').classList.remove('hidden');
document.getElementById('backBtn').onclick = () => document.getElementById('settingsPage').classList.add('hidden');
document.getElementById('closeOverlayBtn').onclick = () => chrome.runtime.sendMessage({ action: "DISMISS_OVERLAY" });

chrome.runtime.onMessage.addListener(m => { if (m.type === "SYNC") updateUI(m.state); });

document.getElementById('mobileToggle').onchange = (e) => chrome.runtime.sendMessage({ action: "TOGGLE_MOBILE", value: e.target.checked });
document.getElementById('stealthToggle').onchange = (e) => chrome.runtime.sendMessage({ action: "TOGGLE_STEALTH", value: e.target.checked });
document.getElementById('waitSlider').oninput = (e) => chrome.runtime.sendMessage({ action: "UPDATE_WAIT", value: e.target.value });
document.getElementById('startBtn').onclick = () => chrome.runtime.sendMessage({ action: "START" });
document.getElementById('stopBtn').onclick = () => chrome.runtime.sendMessage({ action: "STOP" });
document.getElementById('pauseBtn').onclick = () => chrome.runtime.sendMessage({ action: "PAUSE" });
document.getElementById('resumeBtn').onclick = () => chrome.runtime.sendMessage({ action: "RESUME" });

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Random Quote
    const q = quoteBank[Math.floor(Math.random() * quoteBank.length)];
    document.getElementById('quoteDisplay').innerText = `"${q}"`;
    
    chrome.runtime.sendMessage({ action: "GET_STATE" }, s => { if (s) updateUI(s); });
});