'use client'

import { signIn, signOut, useSession } from 'next-auth/react'
import Link from 'next/link'
import { useState } from 'react'

// ---------------------------------------------------------------------------
// AuthButton — shows avatar + dropdown when signed in, "Sign in" pill when not.
// Receives `initialSession` from the server to avoid a flash of unauthenticated
// state on first paint (RSC passes session; client hydrates seamlessly).
// ---------------------------------------------------------------------------

function UserMenu({ name, image }: { name: string | null; image: string | null }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full px-2 py-1 transition-colors"
        style={{
          background: open ? 'rgba(0,245,255,0.1)' : 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.1)',
        }}
        aria-label="Account menu"
        aria-expanded={open}
      >
        {image ? (
          // Plain <img> avoids next/image domain config for OAuth avatars
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt={name ?? 'User avatar'}
            width={24}
            height={24}
            className="rounded-full"
            style={{ width: 24, height: 24, objectFit: 'cover' }}
          />
        ) : (
          <span
            className="flex items-center justify-center rounded-full"
            style={{ width: 24, height: 24, background: 'rgba(0,245,255,0.15)', color: '#00F5FF' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
            </svg>
          </span>
        )}
        <svg
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          style={{ color: '#94A3B8', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}
          aria-hidden
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />

          {/* Dropdown */}
          <div
            className="absolute right-0 top-full mt-2 w-44 rounded-xl overflow-hidden z-50"
            style={{
              background: 'rgba(16,33,62,0.97)',
              border: '1px solid rgba(255,255,255,0.1)',
              backdropFilter: 'blur(12px)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            }}
          >
            <div
              className="px-4 py-2.5 text-xs truncate"
              style={{ color: '#94A3B8', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
            >
              {name}
            </div>
            <Link
              href="/profile"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-4 py-2.5 text-sm transition-colors w-full text-left"
              style={{ color: '#FFFFFF' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0,245,255,0.08)' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              My Profile
            </Link>
            <button
              onClick={() => { setOpen(false); signOut({ callbackUrl: '/dashboard' }) }}
              className="flex items-center gap-2 px-4 py-2.5 text-sm w-full text-left transition-colors"
              style={{ color: '#94A3B8', borderTop: '1px solid rgba(255,255,255,0.06)' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Sign out
            </button>
          </div>
        </>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// The exported component — uses useSession for client-side reactivity.
// The dashboard RSC passes `session` as a prop to avoid a loading flash.
// ---------------------------------------------------------------------------
export default function AuthButton() {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return (
      <div
        className="h-8 w-20 rounded-full animate-pulse"
        style={{ background: 'rgba(255,255,255,0.06)' }}
      />
    )
  }

  if (session?.user) {
    return <UserMenu name={session.user.name ?? null} image={session.user.image ?? null} />
  }

  return (
    <button
      onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
      className="flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold transition-all active:scale-95"
      style={{
        background: 'rgba(0,245,255,0.1)',
        border: '1px solid rgba(0,245,255,0.3)',
        color: '#00F5FF',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'rgba(0,245,255,0.18)'
        e.currentTarget.style.boxShadow = '0 0 12px rgba(0,245,255,0.25)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'rgba(0,245,255,0.1)'
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      {/* Google G icon */}
      <svg width="12" height="12" viewBox="0 0 24 24" aria-hidden>
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
      </svg>
      Sign in
    </button>
  )
}
