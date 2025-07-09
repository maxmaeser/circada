import { invoke } from '@tauri-apps/api/core';

export interface WidgetCycleData {
  cycle_position: number;
  phase_icon: string;
  phase_label: string;
  energy_phase: string;
  energy_intensity: number;
  time_remaining_minutes: number;
  time_remaining_seconds: number;
  next_phase_time: string;
  cycle_number: number;
  heart_rate?: number;
  confidence: number;
  background_color: string;
}

export class WidgetDataProvider {
  private updateInterval: NodeJS.Timeout | null = null;

  start() {
    // Update widget data every 30 seconds
    this.updateInterval = setInterval(() => {
      this.updateWidgetData();
    }, 30000);
    
    // Update immediately
    this.updateWidgetData();
  }

  stop() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  private async updateWidgetData() {
    try {
      // Get current cycle data from Rust backend
      const cycleData = await invoke<WidgetCycleData>('get_widget_data');
      
      // Write to shared app group container (handled by Rust/Swift)
      await invoke('write_widget_data', { data: cycleData });
    } catch (error) {
      console.error('Failed to update widget data:', error);
    }
  }

  // Manual update method for immediate refresh
  async forceUpdate() {
    await this.updateWidgetData();
  }
}

export const widgetDataProvider = new WidgetDataProvider();