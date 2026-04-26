import type { SurfData } from '@/lib/stormglass'

// ---------------------------------------------------------------------------
// WeekStrip — RSC (no 'use client').
// 7-day forecast cards with a Vibe Score bar and max wave height.
// Pure HTML/CSS — zero client JavaScript.
// ---------------------------------------------------------------------------

function scoreColor(score: number): string {
  if (score >= 80) return '#00F5FF'
  if (score >= 60) return '#7DD3D8'
  if (score >= 40) return '#7D9BB5'
  return '#475569'
}

interface Props {
  weekForecast: SurfData['weekForecast']
}

export default function WeekStrip({ weekForecast }: Props) {
  const maxScore = Math.max(...weekForecast.map((d) => d.vibeScore), 1)

  return (
    <div
      className="flex gap-2 overflow-x-auto pb-1"
      style={{ scrollbarWidth: 'none' }}
      aria-label="7-day surf forecast"
    >
      {weekForecast.map((day, i) => {
        const barPct = Math.round((day.vibeScore / maxScore) * 100)
        const color  = scoreColor(day.vibeScore)
        const isToday = i === 0

        return (
          <div
            key={day.date + i}
            className="flex flex-col items-center flex-shrink-0 rounded-xl pt-3 pb-2 px-3 gap-1 transition-colors"
            style={{
              width: 64,
              background: isToday
                ? 'rgba(0,245,255,0.08)'
                : 'rgba(255,255,255,0.04)',
              border: `1px solid ${isToday ? 'rgba(0,245,255,0.25)' : 'rgba(255,255,255,0.07)'}`,
            }}
          >
            {/* Day label */}
            <span
              className="text-xs font-semibold uppercase tracking-wider"
              style={{ color: isToday ? '#00F5FF' : '#94A3B8' }}
            >
              {isToday ? 'Today' : day.date}
            </span>

            {/* Score bar */}
            <div
              className="w-4 rounded-full overflow-hidden relative"
              style={{ height: 48, background: 'rgba(255,255,255,0.06)' }}
              title={`Vibe Score: ${day.vibeScore}`}
            >
              <div
                className="absolute bottom-0 left-0 right-0 rounded-full transition-all"
                style={{
                  height: `${barPct}%`,
                  background: color,
                  boxShadow: isToday ? `0 0 6px ${color}80` : 'none',
                }}
              />
            </div>

            {/* Score number */}
            <span
              className="text-xs font-bold"
              style={{ color, fontFamily: "'JetBrains Mono', monospace" }}
            >
              {day.vibeScore}
            </span>

            {/* Max wave height */}
            <span className="text-xs" style={{ color: '#64748B' }}>
              {day.maxHeightLabel}
            </span>
          </div>
        )
      })}
    </div>
  )
}
