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
  waveHeight: string
  period: string
  peakSwell: string
  wind: { speed: string; direction: string }
  tide: { label: string; time: string }
  waterTemp: { temp: string; gear: string }
  boardPick: string
  forecast: { hour: string; height: number }[]
  // ── Phase 4 additions ──────────────────────────────────────────────────
  weekForecast: { date: string; vibeScore: number; maxHeightFt: number }[]
  tidalCurve: { hour: number; heightM: number }[]
  windRoseData: { direction: number; speed: number }[]
  swellWindow: { startHour: string; endHour: string; score: number } | null
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
  seaLevel?: SGSourceMap
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
// Helpers
// ---------------------------------------------------------------------------

function best(src: SGSourceMap | undefined, fallback = 0): number {
  if (!src) return fallback
  return src.sg ?? src.noaa ?? src.meto ?? src.dwd ?? src.icon ?? fallback
}

function fmtHeightRange(metres: number): string {
  const ft = metres * 3.28084
  const lo = Math.floor(ft)
  const hi = lo + 1
  if (ft < 1) return `${ft.toFixed(1)} ft`
  return `${lo}–${hi} ft`
}

function compassLabel(deg: number): string {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
  return dirs[Math.round(deg / 45) % 8]
}

// ---------------------------------------------------------------------------
// Mock fixture — raw Stormglass API format for a "Great" day at Trestles.
// 168 hours (7 days) of data with a realistic wave pattern.
// ---------------------------------------------------------------------------
function buildMockHours(): SGWeatherHour[] {
  const base = new Date('2026-04-25T13:00:00Z') // 6 AM PDT
  return Array.from({ length: 168 }, (_, i) => {
    const day = Math.floor(i / 24)
    const hourOfDay = i % 24
    // Wave size varies by day (builds Mon, peaks Wed, fades)
    const dayMultiplier = [1.0, 1.1, 1.3, 1.2, 0.9, 0.7, 0.6][day] ?? 1.0
    // Within a day, peak at hour 6 of the day
    const distFromPeak = Math.abs(hourOfDay - 6)
    const heightM = parseFloat((1.12 * dayMultiplier - distFromPeak * 0.015).toFixed(2))
    // Tidal sea level — simple sinusoidal (2 cycles/day)
    const seaLevel = parseFloat((0.9 + 0.9 * Math.sin((i / 6.2) * Math.PI)).toFixed(2))
    return {
      time: new Date(base.getTime() + i * 3_600_000).toISOString(),
      waveHeight:       { sg: Math.max(0.3, heightM) },
      wavePeriod:       { sg: 13 },
      swellDirection:   { sg: 210 },
      swellHeight:      { sg: parseFloat((Math.max(0.3, heightM) * 0.9).toFixed(2)) },
      windSpeed:        { sg: 2.0 },
      windDirection:    { sg: 50 },
      waterTemperature: { sg: 18.2 },
      seaLevel:         { sg: seaLevel },
    }
  })
}

const MOCK_SG_WEATHER: SGWeatherResponse = { hours: buildMockHours() }

const MOCK_SG_TIDES: SGTideExtreme[] = [
  { time: '2026-04-25T17:45:00Z', type: 'high', height: 1.8 },
  { time: '2026-04-26T00:32:00Z', type: 'low',  height: 0.3 },
  { time: '2026-04-26T06:18:00Z', type: 'high', height: 1.6 },
  { time: '2026-04-26T12:44:00Z', type: 'low',  height: 0.5 },
]

// ---------------------------------------------------------------------------
// Transform raw Stormglass response → SurfData
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
    waveHeight:     waveHeightM,
    wavePeriod,
    windSpeed:      windSpeedMS,
    windDirection:  windDir,
    swellDirection: swellDir,
    beachFacingDeg: spot.facingDeg,
  })

  // 5-point 12-h forecast at 0 / 3 / 6 / 9 / 12 h
  const forecast = [0, 3, 6, 9, 12].map((idx, i) => {
    const h = hours[idx] ?? hours[hours.length - 1]
    return {
      hour: i === 0 ? 'Now' : `${idx}h`,
      height: parseFloat((best(h.waveHeight) * 3.28084).toFixed(1)),
    }
  })

  // Peak swell in the 12-h window
  const first13 = hours.slice(0, 13)
  const peakHour   = first13.reduce((a, b) => best(a.waveHeight) >= best(b.waveHeight) ? a : b)
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
          timeZone: 'America/Los_Angeles',
        }),
      }
    : { label: '–', time: '–' }

  // ── Phase 4: 7-day forecast ─────────────────────────────────────────────
  const weekForecast: SurfData['weekForecast'] = Array.from({ length: 7 }, (_, day) => {
    const dayHours = hours.slice(day * 24, (day + 1) * 24)
    if (!dayHours.length) return { date: '', vibeScore: 0, maxHeightFt: 0 }
    const maxH = Math.max(...dayHours.map((h) => best(h.waveHeight)))
    const midHour = dayHours[Math.floor(dayHours.length / 2)]
    const dayScore = calcVibeScore({
      waveHeight:     best(midHour.waveHeight),
      wavePeriod:     best(midHour.wavePeriod),
      windSpeed:      best(midHour.windSpeed),
      windDirection:  best(midHour.windDirection),
      swellDirection: best(midHour.swellDirection),
      beachFacingDeg: spot.facingDeg,
    })
    const date = new Date(dayHours[0].time).toLocaleDateString('en-US', {
      weekday: 'short',
      timeZone: 'UTC',
    })
    return {
      date,
      vibeScore: dayScore,
      maxHeightFt: parseFloat((maxH * 3.28084).toFixed(1)),
    }
  })

  // ── Phase 4: tidal curve (first 24 hours) ───────────────────────────────
  const tidalCurve: SurfData['tidalCurve'] = hours.slice(0, 24).map((h, i) => ({
    hour: i,
    heightM: parseFloat(best(h.seaLevel, 0.9).toFixed(2)),
  }))

  // ── Phase 4: wind rose data (first 24 hours) ────────────────────────────
  const windRoseData: SurfData['windRoseData'] = hours.slice(0, 24).map((h) => ({
    direction: best(h.windDirection),
    speed: best(h.windSpeed),
  }))

  // ── Phase 4: best 2-hour swell window in the first 12 hours ─────────────
  let swellWindow: SurfData['swellWindow'] = null
  let bestWindowScore = -1
  for (let i = 0; i <= first13.length - 2; i++) {
    const h1 = first13[i]
    const h2 = first13[i + 1]
    const s1 = calcVibeScore({
      waveHeight:     best(h1.waveHeight),
      wavePeriod:     best(h1.wavePeriod),
      windSpeed:      best(h1.windSpeed),
      windDirection:  best(h1.windDirection),
      swellDirection: best(h1.swellDirection),
      beachFacingDeg: spot.facingDeg,
    })
    const s2 = calcVibeScore({
      waveHeight:     best(h2.waveHeight),
      wavePeriod:     best(h2.wavePeriod),
      windSpeed:      best(h2.windSpeed),
      windDirection:  best(h2.windDirection),
      swellDirection: best(h2.swellDirection),
      beachFacingDeg: spot.facingDeg,
    })
    const avg = Math.round((s1 + s2) / 2)
    if (avg > bestWindowScore) {
      bestWindowScore = avg
      const t1 = new Date(h1.time).toLocaleTimeString('en-US', {
        hour: 'numeric', minute: '2-digit', timeZone: 'America/Los_Angeles',
      })
      const t2 = new Date(h2.time).toLocaleTimeString('en-US', {
        hour: 'numeric', minute: '2-digit', timeZone: 'America/Los_Angeles',
      })
      swellWindow = { startHour: t1, endHour: t2, score: avg }
    }
  }

  return {
    location:     spot.name,
    vibeScore,
    description:  sessionDescription(vibeScore, waveHeightFt, wavePeriod, windType),
    waveHeight:   fmtHeightRange(waveHeightM),
    period:       `${Math.round(wavePeriod)} s`,
    peakSwell:    `${peakFt}ft @ ${peakPeriod}s`,
    wind:         { speed: `${Math.round(windSpeedMph)} mph`, direction: windLabel },
    tide:         tideLabel,
    waterTemp:    { temp: `${waterTempF}°F`, gear: gearFromTemp(waterTempC) },
    boardPick:    boardPick(waveHeightFt, wavePeriod),
    forecast,
    weekForecast,
    tidalCurve,
    windRoseData,
    swellWindow,
  }
}

// ---------------------------------------------------------------------------
// Stormglass API fetch — server-only, wrapped in Next.js Data Cache.
//
// 'use cache' + cacheLife('hours') → persists across requests for 1 hour.
// React.cache() on the export → deduplicates within a single render pass.
//
// ⚠ Free-tier quota (10 req/day): each call = 2 API requests (weather + tides).
//   For free tier, consider { revalidate: 21_600 } (6 h) once IS_MOCK_MODE=false.
// ---------------------------------------------------------------------------
const SG_BASE   = 'https://api.stormglass.io/v2'
const SG_PARAMS = [
  'waveHeight', 'wavePeriod', 'swellDirection', 'swellHeight',
  'windSpeed', 'windDirection', 'waterTemperature', 'seaLevel',
].join(',')
const FETCH_HOURS = 168 // 7 days for the week strip

async function fetchSurfDataRaw(spot: Spot): Promise<SurfData> {
  'use cache'
  // 6-hour TTL: protects Stormglass free tier (10 req/day, 2 per call).
  // 4 refreshes/day per spot = 8 API calls — safely within the 10 req limit.
  // If quota is exceeded, the error handler below falls back to mock data.
  cacheLife({ revalidate: 21_600, expire: 86_400 })

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
  const end   = new Date(now.getTime() + FETCH_HOURS * 3_600_000).toISOString()
  const headers = { Authorization: apiKey }

  const weatherUrl = `${SG_BASE}/weather/point?lat=${spot.lat}&lng=${spot.lng}&params=${SG_PARAMS}&start=${start}&end=${end}&source=sg`
  const tideUrl    = `${SG_BASE}/tide/extremes/point?lat=${spot.lat}&lng=${spot.lng}&start=${start}&end=${end}`

  try {
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
 * 'use cache' inside fetchSurfDataRaw handles cross-request Data Cache.
 */
export const getSurfData = cache(fetchSurfDataRaw)
