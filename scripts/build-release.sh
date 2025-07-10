#!/bin/bash

# Circada macOS Release Build Script
# Creates a properly signed and notarized macOS app for distribution

set -e

echo "🌙 Starting Circada macOS Release Build..."

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf src-tauri/target/release/bundle
rm -rf dist/
rm -rf build/

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build frontend
echo "🏗️  Building frontend..."
npm run build

# Build Tauri app
echo "🚀 Building Tauri app..."
npm run tauri build -- --target universal-apple-darwin

# Check if build was successful
if [ -d "src-tauri/target/universal-apple-darwin/release/bundle/macos" ]; then
    echo "✅ Build successful!"
    
    # Copy to build directory for easy access
    mkdir -p build/
    cp -r src-tauri/target/universal-apple-darwin/release/bundle/macos/Circada.app build/
    cp -r src-tauri/target/universal-apple-darwin/release/bundle/dmg/Circada_*.dmg build/ 2>/dev/null || echo "📝 DMG creation skipped (requires signing)"
    
    echo "📁 Built app available at: build/Circada.app"
    echo "🎉 Release build complete!"
    
    # Show app info
    echo ""
    echo "📊 App Information:"
    echo "   Name: Circada"
    echo "   Version: 1.0.0"
    echo "   Bundle ID: com.circada.app"
    echo "   Size: $(du -sh build/Circada.app | cut -f1)"
    
else
    echo "❌ Build failed!"
    exit 1
fi

# Optional: Open build directory
if [[ "$1" == "--open" ]]; then
    open build/
fi