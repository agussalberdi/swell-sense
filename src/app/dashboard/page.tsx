import { Suspense } from 'react'
import type { ReactNode } from 'react'
import Link from 'next/link'
import { cookies } from 'next/headers'
import VibeGauge from '@/components/VibeGauge'
import ForecastChart from '@/components/ForecastChart'
import AIBriefing from '@/components/AIBriefing'
import Logo from '@/components/ui/logo'
import SpotSelector from '@/components/SpotSelector'
import UnitToggle from '@/components/UnitToggle'
import WeekStrip from '@/components/WeekStrip'
import TidalChart from '@/components/TidalChart'
import WindRose from '@/components/WindRose'
import AuthButton from '@/components/AuthButton'
import DashboardNav from '@/components/DashboardNav'
import { getSurfData } from '@/lib/stormglass'
import { generateBriefing } from '@/lib/briefing'
import { resolveSpot } from '@/lib/spots'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { profiles } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { UNITS_COOKIE, resolveUnitSystem } from '@/lib/units'

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
// Page — async RSC. Spot resolved from URL searchParams.
// ---------------------------------------------------------------------------
export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string; lat?: string; lng?: string; name?: string }>
}) {
  const params = await searchParams
  const spot = resolveSpot(params)

  const session     = await auth()
  const cookieStore = await cookies()
  const profile     = session?.user?.id
    ? await db.query.profiles.findFirst({ where: eq(profiles.userId, session.user.id) }) ?? null
    : null
  const unitSystem  = resolveUnitSystem(profile, cookieStore.get(UNITS_COOKIE)?.value)
  const data        = await getSurfData(spot, unitSystem)

  // generateBriefing is cached for 1 h; falls back to data.boardPick without an OpenAI key.
  const briefingText = await generateBriefing(data, spot, profile ?? undefined)

  return (
    <div className="min-h-screen font-sans" style={{ background: '#0A192F' }}>
      {/* Bottom tab bar — mobile only, outside scroll container */}
      <DashboardNav variant="bottom" />

      <div className="mx-auto max-w-md md:max-w-2xl lg:max-w-5xl px-4 pb-28 md:pb-10">

        {/* ── App Header ───────────────────────────────────── */}
        <header className="flex items-center justify-between py-5">
          <Link href="/" aria-label="SwellSense home">
            <Logo />
          </Link>
          {/* Top nav — tablet + desktop only */}
          <DashboardNav variant="top" />
          <div className="flex items-center gap-2">
            <UnitToggle value={unitSystem} />
            <Suspense fallback={
              <div className="h-7 w-36 rounded-full animate-pulse" style={{ background: 'rgba(255,255,255,0.06)' }} />
            }>
              <SpotSelector />
            </Suspense>
            <AuthButton />
          </div>
        </header>

        {/* ── Active location badge ─────────────────────────── */}
        <div className="flex items-center gap-1.5 text-sm mb-4" style={{ color: '#94A3B8' }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
          </svg>
          <span style={{ color: '#FFFFFF' }}>{data.location}</span>
        </div>

        {/* ── Vibe Score + Stats ────────────────────────────── */}
        {/*
          Mobile:  Gauge centred, description below, stats in separate 2-col row.
          md+:     Gauge + description on the left, Height/Period stack on the right
                   inside the same card — matching the Figma tablet/desktop design.
        */}
        <GlassCard className="p-6 mb-4">
          <div className="md:flex md:items-center md:gap-8">
            {/* Left: gauge + description */}
            <div className="flex-1 min-w-0">
              <Suspense fallback={<GaugeSkeleton />}>
                <VibeGauge score={data.vibeScore} />
              </Suspense>
              <p className="mt-4 text-center text-sm leading-6" style={{ color: '#94A3B8' }}>
                {data.description}
              </p>
            </div>

            {/* Right: stats — inline on md+, hidden on mobile (shown as separate cards below) */}
            <div
              className="hidden md:flex flex-col gap-4 flex-shrink-0"
              style={{ minWidth: 120 }}
            >
              {[
                { label: 'HEIGHT',  value: data.waveHeight },
                { label: 'PERIOD',  value: data.period },
              ].map(({ label, value }) => (
                <div key={label} className="text-right">
                  <p
                    className="text-2xl font-bold"
                    style={{ color: '#00F5FF', fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    {value}
                  </p>
                  <p className="text-xs font-semibold mt-0.5" style={{ color: '#64748B', letterSpacing: '0.08em' }}>
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </GlassCard>

        {/* ── Wave Stats — mobile only (hidden on md+) ─────── */}
        <div className="grid grid-cols-2 gap-3 mb-4 md:hidden">
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
            <ForecastChart
              data={data.forecast}
              peakSwell={data.peakSwell}
              unitSystem={unitSystem}
            />
          </Suspense>
        </GlassCard>

        {/* ── Conditions ───────────────────────────────────── */}
        {/* Mobile: 2-col grid, Water Temp spans full width.
            md+:   3-col grid, all cards equal width. */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
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
          <div className="col-span-2 md:col-span-1">
            <ConditionCard
              icon={<TempIcon />}
              label="Water Temp"
              primary={data.waterTemp.temp}
              secondary={data.waterTemp.gear}
            />
          </div>
        </div>

        {/* ── 7-Day Forecast ───────────────────────────────── */}
        <GlassCard className="p-5 mb-4">
          <h2 className="text-sm font-semibold mb-3" style={{ color: '#FFFFFF' }}>
            7-Day Outlook
          </h2>
          <WeekStrip weekForecast={data.weekForecast} />
        </GlassCard>

        {/* ── Tidal Chart ───────────────────────────────────── */}
        <GlassCard className="p-5 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold" style={{ color: '#FFFFFF' }}>
              Tidal Curve
            </h2>
            <span className="text-xs font-mono" style={{ color: '#94A3B8' }}>24 h</span>
          </div>
          <Suspense fallback={<ChartSkeleton />}>
            <TidalChart tidalCurve={data.tidalCurve} unitSystem={unitSystem} />
          </Suspense>
        </GlassCard>

        {/* ── Wind Rose + Swell Window ─────────────────────── */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {/* Wind Rose */}
          <GlassCard className="p-4 flex flex-col items-center">
            <p className="text-xs font-semibold mb-3 w-full" style={{ color: '#94A3B8' }}>
              Wind Distribution
            </p>
            <Suspense fallback={
              <div className="w-20 h-20 rounded-full animate-pulse" style={{ background: 'rgba(255,255,255,0.06)' }} />
            }>
              <WindRose
                windRoseData={data.windRoseData}
                facingDeg={spot.facingDeg}
                unitSystem={unitSystem}
              />
            </Suspense>
          </GlassCard>

          {/* Swell Window */}
          <GlassCard className="p-4 flex flex-col justify-between">
            <p className="text-xs font-semibold mb-2" style={{ color: '#94A3B8' }}>
              Peak Window
            </p>
            {data.swellWindow ? (
              <>
                <div
                  className="rounded-lg p-3 text-center mb-2"
                  style={{ background: 'rgba(0,245,255,0.08)', border: '1px solid rgba(0,245,255,0.2)' }}
                >
                  <p className="text-xs font-mono mb-0.5" style={{ color: '#00F5FF' }}>
                    {data.swellWindow.startHour}
                  </p>
                  <p className="text-xs" style={{ color: '#64748B' }}>—</p>
                  <p className="text-xs font-mono" style={{ color: '#00F5FF' }}>
                    {data.swellWindow.endHour}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs" style={{ color: '#64748B' }}>Score</span>
                  <span
                    className="text-lg font-bold"
                    style={{ color: '#00F5FF', fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    {data.swellWindow.score}
                  </span>
                </div>
              </>
            ) : (
              <p className="text-xs" style={{ color: '#64748B' }}>No data</p>
            )}
          </GlassCard>
        </div>

        {/* ── AI Board Pick ────────────────────────────────── */}
        <section
          id="ai-pick"
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
                  spot={spot}
                />
              </Suspense>
            </div>
          </div>
        </section>

      </div>
    </div>
  )
}
