asks.md
Project Initialization
Navigate to project directory

Start: Terminal open

End: In ~/Documents/Work/Coding Sideprojects/Circadian Rythm App

sh
Copy code
cd ~/Documents/Work/Coding\ Sideprojects/Circadian\ Rythm\ App
Initialize React + Vite app

Start: In project directory

End: Vite React TypeScript template files present

sh
Copy code
npm create vite@latest . -- --template react-ts
Install dependencies

Start: Fresh Vite app

End: All npm dependencies installed

sh
Copy code
npm install
Add Tauri to project

Start: Vite app set up

End: Tauri config files and src-tauri/ folder present

sh
Copy code
npm create tauri-app@latest
Create initial folder structure

Start: Only default Vite structure

End:

src/components/, src/services/, src/hooks/, src/utils/, public/ created

sh
Copy code
mkdir -p src/components src/services src/hooks src/utils public
Circadian Logic (Core Service)
Create circadian phase configuration

Start: No circadian data

End: JSON or TS array defining default phases with start/end times

Implement phase calculation utility (src/services/circadian.ts)

Start: No logic

End: Function takes current time, returns current phase object

Write simple unit test for phase calculation

Start: No test

End: Test confirms correct phase returned for sample times

React State Layer
Create circadian context or hook (src/hooks/useCircadianPhase.ts)

Start: No hook

End: Hook returns current phase, next phase, time left, updates on interval

Test hook for correct output (console or test UI)

Start: Hook written

End: Logs correct values or displays in test component

UI Components
Create PhaseWidget.tsx

Start: No component

End: Renders current phase name and color, given props

Create TimerDisplay.tsx

Start: No timer component

End: Renders countdown and end time given timeLeft and phase end

Integrate hook and components in App.tsx

Start: Separate pieces

End: App renders live phase and timer; data flows correctly

Test UI for phase changes across times

Start: Components wired

End: App visually updates as time/phase changes (simulate by changing system clock or mock time)

Menubar Integration
Setup Tauri menubar/tray UI (src/main.ts)

Start: App launches as window

End: App appears as Mac menubar/tray app

Render React UI in menubar

Start: Menubar runs, but blank

End: PhaseWidget and TimerDisplay visible from menubar

Test menubar for updates

Start: UI shows static info

End: UI live updates in menubar as time passes

Utility and Time Handling
Implement time utility helpers (src/utils/time.ts)

Start: Raw JS dates in code

End: Functions for time math, formatting, and conversions

Test time utilities

Start: Helpers written

End: Each helper outputs expected values (unit test or console)

Health Data Stub (For Later Integration)
Create health data service stub (src/services/healthkit.ts)

Start: No health data layer

End: Function returns mock health data (resolved promise)

Test health data stub

Start: Stub exists

End: Can call and receive expected mock output

Quality-of-Life & Polish
Add icon and branding to menubar

Start: Default icon

End: Custom circadian/ADHD icon shows in menubar

Basic error/logging on phase or timer errors

Start: No error handling

End: Errors logged or shown in UI if logic fails

Write README and usage instructions

Start: No documentation

End: README.md describes setup, test, and run steps

Ready for Next Steps
All tasks are atomic. Test after each before continuing.

Add new features (settings, sync, healthkit integration) as new task lists after MVP.