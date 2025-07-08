# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Tauri-based desktop application for tracking circadian and ultradian rhythms, built with React, TypeScript, and Tailwind CSS. The app provides real-time visualization of 24-hour circadian cycles and 90-minute ultradian energy cycles with precise timing and sophisticated visualizations.

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
- `src/lib/`: Core business logic, utilities, and state management
- `src-tauri/`: Rust code for desktop integration
- `src/lib/index.ts`: Comprehensive library exports for all modules

### Critical Files
- `src/lib/circadian.ts`: Core circadian rhythm calculation algorithms
- `src/lib/ultradian.ts`: 90-minute ultradian cycle calculations
- `src/lib/store.ts`: Zustand store for application state
- `src/lib/themeStore.ts`: Theme management with localStorage persistence
- `src/components/App.tsx`: Main application component with real-time updates

## Key Features

### Rhythm Tracking
- **Circadian Phases**: 24-hour daily cycle tracking with 6 distinct phases
- **Ultradian Cycles**: 90-minute energy cycles with High/Low energy phases
- **Real-time Updates**: Second-level precision timing throughout the application
- **Visual Indicators**: Color-coded phases, progress bars, and countdown timers

### Specialized Components
- `UltradianZoomView`: Primary detailed 90-minute cycle visualization
- `CircadianWave`: 24-hour overview with wave visualization
- `PhaseGrid`: Phase information and timing displays
- `RhythmTimeline`: Interactive timeline with real-time positioning

### State Management
- Global state managed through Zustand
- Real-time clock updates via `setInterval` in main App component
- Theme persistence via localStorage
- Comprehensive type definitions in `src/lib/types.ts`

## Technical Implementation

### Rhythm Calculations
The core rhythm logic is implemented in:
- `src/lib/circadian.ts`: Phase detection and timing calculations
- `src/lib/ultradian.ts`: 90-minute cycle analysis
- `src/lib/math.ts`: Mathematical utilities for wave calculations
- `src/lib/phaseDetection.ts`: Advanced phase detection algorithms

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

### Development Flow
- Frontend development: `npm run dev` for web-based development
- Desktop development: `npm run tauri dev` for native app testing
- Build process handles both React compilation and Rust compilation

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

Based on the task files and recent development:
1. **Ultradian Zoom View**: Enhanced 90-minute cycle visualization with detailed energy tracking
2. **Menubar Integration**: Compact system tray interface for quick rhythm checking
3. **Real-time Precision**: Second-level timing accuracy throughout the application
4. **Visual Enhancements**: Sophisticated wave visualizations and progress indicators

## Performance Considerations

- Real-time updates every second require efficient rendering
- State management optimized for frequent timer updates
- Component re-rendering minimized through proper React optimization
- Tauri provides native performance for desktop integration