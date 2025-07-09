#!/bin/bash

# Build script for Circadian Widget Extension
# Run this script when Xcode is available to create the widget extension

echo "🦄 Building Circadian Widget Extension..."

# Check if Xcode is available
if ! command -v xcodebuild &> /dev/null; then
    echo "❌ Error: Xcode is required to build the widget extension"
    echo "   Install Xcode from the Mac App Store, then run:"
    echo "   sudo xcode-select -s /Applications/Xcode.app/Contents/Developer"
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "CircadianWidget.swift" ]; then
    echo "❌ Error: CircadianWidget.swift not found"
    echo "   Make sure you're running this script from the widget-extension directory"
    exit 1
fi

echo "📋 CORRECT Instructions to build the widget:"
echo ""
echo "🎯 You need to create a MAIN APP first, then add widget extension!"
echo ""
echo "1. Open Xcode"
echo "2. Create a new macOS APP project (NOT widget extension):"
echo "   - Template: macOS → App"
echo "   - Product Name: CircadaWidgetHost"
echo "   - Bundle Identifier: com.circada.app.host"
echo "   - Language: Swift, Interface: SwiftUI"
echo ""
echo "3. Replace ContentView.swift with CircadaWidgetHost.swift content"
echo ""
echo "4. Add Widget Extension TARGET:"
echo "   - File → New → Target → Widget Extension"
echo "   - Product Name: CircadianWidget"
echo "   - Bundle Identifier: com.circada.app.CircadianWidget"
echo "   - Embed in: CircadaWidgetHost"
echo ""
echo "5. Replace widget code with CircadianWidget.swift content"
echo ""
echo "6. Add App Groups to BOTH targets:"
echo "   - Main app: Signing & Capabilities → App Groups → group.com.circada.app"
echo "   - Widget: Signing & Capabilities → App Groups → group.com.circada.app"
echo ""
echo "7. Build and run (Cmd+R)"
echo ""
echo "📖 See XcodeProjectGuide.md for detailed step-by-step instructions!"
echo ""
echo "🎉 Your Circadian widget will show an exact replica of the first dashboard card!"
echo ""
echo "Features:"
echo "- Live countdown timer (MM:SS format)"
echo "- 6-phase energy system (↗↑🔥⚡↘😴)"
echo "- Real-time heart rate display"
echo "- Confidence scoring"
echo "- Automatic dark/light icon adaptation"
echo ""
echo "The widget gets live data from your running Circada app every 30 seconds!"