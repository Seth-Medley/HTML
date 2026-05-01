/**
 * Rewards Pro: Elite v5.0.4 - Content Script
 * FULL LENGTH CODE - NO CONDENSING
 * IMPLEMENTS: CSP-Compliant Search Execution and HUD Telemetry.
 */

let shadowRootNode = null;

/**
 * MANIFEST: HUD Anchor
 */
function manifestHUD() {
  if (document.getElementById('rewards-elite-anchor')) {
    return;
  }
  
  const anchor = document.createElement('div');
  anchor.id = 'rewards-elite-anchor';
  anchor.style.cssText = "position:absolute; top:0; left:0; width:100%; height:100%; pointer-events:none; z-index:2147483647 !important;";
  shadowRootNode = anchor.attachShadow({ mode: 'open' });
  
  const container = document.createElement('div');
  container.id = 'rewards-hud-container';
  container.innerHTML = `
    <div class="hud-header">MISSION ACTIVE <span id="hud-counter">0/30</span></div>
    <div id="hud-timer-text">--s</div>
    
    <div class="hud-label">NEXT ACTION</div>
    <div class="hud-progress-track">
      <div id="hud-timer-fill"></div>
    </div>
    
    <div class="hud-label">TOTAL TASK</div>
    <div class="hud-progress-track">
      <div id="hud-progress-fill"></div>
    </div>
    
    <div id="hud-theme-tag">DETACHED ANCHOR</div>
  `;

  const style = document.createElement('style');
  style.textContent = `
    :host { 
      --accent: #58a6ff; 
      --hud-bg: rgba(13, 17, 23, 0.85); 
      --hud-text: #ffffff; 
      --hud-blur: 10px; 
      --hud-radius: 12px; 
      --hud-glow: 5px; 
      --hud-scale: 1.0; 
    }
    
    :host([data-theme="light"]) { 
      --hud-bg: rgba(255, 255, 255, 0.85); 
      --hud-text: #24292f; 
    }
    
    #rewards-hud-container {
      position: fixed; 
      display: flex; 
      flex-direction: column; 
      gap: 8px;
      padding: 12px; 
      background: var(--hud-bg); 
      border: 1px solid var(--accent);
      border-radius: var(--hud-radius); 
      backdrop-filter: blur(var(--hud-blur)); 
      color: var(--hud-text); 
      font-family: -apple-system, sans-serif; 
      pointer-events: auto;
      box-shadow: 0 0 var(--hud-glow) var(--accent); 
      width: 140px; 
      transition: all 0.3s ease; 
      z-index: 2147483647; 
      transform: scale(var(--hud-scale));
    }

    .hud-header { 
      font-size: 8px; 
      font-weight: 800; 
      text-transform: uppercase; 
      color: #8b949e; 
      display: flex; 
      justify-content: space-between; 
    }

    #hud-timer-text { 
      font-size: 18px; 
      font-weight: 900; 
      text-align: center; 
      margin-top: 4px;
      margin-bottom: 4px;
    }

    .hud-label {
      font-size: 6px;
      font-weight: 800;
      color: #8b949e;
      text-transform: uppercase;
    }

    .hud-progress-track { 
      height: 4px; 
      background: #000000; 
      border-radius: 2px; 
      overflow: hidden; 
    }

    #hud-progress-fill, #hud-timer-fill { 
      height: 100%; 
      background: var(--accent); 
      width: 0%; 
    }

    #hud-progress-fill {
      transition: width 0.4s ease; 
    }

    #hud-timer-fill {
      background: #3fb950; 
      transition: width 1s linear;
    }

    #hud-theme-tag { 
      font-size: 6px; 
      text-align: right; 
      margin-top: 4px; 
      color: var(--accent); 
      opacity: 0.6; 
    }

    .pos-bottom-left { bottom: 20px; left: 20px; } 
    .pos-bottom-right { bottom: 20px; right: 20px; }
    .pos-top-left { top: 20px; left: 20px; } 
    .pos-top-right { top: 20px; right: 20px; }
  `;
  shadowRootNode.appendChild(style);
  shadowRootNode.appendChild(container);
  document.documentElement.appendChild(anchor);
}

/**
 * SYNC: Shadow Visuals
 */
function updateShadowVisuals(s) {
  const host = document.getElementById('rewards-elite-anchor');
  if (!host || !shadowRootNode) {
    return;
  }
  
  const el = shadowRootNode.getElementById('rewards-hud-container');
  if (!el) {
    return;
  }

  host.style.setProperty('--accent', s.accentColor);
  host.style.setProperty('--hud-blur', `${s.hudBlur}px`);
  host.style.setProperty('--hud-radius', `${s.hudRadius}px`);
  host.style.setProperty('--hud-glow', `${s.neonGlow}px`);
  host.style.setProperty('--hud-scale', s.hudScale / 100);
  
  const theme = s.themeMode === "system" ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light") : s.themeMode;
  host.setAttribute("data-theme", theme);
  
  el.className = `pos-${s.hudPosition}`;
  el.style.opacity = s.hudOpacity / 100;

  const counter = shadowRootNode.getElementById('hud-counter');
  const timerText = shadowRootNode.getElementById('hud-timer-text');
  const totalFill = shadowRootNode.getElementById('hud-progress-fill');
  const timerFill = shadowRootNode.getElementById('hud-timer-fill');

  if (counter) {
    counter.innerText = `${s.currentSearch}/${s.totalSearches}`;
  }
  
  if (timerText) {
    timerText.innerText = s.timeLeft + 's';
  }
  
  if (totalFill) {
    totalFill.style.width = `${(s.currentSearch / s.totalSearches) * 100}%`;
  }

  if (timerFill) {
    const pct = s.totalWait > 0 ? ((s.totalWait - s.timeLeft) / s.totalWait) * 100 : 0;
    timerFill.style.width = `${pct}%`;
  }
}

/**
 * SIMULATION: Typing logic
 */
async function startTyping(term) {
  const input = document.querySelector('textarea[name="q"]') || document.querySelector('input[name="q"]') || document.querySelector('#sb_form_q');
  if (!input) return;
  input.focus();
  input.value = "";
  for (let i = 0; i < term.length; i++) {
    const char = term[i];
    const setup = { key: char, code: `Key${char.toUpperCase()}`, bubbles: true };
    input.dispatchEvent(new KeyboardEvent('keydown', setup));
    input.value += char;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new KeyboardEvent('keyup', setup));
    await new Promise(r => setTimeout(r, Math.random() * 60 + 30));
  }
}

/**
 * SIMULATION: Search Execution
 * FIX: Uses requestSubmit() and Trusted MouseEvents to bypass CSP "JavaScript URL" blocks.
 */
async function performSearch() {
  const input = document.querySelector('textarea[name="q"]') || document.querySelector('input[name="q"]') || document.querySelector('#sb_form_q');
  if (!input) {
    return;
  }
  
  input.focus();
  await new Promise(r => setTimeout(r, 200));
  
  // 1. Dispatch Trusted Keyboard Simulation
  const enterPayload = { 
    key: 'Enter', 
    code: 'Enter', 
    keyCode: 13, 
    which: 13, 
    bubbles: true, 
    cancelable: true 
  };
  input.dispatchEvent(new KeyboardEvent('keydown', enterPayload));
  input.dispatchEvent(new KeyboardEvent('keypress', enterPayload));
  
  // 2. Fallback to Form Submission (Fixes CSP error)
  setTimeout(() => {
    const go = document.querySelector('#sb_form_go') || document.querySelector('input[type="submit"]');
    const form = input.closest('form');
    
    if (form) {
      // Use requestSubmit to trigger submission through the standard pipeline
      form.requestSubmit();
    } else if (go && go.isConnected) {
      // If form structure is missing, use a trusted MouseEvent instead of .click()
      const clickEvent = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        view: window
      });
      go.dispatchEvent(clickEvent);
    }
  }, 500);
}

/**
 * INTERFACE: Message Router
 */
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === "PING") {
    sendResponse({ status: "alive" });
  } else if (msg.action === "TYPE") {
    startTyping(msg.term);
  } else if (msg.action === "JITTER") {
    window.scrollBy({ top: Math.floor(Math.random() * 200) - 100, behavior: 'smooth' });
  } else if (msg.action === "SEARCH") {
    performSearch();
  } else if (msg.type === "SYNC") {
    if (msg.state.isRunning && msg.state.currentSearch < msg.state.totalSearches && !msg.state.isStealth) {
      if (!document.getElementById('rewards-elite-anchor')) {
        manifestHUD();
      }
      updateShadowVisuals(msg.state);
    } else {
      if (!msg.state.isRunning) {
        const anchor = document.getElementById('rewards-elite-anchor');
        if (anchor) {
          anchor.remove();
        }
      }
    }
  }
  return true;
});

window.onload = () => {
  chrome.runtime.sendMessage({ action: "CONTENT_READY" });
};