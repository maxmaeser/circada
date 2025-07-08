---
Area: Circada
tags:
  - ai-context
  - healthkit-sync
---

# Brief 2: Biomarkers & Tracking Metrics - Technical Implementation

## Overview
This brief provides detailed technical implementation for circadian biomarker detection, sensor data processing, and ADHD-specific metric calculations. Focus on real-time processing, accuracy optimization, and scalable data handling.

## Raw Streams & Derived Metrics

| Raw HealthKit Stream | Processing Step | Derived Output |
|---------------------|----------------|----------------|
| `sleepAnalysis` | Sleep scoring algorithm | Sleep efficiency, onset latency, fragmentation index |
| `stepCount` + `heartRate` | IV/IS calculation | Intradaily variability, interdaily stability |
| `appleSleepingWristTemperature` | Cosinor modeling | Temperature rhythm amplitude, phase, DLMO proxy |
| `heartRateVariabilitySDNN` | Time-frequency analysis | Autonomic balance, circadian HRV patterns |
| `timeInDaylight` | Light exposure analysis | Zeitgeber strength, phase-shifting potential |
| `activeEnergyBurned` | Activity pattern analysis | Ultradian cycles, activity fragmentation |

### Primary Trackable Biomarkers

## 1. Sleep-Wake Timing Analysis

**Data sources:** sleepAnalysis · heartRate · heartRateVariabilitySDNN · stepCount

### Biological Mechanism
Sleep-wake timing reflects the fundamental circadian rhythm output. In ADHD, this timing is consistently delayed and more variable than neurotypical patterns.

### Detection Algorithms

**Sleep Onset Detection (TypeScript):**
```typescript
interface SleepOnsetResult {
  sleepOnsetTime: number; // timestamp
  sleepOnsetLatency: number; // minutes from bedtime intention
  sleepEfficiency: number; // percentage
  adhdPattern: boolean;
}

interface ActivityWindow {
  timestamp: number;
  activityLevel: number;
  isRestPeriod: boolean;
}

class SleepOnsetDetector {
  private readonly SLEEP_THRESHOLD_PERCENTILE = 15; // Bottom 15% of daily activity
  private readonly SUSTAINED_PERIOD_MINUTES = 10;
  private readonly ADHD_ONSET_THRESHOLD = 30; // Minutes

  async detectSleepOnset(
    activityData: number[],
    timestamps: number[],
    bedtimeIntention?: number
  ): Promise<SleepOnsetResult> {
    
    // Calculate dynamic sleep threshold based on individual's daily pattern
    const sleepThreshold = this.calculatePersonalizedSleepThreshold(activityData);
    
    // Find first sustained low activity period
    const sleepOnsetTime = this.findSustainedLowActivity(
      activityData, 
      timestamps, 
      sleepThreshold
    );
    
    // Calculate sleep onset latency
    const bedtime = bedtimeIntention || this.estimateBedtimeIntention(timestamps, activityData);
    const sleepOnsetLatency = (sleepOnsetTime - bedtime) / 60000; // Convert to minutes
    
    // Calculate sleep efficiency for the night
    const sleepEfficiency = await this.calculateNightSleepEfficiency(
      activityData, 
      timestamps, 
      sleepOnsetTime
    );
    
    return {
      sleepOnsetTime,
      sleepOnsetLatency,
      sleepEfficiency,
      adhdPattern: sleepOnsetLatency > this.ADHD_ONSET_THRESHOLD
    };
  }

  private calculatePersonalizedSleepThreshold(activityData: number[]): number {
    // Use individual's activity distribution rather than fixed threshold
    const sortedActivity = [...activityData].sort((a, b) => a - b);
    return sortedActivity[Math.floor(sortedActivity.length * this.SLEEP_THRESHOLD_PERCENTILE / 100)];
  }

  private findSustainedLowActivity(
    activityData: number[], 
    timestamps: number[], 
    threshold: number
  ): number {
    const windowSize = this.SUSTAINED_PERIOD_MINUTES;
    
    for (let i = 0; i <= activityData.length - windowSize; i++) {
      const window = activityData.slice(i, i + windowSize);
      const sustainedLowActivity = window.every(activity => activity <= threshold);
      
      if (sustainedLowActivity) {
        return timestamps[i];
      }
    }
    
    return timestamps[0]; // Fallback if no clear sleep onset found
  }
}
```

**Sleep Efficiency Calculation (Rust - Performance Critical):**
```rust
// src-tauri/src/sleep_analysis.rs
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct SleepEfficiencyMetrics {
    pub total_sleep_time: f64,      // minutes
    pub time_in_bed: f64,           // minutes
    pub sleep_efficiency: f64,       // percentage
    pub wake_after_sleep_onset: f64, // minutes
    pub sleep_fragmentation_index: f64, // custom ADHD metric
}

#[tauri::command]
pub fn calculate_sleep_efficiency_detailed(
    activity_data: Vec<f64>,
    timestamps: Vec<i64>,
    sleep_onset: i64,
    wake_time: i64
) -> Result<SleepEfficiencyMetrics, String> {
    
    let sleep_period_indices = extract_sleep_period_indices(&timestamps, sleep_onset, wake_time);
    let sleep_period_activity = extract_period_data(&activity_data, &sleep_period_indices);
    
    // Calculate personalized sleep threshold
    let sleep_threshold = calculate_sleep_threshold(&activity_data);
    
    // Identify sleep vs wake periods during night
    let sleep_periods = identify_sleep_periods(&sleep_period_activity, sleep_threshold);
    
    let total_sleep_time = calculate_total_sleep_time(&sleep_periods);
    let time_in_bed = (wake_time - sleep_onset) as f64 / 60000.0; // Convert ms to minutes
    let sleep_efficiency = (total_sleep_time / time_in_bed) * 100.0;
    
    // ADHD-specific metric: fragmentation during sleep
    let fragmentation_index = calculate_sleep_fragmentation_index(&sleep_periods);
    
    let wake_after_sleep_onset = time_in_bed - total_sleep_time;
    
    Ok(SleepEfficiencyMetrics {
        total_sleep_time,
        time_in_bed,
        sleep_efficiency,
        wake_after_sleep_onset,
        sleep_fragmentation_index: fragmentation_index,
    })
}

fn calculate_sleep_fragmentation_index(sleep_periods: &[bool]) -> f64 {
    // Count transitions between sleep and wake states
    let mut transitions = 0;
    for i in 1..sleep_periods.len() {
        if sleep_periods[i] != sleep_periods[i-1] {
            transitions += 1;
        }
    }
    
    // Normalize by period length (higher = more fragmented, ADHD pattern)
    transitions as f64 / sleep_periods.len() as f64 * 1000.0
}
```

## 2. Core Body Temperature Tracking

### Biological Mechanism
Core body temperature oscillates 1-2°C daily, reaching minimum at 3-5 AM. ADHD patterns show delayed nadir and reduced amplitude.

### Implementation Strategy

**Temperature Processing (TypeScript):**
```typescript
interface TemperatureMetrics {
  dailyAmplitude: number; // °C variation
  temperatureNadir: {
    time: number; // timestamp of lowest temp
    value: number; // temperature value
  };
  phaseDelay: number; // hours from normal 4 AM nadir
  adhdPattern: boolean;
}

class TemperatureAnalyzer {
  private readonly NORMAL_NADIR_HOUR = 4; // 4 AM
  private readonly ADHD_AMPLITUDE_THRESHOLD = 0.8; // 80% of normal amplitude
  private readonly SAMPLING_WINDOW_HOURS = 24;

  async analyzeTemperatureRhythm(
    temperatureData: number[],
    timestamps: number[]
  ): Promise<TemperatureMetrics> {
    
    // Smooth temperature data to remove noise
    const smoothedTemperature = this.applySavitzkyGolayFilter(temperatureData, 11, 3);
    
    // Find daily temperature nadir
    const nadir = this.findTemperatureNadir(smoothedTemperature, timestamps);
    
    // Calculate daily amplitude (max - min)
    const dailyAmplitude = Math.max(...smoothedTemperature) - Math.min(...smoothedTemperature);
    
    // Calculate phase delay from normal 4 AM nadir
    const nadirHour = new Date(nadir.time).getHours() + (new Date(nadir.time).getMinutes() / 60);
    const phaseDelay = this.calculatePhaseDelay(nadirHour, this.NORMAL_NADIR_HOUR);
    
    return {
      dailyAmplitude,
      temperatureNadir: nadir,
      phaseDelay,
      adhdPattern: this.isADHDTemperaturePattern(dailyAmplitude, phaseDelay)
    };
  }

  private applySavitzkyGolayFilter(data: number[], windowSize: number, polynomialOrder: number): number[] {
    // Implement Savitzky-Golay smoothing filter for temperature data
    // This preserves the shape of temperature oscillations while reducing noise
    
    const result: number[] = [];
    const halfWindow = Math.floor(windowSize / 2);
    
    for (let i = 0; i < data.length; i++) {
      const start = Math.max(0, i - halfWindow);
      const end = Math.min(data.length, i + halfWindow + 1);
      const window = data.slice(start, end);
      
      // Apply polynomial fitting (simplified version)
      const smoothedValue = this.applyPolynomialSmoothing(window, polynomialOrder);
      result.push(smoothedValue);
    }
    
    return result;
  }

  private findTemperatureNadir(temperatureData: number[], timestamps: number[]): { time: number; value: number } {
    // Find the minimum temperature during typical circadian nadir window (12 AM - 8 AM)
    const nightIndices = timestamps
      .map((timestamp, index) => ({ timestamp, index }))
      .filter(({ timestamp }) => {
        const hour = new Date(timestamp).getHours();
        return hour >= 0 && hour <= 8; // Midnight to 8 AM
      });
    
    if (nightIndices.length === 0) {
      // Fallback: find global minimum
      const minIndex = temperatureData.indexOf(Math.min(...temperatureData));
      return { time: timestamps[minIndex], value: temperatureData[minIndex] };
    }
    
    let minTemp = Infinity;
    let minIndex = 0;
    
    for (const { index } of nightIndices) {
      if (temperatureData[index] < minTemp) {
        minTemp = temperatureData[index];
        minIndex = index;
      }
    }
    
    return { time: timestamps[minIndex], value: temperatureData[minIndex] };
  }
}
```

**High-Performance Temperature Analysis (Rust):**
```rust
// src-tauri/src/temperature_analysis.rs
use std::f64::consts::PI;

#[derive(Debug, Serialize, Deserialize)]
pub struct TemperatureRhythmAnalysis {
    pub amplitude: f64,
    pub acrophase: f64,      // Peak time in hours from midnight
    pub mesor: f64,          // Mean temperature
    pub robustness: f64,     // Rhythm strength (0-1)
    pub phase_delay_hours: f64,
}

#[tauri::command]
pub fn analyze_temperature_rhythm_advanced(
    temperature_data: Vec<f64>,
    timestamps: Vec<i64>
) -> Result<TemperatureRhythmAnalysis, String> {
    
    if temperature_data.len() < 144 { // Minimum 24 hours at 10-min intervals
        return Err("Insufficient data for rhythm analysis".to_string());
    }
    
    // Convert timestamps to hours from midnight
    let time_hours: Vec<f64> = timestamps.iter()
        .map(|&ts| ((ts % 86400000) as f64) / 3600000.0) // Modulo 24 hours, convert to hours
        .collect();
    
    // Perform cosinor analysis to fit circadian curve
    let cosinor_result = fit_cosinor_model(&temperature_data, &time_hours)?;
    
    // Calculate phase delay from normal 4 AM nadir
    let expected_nadir_hour = 4.0;
    let actual_nadir_hour = (cosinor_result.acrophase + 12.0) % 24.0; // Nadir is 12h from acrophase
    let phase_delay = calculate_circular_difference(actual_nadir_hour, expected_nadir_hour);
    
    Ok(TemperatureRhythmAnalysis {
        amplitude: cosinor_result.amplitude,
        acrophase: cosinor_result.acrophase,
        mesor: cosinor_result.mesor,
        robustness: cosinor_result.r_squared,
        phase_delay_hours: phase_delay,
    })
}

struct CosinorResult {
    amplitude: f64,
    acrophase: f64,
    mesor: f64,
    r_squared: f64,
}

fn fit_cosinor_model(temperature_data: &[f64], time_hours: &[f64]) -> Result<CosinorResult, String> {
    // Fit model: Temperature = Mesor + Amplitude * cos(2π * (time - acrophase) / 24)
    // Using least squares regression on cos and sin components
    
    let n = temperature_data.len() as f64;
    let mut sum_temp = 0.0;
    let mut sum_cos = 0.0;
    let mut sum_sin = 0.0;
    let mut sum_temp_cos = 0.0;
    let mut sum_temp_sin = 0.0;
    let mut sum_cos_squared = 0.0;
    let mut sum_sin_squared = 0.0;
    
    for i in 0..temperature_data.len() {
        let temp = temperature_data[i];
        let cos_component = (2.0 * PI * time_hours[i] / 24.0).cos();
        let sin_component = (2.0 * PI * time_hours[i] / 24.0).sin();
        
        sum_temp += temp;
        sum_cos += cos_component;
        sum_sin += sin_component;
        sum_temp_cos += temp * cos_component;
        sum_temp_sin += temp * sin_component;
        sum_cos_squared += cos_component * cos_component;
        sum_sin_squared += sin_component * sin_component;
    }
    
    // Calculate regression coefficients
    let mesor = sum_temp / n;
    let beta_cos = (sum_temp_cos - (sum_temp * sum_cos / n)) / (sum_cos_squared - (sum_cos * sum_cos / n));
    let beta_sin = (sum_temp_sin - (sum_temp * sum_sin / n)) / (sum_sin_squared - (sum_sin * sum_sin / n));
    
    // Calculate amplitude and acrophase
    let amplitude = (beta_cos * beta_cos + beta_sin * beta_sin).sqrt();
    let acrophase = beta_sin.atan2(beta_cos) * 24.0 / (2.0 * PI);
    let acrophase_normalized = if acrophase < 0.0 { acrophase + 24.0 } else { acrophase };
    
    // Calculate R-squared for goodness of fit
    let mut ss_total = 0.0;
    let mut ss_residual = 0.0;
    
    for i in 0..temperature_data.len() {
        let predicted = mesor + amplitude * (2.0 * PI * (time_hours[i] - acrophase_normalized) / 24.0).cos();
        let residual = temperature_data[i] - predicted;
        let total_deviation = temperature_data[i] - mesor;
        
        ss_residual += residual * residual;
        ss_total += total_deviation * total_deviation;
    }
    
    let r_squared = 1.0 - (ss_residual / ss_total);
    
    Ok(CosinorResult {
        amplitude,
        acrophase: acrophase_normalized,
        mesor,
        r_squared,
    })
}
```

## 3. Heart Rate Variability (HRV) Analysis

### Biological Mechanism
HRV reflects autonomic nervous system balance. Circadian HRV patterns show parasympathetic dominance at night (higher HRV) and sympathetic dominance during day (lower HRV). ADHD disrupts this pattern.

### Advanced HRV Processing

**Real-time HRV Analysis (TypeScript):**
```typescript
interface HRVMetrics {
  rmssd: number;        // Root mean square of successive differences
  pnn50: number;        // % of NN intervals >50ms different
  sdnn: number;         // Standard deviation of NN intervals
  triangularIndex: number; // Triangular interpolation
  frequency: {
    lf: number;         // Low frequency power (0.04-0.15 Hz)
    hf: number;         // High frequency power (0.15-0.4 Hz)
    lfHfRatio: number;  // LF/HF ratio (autonomic balance)
  };
  circadianPattern: {
    dayMean: number;
    nightMean: number;
    amplitude: number;
    adhdPattern: boolean;
  };
}

class HRVAnalyzer {
  private readonly SAMPLING_RATE = 1000; // 1000 Hz for ECG data
  private readonly WINDOW_SIZE_MINUTES = 5;

  async calculateComprehensiveHRV(
    rrIntervals: number[], // R-R intervals in milliseconds
    timestamps: number[]
  ): Promise<HRVMetrics> {
    
    // Clean and validate R-R intervals
    const cleanRRIntervals = this.cleanRRIntervals(rrIntervals);
    
    // Time domain metrics
    const timeDomainMetrics = this.calculateTimeDomainHRV(cleanRRIntervals);
    
    // Frequency domain analysis
    const frequencyMetrics = await this.calculateFrequencyDomainHRV(cleanRRIntervals);
    
    // Circadian pattern analysis
    const circadianPattern = this.analyzeHRVCircadianPattern(
      cleanRRIntervals, 
      timestamps
    );
    
    return {
      ...timeDomainMetrics,
      frequency: frequencyMetrics,
      circadianPattern
    };
  }

  private cleanRRIntervals(rrIntervals: number[]): number[] {
    // Remove artifacts and ectopic beats using adaptive filtering
    const cleaned: number[] = [];
    const medianRR = this.calculateMedian(rrIntervals);
    
    for (let i = 0; i < rrIntervals.length; i++) {
      const rr = rrIntervals[i];
      
      // Physiological range check (300-2000 ms)
      if (rr < 300 || rr > 2000) continue;
      
      // Adaptive artifact detection
      const deviation = Math.abs(rr - medianRR) / medianRR;
      if (deviation > 0.3) continue; // Remove if >30% deviation from median
      
      // Check for sudden changes
      if (i > 0 && i < rrIntervals.length - 1) {
        const prevRR = rrIntervals[i - 1];
        const nextRR = rrIntervals[i + 1];
        const change1 = Math.abs(rr - prevRR) / prevRR;
        const change2 = Math.abs(nextRR - rr) / rr;
        
        if (change1 > 0.2 && change2 > 0.2) continue; // Likely artifact
      }
      
      cleaned.push(rr);
    }
    
    return cleaned;
  }

  private calculateTimeDomainHRV(rrIntervals: number[]): {
    rmssd: number;
    pnn50: number;
    sdnn: number;
    triangularIndex: number;
  } {
    if (rrIntervals.length < 2) {
      return { rmssd: 0, pnn50: 0, sdnn: 0, triangularIndex: 0 };
    }
    
    // RMSSD calculation
    const successive_diffs = rrIntervals.slice(1).map((rr, i) => 
      Math.pow(rr - rrIntervals[i], 2)
    );
    const rmssd = Math.sqrt(successive_diffs.reduce((a, b) => a + b, 0) / successive_diffs.length);
    
    // pNN50 calculation
    const nn50_count = successive_diffs.filter(diff => Math.sqrt(diff) > 50).length;
    const pnn50 = (nn50_count / successive_diffs.length) * 100;
    
    // SDNN calculation
    const mean_rr = rrIntervals.reduce((a, b) => a + b, 0) / rrIntervals.length;
    const squared_diffs = rrIntervals.map(rr => Math.pow(rr - mean_rr, 2));
    const sdnn = Math.sqrt(squared_diffs.reduce((a, b) => a + b, 0) / squared_diffs.length);
    
    // Triangular Index (geometric method)
    const triangularIndex = this.calculateTriangularIndex(rrIntervals);
    
    return { rmssd, pnn50, sdnn, triangularIndex };
  }

  private async calculateFrequencyDomainHRV(rrIntervals: number[]): Promise<{
    lf: number;
    hf: number;
    lfHfRatio: number;
  }> {
    // Resample to 4 Hz for frequency analysis
    const resampledData = await this.resampleRRIntervals(rrIntervals, 4);
    
    // Apply FFT using Web Audio API or implement basic FFT
    const fftResult = await this.performFFT(resampledData);
    
    // Calculate power in frequency bands
    const lf = this.calculatePowerInBand(fftResult, 0.04, 0.15); // 0.04-0.15 Hz
    const hf = this.calculatePowerInBand(fftResult, 0.15, 0.4);  // 0.15-0.4 Hz
    const lfHfRatio = lf / hf;
    
    return { lf, hf, lfHfRatio };
  }
}
```

## 3. Heart Rate Variability (HRV) Analysis

**Data sources:** heartRateVariabilitySDNN · heartRate

*Use multi-day rolling amplitude to flag blunted night-day difference (< 20 ms).*

### Biological Mechanism
HRV reflects autonomic nervous system balance. Circadian HRV patterns show parasympathetic dominance at night (higher HRV) and sympathetic dominance during day (lower HRV). ADHD disrupts this pattern.

## 4. Temperature Analysis

**Data sources:** appleSleepingWristTemperature

*If appleSleepingWristTemperature present, call fit_cosinor_model nightly for DLMO proxy.*

### Implementation
Replace manual min-max scan with `TemperatureAnalyzer.analyzeTemperatureRhythm()` call:

```typescript
const temperatureAnalysis = await TemperatureAnalyzer.analyzeTemperatureRhythm(
  temperatureData,
  timestamps
);
```

### Edge-case Handling
- **Series 6 vs 8 sensors:** Different temperature accuracy and sampling rates
- **Missing data imputation:** Use linear interpolation for gaps <30 minutes, exclude longer gaps
- **Sensor drift:** Calibrate against known circadian patterns
- **Environmental interference:** Filter out external temperature influences

> **Minimal Viable Bundle**
> sleepAnalysis · stepCount · heartRate · heartRateVariabilitySDNN (works on any Apple Watch)

**See also:**
- ADHD Circadian Rhythms App Development Brief
- Brief 1: Core Circadian Phases Technical Implementation

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