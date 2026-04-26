// Route-level loading skeleton for /dashboard — mirrors the exact layout.

function Bone({ className = '' }: { className?: string }) {
  return (
    <div
      className={`rounded-xl animate-pulse ${className}`}
      style={{ background: 'rgba(255, 255, 255, 0.06)' }}
    />
  )
}

function GlassCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-2xl ${className}`}
      style={{
        background: 'rgba(16, 33, 62, 0.7)',
        border: '1px solid rgba(255, 255, 255, 0.07)',
      }}
    >
      {children}
    </div>
  )
}

export default function Loading() {
  return (
    <div className="min-h-screen font-sans" style={{ background: '#0A192F' }}>
      <div className="mx-auto max-w-md md:max-w-2xl lg:max-w-5xl px-4 pb-28 md:pb-10">

        {/* ── Header (logo + nav + spot selector + auth) ── */}
        <div className="flex items-center justify-between gap-2 py-5">
          <Bone className="h-6 w-32 flex-shrink-0" />
          <div className="hidden md:block flex-1 max-w-sm mx-2 h-4 rounded" />
          <div className="flex items-center gap-2">
            <Bone className="h-8 w-36 rounded-full" />
            <Bone className="h-8 w-8 rounded-full" />
          </div>
        </div>

        {/* ── Location badge ───────────────────────────────── */}
        <Bone className="h-4 w-36 mb-4" />

        {/* ── Vibe Score card ──────────────────────────────── */}
        <GlassCard className="p-6 mb-4 flex flex-col items-center gap-4">
          <div
            className="rounded-full animate-pulse"
            style={{ width: 200, height: 200, background: 'rgba(255,255,255,0.06)' }}
          />
          <div className="w-full space-y-2 px-2">
            <Bone className="h-3 w-full" />
            <Bone className="h-3 w-4/5 mx-auto" />
          </div>
        </GlassCard>

        {/* ── Wave stats ───────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <GlassCard className="p-4 space-y-2">
            <Bone className="h-3 w-12" />
            <Bone className="h-6 w-20" />
          </GlassCard>
          <GlassCard className="p-4 space-y-2">
            <Bone className="h-3 w-12" />
            <Bone className="h-6 w-16" />
          </GlassCard>
        </div>

        {/* ── Forecast card ────────────────────────────────── */}
        <GlassCard className="p-5 mb-4 space-y-4">
          <div className="flex justify-between">
            <Bone className="h-4 w-36" />
            <Bone className="h-4 w-16" />
          </div>
          <Bone className="h-20 w-full" />
          <Bone className="h-9 w-full" />
        </GlassCard>

        {/* ── Conditions grid (matches responsive 2→3 col) ── */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
          {[1, 2].map((i) => (
            <GlassCard key={i} className="p-4 space-y-2">
              <Bone className="h-3 w-16" />
              <Bone className="h-6 w-20" />
              <Bone className="h-3 w-14" />
            </GlassCard>
          ))}
          <div className="col-span-2 md:col-span-1">
            <GlassCard className="p-4 space-y-2">
              <Bone className="h-3 w-20" />
              <Bone className="h-6 w-16" />
              <Bone className="h-3 w-12" />
            </GlassCard>
          </div>
        </div>

        {/* ── 7-Day Outlook ────────────────────────────────── */}
        <GlassCard className="p-5 mb-4 space-y-3">
          <Bone className="h-4 w-28" />
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <div key={i} className="flex flex-col items-center gap-1.5 flex-shrink-0" style={{ width: 64 }}>
                <Bone className="h-3 w-10" />
                <Bone className="h-12 w-4 rounded-full" />
                <Bone className="h-3 w-6" />
                <Bone className="h-3 w-8" />
              </div>
            ))}
          </div>
        </GlassCard>

        {/* ── Tidal Curve ───────────────────────────────────── */}
        <GlassCard className="p-5 mb-4 space-y-3">
          <div className="flex justify-between">
            <Bone className="h-4 w-28" />
            <Bone className="h-4 w-8" />
          </div>
          <Bone className="h-24 w-full" />
        </GlassCard>

        {/* ── Wind Rose + Peak Window ───────────────────────── */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <GlassCard className="p-4 flex flex-col items-center gap-3">
            <Bone className="h-3 w-full" />
            <div
              className="rounded-full animate-pulse"
              style={{ width: 100, height: 100, background: 'rgba(255,255,255,0.06)' }}
            />
          </GlassCard>
          <GlassCard className="p-4 space-y-3">
            <Bone className="h-3 w-20" />
            <Bone className="h-20 w-full rounded-lg" />
            <div className="flex justify-between">
              <Bone className="h-3 w-10" />
              <Bone className="h-6 w-8" />
            </div>
          </GlassCard>
        </div>

        {/* ── AI board pick ────────────────────────────────── */}
        <div
          className="rounded-2xl p-5 space-y-2"
          style={{ border: '1px solid rgba(0,245,255,0.1)', background: 'rgba(0,245,255,0.03)' }}
        >
          <Bone className="h-3 w-24" />
          <Bone className="h-4 w-full" />
          <Bone className="h-4 w-3/4" />
        </div>

      </div>
    </div>
  )
}
