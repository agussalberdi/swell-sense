'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

// ---------------------------------------------------------------------------
// Nav items — same 4 tabs on both mobile bottom bar and desktop top nav.
// Forecast + Spots + AI Caddy are all anchored within /dashboard.
// Settings goes to /profile (the protected page we built in Phase 6).
// ---------------------------------------------------------------------------
const NAV_ITEMS = [
  {
    label: 'Forecast',
    href:  '/dashboard',
    icon:  (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M3 12h4l3-9 4 18 3-9h4" />
      </svg>
    ),
  },
  {
    label: 'Spots',
    href:  '/dashboard#spots',
    icon:  (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
  },
  {
    label: 'AI Caddy',
    href:  '/dashboard#ai-pick',
    icon:  (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    ),
  },
  {
    label: 'Settings',
    href:  '/profile',
    icon:  (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
  },
]

// ---------------------------------------------------------------------------
// BottomNav — fixed bottom bar, mobile only (hidden on md+)
// ---------------------------------------------------------------------------
function BottomNav({ pathname }: { pathname: string }) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
      style={{
        background:   'rgba(10,25,47,0.95)',
        borderTop:    '1px solid rgba(255,255,255,0.08)',
        backdropFilter: 'blur(16px)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
      aria-label="Main navigation"
    >
      <div className="flex items-stretch">
        {NAV_ITEMS.map(({ label, href, icon }) => {
          const isActive = href === '/dashboard'
            ? pathname === '/dashboard'
            : pathname.startsWith(href.split('#')[0]) && href !== '/dashboard'
              ? true
              : pathname === href.split('#')[0]

          return (
            <Link
              key={label}
              href={href}
              className="flex flex-col items-center justify-center gap-1 flex-1 py-3 text-xs font-medium transition-colors"
              style={{ color: isActive ? '#00F5FF' : '#64748B' }}
            >
              <span
                style={{
                  color:      isActive ? '#00F5FF' : '#64748B',
                  filter:     isActive ? 'drop-shadow(0 0 6px rgba(0,245,255,0.6))' : 'none',
                  transition: 'color 0.15s, filter 0.15s',
                }}
              >
                {icon}
              </span>
              <span style={{ fontSize: 10, letterSpacing: '0.05em' }}>{label.toUpperCase()}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

// ---------------------------------------------------------------------------
// TopNav — horizontal links for tablet + desktop (hidden on mobile)
// ---------------------------------------------------------------------------
function TopNav({ pathname }: { pathname: string }) {
  return (
    <nav className="hidden md:flex items-center gap-6" aria-label="Main navigation">
      {NAV_ITEMS.map(({ label, href }) => {
        const isActive = href === '/dashboard'
          ? pathname === '/dashboard'
          : pathname.startsWith(href.split('#')[0])

        return (
          <Link
            key={label}
            href={href}
            className="text-xs font-semibold tracking-widest transition-colors"
            style={{
              color:         isActive ? '#00F5FF' : '#64748B',
              letterSpacing: '0.08em',
            }}
            onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.color = '#94A3B8' }}
            onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.color = '#64748B' }}
          >
            {label.toUpperCase()}
          </Link>
        )
      })}
    </nav>
  )
}

// ---------------------------------------------------------------------------
// Exported component — renders the correct variant based on prop.
// Usage:
//   <DashboardNav variant="bottom" />  ← outside scroll container
//   <DashboardNav variant="top" />     ← inside header, md: only
// ---------------------------------------------------------------------------
export default function DashboardNav({ variant }: { variant: 'bottom' | 'top' }) {
  const pathname = usePathname()
  return variant === 'bottom'
    ? <BottomNav pathname={pathname} />
    : <TopNav pathname={pathname} />
}
