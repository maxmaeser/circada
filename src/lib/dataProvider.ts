import type { CircadianInputData, TimeSeries, EpochMs } from "./types";

/**
 * Abstract interface any data source must implement (HealthKit, WebSocket, etc.).
 */
export interface DataProvider {
  /**
   * Retrieve the latest window of sensor data needed for analysis. Implementations
   * decide time-range and sampling rate; downstream algorithms run agnostic of source.
   */
  getData(): Promise<CircadianInputData>;
}

/**
 * Simple in-memory mock provider that synthesises plausible circadian-shaped data.
 * Useful for unit tests and running the desktop app without an Apple Watch.
 */
export class MockDataProvider implements DataProvider {
  private readonly now: EpochMs;

  constructor(now: EpochMs = Date.now()) {
    this.now = now;
  }

  async getData(): Promise<CircadianInputData> {
    const timestamps = this.generateTimestamps(24 * 60, 60); // One-day, 1-min samples
    return {
      activity: {
        timestamps,
        values: timestamps.map((t) => this.syntheticActivity(t)),
      },
      temperature: {
        timestamps,
        values: timestamps.map((t) => this.syntheticTemperature(t)),
      },
    };
  }

  // ------- synthetic helpers --------
  private generateTimestamps(samples: number, intervalSec: number): EpochMs[] {
    const arr: EpochMs[] = [];
    const start = this.now - samples * intervalSec * 1000;
    for (let i = 0; i < samples; i++) {
      arr.push(start + i * intervalSec * 1000);
    }
    return arr;
  }

  private syntheticActivity(ts: EpochMs): number {
    const date = new Date(ts);
    const hour = date.getHours() + date.getMinutes() / 60;
    // Low at night, peaks midday; simplistic sine wave plus noise
    const base = Math.max(0, Math.sin(((hour - 6) / 24) * Math.PI * 2));
    return base * 100 + Math.random() * 10;
  }

  private syntheticTemperature(ts: EpochMs): number {
    const date = new Date(ts);
    const hour = date.getHours() + date.getMinutes() / 60;
    // Min at 4-5 AM, max late afternoon ~5 PM
    const phase = ((hour - 16) / 24) * Math.PI * 2;
    const base = 36.5 + 0.5 * -Math.cos(phase); // amplitude 0.5°C
    return base + (Math.random() - 0.5) * 0.05; // ±0.05°C noise
  }
} 