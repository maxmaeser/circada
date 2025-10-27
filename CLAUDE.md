# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Circada** is a production-ready macOS application for tracking circadian and ultradian rhythms, built with React, TypeScript, Tailwind CSS, and Tauri. The app provides real-time visualization of 24-hour circadian cycles and 90-minute ultradian energy cycles with precise timing and sophisticated visualizations.

**PRODUCTION READY**: Complete macOS app with live HealthKit integration, real-time heart rate streaming, interactive wave visualizations, native menubar timer, and comprehensive distribution setup. Available as a universal macOS app bundle supporting both Intel and Apple Silicon architectures.

## Development Commands

```bash
# Development mode (React only)
npm run dev

# Desktop app development with hot-reload
npm run tauri dev

# Build frontend only
npm run build

# Build complete macOS app (development)
npm run build:dev

# Build complete macOS app (production release)
npm run build:release

# Build universal macOS app for distribution
npm run build:universal

# Run tests
npm test

# Lint code
npm run lint

# Start preview server
npm run preview

# Bump version and create release tag
npm run version:bump 1.0.1
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
- `src/components/UltradianDashboard.tsx`: Main dashboard with interactive wave visualization
- `src/components/PredictiveAnalytics.tsx`: Data-rich prediction interface with 6-hour forecasting
- `src/components/BurgerMenu.tsx`: Unified developer tools and settings interface
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

### Enhanced Dashboard UI
- **UltradianDashboard**: Clean, focused view of current 90-minute cycle with 6-phase system
- **Live Countdown Timer**: MM:SS format with real-time seconds updates
- **6-Phase Energy Icons**: ↗ Rising, ↑ Building, 🔥 Peak, ⚡ Flow, ↘ Winding, 😴 Rest
- **Adaptive Icon Colors**: Icons automatically adjust color based on background brightness
- **Interactive Wave Visualization**: SVG-based circadian and ultradian rhythm waves with hover tooltips
- **Energy-based Space Backgrounds**: Dynamic gradient backgrounds correlating with energy levels
- **Real-time Data Overlay**: Live heart rate and energy intensity display on hover
- **Live Data Indicators**: Visual indicators when real HealthKit data is streaming
- **Confidence Scoring**: Live data reliability indicators based on heart rate variance

### Native Menubar Integration
- **Live Menubar Timer**: Real-time countdown timer displayed in macOS menubar
- **6-Phase Icon System**: Dynamic icons showing precise energy phase (↗↑🔥⚡↘😴)
- **Synchronized Timing**: Menubar timer matches main app calculations exactly
- **Native Text Display**: Clean text-only menubar item with no background or icons
- **Automatic Updates**: Timer updates every second showing MM:SS format countdown
- **Phase Transitions**: Seamless transitions between 90-minute ultradian cycle phases

### Burger Menu Interface
- **Unified Controls**: All developer tools and settings consolidated in single hamburger menu
- **Theme Selector**: Complete theme switching (Night, Light, Terminal) within dropdown
- **Mock Data Testing**: Import testing functionality integrated into menu interface
- **Mock Analysis Engine**: Full circadian analysis with ultradian cycles, sleep efficiency, and ADHD detection
- **Collapsible Results**: Persistent status display showing test and analysis results when menu closed
- **Copy Functionality**: One-click JSON export of analysis results with clipboard feedback
- **Clean UI**: Removes clutter from main interface while preserving all functionality

### Predictive Analytics & Recommendations
- **6-Hour Forecasting**: Upcoming energy phases with specific activity suggestions
- **Phase-Specific Guidance**: Actionable advice for each energy state
- **Visual Predictions**: Color-coded icons showing future energy levels
- **Activity Optimization**: Specific work types recommended for each phase
- **Smart Scheduling**: Plan tasks around natural energy rhythms
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

## Current Status - PRODUCTION READY ✅

Latest implementation is complete and production-ready:
1. **✅ Live HealthKit Integration**: Real-time heart rate streaming with Swift FFI bridge
2. **✅ Interactive Wave Visualization**: SVG-based circadian and ultradian rhythm display with hover tooltips
3. **✅ Burger Menu Interface**: Unified developer tools consolidating theme selector and mock analysis
4. **✅ Predictive Interface**: Phase-specific recommendations and 6-hour forecasting
5. **✅ Native Menubar Timer**: Real-time countdown timer with phase arrows in macOS menubar
6. **✅ macOS App Distribution**: Complete app bundle with DMG installer and entitlements
7. **✅ Production Build System**: Automated build scripts for development and release
8. **✅ Auto-Update System**: Automatic updates via GitHub Releases with manual check option

## macOS Widget Implementation - COMPLETED ✅

### Widget Status
Native macOS desktop widget successfully implemented with perfect visual parity to the main dashboard card:

**Completed Features:**
- **Complete SwiftUI Widget**: Production-ready widget with exact dashboard replica
- **Responsive Design**: Adapts to Medium and Large widget sizes automatically
- **Real-time Updates**: Timeline provider refreshes every minute for accurate timing
- **App Groups Integration**: Secure data sharing between main app and widget
- **Dynamic Text Scaling**: Automatic text compression for different widget sizes
- **Fallback Data System**: Widget functions independently when main app is offline

**Widget Location:**
- `widget-extension/CricadianWidgetHost/CircadianWidget/CircadianWidget.swift`
- Complete implementation with data models, timeline provider, and responsive UI

**Key Implementation Details:**
- Uses `@Environment(\.widgetFamily)` for responsive sizing
- Implements `minimumScaleFactor` for text overflow handling
- Perfect layout centering with 3-column structure
- Conditional rendering for optional data (heart rate)
- HSL color parsing for dynamic backgrounds
- App Groups: `group.com.circada.app` for data sharing

### Technical Architecture
- **SwiftUI Widget Framework**: Native macOS widget using WidgetKit
- **Data Bridge**: Secure App Groups container for main app ↔ widget communication
- **Timeline Provider**: Efficient refresh system with 1-minute intervals
- **Fallback Calculations**: Independent cycle calculations when main app offline
- **Code Signing**: Proper bundle identifier hierarchy for distribution

## macOS App Distribution - COMPLETED ✅

### Distribution Status
Complete macOS application ready for production use and distribution:

**Completed Distribution Features:**
- **Universal macOS App**: Native app bundle supporting Intel + Apple Silicon
- **DMG Installer**: Self-contained installer package for easy distribution
- **Code Signing Ready**: Entitlements and configuration for Apple Developer Program
- **App Store Preparation**: Proper bundle ID, category, and metadata configuration
- **Automated Build System**: Scripts for development and release builds

**App Information:**
- **Bundle ID**: `com.circada.app`
- **Version**: 1.0.0
- **Category**: Healthcare and Fitness
- **Minimum macOS**: 13.0 (Ventura)
- **Architecture**: Universal (Intel + Apple Silicon)
- **App Size**: ~40MB
- **Installation**: Available in `/Applications/Circada.app`

**Distribution Files:**
- `scripts/build-release.sh`: Production build script
- `scripts/dev-build.sh`: Development build script  
- `src-tauri/entitlements.plist`: App sandbox and HealthKit entitlements
- `README-DISTRIBUTION.md`: Complete distribution documentation
- `build/debug/Circada.app`: Ready-to-use application bundle
- `build/debug/Circada_1.0.0_aarch64.dmg`: DMG installer

### Build Commands
```bash
# Development build
npm run build:dev

# Production release build
npm run build:release

# Universal build for distribution
npm run build:universal
```

## Auto-Update System - COMPLETED ✅

### Update System Status
Automatic update system fully implemented using Tauri's updater plugin with GitHub Releases. Users automatically receive updates without manual intervention.

**Completed Features:**
- **Automatic Update Checks**: App checks for updates on startup
- **Manual Update Check**: "Check for Updates" button in Burger Menu
- **Auto-Download and Install**: Updates download and install automatically
- **Progress Tracking**: Real-time download progress with percentage display
- **Update Notifications**: Visual indicators (icons, text, progress bars) for update status
- **GitHub Releases Integration**: Updates distributed via GitHub Releases
- **Version Management**: Automated version bumping and git tagging

**Update Behavior:**
- Checks on app startup (silent, non-blocking, automatic)
- Manual check available in Burger Menu → App Updates section
- Downloads update automatically when available
- Shows download progress with live percentage updates
- Relaunches app automatically to apply update
- No user interaction required (fully automated)

### Key Files

**Backend (Rust/Tauri)**:
- `src-tauri/Cargo.toml:11-14` - Declares `tauri-plugin-updater` dependency
- `src-tauri/src/lib.rs:15-20` - Initializes updater plugin
- `src-tauri/tauri.conf.json:40` - Bundle config: `createUpdaterArtifacts: true`
- `src-tauri/tauri.conf.json:60-70` - Plugin config: endpoints and pubkey

**Frontend (TypeScript/React)**:
- `src/services/updateService.ts` - Complete update service (171 lines)
  - Singleton pattern with subscribe/notify
  - State management: idle, checking, available, downloading, ready, upToDate, error
  - Automatic download when update detected
- `src/App.tsx:30-40` - Startup update check
- `src/components/BurgerMenu.tsx:29-36` - Update state subscription
- `src/components/BurgerMenu.tsx:209-241` - Update UI display

**CI/CD & Scripts**:
- `.github/workflows/release.yml` - Automated release workflow (94 lines)
  - Builds universal macOS app
  - Creates `latest.json` manifest
  - Uploads to GitHub Releases
- `scripts/bump-version.sh` - Version management script (91 lines)
  - Updates package.json and tauri.conf.json
  - Creates git commit and tag
- `package.json:17` - Version bump command: `npm run version:bump`

**Documentation**:
- `AUTO_UPDATE.md` - Comprehensive technical documentation (400+ lines)
  - Architecture diagrams
  - Component breakdowns
  - Configuration reference
  - Testing procedures
  - Troubleshooting guide
- `RELEASE_CHECKLIST.md` - Step-by-step release guide (150+ lines)
  - Pre-release validation
  - Release process steps
  - Post-release tasks
  - Rollback procedures

### Quick Start: Creating a Release

**Simple 4-Step Process**:

```bash
# 1. Bump version and create tag
npm run version:bump 1.0.1

# 2. Push tag (triggers GitHub Actions)
git push origin v1.0.1

# 3. Push commit
git push

# 4. Monitor at https://github.com/maxmaeser/circada/actions
```

**What Happens Automatically**:
1. ✅ GitHub Actions builds universal macOS app (~10-15 minutes)
2. ✅ DMG installer created
3. ✅ `latest.json` manifest generated
4. ✅ GitHub Release created with assets
5. ✅ All users automatically receive update

**Verification**:
- Check: https://github.com/maxmaeser/circada/releases
- Verify assets: `Circada_X.Y.Z_universal.dmg` and `latest.json`
- Test: Run older version, should detect update automatically

### Update Flow Diagram

```
User Starts App
    ↓
App.tsx triggers updateService.checkForUpdates()
    ↓
Status: 'checking' → Fetches latest.json from GitHub
    ↓
Compare versions → If higher version available:
    ↓
Status: 'available' → Shows "Update available: vX.Y.Z"
    ↓
Auto-trigger downloadAndInstall()
    ↓
Status: 'downloading' → Progress: 0% → 25% → 50% → 100%
    ↓
Status: 'ready' → "Update ready! Restarting..."
    ↓
App relaunches → New version running
```

### Testing Updates

**Quick Test**:
```bash
# Create test release
npm run version:bump 1.0.1
git push origin v1.0.1 && git push

# Wait for GitHub Actions to complete

# In Burger Menu → App Updates → Click "Check for Updates"
# Should detect update, download, and relaunch
```

**Detailed Testing Guide**: See `AUTO_UPDATE.md` → Testing section

### Common Tasks

**Check current version**:
```bash
grep '"version"' package.json
```

**Verify latest release**:
```bash
curl -L https://github.com/maxmaeser/circada/releases/latest/download/latest.json | jq .version
```

**Delete a bad release**:
```bash
gh release delete v1.0.1
git tag -d v1.0.1
git push origin :refs/tags/v1.0.1
```

**Monitor GitHub Actions**:
```bash
gh run list
```

### Troubleshooting

**Issue: "You are up to date" when update expected**
- Verify new version is higher than current
- Check: `curl -L https://github.com/maxmaeser/circada/releases/latest/download/latest.json`
- Ensure GitHub Release exists with `latest.json`

**Issue: GitHub Actions workflow fails**
- Check logs: https://github.com/maxmaeser/circada/actions
- Common: Build errors, permission issues
- Fix locally, delete release/tag, retry

**Issue: Download fails**
- Verify DMG exists on GitHub Releases
- Test URL: `curl -I https://github.com/.../Circada_X.Y.Z_universal.dmg`

**Complete Troubleshooting Guide**: See `AUTO_UPDATE.md` → Troubleshooting section

### Future Enhancements

**Code Signing** (High Priority):
- Requires Apple Developer Program ($99/year)
- Enables Gatekeeper approval and notarization
- See `AUTO_UPDATE.md` → Future Enhancements → Code Signing

**Update Channels** (Beta/Alpha):
- Separate update streams for testing
- User-selectable channels in settings

**Release Notes Display**:
- Show "What's New" dialog after update
- Format markdown release notes

**Detailed Roadmap**: See `AUTO_UPDATE.md` → Future Enhancements section

### Additional Resources

- **Comprehensive Documentation**: `AUTO_UPDATE.md` (400+ lines)
  - System architecture
  - Component breakdowns
  - Configuration reference
  - Testing procedures
  - Troubleshooting guide
  - Future enhancements

- **Release Guide**: `RELEASE_CHECKLIST.md` (150+ lines)
  - Pre-release checklist
  - Step-by-step process
  - Verification steps
  - Rollback procedures

- **Official Docs**: https://tauri.app/v1/guides/distribution/updater/

## Future Roadmap - Advanced Features

Reference the comprehensive product roadmap in `PRODUCT_ROADMAP.md` for planned enhancements:
- **ADHD Detection Algorithm**: Multi-factor analysis of attention patterns
- **Data Upload Interface**: Drag & drop Apple Health XML import
- **Personalized Calibration**: Individual rhythm adjustment based on ADHD indicators
- **App Store Distribution**: Code signing, notarization, and App Store Connect
- **Privacy-First Architecture**: All processing happens locally on-device

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