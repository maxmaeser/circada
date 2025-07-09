use std::env;
use std::path::Path;
use std::process::Command;

fn main() {
    // Standard Tauri build
    tauri_build::build();
    
    // Build Swift bridge for macOS
    #[cfg(target_os = "macos")]
    {
        compile_swift_bridge();
        // Temporarily disabled until Xcode is available
        // build_widget_extension();
    }
}

#[cfg(target_os = "macos")]
fn compile_swift_bridge() {
    // Link required frameworks
    println!("cargo:rustc-link-lib=framework=Foundation");
    println!("cargo:rustc-link-lib=framework=HealthKit");
    
    let out_dir = env::var("OUT_DIR").unwrap();
    let swift_file = "src/healthkit.swift";
    
    // Check if Swift file exists
    if !Path::new(swift_file).exists() {
        println!("cargo:warning=Swift file not found: {}", swift_file);
        return;
    }
    
    println!("cargo:rerun-if-changed={}", swift_file);
    
    // Create object file name
    let obj_file = format!("{}/healthkit.o", out_dir);
    
    // Compile Swift to object file
    let output = Command::new("swiftc")
        .args([
            "-c",
            swift_file,
            "-o", &obj_file,
            "-target", "aarch64-apple-macos13.0",
            "-sdk", "/Applications/Xcode.app/Contents/Developer/Platforms/MacOSX.platform/Developer/SDKs/MacOSX.sdk",
        ])
        .output();
    
    match output {
        Ok(output) => {
            if !output.status.success() {
                println!("cargo:warning=Swift compilation failed: {}", 
                    String::from_utf8_lossy(&output.stderr));
                return;
            }
            
            // Link the object file
            println!("cargo:rustc-link-search={}", out_dir);
            println!("cargo:rustc-link-lib=static=healthkit");
            
            // Create static library
            let lib_file = format!("{}/libhealthkit.a", out_dir);
            let ar_output = Command::new("ar")
                .args(["rcs", &lib_file, &obj_file])
                .output();
                
            match ar_output {
                Ok(ar_output) => {
                    if !ar_output.status.success() {
                        println!("cargo:warning=Failed to create static library: {}", 
                            String::from_utf8_lossy(&ar_output.stderr));
                    }
                }
                Err(e) => {
                    println!("cargo:warning=Failed to run ar: {}", e);
                }
            }
        }
        Err(e) => {
            println!("cargo:warning=Failed to compile Swift: {}", e);
        }
    }
}

// Widget build function temporarily removed - uncomment when Xcode is available
// #[cfg(target_os = "macos")]
// fn build_widget_extension() { ... }
