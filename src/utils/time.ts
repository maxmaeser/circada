export const getTimeUntilHour = (targetHour: number, currentDate: Date = new Date()): number => {
  const now = new Date(currentDate);
  const target = new Date(currentDate);
  target.setHours(targetHour, 0, 0, 0);
  
  // If target hour is earlier in the day, it means next day
  if (target <= now) {
    target.setDate(target.getDate() + 1);
  }
  
  return target.getTime() - now.getTime();
};

export const formatTimeRemaining = (milliseconds: number): string => {
  const hours = Math.floor(milliseconds / (1000 * 60 * 60));
  const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};

export const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};

export const getPhaseProgress = (phaseStart: number, phaseEnd: number, currentDate: Date = new Date()): number => {
  const currentHour = currentDate.getHours() + currentDate.getMinutes() / 60;
  
  // Handle phases that cross midnight
  let start = phaseStart;
  let end = phaseEnd;
  let current = currentHour;
  
  if (phaseEnd < phaseStart) {
    // Phase crosses midnight
    if (currentHour >= phaseStart) {
      end = phaseEnd + 24;
    } else {
      start = phaseStart - 24;
    }
  }
  
  const totalDuration = end - start;
  const elapsed = current - start;
  
  return Math.max(0, Math.min(100, (elapsed / totalDuration) * 100));
}; 