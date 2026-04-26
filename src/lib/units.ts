// ---------------------------------------------------------------------------
// Display unit system — Imperial (ft, mph, °F) vs Metric (m, km/h, °C)
// Server + client safe (no 'use client').
// ---------------------------------------------------------------------------

export type UnitSystem = 'imperial' | 'metric'

export const UNITS_COOKIE = 'ssr-units'

export const DEFAULT_UNIT_SYSTEM: UnitSystem = 'imperial'

export function parseUnitToken(v: string | undefined | null): UnitSystem {
  if (v === 'metric' || v === 'imperial') return v
  return DEFAULT_UNIT_SYSTEM
}

/** Server-only resolution: profile row beats cookie; guests use cookie or default. */
export function resolveUnitSystem(
  profile: { unitSystem: UnitSystem } | null | undefined,
  cookieValue: string | undefined,
): UnitSystem {
  if (profile) return profile.unitSystem
  return parseUnitToken(cookieValue)
}
