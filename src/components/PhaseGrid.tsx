"use client"

import { phases } from "@/lib/circadian"

export default function PhaseGrid() {
  return (
    <div className="grid grid-cols-3 md:grid-cols-7 gap-4 text-center mt-8 w-full">
        {phases.map(phase => (
            <div key={phase.name}>
                <p className="text-sm">{phase.name}</p>
            </div>
        ))}
    </div>
  )
} 