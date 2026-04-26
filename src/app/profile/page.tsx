import { redirect } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { profiles } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import Logo from '@/components/ui/logo'
import ProfileForm from '@/components/ProfileForm'

// ---------------------------------------------------------------------------
// Profile page — protected RSC.
// Redirects to /dashboard when unauthenticated.
// ---------------------------------------------------------------------------
export const metadata = {
  title: 'My Profile — SwellSense',
}

export default async function ProfilePage() {
  const session = await auth()
  if (!session) redirect('/dashboard')

  const profile = session.user.id
    ? await db.query.profiles.findFirst({ where: eq(profiles.userId, session.user.id) }) ?? null
    : null

  const tierLabel = {
    free: 'Free',
    pro:  'Pro 🏄',
    team: 'Team 🌊',
  }[session.user.tier ?? 'free']

  return (
    <div className="min-h-screen font-sans" style={{ background: '#0A192F' }}>
      <div className="mx-auto max-w-md px-4 pb-16">

        {/* ── Header ───────────────────────────────────── */}
        <header className="flex items-center justify-between py-5">
          <Link href="/" aria-label="SwellSense home">
            <Logo />
          </Link>
          <Link
            href="/dashboard"
            className="text-xs font-medium px-3 py-1.5 rounded-full transition-colors"
            style={{
              background: 'rgba(255,255,255,0.06)',
              border:     '1px solid rgba(255,255,255,0.1)',
              color:      '#94A3B8',
            }}
          >
            ← Dashboard
          </Link>
        </header>

        {/* ── User card ────────────────────────────────── */}
        <div
          className="rounded-2xl p-5 mb-6 flex items-center gap-4"
          style={{
            background: 'rgba(16,33,62,0.7)',
            border:     '1px solid rgba(255,255,255,0.1)',
          }}
        >
          {session.user.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={session.user.image}
              alt={session.user.name ?? 'Avatar'}
              width={52}
              height={52}
              className="rounded-full flex-shrink-0"
              style={{ width: 52, height: 52, objectFit: 'cover' }}
            />
          ) : (
            <div
              className="rounded-full flex items-center justify-center text-xl font-bold flex-shrink-0"
              style={{ width: 52, height: 52, background: 'rgba(0,245,255,0.15)', color: '#00F5FF' }}
            >
              {session.user.name?.[0]?.toUpperCase() ?? '?'}
            </div>
          )}
          <div className="min-w-0">
            <p className="text-base font-semibold truncate" style={{ color: '#FFFFFF' }}>
              {session.user.name}
            </p>
            <p className="text-xs truncate" style={{ color: '#64748B' }}>
              {session.user.email}
            </p>
            <span
              className="inline-block mt-1 text-xs font-semibold px-2 py-0.5 rounded-full"
              style={{
                background: session.user.tier === 'free'
                  ? 'rgba(255,255,255,0.07)'
                  : 'rgba(0,245,255,0.12)',
                color: session.user.tier === 'free' ? '#64748B' : '#00F5FF',
                border: session.user.tier === 'free'
                  ? '1px solid rgba(255,255,255,0.1)'
                  : '1px solid rgba(0,245,255,0.3)',
              }}
            >
              {tierLabel}
            </span>
          </div>
        </div>

        {/* ── Profile form ─────────────────────────────── */}
        <div
          className="rounded-2xl p-5"
          style={{
            background: 'rgba(16,33,62,0.7)',
            border:     '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <h1 className="text-sm font-semibold mb-5" style={{ color: '#FFFFFF' }}>
            Surf Profile
          </h1>
          <p className="text-xs mb-5" style={{ color: '#64748B' }}>
            Your profile personalises the AI Board Pick with board recommendations tailored
            to your quiver and skill level.
          </p>
          <ProfileForm profile={profile ?? null} />
        </div>

      </div>
    </div>
  )
}
