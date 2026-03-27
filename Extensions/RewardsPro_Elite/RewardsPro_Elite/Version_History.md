# Rewards Pro: Elite - Version History

### v5.0.4 (Build AG) - Latest Stable
* [cite_start]**Notification Signal Restoration:** Resolved a fatal hardware exception where the Service Worker failed to trigger notifications due to the "Unable to download all specified images" error[cite: 1, 2, 4, 5, 7].
* [cite_start]**CSP Security Patch:** Fixed a Content Security Policy (CSP) violation in the search execution logic where calling `.click()` on specific elements was blocked by the browser's "script-src" directive[cite: 3].
* [cite_start]**Telemetry Hardening:** Implemented strict integer gating for tab messaging to prevent signature mismatch errors during background-to-content synchronization[cite: 1].

### v4.4.0 - Current Stable
* [cite_start]**Engine Overhaul:** Transitioned the animation system to `requestAnimationFrame` to achieve 60fps performance[cite: 8].
* [cite_start]**Visuals - Oscilloscope:** Redesigned the Oscilloscope skin using hospital-style sweep-line logic[cite: 8].
* [cite_start]**Visuals - Neon Pulse:** Implemented a liquid-smooth animation for the Neon Pulse skin[cite: 8].
* [cite_start]**UI Alignment:** Perfectly realigned header elements, including the Status Dot and Runtime Timer[cite: 8].
* [cite_start]**UI Interaction:** Applied primary button design logic to the "Close Engine Room" action[cite: 8].
* [cite_start]**Bug Fix - Synchronization:** Resolved animation stuttering caused by high-frequency interval synchronization[cite: 8].
* [cite_start]**Bug Fix - EKG Simulation:** Corrected the "sliding" effect on EKG blips to provide a realistic monitor feel[cite: 8].

### v4.3.10
* [cite_start]**Terminal Aesthetic:** Redesigned the Mission Log scrollbar for an improved terminal aesthetic[cite: 8].
* [cite_start]**Webkit Styling:** Updated the Engine Room scrollbar with modern webkit styling[cite: 8].

### v4.3.8
* [cite_start]**Startup Cleanup:** Restored the startup tab cleanup logic to decommission orphan instances[cite: 8].
* [cite_start]**Stability:** Improved the stability of the mission termination sequence[cite: 8].

### v4.3.7
* [cite_start]**Cockpit UI:** Redesigned the Delay and Jitter settings card using a cockpit-style grid[cite: 8].
* [cite_start]**Feedback Badges:** Added value badges to provide real-time feedback for slider adjustments[cite: 8].

### v4.3.5
* [cite_start]**Input Styling:** Redesigned the styling for dropdowns and number inputs[cite: 8].
* [cite_start]**Hierarchy Update:** Repositioned the Manual & Specs card below the Mission Log for better visual hierarchy[cite: 8].

### v4.3.1
* [cite_start]**CSP Fix:** Resolved initial Content Security Policy (CSP) search violations by transitioning from direct interactions to `form.submit()`[cite: 8].
* [cite_start]**Documentation:** Added the "Manual & Specs" info card to the Engine Room[cite: 8].

### v4.3.0
* [cite_start]**Baseline Release:** Established the baseline stable release featuring the NPA v2 Engine and Stealth HUD[cite: 8].