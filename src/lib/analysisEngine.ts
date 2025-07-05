import { DataProvider } from "./dataProvider";
import { detectAwakeningPattern } from "./phaseDetection";
import { calcIntradailyVariability, calcSleepEfficiency } from "./tauriBridge";
import { DerivedMetric, CircadianAnalysis } from "./types";
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

    // Intra-daily variability (Rust)
    const iv = await calcIntradailyVariability(data.activity.values);

    // Sleep efficiency (Rust) – derive threshold dynamically as 10th percentile
    const sortedAct = [...data.activity.values].sort((a, b) => a - b);
    const sleepThreshold = sortedAct[Math.floor(sortedAct.length * 0.1)];
    const sleepEffRes = await calcSleepEfficiency(data.activity.values, sleepThreshold);

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