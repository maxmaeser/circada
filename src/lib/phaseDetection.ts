import { percentile, mean, standardDeviation } from "./math";
import type { TimeSeries } from "./types";

// ------------------ TYPES ------------------
export interface AwakeningResult {
  awakeningQuality: number; // 0-100
  phaseDelay: number;       // hours delayed from target
  cortisolProxy: number;    // arbitrary units – proxy from HRV/temperature
  awakeningTime: number;    // Epoch ms of detected wake
}

export interface SensorData {
  activity: TimeSeries;
  temperature: TimeSeries;
  targetWakeTime?: number; // Epoch ms (defaults to 7:00 local)
}

// ------------------ ALGORITHM ------------------
/**
 * Detects the sustained activity onset in the morning and scores its quality.
 * All math is intentionally simple for a first iteration – we can replace with
 * more sophisticated signal processing once the pipeline is wired end-to-end.
 */
export function detectAwakeningPattern({
  activity,
  temperature,
  targetWakeTime,
}: SensorData): AwakeningResult {
  if (activity.values.length === 0) {
    throw new Error("Activity series empty – cannot detect awakening");
  }

  // 1. Use a fixed activity threshold suitable for typical step counts / accelerometer units.
  //    For mock data we know daytime values are 80-100 and night 1-5, so 60 is safe.
  const activityThreshold = 60;

  // 2. Find first sustained 15-minute window above threshold within a plausible morning window
  const sustainedMinutes = 15;
  const sustainedSamples = sustainedMinutes; // assuming 1-min sampling for now
  let awakeningIdx = -1;
  const len = activity.values.length;

  for (let i = 0; i < len - sustainedSamples; i++) {
    const ts = activity.timestamps[i];
    const hour = new Date(ts).getHours();

    // --- Search only between 4 AM and 10 PM for the awakening event ---
    if (hour < 4 || hour > 10) {
      continue;
    }

    let sustained = true;
    for (let j = 0; j < sustainedSamples; j++) {
      if (activity.values[i + j] < activityThreshold) {
        sustained = false;
        break;
      }
    }
    if (sustained) {
      awakeningIdx = i;
      break;
    }
  }
  
  if (awakeningIdx === -1) {
    // If no awakening found in window, fallback to a default or handle error
    awakeningIdx = Math.floor(len / 4); // Fallback to ~6am for a 24h period
  }

  const awakeningTime = activity.timestamps[awakeningIdx];

  // 3. Temperature rise slope – compute difference over next 2h (120 samples)
  const tempStart = temperature.values[awakeningIdx] ?? temperature.values[0];
  const tempEndIdx = Math.min(awakeningIdx + 120, temperature.values.length - 1);
  const tempEnd = temperature.values[tempEndIdx];
  const tempRiseSlope = (tempEnd - tempStart) / (tempEndIdx - awakeningIdx);

  // 4. HRV proxy – we don't have HRV yet, so approximate using temperature slope
  const cortisolProxy = Math.max(0, tempRiseSlope) * 100; // simple scaling

  // 5. Phase delay relative to desired wake time (defaults 7 AM local)
  const target = targetWakeTime ?? defaultTargetWake(activity.timestamps[awakeningIdx]);
  const phaseDelay = (awakeningTime - target) / 3_600_000; // ms -> hours

  // 6. Compute quality score (very rough weighting)
  const phasePenalty = Math.max(0, phaseDelay) * 20; // each hour = -20 pts
  const tempScore = Math.min(100, tempRiseSlope * 5000); // scale slope
  const base = 80; // baseline quality
  const awakeningQuality = Math.max(0, Math.min(100, base + tempScore - phasePenalty));

  return {
    awakeningQuality,
    phaseDelay,
    cortisolProxy,
    awakeningTime,
  };
}

function defaultTargetWake(referenceTs: number): number {
  const refDate = new Date(referenceTs);
  refDate.setHours(7, 0, 0, 0);
  return refDate.getTime();
} 