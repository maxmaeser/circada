# Creating Circada Widget in Xcode

## Step-by-Step Guide

### 1. Create New Xcode Project

```
File → New → Project
├── macOS
└── App
    ├── Product Name: CircadaWidgetHost
    ├── Bundle Identifier: com.circada.app.host
    ├── Language: Swift
    ├── Interface: SwiftUI
    └── Use Core Data: No
```

### 2. Replace ContentView.swift

Replace the default `ContentView.swift` with the contents of `CircadaWidgetHost.swift`

### 3. Add Widget Extension Target

```
File → New → Target
├── Widget Extension
└── Configuration:
    ├── Product Name: CircadianWidget
    ├── Bundle Identifier: com.circada.app.CircadianWidget
    ├── Include Configuration Intent: No
    └── Embed in Application: CircadaWidgetHost
```

### 4. Replace Widget Code

In the new widget target, replace the generated widget code with the contents of `CircadianWidget.swift`

### 5. Configure App Groups (BOTH TARGETS)

**For Main App (CircadaWidgetHost):**
```
Target: CircadaWidgetHost
├── Signing & Capabilities
├── + Capability
├── App Groups
└── Add: group.com.circada.app
```

**For Widget Extension (CircadianWidget):**
```
Target: CircadianWidget
├── Signing & Capabilities  
├── + Capability
├── App Groups
└── Add: group.com.circada.app
```

### 6. Set Deployment Target

Both targets should target macOS 13.0+ for widget support:
```
Build Settings → Deployment → macOS Deployment Target: 13.0
```

### 7. Build and Run

```bash
# Build the project
Cmd + B

# Run the app
Cmd + R
```

## File Structure in Xcode

```
CircadaWidgetHost/
├── CircadaWidgetHost/
│   ├── CircadaWidgetHostApp.swift (main app)
│   └── Assets.xcassets
├── CircadianWidget/
│   ├── CircadianWidget.swift (widget code)
│   ├── Assets.xcassets
│   └── Info.plist
└── CircadaWidgetHost.xcodeproj
```

## How It Works

1. **Tauri App** (your main Circada app) writes cycle data to shared container
2. **Widget Host App** runs in menu bar, monitors shared data
3. **Widget Extension** reads from shared container, displays on desktop
4. **Data Flow**: Tauri → Shared Container → Widget

## Testing

1. **Run Tauri App**: Your main Circada app should be running
2. **Run Widget Host**: Build and run the Xcode project
3. **Add Widget**: Go to macOS Widget Gallery, add Circadian Widget
4. **Verify Data**: Widget should show live data from Tauri app

## Troubleshooting

### Widget Not Showing Data
- Check App Groups are configured on both targets
- Verify Tauri app is writing to: `~/Library/Group Containers/group.com.circada.app/widget-data.json`
- Check widget logs in Console.app

### Build Errors
- Ensure macOS 13.0+ deployment target
- Verify bundle identifiers are unique
- Check App Groups capability is properly added

### Widget Not Updating
- Widgets refresh based on system policy (usually every 5-15 minutes)
- Data is cached, changes may take time to appear
- Force refresh by removing and re-adding widget

## Result

You'll have a native macOS widget that shows an exact replica of your Circada dashboard card with live data from your Tauri app! 🦄