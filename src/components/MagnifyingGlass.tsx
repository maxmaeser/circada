"use client"

import React from 'react'

interface MagnifyingGlassProps {
  /** X position in SVG coordinates */
  x: number
  /** Y position in SVG coordinates */
  y: number
  /** Width of the magnified area */
  width?: number
  /** Height of the magnified area */
  height?: number
  /** Zoom level (default 2.5x) */
  zoom?: number
  /** Children to render inside the magnified view */
  children: React.ReactNode
  /** SVG viewBox width (e.g., 1000 for viewBox="0 0 1000 128") */
  svgWidth: number
  /** SVG viewBox height */
  svgHeight: number
}

export default function MagnifyingGlass({
  x,
  y,
  width = 220,
  height = 160,
  zoom = 2.5,
  children,
  svgWidth,
  svgHeight,
}: MagnifyingGlassProps) {
  // Center the magnifier on the cursor position
  const offsetX = -width / 2
  const offsetY = -height / 2

  let glassX = x + offsetX
  let glassY = y + offsetY

  // Keep within bounds
  if (glassX < 0) glassX = 0
  if (glassX + width > svgWidth) glassX = svgWidth - width
  if (glassY < 0) glassY = 0
  if (glassY + height > svgHeight) glassY = svgHeight - height

  // Calculate what source region to show (zoomed)
  const sourceWidth = width / zoom
  const sourceHeight = height / zoom
  const sourceX = x - sourceWidth / 2
  const sourceY = y - sourceHeight / 2

  return (
    <g className="magnifying-glass" style={{ pointerEvents: 'none' }}>
      {/* Shadow */}
      <rect
        x={glassX - 3}
        y={glassY - 3}
        width={width + 6}
        height={height + 6}
        rx="14"
        fill="rgba(0, 0, 0, 0.5)"
        filter="blur(6px)"
      />

      {/* Glass background with border */}
      <rect
        x={glassX}
        y={glassY}
        width={width}
        height={height}
        rx="12"
        fill="rgba(20, 20, 30, 0.9)"
        stroke="rgba(255, 255, 255, 0.25)"
        strokeWidth="2"
      />

      {/* Inner subtle border */}
      <rect
        x={glassX + 2}
        y={glassY + 2}
        width={width - 4}
        height={height - 4}
        rx="10"
        fill="none"
        stroke="rgba(255, 255, 255, 0.1)"
        strokeWidth="1"
      />

      {/* Magnified content using nested SVG with viewBox */}
      <svg
        x={glassX}
        y={glassY}
        width={width}
        height={height}
        viewBox={`${sourceX} ${sourceY} ${sourceWidth} ${sourceHeight}`}
        preserveAspectRatio="xMidYMid slice"
        style={{
          overflow: 'hidden',
          borderRadius: '12px',
        }}
      >
        {children}
      </svg>

      {/* Glass reflection effect on top */}
      <defs>
        <linearGradient id="glassShine" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="rgba(255, 255, 255, 0.2)" />
          <stop offset="50%" stopColor="rgba(255, 255, 255, 0)" />
        </linearGradient>
      </defs>
      <rect
        x={glassX}
        y={glassY}
        width={width}
        height={height / 2}
        rx="12"
        fill="url(#glassShine)"
        style={{ pointerEvents: 'none' }}
      />
    </g>
  )
}
