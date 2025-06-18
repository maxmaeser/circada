export function getPhaseProgress(startHour: number, endHour: number): number {
  const now = new Date();
  const currentHour = now.getHours() + now.getMinutes() / 60;

  // Handle phases that cross midnight
  if (endHour < startHour) {
    if (currentHour >= startHour) {
      return ((currentHour - startHour) / (24 - startHour + endHour)) * 100;
    } else {
      return ((currentHour + 24 - startHour) / (24 - startHour + endHour)) * 100;
    }
  }

  return ((currentHour - startHour) / (endHour - startHour)) * 100;
}

export function getTimeUntilHour(targetHour: number): number {
  const now = new Date();
  const currentHour = now.getHours() + now.getMinutes() / 60;
  
  let hoursUntil = targetHour - currentHour;
  if (hoursUntil < 0) {
    hoursUntil += 24;
  }
  
  return hoursUntil;
}

export function formatTimeRemaining(hours: number): string {
  const wholeHours = Math.floor(hours);
  const minutes = Math.round((hours - wholeHours) * 60);
  
  if (wholeHours === 0) {
    return `${minutes}m`;
  }
  
  return `${wholeHours}h ${minutes}m`;
}

export function formatTime(hour: number): string {
  const now = new Date();
  const date = new Date(now.getFullYear(), now.getMonth(), now.getDate(), Math.floor(hour), Math.round((hour % 1) * 60));
  return date.toLocaleTimeString('en-US', { 
    hour: 'numeric',
    minute: '2-digit',
    hour12: true 
  });
} 