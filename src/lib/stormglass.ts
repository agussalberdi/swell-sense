import { cache } from 'react'
import { cacheLife } from 'next/cache'
import type { Spot } from './spots'
import { IS_MOCK_MODE } from './config'
import {
  calcVibeScore,
  classifyWind,
  gearFromTemp,
  boardPick,
  sessionDescription,
} from './vibe-score'

// ---------------------------------------------------------------------------
// Public shape consumed by page.tsx and client components
// ---------------------------------------------------------------------------
export interface SurfData {
  location: string
  vibeScore: number
  description: string
  waveHeight: string       // e.g. "3–4 ft"
  period: string           // e.g. "12 s"
  peakSwell: string        // e.g. "4.2ft @ 12s"
  wind: { speed: string; direction: string }
  tide: { label: string; time: string }
  waterTemp: { temp: string; gear: string }
  boardPick: string
  forecast: { hour: string; height: number }[]
}

// ---------------------------------------------------------------------------
// Stormglass raw types
// ---------------------------------------------------------------------------
interface SGSourceMap {
  sg?: number
  noaa?: number
  meto?: number
  fcoo?: number
  dwd?: number
  icon?: number
}

interface SGWeatherHour {
  time: string
  waveHeight?: SGSourceMap
  wavePeriod?: SGSourceMap
  swellDirection?: SGSourceMap
  swellHeight?: SGSourceMap
  windSpeed?: SGSourceMap
  windDirection?: SGSourceMap
  waterTemperature?: SGSourceMap
}

interface SGWeatherResponse {
  hours: SGWeatherHour[]
}

interface SGTideExtreme {
  time: string
  type: 'high' | 'low'
  height: number
}

interface SGTideResponse {
  data: SGTideExtreme[]
}

// ---------------------------------------------------------------------------
// Mock fixture — raw Stormglass API format for a "Great" day at Trestles.
//
// Conditions modelled:
//   Wave:  1.12 → 1.37 m building swell, 13 s period
//   Wind:  2.0 m/s from NNE (50°) → offshore for Trestles (faces WSW ~225°)
//   Swell: from 210° (SSW) → nearly perpendicular to the beach
//   Temp:  18.2 °C (64.8 °F) → 3/2 Wetsuit
//
// Expected Vibe Score breakdown:
//   +35  wave height 3–6 ft (1.12 m = 3.7 ft)
//   +15  period 13 s (≥ 10 s band)
//   +25  offshore wind (windDir 50° is 5° from offshoreBase 45°)
//   +10  swell alignment (|210° − 225°| = 15° < 20°)
//   ─────────────────
//   = 85  → "Epic"
// ---------------------------------------------------------------------------

/** Generate 13 hourly entries with a mid-session peak at hour 6. */
function buildMockHours(): SGWeatherHour[] {
  const base = new Date('2026-04-25T13:00:00Z') // 6 AM PDT
  return Array.from({ length: 13 }, (_, i) => {
    const distFromPeak = Math.abs(i - 6)
    const heightM = parseFloat((1.37 - distFromPeak * 0.04).toFixed(2))
    return {
      time: new Date(base.getTime() + i * 3_600_000).toISOString(),
      waveHeight:       { sg: heightM },
      wavePeriod:       { sg: 13 },
      swellDirection:   { sg: 210 },
      swellHeight:      { sg: parseFloat((heightM * 0.9).toFixed(2)) },
      windSpeed:        { sg: 2.0 },
      windDirection:    { sg: 50 },
      waterTemperature: { sg: 18.2 },
    }
  })
}

const MOCK_SG_WEATHER: SGWeatherResponse = { hours: buildMockHours() }

const MOCK_SG_TIDES: SGTideExtreme[] = [
  { time: '2026-04-25T17:45:00Z', type: 'high', height: 1.8 }, // 10:45 AM PDT
  { time: '2026-04-26T00:32:00Z', type: 'low',  height: 0.3 }, // 5:32 PM PDT
]

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Pick the Stormglass blended value, falling back through other sources. */
function best(src: SGSourceMap | undefined, fallback = 0): number {
  if (!src) return fallback
  return src.sg ?? src.noaa ?? src.meto ?? src.dwd ?? src.icon ?? fallback
}

/** Format metres → "3–4 ft" range string. */
function fmtHeightRange(metres: number): string {
  const ft = metres * 3.28084
  const lo = Math.floor(ft)
  const hi = lo + 1
  if (ft < 1) return `${ft.toFixed(1)} ft`
  return `${lo}–${hi} ft`
}

/** Convert degrees to a cardinal compass label. */
function compassLabel(deg: number): string {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
  return dirs[Math.round(deg / 45) % 8]
}

// ---------------------------------------------------------------------------
// Transform raw Stormglass response → SurfData
// (called for both mock and live data — same code path)
// ---------------------------------------------------------------------------
function transform(
  weather: SGWeatherResponse,
  tideData: SGTideExtreme[],
  spot: Spot,
): SurfData {
  const hours = weather.hours
  const now = hours[0]

  const waveHeightM = best(now.waveHeight)
  const wavePeriod   = best(now.wavePeriod)
  const windSpeedMS  = best(now.windSpeed)
  const windDir      = best(now.windDirection)
  const swellDir     = best(now.swellDirection)
  const waterTempC   = best(now.waterTemperature, 18)

  const waveHeightFt = waveHeightM * 3.28084
  const windSpeedMph = windSpeedMS * 2.23694
  const waterTempF   = Math.round(waterTempC * 9 / 5 + 32)

  const windType = classifyWind(windSpeedMS, windDir, spot.facingDeg)
  const windLabel =
    windType === 'glassy'    ? 'Glassy' :
    windType === 'offshore'  ? 'Offshore' :
    windType === 'cross-off' ? `Cross-off (${compassLabel(windDir)})` :
                               `Onshore (${compassLabel(windDir)})`

  const vibeScore = calcVibeScore({
    waveHeight:    waveHeightM,
    wavePeriod,
    windSpeed:     windSpeedMS,
    windDirection: windDir,
    swellDirection: swellDir,
    beachFacingDeg: spot.facingDeg,
  })

  // 5-point forecast at 0 / 3 / 6 / 9 / 12 h
  const forecast = [0, 3, 6, 9, 12].map((idx, i) => {
    const h = hours[idx] ?? hours[hours.length - 1]
    return {
      hour: i === 0 ? 'Now' : `${idx}h`,
      height: parseFloat((best(h.waveHeight) * 3.28084).toFixed(1)),
    }
  })

  // Peak swell in the window
  const peakHour   = hours.reduce((a, b) => best(a.waveHeight) >= best(b.waveHeight) ? a : b)
  const peakFt     = (best(peakHour.waveHeight) * 3.28084).toFixed(1)
  const peakPeriod = Math.round(best(peakHour.wavePeriod))

  // Next tide extreme
  const nextTide = tideData[0]
  const tideLabel = nextTide
    ? {
        label: nextTide.type === 'high' ? 'High' : 'Low',
        time: new Date(nextTide.time).toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          timeZone: 'America/Los_Angeles', // TODO: derive from spot.utcOffset in Phase 3
        }),
      }
    : { label: '–', time: '–' }

  return {
    location:    spot.name,
    vibeScore,
    description: sessionDescription(vibeScore, waveHeightFt, wavePeriod, windType),
    waveHeight:  fmtHeightRange(waveHeightM),
    period:      `${Math.round(wavePeriod)} s`,
    peakSwell:   `${peakFt}ft @ ${peakPeriod}s`,
    wind:        { speed: `${Math.round(windSpeedMph)} mph`, direction: windLabel },
    tide:        tideLabel,
    waterTemp:   { temp: `${waterTempF}°F`, gear: gearFromTemp(waterTempC) },
    boardPick:   boardPick(waveHeightFt, wavePeriod),
    forecast,
  }
}

// ---------------------------------------------------------------------------
// Stormglass API fetch — server-only, wrapped in Next.js Data Cache.
//
// 'use cache' + cacheLife('hours') → persists across requests for 1 hour.
// React.cache() on the export → deduplicates within a single render pass.
//
// ⚠ Free-tier quota (10 req/day): each call = 2 API requests (weather + tides).
//   With 1-hour TTL that's up to 48 req/day. While IS_MOCK_MODE = true this
//   is harmless. Before going live, consider setting cacheLife to 6 h:
//     cacheLife({ revalidate: 21_600, expire: 86_400 })
// ---------------------------------------------------------------------------
const SG_BASE   = 'https://api.stormglass.io/v2'
const SG_PARAMS = [
  'waveHeight', 'wavePeriod', 'swellDirection', 'swellHeight',
  'windSpeed', 'windDirection', 'waterTemperature',
].join(',')

async function fetchSurfDataRaw(spot: Spot): Promise<SurfData> {
  'use cache'
  cacheLife('hours')

  // ── Mock mode: skip network entirely, exercise the full transform path ───
  if (IS_MOCK_MODE) {
    console.info('[SwellSense] Mock mode — no API request made.')
    return transform(MOCK_SG_WEATHER, MOCK_SG_TIDES, spot)
  }

  const apiKey = process.env.STORMGLASS_API_KEY
  if (!apiKey || apiKey === 'your_api_key_here') {
    console.warn('[SwellSense] STORMGLASS_API_KEY not set — returning mock data.')
    return transform(MOCK_SG_WEATHER, MOCK_SG_TIDES, spot)
  }

  const now   = new Date()
  const start = now.toISOString()
  const end   = new Date(now.getTime() + 13 * 3_600_000).toISOString()

  const headers = { Authorization: apiKey }

  const weatherUrl = `${SG_BASE}/weather/point?lat=${spot.lat}&lng=${spot.lng}&params=${SG_PARAMS}&start=${start}&end=${end}&source=sg`
  const tideUrl    = `${SG_BASE}/tide/extremes/point?lat=${spot.lat}&lng=${spot.lng}&start=${start}&end=${end}`

  try {
    // Fetch weather + tides in parallel — eliminates waterfall
    const [weatherRes, tideRes] = await Promise.all([
      fetch(weatherUrl, { headers }),
      fetch(tideUrl,    { headers }),
    ])

    if (!weatherRes.ok) {
      console.error(`[SwellSense] Weather fetch ${weatherRes.status} — falling back to mock.`)
      return transform(MOCK_SG_WEATHER, MOCK_SG_TIDES, spot)
    }

    const weather: SGWeatherResponse = await weatherRes.json()
    const tide: SGTideResponse = tideRes.ok ? await tideRes.json() : { data: [] }

    return transform(weather, tide.data, spot)
  } catch (err) {
    console.error('[SwellSense] Fetch error — falling back to mock.', err)
    return transform(MOCK_SG_WEATHER, MOCK_SG_TIDES, spot)
  }
}

/**
 * getSurfData — the single public entry point.
 * React.cache() deduplicates within the same render pass.
 * 'use cache' inside fetchSurfDataRaw handles cross-request persistence.
 */
export const getSurfData = cache(fetchSurfDataRaw)
