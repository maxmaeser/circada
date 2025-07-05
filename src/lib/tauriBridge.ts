let invokeFn: (cmd: string, args: any) => Promise<any>;

// Prefer Tauri invoke when available; otherwise fall back to a stub that rejects.
try {
  // Dynamically require to avoid Vite resolution errors in non-Tauri web builds
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore – dynamic import string
  invokeFn = (await import("@tauri-apps/api/core")).invoke;
} catch {
  invokeFn = async () => {
    throw new Error("Tauri API not available in this environment");
  };
}

export async function calcIntradailyVariability(activity: number[]): Promise<number> {
  const res = await invokeFn("calculate_intradaily_variability", {
    activityData: activity,
  }) as { intradaily_variability: number };
  return res.intradaily_variability;
}

export async function calcSleepEfficiency(activity: number[], sleepThreshold: number): Promise<{ sleepEfficiency: number; totalSleepMinutes: number; timeInBedMinutes: number; }> {
  const res = await invokeFn("calculate_sleep_efficiency", {
    activityData: activity,
    sleepThreshold,
  }) as { sleep_efficiency: number; total_sleep_minutes: number; time_in_bed_minutes: number };
  return {
    sleepEfficiency: res.sleep_efficiency,
    totalSleepMinutes: res.total_sleep_minutes,
    timeInBedMinutes: res.time_in_bed_minutes,
  };
} 