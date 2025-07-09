# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Tauri-based desktop application for tracking circadian and ultradian rhythms, built with React, TypeScript, and Tailwind CSS. The app provides real-time visualization of 24-hour circadian cycles and 90-minute ultradian energy cycles with precise timing and sophisticated visualizations.

**NEW: Live HealthKit Integration** - The app now features real-time heart rate streaming from HealthKit with live cycle adjustments, personalized circadian analysis from historical data, and comprehensive Swift FFI bridge for native macOS integration.

## Development Commands

```bash
# Development mode (React only)
npm run dev

# Desktop app development with hot-reload
npm run tauri dev

# Build for production
npm run build

# Run tests
npm test

# Lint code
npm run lint

# Start preview server
npm run preview
```

## Project Architecture

### Core Structure
- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Desktop**: Tauri (Rust) for native macOS integration
- **State Management**: Zustand for global state
- **UI Components**: shadcn/ui components with custom rhythm tracking components
- **Styling**: Tailwind CSS with custom themes and dynamic color system

### Key Directories
- `src/components/`: React components, including specialized rhythm tracking UI
- `src/services/`: Core business logic for health data and rhythm analysis
- `src-tauri/`: Rust code for desktop integration
- `public/`: Static assets including health data XML files

### Critical Files
- `src-tauri/src/healthkit.swift`: Swift HealthKit bridge for live heart rate monitoring
- `src-tauri/src/healthkit_ffi.rs`: Rust FFI bindings with safe fallback to mock implementations
- `src/services/liveHealthKit.ts`: TypeScript live data service with cycle adjustment algorithms
- `src/services/healthDataParser.ts`: HealthKit XML parser for historical health data analysis
- `src/services/realDataCircadian.ts`: Personal circadian analysis engine
- `src/services/trayUpdater.ts`: Real-time menubar tray icon updater service
- `src/components/UltradianDashboard.tsx`: Main minimal dashboard component
- `src/components/PredictiveAnalytics.tsx`: Data-rich prediction interface with 6-hour forecasting
- `src/components/MenubarWidget.tsx`: High-performance system tray widget (legacy)
- `src/components/App.tsx`: Main application component with live HealthKit integration

## Key Features

### Live HealthKit Integration
- **Real-time Heart Rate Streaming**: Swift FFI bridge for continuous HealthKit monitoring
- **Live Cycle Adjustments**: Dynamic ultradian cycle modifications based on heart rate patterns
- **Background Processing**: Efficient background delivery for minimal battery impact
- **Safe Fallback System**: Automatic mock implementations when HealthKit unavailable
- **Historical Data Analysis**: Processes 225K+ health records from Apple Health exports
- **Personal Circadian Analysis**: Calculates individual wake/sleep times from actual data
- **Sleep Efficiency Analysis**: Real sleep quality metrics and recommendations
- **Energy Peak Detection**: Identifies personal energy patterns from physiological data

### Minimal Dashboard UI
- **UltradianDashboard**: Clean, focused view of current 90-minute cycle
- **Live Countdown Timer**: MM:SS format with real-time seconds updates
- **Energy Phase Indicators**: Color-coded High/Low/Transition states with intensity
- **24-Hour Time Axis**: Wave visualization with actual clock times
- **Live Data Indicators**: Visual indicators when real HealthKit data is streaming
- **Confidence Scoring**: Live data reliability indicators based on heart rate variance

### Native Menubar Integration
- **Live Menubar Timer**: Real-time countdown timer displayed in macOS menubar
- **Phase Arrow Indicators**: Dynamic arrows showing current energy phase (↗ transition, → high energy, ↘ low energy)
- **Synchronized Timing**: Menubar timer matches main app calculations exactly
- **Native Text Display**: Clean text-only menubar item with no background or icons
- **Automatic Updates**: Timer updates every second showing MM:SS format countdown
- **Phase Transitions**: Seamless transitions between 90-minute ultradian cycle phases

### Predictive Analytics
- **6-Hour Forecasting**: Upcoming energy peaks, troughs, and optimal windows
- **Heart Rate Variance**: Real-time comparison with expected patterns
- **Personal Insights**: Data-driven recommendations based on individual patterns
- **2-Hour Energy Graph**: Visual timeline of predicted energy levels

### State Management
- Global state managed through Zustand
- Real-time clock updates via `setInterval` in main App component
- Live HealthKit integration state with automatic fallback
- Health data analysis state for personalized rhythms
- Live cycle adjustment state for real-time modifications

## Technical Implementation

### Live HealthKit Integration
- `src-tauri/src/healthkit.swift`: Complete Swift HealthKit bridge with real-time monitoring
- `src-tauri/src/healthkit_ffi.rs`: Safe Rust FFI bindings with panic handling and fallback
- `src/services/liveHealthKit.ts`: TypeScript service for live data streaming via Tauri events
- `src-tauri/build.rs`: Comprehensive Swift compilation pipeline for production builds
- Background delivery for continuous updates with minimal battery impact
- Automatic permissions handling and availability detection

### Health Data Processing
- `src/services/healthDataParser.ts`: Parses HealthKit XML exports with comprehensive record types
- `src/services/realDataCircadian.ts`: Analyzes personal patterns and generates predictions
- Heart rate analysis with confidence scoring based on variance from expected patterns
- Sleep pattern analysis from actual sleep/wake records over 30-day periods
- Energy peak detection using heart rate data and plateau-aware algorithms
- Live cycle adjustment algorithms for real-time rhythm modifications

### Rhythm Calculations
Real-time calculations with second-level precision:
- Current ultradian cycle position (0-90 minutes) with energy phase detection
- Personal wake/sleep time calculation from historical sleep data
- Energy intensity modeling using sine wave patterns with real data adjustments
- Predictive modeling for next 6 hours based on personal patterns

### Menubar Integration
- `src/services/trayUpdater.ts`: Real-time tray icon title updates using Tauri commands
- `src-tauri/src/lib.rs`: Rust command `update_tray_title` for native tray icon text updates
- Synchronized timing calculations matching main app logic exactly
- Native macOS menubar text display without background or icon artifacts
- Automatic cleanup on application unmount to prevent memory leaks

### UI Architecture
- Component-based architecture with specialized rhythm tracking components
- Real-time updates through React hooks and Zustand store
- Responsive design with Tailwind CSS utilities
- Custom theme system with HSL color variables

### Testing
- Jest configuration for unit testing
- Test files alongside source files with `.test.ts` extension
- Focus on testing core rhythm calculation logic
- Mock time utilities for consistent testing

## Development Guidelines

### Code Organization
- Keep rhythm calculation logic separate from UI components
- Use the comprehensive library index (`src/lib/index.ts`) for clean imports
- Follow existing TypeScript patterns and type definitions
- Maintain component modularity for rhythm tracking features

### Styling Approach
- Use Tailwind CSS utilities consistently
- Leverage the custom theme system for color management
- Follow shadcn/ui patterns for component styling
- Maintain responsive design principles

### State Management
- Use Zustand for global state management
- Keep component-specific state local when appropriate
- Implement proper TypeScript interfaces for state shapes
- Handle real-time updates through centralized timing

## Tauri Integration

### Configuration
- Main window and menubar configurations in `src-tauri/tauri.conf.json`
- Multiple entry points: `index.html` (main) and `menubar.html` (compact view)
- Native macOS integration with system tray support
- macOS 13.0+ minimum version for HealthKit compatibility
- Swift compilation integration in build process

### Development Flow
- Frontend development: `npm run dev` for web-based development
- Desktop development: `npm run tauri dev` for native app testing
- Build process handles React, Rust, and Swift compilation
- Live HealthKit integration automatically enabled in production

## Testing Strategy

### Unit Tests
- Focus on core rhythm calculation functions
- Test edge cases around phase transitions and midnight boundaries
- Mock time utilities for consistent test execution
- Verify state management logic

### Integration Testing
- Test component interactions with rhythm calculations
- Verify real-time updates and timing accuracy
- Test theme switching and persistence

## Current Focus Areas

Latest implementation focuses on:
1. **Live HealthKit Integration**: Real-time heart rate streaming with Swift FFI bridge
2. **Dynamic Cycle Adjustments**: Live modifications to ultradian cycles based on physiological data
3. **Minimal Dashboard Design**: Clean, focused UI prioritizing current ultradian cycle status
4. **Predictive Analytics**: Data-driven forecasting with confidence scoring and recommendations
5. **Native Menubar Timer**: Real-time countdown timer with phase arrows in macOS menubar
6. **Performance Optimization**: Efficient processing of large health datasets (225K+ records)

## Performance Considerations

- Real-time updates every second require efficient rendering
- State management optimized for frequent timer updates
- Component re-rendering minimized through proper React optimization
- Live HealthKit integration optimized for minimal battery impact
- Swift FFI bridge provides native performance for health data processing
- Background delivery ensures continuous monitoring without performance degradation
- Tauri provides native performance for desktop integration
- Native menubar timer updates use efficient Rust commands for minimal overhead
- TrayUpdater service designed for minimal memory footprint and CPU usage