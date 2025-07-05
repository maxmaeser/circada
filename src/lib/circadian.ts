export interface CircadianPhase {
  name: string;
  start: number;
  end: number;
  color: string;
}

export const phases: CircadianPhase[] = [
  { name: "Deep Sleep", start: 0, end: 5, color: "from-indigo-600 to-purple-700" },
  { name: "Light Sleep", start: 5, end: 6, color: "from-purple-500 to-blue-600" },
  { name: "Wake Up", start: 6, end: 8, color: "from-blue-400 to-cyan-500" },
  { name: "Morning Alert", start: 8, end: 12, color: "from-cyan-400 to-sky-500" },
  { name: "Afternoon Dip", start: 12, end: 16, color: "from-sky-500 to-blue-600" },
  { name: "Evening Wind-Down", start: 16, end: 22, color: "from-blue-600 to-indigo-700" },
  { name: "Sleep Onset", start: 22, end: 24, color: "from-indigo-700 to-purple-800" },
];

export function getCircadianInfo(date: Date) {
  const currentHour = date.getHours() + date.getMinutes() / 60;
  const dayProgress = (currentHour / 24) * 100;
  
  const currentPhase = phases.find((phase) => currentHour >= phase.start && currentHour < phase.end) || phases[phases.length-1];

  const timePosition = `calc(${dayProgress}% - 12px)`; // 12px is half the width of the indicator

  return {
    currentHour,
    dayProgress,
    currentPhase,
    timePosition,
  };
}

export function getTimeUntilNextPhase(date: Date) {
  const { currentPhase } = getCircadianInfo(date)
  const currentHourDecimal = date.getHours() + date.getMinutes() / 60 + date.getSeconds() / 3600

  // find next phase
  let nextPhase = phases.find((p) => p.start > currentPhase.start)
  if (!nextPhase) {
    nextPhase = phases[0]
  }

  let nextPhaseDate = new Date(date)
  nextPhaseDate.setHours(nextPhase.start, 0, 0, 0)

  // if next phase is earlier in the day, roll to tomorrow
  if (nextPhase.start <= currentPhase.start) {
    nextPhaseDate.setDate(nextPhaseDate.getDate() + 1)
  } else if (nextPhase.start === currentPhase.start && currentHourDecimal >= nextPhase.start) {
    nextPhaseDate.setDate(nextPhaseDate.getDate() + 1)
  }

  const diffMs = nextPhaseDate.getTime() - date.getTime()
  const diffSec = Math.max(0, Math.floor(diffMs / 1000))
  return {
    seconds: diffSec,
    nextPhase,
  }
}

export function formatDuration(seconds: number) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  const parts = [] as string[]
  if (h > 0) parts.push(`${h}h`)
  if (m > 0 || h > 0) parts.push(`${m}m`)
  parts.push(`${s}s`)
  return parts.join(" ")
}

export function formatHour(hour: number) {
  const date = new Date()
  date.setHours(hour, 0, 0, 0)
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
} 