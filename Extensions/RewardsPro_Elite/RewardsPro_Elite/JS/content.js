/**
 * Rewards Pro: Elite v4.3 - Content Script
 */

let hudElement = null;
let isReadySent = false;

function createHUD() {
  if (document.getElementById('rewards-hud-container')) return;
  hudElement = document.createElement('div');
  hudElement.id = 'rewards-hud-container';
  hudElement.innerHTML = `
    <div class="hud-header">MISSION ACTIVE <span id="hud-counter">0/30</span></div>
    <div id="hud-timer-text">--s</div>
    <div class="hud-progress-track"><div id="hud-progress-fill"></div></div>
    <div id="hud-theme-tag" style="font-size: 8px; margin-top: 5px; opacity: 0.7; font-weight: bold; text-transform: uppercase; color: #00a2ff;">TOPIC: GENERAL</div>
  `;
  document.body.appendChild(hudElement);
}

async function simulateTyping(searchTerm) {
  const inputField = document.querySelector('textarea[name="q"]') || document.querySelector('input[name="q"]');
  if (!inputField) return;
  inputField.focus();
  inputField.value = "";
  for (let i = 0; i < searchTerm.length; i++) {
    if (Math.random() < 0.05) {
      inputField.value += "z"; 
      await new Promise(r => setTimeout(r, 150));
      inputField.value = inputField.value.slice(0, -1);
    }
    inputField.value += searchTerm.charAt(i);
    inputField.dispatchEvent(new Event('input', { bubbles: true }));
    await new Promise(r => setTimeout(r, Math.random() * 80 + 40));
  }
}

function triggerSearch() {
  const btn = document.querySelector('#sb_form_go') || document.querySelector('input[type="submit"]');
  if (btn) btn.click();
}

chrome.runtime.onMessage.addListener(function(m) {
  if (m.action === "TYPE_WITH_FOCUS") simulateTyping(m.term);
  if (m.action === "EXECUTE_SEARCH") triggerSearch();
  if (m.action === "HUMAN_JITTER") window.scrollBy({ top: Math.random() * 200 - 100, behavior: 'smooth' });
  if (m.type === "SYNC") {
    const s = m.state;
    if (!s.isRunning || s.isStealth) {
      if (hudElement) { hudElement.remove(); hudElement = null; }
      return;
    }
    createHUD();
    const t = document.getElementById('hud-timer-text'), f = document.getElementById('hud-progress-fill'), c = document.getElementById('hud-counter'), th = document.getElementById('hud-theme-tag');
    if (t && f && c && th) {
      t.innerText = s.isPaused ? "PAUSED" : s.timeLeft + "s";
      c.innerText = s.currentSearch + "/" + s.totalSearches;
      th.innerText = `TOPIC: ${s.activeTheme}`;
      const progress = ((s.totalWait - s.timeLeft) / s.totalWait) * 100;
      f.style.width = Math.min(progress, 100) + "%";
    }
  }
});

function signalReady() {
  if (!chrome.runtime?.id || isReadySent) return;
  chrome.runtime.sendMessage({ action: "CONTENT_READY" }, function() { 
    if (!chrome.runtime.lastError) isReadySent = true; 
  });
}
if (document.readyState === 'complete') signalReady();
else window.addEventListener('load', signalReady);