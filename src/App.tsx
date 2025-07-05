"use client"

import { useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { useAppStore } from "@/lib/store"
import RhythmHeader from "@/components/RhythmHeader"
import RhythmTimeline from "@/components/RhythmTimeline"
import PhaseGrid from "@/components/PhaseGrid"
import CircadianWave from "@/components/CircadianWave"
import ThemeDropdown from "@/components/ThemeDropdown"

export default function App() {
  const setCurrentTime = useAppStore((state) => state.setCurrentTime)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [setCurrentTime])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4">
      <Card className="w-full max-w-4xl bg-card text-card-foreground border border-border">
        <CardContent className="p-8">
          <RhythmHeader />
          <RhythmTimeline />
          <PhaseGrid />
          <CircadianWave />
          <ThemeDropdown />
        </CardContent>
      </Card>
    </div>
  )
}