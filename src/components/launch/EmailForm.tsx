'use client'

import { useState } from 'react'

// ---------------------------------------------------------------------------
// EmailForm — "Join the Lineup" email capture.
// 48px minimum tap target on the CTA button (surf-thumb friendly).
// Submits to console.log placeholder — wired to a real backend in Phase 5/6.
// ---------------------------------------------------------------------------

type State = 'idle' | 'loading' | 'success' | 'error'

export default function EmailForm() {
  const [email, setEmail] = useState('')
  const [state, setState] = useState<State>('idle')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim() || state === 'loading') return

    setState('loading')

    // Placeholder — swap for a real API call (Resend, Loops, etc.) in Phase 5/6
    await new Promise((r) => setTimeout(r, 600))
    console.info('[SwellSense] Early access signup:', email)

    setState('success')
  }

  if (state === 'success') {
    return (
      <div
        className="flex items-center gap-3 rounded-2xl px-6 py-4 text-sm font-medium"
        style={{
          background: 'rgba(0,245,255,0.1)',
          border: '1px solid rgba(0,245,255,0.3)',
          color: '#00F5FF',
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <polyline points="20 6 9 17 4 12" />
        </svg>
        You&apos;re on the lineup! We&apos;ll be in touch before drop-in.
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col sm:flex-row gap-3 w-full max-w-md"
      aria-label="Join the Lineup"
    >
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="your@email.com"
        className="flex-1 rounded-xl px-4 text-sm outline-none transition-all"
        style={{
          background: 'rgba(255,255,255,0.07)',
          border: '1px solid rgba(255,255,255,0.12)',
          color: '#FFFFFF',
          height: 48,
          minHeight: 48,
        }}
        onFocus={(e) => {
          e.currentTarget.style.border = '1px solid rgba(0,245,255,0.5)'
          e.currentTarget.style.background = 'rgba(0,245,255,0.05)'
        }}
        onBlur={(e) => {
          e.currentTarget.style.border = '1px solid rgba(255,255,255,0.12)'
          e.currentTarget.style.background = 'rgba(255,255,255,0.07)'
        }}
        disabled={state === 'loading'}
        aria-label="Email address"
      />
      <button
        type="submit"
        disabled={state === 'loading'}
        className="flex-shrink-0 rounded-xl px-6 font-semibold text-sm transition-all active:scale-95"
        style={{
          background: state === 'loading'
            ? 'rgba(0,245,255,0.4)'
            : 'rgba(0,245,255,1)',
          color: '#0A192F',
          height: 48,
          minHeight: 48,
          minWidth: 160,
          boxShadow: state !== 'loading' ? '0 0 20px rgba(0,245,255,0.4)' : 'none',
          cursor: state === 'loading' ? 'not-allowed' : 'pointer',
        }}
        onMouseEnter={(e) => {
          if (state !== 'loading') {
            e.currentTarget.style.boxShadow = '0 0 32px rgba(0,245,255,0.7)'
            e.currentTarget.style.background = '#00F5FF'
          }
        }}
        onMouseLeave={(e) => {
          if (state !== 'loading') {
            e.currentTarget.style.boxShadow = '0 0 20px rgba(0,245,255,0.4)'
          }
        }}
      >
        {state === 'loading' ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
            Paddling in…
          </span>
        ) : (
          'Join the Lineup →'
        )}
      </button>
    </form>
  )
}
