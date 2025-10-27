# Auto-Update System Documentation

This document provides comprehensive documentation for Circada's auto-update system, implemented using Tauri's updater plugin and GitHub Releases.

## Table of Contents

1. [System Overview](#system-overview)
2. [Architecture](#architecture)
3. [Components Breakdown](#components-breakdown)
4. [Update Flow](#update-flow)
5. [Configuration](#configuration)
6. [Testing](#testing)
7. [Release Process](#release-process)
8. [Troubleshooting](#troubleshooting)
9. [Future Enhancements](#future-enhancements)

---

## System Overview

### What It Does

The auto-update system enables Circada to automatically check for, download, and install updates without user intervention. This ensures users always have the latest features, bug fixes, and security improvements.

### Key Features

- **Automatic Update Checks**: Runs on app startup
- **Manual Update Trigger**: Available via Burger Menu
- **Seamless Downloads**: Progress tracking with percentage display
- **Automatic Installation**: Updates install and relaunch app automatically
- **GitHub Releases Integration**: Uses GitHub as update distribution channel
- **No Code Signing Required**: Works without Apple Developer Program (development mode)

### Technology Stack

- **Tauri Updater Plugin v2**: Native update functionality
- **GitHub Actions**: Automated release builds
- **GitHub Releases**: Update distribution and hosting
- **Update Manifest**: JSON file (`latest.json`) describing available updates

---

## Architecture

### High-Level Architecture

```
┌─────────────────┐
│   Circada App   │
│   (on startup)  │
└────────┬────────┘
         │
         ├─► Check for Updates (automatic)
         │
         ▼
┌─────────────────────────┐
│  updateService.ts       │
│  - Subscribe/Notify     │
│  - State Management     │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  Tauri Updater Plugin   │
│  - check()              │
│  - downloadAndInstall() │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  GitHub Releases        │
│  - latest.json          │
│  - Circada_X.Y.Z.dmg    │
└─────────────────────────┘
```

### Component Flow

1. **User Interface** (BurgerMenu.tsx)
   - Displays update status and progress
   - Provides manual update trigger button
   - Shows real-time download progress

2. **Service Layer** (updateService.ts)
   - Manages update state (idle, checking, downloading, etc.)
   - Notifies UI components of state changes
   - Orchestrates check, download, and install operations

3. **Tauri Plugin** (Rust + Plugin)
   - Communicates with GitHub Releases API
   - Downloads update files
   - Validates and installs updates
   - Triggers app relaunch

4. **GitHub Infrastructure**
   - Hosts release artifacts (DMG files)
   - Serves update manifest (latest.json)
   - Triggered by git tags via GitHub Actions

---

## Components Breakdown

### Backend Components (Rust/Tauri)

#### 1. `src-tauri/Cargo.toml`

**Location**: Lines 11-14

```toml
[dependencies]
tauri = { version = "2", features = [ "macos-private-api", "tray-icon"] }
tauri-plugin-opener = "2"
tauri-plugin-updater = "2"  # ← Auto-update functionality
```

**Purpose**: Declares the Tauri updater plugin as a Rust dependency.

**Key Points**:
- Version 2 of the updater plugin
- Must match Tauri core version
- Brings in native update checking and installation capabilities

---

#### 2. `src-tauri/src/lib.rs`

**Location**: Lines 15-20 (approximate)

```rust
tauri::Builder::default()
    .plugin(tauri_plugin_opener::init())
    .plugin(tauri_plugin_updater::Builder::new().build())  // ← Initialize updater
    .manage(Arc::new(Mutex::new(TrayUpdaterState::new())))
    .invoke_handler(tauri::generate_handler![...])
    .run(tauri::generate_context!())
```

**Purpose**: Initializes the updater plugin when the Tauri app starts.

**Key Points**:
- Plugin must be initialized before app runs
- Uses builder pattern for configuration
- Enables all updater functionality

---

#### 3. `src-tauri/tauri.conf.json`

**Location**: Two sections

**Bundle Configuration** (Line ~40):
```json
"bundle": {
  "createUpdaterArtifacts": true  // ← Creates signature files
}
```

**Plugin Configuration** (Lines ~60-70):
```json
"plugins": {
  "updater": {
    "endpoints": [
      "https://github.com/maxmaeser/circada/releases/latest/download/latest.json"
    ],
    "pubkey": ""  // Empty = no signature verification (development mode)
  }
}
```

**Purpose**:
- Tells Tauri to generate update artifacts during build
- Configures where to check for updates
- Specifies public key for signature verification (empty for now)

**Key Points**:
- `createUpdaterArtifacts: true` is REQUIRED for updates to work
- `endpoints` array can have multiple update servers
- Empty `pubkey` means updates are not cryptographically verified
- For production with signing, add public key here

---

### Frontend Components (TypeScript/React)

#### 4. `src/services/updateService.ts`

**Location**: Complete file (171 lines)

**Architecture**:
```typescript
// Type Definitions
export interface UpdateInfo { version, currentVersion, date, body }
export type UpdateStatus = 'idle' | 'checking' | 'available' | 'downloading' | 'ready' | 'upToDate' | 'error'
export interface UpdateState { status, info?, error?, downloadProgress? }

// Service Class (Singleton Pattern)
class UpdateService {
  private listeners: Set<(state: UpdateState) => void>
  private currentState: UpdateState

  subscribe(listener) { /* Add listener, return unsubscribe fn */ }
  private notify(state) { /* Notify all listeners */ }

  async checkForUpdates(): Promise<UpdateInfo | null> {
    // 1. Set status to 'checking'
    // 2. Call Tauri check() API
    // 3. If update available, set status to 'available'
    // 4. Automatically trigger download
    // 5. Return update info or null
  }

  private async downloadAndInstall(): Promise<void> {
    // 1. Set status to 'downloading'
    // 2. Call update.downloadAndInstall() with progress callback
    // 3. Track download progress (Started, Progress, Finished events)
    // 4. Set status to 'ready'
    // 5. Relaunch app to apply update
  }
}

export const updateService = new UpdateService()
```

**Key Points**:
- **Singleton Pattern**: One instance shared across the app
- **Subscribe/Notify**: Observer pattern for state management
- **Status States**:
  - `idle`: No check performed yet
  - `checking`: Actively checking for updates
  - `available`: Update found, about to download
  - `downloading`: Download in progress
  - `ready`: Downloaded, about to relaunch
  - `upToDate`: No update available
  - `error`: Something went wrong
- **Automatic Download**: When update detected, downloads immediately
- **Progress Tracking**: Reports percentage during download
- **Error Handling**: Catches and reports errors to UI

---

#### 5. `src/App.tsx`

**Location**: Lines 30-40 (approximate)

```typescript
// Check for updates on startup
useEffect(() => {
  const checkUpdates = async () => {
    try {
      console.log('Checking for updates...');
      await updateService.checkForUpdates();
    } catch (error) {
      console.error('Failed to check for updates:', error);
    }
  };
  checkUpdates();
}, []);
```

**Purpose**: Triggers automatic update check when app starts.

**Key Points**:
- Runs once on component mount (empty dependency array)
- Non-blocking: App continues loading regardless of update check
- Errors logged but don't crash the app
- User never sees this check unless update is available

---

#### 6. `src/components/BurgerMenu.tsx`

**Location**: Three main sections

**State Management** (Lines 29-36):
```typescript
// Update State
const [updateState, setUpdateState] = useState<UpdateState>({ status: 'idle' })

// Subscribe to update service
useEffect(() => {
  const unsubscribe = updateService.subscribe(setUpdateState);
  return unsubscribe;
}, []);
```

**Manual Trigger** (Lines 38-40):
```typescript
const checkForUpdates = async () => {
  await updateService.checkForUpdates();
};
```

**UI Display** (Lines 92-126 and 209-241):
```typescript
// Status icon (spinner, download, checkmark, alert)
const getUpdateStatusIcon = () => { /* ... */ }

// Status text with version info
const getUpdateStatusText = () => { /* ... */ }

// UI Section
<div className="space-y-3 border-t border-border pt-4">
  <Button onClick={checkForUpdates}>Check for Updates</Button>
  <div className="p-3 bg-background/50 rounded-md">
    {getUpdateStatusIcon()}
    {getUpdateStatusText()}
    {/* Progress bar for downloads */}
  </div>
</div>
```

**Purpose**: User-facing interface for update system.

**Key Points**:
- Subscribes to update service on mount
- Automatically updates UI when service state changes
- Manual button allows users to check anytime
- Progress bar shows download percentage
- Icons provide visual feedback
- Unsubscribes on unmount to prevent memory leaks

---

### CI/CD Components

#### 7. `.github/workflows/release.yml`

**Location**: Complete file (94 lines)

**Workflow Structure**:

```yaml
name: Release

on:
  push:
    tags:
      - 'v*.*.*'  # Triggers on tags like v1.0.1

jobs:
  release:
    runs-on: macos-latest

    steps:
      # 1. Checkout repository
      # 2. Setup Node.js and Rust
      # 3. Install npm dependencies
      # 4. Build frontend (npm run build)
      # 5. Build universal macOS app (npm run tauri build)
      # 6. Extract version from tag
      # 7. Create latest.json manifest
      # 8. Create GitHub Release with artifacts
      # 9. Upload artifacts for download
```

**Key Steps Explained**:

**Step 7: Create updater manifest** (Lines 51-73)
```bash
VERSION="1.0.1"  # Extracted from tag
DMG_PATH="src-tauri/target/.../Circada_1.0.1_universal.dmg"

# Generate latest.json
cat > latest.json <<EOF
{
  "version": "1.0.1",
  "notes": "See release notes for details",
  "pub_date": "2025-01-15T10:30:00Z",
  "platforms": {
    "darwin-aarch64": {
      "signature": "",
      "url": "https://github.com/maxmaeser/circada/releases/download/v1.0.1/Circada_1.0.1_universal.dmg"
    },
    "darwin-x86_64": {
      "signature": "",
      "url": "https://github.com/maxmaeser/circada/releases/download/v1.0.1/Circada_1.0.1_universal.dmg"
    }
  }
}
EOF
```

**Purpose**: Creates the manifest that Tauri reads to check for updates.

**Key Points**:
- `version`: New version number (must be higher than current)
- `notes`: Release notes shown to user (could be auto-generated from commits)
- `pub_date`: ISO 8601 timestamp
- `platforms`: Separate URLs for each architecture
  - `darwin-aarch64`: Apple Silicon (M1/M2/M3)
  - `darwin-x86_64`: Intel Macs
- `signature`: Empty for now (no code signing)
- `url`: Direct download link to DMG on GitHub Releases

**Step 8: Create Release** (Lines 75-85)
```yaml
- name: Create Release
  uses: softprops/action-gh-release@v1
  with:
    files: |
      src-tauri/target/universal-apple-darwin/release/bundle/dmg/*.dmg
      latest.json
    draft: false
    prerelease: false
    generate_release_notes: true
```

**Purpose**: Creates GitHub Release and uploads files.

**Key Points**:
- Uploads DMG file(s) and latest.json
- Auto-generates release notes from commits
- Release is public (not draft)
- Not marked as prerelease

---

#### 8. `scripts/bump-version.sh`

**Location**: Complete file (91 lines)

**Script Flow**:

```bash
#!/bin/bash

# 1. Validate version format (X.Y.Z)
# 2. Update package.json version
# 3. Update src-tauri/tauri.conf.json version
# 4. Show git diff for review
# 5. Ask for confirmation
# 6. Create git commit
# 7. Create git tag (v{version})
# 8. Print next steps (push tag to trigger release)
```

**Usage**:
```bash
npm run version:bump 1.0.1
```

**Key Points**:
- Interactive: Shows changes before committing
- Updates both package.json and tauri.conf.json
- Uses `jq` if available (cleaner), falls back to `sed`
- Creates annotated git tag
- Does NOT automatically push (safety feature)
- Provides clear next steps

---

## Update Flow

### Complete Update Lifecycle

```
┌──────────────────────────────────────────────────────────────┐
│ 1. USER STARTS APP                                           │
└────────────────────┬─────────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────────┐
│ 2. App.tsx useEffect triggers updateService.checkForUpdates()│
└────────────────────┬─────────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────────┐
│ 3. updateService sets status to 'checking'                   │
│    - All subscribers (BurgerMenu) notified                   │
└────────────────────┬─────────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────────┐
│ 4. Tauri check() API called                                  │
│    - Fetches latest.json from GitHub                         │
│    - Compares version with current (package.json)            │
└────────────────────┬─────────────────────────────────────────┘
                     │
                     ├─► IF NO UPDATE AVAILABLE
                     │   └─► Status: 'upToDate'
                     │   └─► UI shows: "You are up to date!"
                     │
                     └─► IF UPDATE AVAILABLE
                         │
                         ▼
┌──────────────────────────────────────────────────────────────┐
│ 5. updateService sets status to 'available'                  │
│    - UpdateInfo includes: version, date, notes               │
│    - UI shows: "Update available: vX.Y.Z"                    │
└────────────────────┬─────────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────────┐
│ 6. downloadAndInstall() called automatically                 │
│    - Status: 'downloading'                                   │
│    - UI shows: "Downloading... 0%"                           │
└────────────────────┬─────────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────────┐
│ 7. Download progress events                                  │
│    - Event: Started (contentLength received)                 │
│    - Event: Progress (chunk downloaded, % calculated)        │
│    - Event: Finished (download complete)                     │
│    - UI updates progress bar in real-time                    │
└────────────────────┬─────────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────────┐
│ 8. Installation phase                                        │
│    - Status: 'ready'                                         │
│    - Update installed in background                          │
│    - UI shows: "Update ready! Restarting..."                 │
└────────────────────┬─────────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────────┐
│ 9. App relaunches with new version                           │
│    - relaunch() API called                                   │
│    - App quits and restarts                                  │
│    - New version now running                                 │
└──────────────────────────────────────────────────────────────┘
```

### Error Handling

```
At any point, if error occurs:
  ├─► Status: 'error'
  ├─► Error message captured
  ├─► UI shows: "Error: {message}"
  └─► User can try again manually via Burger Menu
```

---

## Configuration

### Version Requirements

**For updates to work, the new version must be higher than the current version.**

Version comparison follows semantic versioning:
- `1.0.1` > `1.0.0` ✅
- `1.1.0` > `1.0.9` ✅
- `2.0.0` > `1.9.9` ✅
- `1.0.0` = `1.0.0` ❌ (no update)

### Update Endpoint

**Current**: `https://github.com/maxmaeser/circada/releases/latest/download/latest.json`

**Structure**:
- `/releases/latest/download/` is a GitHub shortcut to the most recent release
- `latest.json` is the manifest file uploaded with each release

**To change**:
1. Update `src-tauri/tauri.conf.json` → `plugins.updater.endpoints`
2. Ensure new endpoint serves valid JSON manifest

### Signature Verification

**Current**: Disabled (`pubkey: ""`)

**To enable** (requires Apple Developer Program):
1. Generate signing key pair
2. Add public key to `tauri.conf.json`
3. Sign releases with private key
4. Update GitHub Actions to include signatures

See [Future Enhancements](#future-enhancements) for details.

---

## Testing

### Local Testing (Development)

**Important**: In development mode (`npm run tauri dev`), the updater will not work as expected because:
- No signed updates
- Running from source, not installed app
- Version checks may fail

**To test locally:**

1. **Build a production app**:
   ```bash
   npm run build:dev
   ```

2. **Install the app**:
   - Copy `build/debug/Circada.app` to `/Applications/`
   - Launch from Applications folder

3. **Create a test release** (see Release Process)

4. **Trigger update check**:
   - Open Burger Menu
   - Click "Check for Updates"
   - Verify status changes

5. **Monitor console**:
   - Check console logs for errors
   - Verify manifest is fetched

### Testing Update Flow End-to-End

**Scenario**: Verify updates work from version 1.0.0 to 1.0.1

1. **Ensure current version is 1.0.0**:
   ```bash
   grep '"version"' package.json
   # Should show: "version": "1.0.0"
   ```

2. **Build and install 1.0.0**:
   ```bash
   npm run build:dev
   cp -r build/debug/Circada.app /Applications/
   ```

3. **Create version 1.0.1**:
   ```bash
   npm run version:bump 1.0.1
   git push origin v1.0.1
   git push
   ```

4. **Wait for GitHub Actions** (~10-15 minutes):
   - Go to: https://github.com/maxmaeser/circada/actions
   - Verify "Release" workflow completes
   - Check: https://github.com/maxmaeser/circada/releases
   - Confirm v1.0.1 release exists with DMG and latest.json

5. **Test update**:
   - Launch `/Applications/Circada.app` (version 1.0.0)
   - Open Burger Menu
   - Should see: "Update available: v1.0.1"
   - Should see: Download progress
   - Should see: App relaunches automatically

6. **Verify new version**:
   - Open Burger Menu after relaunch
   - Should show: "Version 1.0.1"
   - Should show: "You are up to date!"

### Common Testing Pitfalls

1. **"You are up to date" when you expect update**:
   - Check versions: New version must be higher
   - Verify latest.json is on GitHub Releases
   - Curl the endpoint: `curl -L https://github.com/maxmaeser/circada/releases/latest/download/latest.json`

2. **Update check never completes**:
   - Check internet connection
   - Verify GitHub is accessible
   - Check browser console for errors

3. **Download fails**:
   - Verify DMG file exists on GitHub Releases
   - Check URL in latest.json is correct
   - Verify file size isn't too large

---

## Release Process

### Complete Release Workflow

**Prerequisites**:
- Git repository clean (no uncommitted changes)
- All tests passing
- Current version working correctly

**Step 1: Bump Version**

```bash
npm run version:bump 1.0.1
```

This will:
- Update `package.json` version
- Update `src-tauri/tauri.conf.json` version
- Show git diff
- Ask for confirmation
- Create commit: "chore: bump version to 1.0.1"
- Create tag: "v1.0.1"

**Step 2: Push Tag to Trigger Release**

```bash
# Push the tag (triggers GitHub Actions)
git push origin v1.0.1

# Push the commit
git push
```

**Step 3: Monitor GitHub Actions**

1. Go to: https://github.com/maxmaeser/circada/actions
2. Find the "Release" workflow run
3. Monitor progress (~10-15 minutes):
   - ✅ Checkout repository
   - ✅ Setup Node.js and Rust
   - ✅ Install dependencies
   - ✅ Build frontend
   - ✅ Build universal macOS app
   - ✅ Create latest.json
   - ✅ Create GitHub Release
   - ✅ Upload artifacts

4. If any step fails, check logs for errors

**Step 4: Verify Release**

1. Go to: https://github.com/maxmaeser/circada/releases
2. Find the "v1.0.1" release
3. Verify assets:
   - ✅ `Circada_1.0.1_universal.dmg`
   - ✅ `latest.json`
   - ✅ Release notes auto-generated
4. Download `latest.json` and verify content:
   ```json
   {
     "version": "1.0.1",
     "notes": "...",
     "pub_date": "...",
     "platforms": { ... }
   }
   ```

**Step 5: Test Update**

See [Testing](#testing) section above.

**Step 6: Announce Release**

- Update CHANGELOG.md (if applicable)
- Notify users (if applicable)
- Update documentation

### Release Versioning Guidelines

**Semantic Versioning (MAJOR.MINOR.PATCH)**:

- **MAJOR** (1.0.0 → 2.0.0): Breaking changes, major redesigns
- **MINOR** (1.0.0 → 1.1.0): New features, non-breaking changes
- **PATCH** (1.0.0 → 1.0.1): Bug fixes, minor improvements

**Examples**:
- Fix crash bug: 1.0.0 → 1.0.1
- Add new feature: 1.0.1 → 1.1.0
- Complete UI overhaul: 1.9.0 → 2.0.0

---

## Troubleshooting

### Issue: "You are up to date" when update should be available

**Possible Causes**:
1. Version numbers incorrect
2. latest.json not accessible
3. Caching issue

**Solutions**:
```bash
# 1. Verify versions
grep '"version"' package.json
curl -L https://github.com/maxmaeser/circada/releases/latest/download/latest.json | grep '"version"'

# 2. Check if release exists
open https://github.com/maxmaeser/circada/releases

# 3. Clear any caches
# Restart app and try again
```

---

### Issue: Update check fails with error

**Possible Causes**:
1. Network connectivity
2. GitHub API rate limiting
3. Invalid manifest format

**Solutions**:
```bash
# 1. Test connectivity
curl -I https://github.com

# 2. Test manifest endpoint
curl -L https://github.com/maxmaeser/circada/releases/latest/download/latest.json

# 3. Validate JSON format
curl -L https://github.com/maxmaeser/circada/releases/latest/download/latest.json | jq .
```

---

### Issue: Download starts but fails

**Possible Causes**:
1. DMG file missing
2. URL incorrect in manifest
3. File corrupted

**Solutions**:
```bash
# 1. Verify DMG exists on GitHub Releases
open https://github.com/maxmaeser/circada/releases

# 2. Test download URL
curl -I https://github.com/maxmaeser/circada/releases/download/v1.0.1/Circada_1.0.1_universal.dmg

# 3. Download manually and verify
curl -L -o test.dmg https://github.com/maxmaeser/circada/releases/download/v1.0.1/Circada_1.0.1_universal.dmg
open test.dmg
```

---

### Issue: App doesn't relaunch after update

**Possible Causes**:
1. Permission issues
2. App not installed in /Applications
3. macOS security settings

**Solutions**:
1. Ensure app is in `/Applications/`
2. Grant necessary permissions in System Preferences
3. Check Console.app for error messages

---

### Issue: GitHub Actions workflow fails

**Common Failures**:

**Build Failure**:
```
Error: npm run build failed
```
**Solution**: Fix TypeScript/build errors locally first

**Rust Compilation Error**:
```
Error: cargo build failed
```
**Solution**: Ensure Rust code compiles locally

**Release Creation Fails**:
```
Error: softprops/action-gh-release@v1 failed
```
**Solution**:
- Verify GITHUB_TOKEN permissions
- Check repository settings → Actions → General → Workflow permissions

---

## Future Enhancements

### 1. Code Signing (High Priority)

**Why**: Required for macOS Gatekeeper, App Store, and secure updates

**Steps**:
1. Enroll in Apple Developer Program ($99/year)
2. Create Developer ID Application certificate
3. Generate Tauri signing key pair:
   ```bash
   tauri signer generate -w ~/.tauri/myapp.key
   ```
4. Add public key to `tauri.conf.json`:
   ```json
   "plugins": {
     "updater": {
       "pubkey": "dW50cnVzdGVkIGNvbW1lbnQ6IG1pbmlzaWduIHB1YmxpYyBrZXk6IDhFQ..."
     }
   }
   ```
5. Add private key to GitHub Secrets:
   - `TAURI_SIGNING_PRIVATE_KEY`
   - `TAURI_SIGNING_PRIVATE_KEY_PASSWORD`
6. Update GitHub Actions workflow to sign releases
7. Add Apple Developer credentials for notarization:
   - `APPLE_ID`
   - `APPLE_PASSWORD`
   - `APPLE_TEAM_ID`

**References**:
- https://tauri.app/v1/guides/distribution/sign-macos/
- https://tauri.app/v1/guides/distribution/updater/

---

### 2. Beta/Alpha Update Channels

**Why**: Test updates with subset of users before general release

**Implementation**:
1. Add channel configuration to `tauri.conf.json`:
   ```json
   "updater": {
     "endpoints": [
       "https://github.com/maxmaeser/circada/releases/latest/download/latest-${target}.json"
     ]
   }
   ```
2. Create separate manifests:
   - `latest-stable.json`
   - `latest-beta.json`
   - `latest-alpha.json`
3. Allow users to switch channels in settings
4. Update GitHub Actions to create channel-specific releases

---

### 3. Release Notes Display

**Why**: Show users what changed in each update

**Implementation**:
1. Update BurgerMenu to show `updateState.info?.body`
2. Format markdown release notes
3. Add "What's New" dialog after update
4. Parse conventional commits for auto-generated notes

---

### 4. Rollback Capability

**Why**: Quickly revert problematic updates

**Implementation**:
1. Keep previous version available
2. Add "Revert to Previous Version" button
3. Store version history locally
4. Download and install previous DMG on demand

---

### 5. Background Updates

**Why**: Don't interrupt user during active session

**Implementation**:
1. Download update in background
2. Show notification when ready
3. Prompt user: "Update ready, restart now?"
4. Allow user to defer update

---

### 6. Partial Updates (Delta Updates)

**Why**: Smaller downloads, faster updates

**Implementation**:
1. Generate binary diffs between versions
2. Apply patches instead of downloading full DMG
3. Significantly reduce bandwidth usage
4. Requires more complex build pipeline

---

### 7. Update Analytics

**Why**: Track update success rates, common failures

**Implementation**:
1. Add telemetry to update flow
2. Track: check frequency, download success, installation success
3. Use privacy-respecting analytics (e.g., Plausible)
4. Monitor update adoption rates

---

## Additional Resources

### Official Documentation
- [Tauri Updater Plugin](https://tauri.app/v1/guides/distribution/updater/)
- [GitHub Releases](https://docs.github.com/en/repositories/releasing-projects-on-github)
- [Semantic Versioning](https://semver.org/)

### Related Files
- [RELEASE_CHECKLIST.md](./RELEASE_CHECKLIST.md) - Step-by-step release guide
- [CLAUDE.md](./CLAUDE.md) - Project documentation
- [README-DISTRIBUTION.md](./README-DISTRIBUTION.md) - Distribution guide

### Contact
For questions or issues with the auto-update system, check:
1. This documentation
2. GitHub Issues: https://github.com/maxmaeser/circada/issues
3. Tauri Discord: https://discord.gg/tauri

---

**Last Updated**: 2025-01-15
**Version**: 1.0.0
**Maintainer**: Circada Development Team
