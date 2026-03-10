/**
 * Rewards Pro: Elite - Content Script
 * FULL-LENGTH: Jitter, HUD, and Stealth Input
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
  `;
  document.body.appendChild(hudElement);
}

async function simulateTyping(searchTerm) {
  const inputField = document.querySelector('textarea[name="q"]') || document.querySelector('input[name="q"]') || document.querySelector('#sb_form_q');
  if (!inputField) return;
  
  inputField.click();
  inputField.focus();
  inputField.value = "";
  
  await new Promise(function(resolve) { setTimeout(resolve, 500); });

  for (let i = 0; i < searchTerm.length; i++) {
    inputField.value += searchTerm.charAt(i);
    inputField.dispatchEvent(new Event('input', { bubbles: true }));
    inputField.dispatchEvent(new Event('change', { bubbles: true }));
    
    // ADAPTIVE JITTER: Simulates human typing rhythm
    const jitter = Math.floor(Math.random() * 80) + 40; 
    await new Promise(function(resolve) { setTimeout(resolve, jitter); });
  }
}

function triggerSearch() {
  const goButton = document.querySelector('label[for="sb_form_go"]') || document.querySelector('#sb_form_go');
  if (goButton) goButton.click();
  else {
    const field = document.querySelector('textarea[name="q"]') || document.querySelector('input[name="q"]');
    if (field && field.form) field.form.submit();
  }
}

function executeHumanJitter() {
  // Random smooth scroll up or down
  const scrollAmt = Math.floor(Math.random() * 320) - 160;
  window.scrollBy({ top: scrollAmt, behavior: 'smooth' });
}

function signalReady() {
  if (!chrome.runtime?.id || isReadySent === true) return;
  chrome.runtime.sendMessage({ action: "CONTENT_READY" }, function() {
    if (!chrome.runtime.lastError) isReadySent = true;
    else setTimeout(signalReady, 1000);
  });
}

if (document.readyState === 'complete') signalReady();
else window.addEventListener('load', signalReady);

chrome.runtime.onMessage.addListener(function(message) {
  if (message.action === "TYPE_WITH_FOCUS") simulateTyping(message.term);
  if (message.action === "EXECUTE_SEARCH") triggerSearch();
  if (message.action === "HUMAN_JITTER") executeHumanJitter();
  if (message.type === "SYNC") {
    const s = message.state;
    if (s.isRunning === false || s.isStealth === true) {
      if (hudElement) { hudElement.remove(); hudElement = null; }
      return;
    }
    createHUD();
    const t = document.getElementById('hud-timer-text'), f = document.getElementById('hud-progress-fill'), c = document.getElementById('hud-counter');
    if (t && f && c) {
      t.innerText = s.isPaused ? "PAUSED" : s.timeLeft + "s";
      c.innerText = s.currentSearch + "/" + s.totalSearches;
      const progress = ((s.totalWait - s.timeLeft) / s.totalWait) * 100;
      f.style.width = Math.min(progress, 100) + "%";
    }
  }
});