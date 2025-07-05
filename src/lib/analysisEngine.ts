import type { DataProvider } from "./dataProvider";
import { detectAwakeningPattern } from "./phaseDetection";
import { calcIntradailyVariability, calcSleepEfficiency } from "./tauriBridge";
import { detectUltradianCycles } from "./ultradian";
import type { DerivedMetric, CircadianAnalysis } from "./types";
import { ADHD_THRESHOLDS } from "./constants";

/**
 * Core orchestrator that pulls data from a provider, executes algorithms, and
 * returns a unified analysis object ready for persistence or UI rendering.
 */
export class CircadianAnalysisEngine {
  constructor(private provider: DataProvider) {}

  /**
   * Run end-to-end analysis over the provider's latest data. The engine is
   * intentionally stateless; callers decide how/where to persist results.
   */
  async run(): Promise<CircadianAnalysis> {
    const data = await this.provider.getData();

    if (!data.activity || !data.temperature) {
      throw new Error("Provider did not supply required activity & temperature streams");
    }

    // Morning awakening detection (pure TS)
    const awakening = detectAwakeningPattern({
      activity: data.activity,
      temperature: data.temperature,
    });

    // --- Sleep Efficiency & IV ---
    // First, determine a dynamic sleep threshold from the whole day's activity
    const sortedAct = [...data.activity.values].sort((a, b) => a - b);
    let sleepThreshold = sortedAct[Math.floor(sortedAct.length * 0.15)]; // start with 15th percentile

    // Next, identify the sleep window to isolate sleep-related activity.
    // NOTE: This is a simplification. A robust implementation would use a proper
    // sleep window detection algorithm (e.g., from `sleepAnalysis` HealthKit data).
    // For our mock data, we'll assume a window from 10 PM to 7 AM.
    const sleepWindowIndices = data.activity.timestamps
      .map((ts, i) => ({ ts, i }))
      .filter(({ ts }) => {
        const hour = new Date(ts).getHours();
        return hour >= 22 || hour < 7;
      })
      .map(({ i }) => i);

    const sleepActivity = sleepWindowIndices.map(i => data.activity.values[i]);

    // If we have sleepActivity extracted, set threshold to its max to ensure all sleep minutes count.
    if (sleepActivity.length > 0) {
      sleepThreshold = Math.max(...sleepActivity) + 0.1; // small margin
    }

    // Now, calculate metrics using only the relevant data subsets
    const iv = await calcIntradailyVariability(data.activity.values);
    const sleepEffRes = await calcSleepEfficiency(sleepActivity, sleepThreshold);

    // Ultradian cycles (TS)
    const ultradian = detectUltradianCycles(data.activity);

    // ADHD pattern heuristic – simplistic weighting for now
    const adhdScore = this.computeAdhdScore(
      awakening.phaseDelay,
      iv,
      sleepEffRes.sleepEfficiency,
    );

    const analysis: CircadianAnalysis = {
      intradailyVariability: this.metric(iv),
      sleepEfficiency: this.metric(sleepEffRes.sleepEfficiency),
      temperaturePhaseDelay: this.metric(awakening.phaseDelay),
      adhdPatternScore: this.metric(adhdScore, 0.5),
      ultradian: this.metric(ultradian, 0.8),
    };

    return analysis;
  }

  // ---------- helpers ----------
  private metric<T extends number>(value: T, confidence = 1): DerivedMetric<T> {
    return { value, confidence };
  }

  private computeAdhdScore(phaseDelay: number, iv: number, sleepEff: number): number {
    let score = 0;
    if (phaseDelay > ADHD_THRESHOLDS.morningPhaseDelay) score += 1;
    if (iv > ADHD_THRESHOLDS.intradailyVariability) score += 1;
    if (sleepEff < ADHD_THRESHOLDS.sleepEfficiency) score += 1;
    return score / 3; // normalize 0-1
  }
} 