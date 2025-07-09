import { invoke } from '@tauri-apps/api/core';

export class TrayUpdater {
  private updateInterval: NodeJS.Timeout | null = null;

  start() {
    // Update tray title every second
    this.updateInterval = setInterval(() => {
      this.updateTrayTitle();
    }, 1000);
    
    // Update immediately
    this.updateTrayTitle();
  }

  stop() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  private updateTrayTitle() {
    const currentTime = new Date();
    
    // Use same calculation as MenubarWidget
    const totalMinutes = currentTime.getHours() * 60 + currentTime.getMinutes() + currentTime.getSeconds() / 60;
    const cyclePosition = totalMinutes % 90;
    
    // Determine energy phase
    let energyPhase: 'high' | 'low' | 'transition' = 'high';
    
    if (cyclePosition <= 5) {
      energyPhase = 'transition';
    } else if (cyclePosition <= 60) {
      energyPhase = 'high';
    } else if (cyclePosition <= 65) {
      energyPhase = 'transition';
    } else {
      energyPhase = 'low';
    }
    
    // Calculate time remaining
    const timeRemaining = energyPhase === 'high' || (energyPhase === 'transition' && cyclePosition <= 60) 
      ? 60 - cyclePosition 
      : 90 - cyclePosition;
    
    const minutesLeft = Math.floor(timeRemaining);
    const secondsLeft = Math.floor((timeRemaining - minutesLeft) * 60);
    
    // Determine phase icon (6-phase system)
    let phaseArrow = '↗';
    if (cyclePosition <= 15) {
      phaseArrow = '↗'; // Rising (0-15 min) - Building energy
    } else if (cyclePosition <= 30) {
      phaseArrow = '↑'; // Climbing (15-30 min) - Strong ascent
    } else if (cyclePosition <= 45) {
      phaseArrow = '🔥'; // Peak (30-45 min) - Maximum energy
    } else if (cyclePosition <= 60) {
      phaseArrow = '⚡'; // Flow (45-60 min) - Optimal performance
    } else if (cyclePosition <= 75) {
      phaseArrow = '↘'; // Declining (60-75 min) - Energy decreasing
    } else {
      phaseArrow = '😴'; // Resting (75-90 min) - Recovery phase
    }
    
    // Format title
    const title = `${phaseArrow} ${String(minutesLeft).padStart(2, '0')}:${String(secondsLeft).padStart(2, '0')}`;
    
    // Update tray title
    invoke('update_tray_title', { title }).catch(console.error);
  }
}

export const trayUpdater = new TrayUpdater();