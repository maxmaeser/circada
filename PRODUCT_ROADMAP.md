# Product Roadmap: Circadian Rhythm App with ADHD Detection

## Overview

Transform the current Tauri-based circadian rhythm tracker into a comprehensive, easily installable macOS application with data upload capabilities and ADHD detection features.

## 1. App Distribution & Installation

### App Store Distribution
- **Universal Build**: Create universal binary supporting Intel and Apple Silicon
- **Notarization**: Apple notarization for security verification
- **App Store Connect**: Setup developer account and app listing
- **Bundle Identifier**: Use `com.circada.app` for consistent branding
- **Code Signing**: Production certificates for distribution

### Alternative Distribution
- **DMG Installer**: Self-contained installer package
- **Homebrew**: Formula for developer-friendly installation
- **Direct Download**: Signed app bundle with auto-updater

## 2. Data Upload Interface

### Health Data Import
```swift
// New SwiftUI view for data upload
struct HealthDataImportView: View {
    @State private var selectedFile: URL?
    @State private var isProcessing = false
    @State private var importProgress: Double = 0.0
    
    var body: some View {
        VStack(spacing: 24) {
            // Drag & drop area for Apple Health XML
            DropZone(onFileDrop: handleHealthFile)
            
            // Progress indicator
            if isProcessing {
                ProgressView(value: importProgress)
                    .progressViewStyle(LinearProgressViewStyle())
            }
            
            // Data preview and validation
            if let data = parsedHealthData {
                HealthDataPreview(data: data)
            }
        }
    }
}
```

### Data Processing Pipeline
- **XML Parser Enhancement**: Extend existing `healthDataParser.ts` 
- **Data Validation**: Verify data quality and completeness
- **Privacy Protection**: Local processing only, no cloud storage of raw health data
- **Incremental Import**: Support for updating existing data

## 3. ADHD Detection Algorithm

### Core Detection Logic
```typescript
interface ADHDRiskAnalysis {
    riskScore: number; // 0-100
    confidence: number;
    indicators: ADHDIndicator[];
    recommendations: string[];
}

interface ADHDIndicator {
    type: 'attention_variability' | 'energy_inconsistency' | 'sleep_irregularity';
    severity: 'low' | 'medium' | 'high';
    description: string;
    dataPoints: number;
}

export class ADHDDetectionEngine {
    analyzeRhythmPatterns(healthData: HealthData): ADHDRiskAnalysis {
        // 1. Attention Variability Analysis
        const attentionVariability = this.analyzeAttentionPatterns(healthData);
        
        // 2. Energy Inconsistency Detection
        const energyConsistency = this.analyzeEnergyPatterns(healthData);
        
        // 3. Sleep Pattern Irregularity
        const sleepRegularity = this.analyzeSleepPatterns(healthData);
        
        // 4. Heart Rate Variability Analysis
        const hrvPatterns = this.analyzeHRVPatterns(healthData);
        
        return this.calculateRiskScore({
            attentionVariability,
            energyConsistency, 
            sleepRegularity,
            hrvPatterns
        });
    }
}
```

### ADHD Detection Indicators
- **Attention Variability**: Inconsistent focus periods throughout the day
- **Energy Dysregulation**: Irregular energy peaks and crashes
- **Sleep Irregularity**: Inconsistent sleep/wake times and quality
- **Heart Rate Patterns**: Atypical HRV patterns associated with ADHD
- **Activity Fragmentation**: Difficulty maintaining consistent activity levels

## 4. Personalized Algorithm Adjustment

### Dynamic Cycle Calibration
```typescript
export class PersonalizedRhythmEngine {
    calibrateForUser(userData: UserProfile, adhdAnalysis: ADHDRiskAnalysis): CalibrationResult {
        // Adjust base ultradian cycle length based on individual patterns
        const personalCycleLength = this.calculatePersonalCycleLength(userData);
        
        // Modify energy phase durations based on ADHD indicators
        const phaseAdjustments = this.calculatePhaseAdjustments(adhdAnalysis);
        
        // Create personalized prediction model
        const personalModel = this.buildPersonalModel(userData, adhdAnalysis);
        
        return {
            cycleLength: personalCycleLength,
            phaseAdjustments,
            personalModel,
            confidence: this.calculateConfidence(userData)
        };
    }
}
```

### Adaptive Recommendations
- **ADHD-Specific Timing**: Shorter high-energy phases, longer transition periods
- **Medication Timing**: Optimize around medication schedules
- **Break Scheduling**: More frequent breaks during low-energy phases
- **Task Matching**: Align complex tasks with personal peak energy windows

## 5. User Onboarding Flow

### Welcome & Setup
1. **App Introduction**: Explain circadian rhythm tracking benefits
2. **Health Data Import**: Guide through Apple Health XML export
3. **ADHD Screening**: Optional questionnaire + pattern analysis
4. **Personalization**: Set work schedule, preferences, goals
5. **Widget Setup**: Configure desktop widget and notifications

### Data Privacy & Security
- **Local Processing**: All analysis happens on-device
- **Encrypted Storage**: Core Data with encryption
- **No Cloud Sync**: User data never leaves device
- **Transparent Privacy**: Clear explanation of data usage

## 6. Implementation Roadmap

### Phase 1: Core Infrastructure (2-3 weeks)
- Enhanced health data parser with ADHD indicators
- Basic ADHD detection algorithm
- Personalized cycle calibration system

### Phase 2: User Interface (1-2 weeks)
- Data upload interface with drag & drop
- ADHD analysis dashboard
- Personalization settings panel

### Phase 3: App Distribution (1 week)
- Code signing and notarization setup
- DMG installer creation
- App Store submission preparation

### Phase 4: Testing & Refinement (1-2 weeks)
- Beta testing with real health data
- Algorithm refinement based on user feedback
- Performance optimization

## 7. Technical Architecture

### Data Flow
```
Apple Health Export → XML Parser → ADHD Analysis → Personal Calibration → Widget Updates
```

### File Structure
```
src/
├── services/
│   ├── adhdDetection.ts         # ADHD analysis engine
│   ├── personalizedRhythm.ts    # Individual calibration
│   └── dataUpload.ts            # Health data import
├── components/
│   ├── DataUploadView.tsx       # Drag & drop interface
│   ├── ADHDAnalysisView.tsx     # Results dashboard
│   └── PersonalizationView.tsx  # Settings panel
└── utils/
    ├── healthDataValidator.ts   # Data quality checks
    └── privacyUtils.ts         # Security helpers
```

### Key Features
- **Offline-First**: No internet required for core functionality
- **Privacy-Focused**: All processing happens locally
- **Scientifically-Based**: Algorithms based on ADHD research
- **Highly Personalized**: Adapts to individual patterns
- **Easy Installation**: Single-click installer

## 8. Current Status

### Completed Features
- ✅ Live HealthKit integration with real-time heart rate streaming
- ✅ SwiftUI widget extension with perfect visual parity
- ✅ Personal circadian analysis from historical data
- ✅ Minimal dashboard with ultradian cycle tracking
- ✅ Predictive analytics with 6-hour forecasting
- ✅ System tray menubar widget

### Widget Implementation Details
- **Location**: `widget-extension/CricadianWidgetHost/CircadianWidget/CircadianWidget.swift`
- **Features**: Responsive design, dynamic text scaling, real-time updates
- **Integration**: App Groups for data sharing between main app and widget
- **Status**: Production-ready, fully functional

### Next Steps
1. Implement ADHD detection algorithm
2. Create data upload interface
3. Add personalized algorithm adjustment
4. Prepare for App Store distribution

## 9. Success Metrics

### User Engagement
- Daily active users
- Widget usage frequency
- Data upload completion rate
- ADHD screening participation rate

### Health Outcomes
- Improved sleep consistency
- Better energy management
- Reduced attention variability
- Medication timing optimization

### Technical Performance
- App launch time < 2 seconds
- Widget refresh rate consistency
- Data processing speed
- Battery impact minimization

This roadmap transforms the current circadian rhythm tracker into a comprehensive, personalized ADHD management tool that's easily installable and respects user privacy while providing scientifically-backed insights.