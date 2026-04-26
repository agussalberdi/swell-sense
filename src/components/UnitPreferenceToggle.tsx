'use client'

import type { UnitSystem } from '@/lib/units'

// ---------------------------------------------------------------------------
// Profile **Measurements** — Imperial vs Metric with unit hints (plan split-out).
// ---------------------------------------------------------------------------
export default function UnitPreferenceToggle({
  value,
  onChange,
}: {
  value: UnitSystem
  onChange: (next: UnitSystem) => void
}) {
  return (
    <div
      className="inline-flex rounded-full p-0.5"
      style={{
        background: 'rgba(255,255,255,0.05)',
        border:     '1px solid rgba(255,255,255,0.1)',
      }}
      role="group"
      aria-label="Measurement units"
    >
      {(
        [
          { value: 'imperial' as const, label: 'Imperial', hint: 'ft · mph · °F' },
          { value: 'metric' as const, label: 'Metric', hint: 'm · km/h · °C' },
        ] as const
      ).map(({ value: v, label, hint }) => {
        const active = value === v
        return (
          <button
            key={v}
            type="button"
            onClick={() => onChange(v)}
            className="rounded-full px-4 py-2 text-left transition-all min-w-[7rem]"
            style={{
              background: active ? 'rgba(0,245,255,0.12)' : 'transparent',
              border:     active ? '1px solid rgba(0,245,255,0.35)' : '1px solid transparent',
            }}
          >
            <p className="text-sm font-semibold" style={{ color: active ? '#00F5FF' : '#FFFFFF' }}>
              {label}
            </p>
            <p className="text-[10px] mt-0.5 font-mono" style={{ color: '#64748B' }}>{hint}</p>
          </button>
        )
      })}
    </div>
  )
}
