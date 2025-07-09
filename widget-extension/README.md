# Circadian Widget Extension

This directory contains the SwiftUI widget extension that replicates the first dashboard card from the main Circada app.

## Features

- **Exact UI Replica**: Matches the main app's first dashboard card perfectly
- **Real-time Updates**: Displays live cycle data with MM:SS countdown timer
- **6-Phase System**: Shows ↗↑🔥⚡↘😴 icons based on current energy phase
- **Live Data Integration**: Connects to HealthKit heart rate when available
- **Smart Fallback**: Calculates cycle data automatically when live data unavailable

## Building the Widget

### Prerequisites
- Xcode installed (not just Command Line Tools)
- macOS 13.0+ target

### Steps to Build

1. **Create New Xcode Project**:
   ```bash
   # Open Xcode and create a new project
   # Choose "Widget Extension" template
   # Bundle identifier: com.circada.app.CircadianWidget
   # Target: macOS 13.0+
   ```

2. **Replace Default Widget Code**:
   - Copy the contents of `CircadianWidget.swift` into your widget target
   - Add App Groups capability: `group.com.circada.app`

3. **Configure App Groups**:
   - In Xcode, select your widget target
   - Go to "Signing & Capabilities"
   - Add "App Groups" capability
   - Add group: `group.com.circada.app`

4. **Build & Run**:
   ```bash
   xcodebuild -project YourProject.xcodeproj -target CircadianWidgetExtension -configuration Release build
   ```

## Data Flow

1. **Main Circada App** → Writes cycle data to shared App Group container every 30 seconds
2. **Widget Extension** → Reads from shared container, falls back to calculated data
3. **Widget Timeline** → Refreshes every minute to keep timer accurate

## Widget Sizes

- **Medium Widget**: Compact layout with essential info
- **Large Widget**: Full layout matching the dashboard card exactly

## Live Data

The widget automatically displays:
- Current energy phase with colored background
- 6-phase icon system (↗ Rising, ↑ Building, 🔥 Peak, ⚡ Flow, ↘ Declining, 😴 Rest)
- Countdown timer until next phase
- Heart rate (when available from HealthKit)
- Confidence score for predictions

## Troubleshooting

### Widget Not Updating
- Check App Groups are properly configured in both main app and widget
- Verify the shared container path: `~/Library/Group Containers/group.com.circada.app/`
- Ensure widget-data.json is being written by main app

### UI Issues
- Widget inherits styling from SwiftUI's dark mode theme
- Icons automatically adapt to background brightness
- Timer precision depends on system widget refresh policy

## Integration with Main App

The widget is designed to work seamlessly with the main Circada app:
- No additional setup required once built
- Automatically appears in macOS widget gallery
- Live data sync happens in background
- Falls back gracefully when main app is not running