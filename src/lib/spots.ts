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
  // ── North America ─────────────────────────────────────────────────────────
  'lower-trestles': {
    id: 'lower-trestles',
    name: 'Lower Trestles',
    lat: 33.3822,
    lng: -117.5897,
    utcOffset: -7,
    facingDeg: 225,
  },
  'mavericks': {
    id: 'mavericks',
    name: 'Mavericks',
    lat: 37.4932,
    lng: -122.5003,
    utcOffset: -7,
    facingDeg: 270,
  },
  'pipeline': {
    id: 'pipeline',
    name: 'Pipeline',
    lat: 21.6644,
    lng: -158.0539,
    utcOffset: -10,
    facingDeg: 315,
  },
  'sunset-beach': {
    id: 'sunset-beach',
    name: 'Sunset Beach',
    lat: 21.6783,
    lng: -158.0469,
    utcOffset: -10,
    facingDeg: 0,
  },
  'puerto-escondido': {
    id: 'puerto-escondido',
    name: 'Puerto Escondido',
    lat: 15.8647,
    lng: -97.0500,
    utcOffset: -6,
    facingDeg: 180,
  },
  'tofino': {
    id: 'tofino',
    name: 'Tofino',
    lat: 49.1530,
    lng: -125.9067,
    utcOffset: -7,
    facingDeg: 270,
  },

  // ── South America ─────────────────────────────────────────────────────────
  'chicama': {
    id: 'chicama',
    name: 'Chicama',
    lat: -7.8443,
    lng: -79.4497,
    utcOffset: -5,
    facingDeg: 270,
  },
  'punta-de-lobos': {
    id: 'punta-de-lobos',
    name: 'Punta de Lobos',
    lat: -34.4128,
    lng: -72.0133,
    utcOffset: -3,
    facingDeg: 270,
  },
  'pichilemu': {
    id: 'pichilemu',
    name: 'Pichilemu',
    lat: -34.3873,
    lng: -72.0036,
    utcOffset: -3,
    facingDeg: 270,
  },
  'mar-del-plata': {
    id: 'mar-del-plata',
    name: 'Mar del Plata',
    lat: -38.0055,
    lng: -57.5426,
    utcOffset: -3,
    facingDeg: 90,
  },
  'florianopolis': {
    id: 'florianopolis',
    name: 'Florianópolis',
    lat: -27.7647,
    lng: -48.5044,
    utcOffset: -3,
    facingDeg: 90,
  },

  // ── Europe ────────────────────────────────────────────────────────────────
  'hossegor': {
    id: 'hossegor',
    name: 'Hossegor',
    lat: 43.6633,
    lng: -1.4297,
    utcOffset: 2,
    facingDeg: 270,
  },
  'mundaka': {
    id: 'mundaka',
    name: 'Mundaka',
    lat: 43.4054,
    lng: -2.6994,
    utcOffset: 2,
    facingDeg: 0,
  },
  'nazare': {
    id: 'nazare',
    name: 'Nazaré',
    lat: 39.6008,
    lng: -9.0692,
    utcOffset: 1,
    facingDeg: 270,
  },
  'ericeira': {
    id: 'ericeira',
    name: 'Ericeira',
    lat: 38.9619,
    lng: -9.4147,
    utcOffset: 1,
    facingDeg: 315,
  },
  'anchor-point': {
    id: 'anchor-point',
    name: 'Anchor Point',
    lat: 30.4238,
    lng: -9.6396,
    utcOffset: 1,
    facingDeg: 315,
  },
  'fistral': {
    id: 'fistral',
    name: 'Fistral Beach',
    lat: 50.4085,
    lng: -5.1042,
    utcOffset: 1,
    facingDeg: 270,
  },

  // ── Africa ────────────────────────────────────────────────────────────────
  'jeffreys-bay': {
    id: 'jeffreys-bay',
    name: 'Jeffreys Bay',
    lat: -34.0527,
    lng: 24.9302,
    utcOffset: 2,
    facingDeg: 90,
  },
  'skeleton-bay': {
    id: 'skeleton-bay',
    name: 'Skeleton Bay',
    lat: -22.8833,
    lng: 14.4833,
    utcOffset: 2,
    facingDeg: 180,
  },
  'durban': {
    id: 'durban',
    name: 'Durban',
    lat: -29.8587,
    lng: 31.0218,
    utcOffset: 2,
    facingDeg: 90,
  },

  // ── Australia ─────────────────────────────────────────────────────────────
  'snapper-rocks': {
    id: 'snapper-rocks',
    name: 'Snapper Rocks',
    lat: -28.1679,
    lng: 153.5498,
    utcOffset: 10,
    facingDeg: 90,
  },
  'bells-beach': {
    id: 'bells-beach',
    name: 'Bells Beach',
    lat: -38.3688,
    lng: 144.2833,
    utcOffset: 10,
    facingDeg: 180,
  },
  'margaret-river': {
    id: 'margaret-river',
    name: 'Margaret River',
    lat: -33.9526,
    lng: 114.9819,
    utcOffset: 8,
    facingDeg: 225,
  },
  'noosa': {
    id: 'noosa',
    name: 'Noosa',
    lat: -26.3898,
    lng: 153.0899,
    utcOffset: 10,
    facingDeg: 90,
  },

  // ── Indonesia & Pacific ───────────────────────────────────────────────────
  'uluwatu': {
    id: 'uluwatu',
    name: 'Uluwatu',
    lat: -8.8291,
    lng: 115.0849,
    utcOffset: 8,
    facingDeg: 180,
  },
  'padang-padang': {
    id: 'padang-padang',
    name: 'Padang Padang',
    lat: -8.8186,
    lng: 115.0879,
    utcOffset: 8,
    facingDeg: 225,
  },
  'keramas': {
    id: 'keramas',
    name: 'Keramas',
    lat: -8.6333,
    lng: 115.3167,
    utcOffset: 8,
    facingDeg: 90,
  },
  'desert-point': {
    id: 'desert-point',
    name: 'Desert Point',
    lat: -8.7457,
    lng: 116.0456,
    utcOffset: 8,
    facingDeg: 180,
  },
  'cloudbreak': {
    id: 'cloudbreak',
    name: 'Cloudbreak',
    lat: -17.8636,
    lng: 177.1533,
    utcOffset: 12,
    facingDeg: 225,
  },
  'teahupoo': {
    id: 'teahupoo',
    name: "Teahupo'o",
    lat: -17.8477,
    lng: -149.2632,
    utcOffset: -10,
    facingDeg: 225,
  },
  'g-land': {
    id: 'g-land',
    name: 'G-Land',
    lat: -8.6333,
    lng: 114.3500,
    utcOffset: 8,
    facingDeg: 180,
  },
  'siargao': {
    id: 'siargao',
    name: 'Siargao',
    lat: 9.8603,
    lng: 126.0499,
    utcOffset: 8,
    facingDeg: 90,
  },
  'supertubes': {
    id: 'supertubes',
    name: 'Supertubes',
    lat: -34.0488,
    lng: 24.9299,
    utcOffset: 2,
    facingDeg: 90,
  },
}

export const DEFAULT_SPOT = SPOTS['lower-trestles']

// ---------------------------------------------------------------------------
// resolveSpot — maps URL search params to a Spot.
// Priority: ?id (known spot) → ?lat+lng (custom) → DEFAULT_SPOT
// ---------------------------------------------------------------------------
export function resolveSpot(params: {
  id?: string
  lat?: string
  lng?: string
  name?: string
}): Spot {
  if (params.id && SPOTS[params.id]) {
    return SPOTS[params.id]
  }

  const lat = parseFloat(params.lat ?? '')
  const lng = parseFloat(params.lng ?? '')
  if (!isNaN(lat) && !isNaN(lng)) {
    return {
      id: `custom-${lat.toFixed(4)}-${lng.toFixed(4)}`,
      name: params.name ?? `${lat.toFixed(2)}°, ${lng.toFixed(2)}°`,
      lat,
      lng,
      utcOffset: Math.round(lng / 15), // rough estimate from longitude
      facingDeg: 225, // neutral default
    }
  }

  return DEFAULT_SPOT
}
