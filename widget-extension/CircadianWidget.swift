import WidgetKit
import SwiftUI
import Foundation

// MARK: - Data Models

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

// MARK: - Widget Timeline Provider

struct CircadianWidgetProvider: TimelineProvider {
    func placeholder(in context: Context) -> CircadianWidgetEntry {
        CircadianWidgetEntry(
            date: Date(),
            cycleData: WidgetCycleData(
                cyclePosition: 30.0,
                phaseIcon: "🔥",
                phaseLabel: "Peak Energy",
                energyPhase: "high",
                energyIntensity: 0.8,
                timeRemainingMinutes: 15,
                timeRemainingSeconds: 30,
                nextPhaseTime: "14:30",
                cycleNumber: 8,
                heartRate: nil,
                confidence: 0.75,
                backgroundColor: "hsl(150, 70%, 60%)"
            )
        )
    }
    
    func getSnapshot(in context: Context, completion: @escaping (CircadianWidgetEntry) -> ()) {
        fetchWidgetData { cycleData in
            let entry = CircadianWidgetEntry(date: Date(), cycleData: cycleData)
            completion(entry)
        }
    }
    
    func getTimeline(in context: Context, completion: @escaping (Timeline<CircadianWidgetEntry>) -> ()) {
        fetchWidgetData { cycleData in
            let currentDate = Date()
            let entry = CircadianWidgetEntry(date: currentDate, cycleData: cycleData)
            
            // Refresh every minute to keep timer accurate
            let refreshDate = Calendar.current.date(byAdding: .minute, value: 1, to: currentDate) ?? currentDate
            let timeline = Timeline(entries: [entry], policy: .after(refreshDate))
            completion(timeline)
        }
    }
    
    private func fetchWidgetData(completion: @escaping (WidgetCycleData) -> Void) {
        // Try to get data from shared app group container first
        if let sharedData = loadSharedData() {
            completion(sharedData)
            return
        }
        
        // Fallback to calculated data
        let fallbackData = calculateCurrentCycleData()
        completion(fallbackData)
    }
    
    private func loadSharedData() -> WidgetCycleData? {
        guard let containerURL = FileManager.default.containerURL(forSecurityApplicationGroupIdentifier: "group.com.circada.app") else {
            return nil
        }
        
        let dataURL = containerURL.appendingPathComponent("widget-data.json")
        
        guard let data = try? Data(contentsOf: dataURL),
              let cycleData = try? JSONDecoder().decode(WidgetCycleData.self, from: data) else {
            return nil
        }
        
        // Check if data is recent (within last 2 minutes)
        let dataAge = Date().timeIntervalSince(Date(timeIntervalSince1970: cycleData.cyclePosition))
        if dataAge > 120 {
            return nil // Data too old
        }
        
        return cycleData
    }
    
    private func calculateCurrentCycleData() -> WidgetCycleData {
        let now = Date()
        let calendar = Calendar.current
        let hour = calendar.component(.hour, from: now)
        let minute = calendar.component(.minute, from: now)
        let second = calendar.component(.second, from: now)
        
        let totalMinutes = Double(hour * 60 + minute) + Double(second) / 60.0
        let cyclePosition = totalMinutes.truncatingRemainder(dividingBy: 90.0)
        let cycleNumber = Int32(floor(totalMinutes / 90.0)) + 1
        
        // Energy phase logic (matching Rust implementation)
        let (energyPhase, energyIntensity): (String, Double)
        if cyclePosition <= 5.0 {
            energyPhase = "transition"
            energyIntensity = 0.4 + (cyclePosition / 5.0) * 0.4
        } else if cyclePosition <= 60.0 {
            energyPhase = "high"
            let progress = (cyclePosition - 5.0) / 55.0
            energyIntensity = 0.5 + 0.4 * sin(progress * .pi)
        } else if cyclePosition <= 65.0 {
            energyPhase = "transition"
            energyIntensity = 0.8 - ((cyclePosition - 60.0) / 5.0) * 0.4
        } else {
            energyPhase = "low"
            let progress = (cyclePosition - 65.0) / 25.0
            energyIntensity = 0.2 + 0.2 * sin(progress * .pi)
        }
        
        // Time remaining
        let timeRemaining = (energyPhase == "high" || (energyPhase == "transition" && cyclePosition <= 60.0))
            ? 60.0 - cyclePosition
            : 90.0 - cyclePosition
        
        let minutesLeft = Int32(floor(timeRemaining))
        let secondsLeft = Int32(floor((timeRemaining - Double(minutesLeft)) * 60.0))
        
        // Phase icon (6-phase system)
        let phaseIcon: String
        let phaseLabel: String
        if cyclePosition <= 15.0 {
            phaseIcon = "↗"
            phaseLabel = "Rising Energy"
        } else if cyclePosition <= 30.0 {
            phaseIcon = "↑"
            phaseLabel = "Building Energy"
        } else if cyclePosition <= 45.0 {
            phaseIcon = "🔥"
            phaseLabel = "Peak Energy"
        } else if cyclePosition <= 60.0 {
            phaseIcon = "⚡"
            phaseLabel = "Peak Flow"
        } else if cyclePosition <= 75.0 {
            phaseIcon = "↘"
            phaseLabel = "Winding Down"
        } else {
            phaseIcon = "😴"
            phaseLabel = "Rest Phase"
        }
        
        // Background color (HSL)
        let backgroundColor: String
        if energyPhase == "high" {
            backgroundColor = "hsl(\(120.0 + energyIntensity * 60.0), 70%, \(50.0 + energyIntensity * 20.0)%)"
        } else if energyPhase == "low" {
            backgroundColor = "hsl(220, 70%, \(30.0 + energyIntensity * 30.0)%)"
        } else {
            backgroundColor = "hsl(170, 70%, \(40.0 + energyIntensity * 20.0)%)"
        }
        
        // Next phase time
        let nextPhaseMinutes = totalMinutes + timeRemaining
        let nextPhaseHour = Int(floor(nextPhaseMinutes / 60.0)) % 24
        let nextPhaseMin = Int(nextPhaseMinutes.truncatingRemainder(dividingBy: 60.0))
        let nextPhaseTime = String(format: "%d:%02d", nextPhaseHour, nextPhaseMin)
        
        return WidgetCycleData(
            cyclePosition: cyclePosition,
            phaseIcon: phaseIcon,
            phaseLabel: phaseLabel,
            energyPhase: energyPhase,
            energyIntensity: energyIntensity,
            timeRemainingMinutes: minutesLeft,
            timeRemainingSeconds: secondsLeft,
            nextPhaseTime: nextPhaseTime,
            cycleNumber: cycleNumber,
            heartRate: nil,
            confidence: 0.75,
            backgroundColor: backgroundColor
        )
    }
}

// MARK: - Widget Entry

struct CircadianWidgetEntry: TimelineEntry {
    let date: Date
    let cycleData: WidgetCycleData
}

// MARK: - Widget View

struct CircadianWidgetEntryView: View {
    var entry: CircadianWidgetProvider.Entry
    
    var body: some View {
        VStack(spacing: 0) {
            // Header
            HStack {
                VStack(alignment: .leading, spacing: 2) {
                    Text("Ultradian Cycle")
                        .font(.system(size: 16, weight: .bold))
                        .foregroundColor(.white)
                    Text("90-minute energy rhythm")
                        .font(.system(size: 11))
                        .foregroundColor(.white.opacity(0.7))
                }
                
                Spacer()
                
                VStack(alignment: .trailing, spacing: 2) {
                    Text("Cycle \(entry.cycleData.cycleNumber)/16")
                        .font(.system(size: 12, weight: .medium, design: .monospaced))
                        .foregroundColor(.white)
                    Text(formatCurrentTime())
                        .font(.system(size: 11, design: .monospaced))
                        .foregroundColor(.white.opacity(0.7))
                }
            }
            .padding(.horizontal, 16)
            .padding(.top, 16)
            .padding(.bottom, 12)
            
            // Main content
            HStack(spacing: 20) {
                // Energy Phase Circle
                VStack(spacing: 8) {
                    ZStack {
                        Circle()
                            .fill(parseHSLColor(entry.cycleData.backgroundColor))
                            .frame(width: 48, height: 48)
                        
                        Text(entry.cycleData.phaseIcon)
                            .font(.system(size: 20))
                            .foregroundColor(getIconColor())
                    }
                    
                    VStack(spacing: 2) {
                        Text("\(entry.cycleData.energyPhase.capitalized) Energy")
                            .font(.system(size: 12, weight: .semibold))
                            .foregroundColor(.white)
                        Text("\(Int(entry.cycleData.energyIntensity * 100))% intensity")
                            .font(.system(size: 10))
                            .foregroundColor(.white.opacity(0.7))
                    }
                }
                
                Spacer()
                
                // Timer
                VStack(spacing: 8) {
                    Text(String(format: "%02d:%02d", entry.cycleData.timeRemainingMinutes, entry.cycleData.timeRemainingSeconds))
                        .font(.system(size: 28, weight: .bold, design: .monospaced))
                        .foregroundColor(.white)
                    
                    VStack(spacing: 2) {
                        Text("until next phase")
                            .font(.system(size: 10))
                            .foregroundColor(.white.opacity(0.7))
                        Text("at \(entry.cycleData.nextPhaseTime)")
                            .font(.system(size: 10))
                            .foregroundColor(.white.opacity(0.6))
                    }
                }
                
                Spacer()
                
                // Live Data/Confidence
                VStack(spacing: 8) {
                    if let heartRate = entry.cycleData.heartRate {
                        HStack(spacing: 4) {
                            Image(systemName: "heart.fill")
                                .font(.system(size: 10))
                                .foregroundColor(.red.opacity(0.8))
                            Text("\(heartRate) bpm")
                                .font(.system(size: 12, weight: .semibold))
                                .foregroundColor(.white)
                        }
                    } else {
                        Text("No live data")
                            .font(.system(size: 12))
                            .foregroundColor(.white.opacity(0.6))
                    }
                    
                    // Confidence badge
                    Text("\(Int(entry.cycleData.confidence * 100))% confidence")
                        .font(.system(size: 9, weight: .medium))
                        .padding(.horizontal, 6)
                        .padding(.vertical, 2)
                        .background(
                            entry.cycleData.confidence > 0.8 
                                ? Color.green.opacity(0.3)
                                : Color.yellow.opacity(0.3)
                        )
                        .foregroundColor(
                            entry.cycleData.confidence > 0.8 
                                ? Color.green.opacity(0.9)
                                : Color.yellow.opacity(0.9)
                        )
                        .cornerRadius(4)
                }
            }
            .padding(.horizontal, 16)
            .padding(.bottom, 16)
        }
        .background(
            LinearGradient(
                colors: [
                    Color(red: 0.15, green: 0.15, blue: 0.17),
                    Color(red: 0.1, green: 0.1, blue: 0.13)
                ],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
        )
        .cornerRadius(12)
    }
    
    private func formatCurrentTime() -> String {
        let formatter = DateFormatter()
        formatter.dateFormat = "HH:mm"
        return formatter.string(from: entry.date)
    }
    
    private func getIconColor() -> Color {
        // Parse HSL to determine if background is bright
        let lightness = extractLightness(from: entry.cycleData.backgroundColor)
        return lightness > 55 ? Color.black.opacity(0.8) : Color.white
    }
    
    private func extractLightness(from hslString: String) -> Double {
        // Extract lightness from HSL string like "hsl(150, 70%, 60%)"
        let components = hslString.replacingOccurrences(of: "hsl(", with: "")
            .replacingOccurrences(of: ")", with: "")
            .components(separatedBy: ",")
        
        if components.count >= 3 {
            let lightnessStr = components[2].trimmingCharacters(in: .whitespaces)
                .replacingOccurrences(of: "%", with: "")
            return Double(lightnessStr) ?? 50.0
        }
        return 50.0
    }
    
    private func parseHSLColor(_ hslString: String) -> Color {
        // Parse HSL string like "hsl(150, 70%, 60%)" to SwiftUI Color
        let components = hslString.replacingOccurrences(of: "hsl(", with: "")
            .replacingOccurrences(of: ")", with: "")
            .components(separatedBy: ",")
        
        guard components.count >= 3,
              let hue = Double(components[0].trimmingCharacters(in: .whitespaces)),
              let saturation = Double(components[1].trimmingCharacters(in: .whitespaces).replacingOccurrences(of: "%", with: "")),
              let lightness = Double(components[2].trimmingCharacters(in: .whitespaces).replacingOccurrences(of: "%", with: "")) else {
            return Color.blue // Fallback color
        }
        
        return Color(hue: hue / 360.0, saturation: saturation / 100.0, brightness: lightness / 100.0)
    }
}

// MARK: - Widget Configuration

struct CircadianWidget: Widget {
    let kind: String = "CircadianWidget"
    
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: CircadianWidgetProvider()) { entry in
            CircadianWidgetEntryView(entry: entry)
                .containerBackground(.fill.tertiary, for: .widget)
        }
        .configurationDisplayName("Circadian Rhythm")
        .description("Track your 90-minute energy cycles")
        .supportedFamilies([.systemMedium, .systemLarge])
    }
}

// MARK: - Widget Bundle

@main
struct CircadianWidgetBundle: WidgetBundle {
    var body: some Widget {
        CircadianWidget()
    }
}

// MARK: - Preview

#Preview(as: .systemMedium) {
    CircadianWidget()
} timeline: {
    CircadianWidgetEntry(
        date: .now,
        cycleData: WidgetCycleData(
            cyclePosition: 30.0,
            phaseIcon: "🔥",
            phaseLabel: "Peak Energy",
            energyPhase: "high",
            energyIntensity: 0.8,
            timeRemainingMinutes: 15,
            timeRemainingSeconds: 30,
            nextPhaseTime: "14:30",
            cycleNumber: 8,
            heartRate: 75,
            confidence: 0.85,
            backgroundColor: "hsl(150, 70%, 60%)"
        )
    )
}