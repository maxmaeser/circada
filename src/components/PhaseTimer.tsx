"use client"

import { useAppStore } from "@/lib/store"
import { getTimeUntilNextPhase, formatDuration } from "@/lib/circadian"
import { useEffect, useState } from "react"

export default function PhaseTimer() {
  const currentTime = useAppStore((state) => state.currentTime)
  const [remaining, setRemaining] = useState(getTimeUntilNextPhase(currentTime).seconds)

  // Update remaining whenever currentTime changes (which is every second)
  useEffect(() => {
    setRemaining(getTimeUntilNextPhase(currentTime).seconds)
  }, [currentTime])

  return (
    <p className="text-gray-400 text-sm mt-2">Time left in phase: {formatDuration(remaining)}</p>
  )
} 