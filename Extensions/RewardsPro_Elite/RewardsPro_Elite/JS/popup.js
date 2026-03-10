/**
 * Rewards Pro: Elite - Popup Controller
 * FULL-LENGTH: Overlay Management and Mission Log Sync
 */

function formatTime(seconds) {
  const h = Math.floor(seconds / 3600), m = Math.floor((seconds % 3600) / 60), s = seconds % 60;
  return [h, m, s].map(v => v < 10 ? "0" + v : v).join(":");
}

function updateUI(state) {
  const els = {
    searchProgress: document.getElementById('sessionProgress'),
    searchBar: document.getElementById('searchProgressBar'),
    timerText: document.getElementById('timerDisplay'),
    timerBar: document.getElementById('timerBarFill'),
    runtime: document.getElementById('runtimeDisplay'),
    statusDot: document.getElementById('status-dot'),
    mobileToggle: document.getElementById('mobileToggle'),
    stealthToggle: document.getElementById('stealthToggle'),
    slider: document.getElementById('waitSlider'),
    sliderValue: document.getElementById('sliderValue'),
    logBox: document.getElementById('missionLog'),
    overlay: document.getElementById('completeOverlay'),
    statText: document.getElementById('finalStatText')
  };

  if (!els.runtime || !els.timerText) return;

  els.mobileToggle.checked = state.isMobile;
  els.stealthToggle.checked = state.isStealth;
  els.slider.value = state.minWait;
  els.sliderValue.innerText = state.minWait + "s";
  els.runtime.innerText = formatTime(state.runtime);

  // MISSION COMPLETE OVERLAY LOGIC
  if (state.isFinished) {
    els.overlay.classList.remove('hidden');
    els.statText.innerText = `Mission finished in ${formatTime(state.runtime)}. Total searches: ${state.currentSearch}.`;
  } else {
    els.overlay.classList.add('hidden');
  }

  if (state.logs && state.logs.length > 0) {
    els.logBox.innerHTML = state.logs.map(log => `<div class="log-entry">${log}</div>`).join('');
  }

  els.searchProgress.innerText = state.currentSearch + "/" + state.totalSearches;
  els.searchBar.style.width = Math.min((state.currentSearch / state.totalSearches) * 100, 100) + "%";

  if (!state.isRunning) {
    els.statusDot.className = "dot-idle"; els.timerText.innerText = "--s"; els.timerBar.style.width = "0%";
    return;
  }

  els.statusDot.className = state.isPaused ? "dot-paused" : "dot-active";
  els.timerText.innerText = state.timeLeft + "s";
  const timerPercent = ((state.totalWait - state.timeLeft) / state.totalWait) * 100;
  els.timerBar.style.width = Math.min(timerPercent, 100) + "%";
}

chrome.runtime.onMessage.addListener(function(m) { if (m.type === "SYNC") updateUI(m.state); });

// DISMISS OVERLAY
document.getElementById('closeOverlayBtn').onclick = () => {
    chrome.runtime.sendMessage({ action: "DISMISS_OVERLAY" });
};

document.getElementById('mobileToggle').onchange = (e) => chrome.runtime.sendMessage({ action: "TOGGLE_MOBILE", value: e.target.checked });
document.getElementById('stealthToggle').onchange = (e) => chrome.runtime.sendMessage({ action: "TOGGLE_STEALTH", value: e.target.checked });
document.getElementById('waitSlider').oninput = (e) => chrome.runtime.sendMessage({ action: "UPDATE_WAIT", value: e.target.value });
document.getElementById('startBtn').onclick = () => chrome.runtime.sendMessage({ action: "START" });
document.getElementById('stopBtn').onclick = () => chrome.runtime.sendMessage({ action: "STOP" });
document.getElementById('pauseBtn').onclick = () => chrome.runtime.sendMessage({ action: "PAUSE" });
document.getElementById('resumeBtn').onclick = () => chrome.runtime.sendMessage({ action: "RESUME" });

document.addEventListener('DOMContentLoaded', function() { 
  chrome.runtime.sendMessage({ action: "GET_STATE" }, function(s) { if (s) updateUI(s); }); 
});