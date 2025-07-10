# Circada - macOS Distribution

A native macOS application for tracking circadian and ultradian rhythms with real-time HealthKit integration.

## 🌙 Features

- **Real-time Heart Rate Monitoring**: Live HealthKit integration with Swift FFI bridge
- **Interactive Rhythm Visualization**: SVG-based wave displays with hover tooltips
- **6-Phase Energy System**: Precise ultradian cycle tracking (↗↑🔥⚡↘😴)
- **Predictive Analytics**: 6-hour energy forecasting with personalized recommendations
- **Native macOS Widget**: Desktop widget for continuous monitoring
- **Live Menubar Timer**: Real-time countdown in system tray

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
2. **App Store**: Full App Store review and distribution
3. **Developer Distribution**: Enterprise or beta testing

## 📞 Support

For build issues or distribution questions, refer to:
- `CLAUDE.md` for development documentation
- `PRODUCT_ROADMAP.md` for future plans
- Tauri documentation for build troubleshooting