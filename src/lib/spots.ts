export interface Spot {
  id: string
  name: string
  lat: number
  lng: number
  /** UTC offset in hours (e.g. -7 for PDT) */
  utcOffset: number
  /** Compass bearing the beach face points toward (degrees). Used to calculate offshore wind. */
  facingDeg: number
}

export const SPOTS: Record<string, Spot> = {
  'lower-trestles': {
    id: 'lower-trestles',
    name: 'Lower Trestles',
    lat: 33.3822,
    lng: -117.5897,
    utcOffset: -7,
    facingDeg: 225, // faces WSW
  },
  'pipeline': {
    id: 'pipeline',
    name: 'Pipeline',
    lat: 21.6644,
    lng: -158.0539,
    utcOffset: -10,
    facingDeg: 315, // faces NW
  },
  'jeffreys-bay': {
    id: 'jeffreys-bay',
    name: "Jeffreys Bay",
    lat: -34.0527,
    lng: 24.9302,
    utcOffset: 2,
    facingDeg: 90, // faces E
  },
  'hossegor': {
    id: 'hossegor',
    name: 'Hossegor',
    lat: 43.6633,
    lng: -1.4297,
    utcOffset: 2,
    facingDeg: 270, // faces W
  },
  'uluwatu': {
    id: 'uluwatu',
    name: 'Uluwatu',
    lat: -8.8291,
    lng: 115.0849,
    utcOffset: 8,
    facingDeg: 180, // faces S
  },
}

export const DEFAULT_SPOT = SPOTS['lower-trestles']
