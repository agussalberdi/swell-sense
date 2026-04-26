import { Suspense } from 'react'
import Link from 'next/link'
import Logo from '@/components/ui/logo'
import WaveBackground from '@/components/launch/WaveBackground'
import EmailForm from '@/components/launch/EmailForm'

// ---------------------------------------------------------------------------
// Static dashboard SVG mockup — mirrors the real dashboard at ~15kb.
// Pure SVG, no images, zero network requests.
// ---------------------------------------------------------------------------
function DashboardMockup() {
  return (
    <div
      className="relative w-full max-w-xs mx-auto rounded-3xl overflow-hidden"
      style={{
        background: 'rgba(16, 33, 62, 0.85)',
        border: '1px solid rgba(255,255,255,0.12)',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 40px 80px rgba(0,0,0,0.5), 0 0 60px rgba(0,245,255,0.08)',
      }}
    >
      {/* Status bar */}
      <div
        className="flex items-center justify-between px-5 py-3"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="flex items-center gap-1.5">
          <svg width="14" height="14" viewBox="0 -960 960 960" fill="#00F5FF" aria-hidden>
            <path d="M80-146v-78q29 0 49.5-9t41.5-19.5q21-10.5 46.5-19t63-8.5q37.5 0 62 8.5t45.5 19q21 10.5 42 19.5t50 9q29 0 50-9t42-19.5q21-10.5 46-19t62.5-8.5q37.5 0 62.5 8.5t46 19q21 10.5 42 19.5t49 9v78q-38 0-63.5-9T770-174.5q-21-10.5-41-19t-49-8.5q-28 0-48.5 8.5t-41 19Q570-164 544.5-155t-64.5 9q-39 0-64.5-9t-46-19.5Q349-185 329-193.5t-48.5-8.5q-28.5 0-49 8.5t-41.5 19Q169-164 143.5-155T80-146Z" />
          </svg>
          <span className="text-xs font-black uppercase tracking-widest" style={{ color: '#00F5FF', letterSpacing: '0.12em', fontSize: 10 }}>SwellSense</span>
        </div>
        <span className="text-xs" style={{ color: '#94A3B8', fontSize: 10 }}>📍 Lower Trestles</span>
      </div>

      <div className="px-5 py-4 space-y-4">
        {/* Vibe Gauge */}
        <div
          className="rounded-2xl p-4 flex flex-col items-center"
          style={{ background: 'rgba(16,33,62,0.7)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <svg viewBox="0 0 200 140" width="160" height="112" aria-label="Vibe Score 82">
            <defs>
              <linearGradient id="mockGaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#7D26CD" />
                <stop offset="50%" stopColor="#00F5FF" />
                <stop offset="100%" stopColor="#00F5FF" />
              </linearGradient>
              <filter id="mockGlow">
                <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>
            {/* Background track */}
            <path
              d="M 30 130 A 70 70 0 1 1 170 130"
              fill="none"
              stroke="rgba(255,255,255,0.07)"
              strokeWidth="10"
              strokeLinecap="round"
            />
            {/* Score arc — 82/100 ≈ 82% of 270° = 221° */}
            <path
              d="M 30 130 A 70 70 0 1 1 170 130"
              fill="none"
              stroke="url(#mockGaugeGrad)"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray="307"
              strokeDashoffset="55"
              filter="url(#mockGlow)"
            />
            {/* Score label */}
            <text x="100" y="108" textAnchor="middle" fontSize="32" fontWeight="900" fill="#FFFFFF" fontFamily="Inter,sans-serif">82</text>
            <text x="100" y="124" textAnchor="middle" fontSize="9" fill="#00F5FF" fontFamily="Inter,sans-serif" letterSpacing="2">VIBE SCORE</text>
          </svg>
          <p className="text-center text-xs mt-1" style={{ color: '#94A3B8', fontSize: 10 }}>
            Clean 4–5ft, offshore winds, 13s period
          </p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 gap-2">
          {[['Height', '4–5 ft'], ['Period', '13 s']].map(([label, val]) => (
            <div
              key={label}
              className="rounded-xl p-3"
              style={{ background: 'rgba(16,33,62,0.7)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <p style={{ color: '#94A3B8', fontSize: 9 }}>{label}</p>
              <p style={{ color: '#FFFFFF', fontSize: 14, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}>{val}</p>
            </div>
          ))}
        </div>

        {/* Forecast mini chart */}
        <div
          className="rounded-xl p-3"
          style={{ background: 'rgba(16,33,62,0.7)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <p className="mb-2" style={{ color: '#FFFFFF', fontSize: 10, fontWeight: 600 }}>12-Hour Forecast</p>
          <svg viewBox="0 0 240 48" width="100%" height="48">
            <defs>
              <linearGradient id="mockChartGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00F5FF" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#00F5FF" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              d="M 10 38 C 40 28 70 20 100 24 C 130 28 160 16 190 12 L 190 48 L 10 48 Z"
              fill="url(#mockChartGrad)"
            />
            <path
              d="M 10 38 C 40 28 70 20 100 24 C 130 28 160 16 190 12"
              fill="none"
              stroke="#00F5FF"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            {[[10,38],[60,23],[110,24],[160,16],[190,12]].map(([x,y], i) => (
              <circle key={i} cx={x} cy={y} r="2.5" fill="#00F5FF" />
            ))}
          </svg>
          <div className="flex justify-between mt-1">
            {['Now','3h','6h','9h','12h'].map((t) => (
              <span key={t} style={{ color: '#94A3B8', fontSize: 8 }}>{t}</span>
            ))}
          </div>
        </div>

        {/* AI Board Pick teaser */}
        <div
          className="rounded-xl p-3"
          style={{
            background: 'linear-gradient(135deg, rgba(0,245,255,0.06) 0%, rgba(125,38,205,0.06) 100%)',
            border: '1px solid rgba(0,245,255,0.2)',
          }}
        >
          <p style={{ color: '#00F5FF', fontSize: 8, fontWeight: 600, letterSpacing: '0.12em' }}>⚡ AI BOARD PICK</p>
          <p style={{ color: '#FFFFFF', fontSize: 10, marginTop: 4, lineHeight: 1.5 }}>
            Your 6&apos;2&quot; shortboard is the call — that 13s period has the power to drive rail-to-rail. Hit the peak at incoming tide.
          </p>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Featured spot pills
// ---------------------------------------------------------------------------
const FEATURED_SPOTS = [
  { id: 'lower-trestles',  name: 'Lower Trestles' },
  { id: 'pipeline',        name: 'Pipeline' },
  { id: 'teahupoo',        name: "Teahupo'o" },
  { id: 'jeffreys-bay',    name: 'J-Bay' },
  { id: 'nazare',          name: 'Nazaré' },
  { id: 'uluwatu',         name: 'Uluwatu' },
]

function FeaturedSpots() {
  return (
    <div className="flex flex-wrap justify-center gap-3">
      {FEATURED_SPOTS.map((spot) => (
        <Link
          key={spot.id}
          href={`/dashboard?id=${spot.id}`}
          className="rounded-full px-4 py-2 text-sm font-medium transition-all"
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#94A3B8',
          }}
          onMouseEnter={undefined}
        >
          {spot.name}
        </Link>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Stat pills
// ---------------------------------------------------------------------------
const STATS = [
  { label: 'AI-Powered',            icon: '⚡' },
  { label: 'Real-Time Data',        icon: '📡' },
  { label: '20+ World-Class Breaks',icon: '🌊' },
]

// ---------------------------------------------------------------------------
// Page — fully static RSC, no async/await needed
// ---------------------------------------------------------------------------
export default function LaunchPage() {
  return (
    <div
      className="relative min-h-screen font-sans overflow-x-hidden"
      style={{ background: '#0A192F' }}
    >
      {/* Parallax wave background */}
      <Suspense fallback={null}>
        <WaveBackground />
      </Suspense>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 pt-6 max-w-5xl mx-auto">
        <Logo />
        <Link
          href="/dashboard"
          className="text-sm font-medium transition-colors"
          style={{ color: '#94A3B8' }}
        >
          View Dashboard →
        </Link>
      </nav>

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pt-16 pb-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center">

          {/* Left — copy */}
          <div>
            {/* Badge */}
            <div
              className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold mb-6"
              style={{
                background: 'rgba(0,245,255,0.08)',
                border: '1px solid rgba(0,245,255,0.25)',
                color: '#00F5FF',
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
              Early Access — Join the lineup
            </div>

            {/* Headline */}
            <h1
              className="font-black leading-tight mb-6"
              style={{
                fontSize: 'clamp(2.5rem, 5vw, 3.5rem)',
                color: '#FFFFFF',
                letterSpacing: '-0.02em',
                lineHeight: 1.1,
              }}
            >
              Your AI Surf Caddy{' '}
              <span style={{ color: '#00F5FF' }}>is arriving.</span>
            </h1>

            {/* Value prop */}
            <p
              className="text-lg leading-relaxed mb-8"
              style={{ color: '#94A3B8', maxWidth: 480 }}
            >
              Stop guessing. Start surfing. Get real-time AI-calculated Vibe Scores
              for your favourite breaks — so you show up when it&apos;s pumping.
            </p>

            {/* Stat pills */}
            <div className="flex flex-wrap gap-3 mb-10">
              {STATS.map(({ label, icon }) => (
                <span
                  key={label}
                  className="flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: '#94A3B8',
                  }}
                >
                  <span aria-hidden>{icon}</span>
                  {label}
                </span>
              ))}
            </div>

            {/* Email form */}
            <Suspense fallback={null}>
              <EmailForm />
            </Suspense>

            <p className="mt-3 text-xs" style={{ color: '#475569' }}>
              No spam. No wipeouts. Unsubscribe any time.
            </p>
          </div>

          {/* Right — dashboard mockup */}
          <div className="lg:block hidden">
            <DashboardMockup />
          </div>
        </div>

        {/* Mobile mockup (below copy on small screens) */}
        <div className="lg:hidden mt-12">
          <DashboardMockup />
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────── */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 py-16">
        <h2
          className="text-center font-bold mb-12 text-2xl"
          style={{ color: '#FFFFFF', letterSpacing: '-0.02em' }}
        >
          Know before you go.
        </h2>
        <div className="grid sm:grid-cols-3 gap-6">
          {[
            {
              step: '01',
              title: 'Pick your break',
              body: 'Choose from 20+ iconic spots worldwide or search any coastline by name.',
            },
            {
              step: '02',
              title: 'Read the Vibe Score',
              body: 'Our AI fuses wave height, period, wind, swell direction, and tides into a single 0–100 score.',
            },
            {
              step: '03',
              title: 'Grab the right board',
              body: 'Your personal AI caddy tells you exactly which stick to pull — and where to sit in the lineup.',
            },
          ].map(({ step, title, body }) => (
            <div
              key={step}
              className="rounded-2xl p-6"
              style={{
                background: 'rgba(16,33,62,0.6)',
                border: '1px solid rgba(255,255,255,0.08)',
                backdropFilter: 'blur(10px)',
              }}
            >
              <p
                className="text-xs font-bold mb-3 tracking-widest"
                style={{ color: '#00F5FF', fontFamily: 'JetBrains Mono, monospace' }}
              >
                {step}
              </p>
              <h3 className="font-bold text-base mb-2" style={{ color: '#FFFFFF' }}>{title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: '#94A3B8' }}>{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Featured Spots ───────────────────────────────────── */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 py-12">
        <p
          className="text-center text-xs font-semibold uppercase tracking-widest mb-6"
          style={{ color: '#475569' }}
        >
          Featured breaks
        </p>
        <FeaturedSpots />
      </section>

      {/* ── Bottom CTA ───────────────────────────────────────── */}
      <section
        className="relative z-10 max-w-5xl mx-auto px-6 py-20 text-center"
      >
        <h2
          className="font-black mb-4"
          style={{
            fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
            color: '#FFFFFF',
            letterSpacing: '-0.02em',
          }}
        >
          The ocean waits for no one.{' '}
          <span style={{ color: '#00F5FF' }}>Are you in?</span>
        </h2>
        <p className="mb-8 text-base" style={{ color: '#94A3B8' }}>
          Be first to know when SwellSense goes live.
        </p>
        <div className="flex justify-center">
          <Suspense fallback={null}>
            <EmailForm />
          </Suspense>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────── */}
      <footer
        className="relative z-10 border-t"
        style={{ borderColor: 'rgba(255,255,255,0.06)' }}
      >
        <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Logo size={18} />
          <p className="text-xs" style={{ color: '#475569' }}>
            © {new Date().getFullYear()} SwellSense. Built with real ocean data.
          </p>
          <Link
          href="/dashboard"
          className="text-xs transition-colors"
          style={{ color: '#475569' }}
        >
          View the Dashboard →
          </Link>
        </div>
      </footer>
    </div>
  )
}
