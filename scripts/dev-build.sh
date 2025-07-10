#!/bin/bash

# Circada macOS Development Build Script
# Creates a debug build for testing

set -e

echo "🌙 Starting Circada Development Build..."

# Clean previous builds
echo "🧹 Cleaning previous debug builds..."
rm -rf src-tauri/target/debug/bundle
rm -rf dist/

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build frontend
echo "🏗️  Building frontend..."
npm run build

# Build Tauri app (debug)
echo "🚀 Building Tauri app (debug)..."
npm run tauri build -- --debug

# Check if build was successful
if [ -d "src-tauri/target/debug/bundle/macos" ]; then
    echo "✅ Development build successful!"
    
    # Copy to build directory for easy access
    mkdir -p build/debug/
    cp -r src-tauri/target/debug/bundle/macos/Circada.app build/debug/
    
    echo "📁 Built debug app available at: build/debug/Circada.app"
    echo "🎉 Development build complete!"
    
    # Show app info
    echo ""
    echo "📊 App Information:"
    echo "   Name: Circada (Debug)"
    echo "   Version: 1.0.0"
    echo "   Bundle ID: com.circada.app"
    echo "   Size: $(du -sh build/debug/Circada.app | cut -f1)"
    
else
    echo "❌ Development build failed!"
    exit 1
fi

# Optional: Open build directory
if [[ "$1" == "--open" ]]; then
    open build/debug/
fi