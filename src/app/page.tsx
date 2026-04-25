import { Suspense } from 'react'
import type { ReactNode } from 'react'
import VibeGauge from '@/components/VibeGauge'
import ForecastChart from '@/components/ForecastChart'

// ---------------------------------------------------------------------------
// Mock surf data — swap for parallel Stormglass API calls in production
// (Promise.all over waveHeight, weather, tides endpoints)
// ---------------------------------------------------------------------------
const SURF_DATA = {
  location: 'Lower Trestles',
  vibeScore: 88,
  description:
    'Glassy morning conditions with a building swell—perfect for a high-performance shortboard session.',
  waveHeight: '3–4 ft',
  period: '12 s',
  peakSwell: '4.2ft @ 12s',
  wind: { speed: '5 mph', direction: 'Offshore' },
  tide: { label: 'High', time: '10:45 AM' },
  waterTemp: { temp: '64°F', gear: 'Wetsuit' },
  boardPick: 'Take the Fish – the waves are soft and fat.',
  forecast: [
    { hour: 'Now', height: 3.5 },
    { hour: '3h', height: 4.2 },
    { hour: '6h', height: 4.8 },
    { hour: '9h', height: 3.9 },
    { hour: '12h', height: 3.1 },
  ],
}

// ---------------------------------------------------------------------------
// Skeleton fallbacks — shown while client JS bundles hydrate
// ---------------------------------------------------------------------------
function GaugeSkeleton() {
  return (
    <div className="flex flex-col items-center gap-3 py-2">
      <div
        className="rounded-full"
        style={{
          width: 200,
          height: 200,
          background: 'rgba(255,255,255,0.05)',
          animation: 'pulse 1.5s ease-in-out infinite',
        }}
      />
    </div>
  )
}

function ChartSkeleton() {
  return (
    <div
      className="h-24 rounded-xl"
      style={{
        background: 'rgba(255,255,255,0.05)',
        animation: 'pulse 1.5s ease-in-out infinite',
      }}
    />
  )
}

// ---------------------------------------------------------------------------
// Shared glass-card wrapper (RSC, module-level — never remounts)
// ---------------------------------------------------------------------------
function GlassCard({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={`rounded-2xl ${className}`}
      style={{
        background: 'rgba(16, 33, 62, 0.7)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
      }}
    >
      {children}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Stat card — wave height / period quick-glance chips
// ---------------------------------------------------------------------------
function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <GlassCard className="p-4">
      <p className="text-xs mb-1" style={{ color: '#94A3B8' }}>
        {label}
      </p>
      <p
        className="text-xl font-bold tracking-tight"
        style={{ color: '#FFFFFF', fontFamily: "'JetBrains Mono', monospace" }}
      >
        {value}
      </p>
    </GlassCard>
  )
}

// ---------------------------------------------------------------------------
// Condition card — wind / tide / water temp
// ---------------------------------------------------------------------------
function ConditionCard({
  icon,
  label,
  primary,
  secondary,
}: {
  icon: ReactNode
  label: string
  primary: string
  secondary: string
}) {
  return (
    <GlassCard className="p-4">
      <div className="flex items-center gap-2 mb-2">
        <span style={{ color: '#00F5FF' }}>{icon}</span>
        <span className="text-xs" style={{ color: '#94A3B8' }}>
          {label}
        </span>
      </div>
      <p
        className="text-lg font-bold"
        style={{ color: '#FFFFFF', fontFamily: "'JetBrains Mono', monospace" }}
      >
        {primary}
      </p>
      <p className="text-xs mt-0.5" style={{ color: '#94A3B8' }}>
        {secondary}
      </p>
    </GlassCard>
  )
}

// ---------------------------------------------------------------------------
// Inline SVG icons (no heavy icon library — follows bundle optimization rule)
// ---------------------------------------------------------------------------
function WindIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
      <path d="M9.59 4.59A2 2 0 1 1 11 8H2" />
      <path d="M10.59 19.41A2 2 0 1 0 14 16H2" />
      <path d="M15.73 7.73A2.5 2.5 0 1 1 19.5 12H2" />
    </svg>
  )
}

function TideIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v12" />
      <path d="M6 9l6-6 6 6" />
      <path d="M4 19c1.5-1 2.5-1 4 0s2.5 1 4 0 2.5-1 4 0" />
    </svg>
  )
}

function TempIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
      <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z" />
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Page (RSC) — layout only, data passed as props to leaf client components
// ---------------------------------------------------------------------------
export default function HomePage() {
  return (
    <div className="min-h-screen font-sans" style={{ background: '#0A192F' }}>
      <div className="mx-auto max-w-md px-4 pb-16">

        {/* ── App Header ───────────────────────────────────────── */}
        <header className="flex items-center justify-between py-5">
          <div className="flex items-center gap-2">
            <span className="text-2xl" aria-hidden>🌊</span>
            <span className="text-lg font-bold tracking-tight" style={{ color: '#FFFFFF' }}>
              SwellSense
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-sm" style={{ color: '#94A3B8' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
            </svg>
            <span>{SURF_DATA.location}</span>
          </div>
        </header>

        {/* ── Vibe Score ───────────────────────────────────────── */}
        <GlassCard className="p-6 mb-4">
          <Suspense fallback={<GaugeSkeleton />}>
            <VibeGauge score={SURF_DATA.vibeScore} />
          </Suspense>
          <p
            className="mt-4 text-center text-sm leading-6"
            style={{ color: '#94A3B8' }}
          >
            {SURF_DATA.description}
          </p>
        </GlassCard>

        {/* ── Wave Stats ───────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <StatCard label="Height" value={SURF_DATA.waveHeight} />
          <StatCard label="Period" value={SURF_DATA.period} />
        </div>

        {/* ── 12-Hour Forecast ─────────────────────────────────── */}
        <GlassCard className="p-5 mb-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold" style={{ color: '#FFFFFF' }}>
              12-Hour Forecast
            </h2>
            <span className="text-xs font-mono" style={{ color: '#94A3B8' }}>
              Primary
            </span>
          </div>
          <Suspense fallback={<ChartSkeleton />}>
            <ForecastChart
              data={SURF_DATA.forecast}
              peakSwell={SURF_DATA.peakSwell}
            />
          </Suspense>
        </GlassCard>

        {/* ── Conditions ───────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <ConditionCard
            icon={<WindIcon />}
            label="Wind"
            primary={SURF_DATA.wind.speed}
            secondary={SURF_DATA.wind.direction}
          />
          <ConditionCard
            icon={<TideIcon />}
            label="Tide"
            primary={SURF_DATA.tide.label}
            secondary={SURF_DATA.tide.time}
          />
          <div className="col-span-2">
            <ConditionCard
              icon={<TempIcon />}
              label="Water Temp"
              primary={SURF_DATA.waterTemp.temp}
              secondary={SURF_DATA.waterTemp.gear}
            />
          </div>
        </div>

        {/* ── AI Board Pick ────────────────────────────────────── */}
        <section
          className="rounded-2xl p-5"
          style={{
            background:
              'linear-gradient(135deg, rgba(0,245,255,0.05) 0%, rgba(125,38,205,0.05) 100%)',
            border: '1px solid rgba(0, 245, 255, 0.2)',
          }}
        >
          <div className="flex gap-3">
            <span className="text-xl flex-shrink-0" aria-hidden>⚡</span>
            <div>
              <p
                className="text-xs font-semibold mb-1 tracking-widest"
                style={{ color: '#00F5FF' }}
              >
                AI BOARD PICK
              </p>
              <p className="text-sm leading-relaxed" style={{ color: '#FFFFFF' }}>
                {SURF_DATA.boardPick}
              </p>
            </div>
          </div>
        </section>

      </div>
    </div>
  )
}
