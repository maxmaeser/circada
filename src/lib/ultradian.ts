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
  const minPeakDistance = 60; // samples
  const maxPeakDistance = 120; // samples
  const ampThreshold = 30; // discard low-activity peaks (sleep)
  const peaks: number[] = [];

  for (let i = 1; i < smooth.length - 1; i++) {
    if (smooth[i] > smooth[i - 1] && smooth[i] > smooth[i + 1]) {
      if (smooth[i] < ampThreshold) continue; // skip low peaks

      const hour = new Date(timestamps[i]).getHours();
      if (hour < 7 || hour > 22) continue; // skip outside waking window

      if (peaks.length === 0 || i - peaks[peaks.length - 1] >= minPeakDistance) {
        peaks.push(i);
      } else if (smooth[i] > smooth[peaks[peaks.length - 1]]) {
        // replace previous peak if this one is higher within distance window
        peaks[peaks.length - 1] = i;
      }
    }
  }

  // Enforce distance constraints between consecutive accepted peaks
  const accepted: number[] = [];
  for (const idx of peaks) {
    if (accepted.length === 0) {
      accepted.push(idx);
      continue;
    }
    const gap = idx - accepted[accepted.length - 1];
    if (gap < minPeakDistance) {
      // Too close – keep the taller of the two
      if (smooth[idx] > smooth[accepted[accepted.length - 1]]) {
        accepted[accepted.length - 1] = idx;
      }
    } else {
      accepted.push(idx);
    }
  }

  const cycles: UltradianCycle[] = [];
  for (let p = 0; p < accepted.length - 1; p++) {
    const startIdx = accepted[p];
    const endIdx = accepted[p + 1];
    const gap = endIdx - startIdx;

    if (gap > maxPeakDistance) {
      // Split long gap into pseudo cycles of 90 min until within range
      const approxCycle = 90; // minutes
      let splitStart = startIdx;
      while (splitStart + approxCycle < endIdx) {
        const splitEnd = splitStart + approxCycle;
        cycles.push({
          start: timestamps[splitStart],
          end: timestamps[splitEnd],
          peakTime: timestamps[splitStart],
          amplitude: smooth[splitStart],
        });
        splitStart = splitEnd;
      }
      // last segment
      cycles.push({
        start: timestamps[splitStart],
        end: timestamps[endIdx],
        peakTime: timestamps[splitStart],
        amplitude: smooth[splitStart],
      });
    } else {
      cycles.push({
        start: timestamps[startIdx],
        end: timestamps[endIdx],
        peakTime: timestamps[startIdx],
        amplitude: smooth[startIdx],
      });
    }
  }

  const durations = cycles.map(c => (c.end - c.start) / 60000); // minutes
  const avgDuration = durations.length ? durations.reduce((a, b) => a + b, 0) / durations.length : 0;

  return {
    cycles,
    avgDurationMinutes: avgDuration,
    cycleCount: cycles.length,
  };
} 