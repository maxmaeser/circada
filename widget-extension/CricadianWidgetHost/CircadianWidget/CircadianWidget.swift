//
//  CircadianWidget.swift
//  CircadianWidget
//
//  Created by Maximilian Mäser on 7/9/25.
//

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
        let fileModificationTime = (try? dataURL.resourceValues(forKeys: [.contentModificationDateKey]))?.contentModificationDate ?? Date.distantPast
        let dataAge = Date().timeIntervalSince(fileModificationTime)
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
    @Environment(\.widgetFamily) var family
    
    var body: some View {
        VStack(spacing: 0) {
            // Header
            HStack {
                VStack(alignment: .leading, spacing: 2) {
                    Text("Ultradian Cycle")
                        .font(.system(size: headerTitleSize, weight: .bold))
                        .foregroundColor(.white)
                    Text("90-minute energy rhythm")
                        .font(.system(size: headerSubtitleSize))
                        .foregroundColor(.white.opacity(0.7))
                }
                
                Spacer()
                
                VStack(alignment: .trailing, spacing: 2) {
                    Text("Cycle \(entry.cycleData.cycleNumber)/16")
                        .font(.system(size: headerInfoSize, weight: .medium, design: .monospaced))
                        .foregroundColor(.white)
                        .minimumScaleFactor(0.8)
                    Text(formatCurrentTime())
                        .font(.system(size: headerTimeSize, design: .monospaced))
                        .foregroundColor(.white.opacity(0.7))
                        .minimumScaleFactor(0.8)
                }
            }
            .padding(.horizontal, horizontalPadding)
            .padding(.top, topPadding)
            .padding(.bottom, headerBottomPadding)
            
            // Main content
            VStack(spacing: 0) {
                HStack(spacing: columnSpacing) {
                    // Energy Phase Circle
                    VStack(spacing: 8) {
                        ZStack {
                            Circle()
                                .fill(parseHSLColor(entry.cycleData.backgroundColor))
                                .frame(width: circleSize, height: circleSize)
                            
                            Text(entry.cycleData.phaseIcon)
                                .font(.system(size: iconSize))
                                .foregroundColor(.white.opacity(0.9))
                                .symbolRenderingMode(.hierarchical)
                        }
                        
                        VStack(spacing: 2) {
                            HStack(spacing: 4) {
                                Text("\(entry.cycleData.energyPhase.capitalized) Energy")
                                    .font(.system(size: energyLabelSize, weight: .semibold))
                                    .foregroundColor(.white)
                                    .minimumScaleFactor(0.7)
                                Text("\(Int(entry.cycleData.energyIntensity * 100))% int")
                                    .font(.system(size: intensityLabelSize))
                                    .foregroundColor(.white.opacity(0.6))
                                    .minimumScaleFactor(0.7)
                            }
                            .fixedSize(horizontal: false, vertical: true)
                            
                            Text(getActivityDescription())
                                .font(.system(size: activityDescriptionSize))
                                .foregroundColor(.white.opacity(0.5))
                                .multilineTextAlignment(.center)
                                .lineLimit(nil)
                                .fixedSize(horizontal: false, vertical: true)
                        }
                    }
                    .frame(maxWidth: .infinity)
                    
                    // Timer - Center column
                    VStack(spacing: 8) {
                        Text(String(format: "%02d:%02d", entry.cycleData.timeRemainingMinutes, entry.cycleData.timeRemainingSeconds))
                            .font(.system(size: timerSize, weight: .bold, design: .monospaced))
                            .foregroundColor(.white)
                            .minimumScaleFactor(0.6)
                            .lineLimit(1)
                        
                        VStack(spacing: 2) {
                            Text("until next phase")
                                .font(.system(size: timerSubtitleSize))
                                .foregroundColor(.white.opacity(0.7))
                                .lineLimit(nil)
                                .fixedSize(horizontal: false, vertical: true)
                            Text("at \(entry.cycleData.nextPhaseTime)")
                                .font(.system(size: timerTimeSize))
                                .foregroundColor(.white.opacity(0.6))
                                .lineLimit(nil)
                                .fixedSize(horizontal: false, vertical: true)
                        }
                    }
                    .frame(maxWidth: .infinity)
                    .frame(maxHeight: .infinity, alignment: .center)
                    
                    // Live Data/Confidence
                    VStack(spacing: 8) {
                        // Heart rate - hide if nil
                        if let heartRate = entry.cycleData.heartRate {
                            HStack(spacing: 4) {
                                Image(systemName: "heart.fill")
                                    .font(.system(size: heartIconSize))
                                    .foregroundColor(.red.opacity(0.8))
                                Text("\(heartRate) bpm")
                                    .font(.system(size: heartRateSize, weight: .semibold))
                                    .foregroundColor(.white)
                            }
                        }
                        
                        // Confidence badge with intrinsic sizing
                        Text("\(Int(entry.cycleData.confidence * 100))% confidence")
                            .font(.system(size: confidenceSize, weight: .medium))
                            .padding(.horizontal, 8)
                            .padding(.vertical, 3)
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
                            .minimumScaleFactor(0.8)
                    }
                    .frame(maxWidth: .infinity)
                }
                .frame(maxHeight: .infinity, alignment: .center)
            }
            .padding(.horizontal, horizontalPadding)
            .padding(.bottom, bottomPadding)
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
    
    // MARK: - Dynamic Sizing
    
    private var headerTitleSize: CGFloat {
        family == .systemMedium ? 14 : 16
    }
    
    private var headerSubtitleSize: CGFloat {
        family == .systemMedium ? 9 : 11
    }
    
    private var headerInfoSize: CGFloat {
        family == .systemMedium ? 10 : 12
    }
    
    private var headerTimeSize: CGFloat {
        family == .systemMedium ? 9 : 11
    }
    
    private var circleSize: CGFloat {
        family == .systemMedium ? 40 : 48
    }
    
    private var iconSize: CGFloat {
        family == .systemMedium ? 16 : 20
    }
    
    private var energyLabelSize: CGFloat {
        family == .systemMedium ? 10 : 12
    }
    
    private var intensityLabelSize: CGFloat {
        family == .systemMedium ? 8 : 10
    }
    
    private var activityDescriptionSize: CGFloat {
        family == .systemMedium ? 7 : 9
    }
    
    private var timerSize: CGFloat {
        family == .systemMedium ? 20 : 28
    }
    
    private var timerSubtitleSize: CGFloat {
        family == .systemMedium ? 8 : 10
    }
    
    private var timerTimeSize: CGFloat {
        family == .systemMedium ? 8 : 10
    }
    
    private var heartIconSize: CGFloat {
        family == .systemMedium ? 8 : 10
    }
    
    private var heartRateSize: CGFloat {
        family == .systemMedium ? 10 : 12
    }
    
    private var confidenceSize: CGFloat {
        family == .systemMedium ? 7 : 9
    }
    
    private var horizontalPadding: CGFloat {
        family == .systemMedium ? 12 : 16
    }
    
    private var topPadding: CGFloat {
        family == .systemMedium ? 12 : 16
    }
    
    private var bottomPadding: CGFloat {
        family == .systemMedium ? 12 : 16
    }
    
    private var headerBottomPadding: CGFloat {
        family == .systemMedium ? 8 : 12
    }
    
    private var columnSpacing: CGFloat {
        family == .systemMedium ? 12 : 20
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
    
    private func getActivityDescription() -> String {
        switch entry.cycleData.phaseIcon {
        case "↗": return "Warm up: Light tasks, planning"
        case "↑": return "Building momentum: Challenging work"
        case "🔥": return "Peak time: Complex projects"
        case "⚡": return "Prime focus: Deep work"
        case "↘": return "Wind down: Finish tasks"
        case "😴": return "Rest time: Breaks, reflection"
        default: return "Energy transition period"
        }
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