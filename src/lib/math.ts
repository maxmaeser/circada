/*
  Lightweight statistical helpers shared across the analytics engine.
  Keep the implementation dependency-free so we can reuse inside both
  React and Node contexts (e.g. vitest).
*/

// Return arithmetic mean of an array. Empty array -> 0.
export function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, val) => sum + val, 0) / values.length;
}

// Population standard deviation (N denominator)
export function standardDeviation(values: number[]): number {
  if (values.length === 0) return 0;
  const avg = mean(values);
  const squareDiffs = values.map(v => (v - avg) ** 2);
  return Math.sqrt(mean(squareDiffs));
}

// Percentile using linear interpolation between closest ranks
export function percentile(data: number[], p: number): number {
  if (data.length === 0) return 0;
  if (p <= 0) return Math.min(...data);
  if (p >= 100) return Math.max(...data);

  const sorted = [...data].sort((a, b) => a - b);
  const idx = (p / 100) * (sorted.length - 1);
  const lower = Math.floor(idx);
  const upper = Math.ceil(idx);
  if (lower === upper) return sorted[lower];
  return sorted[lower] + (sorted[upper] - sorted[lower]) * (idx - lower);
}

// Simple moving average; pads edges by reducing window size near borders.
export function movingAverage(data: number[], windowSize: number): number[] {
  if (windowSize <= 1) return [...data];
  const half = Math.floor(windowSize / 2);
  const result: number[] = new Array(data.length);

  for (let i = 0; i < data.length; i++) {
    const start = Math.max(0, i - half);
    const end = Math.min(data.length, i + half + 1);
    const slice = data.slice(start, end);
    result[i] = mean(slice);
  }
  return result;
} 