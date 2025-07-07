export interface CircadianPhase {
  name: string;
  start: number; // Hour of the day (0-23)
  end: number; // Hour of the day (0-23)
  description: string;
}

export const defaultPhases: CircadianPhase[] = [
  { name: 'Morning Peak', start: 6, end: 9, description: 'Best for analytical tasks and focus.' },
  { name: 'Mid-Day Trough', start: 9, end: 12, description: 'Good for creative work and brainstorming.' },
  { name: 'Afternoon Peak', start: 12, end: 17, description: 'Ideal for collaboration and communication.' },
  { name: 'Evening Dip', start: 17, end: 21, description: 'Time to wind down, read, or relax.' },
  { name: 'Sleep Zone', start: 21, end: 24, description: 'Prepare for sleep.' },
  { name: 'Night', start: 0, end: 6, description: 'Sleep and recovery.' },
];

export const getCurrentPhase = (date: Date = new Date(), phases: CircadianPhase[] = defaultPhases): CircadianPhase | undefined => {
  const currentHour = date.getHours();
  return phases.find(phase => currentHour >= phase.start && currentHour < phase.end);
}; 