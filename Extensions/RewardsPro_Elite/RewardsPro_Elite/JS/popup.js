/**
 * Rewards Pro: Elite v4.4.4 - Popup Controller
 */

const quoteBank = [
  "Simplicity is the soul of efficiency.",
  "First, solve the problem. Then, write the code.",
  "Precision is the difference between a tool and a toy.",
  "Make it work, make it right, make it fast.",
  "Code is like humor. When you have to explain it, it’s bad."
];

let globalState = null;

function formatTime(s) {
  if (!s) return "00:00:00";
  const h = Math.floor(s/3600), m = Math.floor((s%3600)/60), sec = s%60;
  return [h, m, sec].map(v => v < 10 ? "0" + v : v).join(":");
}

function getEKGHeight(x) {
  const p = x % 100;
  if (p > 10 && p < 20) return 30 - Math.sin((p-10)/10 * Math.PI) * 3;
  if (p >= 20 && p < 23) return 30 + (p-20) * 5;
  if (p >= 23 && p < 27) return 40 - (p-23) * 17;
  if (p >= 27 && p < 30) return -10 + (p-27) * 13;
  if (p > 35 && p < 50) return 30 - Math.sin((p-35)/15 * Math.PI) * 4;
  return 30;
}

function animationLoop() {
  if (globalState && globalState.isRunning && !globalState.isPaused) {
    const path = document.getElementById('wave-path');
    const tag = document.getElementById('engine-mode-tag');
    
    if (globalState.timeLeft > 120) tag.innerText = "ENGINE: DEEP SLEEP";
    else tag.innerText = "ENGINE: ACTIVE";

    if (globalState.heartbeatSkin === 'pulse') {
      const t = performance.now() / 150;
      const y = 30 + Math.sin(t) * 12;
      path.setAttribute('d', `M 0 30 Q 50 ${y} 100 30 T 200 30 T 300 30 T 400 30`);
    } else {
      const sweepX = (performance.now() / 5) % 400; 
      let d = "M 0 30";
      for (let i = 0; i < sweepX; i += 2) { d += ` L ${i} ${getEKGHeight(i)}`; }
      path.setAttribute('d', d);
    }
  } else if (globalState) {
    const path = document.getElementById('wave-path');
    const tag = document.getElementById('engine-mode-tag');
    tag.innerText = globalState.isPaused ? "ENGINE: PAUSED" : "ENGINE: OFFLINE";
    path.setAttribute('d', "M 0 30 Q 100 30 200 30 T 400 30");
  }
  requestAnimationFrame(animationLoop);
}

function updateUI(s) {
  if (!s || !chrome.runtime?.id) return;
  globalState = s; 
  document.documentElement.style.setProperty('--accent', s.accentColor);

  const logBox = document.getElementById('missionLog');
  if (logBox && s.logs) { logBox.innerHTML = s.logs.map(log => `<div class="log-entry">${log}</div>`).join(''); }

  document.getElementById('runtimeDisplay').innerText = formatTime(s.runtime);
  document.getElementById('status-dot').className = s.isRunning ? (s.isPaused ? 'dot-paused' : 'dot-active') : 'dot-idle';

  document.getElementById('sessionProgress').innerText = `${s.currentSearch}/${s.totalSearches}`;
  document.getElementById('searchProgressBar').style.width = `${(s.currentSearch / s.totalSearches) * 100}%`;
  
  if (s.isRunning && s.timeLeft > 120) {
    document.getElementById('timerDisplay').innerText = Math.floor(s.timeLeft / 60) + 'm';
  } else {
    document.getElementById('timerDisplay').innerText = s.isRunning ? s.timeLeft + 's' : '--s';
  }

  const progress = s.totalWait > 0 ? ((s.totalWait - s.timeLeft) / s.totalWait) * 100 : 0;
  document.getElementById('timerBarFill').style.width = s.isRunning ? `${progress}%` : '0%';

  document.getElementById('idleActions').classList.toggle('hidden', s.isRunning);
  document.getElementById('activeActions').classList.toggle('hidden', !s.isRunning);
  document.getElementById('pauseBtn').classList.toggle('hidden', s.isPaused);
  document.getElementById('resumeBtn').classList.toggle('hidden', !s.isPaused);

  // Sync Logic with focus-validation
  const syncField = (id, val, isProp = false) => {
    const el = document.getElementById(id);
    if (el && document.activeElement !== el) {
      if (isProp) el.checked = val;
      else el.value = val;
    }
  };

  syncField('mobileToggle', s.isMobile, true);
  syncField('hudToggle', s.isStealth, true);
  syncField('cooldownToggle', s.isCooldownMode, true);
  syncField('awakeToggle', s.isKeepAwake, true);
  syncField('customCountInput', s.totalSearches);
  syncField('minWait', s.minWait);
  syncField('maxWait', s.maxWait);
  syncField('jitterFreq', s.jitterFreq);
  syncField('accentPicker', s.accentColor);
  syncField('skinSelector', s.heartbeatSkin);

  document.getElementById('minVal').innerText = s.minWait + 's';
  document.getElementById('maxVal').innerText = s.maxWait + 's';
  document.getElementById('jitVal').innerText = s.jitterFreq + 's';
}

const send = (data) => chrome.runtime.sendMessage({ action: "UPDATE_STATE", data });

document.getElementById('startBtn').onclick = () => chrome.runtime.sendMessage({ action: "START" });
document.getElementById('stopBtn').onclick = () => chrome.runtime.sendMessage({ action: "STOP" });
document.getElementById('pauseBtn').onclick = () => chrome.runtime.sendMessage({ action: "PAUSE" });
document.getElementById('resumeBtn').onclick = () => chrome.runtime.sendMessage({ action: "RESUME" });
document.getElementById('openSettingsBtn').onclick = () => document.getElementById('settingsPage').classList.remove('hidden');
document.getElementById('backBtn').onclick = () => document.getElementById('settingsPage').classList.add('hidden');

document.getElementById('mobileToggle').onchange = (e) => send({ isMobile: e.target.checked });
document.getElementById('hudToggle').onchange = (e) => send({ isStealth: e.target.checked });
document.getElementById('cooldownToggle').onchange = (e) => send({ isCooldownMode: e.target.checked });
document.getElementById('awakeToggle').onchange = (e) => send({ isKeepAwake: e.target.checked });
document.getElementById('minWait').oninput = (e) => send({ minWait: parseInt(e.target.value) });
document.getElementById('maxWait').oninput = (e) => send({ maxWait: parseInt(e.target.value) });
document.getElementById('jitterFreq').oninput = (e) => send({ jitterFreq: parseInt(e.target.value) });
document.getElementById('customCountInput').oninput = (e) => {
    const val = parseInt(e.target.value);
    if (!isNaN(val)) send({ totalSearches: val });
};
document.getElementById('accentPicker').oninput = (e) => send({ accentColor: e.target.value });
document.getElementById('skinSelector').onchange = (e) => send({ heartbeatSkin: e.target.value });

chrome.runtime.onMessage.addListener(m => { if (m.type === "SYNC") updateUI(m.state); });
document.addEventListener('DOMContentLoaded', () => {
  const quote = document.getElementById('quoteDisplay');
  if (quote) quote.innerText = `"${quoteBank[Math.floor(Math.random() * quoteBank.length)]}"`;
  chrome.runtime.sendMessage({ action: "GET_STATE" }, updateUI);
  requestAnimationFrame(animationLoop);
});
setInterval(() => { chrome.runtime.sendMessage({ action: "GET_STATE" }, updateUI); }, 150);