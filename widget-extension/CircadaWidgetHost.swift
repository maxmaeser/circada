import SwiftUI

// Minimal macOS app to host the widget extension
// This app reads data from the Tauri app and provides it to the widget

@main
struct CircadaWidgetHostApp: App {
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