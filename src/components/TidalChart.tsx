'use client'

import { useState } from 'react'
import type { SurfData } from '@/lib/stormglass'

// ---------------------------------------------------------------------------
// TidalChart — SVG sea-level curve for the next 24 hours.
// Smooth cubic Bezier path, high/low extremes annotated, hover tooltips.
// ---------------------------------------------------------------------------

const W = 320
const H = 100
const PAD_L = 28
const PAD_R = 8
const PAD_T = 12
const PAD_B = 28

function toX(hour: number, total: number): number {
  return PAD_L + ((hour / (total - 1)) * (W - PAD_L - PAD_R))
}

function toY(height: number, min: number, max: number): number {
  const range = max - min || 1
  return PAD_T + (1 - (height - min) / range) * (H - PAD_T - PAD_B)
}

function buildPath(
  points: { hour: number; heightM: number }[],
  min: number,
  max: number,
  total: number,
): string {
  if (points.length < 2) return ''
  const pts = points.map((p) => ({ x: toX(p.hour, total), y: toY(p.heightM, min, max) }))
  let d = `M ${pts[0].x} ${pts[0].y}`
  for (let i = 1; i < pts.length; i++) {
    const prev = pts[i - 1]
    const curr = pts[i]
    const cpx = (prev.x + curr.x) / 2
    d += ` C ${cpx} ${prev.y} ${cpx} ${curr.y} ${curr.x} ${curr.y}`
  }
  return d
}

interface Props {
  tidalCurve: SurfData['tidalCurve']
}

export default function TidalChart({ tidalCurve }: Props) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null)

  if (!tidalCurve.length) return null

  const heights = tidalCurve.map((p) => p.heightM)
  const min = Math.min(...heights)
  const max = Math.max(...heights)
  const total = tidalCurve.length

  const linePath = buildPath(tidalCurve, min, max, total)

  // Area path (close below the chart)
  const areaPath =
    linePath +
    ` L ${toX(tidalCurve[tidalCurve.length - 1].hour, total)} ${H - PAD_B}` +
    ` L ${toX(tidalCurve[0].hour, total)} ${H - PAD_B} Z`

  // Find local maxima/minima (high/low tides)
  const extremes: { idx: number; type: 'high' | 'low' }[] = []
  for (let i = 1; i < tidalCurve.length - 1; i++) {
    const prev = tidalCurve[i - 1].heightM
    const curr = tidalCurve[i].heightM
    const next = tidalCurve[i + 1].heightM
    if (curr > prev && curr > next) extremes.push({ idx: i, type: 'high' })
    else if (curr < prev && curr < next) extremes.push({ idx: i, type: 'low' })
  }

  // Hour labels at 0, 6, 12, 18, 23
  const labelHours = [0, 6, 12, 18, 23]

  const hovered = hoverIdx !== null ? tidalCurve[hoverIdx] : null

  return (
    <div className="relative select-none">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        preserveAspectRatio="none"
        style={{ overflow: 'visible' }}
      >
        <defs>
          <linearGradient id="tidalGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#00F5FF" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#00F5FF" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Grid baseline */}
        <line
          x1={PAD_L} y1={H - PAD_B}
          x2={W - PAD_R} y2={H - PAD_B}
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="0.5"
        />

        {/* Area fill */}
        <path d={areaPath} fill="url(#tidalGrad)" />

        {/* Line */}
        <path
          d={linePath}
          fill="none"
          stroke="#00F5FF"
          strokeWidth="1.2"
          style={{ filter: 'drop-shadow(0 0 3px rgba(0,245,255,0.6))' }}
        />

        {/* High/Low annotations */}
        {extremes.map(({ idx, type }) => {
          const p = tidalCurve[idx]
          const x = toX(p.hour, total)
          const y = toY(p.heightM, min, max)
          const isHigh = type === 'high'
          return (
            <g key={idx}>
              <circle
                cx={x}
                cy={y}
                r="2.5"
                fill={isHigh ? '#00F5FF' : '#7D26CD'}
                stroke="#0A192F"
                strokeWidth="1"
              />
              <text
                x={x}
                y={isHigh ? y - 6 : y + 13}
                textAnchor="middle"
                fontSize="7"
                fill={isHigh ? '#00F5FF' : '#94A3B8'}
                fontFamily="JetBrains Mono, monospace"
              >
                {p.heightM.toFixed(1)}m
              </text>
            </g>
          )
        })}

        {/* Hover points */}
        {tidalCurve.map((p, i) => (
          <rect
            key={i}
            x={toX(p.hour, total) - 6}
            y={PAD_T}
            width={12}
            height={H - PAD_T - PAD_B}
            fill="transparent"
            onMouseEnter={() => setHoverIdx(i)}
            onMouseLeave={() => setHoverIdx(null)}
          />
        ))}

        {hovered !== null && hoverIdx !== null && (
          <>
            <line
              x1={toX(hovered.hour, total)}
              y1={PAD_T}
              x2={toX(hovered.hour, total)}
              y2={H - PAD_B}
              stroke="rgba(0,245,255,0.3)"
              strokeWidth="0.8"
              strokeDasharray="2,2"
            />
            <circle
              cx={toX(hovered.hour, total)}
              cy={toY(hovered.heightM, min, max)}
              r="3"
              fill="#00F5FF"
              stroke="#0A192F"
              strokeWidth="1"
            />
          </>
        )}

        {/* Hour axis labels */}
        {labelHours.map((h) => {
          const pt = tidalCurve.find((p) => p.hour === h)
          if (!pt) return null
          return (
            <text
              key={h}
              x={toX(h, total)}
              y={H - PAD_B + 10}
              textAnchor="middle"
              fontSize="7.5"
              fill="#64748B"
              fontFamily="JetBrains Mono, monospace"
            >
              {h === 0 ? 'Now' : `${h}h`}
            </text>
          )
        })}

        {/* Y-axis label */}
        <text
          x={PAD_L - 4}
          y={PAD_T + (H - PAD_T - PAD_B) / 2}
          textAnchor="middle"
          fontSize="7"
          fill="#475569"
          transform={`rotate(-90, ${PAD_L - 14}, ${PAD_T + (H - PAD_T - PAD_B) / 2})`}
          fontFamily="JetBrains Mono, monospace"
        >
          m
        </text>
      </svg>

      {/* Tooltip */}
      {hovered !== null && (
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full pointer-events-none rounded-lg px-2 py-1 text-xs"
          style={{
            background: 'rgba(16,33,62,0.95)',
            border: '1px solid rgba(0,245,255,0.2)',
            color: '#FFFFFF',
            fontFamily: 'JetBrains Mono, monospace',
          }}
        >
          {hovered.hour === 0 ? 'Now' : `+${hovered.hour}h`} · {hovered.heightM.toFixed(2)}m
        </div>
      )}
    </div>
  )
}
