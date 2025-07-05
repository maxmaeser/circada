---
Area: Circada
tags:
  - ai-context
---

# Brief 1: Core Circadian Phases - Technical Implementation

## Overview
This brief provides the technical mechanisms, parameters, and formulas for implementing ADHD-specific circadian phase detection and analysis in your app.

## Phase Detection Mechanisms

### Core Mathematical Model
The circadian rhythm follows a sinusoidal pattern that can be modeled as:

```
R(t) = A * cos(2π * (t - φ) / τ) + M
```

Where:
- `R(t)` = Rhythm value at time t
- `A` = Amplitude (strength of rhythm)
- `φ` = Phase shift (timing offset)
- `τ` = Period (normally ~24 hours)
- `M` = Mesor (mean level)

### ADHD-Specific Modifications

**Normal Parameters:**
- τ = 24.0 ± 0.2 hours
- φ = 0 ± 1 hour (reference to external time)
- A = High amplitude (strong day/night contrast)

**ADHD Parameters:**
- τ = 24.0 ± 0.5 hours (more variable)
- φ = +2 to +4 hours (delayed phase)
- A = 0.6-0.8 × normal (reduced amplitude)

## Phase 1: Morning Awakening (6-10 AM)

### Biological Mechanisms
1. **Cortisol Awakening Response (CAR)**
   - Normal: 50-100% increase within 30 minutes of waking
   - ADHD: 20-50% increase, often delayed by 1-2 hours
   - Proxy measurement: HRV decrease, activity onset

2. **Temperature Activation**
   - Normal: 0.5-1°C rise from nighttime minimum
   - ADHD: Slower rise, often incomplete by 10 AM

3. **Melatonin Suppression**
   - Normal: <50% of peak within 2 hours of light exposure
   - ADHD: Slower suppression, often incomplete

### Detection Algorithms

**Awakening Detection (TypeScript):**
```typescript
interface AwakeningResult {
  awakeningQuality: number; // 0-100 score
  phaseDelay: number; // hours delayed from target
  cortisolProxy: number; // estimated CAR strength
  awakeningTime: number; // timestamp
}

interface SensorData {
  activityData: number[];
  temperatureData: number[];
  timeStamps: number[];
}

async function detectAwakeningPattern(data: SensorData): Promise<AwakeningResult> {
  const { activityData, temperatureData, timeStamps } = data;
  
  // Find activity onset (first sustained activity >threshold)
  const activityThreshold = percentile(activityData, 75);
  const awakeningTime = findSustainedActivityOnset(activityData, activityThreshold);
  
  // Calculate temperature rise slope over 2 hours
  const tempRiseSlope = calculateTemperatureSlope(temperatureData, awakeningTime, 120);
  
  // Estimate cortisol awakening response via HRV proxy
  const hrvChange = calculateHrvChangeRate(awakeningTime, 60);
  
  // Calculate phase delay
  const targetWake = await getTargetWakeTime();
  const phaseDelay = (awakeningTime - targetWake) / 3600000; // Convert ms to hours
  
  // Scoring
  const awakeningQuality = calculateAwakeningScore(tempRiseSlope, hrvChange, phaseDelay);
  const cortisolProxy = estimateCortisolResponse(hrvChange, tempRiseSlope);
  
  return {
    awakeningQuality,
    phaseDelay,
    cortisolProxy,
    awakeningTime
  };
}

// Utility functions
function percentile(data: number[], p: number): number {
  const sorted = [...data].sort((a, b) => a - b);
  const index = (p / 100) * (sorted.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  
  if (lower === upper) return sorted[lower];
  return sorted[lower] * (upper - index) + sorted[upper] * (index - lower);
}

function findSustainedActivityOnset(activityData: number[], threshold: number): number {
  // Find first occurrence of sustained activity above threshold for 15+ minutes
  for (let i = 0; i < activityData.length - 15; i++) {
    const window = activityData.slice(i, i + 15);
    if (window.every(val => val > threshold)) {
      return i; // Return index as timestamp proxy
    }
  }
  return 0;
}
```

**ADHD Pattern Recognition (TypeScript):**
```typescript
interface ADHDPatternResult {
  adhdPatternProbability: number; // 0-1 score
  recommendations: string[];
  patternDetails: {
    delayConsistency: boolean;
    reducedCortisol: boolean;
    extendedLowAlertness: boolean;
  };
}

interface HistoricalAwakeningData {
  phaseDelay: number;
  cortisolProxy: number;
  awakeningTime: number;
  date: string;
}

function classifyADHDMorningPattern(
  awakeningData: AwakeningResult,
  historicalData: HistoricalAwakeningData[]
): ADHDPatternResult {
  // Get last 2 weeks of data
  const recentData = historicalData.slice(-14);
  
  // Calculate consistency metrics
  const phaseDelays = recentData.map(day => day.phaseDelay);
  const delayStd = standardDeviation(phaseDelays);
  const delayMean = mean(phaseDelays);
  const delayConsistency = delayStd < 1.0 && delayMean > 1.0;
  
  // Cortisol proxy assessment
  const cortisolProxies = recentData.map(day => day.cortisolProxy);
  const cortisolMean = mean(cortisolProxies);
  const reducedCortisol = cortisolMean < (ADHD_THRESHOLDS.cortisolProxyReduction * 100); // Use imported threshold
  
  // Extended low alertness check
  const extendedLowAlertness = checkExtendedLowActivity(awakeningData, 120);
  
  // Calculate ADHD score
  const criteriaCount = [delayConsistency, reducedCortisol, extendedLowAlertness]
    .filter(Boolean).length;
  const adhdScore = criteriaCount / 3;
  
  return {
    adhdPatternProbability: adhdScore,
    recommendations: generateMorningRecommendations(adhdScore),
    patternDetails: {
      delayConsistency,
      reducedCortisol,
      extendedLowAlertness
    }
  };
}

// Utility functions
function standardDeviation(values: number[]): number {
  const avg = mean(values);
  const squareDiffs = values.map(value => Math.pow(value - avg, 2));
  return Math.sqrt(mean(squareDiffs));
}

function mean(values: number[]): number {
  return values.reduce((sum, val) => sum + val, 0) / values.length;
}
```

## Phase 2: Daytime Active (10 AM - 6 PM)

### Biological Mechanisms
1. **Cortisol Peak Timing**
   - Normal: Peak at 10 AM - 12 PM
   - ADHD: Peak delayed to 2-4 PM
   - Detection: Activity level correlation with estimated cortisol curve

2. **Activity Fragmentation**
   - Normal: Sustained activity periods with regular breaks
   - ADHD: Highly fragmented with irregular bursts
   - Metric: Intradaily Variability (IV)

### Detection Algorithms

**Intradaily Variability Calculation (TypeScript):**
```typescript
// High-performance calculation for large datasets - consider Rust implementation
function calculateIntradailyVariability(activityData: number[]): number {
  /**
   * Calculates IV - measure of fragmentation within 24 hours
   * Higher values indicate more fragmented activity (ADHD pattern)
   * 
   * Formula: IV = (n * Σ(Xi+1 - Xi)²) / ((n-1) * Σ(Xi - X̄)²)
   * 
   * Normal range: 0.3-0.7
   * ADHD range: 0.8-1.5
   */
  
  const n = activityData.length;
  if (n < 2) return 0;
  
  // Calculate successive differences
  let sumSquaredDiffs = 0;
  for (let i = 0; i < n - 1; i++) {
    const diff = activityData[i + 1] - activityData[i];
    sumSquaredDiffs += diff * diff;
  }
  
  // Calculate variance from mean
  const meanActivity = activityData.reduce((sum, val) => sum + val, 0) / n;
  let sumSquaredDeviations = 0;
  for (const value of activityData) {
    const deviation = value - meanActivity;
    sumSquaredDeviations += deviation * deviation;
  }
  
  // IV formula
  if (sumSquaredDeviations === 0) return 0;
  
  const iv = (n * sumSquaredDiffs) / ((n - 1) * sumSquaredDeviations);
  return iv;
}

// Alternative Rust implementation for performance-critical calculations
// Place in src-tauri/src/circadian_analysis.rs:
/*
#[tauri::command]
pub fn calculate_intradaily_variability_rust(activity_data: Vec<f64>) -> f64 {
    let n = activity_data.len();
    if n < 2 { return 0.0; }
    
    // Calculate successive differences
    let sum_squared_diffs: f64 = activity_data.windows(2)
        .map(|window| (window[1] - window[0]).powi(2))
        .sum();
    
    // Calculate variance from mean
    let mean_activity: f64 = activity_data.iter().sum::<f64>() / n as f64;
    let sum_squared_deviations: f64 = activity_data.iter()
        .map(|&x| (x - mean_activity).powi(2))
        .sum();
    
    if sum_squared_deviations == 0.0 { return 0.0; }
    
    (n as f64 * sum_squared_diffs) / ((n - 1) as f64 * sum_squared_deviations)
}
*/
```

**Cortisol Peak Estimation (TypeScript):**
```typescript
interface CortisolPeakResult {
  estimatedCortisolPeak: number; // timestamp
  confidence: number; // 0-1 correlation score
  adhdDelayHours: number; // hours after noon
}

function estimateCortisolPeakTiming(
  activityData: number[],
  temperatureData: number[],
  timestamps: number[]
): CortisolPeakResult {
  /**
   * Estimates cortisol peak timing using activity and temperature proxies
   * 
   * Method:
   * 1. Smooth activity data to remove noise
   * 2. Find peak of smoothed activity curve
   * 3. Correlate with temperature patterns
   * 4. Adjust for individual baseline
   */
  
  // Smooth activity data (2-hour moving average)
  const smoothedActivity = movingAverage(activityData, 120);
  
  // Find peak activity time (proxy for cortisol peak)
  const peakTimeIdx = smoothedActivity.indexOf(Math.max(...smoothedActivity));
  const peakTime = timestamps[peakTimeIdx];
  
  // Validate with temperature correlation
  const tempCorrelation = validateWithTemperature(temperatureData, timestamps, peakTime);
  
  // Adjust for individual circadian phase
  const individualPhase = getIndividualPhaseOffset();
  const adjustedPeakTime = peakTime + individualPhase;
  
  // Calculate delay from normal noon peak
  const noonTimestamp = getNoonTimestamp(adjustedPeakTime);
  const adhdDelayHours = Math.max(0, (adjustedPeakTime - noonTimestamp) / 3600000);
  
  return {
    estimatedCortisolPeak: adjustedPeakTime,
    confidence: tempCorrelation,
    adhdDelayHours
  };
}

function movingAverage(data: number[], windowSize: number): number[] {
  const result: number[] = [];
  for (let i = 0; i < data.length; i++) {
    const start = Math.max(0, i - Math.floor(windowSize / 2));
    const end = Math.min(data.length, i + Math.floor(windowSize / 2) + 1);
    const window = data.slice(start, end);
    const average = window.reduce((sum, val) => sum + val, 0) / window.length;
    result.push(average);
  }
  return result;
}
```

## Phase 3: Evening Wind-down (6-10 PM)

### Biological Mechanisms
1. **Dim Light Melatonin Onset (DLMO)**
   - Normal: 8-9 PM
   - ADHD: Average 11:43 PM (3+ hour delay)
   - Proxy: Temperature decline, HRV increase

2. **Evening Cortisol Persistence**
   - Normal: Steady decline after afternoon peak
   - ADHD: Remains elevated, "second wind" effect

### Detection Algorithms

**DLMO Estimation:**
```python
def estimate_dlmo(temperature_data, hrv_data, activity_data, timestamps):
    """
    Estimates Dim Light Melatonin Onset using multiple biomarkers
    
    DLMO markers:
    - Temperature decline begins
    - HRV increases (parasympathetic activation)
    - Activity starts to decrease
    """
    
    # Find temperature decline onset
    temp_decline_start = find_temperature_decline_onset(temperature_data, timestamps)
    
    # Find HRV increase onset
    hrv_increase_start = find_hrv_increase_onset(hrv_data, timestamps)
    
    # Find activity decline onset
    activity_decline_start = find_activity_decline_onset(activity_data, timestamps)
    
    # Weighted average of markers
    dlmo_markers = [temp_decline_start, hrv_increase_start, activity_decline_start]
    dlmo_weights = [0.4, 0.3, 0.3] # Temperature most reliable
    
    estimated_dlmo = np.average(dlmo_markers, weights=dlmo_weights)
    
    # Calculate delay from normal
    normal_dlmo = 20.5 * 3600 # 8:30 PM in seconds
    dlmo_delay = (estimated_dlmo - normal_dlmo) / 3600 # Hours
    
    return {
        'estimated_dlmo_time': estimated_dlmo,
        'dlmo_delay_hours': dlmo_delay,
        'adhd_pattern': dlmo_delay > 2.0 # >2 hours delay indicates ADHD pattern
    }
```

**Evening Hyperarousal Detection:**
```python
def detect_evening_hyperarousal(activity_data, hrv_data, timestamps):
    """
    Detects evening hyperarousal typical in ADHD
    
    Markers:
    - Sustained high activity after 8 PM
    - Low HRV (sympathetic dominance)
    - Activity spikes during wind-down period
    """
    
    evening_start = find_time_index(timestamps, 20) # 8 PM
    evening_activity = activity_data[evening_start:]
    evening_hrv = hrv_data[evening_start:]
    
    # Calculate evening activity metrics
    evening_activity_mean = np.mean(evening_activity)
    daytime_activity_mean = np.mean(activity_data[8*60:18*60]) # 8 AM - 6 PM
    
    # High evening activity relative to day
    relative_evening_activity = evening_activity_mean / daytime_activity_mean
    
    # Low HRV indicates sympathetic dominance
    evening_hrv_mean = np.mean(evening_hrv)
    
    # Detect activity spikes
    activity_spikes = count_activity_spikes(evening_activity, threshold=1.5)
    
    hyperarousal_score = calculate_hyperarousal_score(
        relative_evening_activity, 
        evening_hrv_mean, 
        activity_spikes
    )
    
    return {
        'hyperarousal_score': hyperarousal_score,
        'evening_activity_ratio': relative_evening_activity,
        'recommendation': 'wind_down_protocol' if hyperarousal_score > 0.7 else 'normal'
    }
```

## Phase 4: Night Sleep (10 PM - 6 AM)

### Biological Mechanisms
1. **Sleep Onset Delay**
   - Normal: <30 minutes
   - ADHD: Often 1-3 hours
   - Measurement: Time from lights out to sustained inactivity

2. **Sleep Fragmentation**
   - Normal: <5% of night with movement
   - ADHD: 10-20% with restless movement
   - Metric: Nocturnal activity percentage

### Detection Algorithms

**Sleep Efficiency Calculation:**
```python
def calculate_sleep_efficiency(activity_data, timestamps, bedtime, wake_time):
    """
    Calculates sleep efficiency accounting for ADHD patterns
    
    Sleep Efficiency = (Total Sleep Time / Time in Bed) * 100
    
    Normal: >85%
    ADHD: Often 60-80%
    """
    
    # Extract night period data
    night_data = extract_night_period(activity_data, timestamps, bedtime, wake_time)
    
    # Define sleep as periods with activity below threshold
    sleep_threshold = np.percentile(activity_data, 10) # Bottom 10% of activity
    sleep_periods = night_data < sleep_threshold
    
    # Calculate metrics
    total_sleep_time = np.sum(sleep_periods) # Minutes
    time_in_bed = (wake_time - bedtime) / 60 # Minutes
    sleep_efficiency = (total_sleep_time / time_in_bed) * 100
    
    # ADHD-specific metrics
    sleep_onset_latency = calculate_sleep_onset_latency(night_data)
    nocturnal_awakening_count = count_nocturnal_awakenings(night_data)
    
    return {
        'sleep_efficiency': sleep_efficiency,
        'sleep_onset_latency': sleep_onset_latency,
        'nocturnal_awakenings': nocturnal_awakening_count,
        'adhd_pattern': sleep_efficiency < 80 and sleep_onset_latency > 30
    }
```

## Implementation Parameters

### Thresholds for ADHD Pattern Recognition (TypeScript)
```typescript
interface ADHDThresholds {
  morningPhaseDelay: number; // Hours
  cortisolProxyReduction: number; // Ratio of normal
  intradailyVariability: number; // IV score
  dlmoDelay: number; // Hours
  eveningHyperarousal: number; // Score 0-1
  sleepEfficiency: number; // Percentage
  sleepOnsetLatency: number; // Minutes
}

const ADHD_THRESHOLDS: ADHDThresholds = {
  morningPhaseDelay: 1.0,
  cortisolProxyReduction: 0.6,
  intradailyVariability: 0.8,
  dlmoDelay: 2.0,
  eveningHyperarousal: 0.7,
  sleepEfficiency: 80,
  sleepOnsetLatency: 30
};

// Rust constants for performance-critical thresholds
// Place in src-tauri/src/constants.rs:
/*
pub const ADHD_THRESHOLDS: ADHDThresholds = ADHDThresholds {
    morning_phase_delay: 1.0,
    cortisol_proxy_reduction: 0.6,
    intradaily_variability: 0.8,
    dlmo_delay: 2.0,
    evening_hyperarousal: 0.7,
    sleep_efficiency: 80.0,
    sleep_onset_latency: 30.0,
};

#[derive(Debug, Clone)]
pub struct ADHDThresholds {
    pub morning_phase_delay: f64,
    pub cortisol_proxy_reduction: f64,
    pub intradaily_variability: f64,
    pub dlmo_delay: f64,
    pub evening_hyperarousal: f64,
    pub sleep_efficiency: f64,
    pub sleep_onset_latency: f64,
}
*/
```

### Data Requirements
- **Sampling Rate:** Minimum 1-minute intervals for activity, 5-minute for temperature/HRV
- **History Required:** 14 days minimum for pattern recognition
- **Sensors:** Accelerometer, heart rate, skin temperature, ambient light

## Tauri Integration Architecture

### Frontend-Backend Communication
```typescript
// Frontend: Invoke Rust functions for heavy computations
import { invoke } from '@tauri-apps/api/tauri';

interface CircadianAnalysisRequest {
  activityData: number[];
  temperatureData: number[];
  hrvData: number[];
  timestamps: number[];
  userId: string;
}

class CircadianAnalyzer {
  async analyzeCircadianPhases(data: CircadianAnalysisRequest) {
    // Use Rust for performance-critical calculations
    const ivScore = await invoke('calculate_intradaily_variability_rust', {
      activityData: data.activityData
    });
    
    const sleepEfficiency = await invoke('calculate_sleep_efficiency_rust', {
      activityData: data.activityData,
      timestamps: data.timestamps
    });
    
    // Use TypeScript for UI logic and data formatting
    const awakeningPattern = await this.detectAwakeningPattern({
      activityData: data.activityData,
      temperatureData: data.temperatureData,
      timeStamps: data.timestamps
    });
    
    return {
      ivScore,
      sleepEfficiency,
      awakeningPattern,
      adhdPatternScore: this.calculateOverallADHDScore(ivScore, sleepEfficiency, awakeningPattern)
    };
  }
}
```

### Rust Backend Structure
```rust
// src-tauri/src/circadian_analysis.rs
use tauri::command;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct CircadianMetrics {
    pub intradaily_variability: f64,
    pub sleep_efficiency: f64,
    pub phase_delay: f64,
    pub adhd_pattern_score: f64,
}

#[command]
pub async fn analyze_circadian_pattern(
    activity_data: Vec<f64>,
    temperature_data: Vec<f64>,
    timestamps: Vec<i64>
) -> Result<CircadianMetrics, String> {
    // Heavy computational work in Rust for performance
    let iv = calculate_intradaily_variability_rust(activity_data.clone());
    let sleep_eff = calculate_sleep_efficiency_detailed(&activity_data, &timestamps);
    let phase_delay = estimate_phase_delay(&temperature_data, &timestamps);
    
    Ok(CircadianMetrics {
        intradaily_variability: iv,
        sleep_efficiency: sleep_eff,
        phase_delay,
        adhd_pattern_score: calculate_adhd_pattern_score(iv, sleep_eff, phase_delay),
    })
}
```

### Performance Optimization Strategy
- **TypeScript**: UI logic, data formatting, user interactions
- **Rust**: Mathematical computations, large dataset processing, pattern recognition algorithms
- **Database**: SQLite via Tauri for storing historical circadian data
- **Real-time**: WebSockets for live sensor data streaming

This technical brief provides the foundation for implementing ADHD-specific circadian phase detection with TypeScript/Rust architecture.

**See also:**
- ADHD Circadian Rhythms App Development Brief  
- Brief 2: Biomarkers & Tracking Metrics Technical Implementation

## Appendix: HealthKit Type Glossary

| HealthKit Identifier | Description |
|----------------------|-------------|
| `sleepAnalysis` | Sleep periods with in-bed/asleep states |
| `stepCount` | Step count data for activity patterns |
| `heartRate` | Heart rate measurements |
| `heartRateVariabilitySDNN` | Standard deviation of NN intervals |
| `appleSleepingWristTemperature` | Wrist temperature during sleep |
| `timeInDaylight` | Light exposure duration |
| `activeEnergyBurned` | Calories burned through activity |
| `basalEnergyBurned` | Basal metabolic rate |
| `distanceWalkingRunning` | Distance traveled on foot |
| `flightsClimbed` | Flights of stairs climbed |
| `environmentalAudioExposure` | Environmental noise levels |
| `headphoneAudioExposure` | Audio exposure through headphones |