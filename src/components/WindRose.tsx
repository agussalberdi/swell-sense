'use client'

import type { SurfData } from '@/lib/stormglass'
import type { UnitSystem } from '@/lib/units'

// ---------------------------------------------------------------------------
// WindRose — SVG polar chart showing 24-h wind direction/speed distribution.
// 8 compass sectors; offshore sectors highlighted in neon cyan.
// ---------------------------------------------------------------------------

const SIZE   = 160
const CX     = SIZE / 2
const CY     = SIZE / 2
const MAX_R  = 60   // max bar radius
const MIN_R  = 16   // inner dead-zone radius

const DIRECTIONS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
const SECTOR_DEG = 360 / 8

// Convert polar (angle in deg, radius) → Cartesian
function polar(angleDeg: number, r: number): [number, number] {
  const rad = ((angleDeg - 90) * Math.PI) / 180
  return [CX + r * Math.cos(rad), CY + r * Math.sin(rad)]
}

// SVG arc path for a sector bar
function sectorPath(dirIdx: number, innerR: number, outerR: number): string {
  if (outerR <= innerR) outerR = innerR + 1
  const startAngle = dirIdx * SECTOR_DEG - SECTOR_DEG / 2
  const endAngle   = dirIdx * SECTOR_DEG + SECTOR_DEG / 2
  const [ix1, iy1] = polar(startAngle, innerR)
  const [ox1, oy1] = polar(startAngle, outerR)
  const [ox2, oy2] = polar(endAngle, outerR)
  const [ix2, iy2] = polar(endAngle, innerR)
  const largeArc = SECTOR_DEG > 180 ? 1 : 0
  return [
    `M ${ix1} ${iy1}`,
    `L ${ox1} ${oy1}`,
    `A ${outerR} ${outerR} 0 ${largeArc} 1 ${ox2} ${oy2}`,
    `L ${ix2} ${iy2}`,
    `A ${innerR} ${innerR} 0 ${largeArc} 0 ${ix1} ${iy1}`,
    'Z',
  ].join(' ')
}

function windSpeedFromMs(speedMs: number, unitSystem: UnitSystem): string {
  if (unitSystem === 'metric') return `${Math.round(speedMs * 3.6)} km/h`
  return `${Math.round(speedMs * 2.236936)} mph`
}

interface Props {
  windRoseData: SurfData['windRoseData']
  /** Beach facing direction (degrees) — used to identify offshore sectors. */
  facingDeg: number
  unitSystem: UnitSystem
}

export default function WindRose({ windRoseData, facingDeg, unitSystem }: Props) {
  // Aggregate: average speed per 45° sector
  const sectorSpeeds = Array<number>(8).fill(0)
  const sectorCounts = Array<number>(8).fill(0)
  for (const { direction, speed } of windRoseData) {
    const idx = Math.round(direction / SECTOR_DEG) % 8
    sectorSpeeds[idx] += speed
    sectorCounts[idx]++
  }
  const avgSpeeds = sectorSpeeds.map((sum, i) =>
    sectorCounts[i] > 0 ? sum / sectorCounts[i] : 0,
  )
  const maxSpeed = Math.max(...avgSpeeds, 0.1)

  // Offshore base direction: wind FROM land = facing + 180
  const offshoreBase = (facingDeg + 180) % 360

  function isOffshore(dirIdx: number): boolean {
    const dirDeg = dirIdx * SECTOR_DEG
    const diff = Math.abs(dirDeg - offshoreBase) % 360
    const angle = diff > 180 ? 360 - diff : diff
    return angle < 45
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <svg
        width={SIZE}
        height={SIZE}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        aria-label="Wind rose chart"
      >
        {/* Concentric guide rings */}
        {[0.33, 0.67, 1].map((frac) => (
          <circle
            key={frac}
            cx={CX}
            cy={CY}
            r={MIN_R + frac * (MAX_R - MIN_R)}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="0.5"
          />
        ))}

        {/* Cardinal spoke lines */}
        {DIRECTIONS.map((_, i) => {
          const [x, y] = polar(i * SECTOR_DEG, MAX_R + 4)
          return (
            <line
              key={i}
              x1={CX}
              y1={CY}
              x2={x}
              y2={y}
              stroke="rgba(255,255,255,0.05)"
              strokeWidth="0.5"
            />
          )
        })}

        {/* Sector bars */}
        {avgSpeeds.map((speed, i) => {
          if (speed === 0) return null
          const outerR = MIN_R + (speed / maxSpeed) * (MAX_R - MIN_R)
          const offshore = isOffshore(i)
          return (
            <path
              key={i}
              d={sectorPath(i, MIN_R, outerR)}
              fill={offshore ? 'rgba(0,245,255,0.55)' : 'rgba(148,163,184,0.25)'}
              stroke={offshore ? 'rgba(0,245,255,0.8)' : 'rgba(148,163,184,0.15)'}
              strokeWidth="0.5"
            />
          )
        })}

        {/* Center dot */}
        <circle cx={CX} cy={CY} r="3" fill="rgba(255,255,255,0.15)" />

        {/* Compass labels */}
        {DIRECTIONS.map((label, i) => {
          const [x, y] = polar(i * SECTOR_DEG, MAX_R + 12)
          return (
            <text
              key={label}
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize="8"
              fontWeight="600"
              fill={isOffshore(i) ? '#00F5FF' : '#64748B'}
              fontFamily="JetBrains Mono, monospace"
            >
              {label}
            </text>
          )
        })}
      </svg>

      {/* Legend */}
      <div className="flex flex-col items-center gap-1.5 text-xs" style={{ color: '#64748B' }}>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span
              className="inline-block w-2.5 h-2.5 rounded-sm"
              style={{ background: 'rgba(0,245,255,0.55)' }}
            />
            Offshore
          </span>
          <span className="flex items-center gap-1.5">
            <span
              className="inline-block w-2.5 h-2.5 rounded-sm"
              style={{ background: 'rgba(148,163,184,0.25)' }}
            />
            Other
          </span>
        </div>
        <span className="font-mono text-[10px]" style={{ color: '#475569' }}>
          max {windSpeedFromMs(maxSpeed, unitSystem)}
        </span>
      </div>
    </div>
  )
}
