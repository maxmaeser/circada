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
│   │   ├── TimerDisplay.tsx # Timer component
│   │   ├── WaveVisualization.tsx # Ultradian rhythm wave display
│   │   ├── UltradianZoomView.tsx # Detailed 90-min cycle view
│   │   ├── UltradianZoomedGraph.tsx # Enhanced cycle graph
│   │   └── ui/              # shadcn/ui components
│   ├── hooks/              # React hooks
│   │   └── useCircadianPhase.ts # Circadian phase state management
│   ├── services/           # Business logic
│   │   └── circadian.ts    # Core circadian rhythm calculations
│   └── utils/              # Utility functions
│       └── time.ts         # Time formatting and calculations
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

## Current Features

### Core Functionality
- **Circadian Phase Tracking**: Real-time detection of current circadian phase with 24-hour timeline
- **Ultradian Rhythm Analysis**: Detailed 90-minute cycle tracking with energy wave visualization
- **Live Timer System**: Second-level precision countdown timers for both circadian and ultradian cycles
- **Enhanced Progress Visualization**: Color-coded timeline with real-time position indicators

### Ultradian Zoom View (Primary Feature)
- **Detailed Cycle View**: Focused 90-minute cycle visualization with precise time tracking
- **Energy Phase Detection**: Automatic detection of High Energy (0-60min) and Low Energy (60-90min) phases
- **Real-time Intensity Calculation**: Dynamic energy intensity percentage with realistic curve modeling
- **Floating Countdown Timer**: Large, prominent timer showing exact time remaining in current cycle
- **Full-width Energy Graph**: Sophisticated SVG-based wave visualization with:
  - Color-coded energy phase backgrounds
  - 10-minute time grid markers
  - Moving position indicator
  - Realistic energy curve with micro-variations

### UI/UX Enhancements
- **Priority Layout**: Ultradian zoom view positioned as top card for primary focus
- **Color-coded Headers**: Dynamic background colors matching current energy phase
- **Live Updates**: All timers and indicators update every second
- **Responsive Design**: Clean, modern interface with proper visual hierarchy
- **Enhanced Typography**: Large, readable fonts for critical information

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