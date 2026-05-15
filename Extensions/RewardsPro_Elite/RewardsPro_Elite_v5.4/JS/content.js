/**
 * Rewards Pro: Elite v7.0.1 - Content Script
 * FULL LENGTH CODE - NO CONDENSING
 * IMPLEMENTS: Native Navigation Protocol. Zero Hash Spoofing. Smart Hardware Detection (Click Hard-Block).
 */

let shadowRootNode = null;

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

function updateShadowVisuals(s) {
  const host = document.getElementById('rewards-elite-anchor');
  if (!host || !shadowRootNode) {
    return;
  }
  
  const el = shadowRootNode.getElementById('rewards-hud-container');
  if (!el) {
    return;
  }

  let displayColor = s.accentColor;
  let timerLabel = s.timeLeft + 's';

  if (s.isRunning && s.isPaused) {
    displayColor = "#ffbf00";
    timerLabel = "PAUSED";
  } else if (s.isRunning && s.isCooling) {
    displayColor = "#ffbf00";
    timerLabel = `COOLING (${s.timeLeft}s)`;
  } else if (s.isRunning && s.isSimulating) {
    timerLabel = "SCANNING...";
  }

  host.style.setProperty('--accent', displayColor);
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
    timerText.innerText = timerLabel;
  }
  
  if (totalFill) {
    totalFill.style.width = `${(s.currentSearch / s.totalSearches) * 100}%`;
  }

  if (timerFill) {
    const pct = s.totalWait > 0 ? ((s.totalWait - s.timeLeft) / s.totalWait) * 100 : 0;
    timerFill.style.width = `${pct}%`;
  }
}

async function startTyping(term) {
  window.eliteLastTerm = term; 
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function performSearch() {
  const targetTerm = window.eliteLastTerm || "";
  
  if (!targetTerm || targetTerm.trim() === "") {
    return;
  }
  
  const isMobile = window.location.hash.includes('elite-mobile');
  const trackingParams = isMobile ? "&PC=MOBN&form=QBRE" : "&form=QBLH";
  window.location.href = "https://www.bing.com/search?q=" + encodeURIComponent(targetTerm) + trackingParams;
}

async function simulateHumanBehavior(doScroll, doClick) {
  // NATIVE HARDWARE DETECTION: Dynamically checks the physical device running the script
  const isMobileHardware = /Android|webOS|iPhone|iPad|iPod/i.test(navigator.userAgent) || navigator.maxTouchPoints > 0;

  if (doScroll) {
    const scrollSteps = Math.floor(Math.random() * 3) + 2; 
    for (let i = 0; i < scrollSteps; i++) {
      window.scrollBy({ top: Math.floor(Math.random() * 300) + 200, behavior: 'smooth' });
      await new Promise(r => setTimeout(r, Math.random() * 800 + 700));
    }
  }
  
  // HARD-BLOCK: Only execute if doClick is enabled AND we are NOT on mobile hardware
  if (doClick === true && !isMobileHardware) {
    const links = Array.from(document.querySelectorAll('a')).filter(a => {
      const rect = a.getBoundingClientRect();
      return rect.top >= 0 && rect.bottom <= window.innerHeight && rect.width > 0 && a.href && a.href.startsWith('http');
    });

    if (links.length > 0) {
      const target = links[Math.floor(Math.random() * links.length)];
      
      target.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
      target.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
      target.dispatchEvent(new MouseEvent('mousemove', { bubbles: true }));
      
      const originalOutline = target.style.outline;
      const originalBg = target.style.backgroundColor;
      target.style.outline = "2px solid rgba(88, 166, 255, 0.6)";
      target.style.backgroundColor = "rgba(88, 166, 255, 0.1)";
      target.style.transition = "all 0.3s ease";
      
      await new Promise(r => setTimeout(r, Math.random() * 1000 + 1000));
      
      target.style.outline = originalOutline;
      target.style.backgroundColor = originalBg;
      target.dispatchEvent(new MouseEvent('mouseout', { bubbles: true }));
      target.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));

      chrome.runtime.sendMessage({ action: "OPEN_AND_CLOSE_TAB", url: target.href });
    }
  }
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === "PING") {
    sendResponse({ status: "alive" });
  } else if (msg.action === "TYPE") {
    startTyping(msg.term);
  } else if (msg.action === "JITTER") {
    const distance = Math.floor(Math.random() * 200) - 100;
    window.scrollBy({ top: distance, behavior: 'smooth' });
  } else if (msg.action === "SEARCH") {
    performSearch();
  } else if (msg.action === "HUMAN_BEHAVIOR") {
    simulateHumanBehavior(msg.doScroll, msg.doClick).then(() => {
      sendResponse({ status: "complete" });
    });
    return true; 
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

// Immediately request state sync to bypass window load delays
chrome.runtime.sendMessage({ action: "CONTENT_READY" });