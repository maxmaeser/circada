import { movingAverage } from "./math";
import type { TimeSeries } from "./types";
import type { UltradianAnalysis, UltradianCycle } from "./types";

/**
 * Detects 90-minute basic rest–activity cycles from activity data.
 * Very naive implementation:  
 * 1. Smooth the signal with a short moving average.  
 * 2. Find local maxima separated by ≥60 min (60 samples).  
 * 3. Each cycle spans from one peak to the next.
 */
export function detectUltradianCycles(activity: TimeSeries): UltradianAnalysis {
  const { values, timestamps } = activity;
  if (values.length < 180) {
    return { cycles: [], avgDurationMinutes: 0, cycleCount: 0 };
  }

  const smooth = movingAverage(values, 5);
  const minPeakDistance = 60; // samples (assumes 1-min sampling)
  const peaks: number[] = [];

  for (let i = 1; i < smooth.length - 1; i++) {
    if (smooth[i] > smooth[i - 1] && smooth[i] > smooth[i + 1]) {
      if (peaks.length === 0 || i - peaks[peaks.length - 1] >= minPeakDistance) {
        peaks.push(i);
      } else if (smooth[i] > smooth[peaks[peaks.length - 1]]) {
        // replace previous peak if this one is higher within distance window
        peaks[peaks.length - 1] = i;
      }
    }
  }

  const cycles: UltradianCycle[] = [];
  for (let p = 0; p < peaks.length - 1; p++) {
    const startIdx = peaks[p];
    const endIdx = peaks[p + 1];
    const amplitude = smooth[startIdx];
    cycles.push({
      start: timestamps[startIdx],
      end: timestamps[endIdx],
      peakTime: timestamps[startIdx],
      amplitude,
    });
  }

  const durations = cycles.map(c => (c.end - c.start) / 60000); // minutes
  const avgDuration = durations.length ? durations.reduce((a, b) => a + b, 0) / durations.length : 0;

  return {
    cycles,
    avgDurationMinutes: avgDuration,
    cycleCount: cycles.length,
  };
} 