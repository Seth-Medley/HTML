/**
 * Rewards Pro: Elite v4.3 - Popup Controller
 * STABLE: Crash Prevention & Header Alignment
 */

const quoteBank = [
  "Code is like humor. When you have to explain it, it’s bad.",
  "Simplicity is the soul of efficiency.",
  "First, solve the problem. Then, write the code.",
  "Precision is the difference between a tool and a toy.",
  "Make it work, make it right, make it fast."
];

function formatTime(seconds) {
  if (!seconds) return "00:00:00";
  const h = Math.floor(seconds / 3600), m = Math.floor((seconds % 3600) / 60), s = seconds % 60;
  return [h, m, s].map(v => v < 10 ? "0" + v : v).join(":");
}

function updateUI(s) {
  if (!s || !chrome.runtime?.id) return;

  document.documentElement.style.setProperty('--accent', s.accentColor);

  document.getElementById('mobileToggle').checked = s.isMobile;
  document.getElementById('hudToggle').checked = s.isStealth;
  document.getElementById('customCountInput').value = s.totalSearches;
  document.getElementById('minWait').value = s.minWait;
  document.getElementById('minVal').innerText = s.minWait + 's';
  document.getElementById('maxWait').value = s.maxWait;
  document.getElementById('maxVal').innerText = s.maxWait + 's';
  document.getElementById('jitterFreq').value = s.jitterFreq;
  document.getElementById('jitVal').innerText = s.jitterFreq + 's';
  document.getElementById('accentPicker').value = s.accentColor;
  document.getElementById('skinSelector').value = s.heartbeatSkin;

  document.getElementById('runtimeDisplay').innerText = formatTime(s.runtime);
  document.getElementById('sessionProgress').innerText = `${s.currentSearch}/${s.totalSearches}`;
  document.getElementById('searchProgressBar').style.width = `${((s.currentSearch / s.totalSearches) * 100)}%`;

  if (s.isRunning) {
    document.getElementById('idleActions').classList.add('hidden');
    document.getElementById('activeActions').classList.remove('hidden');
    document.getElementById('timerDisplay').innerText = s.timeLeft + 's';
    document.getElementById('timerBarFill').style.width = `${(((s.totalWait - s.timeLeft) / s.totalWait) * 100)}%`;
    document.getElementById('status-dot').className = s.isPaused ? "dot-paused" : "dot-active";
    
    if (s.isPaused) {
      document.getElementById('pauseBtn').classList.add('hidden');
      document.getElementById('resumeBtn').classList.remove('hidden');
    } else {
      document.getElementById('pauseBtn').classList.remove('hidden');
      document.getElementById('resumeBtn').classList.add('hidden');
    }
    updateHeartbeat(s);
  } else {
    document.getElementById('idleActions').classList.remove('hidden');
    document.getElementById('activeActions').classList.add('hidden');
    document.getElementById('timerDisplay').innerText = '--s';
    document.getElementById('timerBarFill').style.width = '0%';
    document.getElementById('status-dot').className = "dot-idle";
    document.getElementById('engine-mode-tag').innerText = "ENGINE: OFFLINE";
  }
  
  if (s.logs) document.getElementById('missionLog').innerHTML = s.logs.map(l => `<div class="log-entry">${l}</div>`).join('');
}

function updateHeartbeat(s) {
  const wave = document.getElementById('wave-path');
  const tag = document.getElementById('engine-mode-tag');
  const time = Date.now() / 200;
  if (s.isPaused) {
    tag.innerText = "ENGINE: PAUSED";
    wave.setAttribute('d', "M 0 30 Q 100 30 200 30 T 400 30");
    return;
  }
  if (s.timeLeft <= 5 && s.isTypingStarted) {
    tag.innerText = "ENGINE: FORMULATING";
    const d = s.heartbeatSkin === "pulse" 
      ? `M 0 30 Q 10 ${30 + Math.sin(time) * 20} 20 30 T 40 30 T 60 30 T 80 30 T 100 30 T 400 30`
      : `M 0 30 L 40 30 L 50 10 L 60 50 L 70 30 L 400 30`;
    wave.setAttribute('d', d);
  } else {
    tag.innerText = "ENGINE: STEADY";
    const d = `M 0 30 Q 50 ${30 + Math.sin(time) * 10} 100 30 T 200 30 T 300 30 T 400 30`;
    wave.setAttribute('d', d);
  }
}

const send = (data) => {
  if (chrome.runtime?.id) chrome.runtime.sendMessage({ action: "UPDATE_STATE", data });
};

document.getElementById('accentPicker').oninput = (e) => send({ accentColor: e.target.value });
document.getElementById('skinSelector').onchange = (e) => send({ heartbeatSkin: e.target.value });
document.getElementById('customCountInput').onchange = (e) => send({ totalSearches: parseInt(e.target.value) });
document.getElementById('minWait').oninput = (e) => send({ minWait: parseInt(e.target.value) });
document.getElementById('maxWait').oninput = (e) => send({ maxWait: parseInt(e.target.value) });
document.getElementById('jitterFreq').oninput = (e) => send({ jitterFreq: parseInt(e.target.value) });
document.getElementById('mobileToggle').onchange = (e) => send({ isMobile: e.target.checked });
document.getElementById('hudToggle').onchange = (e) => send({ isStealth: e.target.checked });

document.getElementById('startBtn').onclick = () => chrome.runtime.sendMessage({ action: "START" });
document.getElementById('stopBtn').onclick = () => chrome.runtime.sendMessage({ action: "STOP" });
document.getElementById('pauseBtn').onclick = () => chrome.runtime.sendMessage({ action: "PAUSE" });
document.getElementById('resumeBtn').onclick = () => chrome.runtime.sendMessage({ action: "RESUME" });
document.getElementById('openSettingsBtn').onclick = () => document.getElementById('settingsPage').classList.remove('hidden');
document.getElementById('backBtn').onclick = () => document.getElementById('settingsPage').classList.add('hidden');

document.addEventListener('DOMContentLoaded', function() {
  const q = quoteBank[Math.floor(Math.random() * quoteBank.length)];
  const display = document.getElementById('quoteDisplay');
  if (display) display.innerText = `"${q}"`;
  if (chrome.runtime?.id) {
    chrome.runtime.sendMessage({ action: "GET_STATE" }, function(response) {
      if (chrome.runtime.lastError) return;
      if (response) updateUI(response);
    });
  }
});
chrome.runtime.onMessage.addListener(function(m) { if (m.type === "SYNC") updateUI(m.state); });