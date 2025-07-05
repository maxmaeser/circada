/*
  Shared data model definitions for circadian logic layer.
  ------------------------------------------------------------------
  These types sit at the core of the analytics engine so that both
  frontend TypeScript and backend Rust (via serde) can share a common
  vocabulary. Wherever possible we keep them generic and minimal –
  concrete feature-specific result interfaces (e.g. AwakeningResult)
  will extend these primitives in their respective modules.
*/

// Epoch milliseconds for every timestamp throughout the codebase
export type EpochMs = number;

// Generic numeric time-series with parallel arrays for compactness.
// All arrays MUST have equal length and be kept in sync.
export interface TimeSeries {
  timestamps: EpochMs[]; // Parallel array of epoch ms timestamps
  values: number[];      // Sampled numeric values at each timestamp
}

// Wrapper for multiple optional sensor streams that the analysis
// engine can operate on. A provider may populate any subset; missing
// streams are simply left undefined.
export interface CircadianInputData {
  activity?: TimeSeries;       // e.g. step count, accelerometer magnitude
  temperature?: TimeSeries;    // e.g. wrist/core temperature
  hrv?: TimeSeries;            // HRV metrics (e.g. SDNN) over equal intervals
  heartRate?: TimeSeries;      // Instantaneous heart-rate readings
  sleepStages?: TimeSeries;    // Encoded sleep stages (optional)
  lightExposure?: TimeSeries;  // Ambient light / Zeitgeber strength
}

// Minimal envelope around any derived metric so we can pipe generic
// result arrays through Zustand store.
export interface DerivedMetric<TValue = unknown> {
  value: TValue;
  confidence?: number; // Optional 0-1 confidence/probability score
  source?: string;     // Optional identifier for algorithm version
}

// Aggregate output of the full analysis pipeline
export interface CircadianAnalysis {
  intradailyVariability?: DerivedMetric<number>;
  sleepEfficiency?: DerivedMetric<number>;
  temperaturePhaseDelay?: DerivedMetric<number>; // hours
  adhdPatternScore?: DerivedMetric<number>;      // 0-1
  // Additional results added incrementally as modules mature
} 