"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"

export default function App() {
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Define circadian phases (24-hour format)
  const phases = [
    { name: "Deep Sleep", start: 0, end: 5, color: "from-indigo-600 to-purple-700" },
    { name: "Light Sleep", start: 5, end: 6, color: "from-purple-500 to-blue-600" },
    { name: "Wake Up", start: 6, end: 8, color: "from-blue-400 to-cyan-500" },
    { name: "Morning Alert", start: 8, end: 12, color: "from-cyan-400 to-green-500" },
    { name: "Peak Focus", start: 12, end: 15, color: "from-green-400 to-yellow-500" },
    { name: "Afternoon Dip", start: 15, end: 17, color: "from-yellow-400 to-orange-500" },
    { name: "Evening Alert", start: 17, end: 20, color: "from-orange-400 to-red-500" },
    { name: "Wind Down", start: 20, end: 22, color: "from-red-400 to-purple-500" },
    { name: "Prepare Sleep", start: 22, end: 24, color: "from-purple-500 to-indigo-600" },
  ]

  const getCurrentPhase = () => {
    const hour = currentTime.getHours()
    return phases.find((phase) => hour >= phase.start && hour < phase.end) || phases[0]
  }

  const getNextPhaseTime = () => {
    const currentPhase = getCurrentPhase()
    const nextHour = currentPhase.end === 24 ? 0 : currentPhase.end
    const nextPhaseTime = new Date(currentTime)

    if (currentPhase.end === 24) {
      nextPhaseTime.setDate(nextPhaseTime.getDate() + 1)
      nextPhaseTime.setHours(0, 0, 0, 0)
    } else {
      nextPhaseTime.setHours(currentPhase.end, 0, 0, 0)
    }

    return nextPhaseTime
  }

  const getTimeUntilNext = () => {
    const nextTime = getNextPhaseTime()
    const diff = nextTime.getTime() - currentTime.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((diff % (1000 * 60)) / 1000)

    if (hours > 0) {
      return `${hours}h ${minutes}m`
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`
    } else {
      return `${seconds}s`
    }
  }

  const formatTime = (hour: number) => {
    if (hour === 0) return "12:00 AM"
    if (hour === 12) return "12:00 PM"
    if (hour < 12) return `${hour}:00 AM`
    return `${hour - 12}:00 PM`
  }

  const currentPhase = getCurrentPhase()
  const currentHour = currentTime.getHours()
  const currentPosition = ((currentHour + currentTime.getMinutes() / 60) / 24) * 100

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Header */}
      <header className="text-center py-8">
        <h1 className="text-4xl font-light tracking-wide text-slate-100">Circada</h1>
        <p className="text-slate-400 mt-2">Your natural rhythm</p>
      </header>

      <div className="container mx-auto px-4 max-w-2xl space-y-8">
        {/* Current Phase Progress */}
        <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
          <CardContent className="p-8">
            {/* Phase name with colored dot */}
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${currentPhase.color}`}></div>
              <span className="text-xl font-light text-slate-200">{currentPhase.name}</span>
            </div>

            {/* Progress bar with timer */}
            <div className="relative">
              <div className="w-full bg-slate-800 rounded-full h-12 overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${currentPhase.color} transition-all duration-1000 ease-out relative`}
                  style={{
                    width: `${((currentTime.getHours() + currentTime.getMinutes() / 60 - currentPhase.start) / (currentPhase.end - currentPhase.start)) * 100}%`,
                  }}
                >
                  <div className="absolute inset-0 bg-white/10"></div>
                </div>
              </div>

              {/* Timer text overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-white font-medium text-lg drop-shadow-lg">{getTimeUntilNext()} remaining</span>
              </div>
            </div>

            {/* Start and end times */}
            <div className="flex justify-between mt-4 text-sm text-slate-400">
              <span>{formatTime(currentPhase.start)}</span>
              <span>{formatTime(currentPhase.end)}</span>
            </div>

            {/* Next Phase Section */}
            <div className="mt-6 pt-6 border-t border-slate-800">
              <div className="text-center mb-4">
                <p className="text-slate-400 text-sm mb-2">Next Phase</p>
                <div className="flex items-center justify-center gap-3">
                  <div
                    className={`w-2 h-2 rounded-full bg-gradient-to-r ${phases.find((phase) => phase.start === (currentPhase.end === 24 ? 0 : currentPhase.end))?.color || phases[0].color}`}
                  ></div>
                  <span className="text-lg font-light text-slate-200">
                    {phases.find((phase) => phase.start === (currentPhase.end === 24 ? 0 : currentPhase.end))?.name ||
                      phases[0].name}
                  </span>
                </div>
              </div>

              <div className="flex justify-between text-sm text-slate-400">
                <div className="text-center">
                  <p className="text-slate-500 text-xs">Starts</p>
                  <p className="text-slate-300">{formatTime(currentPhase.end === 24 ? 0 : currentPhase.end)}</p>
                </div>
                <div className="text-center">
                  <p className="text-slate-500 text-xs">Duration</p>
                  <p className="text-slate-300">
                    {(() => {
                      const nextPhase =
                        phases.find((phase) => phase.start === (currentPhase.end === 24 ? 0 : currentPhase.end)) ||
                        phases[0]
                      const duration = nextPhase.end - nextPhase.start
                      return duration === 1 ? "1 hour" : `${duration} hours`
                    })()}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-slate-500 text-xs">Ends</p>
                  <p className="text-slate-300">
                    {(() => {
                      const nextPhase =
                        phases.find((phase) => phase.start === (currentPhase.end === 24 ? 0 : currentPhase.end)) ||
                        phases[0]
                      return formatTime(nextPhase.end === 24 ? 0 : nextPhase.end)
                    })()}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Daily Wave Visualization */}
        <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
          <CardContent className="p-8">
            <h3 className="text-xl font-light text-center mb-8 text-slate-200">Daily Rhythm</h3>

            {/* Wave Container */}
            <div className="relative h-40 mb-6">
              {/* Background wave */}
              <svg viewBox="0 0 400 120" className="w-full h-full" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="white" stopOpacity="1" />
                    <stop offset="100%" stopColor="white" stopOpacity="1" />
                  </linearGradient>
                  <linearGradient id="waveFill" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="white" stopOpacity="0.1" />
                    <stop offset="100%" stopColor="white" stopOpacity="0.1" />
                  </linearGradient>
                </defs>

                {/* Wave path */}
                <path
                  d="M0,80 Q50,30 100,60 T200,50 T300,70 T400,40"
                  stroke="url(#waveGradient)"
                  strokeWidth="4"
                  fill="none"
                  className="drop-shadow-lg"
                />

                {/* Fill under wave */}
                <path d="M0,80 Q50,30 100,60 T200,50 T300,70 T400,40 L400,120 L0,120 Z" fill="url(#waveFill)" />
              </svg>

              {/* Current position indicator */}
              <div
                className="absolute top-0 bottom-0 w-1 bg-white shadow-xl rounded-full"
                style={{ left: `${currentPosition}%` }}
              >
                <div className="absolute -top-3 -left-2 w-5 h-5 bg-white rounded-full shadow-xl animate-pulse border-2 border-slate-900"></div>
              </div>
            </div>

            {/* Time markers */}
            <div className="flex justify-between text-sm text-slate-300 px-2 font-medium">
              <span>12 AM</span>
              <span>6 AM</span>
              <span>12 PM</span>
              <span>6 PM</span>
              <span>12 AM</span>
            </div>

            {/* Current time display */}
            <div className="text-center mt-6 pt-6 border-t border-slate-800">
              <p className="text-slate-400 text-sm">Current time</p>
              <p className="text-2xl font-light text-slate-100">
                {currentTime.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}