# Circada - Circadian Rhythm Tracker

> A production-ready macOS application for tracking circadian and ultradian rhythms with real-time HealthKit integration.

![macOS](https://img.shields.io/badge/macOS-13.0+-blue.svg)
![Architecture](https://img.shields.io/badge/Architecture-Universal-green.svg)
![Version](https://img.shields.io/badge/Version-1.0.0-brightgreen.svg)
![License](https://img.shields.io/badge/License-MIT-yellow.svg)

## ✨ Features

### 🔴 Live HealthKit Integration
- **Real-time Heart Rate Monitoring**: Live heart rate streaming with Swift FFI bridge
- **Background Processing**: Continuous monitoring with minimal battery impact
- **Safe Fallback System**: Automatic mock data when HealthKit unavailable
- **Privacy-First**: All data processing happens locally on your device

### 📊 Interactive Visualizations
- **Wave-based Rhythm Display**: SVG circadian and ultradian rhythm waves
- **Hover Tooltips**: Real-time energy intensity display on mouse hover
- **6-Phase Energy System**: Precise tracking (↗ Rising, ↑ Building, 🔥 Peak, ⚡ Flow, ↘ Winding, 😴 Rest)
- **Energy-based Backgrounds**: Dynamic space-themed gradients

### ⏱️ Native menubar Integration
- **Live Countdown Timer**: Real-time countdown in macOS menubar
- **Phase Icons**: Dynamic energy phase indicators (↗↑🔥⚡↘😴)
- **Synchronized Timing**: Menubar timer matches main app exactly
- **One-Click Access**: Click tray icon to show main dashboard

### 🧠 Predictive Analytics
- **6-Hour Forecasting**: Upcoming energy phases with activity suggestions
- **Phase-Specific Guidance**: Actionable advice for each energy state
- **Personal Insights**: Data-driven recommendations based on patterns
- **Live Data Indicators**: Visual confirmation when real HealthKit data streaming

### 🛠️ Developer Tools
- **Burger Menu Interface**: Unified settings and development tools
- **Theme Switching**: Night, Light, and Terminal themes
- **Mock Analysis Engine**: Full circadian analysis with ADHD detection
- **One-Click JSON Export**: Copy analysis results to clipboard

## 📋 System Requirements

- **macOS**: 13.0 (Ventura) or later
- **Architecture**: Universal (Intel + Apple Silicon)
- **HealthKit**: Optional for live data (falls back to mock data)
- **Storage**: ~40MB disk space

## 🚀 Installation

### Option 1: Direct Installation
1. Download `Circada.app` from the releases
2. Drag to `/Applications` folder
3. Launch from Applications or Spotlight

### Option 2: DMG Installer
1. Download `Circada_1.0.0_aarch64.dmg`
2. Open the DMG file
3. Drag Circada to Applications folder
4. Eject DMG and launch app

### Option 3: Build from Source
```bash
# Clone repository
git clone [repository-url]
cd "Circadian Rythm App"

# Install dependencies
npm install

# Build production app
npm run build:release

# App will be available in build/ directory
```

## 🎯 Quick Start

1. **Launch Circada** from Applications or Spotlight
2. **Grant HealthKit permissions** (optional) for live heart rate data
3. **Check menubar** for live countdown timer with phase icons
4. **Explore dashboard** with interactive wave visualization
5. **Access settings** via burger menu (☰) in top-right corner

## 🔧 Usage Guide

### Main Dashboard
- **Current Phase Display**: Shows active energy phase with countdown timer
- **Interactive Waves**: Hover over wave visualization for real-time data
- **6-Hour Predictions**: Upcoming energy phases with recommendations
- **Live Indicators**: Green "Live" badge when HealthKit data streaming

### Menubar Timer
- **Phase Icons**: ↗ Rising → ↑ Building → 🔥 Peak → ⚡ Flow → ↘ Winding → 😴 Rest
- **Countdown Format**: MM:SS remaining in current phase
- **Click to Open**: Click menubar icon to show main dashboard
- **Right-click Menu**: Access "Show Dashboard" and "Quit" options

### Settings & Tools
- **Burger Menu**: Click ☰ icon for settings and developer tools
- **Theme Switching**: Choose between Night, Light, and Terminal themes
- **Mock Analysis**: Run circadian analysis with ultradian cycles and ADHD detection
- **Test Data**: Import testing for development and debugging

## 📊 Understanding Your Rhythms

### Ultradian Cycles (90-minute cycles)
- **↗ Rising (0-15 min)**: Building energy, light tasks
- **↑ Building (15-30 min)**: Gaining momentum, prepare for focus
- **🔥 Peak (30-45 min)**: Maximum energy, complex projects
- **⚡ Flow (45-60 min)**: Optimal performance, deep work
- **↘ Winding (60-75 min)**: Energy declining, finish tasks
- **😴 Rest (75-90 min)**: Recovery phase, breaks and reflection

### Energy Optimization Tips
- **Schedule demanding tasks** during Peak (🔥) and Flow (⚡) phases
- **Take breaks** during Rest (😴) phases for optimal recovery
- **Use Rising (↗) phases** for planning and preparation
- **Align meetings** with Building (↑) phases for engagement

## 🏥 HealthKit Integration

### Permissions Required
- **Heart Rate**: Read access for live rhythm adjustment
- **Activity Data**: Movement patterns for personalized analysis
- **Sleep Analysis**: Sleep quality metrics and timing

### Privacy & Security
- **Local Processing**: All analysis happens on your device
- **No Cloud Storage**: Data never leaves your Mac
- **User Control**: Disable HealthKit anytime in settings
- **Secure Storage**: App sandbox protects your data

## 🛠️ Development

### Prerequisites
- Node.js 18+
- Rust 1.70+
- Tauri CLI
- Xcode (for Swift compilation)

### Development Setup
```bash
# Install dependencies
npm install

# Start development server
npm run tauri dev

# Build for testing
npm run build:dev

# Production build
npm run build:release
```

### Project Structure
```
src/
├── components/           # React components
│   ├── UltradianDashboard.tsx    # Main dashboard
│   ├── BurgerMenu.tsx            # Settings menu
│   └── PredictiveAnalytics.tsx   # Forecasting
├── services/            # Business logic
│   ├── liveHealthKit.ts         # HealthKit integration
│   ├── trayUpdater.ts           # Menubar timer
│   └── realDataCircadian.ts     # Analysis engine
src-tauri/
├── src/                 # Rust backend
│   ├── lib.rs                   # Main Tauri app
│   ├── healthkit.swift          # Swift HealthKit bridge
│   └── healthkit_ffi.rs         # Rust FFI bindings
├── entitlements.plist   # App permissions
└── tauri.conf.json      # App configuration
```

## 🖌️ Theming

This project supports three built-in themes:

| Theme name | Description |
|------------|-------------|
| `light`    | Default light UI colours |
| `dark`     | Dark mode – enabled automatically on first launch |
| `terminal` | Monospace console-style palette |

Switch theme via the burger menu (☰). Your choice is persisted and restored on next launch.

## 🧪 Testing

Jest tests live in `src/**.test.ts(x)`.

```bash
# Run all tests
npm test

# Lint code
npm run lint
```

## 📖 Documentation

- **[CLAUDE.md](./CLAUDE.md)**: Complete development documentation
- **[README-DISTRIBUTION.md](./README-DISTRIBUTION.md)**: Distribution and build guide
- **[PRODUCT_ROADMAP.md](./PRODUCT_ROADMAP.md)**: Future features and ADHD detection plans

## 🐛 Troubleshooting

### Common Issues

**Menubar timer not appearing:**
- Restart the app
- Check macOS menubar settings
- Ensure Ice or Bartender isn't hiding the icon

**HealthKit not working:**
- Grant permissions in System Preferences > Privacy & Security > Health
- Restart the app after granting permissions
- App works with mock data if HealthKit unavailable

**App won't launch:**
- Check macOS version (13.0+ required)
- Try launching from Terminal for error messages
- Ensure app isn't quarantined by macOS Gatekeeper

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

### Coding Guidelines
- **Components** live in `src/components`; co-locate small hooks under `src/hooks`
- Use the `cn()` helper from `src/lib/utils.ts` instead of ad-hoc `clsx`
- Prefer **shadcn/ui** style utilities (`focus-visible:ring-ring/50`, `border-border`, etc.)
- Keep new colour tokens in HSL format
- Follow **Conventional Commits** spec for commit messages

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Apple HealthKit** for providing health data APIs
- **Tauri** for enabling native desktop app development
- **React & TypeScript** for the UI framework
- **Circadian Rhythm Research** for scientific foundations

---

**Made with ❤️ for better energy management and productivity**