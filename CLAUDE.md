# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Tauri-based desktop application for tracking circadian and ultradian rhythms, built with React, TypeScript, and Tailwind CSS. The app provides real-time visualization of 24-hour circadian cycles and 90-minute ultradian energy cycles with precise timing and sophisticated visualizations.

**NEW: Real Health Data Integration** - The app now analyzes personal HealthKit data (heart rate, sleep, activity) to provide personalized circadian rhythm insights and predictions based on actual physiological patterns.

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
- `src/services/healthDataParser.ts`: HealthKit XML parser for real health data
- `src/services/realDataCircadian.ts`: Personal circadian analysis engine
- `src/components/UltradianDashboard.tsx`: Main minimal dashboard component
- `src/components/PredictiveAnalytics.tsx`: Data-rich prediction interface
- `src/components/HealthDataImporter.tsx`: Health data import UI
- `src/components/App.tsx`: Main application component with real-time updates

## Key Features

### Real Health Data Integration
- **HealthKit XML Parser**: Processes 225K+ health records from Apple Health exports
- **Personal Circadian Analysis**: Calculates individual wake/sleep times from actual data
- **Heart Rate Integration**: Live heart rate monitoring with prediction adjustments
- **Sleep Efficiency Analysis**: Real sleep quality metrics and recommendations
- **Energy Peak Detection**: Identifies personal energy patterns from physiological data

### Minimal Dashboard UI
- **UltradianDashboard**: Clean, focused view of current 90-minute cycle
- **Live Countdown Timer**: MM:SS format with real-time seconds updates
- **Energy Phase Indicators**: Color-coded High/Low/Transition states with intensity
- **24-Hour Time Axis**: Wave visualization with actual clock times
- **Confidence Scoring**: Live data reliability indicators

### Predictive Analytics
- **6-Hour Forecasting**: Upcoming energy peaks, troughs, and optimal windows
- **Heart Rate Variance**: Real-time comparison with expected patterns
- **Personal Insights**: Data-driven recommendations based on individual patterns
- **2-Hour Energy Graph**: Visual timeline of predicted energy levels

### State Management
- Global state managed through Zustand
- Real-time clock updates via `setInterval` in main App component
- Health data analysis state for personalized rhythms
- Simulated heart rate for demo when real data unavailable

## Technical Implementation

### Health Data Processing
- `src/services/healthDataParser.ts`: Parses HealthKit XML exports with comprehensive record types
- `src/services/realDataCircadian.ts`: Analyzes personal patterns and generates predictions
- Heart rate analysis with confidence scoring based on variance from expected patterns
- Sleep pattern analysis from actual sleep/wake records over 30-day periods
- Energy peak detection using heart rate data and plateau-aware algorithms

### Rhythm Calculations
Real-time calculations with second-level precision:
- Current ultradian cycle position (0-90 minutes) with energy phase detection
- Personal wake/sleep time calculation from historical sleep data
- Energy intensity modeling using sine wave patterns with real data adjustments
- Predictive modeling for next 6 hours based on personal patterns

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

Latest implementation focuses on:
1. **Real Health Data Integration**: Personal HealthKit data analysis for individualized rhythms
2. **Minimal Dashboard Design**: Clean, focused UI prioritizing current ultradian cycle status
3. **Predictive Analytics**: Data-driven forecasting with confidence scoring and recommendations
4. **Live Data Synchronization**: Heart rate integration with real-time adjustments to predictions
5. **Performance Optimization**: Efficient processing of large health datasets (225K+ records)

## Performance Considerations

- Real-time updates every second require efficient rendering
- State management optimized for frequent timer updates
- Component re-rendering minimized through proper React optimization
- Tauri provides native performance for desktop integration