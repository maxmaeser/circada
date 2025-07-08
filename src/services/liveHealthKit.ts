import { invoke } from '@tauri-apps/api/core';
import { listen, type UnlistenFn } from '@tauri-apps/api/event';

export interface LiveHeartRateData {
  rate: number;
  timestamp: number;
}

export interface LiveHealthKitService {
  requestPermissions(): Promise<boolean>;
  startMonitoring(): Promise<void>;
  stopMonitoring(): Promise<void>;
  getCurrentHeartRate(): Promise<number>;
  isAvailable(): Promise<boolean>;
  onHeartRateUpdate(callback: (data: LiveHeartRateData) => void): Promise<UnlistenFn>;
}

class LiveHealthKitServiceImpl implements LiveHealthKitService {
  private isMonitoring = false;

  async requestPermissions(): Promise<boolean> {
    try {
      return await invoke('request_healthkit_permissions');
    } catch (error) {
      console.error('Failed to request HealthKit permissions:', error);
      return false;
    }
  }

  async startMonitoring(): Promise<void> {
    if (this.isMonitoring) return;
    
    try {
      await invoke('start_healthkit_monitoring');
      this.isMonitoring = true;
    } catch (error) {
      console.error('Failed to start HealthKit monitoring:', error);
      throw error;
    }
  }

  async stopMonitoring(): Promise<void> {
    if (!this.isMonitoring) return;
    
    try {
      await invoke('stop_healthkit_monitoring');
      this.isMonitoring = false;
    } catch (error) {
      console.error('Failed to stop HealthKit monitoring:', error);
      throw error;
    }
  }

  async getCurrentHeartRate(): Promise<number> {
    try {
      return await invoke('get_current_heart_rate');
    } catch (error) {
      console.error('Failed to get current heart rate:', error);
      return 0;
    }
  }

  async isAvailable(): Promise<boolean> {
    try {
      return await invoke('healthkit_is_available');
    } catch (error) {
      console.error('Failed to check HealthKit availability:', error);
      return false;
    }
  }

  async onHeartRateUpdate(callback: (data: LiveHeartRateData) => void): Promise<UnlistenFn> {
    return await listen<LiveHeartRateData>('heart-rate-update', (event) => {
      callback(event.payload);
    });
  }
}

// Mock implementation for development/testing
class MockLiveHealthKitService implements LiveHealthKitService {
  private isMonitoring = false;
  private intervalId: NodeJS.Timeout | null = null;

  async requestPermissions(): Promise<boolean> {
    return true;
  }

  async startMonitoring(): Promise<void> {
    if (this.isMonitoring) return;
    this.isMonitoring = true;
  }

  async stopMonitoring(): Promise<void> {
    if (!this.isMonitoring) return;
    this.isMonitoring = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  async getCurrentHeartRate(): Promise<number> {
    // Simulate heart rate between 60-100 bpm
    return Math.floor(Math.random() * 40) + 60;
  }

  async isAvailable(): Promise<boolean> {
    return true;
  }

  async onHeartRateUpdate(callback: (data: LiveHeartRateData) => void): Promise<UnlistenFn> {
    // Simulate heart rate updates every 5 seconds
    this.intervalId = setInterval(() => {
      if (this.isMonitoring) {
        callback({
          rate: Math.floor(Math.random() * 40) + 60,
          timestamp: Date.now()
        });
      }
    }, 5000);

    return () => {
      if (this.intervalId) {
        clearInterval(this.intervalId);
        this.intervalId = null;
      }
    };
  }
}

// Export singleton instance
export const liveHealthKit: LiveHealthKitService = 
  typeof window !== 'undefined' && (window as any).__TAURI__ 
    ? new LiveHealthKitServiceImpl()
    : new MockLiveHealthKitService();

// Live cycle adjustment algorithm
export class LiveCycleAdjustment {
  private baselineHeartRate = 70;
  private heartRateHistory: number[] = [];
  private readonly MAX_HISTORY = 10;

  updateBaseline(heartRate: number) {
    this.heartRateHistory.push(heartRate);
    if (this.heartRateHistory.length > this.MAX_HISTORY) {
      this.heartRateHistory.shift();
    }
    
    // Calculate rolling average as baseline
    this.baselineHeartRate = this.heartRateHistory.reduce((sum, hr) => sum + hr, 0) / this.heartRateHistory.length;
  }

  adjustCyclePosition(currentPosition: number, heartRate: number): number {
    const deviation = heartRate - this.baselineHeartRate;
    const threshold = 5; // BPM threshold for adjustment
    
    // If heart rate is significantly higher, might be entering peak phase
    if (deviation > threshold) {
      // Nudge cycle position toward peak (30-60min range)
      if (currentPosition < 30) {
        return Math.min(currentPosition + 2, 30);
      }
    }
    
    // If heart rate is significantly lower, might be entering rest phase
    if (deviation < -threshold) {
      // Nudge cycle position toward rest (60-90min range)
      if (currentPosition > 60) {
        return Math.max(currentPosition - 2, 60);
      }
    }
    
    return currentPosition;
  }

  getConfidence(heartRate: number): number {
    const deviation = Math.abs(heartRate - this.baselineHeartRate);
    const maxDeviation = 20; // Maximum expected deviation
    
    // Higher confidence when heart rate is more predictable
    return Math.max(0, Math.min(1, 1 - (deviation / maxDeviation)));
  }
}