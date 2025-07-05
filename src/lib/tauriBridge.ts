import { invoke } from "@tauri-apps/api/tauri";

export async function calcIntradailyVariability(activity: number[]): Promise<number> {
  const res = await invoke<{ intradaily_variability: number }>("calculate_intradaily_variability", {
    activityData: activity,
  });
  return res.intradaily_variability;
}

export async function calcSleepEfficiency(activity: number[], sleepThreshold: number): Promise<{ sleepEfficiency: number; totalSleepMinutes: number; timeInBedMinutes: number; }> {
  const res = await invoke<{ sleep_efficiency: number; total_sleep_minutes: number; time_in_bed_minutes: number }>("calculate_sleep_efficiency", {
    activityData: activity,
    sleepThreshold,
  });
  return {
    sleepEfficiency: res.sleep_efficiency,
    totalSleepMinutes: res.total_sleep_minutes,
    timeInBedMinutes: res.time_in_bed_minutes,
  };
} 