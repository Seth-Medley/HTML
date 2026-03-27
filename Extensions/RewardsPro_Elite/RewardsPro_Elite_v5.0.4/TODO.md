# TODO: Rewards Pro: Elite — Build AG Hardware Restoration

This log tracks the remaining system anomalies identified during the Build AG stabilization phase. These issues must be engineered out before the final GitHub push.

## 🔴 High Priority: Functional Interlocks
* [ ] **Save Launch Time Interlock**
    * **Issue:** The "Save Launch Time" button remains active even when the "Scheduled Start" toggle is OFF.
    * **Requirement:** Update `updateUI` in `JS/popup.js` to strictly gate the `saveScheduleBtn.disabled` property.
    * **Condition:** Must evaluate to `true` when `state.isScheduled` is `false`.

* [ ] **Daily Pulse Randomization**
    * **Issue:** The Daily Pulse card is stuck on static "Hardware sync active" text and fails to cycle through the quote bank.
    * **Requirement:** Re-hook the `#quoteDisplay` element to the `quoteBank` array in `JS/popup.js`.
    * **Condition:** Logic must trigger on `DOMContentLoaded` to ensure fresh telemetry on every boot.

## 🟡 Medium Priority: User Experience (UX)
* [ ] **Terminal Font Toggle Integration**
    * **Issue:** The "Terminal Font" button in the Engine Room has no functional listener.
    * **Requirement:** Add an `onclick` listener for `fontToggle` in `JS/popup.js`.
    * **Condition:** Must toggle a CSS class on the `.log-container` to switch between `monospace` and `sans-serif`, persisting the choice to `state.logMono`.

* [ ] **HUD Alignment Selection Glow**
    * **Issue:** The alignment buttons (`.pos-btn`) no longer display the active "selected" neon glow.
    * **Requirement:** Restore the `.active` class styling in `CSS/popup.css`.
    * **Condition:** `updateUI` must loop through all position buttons and apply the active class to the node matching `state.hudPosition`.

---

## 🟢 Post-Restoration Checklist
* [ ] Bump version string to `5.0.4-stable` in `manifest.json`.
* [ ] Perform a full 30-search mission to verify jitter and cooldown timing.
* [ ] Push final Build AG to GitHub with updated `Version_History.md`.