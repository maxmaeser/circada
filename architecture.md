# Circada Architecture Documentation

## Overview

Circada is a comprehensive desktop application for tracking circadian and ultradian rhythms with **real-time HealthKit integration**. Built with Tauri, React, and Swift, it provides live physiological monitoring and personalized rhythm analysis.

## System Architecture

### Core Components

```
┌─────────────────────────────────────────────────────────────────┐
│                    Frontend (React/TypeScript)                  │
├─────────────────────────────────────────────────────────────────┤
│  ├─ UltradianDashboard.tsx (Main rhythm display)               │
│  ├─ PredictiveAnalytics.tsx (6-hour forecasting)               │
│  ├─ MenubarWidget.tsx (System tray widget)                     │
│  └─ App.tsx (Live HealthKit integration)                       │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Tauri Runtime (Rust)                         │
├─────────────────────────────────────────────────────────────────┤
│  ├─ healthkit_ffi.rs (FFI bindings + safe fallback)            │
│  ├─ lib.rs (Tauri commands + handlers)                         │
│  └─ build.rs (Swift compilation pipeline)                      │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Swift HealthKit Bridge                      │
├─────────────────────────────────────────────────────────────────┤
│  ├─ healthkit.swift (Native HealthKit integration)             │
│  ├─ Real-time heart rate monitoring                            │
│  ├─ Background delivery                                         │
│  └─ Permissions management                                      │
└─────────────────────────────────────────────────────────────────┘
```

## Live HealthKit Integration

### Swift Layer (`healthkit.swift`)

**Purpose**: Native HealthKit integration with real-time monitoring

**Key Features**:
- `HKHealthStore` integration for heart rate monitoring
- `HKObserverQuery` for real-time updates
- Background delivery for continuous monitoring
- C-compatible FFI functions for Rust integration

**Core Classes**:
```swift
@objc public class HealthKitBridge: NSObject {
    private let healthStore = HKHealthStore()
    private var heartRateQuery: HKObserverQuery?
    private var heartRateCallback: (@convention(c) (Double, UInt64) -> Void)?
    
    // Public methods for permissions, monitoring, callbacks
}
```

### Rust FFI Layer (`healthkit_ffi.rs`)

**Purpose**: Safe bridge between Swift and TypeScript with fallback mechanisms

**Key Features**:
- Extern "C" declarations for Swift functions
- Safe fallback to mock implementations
- Panic handling for robust operation
- Tauri command integration

**Architecture**:
```rust
// Swift function declarations
extern "C" {
    fn swift_healthkit_request_permissions() -> bool;
    fn swift_healthkit_start_monitoring() -> bool;
    // ... other functions
}

// Safe wrappers with fallback
extern "C" fn healthkit_request_permissions() -> bool {
    unsafe {
        match std::panic::catch_unwind(|| swift_healthkit_request_permissions()) {
            Ok(result) => result,
            Err(_) => true // Fallback to mock
        }
    }
}
```

### TypeScript Service Layer (`liveHealthKit.ts`)

**Purpose**: Frontend service for live data integration

**Key Features**:
- Service interface for HealthKit operations
- Live data streaming via Tauri events
- Automatic fallback to mock implementations
- Cycle adjustment algorithms

**Core Components**:
```typescript
export interface LiveHealthKitService {
    requestPermissions(): Promise<boolean>;
    startMonitoring(): Promise<void>;
    stopMonitoring(): Promise<void>;
    getCurrentHeartRate(): Promise<number>;
    onHeartRateUpdate(callback: (data: LiveHeartRateData) => void): Promise<UnlistenFn>;
}

export class LiveCycleAdjustment {
    adjustCyclePosition(currentPosition: number, heartRate: number): number;
    getConfidence(heartRate: number): number;
}
```

## Data Flow Architecture

### Real-time Data Pipeline

```
HealthKit → Swift Bridge → Rust FFI → Tauri Events → React Components
    ↓            ↓            ↓            ↓              ↓
Heart Rate → C Functions → Rust Commands → Event Stream → Live UI Updates
```

### Cycle Adjustment Process

1. **Heart Rate Collection**: Swift continuously monitors heart rate
2. **Data Processing**: Rust FFI processes and validates data
3. **Cycle Analysis**: TypeScript algorithms analyze heart rate patterns
4. **Dynamic Adjustment**: Live modifications to ultradian cycle position
5. **UI Updates**: Real-time display of adjusted cycles

## Component Architecture

### UltradianDashboard Component

**Purpose**: Main dashboard showing current 90-minute cycle

**Key Features**:
- Live countdown timer (MM:SS format)
- Energy phase indicators (High/Low/Transition)
- 24-hour wave visualization
- Live data status indicators
- Heart rate integration

### PredictiveAnalytics Component

**Purpose**: 6-hour forecasting with confidence scoring

**Key Features**:
- Upcoming energy peaks and troughs
- Heart rate variance analysis
- Personal insights and recommendations
- 2-hour energy timeline graph

### MenubarWidget Component

**Purpose**: Efficient system tray widget

**Key Features**:
- Minimal memory footprint
- Phase arrows and countdown timer
- High-performance rendering
- System integration

## File & Folder Structure

```
circada/
│
├── src/
│   ├── components/
│   │   ├── UltradianDashboard.tsx      # Main rhythm display with live data
│   │   ├── PredictiveAnalytics.tsx     # 6-hour forecasting interface
│   │   ├── MenubarWidget.tsx           # System tray widget
│   │   ├── HealthDataImporter.tsx      # Health data import UI
│   │   ├── HealthDataTest.tsx          # Testing interface
│   │   └── ui/                         # shadcn/ui components
│   ├── services/
│   │   ├── liveHealthKit.ts            # Live HealthKit service
│   │   ├── healthDataParser.ts         # HealthKit XML parser
│   │   ├── realDataCircadian.ts        # Personal circadian analysis
│   │   └── healthDataTypes.ts          # Type definitions
│   ├── lib/
│   │   ├── store.ts                    # Zustand state management
│   │   ├── types.ts                    # Core type definitions
│   │   └── index.ts                    # Centralized exports
│   ├── App.tsx                         # Main app with live integration
│   └── main.tsx                        # React root renderer
│
├── src-tauri/
│   ├── src/
│   │   ├── healthkit.swift             # Swift HealthKit bridge
│   │   ├── healthkit_ffi.rs            # Rust FFI bindings
│   │   ├── lib.rs                      # Tauri commands
│   │   └── main.rs                     # Tauri entry point
│   ├── build.rs                        # Swift compilation pipeline
│   ├── Cargo.toml                      # Rust dependencies
│   └── tauri.conf.json                 # Tauri configuration
│
└── public/
    ├── export.xml                      # Sample HealthKit data
    └── circada-logo.png                # Application logo
```

## State Management

### Zustand Store Architecture

```typescript
interface AppState {
    currentTime: Date;
    heartRate: number;
    isLiveHealthKit: boolean;
    realDataAnalysis: CircadianAnalysis | null;
    setCurrentTime: (time: Date) => void;
    // ... other state
}
```

### State Updates

- **Timer Updates**: Every second via `setInterval`
- **Heart Rate Updates**: Real-time via Tauri events
- **Cycle Adjustments**: Dynamic via live algorithms
- **UI Synchronization**: Automatic via React hooks

## Build System

### Swift Compilation (`build.rs`)

**Purpose**: Integrate Swift compilation into Rust build process

**Process**:
1. Detect Swift source files
2. Compile Swift to object files
3. Create static library
4. Link with Rust binary

**Configuration**:
```rust
fn compile_swift_bridge() {
    // Link frameworks
    println!("cargo:rustc-link-lib=framework=Foundation");
    println!("cargo:rustc-link-lib=framework=HealthKit");
    
    // Compile Swift sources
    let output = Command::new("swiftc")
        .args(["-c", "src/healthkit.swift", "-o", &obj_file, 
               "-target", "aarch64-apple-macos13.0"])
        .output();
}
```

## Security & Privacy

### HealthKit Permissions

- **Explicit Consent**: User must grant HealthKit access
- **Minimal Data**: Only heart rate data requested
- **Local Processing**: All data processed locally
- **No Storage**: Live data not persisted

### Data Handling

- **Real-time Only**: No long-term storage of sensitive data
- **Aggregated Insights**: Only derived metrics stored
- **User Control**: Full control over data access and usage

## Performance Optimization

### Memory Management

- **Efficient Rendering**: Minimal re-renders via React optimization
- **State Optimization**: Zustand for lightweight state management
- **Native Performance**: Swift/Rust for CPU-intensive operations

### Battery Impact

- **Background Delivery**: Optimized HealthKit integration
- **Efficient Queries**: Minimal system resource usage
- **Smart Polling**: Adaptive update frequencies

## Error Handling

### Graceful Degradation

- **Swift Unavailable**: Automatic fallback to mock data
- **Permission Denied**: Graceful handling with user feedback
- **Network Issues**: Local processing continues
- **System Errors**: Robust error recovery

### Development vs Production

- **Development**: Mock implementations for testing
- **Production**: Full HealthKit integration with fallbacks
- **Logging**: Comprehensive error tracking

## Current Feature Set

### Live HealthKit Integration ✅
- **Real-time Heart Rate Streaming**: Swift FFI bridge for continuous monitoring
- **Live Cycle Adjustments**: Dynamic modifications based on heart rate patterns
- **Background Processing**: Efficient background delivery for minimal battery impact
- **Safe Fallback System**: Automatic mock implementations when HealthKit unavailable

### Health Data Analysis ✅
- **HealthKit XML Parser**: Processes 225K+ health records from Apple Health exports
- **Personal Circadian Analysis**: Calculates individual wake/sleep patterns from actual data
- **Sleep Efficiency Analysis**: Real sleep quality metrics and personalized recommendations
- **Energy Peak Detection**: Identifies personal energy patterns from physiological data

### Minimal Dashboard Interface ✅
- **UltradianDashboard**: Clean, focused view of current 90-minute cycle status
- **Live Countdown Timer**: MM:SS format with real-time seconds updates
- **Energy Phase Indicators**: Color-coded High/Low/Transition states with intensity
- **24-Hour Time Axis**: Wave visualization with actual clock times
- **Live Data Indicators**: Visual indicators when real HealthKit data is streaming

### Predictive Analytics ✅
- **6-Hour Forecasting**: Upcoming energy peaks, troughs, and optimal focus windows
- **Heart Rate Variance Analysis**: Real-time comparison with expected patterns
- **Personal Insights**: Data-driven recommendations based on individual patterns
- **2-Hour Energy Graph**: Visual timeline of predicted energy levels with confidence bands

## Future Architecture

### Desktop Widget Implementation 🚧

**Planned Architecture**:
```
Main App ←→ Shared State ←→ Desktop Widget
    ↓           ↓               ↓
Full UI    Live Data      Minimal UI
```

**Requirements**:
- Separate widget process for efficiency
- Shared state synchronization
- Minimal memory footprint
- Auto-launch integration

### Scalability Considerations

- **Multi-platform**: Framework for iOS/Android expansion
- **Data Sources**: Architecture for additional health metrics
- **AI Integration**: Framework for machine learning features
- **Cloud Sync**: Architecture for cross-device synchronization

## Development Workflow

### Local Development

1. **Frontend**: `npm run dev` for React development
2. **Desktop**: `npm run tauri dev` for full integration
3. **Testing**: Mock implementations for HealthKit testing

### Production Build

1. **Swift Compilation**: Automatic via build.rs
2. **Rust Compilation**: Tauri handles FFI integration
3. **React Build**: Optimized production bundle
4. **App Bundle**: Native macOS application

This architecture provides a robust, scalable foundation for real-time health monitoring with comprehensive fallback mechanisms and optimal performance.