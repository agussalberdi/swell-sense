// ---------------------------------------------------------------------------
// Vibe Score — deterministic 0–100 surf quality metric
// All units are SI at input (metres, m/s, degrees). Output is an integer.
// ---------------------------------------------------------------------------

export interface VibeInput {
  waveHeight: number       // metres
  wavePeriod: number       // seconds
  windSpeed: number        // m/s
  windDirection: number    // degrees (meteorological: FROM direction)
  swellDirection: number   // degrees (FROM direction)
  beachFacingDeg: number   // degrees the beach face points toward
}

export type WindType = 'offshore' | 'cross-off' | 'onshore' | 'glassy'

// ---------------------------------------------------------------------------
// Wind classification
// Offshore = wind blows from land toward sea = against the incoming swell
// ---------------------------------------------------------------------------
export function classifyWind(
  windSpeed: number,
  windDirection: number,
  beachFacingDeg: number,
): WindType {
  const windKnots = windSpeed * 1.94384
  if (windKnots < 3) return 'glassy'

  // "Offshore" base direction: wind should come from the land side,
  // i.e. roughly the opposite of the beach face direction.
  const offshoreBaseDir = (beachFacingDeg + 180) % 360
  const diff = Math.abs(windDirection - offshoreBaseDir)
  const angle = diff > 180 ? 360 - diff : diff // 0–180°

  if (angle < 40) return 'offshore'
  if (angle < 90) return 'cross-off'
  return 'onshore'
}

// ---------------------------------------------------------------------------
// Wetsuit recommendation based on water temperature
// ---------------------------------------------------------------------------
export function gearFromTemp(tempC: number): string {
  if (tempC >= 24) return 'Boardshorts'
  if (tempC >= 20) return 'Spring Suit'
  if (tempC >= 16) return '3/2 Wetsuit'
  if (tempC >= 12) return '4/3 Wetsuit'
  return '5/4 + Booties'
}

// ---------------------------------------------------------------------------
// Board recommendation from wave characteristics
// ---------------------------------------------------------------------------
export function boardPick(waveHeightFt: number, wavePeriod: number): string {
  if (waveHeightFt >= 8) return 'Step-up or gun — respect the size today.'
  if (waveHeightFt >= 5 && wavePeriod >= 12)
    return 'Pull out the shortboard — powerful, hollow conditions ahead.'
  if (waveHeightFt >= 3 && wavePeriod >= 10)
    return 'Your go-to shortboard or a step-up. Prime performance conditions.'
  if (waveHeightFt >= 2)
    return 'Take the Fish — waves are soft and fat, maximise your wave count.'
  return 'Longboard day. Hang five and make the best of it.'
}

// ---------------------------------------------------------------------------
// Session description template (Phase 2 will replace with streaming AI)
// ---------------------------------------------------------------------------
export function sessionDescription(
  score: number,
  waveHeightFt: number,
  wavePeriod: number,
  windType: WindType,
): string {
  const h =
    waveHeightFt < 2 ? 'small' :
    waveHeightFt < 4 ? 'fun-sized' :
    waveHeightFt < 6 ? 'solid' :
    waveHeightFt < 8 ? 'overhead' : 'heavy'
  const p = wavePeriod >= 14 ? 'long-period' : wavePeriod >= 10 ? 'punchy' : 'short-period'
  const w =
    windType === 'glassy' ? 'glassy, windless conditions' :
    windType === 'offshore' ? 'offshore winds keeping faces clean' :
    windType === 'cross-off' ? 'light cross-off winds' : 'onshore conditions'

  const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

  if (score >= 80) return `${cap(h)}, ${p} swell with ${w}—conditions are dialled for a quality session.`
  if (score >= 60) return `${cap(h)} waves with ${w}. Worth paddling out.`
  if (score >= 40) return `Mixed ${p} conditions with ${w}. Casual surf only.`
  return `${cap(w)} and inconsistent swell. Might be worth waiting.`
}

// ---------------------------------------------------------------------------
// Core scoring function
// ---------------------------------------------------------------------------
export function calcVibeScore(input: VibeInput): number {
  let score = 0

  // ── Wave height (sweet spot 3–6 ft) ─────────────────────────────────────
  const heightFt = input.waveHeight * 3.28084
  if (heightFt >= 3 && heightFt <= 6) score += 35
  else if (heightFt > 6 && heightFt <= 10) score += 20
  else if (heightFt >= 1) score += 12

  // ── Wave period ─────────────────────────────────────────────────────────
  if (input.wavePeriod >= 14) score += 20
  else if (input.wavePeriod >= 10) score += 15
  else if (input.wavePeriod >= 8) score += 8
  else score += 3

  // ── Wind ────────────────────────────────────────────────────────────────
  const windType = classifyWind(input.windSpeed, input.windDirection, input.beachFacingDeg)
  if (windType === 'glassy') score += 22
  else if (windType === 'offshore') score += 25
  else if (windType === 'cross-off') score += 12
  // onshore: 0

  // ── Swell direction alignment (bonus when swell hits beach squarely) ────
  const swellAngleToBeach = Math.abs(input.swellDirection - (input.beachFacingDeg + 180) % 360)
  const alignment = swellAngleToBeach > 180 ? 360 - swellAngleToBeach : swellAngleToBeach
  if (alignment < 20) score += 10       // swell hits squarely
  else if (alignment < 45) score += 6   // slight angle — still good
  else if (alignment > 90) score -= 5   // mostly parallel — poor

  return Math.min(Math.max(Math.round(score), 0), 100)
}
