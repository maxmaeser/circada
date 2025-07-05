export interface ADHDThresholds {
  morningPhaseDelay: number; // hours
  intradailyVariability: number; // IV score
  sleepEfficiency: number; // percentage
}

export const ADHD_THRESHOLDS: ADHDThresholds = {
  morningPhaseDelay: 1.0,
  intradailyVariability: 0.8,
  sleepEfficiency: 80,
}; 