'use client'

import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import type { UnitSystem } from '@/lib/units'
import { UNITS_COOKIE } from '@/lib/units'

function writeUnitsCookie(next: UnitSystem) {
  const maxAge = 60 * 60 * 24 * 400
  if (typeof document === 'undefined') return
  document.cookie = `${UNITS_COOKIE}=${next}; path=/; max-age=${maxAge}; SameSite=Lax`
}

// ---------------------------------------------------------------------------
// Dashboard header: Imperial vs Metric. Sets `ssr-units` for SSR; if signed
// in, PATCHes profile so DB stays in sync, then refresh().
// ---------------------------------------------------------------------------
export default function UnitToggle({ value }: { value: UnitSystem }) {
  const router   = useRouter()
  const { data } = useSession()
  const signedIn = Boolean(data?.user)

  async function select(next: UnitSystem) {
    if (next === value) return
    writeUnitsCookie(next)
    if (signedIn) {
      try {
        await fetch('/api/profile', {
          method:  'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ unitSystem: next }),
        })
      } catch {
        // Cookie still set for this session
      }
    }
    router.refresh()
  }

  return (
    <div
      className="flex rounded-full p-0.5 text-[10px] font-semibold"
      style={{
        background: 'rgba(255,255,255,0.05)',
        border:     '1px solid rgba(255,255,255,0.1)',
      }}
      role="group"
      aria-label="Unit system"
    >
      {(['imperial', 'metric'] as const).map((u) => {
        const active = value === u
        return (
          <button
            key={u}
            type="button"
            onClick={() => { void select(u) }}
            className="rounded-full px-2.5 py-1 transition-all"
            style={{
              background: active ? 'rgba(0,245,255,0.12)' : 'transparent',
              color:      active ? '#00F5FF' : '#64748B',
              boxShadow:  active ? '0 0 8px rgba(0,245,255,0.12)' : 'none',
            }}
            aria-pressed={active}
          >
            {u === 'imperial' ? 'ft' : 'm'}
          </button>
        )
      })}
    </div>
  )
}
