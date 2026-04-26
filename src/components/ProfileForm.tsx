'use client'

import { useState } from 'react'
import type { Profile, Board } from '@/lib/db/schema'
import { SPOTS } from '@/lib/spots'

type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'pro'
type BoardType  = Board['type']

const SKILL_LEVELS: { value: SkillLevel; label: string; desc: string }[] = [
  { value: 'beginner',     label: 'Beginner',     desc: 'Learning to pop up' },
  { value: 'intermediate', label: 'Intermediate', desc: 'Riding green waves' },
  { value: 'advanced',     label: 'Advanced',     desc: 'Carving + barrel riding' },
  { value: 'pro',          label: 'Pro',          desc: 'Competition-level' },
]

const BOARD_TYPES: { value: BoardType; label: string; emoji: string }[] = [
  { value: 'shortboard', label: 'Shortboard', emoji: '🏄' },
  { value: 'fish',       label: 'Fish',       emoji: '🐟' },
  { value: 'longboard',  label: 'Longboard',  emoji: '📏' },
  { value: 'step-up',    label: 'Step-up',    emoji: '⬆️' },
  { value: 'gun',        label: 'Gun',        emoji: '🔫' },
  { value: 'funboard',   label: 'Funboard',   emoji: '🎯' },
]

// ---------------------------------------------------------------------------
// ProfileForm — controlled client component for editing the user profile.
// Calls PATCH /api/profile on submit.
// ---------------------------------------------------------------------------
export default function ProfileForm({ profile }: { profile: Profile | null }) {
  const [skillLevel, setSkillLevel]   = useState<SkillLevel | ''>(
    (profile?.skillLevel as SkillLevel) ?? '',
  )
  const [homeBreakId, setHomeBreakId] = useState(profile?.homeBreakId ?? '')
  const [boards, setBoards]           = useState<BoardType[]>(
    profile?.boards?.map((b) => b.type) ?? [],
  )
  const [status, setStatus]           = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  function toggleBoard(type: BoardType) {
    setBoards((prev) =>
      prev.includes(type) ? prev.filter((b) => b !== type) : [...prev, type],
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('saving')
    try {
      const res = await fetch('/api/profile', {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          skillLevel:          skillLevel || null,
          homeBreakId:         homeBreakId || null,
          boards:              boards.map((type) => ({ type })),
          onboardingCompleted: !!skillLevel && boards.length > 0,
        }),
      })
      if (!res.ok) throw new Error('Failed')
      setStatus('saved')
      setTimeout(() => setStatus('idle'), 2500)
    } catch {
      setStatus('error')
      setTimeout(() => setStatus('idle'), 3000)
    }
  }

  const inputStyle: React.CSSProperties = {
    background:  'rgba(255,255,255,0.05)',
    border:      '1px solid rgba(255,255,255,0.1)',
    borderRadius: 10,
    color:       '#FFFFFF',
    padding:     '0.6rem 0.85rem',
    fontSize:    '0.875rem',
    width:       '100%',
    outline:     'none',
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* ── Skill Level ─────────────────────────────────── */}
      <fieldset>
        <legend className="text-xs font-semibold mb-3" style={{ color: '#94A3B8' }}>
          SKILL LEVEL
        </legend>
        <div className="grid grid-cols-2 gap-2">
          {SKILL_LEVELS.map(({ value, label, desc }) => {
            const active = skillLevel === value
            return (
              <button
                key={value}
                type="button"
                onClick={() => setSkillLevel(value)}
                className="rounded-xl p-3 text-left transition-all"
                style={{
                  background: active ? 'rgba(0,245,255,0.12)' : 'rgba(255,255,255,0.04)',
                  border:     active ? '1px solid rgba(0,245,255,0.35)' : '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <p className="text-sm font-semibold" style={{ color: active ? '#00F5FF' : '#FFFFFF' }}>
                  {label}
                </p>
                <p className="text-xs mt-0.5" style={{ color: '#64748B' }}>{desc}</p>
              </button>
            )
          })}
        </div>
      </fieldset>

      {/* ── Home Break ──────────────────────────────────── */}
      <div>
        <label className="block text-xs font-semibold mb-2" style={{ color: '#94A3B8' }}>
          HOME BREAK
        </label>
        <select
          value={homeBreakId}
          onChange={(e) => setHomeBreakId(e.target.value)}
          style={inputStyle}
        >
          <option value="">— Select your home break —</option>
          {Object.values(SPOTS).map((spot) => (
            <option key={spot.id} value={spot.id}>{spot.name}</option>
          ))}
        </select>
      </div>

      {/* ── Quiver ──────────────────────────────────────── */}
      <fieldset>
        <legend className="text-xs font-semibold mb-3" style={{ color: '#94A3B8' }}>
          MY QUIVER <span style={{ color: '#64748B', fontWeight: 400 }}>(select all that apply)</span>
        </legend>
        <div className="grid grid-cols-3 gap-2">
          {BOARD_TYPES.map(({ value, label, emoji }) => {
            const active = boards.includes(value)
            return (
              <button
                key={value}
                type="button"
                onClick={() => toggleBoard(value)}
                className="rounded-xl py-3 px-2 text-center transition-all"
                style={{
                  background: active ? 'rgba(0,245,255,0.12)' : 'rgba(255,255,255,0.04)',
                  border:     active ? '1px solid rgba(0,245,255,0.35)' : '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <span className="text-lg block">{emoji}</span>
                <span
                  className="text-xs font-medium block mt-1"
                  style={{ color: active ? '#00F5FF' : '#94A3B8' }}
                >
                  {label}
                </span>
              </button>
            )
          })}
        </div>
      </fieldset>

      {/* ── Save button ─────────────────────────────────── */}
      <button
        type="submit"
        disabled={status === 'saving'}
        className="w-full rounded-xl py-3 text-sm font-semibold transition-all active:scale-98"
        style={{
          background:  status === 'saved'  ? 'rgba(0,245,255,0.15)'
                     : status === 'error'  ? 'rgba(255,80,80,0.15)'
                     : 'rgba(0,245,255,0.1)',
          border:      status === 'saved'  ? '1px solid rgba(0,245,255,0.5)'
                     : status === 'error'  ? '1px solid rgba(255,80,80,0.4)'
                     : '1px solid rgba(0,245,255,0.3)',
          color:       status === 'error'  ? '#FF5050' : '#00F5FF',
          opacity:     status === 'saving' ? 0.7 : 1,
        }}
      >
        {status === 'saving' ? 'Saving…'
         : status === 'saved'  ? '✓ Profile saved'
         : status === 'error'  ? 'Error — try again'
         : 'Save profile'}
      </button>

    </form>
  )
}
