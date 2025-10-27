# Circada - macOS Distribution

A native macOS application for tracking circadian and ultradian rhythms with real-time HealthKit integration.

## 🌙 Features

- **Real-time Heart Rate Monitoring**: Live HealthKit integration with Swift FFI bridge
- **Interactive Rhythm Visualization**: SVG-based wave displays with hover tooltips
- **6-Phase Energy System**: Precise ultradian cycle tracking (↗↑🔥⚡↘😴)
- **Predictive Analytics**: 6-hour energy forecasting with personalized recommendations
- **Native macOS Widget**: Desktop widget for continuous monitoring
- **Live Menubar Timer**: Real-time countdown in system tray
- **Automatic Updates**: Seamless updates via GitHub Releases

## 🔄 Automatic Updates

Circada includes a built-in auto-update system that keeps the app current without user intervention.

### How It Works

- **Automatic Checks**: App checks for updates on startup (silent, non-blocking)
- **Manual Checks**: Users can manually check via Burger Menu → App Updates
- **Auto-Download**: Updates download automatically when available
- **Auto-Install**: Updates install and relaunch the app automatically
- **No Disruption**: Updates happen seamlessly in the background

### User Experience

When an update is available:
1. User sees notification in Burger Menu: "Update available: vX.Y.Z"
2. Download begins automatically with progress indicator
3. Once downloaded, app shows: "Update ready! Restarting..."
4. App automatically relaunches with new version
5. User continues working with latest features

### For Developers

**Creating a Release**:
```bash
# Bump version and create tag
npm run version:bump 1.0.1

# Push tag to trigger automated release
git push origin v1.0.1
git push
```

GitHub Actions automatically:
- Builds universal macOS app
- Creates DMG installer
- Generates update manifest
- Publishes to GitHub Releases
- Makes update available to all users

**Documentation**:
- See `AUTO_UPDATE.md` for technical details
- See `RELEASE_CHECKLIST.md` for step-by-step release guide

## 📦 System Requirements

- **macOS**: 13.0 (Ventura) or later
- **Architecture**: Universal (Intel + Apple Silicon)
- **HealthKit**: Optional (falls back to mock data)
- **Permissions**: HealthKit access for live data

## 🏗️ Building for Distribution

### Development Build
```bash
npm run build:dev
```

### Release Build (Universal)
```bash
npm run build:release
```

### Manual Universal Build
```bash
npm run build:universal
```

## 📋 Build Outputs

- **App Bundle**: `build/Circada.app`
- **DMG Installer**: `build/Circada_*.dmg` (when signed)
- **Debug Build**: `build/debug/Circada.app`

## 🔐 Code Signing & Distribution

### Requirements
1. **Apple Developer Account**: For code signing and notarization
2. **Signing Identity**: Developer ID Application certificate
3. **Notarization**: Apple notarization for Gatekeeper

### Configuration
Update `src-tauri/tauri.conf.json`:
```json
{
  "macOS": {
    "signingIdentity": "Developer ID Application: Your Name (TEAM_ID)",
    "providerShortName": "TEAM_ID"
  }
}
```

### Signing Process
```bash
# Sign the app
codesign --deep --force --verify --verbose --sign "Developer ID Application: Your Name" build/Circada.app

# Create signed DMG
npm run build:release

# Notarize (requires Apple ID app-specific password)
xcrun notarytool submit build/Circada.dmg --apple-id your@email.com --password app-specific-password --team-id TEAM_ID
```

## 📱 App Store Distribution

For App Store distribution, additional configurations are required:

1. **App Store Certificate**: Use "3rd Party Mac Developer Application" identity
2. **App Store Entitlements**: Use stricter sandbox entitlements
3. **App Store Connect**: Create app listing and metadata

## 🔧 Development

### Local Development
```bash
npm run tauri dev
```

### Widget Development
The widget extension is located in `widget-extension/` and builds automatically with the main app.

## 📄 App Information

- **Bundle ID**: `com.circada.app`
- **Version**: 1.0.0
- **Category**: Health & Fitness
- **Minimum macOS**: 13.0

## 🏥 HealthKit Integration

### Permissions Required
- Heart Rate (Read)
- Activity Data (Read)
- Sleep Analysis (Read)

### Privacy
- All data processing happens locally
- No cloud storage or transmission
- User controls all data access

## 🎯 Distribution Channels

1. **Direct Distribution**: DMG installer for direct download
   - Distributed via GitHub Releases
   - Automatic updates enabled
   - No App Store review required
   - Fastest update deployment

2. **App Store**: Full App Store review and distribution
   - Centralized distribution
   - Managed updates via App Store
   - Requires stricter entitlements
   - Longer review process

3. **Developer Distribution**: Enterprise or beta testing
   - Ad-hoc or enterprise provisioning
   - Internal testing before public release
   - Can use automatic updates with custom endpoints

### Update Distribution

**Current Method**: GitHub Releases with automatic updates

**How Updates Reach Users**:
1. Developer creates release via `npm run version:bump X.Y.Z`
2. GitHub Actions builds and publishes to GitHub Releases
3. All installed apps automatically check for updates
4. Users receive updates within minutes of release

**Update Frequency**: As needed (no App Store delays)

## 📞 Support

For build issues or distribution questions, refer to:
- `AUTO_UPDATE.md` for auto-update system documentation
- `RELEASE_CHECKLIST.md` for release process
- `CLAUDE.md` for development documentation
- `PRODUCT_ROADMAP.md` for future plans
- Tauri documentation for build troubleshooting