/**
 * Rewards Pro: Elite v4.9.20 - Popup Controller
 * FULL LENGTH CODE - NO CONDENSING
 */

const quoteBank = [
  "Simplicity is the soul of efficiency.",
  "First, solve the problem. Then, write the code.",
  "Precision is the difference between a tool and a toy.",
  "Hardware is easy to protect. Software is a ghost.",
  "Code is like humor. When you have to explain it, it’s bad."
];

let globalState = null;

function getPulseHeight(x, amp) {
  const p = x % 100;
  if (p > 10 && p < 20) return 30 - Math.sin((p-10)/10 * Math.PI) * (amp/4);
  if (p >= 20 && p < 23) return 30 + (p-20) * (amp/3);
  if (p >= 23 && p < 27) return (30 + amp/3) - (p-23) * (amp*1.2);
  if (p >= 27 && p < 30) return (30 - amp) + (p-27) * (amp);
  if (p > 35 && p < 50) return 30 - Math.sin((p-35)/15 * Math.PI) * (amp/3);
  return 30;
}

function animationLoop() {
  const path = document.getElementById('wave-path');
  const tag = document.getElementById('engine-mode-tag');
  const bars = document.getElementById('dna-bars');
  if (!path || !tag || !bars) return;
  const t = performance.now();
  const speed = globalState ? (globalState.animSpeed / 100) : 1;
  const amp = globalState ? globalState.waveAmp : 15;
  const skin = globalState ? globalState.heartbeatSkin : 'pulse';

  if (globalState && globalState.isRunning && !globalState.isPaused && globalState.currentSearch < globalState.totalSearches) {
    tag.innerText = (globalState.timeLeft > 120) ? "ENGINE: DEEP SLEEP" : "ENGINE: ACTIVE";
    if (skin !== 'dna') bars.innerHTML = "";
    switch(skin) {
      case 'pulse': path.setAttribute('d', `M 0 30 Q 50 ${30 + Math.sin(t*speed/150)*amp} 100 30 T 200 30 T 300 30 T 400 30`); break;
      case 'osc': 
        let od = "M 0 30";
        for (let i = 0; i < ((t*speed/5)%400); i += 2) od += ` L ${i} ${getPulseHeight(i, amp)}`;
        path.setAttribute('d', od); break;
      case 'glitch':
        let gd = "M 0 30";
        const lim = 1 - ((globalState.glitchFreq || 5) / 100);
        for (let i = 0; i < 400; i += 15) {
          const s = (Math.random() > lim) ? (Math.random() * amp*2 - amp) : 0;
          gd += ` L ${i} ${30 + s}`;
        }
        path.setAttribute('d', gd); break;
      case 'breath':
        const by = 30 + Math.sin(t * speed / 1000) * amp * 1.5;
        path.setAttribute('d', `M 0 30 C 100 ${30 - (30 - by)}, 300 ${30 - (30 - by)}, 400 30`); break;
      case 'sine':
        let sd = "M 0 30";
        for (let i = 0; i < 400; i += 5) sd += ` L ${i} ${30 + Math.sin((i + t * speed / 5) / 20) * amp * 1.3}`;
        path.setAttribute('d', sd); break;
      case 'dna':
        let dd = "M 0 30"; let bh = "";
        for (let x = 0; x <= 400; x += 20) {
          const y1 = 30 + Math.sin((x + t * speed / 10) / 30) * amp;
          const y2 = 30 + Math.sin((x + t * speed / 10) / 30 + Math.PI) * amp;
          bh += `<rect x="${x}" y="${Math.min(y1, y2)}" width="1" height="${Math.abs(y1 - y2)}"></rect>`;
        }
        bars.innerHTML = bh;
        for (let i = 0; i < 400; i += 5) dd += (i === 0 ? "M" : " L") + ` ${i} ${30 + Math.sin((i + t * speed / 10) / 30) * amp}`;
        for (let i = 0; i < 400; i += 5) dd += (i === 0 ? " M" : " L") + ` ${i} ${30 + Math.sin((i + t * speed / 10) / 30 + Math.PI) * amp}`;
        path.setAttribute('d', dd); break;
    }
  } else {
    bars.innerHTML = ""; 
    const label = (globalState && globalState.currentSearch >= globalState.totalSearches) ? "ENGINE: SECURED" : (globalState && globalState.isPaused ? "ENGINE: PAUSED" : "ENGINE: OFFLINE");
    tag.innerText = label;
    path.setAttribute('d', "M 0 30 Q 100 30 200 30 T 400 30");
  }
  requestAnimationFrame(animationLoop);
}

function updateUI(s) {
  if (!s || !chrome.runtime?.id) return;
  globalState = s; 
  document.documentElement.style.setProperty('--accent', s.accentColor);
  const logContainer = document.getElementById('missionLog');
  if (logContainer) {
    logContainer.classList.toggle('log-mono', s.logMono);
    logContainer.innerHTML = s.logs.map(function(l) { return `<div class="log-entry">${l}</div>`; }).join('');
  }
  const h = Math.floor(s.runtime / 3600).toString().padStart(2, '0');
  const m = Math.floor((s.runtime % 3600) / 60).toString().padStart(2, '0');
  const sec = (s.runtime % 60).toString().padStart(2, '0');
  const runtimeStr = `${h}:${m}:${sec}`;
  document.getElementById('runtimeDisplay').innerText = runtimeStr;
  
  const debriefVisible = s.currentSearch >= s.totalSearches && !s.isDebriefViewed;
  document.getElementById('debriefPage').classList.toggle('hidden', !debriefVisible);
  if (debriefVisible) {
    document.getElementById('debriefRuntime').innerText = runtimeStr;
    document.getElementById('debriefCount').innerText = `${s.currentSearch}/${s.totalSearches}`;
  }

  document.getElementById('status-dot').className = s.currentSearch >= s.totalSearches ? 'dot-active' : (s.isRunning ? (s.isPaused ? 'dot-paused' : 'dot-active') : 'dot-idle');
  const showActive = s.isRunning && s.currentSearch < s.totalSearches;
  document.getElementById('idleActions').classList.toggle('hidden', showActive || (s.currentSearch >= s.totalSearches));
  document.getElementById('activeActions').classList.toggle('hidden', !showActive);
  document.getElementById('pauseBtn').classList.toggle('hidden', s.isPaused);
  document.getElementById('resumeBtn').classList.toggle('hidden', !s.isPaused);
  document.getElementById('sessionProgress').innerText = `${s.currentSearch}/${s.totalSearches}`;
  document.getElementById('searchProgressBar').style.width = `${(s.currentSearch / s.totalSearches) * 100}%`;
  
  if (s.isRunning && s.currentSearch < s.totalSearches) {
    document.getElementById('timerDisplay').innerText = (s.timeLeft > 120) ? Math.floor(s.timeLeft / 60) + 'm' : s.timeLeft + 's';
  } else {
    document.getElementById('timerDisplay').innerText = '--s';
  }
  document.getElementById('timerBarFill').style.width = (s.isRunning && s.totalWait > 0) ? `${((s.totalWait - s.timeLeft) / s.totalWait) * 100}%` : '0%';

  function setV(id, val, isC = false) {
    const el = document.getElementById(id);
    if (el && document.activeElement !== el) { if (isC) el.checked = val; else el.value = val; }
  }
  setV('mobileToggle', s.isMobile, true); setV('hudToggle', s.isStealth, true);
  setV('cooldownToggle', s.isCooldownMode, true); setV('awakeToggle', s.isKeepAwake, true);
  setV('customCountInput', s.totalSearches); setV('minWait', s.minWait); setV('maxWait', s.maxWait);
  setV('jitterFreq', s.jitterFreq); setV('opacitySlider', s.hudOpacity); setV('blurSlider', s.hudBlur);
  setV('glowSlider', s.neonGlow); setV('radiusSlider', s.hudRadius); setV('scaleSlider', s.hudScale);
  setV('ampSlider', s.waveAmp); setV('speedSlider', s.animSpeed); setV('glitchSlider', s.glitchFreq);
  setV('scanlineToggle', s.showScanlines, true); setV('accentPicker', s.accentColor); setV('skinSelector', s.heartbeatSkin);
  document.getElementById('minVal').innerText = s.minWait + 's';
  document.getElementById('maxVal').innerText = s.maxWait + 's';
  document.getElementById('jitVal').innerText = s.jitterFreq + 's';
  document.getElementById('opacVal').innerText = s.hudOpacity + '%';
  document.getElementById('blurVal').innerText = s.hudBlur + 'px';
  document.getElementById('glowVal').innerText = s.neonGlow + 'px';
  document.getElementById('radVal').innerText = s.hudRadius + 'px';
  document.getElementById('scaleVal').innerText = (s.hudScale/100).toFixed(1) + 'x';
  document.getElementById('ampVal').innerText = s.waveAmp;
  document.getElementById('speedVal').innerText = s.animSpeed + '%';
  document.getElementById('glitchValBadge').innerText = s.glitchFreq;
  document.querySelectorAll('.pos-btn').forEach(function(btn) { btn.classList.toggle('active', btn.dataset.pos === s.hudPosition); });
}

function pushState(data) { chrome.runtime.sendMessage({ action: "UPDATE_STATE", data }, function(){}); }
document.getElementById('startBtn').onclick = function(){ chrome.runtime.sendMessage({ action: "START" }, function(){}); };
document.getElementById('stopBtn').onclick = function(){ chrome.runtime.sendMessage({ action: "STOP" }, function(){}); };
document.getElementById('pauseBtn').onclick = function(){ chrome.runtime.sendMessage({ action: "PAUSE" }, function(){}); };
document.getElementById('resumeBtn').onclick = function(){ chrome.runtime.sendMessage({ action: "RESUME" }, function(){}); };
document.getElementById('openSettingsBtn').onclick = function(){ document.getElementById('settingsPage').classList.remove('hidden'); };
document.getElementById('backBtn').onclick = function(){ document.getElementById('settingsPage').classList.add('hidden'); };
document.getElementById('dismissDebriefBtn').onclick = function() { chrome.runtime.sendMessage({ action: "DISMISS_DEBRIEF" }, function(){}); };
document.getElementById('runDiagnosticBtn').onclick = function() { chrome.runtime.sendMessage({ action: "START_DIAGNOSTIC" }, function(){}); document.getElementById('settingsPage').classList.add('hidden'); };
document.getElementById('resetLogsBtn').onclick = function() { if (confirm("PURGE ALL TELEMETRY LOGS?")) { chrome.runtime.sendMessage({ action: "FACTORY_RESET" }, function(){}); } };
document.getElementById('fontToggle').onclick = function(){ pushState({ logMono: !globalState.logMono }); };
document.querySelectorAll('.pos-btn').forEach(function(btn){ btn.onclick = function(){ pushState({ hudPosition: btn.dataset.pos }); }; });
const sl = [['opacitySlider', 'hudOpacity'], ['blurSlider', 'hudBlur'], ['glowSlider', 'neonGlow'], ['radiusSlider', 'hudRadius'], ['scaleSlider', 'hudScale'], ['ampSlider', 'waveAmp'], ['speedSlider', 'animSpeed'], ['glitchSlider', 'glitchFreq'], ['minWait', 'minWait'], ['maxWait', 'maxWait'], ['jitterFreq', 'jitterFreq']];
sl.forEach(function(item) { document.getElementById(item[0]).oninput = function(e) { const o = {}; o[item[1]] = parseInt(e.target.value); pushState(o); }; });
document.getElementById('scanlineToggle').onchange = function(e){ pushState({ showScanlines: e.target.checked }); };
document.getElementById('mobileToggle').onchange = function(e){ pushState({ isMobile: e.target.checked }); };
document.getElementById('hudToggle').onchange = function(e){ pushState({ isStealth: e.target.checked }); };
document.getElementById('cooldownToggle').onchange = function(e){ pushState({ isCooldownMode: e.target.checked }); };
document.getElementById('awakeToggle').onchange = function(e){ pushState({ isKeepAwake: e.target.checked }); };
document.getElementById('customCountInput').oninput = function(e){ const v = parseInt(e.target.value); if (!isNaN(v)) pushState({ totalSearches: v }); };
document.getElementById('accentPicker').oninput = function(e){ document.documentElement.style.setProperty('--accent', e.target.value); pushState({ accentColor: e.target.value }); };
document.getElementById('skinSelector').onchange = function(e){ pushState({ heartbeatSkin: e.target.value }); };
chrome.runtime.onMessage.addListener(function(m, s, r) { if (m.type === "SYNC") updateUI(m.state); r({}); return true; });
document.addEventListener('DOMContentLoaded', async function() {
  const quote = document.getElementById('quoteDisplay'); if (quote) quote.innerText = `"${quoteBank[Math.floor(Math.random() * quoteBank.length)]}"`;
  const stored = await chrome.storage.local.get("state"); if (stored.state) updateUI(stored.state);
  chrome.runtime.sendMessage({ action: "GET_STATE" }, function(res) { if (res) updateUI(res); });
  requestAnimationFrame(animationLoop);
});
setInterval(function() { if (globalState) chrome.runtime.sendMessage({ action: "GET_STATE" }, function(res) { if (res) updateUI(res); }); }, 250);