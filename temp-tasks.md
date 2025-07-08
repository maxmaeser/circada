# Menubar Implementation Progress

## ✅ Completed
1. Created MenubarView component with:
   - Direction arrows (↑→↓•)
   - Time remaining display
   - Phase name tooltip
2. Added Tauri menubar configuration:
   - Main window settings
   - Menubar window settings
   - Updated to use correct trayIcon config
3. Created menubar entry points:
   - menubar.html
   - src/menubar.tsx
4. Updated Vite configuration:
   - Added multiple entry points
   - Configured development server
   - Fixed PostCSS config path

## 🚨 Current Blocker
Need to fix Tauri project structure:
1. Reinitialize Tauri in the project
2. Verify Cargo.toml setup
3. Set up proper Rust code structure

## 🏃‍♂️ Next Steps (After Fix)
1. Add Rust code for menubar functionality:
   - Window positioning
   - Click handling
   - System tray integration
2. Test initial setup
3. Implement window management

## 🎯 Immediate Tasks
1. Remove current src-tauri directory
2. Run `npm create tauri-app@latest` to reinitialize
3. Copy our configuration changes to new setup:
   - Window configuration
   - Tray icon setup
   - Build settings

## 📝 Testing Steps
1. After reinitialization:
   ```bash
   npm run tauri dev
   ```
   Expected behavior:
   - Main window should appear
   - System tray icon should be visible
   - Clicking tray icon should show menubar

## 🐛 Known Issues
1. ✅ Fixed: Updated `systemTray` to `trayIcon` in Tauri config
2. 🚨 Current: Tauri project structure needs reinitialization
3. Next: Will need to implement Rust code for window management

## 🧠 Core Logic & Testing Plan (Step 4)

### 1. Review and Document Current Logic
- [x] Map out current circadian phase logic (done: see useCircadianPhase, circadian.ts, time.ts)
- [x] Identify integration points in UI (done: PhaseWidget, TimerDisplay)

### 2. Unit Tests for Core Functions
- [ ] Write unit tests for circadian phase calculation (getCurrentPhase)
- [ ] Write unit tests for time utilities (getPhaseProgress, getTimeUntilHour, formatTimeRemaining, formatTime)

### 3. Hook Testing
- [ ] Write tests for useCircadianPhase (mocking time, checking phase transitions)
- [ ] Test nextPhase logic and allPhases output

### 4. Integration Testing
- [ ] Simulate different times of day and verify correct phase and timer display in UI
- [ ] Test edge cases (midnight, phase boundaries, DST changes)

### 5. Documentation & Code Comments
- [ ] Add comments to core logic for clarity
- [ ] Document expected behavior and edge cases

### 6. Continuous Updates
- [ ] Update this plan and check off items as progress is made 