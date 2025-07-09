//
//  CricadianWidgetHostApp.swift
//  CricadianWidgetHost
//
//  Created by Maximilian Mäser on 7/9/25.
//

import SwiftUI

// Minimal macOS app to host the widget extension
// This app reads data from the Tauri app and provides it to the widget

@main
struct CricadianWidgetHostApp: App {
    var body: some Scene {
        MenuBarExtra("Circada Widget", systemImage: "brain.head.profile") {
            VStack(alignment: .leading, spacing: 8) {
                Text("Circada Widget Host")
                    .font(.headline)
                
                Text("Widget extension active")
                    .font(.caption)
                    .foregroundColor(.secondary)
                
                Divider()
                
                Button("Quit") {
                    NSApplication.shared.terminate(nil)
                }
                .keyboardShortcut("q")
            }
            .padding()
        }
        .menuBarExtraStyle(.menu)
    }
}

// Data bridge between Tauri app and widget
class WidgetDataBridge: ObservableObject {
    @Published var cycleData: WidgetCycleData?
    private var timer: Timer?
    
    init() {
        startMonitoring()
    }
    
    private func startMonitoring() {
        // Check for data from Tauri app every 30 seconds
        timer = Timer.scheduledTimer(withTimeInterval: 30.0, repeats: true) { _ in
            self.loadDataFromTauriApp()
        }
        
        // Load immediately
        loadDataFromTauriApp()
    }
    
    private func loadDataFromTauriApp() {
        guard let containerURL = FileManager.default.containerURL(forSecurityApplicationGroupIdentifier: "group.com.circada.app") else {
            return
        }
        
        let dataURL = containerURL.appendingPathComponent("widget-data.json")
        
        guard let data = try? Data(contentsOf: dataURL),
              let cycleData = try? JSONDecoder().decode(WidgetCycleData.self, from: data) else {
            return
        }
        
        DispatchQueue.main.async {
            self.cycleData = cycleData
        }
    }
    
    deinit {
        timer?.invalidate()
    }
}

// Data model matching the Tauri app
struct WidgetCycleData: Codable {
    let cyclePosition: Double
    let phaseIcon: String
    let phaseLabel: String
    let energyPhase: String
    let energyIntensity: Double
    let timeRemainingMinutes: Int32
    let timeRemainingSeconds: Int32
    let nextPhaseTime: String
    let cycleNumber: Int32
    let heartRate: Int32?
    let confidence: Double
    let backgroundColor: String
    
    enum CodingKeys: String, CodingKey {
        case cyclePosition = "cycle_position"
        case phaseIcon = "phase_icon"
        case phaseLabel = "phase_label"
        case energyPhase = "energy_phase"
        case energyIntensity = "energy_intensity"
        case timeRemainingMinutes = "time_remaining_minutes"
        case timeRemainingSeconds = "time_remaining_seconds"
        case nextPhaseTime = "next_phase_time"
        case cycleNumber = "cycle_number"
        case heartRate = "heart_rate"
        case confidence
        case backgroundColor = "background_color"
    }
}
