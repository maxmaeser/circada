"use client"

import { phases } from "@/lib/circadian"
import React from "react"

interface CircadianWaveProps {
  width?: number
  height?: number
  samples?: number // number of points along the 24h timeline
  amplitude?: number // amplitude factor (0-1 relative to height/2)
  waveFn?: (t: number) => number // t in hours 0-24 returns -1..1
}

// default sinusoidal function approximating alertness (peak around 15h, dip at 3h)
const defaultWaveFn = (t: number) => {
  // shift so max at 15:00 (3PM) roughly.
  const radians = ((t - 15) / 24) * 2 * Math.PI
  return Math.sin(radians)
}

export default function CircadianWave({ width=800, height=120, samples=48, amplitude=0.8, waveFn=defaultWaveFn }: CircadianWaveProps) {
  // generate points
  const step = 24 / (samples - 1)
  const halfH = height / 2
  const amp = halfH * amplitude
  const points: [number, number][] = []
  for (let i = 0; i < samples; i++) {
    const hour = i * step
    const val = waveFn(hour)
    const x = (hour / 24) * width
    const y = halfH - val * amp
    points.push([x, y])
  }

  const pathD = points
    .map((p, idx) => (idx === 0 ? `M ${p[0]},${p[1]}` : `L ${p[0]},${p[1]}`))
    .join(" ")

  // Build a linear gradient across phases
  const gradientStops = phases.map((phase) => {
    const startPct = (phase.start / 24) * 100
    const endPct = (phase.end / 24) * 100
    // Use first color token from tailwind gradient string for stroke
    const baseColor = phase.color.split(" ")[0].replace("from-", "")
    return { startPct, endPct, baseColor }
  })

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height} className="mt-12">
      <defs>
        <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          {gradientStops.map((stop, idx) => (
            <React.Fragment key={idx}>
              <stop offset={`${stop.startPct}%`} stopColor={`var(--tw-gradient-from, theme(colors.${stop.baseColor}))`} />
              <stop offset={`${stop.endPct}%`} stopColor={`var(--tw-gradient-to, theme(colors.${stop.baseColor}))`} />
            </React.Fragment>
          ))}
        </linearGradient>
      </defs>
      <path d={pathD} fill="none" stroke="url(#waveGradient)" strokeWidth="4" />
    </svg>
  )
} 