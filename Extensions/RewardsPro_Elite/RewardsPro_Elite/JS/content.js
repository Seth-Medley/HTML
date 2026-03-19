/**
 * Rewards Pro: Elite v4.4.0 - Content Script
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
    <div id="hud-theme-tag">--</div>
  `;
  document.body.appendChild(hudElement);
}

function updateHUD(s) {
  if (s.isStealth || !s.isRunning) {
    if (hudElement) hudElement.style.display = 'none';
    return;
  }
  if (!hudElement) createHUD();
  hudElement.style.display = 'flex';
  document.getElementById('hud-counter').innerText = `${s.currentSearch}/${s.totalSearches}`;
  document.getElementById('hud-timer-text').innerText = `${s.timeLeft}s`;
  document.getElementById('hud-progress-fill').style.width = `${(s.currentSearch / s.totalSearches) * 100}%`;
  document.getElementById('hud-theme-tag').innerText = `TOPIC: ${s.activeTheme}`;
}

async function simulateTyping(searchTerm) {
  const input = document.querySelector('textarea[name="q"]') || document.querySelector('input[name="q"]');
  if (!input) return;
  input.focus();
  input.value = "";
  for (let i = 0; i < searchTerm.length; i++) {
    if (Math.random() < 0.05 && i > 3) {
      input.value += "z";
      input.dispatchEvent(new Event('input', { bubbles: true }));
      await new Promise(r => setTimeout(r, 150));
      input.value = input.value.slice(0, -1);
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }
    input.value += searchTerm.charAt(i);
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await new Promise(r => setTimeout(r, Math.random() * 80 + 40));
  }
}

function triggerSearch() {
  const form = document.querySelector('#sb_form') || document.querySelector('form[action="/search"]');
  if (form) form.submit();
  else {
    const btn = document.querySelector('#sb_form_go') || document.querySelector('input[type="submit"]');
    if (btn) btn.click();
  }
}

chrome.runtime.onMessage.addListener((m) => {
  if (m.action === "TYPE") simulateTyping(m.term);
  if (m.action === "JITTER") window.scrollBy({ top: Math.random() * 200 - 100, behavior: 'smooth' });
  if (m.action === "SEARCH") triggerSearch();
  if (m.type === "SYNC") updateHUD(m.state);
});

function signalReady() {
  if (isReadySent) return;
  chrome.runtime.sendMessage({ action: "CONTENT_READY" });
  isReadySent = true;
}

if (document.readyState === 'complete') signalReady();
else window.addEventListener('load', signalReady);