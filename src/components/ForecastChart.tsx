'use client'

import { useState } from 'react'

export interface ForecastPoint {
  hour: string
  height: number
}

import type { UnitSystem } from '@/lib/units'

interface ForecastChartProps {
  data: ReadonlyArray<ForecastPoint>
  peakSwell: string
  unitSystem: UnitSystem
}

const W = 280
const H = 76
const PAD_X = 12

function yRange(
  data: ReadonlyArray<ForecastPoint>,
): { yMin: number; yMax: number } {
  if (!data.length) return { yMin: 0, yMax: 1 }
  const vals   = data.map((d) => d.height)
  const hMin   = Math.min(...vals)
  const hMax   = Math.max(...vals)
  const spread = hMax - hMin || 0.1
  const pad    = Math.max(0.15 * spread, 0.05 * (hMax || 1))
  return { yMin: hMin - pad, yMax: hMax + pad }
}

function toY(h: number, yMin: number, yMax: number): number {
  return H - ((h - yMin) / (yMax - yMin)) * H
}

function buildSmoothPath(pts: { x: number; y: number }[]): string {
  if (pts.length < 2) return ''
  let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i]
    const p1 = pts[i + 1]
    const cpDx = (p1.x - p0.x) / 3
    d += ` C ${(p0.x + cpDx).toFixed(1)} ${p0.y.toFixed(1)}, ${(p1.x - cpDx).toFixed(1)} ${p1.y.toFixed(1)}, ${p1.x.toFixed(1)} ${p1.y.toFixed(1)}`
  }
  return d
}

export default function ForecastChart({ data, peakSwell, unitSystem }: ForecastChartProps) {
  const [hovered, setHovered] = useState<number | null>(null)
  const { yMin, yMax }         = yRange(data)
  const heightSuffix           = unitSystem === 'metric' ? 'm' : 'ft'

  const xStep = data.length > 1 ? (W - PAD_X * 2) / (data.length - 1) : 0
  const pts = data.map((d, i) => ({
    x: PAD_X + i * xStep,
    y: toY(d.height, yMin, yMax),
  }))

  const linePath = buildSmoothPath(pts)
  const last = pts[pts.length - 1]
  const first = pts[0]
  const areaPath =
    linePath +
    ` L ${last.x.toFixed(1)} ${H} L ${first.x.toFixed(1)} ${H} Z`

  return (
    <div className="space-y-3">
      <svg
        viewBox={`0 0 ${W} ${H + 22}`}
        width="100%"
        aria-label="12-hour surf forecast chart"
        overflow="visible"
      >
        <defs>
          <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#00F5FF" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#00F5FF" stopOpacity="0.01" />
          </linearGradient>
        </defs>

        {/* Area fill */}
        <path d={areaPath} fill="url(#areaFill)" />

        {/* Line */}
        <path
          d={linePath}
          fill="none"
          stroke="#00F5FF"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data points + tooltips */}
        {pts.map((pt, i) => (
          <g key={i}>
            <circle
              cx={pt.x}
              cy={pt.y}
              r={hovered === i ? 5 : 3.5}
              fill={hovered === i ? '#00F5FF' : '#0A192F'}
              stroke="#00F5FF"
              strokeWidth="2"
              style={{ cursor: 'pointer', transition: 'r 0.15s ease' }}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            />
            {hovered === i && (
              <text
                x={pt.x}
                y={pt.y - 10}
                textAnchor="middle"
                fill="#FFFFFF"
                fontSize="10"
                fontWeight="600"
                fontFamily="'JetBrains Mono', monospace"
              >
                {data[i].height}{heightSuffix}
              </text>
            )}
          </g>
        ))}

        {/* Time axis labels */}
        {data.map((d, i) => (
          <text
            key={i}
            x={PAD_X + i * xStep}
            y={H + 16}
            textAnchor="middle"
            fill="#94A3B8"
            fontSize="10"
            fontFamily="Inter, sans-serif"
          >
            {d.hour}
          </text>
        ))}
      </svg>

      {/* Peak swell badge */}
      <div
        className="flex items-center gap-2 px-3 py-2 rounded-xl"
        style={{
          background: 'rgba(0, 245, 255, 0.07)',
          border: '1px solid rgba(0, 245, 255, 0.18)',
        }}
      >
        <span
          className="font-mono text-sm font-semibold"
          style={{ color: '#00F5FF' }}
        >
          {peakSwell}
        </span>
        <span className="text-xs" style={{ color: '#94A3B8' }}>
          Peak Swell
        </span>
      </div>
    </div>
  )
}
