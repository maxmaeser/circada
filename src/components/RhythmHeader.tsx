"use client"

import { useAppStore } from "@/lib/store"
import { getCircadianInfo, getTimeUntilNextPhase, formatHour } from "@/lib/circadian"

export default function RhythmHeader() {
  const currentTime = useAppStore((state) => state.currentTime)
  const { currentPhase } = getCircadianInfo(currentTime)
  const { nextPhase } = getTimeUntilNextPhase(currentTime)

  return (
    <div className="flex justify-between items-center mb-4">
      <div>
        <h1 className="text-3xl font-bold">Daily Rhythm</h1>
        <p className="text-gray-200 text-2xl font-semibold">
          {currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>
      <div className="text-right">
        <h2 className="text-2xl font-semibold">{currentPhase.name}</h2>
        <p className="text-gray-400 text-sm">
          Current: {currentPhase.name} ({formatHour(currentPhase.start)} – {formatHour(currentPhase.end)})
        </p>
        <p className="text-gray-400 text-sm mt-1">
          Next: {nextPhase.name} ({formatHour(nextPhase.start)} – {formatHour(nextPhase.end)})
        </p>
      </div>
    </div>
  )
} 