"use client"

import { useAppStore } from "@/lib/store"
import { getCircadianInfo, phases, getTimeUntilNextPhase, formatDuration } from "@/lib/circadian"
import { useThemeStore } from '@/lib/themeStore'

export default function RhythmTimeline() {
  const currentTime = useAppStore((state) => state.currentTime)
  const { timePosition, dayProgress } = getCircadianInfo(currentTime)
  const { seconds } = getTimeUntilNextPhase(currentTime)
  const theme = useThemeStore((s) => s.theme)

  const barClasses = 'bg-[color:var(--progress-bg)]'
  const markerStyle = { backgroundColor: 'var(--accent)' }

  return (
    <div className={`relative w-full h-16 ${barClasses} rounded-full overflow-visible my-8`}>
      {theme !== 'terminal' && (
        <div className="absolute inset-0 flex">
          {phases.map((phase) => (
            <div
              key={phase.name}
              className={`h-full bg-gradient-to-r ${phase.color}`}
              style={{ width: `${((phase.end - phase.start) / 24) * 100}%` }}
            />
          ))}
        </div>
      )}
      {theme === 'terminal' && (
        <div
          className="absolute inset-0"
          style={{
            width: `${dayProgress}%`,
            backgroundImage: 'repeating-linear-gradient(90deg, var(--progress-fill) 0 2px, transparent 2px 4px)'
          }}
        />
      )}
      <div
        className="absolute top-0 h-full w-1 rounded-full shadow-lg"
        style={{ ...markerStyle, left: timePosition }}
      >
        <div
          className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900/80 px-3 py-0.5 rounded-md text-white text-lg font-semibold whitespace-nowrap pointer-events-none select-none shadow"
        >
          {formatDuration(seconds)}
        </div>
      </div>
    </div>
  )
} 