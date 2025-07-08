import Foundation
import HealthKit

@available(macOS 13.0, *)

// HealthKit bridge for live data streaming
@objc public class HealthKitBridge: NSObject {
    private let healthStore = HKHealthStore()
    private var heartRateQuery: HKObserverQuery?
    private var isMonitoring = false
    
    // Callback function pointer for Rust
    private var heartRateCallback: (@convention(c) (Double, UInt64) -> Void)?
    
    @objc public static let shared = HealthKitBridge()
    
    override init() {
        super.init()
    }
    
    // Set callback function from Rust
    @objc public func setHeartRateCallback(_ callback: @escaping @convention(c) (Double, UInt64) -> Void) {
        self.heartRateCallback = callback
    }
    
    // Request HealthKit permissions
    @objc public func requestPermissions(completion: @escaping (Bool) -> Void) {
        guard HKHealthStore.isHealthDataAvailable() else {
            completion(false)
            return
        }
        
        let heartRateType = HKQuantityType.quantityType(forIdentifier: .heartRate)!
        let typesToRead: Set<HKObjectType> = [heartRateType]
        
        healthStore.requestAuthorization(toShare: [], read: typesToRead) { success, error in
            DispatchQueue.main.async {
                completion(success)
            }
        }
    }
    
    // Start live heart rate monitoring
    @objc public func startHeartRateMonitoring() -> Bool {
        guard !isMonitoring else { return true }
        
        let heartRateType = HKQuantityType.quantityType(forIdentifier: .heartRate)!
        
        // Create observer query for live updates
        heartRateQuery = HKObserverQuery(sampleType: heartRateType, predicate: nil) { [weak self] _, _, error in
            if error == nil {
                self?.fetchLatestHeartRate()
            }
        }
        
        guard let query = heartRateQuery else { return false }
        
        healthStore.execute(query)
        
        // Enable background delivery
        healthStore.enableBackgroundDelivery(for: heartRateType, frequency: .immediate) { success, error in
            if success {
                print("HealthKit background delivery enabled")
            }
        }
        
        isMonitoring = true
        
        // Fetch initial heart rate
        fetchLatestHeartRate()
        
        return true
    }
    
    // Stop heart rate monitoring
    @objc public func stopHeartRateMonitoring() {
        guard isMonitoring else { return }
        
        if let query = heartRateQuery {
            healthStore.stop(query)
        }
        
        let heartRateType = HKQuantityType.quantityType(forIdentifier: .heartRate)!
        healthStore.disableBackgroundDelivery(for: heartRateType) { _, _ in }
        
        isMonitoring = false
        heartRateQuery = nil
    }
    
    // Fetch latest heart rate sample
    private func fetchLatestHeartRate() {
        let heartRateType = HKQuantityType.quantityType(forIdentifier: .heartRate)!
        let sortDescriptor = NSSortDescriptor(key: HKSampleSortIdentifierEndDate, ascending: false)
        
        let query = HKSampleQuery(
            sampleType: heartRateType,
            predicate: nil,
            limit: 1,
            sortDescriptors: [sortDescriptor]
        ) { [weak self] _, samples, error in
            guard let sample = samples?.first as? HKQuantitySample else { return }
            
            let heartRate = sample.quantity.doubleValue(for: HKUnit.count().unitDivided(by: HKUnit.minute()))
            let timestamp = UInt64(sample.endDate.timeIntervalSince1970 * 1000) // milliseconds
            
            // Call Rust callback
            self?.heartRateCallback?(heartRate, timestamp)
        }
        
        healthStore.execute(query)
    }
    
    // Get current heart rate synchronously (for testing)
    @objc public func getCurrentHeartRate() -> Double {
        // This would normally be async, but for simplicity return a mock value
        return 75.0
    }
}

// C-compatible functions for Rust FFI
@available(macOS 13.0, *)
@_cdecl("healthkit_request_permissions")
public func healthkit_request_permissions() -> Bool {
    var result = false
    let semaphore = DispatchSemaphore(value: 0)
    
    HealthKitBridge.shared.requestPermissions { success in
        result = success
        semaphore.signal()
    }
    
    semaphore.wait()
    return result
}

@available(macOS 13.0, *)
@_cdecl("healthkit_start_monitoring")
public func healthkit_start_monitoring() -> Bool {
    return HealthKitBridge.shared.startHeartRateMonitoring()
}

@available(macOS 13.0, *)
@_cdecl("healthkit_stop_monitoring")
public func healthkit_stop_monitoring() {
    HealthKitBridge.shared.stopHeartRateMonitoring()
}

@available(macOS 13.0, *)
@_cdecl("healthkit_set_callback")
public func healthkit_set_callback(_ callback: @escaping @convention(c) (Double, UInt64) -> Void) {
    HealthKitBridge.shared.setHeartRateCallback(callback)
}

@available(macOS 13.0, *)
@_cdecl("healthkit_get_current_hr")
public func healthkit_get_current_hr() -> Double {
    return HealthKitBridge.shared.getCurrentHeartRate()
}