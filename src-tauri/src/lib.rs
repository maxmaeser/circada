// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use serde::{Serialize, Deserialize};

mod healthkit_ffi;

#[derive(Debug, Serialize, Deserialize)]
pub struct VariabilityResult {
    pub intradaily_variability: f64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SleepEfficiencyResult {
    pub sleep_efficiency: f64,
    pub total_sleep_minutes: f64,
    pub time_in_bed_minutes: f64,
}

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn calculate_intradaily_variability(activity_data: Vec<f64>) -> VariabilityResult {
    let n = activity_data.len();
    if n < 2 {
        return VariabilityResult { intradaily_variability: 0.0 };
    }
    // mean
    let mean: f64 = activity_data.iter().sum::<f64>() / n as f64;
    // numerator and denominator
    let mut num = 0.0;
    let mut denom = 0.0;
    for i in 0..n {
        let deviation = activity_data[i] - mean;
        denom += deviation * deviation;
        if i < n - 1 {
            let diff = activity_data[i + 1] - activity_data[i];
            num += diff * diff;
        }
    }
    let iv = if denom == 0.0 { 0.0 } else { (n as f64 * num) / ((n - 1) as f64 * denom) };
    VariabilityResult { intradaily_variability: iv }
}

#[tauri::command]
fn calculate_sleep_efficiency(activity_data: Vec<f64>, sleep_threshold: f64) -> SleepEfficiencyResult {
    let n = activity_data.len();
    if n == 0 {
        return SleepEfficiencyResult { sleep_efficiency: 0.0, total_sleep_minutes: 0.0, time_in_bed_minutes: 0.0 };
    }
    // identify sleep minutes where activity below threshold
    let mut sleep_minutes = 0usize;
    for &val in &activity_data {
        if val <= sleep_threshold { sleep_minutes += 1; }
    }
    let time_in_bed = n as f64; // assuming 1-minute samples
    let efficiency = (sleep_minutes as f64 / time_in_bed) * 100.0;
    SleepEfficiencyResult {
        sleep_efficiency: efficiency,
        total_sleep_minutes: sleep_minutes as f64,
        time_in_bed_minutes: time_in_bed,
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            greet,
            calculate_intradaily_variability,
            calculate_sleep_efficiency,
            healthkit_ffi::request_healthkit_permissions,
            healthkit_ffi::start_healthkit_monitoring,
            healthkit_ffi::stop_healthkit_monitoring,
            healthkit_ffi::get_current_heart_rate,
            healthkit_ffi::healthkit_is_available
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
