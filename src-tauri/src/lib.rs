// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use serde::{Serialize, Deserialize};
use tauri::{AppHandle, Manager};
use chrono::Timelike;

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

#[tauri::command]
fn show_menubar_window(app: AppHandle) {
    if let Some(window) = app.get_webview_window("menubar") {
        let _ = window.show();
        let _ = window.set_focus();
    }
}

#[tauri::command]
fn hide_menubar_window(app: AppHandle) {
    if let Some(window) = app.get_webview_window("menubar") {
        let _ = window.hide();
    }
}

#[tauri::command]
fn update_tray_title(app: AppHandle, title: String) {
    if let Some(tray) = app.tray_by_id("main") {
        let _ = tray.set_title(Some(title));
    }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct WidgetCycleData {
    pub cycle_position: f64,
    pub phase_icon: String,
    pub phase_label: String,
    pub energy_phase: String,
    pub energy_intensity: f64,
    pub time_remaining_minutes: i32,
    pub time_remaining_seconds: i32,
    pub next_phase_time: String,
    pub cycle_number: i32,
    pub heart_rate: Option<i32>,
    pub confidence: f64,
    pub background_color: String,
}

#[tauri::command]
fn write_widget_data(data: WidgetCycleData) -> Result<(), String> {
    #[cfg(target_os = "macos")]
    {
        use std::fs;
        
        // Get app group container path
        let home_dir = std::env::var("HOME").map_err(|_| "Failed to get home directory")?;
        let container_path = format!("{}/Library/Group Containers/group.com.circada.app", home_dir);
        
        // Create directory if it doesn't exist
        if let Err(_) = fs::create_dir_all(&container_path) {
            return Err("Failed to create container directory".to_string());
        }
        
        let file_path = format!("{}/widget-data.json", container_path);
        
        // Serialize data to JSON
        let json_data = serde_json::to_string(&data).map_err(|e| format!("Failed to serialize data: {}", e))?;
        
        // Write to file
        fs::write(file_path, json_data).map_err(|e| format!("Failed to write widget data: {}", e))?;
        
        Ok(())
    }
    
    #[cfg(not(target_os = "macos"))]
    {
        Ok(()) // No-op on non-macOS platforms
    }
}

#[tauri::command]
fn get_widget_data() -> WidgetCycleData {
    let current_time = chrono::Utc::now();
    let total_minutes = current_time.hour() as f64 * 60.0 + current_time.minute() as f64 + current_time.second() as f64 / 60.0;
    let cycle_position = total_minutes % 90.0;
    let cycle_number = (total_minutes / 90.0).floor() as i32 + 1;
    
    // Energy phase logic (matching main app)
    let (energy_phase, energy_intensity) = if cycle_position <= 5.0 {
        ("transition".to_string(), 0.4 + (cycle_position / 5.0) * 0.4)
    } else if cycle_position <= 60.0 {
        let progress = (cycle_position - 5.0) / 55.0;
        ("high".to_string(), 0.5 + 0.4 * (progress * std::f64::consts::PI).sin())
    } else if cycle_position <= 65.0 {
        ("transition".to_string(), 0.8 - ((cycle_position - 60.0) / 5.0) * 0.4)
    } else {
        let progress = (cycle_position - 65.0) / 25.0;
        ("low".to_string(), 0.2 + 0.2 * (progress * std::f64::consts::PI).sin())
    };
    
    // Time remaining calculation
    let time_remaining: f64 = if energy_phase == "high" || (energy_phase == "transition" && cycle_position <= 60.0) {
        60.0 - cycle_position
    } else {
        90.0 - cycle_position
    };
    
    let minutes_left = time_remaining.floor() as i32;
    let seconds_left = ((time_remaining - minutes_left as f64) * 60.0).floor() as i32;
    
    // Phase icon (6-phase system)
    let phase_icon = if cycle_position <= 15.0 {
        "↗".to_string()
    } else if cycle_position <= 30.0 {
        "↑".to_string()
    } else if cycle_position <= 45.0 {
        "🔥".to_string()
    } else if cycle_position <= 60.0 {
        "⚡".to_string()
    } else if cycle_position <= 75.0 {
        "↘".to_string()
    } else {
        "😴".to_string()
    };
    
    // Phase label
    let phase_label = if cycle_position <= 15.0 {
        "Rising Energy".to_string()
    } else if cycle_position <= 30.0 {
        "Building Energy".to_string()
    } else if cycle_position <= 45.0 {
        "Peak Energy".to_string()
    } else if cycle_position <= 60.0 {
        "Peak Flow".to_string()
    } else if cycle_position <= 75.0 {
        "Winding Down".to_string()
    } else {
        "Rest Phase".to_string()
    };
    
    // Background color (HSL)
    let background_color = if energy_phase == "high" {
        format!("hsl({}, 70%, {}%)", 120.0 + energy_intensity * 60.0, 50.0 + energy_intensity * 20.0)
    } else if energy_phase == "low" {
        format!("hsl(220, 70%, {}%)", 30.0 + energy_intensity * 30.0)
    } else {
        format!("hsl(170, 70%, {}%)", 40.0 + energy_intensity * 20.0)
    };
    
    // Next phase time
    let next_phase_minutes = total_minutes + time_remaining;
    let next_phase_hour = ((next_phase_minutes / 60.0).floor() as i32) % 24;
    let next_phase_min = (next_phase_minutes % 60.0) as i32;
    let next_phase_time = format!("{}:{:02}", next_phase_hour, next_phase_min);
    
    WidgetCycleData {
        cycle_position,
        phase_icon,
        phase_label,
        energy_phase,
        energy_intensity,
        time_remaining_minutes: minutes_left,
        time_remaining_seconds: seconds_left,
        next_phase_time,
        cycle_number,
        heart_rate: None, // Will be populated by live data if available
        confidence: 0.75,
        background_color,
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    use tauri::menu::{Menu, MenuItem};
    use tauri::tray::TrayIconBuilder;

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
            healthkit_ffi::healthkit_is_available,
            show_menubar_window,
            hide_menubar_window,
            update_tray_title,
            get_widget_data,
            write_widget_data
        ])
        .setup(|app| {
            let show_item = MenuItem::with_id(app, "show", "Show Dashboard", true, None::<&str>)?;
            let quit_item = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;
            let menu = Menu::with_items(app, &[&show_item, &quit_item])?;

            let _tray = TrayIconBuilder::with_id("main")
                .menu(&menu)
                .on_menu_event(|app, event| match event.id.as_ref() {
                    "show" => {
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.show();
                            let _ = window.set_focus();
                        }
                    }
                    "quit" => {
                        app.exit(0);
                    }
                    _ => {}
                })
                .on_tray_icon_event(|_tray, event| {
                    if let tauri::tray::TrayIconEvent::Click { .. } = event {
                        println!("Tray icon clicked!");
                        // Just show the main window instead of menubar window
                        let app = _tray.app_handle();
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.show();
                            let _ = window.set_focus();
                        }
                    }
                })
                .build(app)?;

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
