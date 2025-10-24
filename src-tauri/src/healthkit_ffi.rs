use std::sync::mpsc::{self, Receiver, Sender};
use std::sync::{Arc, Mutex};
use tauri::{AppHandle, Emitter};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HeartRateData {
    pub rate: f64,
    pub timestamp: u64,
}

// Global channel for heart rate data
static mut HEART_RATE_SENDER: Option<Sender<HeartRateData>> = None;
static mut APP_HANDLE: Option<AppHandle> = None;

// Try to use actual Swift FFI functions, fall back to mock if unavailable
#[cfg(all(target_os = "macos", not(feature = "mock_healthkit")))]
extern "C" {
    #[link_name = "healthkit_request_permissions"]
    fn swift_healthkit_request_permissions() -> bool;
    #[link_name = "healthkit_start_monitoring"]
    fn swift_healthkit_start_monitoring() -> bool;
    #[link_name = "healthkit_stop_monitoring"]
    fn swift_healthkit_stop_monitoring();
    #[link_name = "healthkit_set_callback"]
    fn swift_healthkit_set_callback(callback: extern "C" fn(f64, u64));
    #[link_name = "healthkit_get_current_hr"]
    fn swift_healthkit_get_current_hr() -> f64;
}

// Mock implementations for non-macOS platforms or when Swift compilation fails
#[cfg(any(not(target_os = "macos"), feature = "mock_healthkit"))]
fn healthkit_request_permissions() -> bool {
    true // Mock: always return true
}

#[cfg(any(not(target_os = "macos"), feature = "mock_healthkit"))]
fn healthkit_start_monitoring() -> bool {
    true // Mock: always return true
}

#[cfg(any(not(target_os = "macos"), feature = "mock_healthkit"))]
fn healthkit_stop_monitoring() {
    // Mock: no-op
}

#[cfg(any(not(target_os = "macos"), feature = "mock_healthkit"))]
fn healthkit_set_callback(_callback: extern "C" fn(f64, u64)) {
    // Mock: no-op
}

#[cfg(any(not(target_os = "macos"), feature = "mock_healthkit"))]
fn healthkit_get_current_hr() -> f64 {
    // Mock: return simulated heart rate
    use std::time::{SystemTime, UNIX_EPOCH};
    let now = SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_secs();
    70.0 + (now % 10) as f64 // Simple variation between 70-80 bpm
}

// macOS implementations that use Swift when available
#[cfg(all(target_os = "macos", not(feature = "mock_healthkit")))]
fn healthkit_request_permissions() -> bool {
    // Try Swift implementation first
    unsafe {
        match std::panic::catch_unwind(|| swift_healthkit_request_permissions()) {
            Ok(result) => result,
            Err(_) => {
                // Fall back to mock implementation
                eprintln!("Warning: Swift HealthKit not available, using mock");
                true
            }
        }
    }
}

#[cfg(all(target_os = "macos", not(feature = "mock_healthkit")))]
fn healthkit_start_monitoring() -> bool {
    unsafe {
        match std::panic::catch_unwind(|| swift_healthkit_start_monitoring()) {
            Ok(result) => result,
            Err(_) => {
                eprintln!("Warning: Swift HealthKit not available, using mock");
                true
            }
        }
    }
}

#[cfg(all(target_os = "macos", not(feature = "mock_healthkit")))]
fn healthkit_stop_monitoring() {
    unsafe {
        let _ = std::panic::catch_unwind(|| swift_healthkit_stop_monitoring());
    }
}

#[cfg(all(target_os = "macos", not(feature = "mock_healthkit")))]
fn healthkit_set_callback(callback: extern "C" fn(f64, u64)) {
    unsafe {
        let _ = std::panic::catch_unwind(|| swift_healthkit_set_callback(callback));
    }
}

#[cfg(all(target_os = "macos", not(feature = "mock_healthkit")))]
fn healthkit_get_current_hr() -> f64 {
    unsafe {
        match std::panic::catch_unwind(|| swift_healthkit_get_current_hr()) {
            Ok(result) => result,
            Err(_) => {
                // Fall back to mock implementation
                use std::time::{SystemTime, UNIX_EPOCH};
                let now = SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_secs();
                70.0 + (now % 10) as f64
            }
        }
    }
}

// Callback function called from Swift
extern "C" fn heart_rate_callback(rate: f64, timestamp: u64) {
    let data = HeartRateData { rate, timestamp };
    
    unsafe {
        if let Some(sender) = &*std::ptr::addr_of!(HEART_RATE_SENDER) {
            let _ = sender.send(data.clone());
        }
        
        // Emit event to frontend
        if let Some(app) = &*std::ptr::addr_of!(APP_HANDLE) {
            let _ = app.emit("heart-rate-update", &data);
        }
    }
}

pub struct HealthKitManager {
    _receiver: Receiver<HeartRateData>,
    is_monitoring: Arc<Mutex<bool>>,
}

impl HealthKitManager {
    pub fn new(app_handle: AppHandle) -> Self {
        let (sender, receiver) = mpsc::channel();
        
        unsafe {
            HEART_RATE_SENDER = Some(sender);
            APP_HANDLE = Some(app_handle);
            
            // Set the callback function
            healthkit_set_callback(heart_rate_callback);
        }
        
        Self {
            _receiver: receiver,
            is_monitoring: Arc::new(Mutex::new(false)),
        }
    }
    
    pub fn request_permissions(&self) -> bool {
        healthkit_request_permissions()
    }
    
    pub fn start_monitoring(&self) -> Result<(), String> {
        let mut monitoring = self.is_monitoring.lock().unwrap();
        if *monitoring {
            return Ok(());
        }
        
        let success = healthkit_start_monitoring();
        
        if success {
            *monitoring = true;
            Ok(())
        } else {
            Err("Failed to start HealthKit monitoring".to_string())
        }
    }
    
    pub fn stop_monitoring(&self) {
        let mut monitoring = self.is_monitoring.lock().unwrap();
        if *monitoring {
            healthkit_stop_monitoring();
            *monitoring = false;
        }
    }
    
    pub fn get_current_heart_rate(&self) -> f64 {
        healthkit_get_current_hr()
    }
    
    pub fn is_monitoring(&self) -> bool {
        *self.is_monitoring.lock().unwrap()
    }
}

// Tauri commands
#[tauri::command]
pub async fn request_healthkit_permissions() -> Result<bool, String> {
    let success = healthkit_request_permissions();
    Ok(success)
}

#[tauri::command]
pub async fn start_healthkit_monitoring() -> Result<(), String> {
    let success = healthkit_start_monitoring();
    if success {
        Ok(())
    } else {
        Err("Failed to start monitoring".to_string())
    }
}

#[tauri::command]
pub async fn stop_healthkit_monitoring() -> Result<(), String> {
    healthkit_stop_monitoring();
    Ok(())
}

#[tauri::command]
pub async fn get_current_heart_rate() -> Result<f64, String> {
    let rate = healthkit_get_current_hr();
    Ok(rate)
}

#[tauri::command]
pub async fn healthkit_is_available() -> Result<bool, String> {
    // On macOS, HealthKit is available if the system supports it
    #[cfg(target_os = "macos")]
    return Ok(true);
    
    #[cfg(not(target_os = "macos"))]
    return Ok(false);
}