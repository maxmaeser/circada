# 🦄 Final Xcode Setup Instructions

Your project is 95% ready! Follow these final steps to complete the widget setup:

## ✅ What's Already Done
- ✅ Main app code updated with menu bar interface
- ✅ App Groups entitlement added to main app
- ✅ Data bridge for reading from Tauri app
- ✅ Complete widget Swift code ready

## 🎯 Steps to Complete in Xcode

### 1. Open Your Project
```
Open: widget-extension/CricadianWidgetHost/CricadianWidgetHost.xcodeproj
```

### 2. Add Widget Extension Target
```
File → New → Target
├── Widget Extension
└── Configuration:
    ├── Product Name: CircadianWidget
    ├── Bundle Identifier: com.circada.app.CircadianWidget
    ├── Include Configuration Intent: No
    └── Embed in Application: CricadianWidgetHost
```

### 3. Replace Widget Code
In the new `CircadianWidget` target folder, replace the generated widget file with:

**Copy from:** `../CircadianWidget.swift` (in widget-extension folder)
**To:** `CircadianWidget/CircadianWidget.swift` (in Xcode project)

### 4. Add App Groups to Widget Target
```
Select: CircadianWidget target
├── Signing & Capabilities
├── + Capability
├── App Groups
└── Add: group.com.circada.app
```

### 5. Set Deployment Targets
```
Both targets → Build Settings → macOS Deployment Target: 13.0
```

## 🚀 Build & Test

1. **Build Project**: `Cmd + B`
2. **Run Host App**: `Cmd + R`
3. **Add Widget**: System Preferences → Widgets → Circadian Rhythm
4. **Verify Data**: Widget should show live data from your Tauri app!

## 📁 Expected File Structure
```
CricadianWidgetHost/
├── CricadianWidgetHost/
│   ├── CricadianWidgetHostApp.swift ✅ (Updated)
│   └── CricadianWidgetHost.entitlements ✅ (Updated)
└── CircadianWidget/ (You need to add this target)
    ├── CircadianWidget.swift (Copy from ../CircadianWidget.swift)
    ├── Assets.xcassets
    ├── Info.plist
    └── CircadianWidget.entitlements (Auto-generated)
```

## 🔧 Troubleshooting

### If Widget Shows No Data
1. Ensure your main Circada app (Tauri) is running
2. Check that widget data is being written: 
   ```
   ~/Library/Group Containers/group.com.circada.app/widget-data.json
   ```

### Build Errors
- Verify both targets have App Groups capability
- Check bundle identifiers are unique
- Ensure macOS 13.0+ deployment target

## 🎉 Result
You'll have a native macOS widget showing an exact replica of your Circada dashboard card with:
- Live countdown timer (MM:SS)
- 6-phase energy icons (↗↑🔥⚡↘😴)
- Real-time heart rate (when available)
- Activity recommendations
- Perfect visual matching

The widget will automatically refresh with live data from your running Tauri app every 30 seconds! 🦄✨