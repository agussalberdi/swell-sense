'use client'

// SVG math constants for a 270° arc starting at 135° (bottom-left → top → bottom-right)
const CX = 120
const CY = 130
const R = 90
const START_ANGLE = 135
const SWEEP = 270
const TRACK_LENGTH = (SWEEP / 360) * 2 * Math.PI * R // ≈ 424.12

function toRad(deg: number) {
  return (deg * Math.PI) / 180
}

function buildArc(cx: number, cy: number, r: number, startDeg: number, endDeg: number): string {
  const sx = cx + r * Math.cos(toRad(startDeg))
  const sy = cy + r * Math.sin(toRad(startDeg))
  const ex = cx + r * Math.cos(toRad(endDeg))
  const ey = cy + r * Math.sin(toRad(endDeg))
  const large = endDeg - startDeg > 180 ? 1 : 0
  return `M ${sx.toFixed(2)} ${sy.toFixed(2)} A ${r} ${r} 0 ${large} 1 ${ex.toFixed(2)} ${ey.toFixed(2)}`
}

// Single shared path for both track and animated score arc (dashoffset does the clipping)
const TRACK_PATH = buildArc(CX, CY, R, START_ANGLE, START_ANGLE + SWEEP)

// Gradient endpoints match the track start/end coordinates
const GRAD_X1 = (CX + R * Math.cos(toRad(START_ANGLE))).toFixed(2)          // ≈ 56.36
const GRAD_Y1 = (CY + R * Math.sin(toRad(START_ANGLE))).toFixed(2)          // ≈ 193.64
const GRAD_X2 = (CX + R * Math.cos(toRad(START_ANGLE + SWEEP))).toFixed(2)  // ≈ 183.64
const GRAD_Y2 = (CY + R * Math.sin(toRad(START_ANGLE + SWEEP))).toFixed(2)  // ≈ 193.64

function scoreLabel(score: number): string {
  if (score >= 85) return 'Epic'
  if (score >= 70) return 'Good'
  if (score >= 50) return 'Fair'
  if (score >= 30) return 'Poor'
  return 'Flat'
}

interface VibeGaugeProps {
  score: number
}

export default function VibeGauge({ score }: VibeGaugeProps) {
  const clamped = Math.max(0, Math.min(100, score))
  const dashOffset = TRACK_LENGTH * (1 - clamped / 100)
  const label = scoreLabel(clamped)

  return (
    <div className="flex flex-col items-center">
      {/* Wrapper div animated — not the SVG element (hardware acceleration) */}
      <div
        style={{
          animation: 'fade-up 0.5s ease-out forwards',
        }}
      >
        <svg
          viewBox="0 0 240 200"
          width="240"
          height="200"
          aria-label={`Vibe Score: ${score} out of 100, ${label} conditions`}
          role="img"
        >
          <defs>
            {/* Gradient follows the arc spatially: purple start → gold mid → cyan end */}
            <linearGradient
              id="gaugeGrad"
              x1={GRAD_X1}
              y1={GRAD_Y1}
              x2={GRAD_X2}
              y2={GRAD_Y2}
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor="#7D26CD" />
              <stop offset="42%" stopColor="#FFB800" />
              <stop offset="100%" stopColor="#00F5FF" />
            </linearGradient>

            {/* Cyan glow on the score arc */}
            <filter id="arcGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Track (glass-tinted background arc) */}
          <path
            d={TRACK_PATH}
            fill="none"
            stroke="rgba(255,255,255,0.07)"
            strokeWidth="14"
            strokeLinecap="round"
          />

          {/* Score arc — stroke-dashoffset animation reveals from the start */}
          <path
            d={TRACK_PATH}
            fill="none"
            stroke="url(#gaugeGrad)"
            strokeWidth="14"
            strokeLinecap="round"
            filter="url(#arcGlow)"
            style={{
              strokeDasharray: TRACK_LENGTH,
              strokeDashoffset: TRACK_LENGTH, // starts fully hidden
              '--gauge-target-offset': `${dashOffset}`,
              animationName: 'gauge-draw',
              animationDuration: '1.6s',
              animationTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
              animationDelay: '0.2s',
              animationFillMode: 'forwards',
            } as React.CSSProperties}
          />

          {/* Score number */}
          <text
            x={CX}
            y={CY - 8}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#FFFFFF"
            fontSize="54"
            fontWeight="700"
            fontFamily="Inter, sans-serif"
            style={{ letterSpacing: '-0.02em' }}
          >
            {score}
          </text>

          {/* "VIBE SCORE" label */}
          <text
            x={CX}
            y={CY + 28}
            textAnchor="middle"
            fill="#00F5FF"
            fontSize="10"
            fontWeight="600"
            fontFamily="Inter, sans-serif"
            style={{ letterSpacing: '0.16em' }}
          >
            VIBE SCORE
          </text>
        </svg>
      </div>

      {/* Condition label outside SVG — easier to style */}
      <span
        className="text-lg font-bold tracking-widest uppercase"
        style={{ color: '#00F5FF', letterSpacing: '0.18em' }}
      >
        {label}
      </span>
    </div>
  )
}
