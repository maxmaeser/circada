import { mean } from "./math";

export interface TimeDomainHRV {
  rmssd: number;
  pnn50: number;
  sdnn: number;
}

/**
 * Clean RR intervals by removing out-of-range or outlier values.
 * Very basic filtering suitable for smartwatch-derived data.
 */
export function cleanRRIntervals(rr: number[]): number[] {
  const filtered: number[] = [];
  const median = quickMedian(rr);
  for (let i = 0; i < rr.length; i++) {
    const val = rr[i];
    if (val < 300 || val > 2000) continue; // physiological range
    const deviation = Math.abs(val - median) / median;
    if (deviation > 0.3) continue; // >30% from median treated as artifact
    filtered.push(val);
  }
  return filtered;
}

/**
 * Compute basic time-domain HRV metrics (RMSSD, pNN50, SDNN)
 */
export function computeTimeDomainMetrics(rr: number[]): TimeDomainHRV {
  if (rr.length < 2) {
    return { rmssd: 0, pnn50: 0, sdnn: 0 };
  }
  const successiveDiffsSquared: number[] = [];
  let nn50 = 0;
  let sum = 0;
  for (let i = 1; i < rr.length; i++) {
    const diff = rr[i] - rr[i - 1];
    if (Math.abs(diff) > 50) nn50++;
    successiveDiffsSquared.push(diff * diff);
    sum += rr[i];
  }
  const rmssd = Math.sqrt(successiveDiffsSquared.reduce((a, b) => a + b, 0) / successiveDiffsSquared.length);
  const pnn50 = (nn50 / (rr.length - 1)) * 100;
  const sdnn = Math.sqrt(rr.map(v => (v - mean(rr)) ** 2).reduce((a, b) => a + b, 0) / rr.length);
  return { rmssd, pnn50, sdnn };
}

// -------------- helpers --------------
function quickMedian(arr: number[]): number {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
} 