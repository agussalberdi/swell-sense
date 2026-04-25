import { cache } from 'react'
import type { Spot } from './spots'
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
  meteo?: number
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
// Mock fallback — used when the API key is not yet set
// ---------------------------------------------------------------------------
const MOCK_DATA: SurfData = {
  location: 'Lower Trestles',
  vibeScore: 88,
  description:
    'Glassy morning conditions with a building swell—perfect for a high-performance shortboard session.',
  waveHeight: '3–4 ft',
  period: '12 s',
  peakSwell: '4.2ft @ 12s',
  wind: { speed: '5 mph', direction: 'Offshore' },
  tide: { label: 'High', time: '10:45 AM' },
  waterTemp: { temp: '64°F', gear: 'Wetsuit' },
  boardPick: 'Take the Fish – the waves are soft and fat.',
  forecast: [
    { hour: 'Now', height: 3.5 },
    { hour: '3h',  height: 4.2 },
    { hour: '6h',  height: 4.8 },
    { hour: '9h',  height: 3.9 },
    { hour: '12h', height: 3.1 },
  ],
}

// ---------------------------------------------------------------------------
// Transform raw Stormglass response → SurfData
// ---------------------------------------------------------------------------
function transform(
  weather: SGWeatherResponse,
  tideData: SGTideExtreme[],
  spot: Spot,
): SurfData {
  const hours = weather.hours
  if (!hours.length) return { ...MOCK_DATA, location: spot.name }

  const now = hours[0]

  // Current readings
  const waveHeightM = best(now.waveHeight)
  const wavePeriod   = best(now.wavePeriod)
  const windSpeedMS  = best(now.windSpeed)
  const windDir      = best(now.windDirection)
  const swellDir     = best(now.swellDirection)
  const waterTempC   = best(now.waterTemperature, 18)

  const waveHeightFt = waveHeightM * 3.28084
  const windSpeedMph = windSpeedMS * 2.23694
  const waterTempF   = Math.round(waterTempC * 9 / 5 + 32)

  // Wind classification
  const windType = classifyWind(windSpeedMS, windDir, spot.facingDeg)
  const windLabel =
    windType === 'glassy' ? 'Glassy' :
    windType === 'offshore' ? 'Offshore' :
    windType === 'cross-off' ? `Cross-off (${compassLabel(windDir)})` :
    `Onshore (${compassLabel(windDir)})`

  // Vibe score
  const vibeScore = calcVibeScore({
    waveHeight: waveHeightM,
    wavePeriod,
    windSpeed: windSpeedMS,
    windDirection: windDir,
    swellDirection: swellDir,
    beachFacingDeg: spot.facingDeg,
  })

  // Forecast — 5 points at 0 / 3 / 6 / 9 / 12 hours
  const forecastIndices = [0, 3, 6, 9, 12]
  const forecast = forecastIndices.map((idx, i) => {
    const h = hours[idx] ?? hours[hours.length - 1]
    return {
      hour: i === 0 ? 'Now' : `${idx}h`,
      height: parseFloat((best(h.waveHeight) * 3.28084).toFixed(1)),
    }
  })

  // Peak swell in the 12-hour window
  const peakHour = hours.reduce((a, b) =>
    best(a.waveHeight) >= best(b.waveHeight) ? a : b,
  )
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
    location: spot.name,
    vibeScore,
    description: sessionDescription(vibeScore, waveHeightFt, wavePeriod, windType),
    waveHeight: fmtHeightRange(waveHeightM),
    period: `${Math.round(wavePeriod)} s`,
    peakSwell: `${peakFt}ft @ ${peakPeriod}s`,
    wind: {
      speed: `${Math.round(windSpeedMph)} mph`,
      direction: windLabel,
    },
    tide: tideLabel,
    waterTemp: {
      temp: `${waterTempF}°F`,
      gear: gearFromTemp(waterTempC),
    },
    boardPick: boardPick(waveHeightFt, wavePeriod),
    forecast,
  }
}

// ---------------------------------------------------------------------------
// Stormglass API fetch (runs on the server)
// Wrapped in React.cache() for per-request deduplication.
// Next.js fetch cache with revalidate: 1800 handles cross-request caching.
// ---------------------------------------------------------------------------
const SG_BASE = 'https://api.stormglass.io/v2'
const SG_PARAMS = [
  'waveHeight', 'wavePeriod', 'swellDirection', 'swellHeight',
  'windSpeed', 'windDirection', 'waterTemperature',
].join(',')

async function fetchSurfDataRaw(spot: Spot): Promise<SurfData> {
  const apiKey = process.env.STORMGLASS_API_KEY

  if (!apiKey || apiKey === 'your_api_key_here') {
    console.warn(
      '[SwellSense] STORMGLASS_API_KEY not set — returning mock data.\n' +
      '            Add your key to .env.local to enable live data.',
    )
    return { ...MOCK_DATA, location: spot.name }
  }

  const now   = new Date()
  const start = now.toISOString()
  const end   = new Date(now.getTime() + 13 * 60 * 60 * 1000).toISOString() // 13 h window

  const headers = { Authorization: apiKey }
  const revalidate = 1800 // 30 min — fits Stormglass free-tier quota of 10 req/day

  const weatherUrl = `${SG_BASE}/weather/point?lat=${spot.lat}&lng=${spot.lng}&params=${SG_PARAMS}&start=${start}&end=${end}&source=sg`
  const tideUrl    = `${SG_BASE}/tide/extremes/point?lat=${spot.lat}&lng=${spot.lng}&start=${start}&end=${end}`

  try {
    // Fetch weather + tides in parallel (eliminates waterfall)
    const [weatherRes, tideRes] = await Promise.all([
      fetch(weatherUrl, { headers, next: { revalidate } }),
      fetch(tideUrl,    { headers, next: { revalidate } }),
    ])

    if (!weatherRes.ok) {
      console.error(`[SwellSense] Weather fetch ${weatherRes.status} — falling back to mock.`)
      return { ...MOCK_DATA, location: spot.name }
    }

    const weather: SGWeatherResponse = await weatherRes.json()
    const tide: SGTideResponse = tideRes.ok ? await tideRes.json() : { data: [] }

    return transform(weather, tide.data, spot)
  } catch (err) {
    console.error('[SwellSense] Fetch error — falling back to mock.', err)
    return { ...MOCK_DATA, location: spot.name }
  }
}

/**
 * getSurfData — the single public entry point.
 * React.cache() deduplicates within the same render pass.
 */
export const getSurfData = cache(fetchSurfDataRaw)
