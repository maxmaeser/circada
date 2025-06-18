Circadian Rhythm ADHD App — Architecture (architecture.md)
1. File & Folder Structure
text
Copy code
/circadian-app
│
├── src/
│   ├── components/          # UI components (PhaseWidget, TimerDisplay, etc.)
│   ├── services/            # Data fetching, circadian phase logic, integrations
│   ├── hooks/               # React hooks for state, timers, phase calculation
│   ├── utils/               # Utilities (date/time, phase calculations)
│   ├── App.tsx              # App entry (React)
│   ├── main.ts              # Tauri main process
│   └── index.html           # Base HTML
│
├── public/                  # Static files, icons, assets
├── tauri.conf.json          # Tauri config
├── package.json             # Node dependencies
├── README.md
└── architecture.md          # This file
2. High-Level Overview
Frontend:

React (can use Next.js in SPA mode, but Tauri+CRA/Vite is simplest for desktop).

Main UI: shows current circadian phase, phase name, time left in phase, and the next phase.

Minimal, distraction-free design, widget/menubar optimized.

Backend:

Supabase planned for cloud sync/user auth, but not required for MVP.

All circadian logic and state is client-side for now.

Health data: Placeholder/mock service; future: bridge native Apple Health data via Tauri plugin or Swift bridge.

App Packaging:

Tauri manages the menubar app (small binary, secure).

For MacOS: tauri-plugin-positioner or similar to place in menubar.

3. Folder/Files — Roles
Path	Purpose / Contents
src/components/	UI widgets: PhaseWidget.tsx, TimerDisplay.tsx, MenuBar.tsx
src/services/	Circadian logic: circadian.ts, future: healthkit.ts
src/hooks/	Custom hooks: useCircadianPhase.ts, useTimer.ts
src/utils/	Helper functions, e.g. time math
src/App.tsx	Main app, wires up state, context
src/main.ts	Tauri backend entry point, system APIs, bridge to healthkit later
public/	Icons, static assets
tauri.conf.json	App config, menubar/permissions
package.json	Dependencies

4. Where State Lives & How Services Connect
Circadian State:

Global app state using React Context or Redux (very light).

State includes:

Current phase ({ name, startTime, endTime, timeLeft })

All phases for the day (Array)

Timer status

(Future) Health data

Services:

circadian.ts — logic for calculating which phase based on clock time, phase config (ADHD defaults, user override).

(Future) healthkit.ts — native bridge, pulls in sleep/activity data for phase adjustment.

(Future) Supabase — for user prefs, multi-device sync.

UI ↔ State:

Main App pulls circadian state from hook/context.

Components (PhaseWidget, TimerDisplay) consume this state and re-render live.

Menubar UI displays phase, icon, timer.

5. Sample Folder Breakdown
text
Copy code
src/
├── components/
│   ├── PhaseWidget.tsx          # Shows phase name, color, time left
│   ├── TimerDisplay.tsx         # Shows countdown + clock time
│   └── MenuBar.tsx              # Handles menubar integration
│
├── services/
│   ├── circadian.ts             # All logic for phase timing (input: time, output: phase)
│   └── healthkit.ts             # (stub for now)
│
├── hooks/
│   ├── useCircadianPhase.ts     # Returns current phase, time left
│   └── useTimer.ts              # Handles interval updates
│
├── utils/
│   └── time.ts                  # Time math, conversions
│
├── App.tsx                      # Main app wiring
├── main.ts                      # Tauri main process (tray/menubar setup)
└── index.html
6. State & Data Flow
mermaid
Copy code
flowchart TD
    A[System Time / Health Data] --> B{Circadian Phase Logic}
    B --> C[React App State]
    C --> D[PhaseWidget]
    C --> E[TimerDisplay]
    D & E --> F[Menubar UI]
System time is polled to determine the phase.

Circadian phase logic returns current phase, time left, next phase.

State is updated via React hooks/context.

UI auto-updates in menubar.

7. Basic Setup Commands
sh
Copy code
# 1. Init project folder
mkdir circadian-app && cd circadian-app

# 2. Init Tauri + React (Vite is lightest)
npm create vite@latest . -- --template react-ts
npm install
npm install --save @tauri-apps/api

# 3. Add Tauri
npm create tauri-app@latest

# 4. Add folders
mkdir -p src/components src/services src/hooks src/utils public

# 5. Run the app (MacOS)
npm run tauri dev
8. Planning for Apple Health Data Integration
Tauri can use native plugins, but you’ll need a Swift/Objective-C bridge for HealthKit.

For now: mock health data in healthkit.ts (with stubbed async API).

Later:

Build a Swift macOS service, expose a local API or Tauri plugin.

Fetch health data and feed into circadian logic.

9. Why This Stack?
Tauri + React: Lightweight, native-feel, fast, works on MacOS/iOS/Windows later.

React state: Easy to maintain, test, and evolve as you add features.

Supabase: Optional—future for user cloud sync.

Easy to open source, easy to extend to widgets, menubar, or companion mobile apps.