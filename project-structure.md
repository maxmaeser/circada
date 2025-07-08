# Project Structure

## Overview
The project is split into two main parts:
1. Frontend (React/Vite) application
2. Tauri desktop integration

## Directory Structure

```
circada/                      # Root project directory
├── src/                      # Frontend source code
│   ├── components/          # React components
│   │   ├── MenubarView.tsx  # Menubar interface
│   │   ├── PhaseWidget.tsx  # Main phase display
│   │   └── TimerDisplay.tsx # Timer component
│   ├── hooks/              # React hooks
│   ├── services/           # Business logic
│   └── utils/              # Utility functions
│
├── src-tauri/              # Desktop app integration
│   ├── src/               # Rust source code
│   │   ├── main.rs       # Main entry point
│   │   └── lib.rs        # Shared library code
│   ├── capabilities/     # Tauri capability configs
│   ├── icons/           # App icons
│   ├── Cargo.toml       # Rust dependencies
│   └── tauri.conf.json  # Tauri configuration
│
├── public/               # Static assets
├── menubar.html         # Menubar window entry
└── index.html           # Main window entry

## Key Files

### Frontend
- `index.html`: Main application entry point
- `menubar.html`: Menubar interface entry point
- `vite.config.ts`: Build and development configuration
- `src/components/MenubarView.tsx`: Compact menubar UI
- `src/components/PhaseWidget.tsx`: Main phase display
- `src/services/circadian.ts`: Phase calculation logic

### Tauri Integration
- `src-tauri/tauri.conf.json`: Window and tray configuration
- `src-tauri/src/main.rs`: Desktop app initialization
- `src-tauri/Cargo.toml`: Rust dependencies

## Configuration Files
- `package.json`: Node.js dependencies
- `tsconfig.json`: TypeScript configuration
- `vite.config.ts`: Build tool configuration
- `tauri.conf.json`: Desktop app configuration

## Development Workflow
1. Frontend development:
   ```bash
   npm run dev
   ```
   - Main app: http://localhost:1420
   - Menubar: http://localhost:1420/menubar.html

2. Desktop app development:
   ```bash
   npm run tauri dev
   ```
   - Builds and runs both frontend and desktop components
   - Hot-reloading for frontend changes
   - Rebuild required for Rust changes

## Build Outputs
- `dist/`: Frontend build output
- `src-tauri/target/`: Desktop app binaries 