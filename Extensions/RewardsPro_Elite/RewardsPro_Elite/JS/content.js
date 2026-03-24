/**
 * Rewards Pro: Elite v4.9.18 - Content Script
 * FULL LENGTH CODE - NO CONDENSING
 * IMPLEMENTS: Ghost Guard Blink Prevention.
 */

let shadowRootNode = null;

function manifestHUD() {
  if (document.getElementById('rewards-elite-anchor')) return;
  const anchor = document.createElement('div');
  anchor.id = 'rewards-elite-anchor';
  anchor.style.cssText = "position:absolute; top:0; left:0; width:100%; height:100%; pointer-events:none; z-index:2147483647 !important;";
  shadowRootNode = anchor.attachShadow({ mode: 'open' });
  const container = document.createElement('div');
  container.id = 'rewards-hud-container';
  container.innerHTML = `<div class="hud-header">MISSION ACTIVE <span id="hud-counter">0/30</span></div><div id="hud-timer-text">--s</div><div class="hud-progress-track"><div id="hud-progress-fill"></div></div><div id="hud-theme-tag">DETACHED ANCHOR</div>`;
  const style = document.createElement('style');
  style.textContent = `:host { --accent: #58a6ff; --hud-radius: 12px; --hud-blur: 10px; --neon-glow: 5px; --hud-scale: 1.0; } #rewards-hud-container { position: fixed; display: flex; flex-direction: column; gap: 8px; padding: 12px; background: rgba(13, 17, 23, 0.85); border: 1px solid var(--accent); border-radius: var(--hud-radius); backdrop-filter: blur(var(--hud-blur)); color: white; font-family: -apple-system, sans-serif; pointer-events: auto; box-shadow: 0 0 var(--neon-glow) var(--accent); width: 140px; transition: all 0.3s ease; z-index: 2147483647; transform: scale(var(--hud-scale)); } .hud-header { font-size: 8px; font-weight: 800; text-transform: uppercase; color: #8b949e; display: flex; justify-content: space-between; } #hud-timer-text { font-size: 18px; font-weight: 900; text-align: center; margin: 4px 0; line-height: 1; } .hud-progress-track { height: 4px; background: #000; border-radius: 2px; overflow: hidden; } #hud-progress-fill { height: 100%; background: var(--accent); width: 0%; transition: width 0.4s; } #hud-theme-tag { font-size: 6px; text-align: right; margin-top: 4px; color: var(--accent); opacity: 0.6; font-weight: bold; } .pos-bottom-left { bottom: 20px; left: 20px; } .pos-bottom-right { bottom: 20px; right: 20px; } .pos-top-left { top: 20px; left: 20px; } .pos-top-right { top: 20px; right: 20px; } .scanlines::before { content: ""; position: absolute; inset: 0; pointer-events: none; background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06)); background-size: 100% 2px, 3px 100%; z-index: 2; border-radius: inherit; }`;
  shadowRootNode.appendChild(style);
  shadowRootNode.appendChild(container);
  document.documentElement.appendChild(anchor);
}

/**
 * Ghost Guard: Manifest-Only Heartbeat
 * BLINK FIX: This poller no longer removes the HUD if state is missing.
 * Removal is only handled by explicit system messages.
 */
setInterval(function() {
  if (window.location.href.includes("bing.com")) {
    chrome.runtime.sendMessage({ action: "GET_STATE" }, function(state) {
      if (chrome.runtime.lastError) return;
      if (state && state.isRunning && state.currentSearch < state.totalSearches && !state.isStealth) {
        if (!document.getElementById('rewards-elite-anchor')) manifestHUD();
        updateShadowVisuals(state);
      }
    });
  }
}, 500);

function updateShadowVisuals(s) {
  const host = document.getElementById('rewards-elite-anchor');
  if (!host || !shadowRootNode) return;
  const el = shadowRootNode.getElementById('rewards-hud-container');
  if (!el) return;
  el.style.display = 'flex';
  host.style.setProperty('--accent', s.accentColor);
  host.style.setProperty('--hud-blur', `${s.hudBlur}px`);
  host.style.setProperty('--neon-glow', `${s.neonGlow}px`);
  host.style.setProperty('--hud-radius', `${s.hudRadius}px`);
  host.style.setProperty('--hud-scale', s.hudScale / 100);
  el.className = `pos-${s.hudPosition} ${s.showScanlines ? 'scanlines' : ''}`;
  el.style.opacity = s.hudOpacity / 100;
  const c = shadowRootNode.getElementById('hud-counter');
  const t = shadowRootNode.getElementById('hud-timer-text');
  const p = shadowRootNode.getElementById('hud-progress-fill');
  if (c) c.innerText = `${s.currentSearch}/${s.totalSearches}`;
  if (t) t.innerText = (s.timeLeft > 120) ? Math.floor(s.timeLeft/60)+'m' : s.timeLeft+'s';
  if (p) p.style.width = `${(s.currentSearch / s.totalSearches) * 100}%`;
}

async function keyStroke(target, char, config = {}) {
  const duration = Math.random() * 60 + 30; 
  const setup = { key: char, code: config.code || `Key${char.toUpperCase()}`, bubbles: true, cancelable: true, ...config };
  target.dispatchEvent(new KeyboardEvent('keydown', setup));
  await new Promise(function(r) { setTimeout(r, duration); });
  target.dispatchEvent(new KeyboardEvent('keyup', setup));
}

async function startTyping(term) {
  const input = document.querySelector('textarea[name="q"]') || document.querySelector('input[name="q"]') || document.querySelector('#sb_form_q');
  if (!input) return;
  input.focus(); input.value = "";
  await new Promise(function(r) { setTimeout(r, 500); });
  for (let i = 0; i < term.length; i++) {
    const char = term.charAt(i);
    await keyStroke(input, char);
    input.value += char;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await new Promise(function(r) { setTimeout(r, Math.random() * 100 + 50); });
  }
}

async function performSearch() {
  try {
    const input = document.querySelector('textarea[name="q"]') || document.querySelector('input[name="q"]');
    const go = document.querySelector('#sb_form_go') || document.querySelector('input[type="submit"]');
    if (!input) return;
    input.focus(); await new Promise(function(r) { setTimeout(r, 400); });
    await keyStroke(input, 'Enter', { key: 'Enter', code: 'Enter', keyCode: 13, which: 13 });
    setTimeout(function() { if (go && go.isConnected) go.click(); }, 800);
  } catch (e) {}
}

chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
  if (msg.action === "TYPE") startTyping(msg.term);
  else if (msg.action === "JITTER") window.scrollBy({ top: Math.floor(Math.random() * 300) - 150, behavior: 'smooth' });
  else if (msg.action === "SEARCH") performSearch();
  else if (msg.type === "SYNC") {
    if (msg.state.isRunning && msg.state.currentSearch < msg.state.totalSearches) {
      if (!document.getElementById('rewards-elite-anchor')) manifestHUD();
      updateShadowVisuals(msg.state);
    } else {
      const anchor = document.getElementById('rewards-elite-anchor');
      if (anchor) anchor.remove();
    }
  }
  sendResponse({}); return true;
});

if (document.readyState === 'complete') chrome.runtime.sendMessage({ action: "CONTENT_READY" }, function(){});
else window.addEventListener('load', function() { chrome.runtime.sendMessage({ action: "CONTENT_READY" }, function(){}); });