import { Suspense } from 'react'
import type { ReactNode } from 'react'
import VibeGauge from '@/components/VibeGauge'
import ForecastChart from '@/components/ForecastChart'
import AIBriefing from '@/components/AIBriefing'
import Logo from '@/components/ui/logo'
import { getSurfData } from '@/lib/stormglass'
import { generateBriefing } from '@/lib/briefing'
import { DEFAULT_SPOT } from '@/lib/spots'

// Caching is handled by 'use cache' + cacheLife('hours') inside getSurfData().
// With dynamicIO: true, this page is rendered dynamically per-request while
// the underlying data call is served from the Next.js Data Cache.

// ---------------------------------------------------------------------------
// Skeleton fallbacks for client component Suspense boundaries
// ---------------------------------------------------------------------------
function GaugeSkeleton() {
  return (
    <div className="flex flex-col items-center py-2">
      <div
        className="rounded-full animate-pulse"
        style={{ width: 200, height: 200, background: 'rgba(255,255,255,0.05)' }}
      />
    </div>
  )
}

function ChartSkeleton() {
  return (
    <div
      className="h-24 rounded-xl animate-pulse"
      style={{ background: 'rgba(255,255,255,0.05)' }}
    />
  )
}

// ---------------------------------------------------------------------------
// Shared glass-card (RSC, module-level — never remounts)
// ---------------------------------------------------------------------------
function GlassCard({ children, className = '' }: { children: ReactNode; className?: string }) {
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

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <GlassCard className="p-4">
      <p className="text-xs mb-1" style={{ color: '#94A3B8' }}>{label}</p>
      <p
        className="text-xl font-bold tracking-tight"
        style={{ color: '#FFFFFF', fontFamily: "'JetBrains Mono', monospace" }}
      >
        {value}
      </p>
    </GlassCard>
  )
}

function ConditionCard({
  icon, label, primary, secondary,
}: {
  icon: ReactNode; label: string; primary: string; secondary: string
}) {
  return (
    <GlassCard className="p-4">
      <div className="flex items-center gap-2 mb-2">
        <span style={{ color: '#00F5FF' }}>{icon}</span>
        <span className="text-xs" style={{ color: '#94A3B8' }}>{label}</span>
      </div>
      <p
        className="text-lg font-bold"
        style={{ color: '#FFFFFF', fontFamily: "'JetBrains Mono', monospace" }}
      >
        {primary}
      </p>
      <p className="text-xs mt-0.5" style={{ color: '#94A3B8' }}>{secondary}</p>
    </GlassCard>
  )
}

// Inline SVG icons — no heavy library needed
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
// Page — async RSC. data fetched server-side, minimal props to client leaves.
// ---------------------------------------------------------------------------
export default async function HomePage() {
  const data = await getSurfData(DEFAULT_SPOT)
  // generateBriefing runs in parallel with the page render — cached for 1 h.
  // Falls back to data.boardPick if OPENAI_API_KEY is not set.
  const briefingText = await generateBriefing(data, DEFAULT_SPOT)

  return (
    <div className="min-h-screen font-sans" style={{ background: '#0A192F' }}>
      <div className="mx-auto max-w-md px-4 pb-16">

        {/* ── App Header ───────────────────────────────────── */}
        <header className="flex items-center justify-between py-5">
          <Logo />
          <div className="flex items-center gap-1.5 text-sm" style={{ color: '#94A3B8' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
            </svg>
            <span>{data.location}</span>
          </div>
        </header>

        {/* ── Vibe Score ───────────────────────────────────── */}
        <GlassCard className="p-6 mb-4">
          <Suspense fallback={<GaugeSkeleton />}>
            <VibeGauge score={data.vibeScore} />
          </Suspense>
          <p className="mt-4 text-center text-sm leading-6" style={{ color: '#94A3B8' }}>
            {data.description}
          </p>
        </GlassCard>

        {/* ── Wave Stats ───────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <StatCard label="Height" value={data.waveHeight} />
          <StatCard label="Period" value={data.period} />
        </div>

        {/* ── 12-Hour Forecast ─────────────────────────────── */}
        <GlassCard className="p-5 mb-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold" style={{ color: '#FFFFFF' }}>
              12-Hour Forecast
            </h2>
            <span className="text-xs font-mono" style={{ color: '#94A3B8' }}>Primary</span>
          </div>
          <Suspense fallback={<ChartSkeleton />}>
            <ForecastChart data={data.forecast} peakSwell={data.peakSwell} />
          </Suspense>
        </GlassCard>

        {/* ── Conditions ───────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <ConditionCard
            icon={<WindIcon />}
            label="Wind"
            primary={data.wind.speed}
            secondary={data.wind.direction}
          />
          <ConditionCard
            icon={<TideIcon />}
            label="Tide"
            primary={data.tide.label}
            secondary={data.tide.time}
          />
          <div className="col-span-2">
            <ConditionCard
              icon={<TempIcon />}
              label="Water Temp"
              primary={data.waterTemp.temp}
              secondary={data.waterTemp.gear}
            />
          </div>
        </div>

        {/* ── AI Board Pick ────────────────────────────────── */}
        <section
          className="rounded-2xl p-5"
          style={{
            background: 'linear-gradient(135deg, rgba(0,245,255,0.05) 0%, rgba(125,38,205,0.05) 100%)',
            border: '1px solid rgba(0, 245, 255, 0.2)',
          }}
        >
          <div className="flex gap-3">
            <span className="text-xl flex-shrink-0" aria-hidden>⚡</span>
            <div className="min-w-0 flex-1">
              <p
                className="text-xs font-semibold mb-2 tracking-widest"
                style={{ color: '#00F5FF' }}
              >
                AI BOARD PICK
              </p>
              <Suspense fallback={
                <div className="space-y-2">
                  <div className="h-3.5 rounded animate-pulse" style={{ background: 'rgba(255,255,255,0.08)', width: '90%' }} />
                  <div className="h-3.5 rounded animate-pulse" style={{ background: 'rgba(255,255,255,0.06)', width: '70%' }} />
                </div>
              }>
                <AIBriefing
                  initialText={briefingText}
                  data={data}
                  spot={DEFAULT_SPOT}
                />
              </Suspense>
            </div>
          </div>
        </section>

      </div>
    </div>
  )
}
