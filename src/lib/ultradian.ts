import { movingAverage } from "./math";
import type { TimeSeries } from "./types";
import type { UltradianAnalysis, UltradianCycle } from "./types";

/**
 * Detects 90-minute basic rest–activity cycles from activity data.
 * Refined logic:
 * 1. Smooth signal.
 * 2. Find ALL local maxima (candidate peaks).
 * 3. Filter candidates by amplitude (>30) and waking hours (7 AM - 10 PM).
 * 4. From the clean list, form cycles ONLY between consecutive peaks
 *    that are 60-120 minutes apart.
 */
export function detectUltradianCycles(activity: TimeSeries): UltradianAnalysis {
  const { values, timestamps } = activity;
  if (values.length < 180) {
    return { cycles: [], avgDurationMinutes: 0, cycleCount: 0 };
  }

  const smooth = movingAverage(values, 5);
  const minPeakDistance = 60;
  const maxPeakDistance = 120;
  const ampThreshold = 30;

  // 1. Find all candidate peaks
  const candidatePeaks: number[] = [];
  for (let i = 1; i < smooth.length - 1; i++) {
    if (smooth[i] > smooth[i - 1] && smooth[i] > smooth[i + 1]) {
      candidatePeaks.push(i);
    }
  }

  // 2. Filter peaks by amplitude and waking hours
  const filteredPeaks = candidatePeaks.filter(idx => {
    if (smooth[idx] < ampThreshold) return false;
    const hour = new Date(timestamps[idx]).getHours();
    return hour >= 7 && hour < 22;
  });

  // 3. Process filtered peaks to form valid cycles
  const cycles: UltradianCycle[] = [];
  if (filteredPeaks.length < 2) {
    return { cycles: [], avgDurationMinutes: 0, cycleCount: 0 };
  }

  let lastPeakIdx = filteredPeaks[0];

  for (let i = 1; i < filteredPeaks.length; i++) {
    const currentPeakIdx = filteredPeaks[i];
    const gap = currentPeakIdx - lastPeakIdx;

    if (gap >= minPeakDistance && gap <= maxPeakDistance) {
      cycles.push({
        start: timestamps[lastPeakIdx],
        end: timestamps[currentPeakIdx],
        peakTime: timestamps[lastPeakIdx],
        amplitude: smooth[lastPeakIdx],
      });
    }
    // The current peak always becomes the start of the next potential cycle
    lastPeakIdx = currentPeakIdx;
  }

  const durations = cycles.map(c => (c.end - c.start) / 60000);
  const avgDuration = durations.length ? durations.reduce((a, b) => a + b, 0) / durations.length : 0;

  return {
    cycles,
    avgDurationMinutes: avgDuration,
    cycleCount: cycles.length,
  };
} 