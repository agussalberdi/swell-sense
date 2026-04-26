'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState, useCallback } from 'react'
import { SPOTS } from '@/lib/spots'
import { getFavourites, toggleFavourite } from '@/lib/favourites'

const ALL_SPOTS = Object.values(SPOTS)

interface GeoResult {
  place_id: number
  display_name: string
  lat: string
  lon: string
}

function useDebounce<T>(value: T, ms: number): T {
  const [dv, setDv] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDv(value), ms)
    return () => clearTimeout(t)
  }, [value, ms])
  return dv
}

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  )
}

// ---------------------------------------------------------------------------
// SpotSelector — minimal dropdown with preset spots + Nominatim geocoding.
// Shows geocoded results when the typed filter finds fewer than 3 preset spots.
// ---------------------------------------------------------------------------
export default function SpotSelector() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const activeId     = searchParams.get('id') ?? 'lower-trestles'
  const customName   = searchParams.get('name')
  const activeSpot   = SPOTS[activeId]
  const displayName  = activeSpot?.name ?? customName ?? 'Choose a spot'

  const [open, setOpen]           = useState(false)
  const [filter, setFilter]       = useState('')
  const [favouriteIds, setFavIds] = useState<string[]>([])
  const [geoResults, setGeo]      = useState<GeoResult[]>([])
  const [geoLoading, setGeoLoad]  = useState(false)
  const containerRef              = useRef<HTMLDivElement>(null)
  const inputRef                  = useRef<HTMLInputElement>(null)
  const debouncedFilter           = useDebounce(filter, 400)

  useEffect(() => { setFavIds(getFavourites()) }, [])

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50)
    else { setFilter(''); setGeo([]) }
  }, [open])

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Filter preset spots
  const presetFiltered = ALL_SPOTS
    .filter((s) => s.name.toLowerCase().includes(debouncedFilter.toLowerCase()))
    .sort((a, b) => {
      const aFav = favouriteIds.includes(a.id)
      const bFav = favouriteIds.includes(b.id)
      if (aFav && !bFav) return -1
      if (!aFav && bFav) return 1
      return a.name.localeCompare(b.name)
    })

  // Nominatim geocoding — fires when query is ≥3 chars AND presets are sparse
  useEffect(() => {
    const q = debouncedFilter.trim()
    if (q.length < 3 || presetFiltered.length >= 3) {
      setGeo([])
      return
    }
    let cancelled = false
    setGeoLoad(true)
    fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=5&addressdetails=0`,
      { headers: { 'Accept-Language': 'en' } },
    )
      .then((r) => r.json())
      .then((data: GeoResult[]) => { if (!cancelled) { setGeo(data); setGeoLoad(false) } })
      .catch(() => { if (!cancelled) setGeoLoad(false) })
    return () => { cancelled = true }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedFilter])

  const handlePresetSelect = useCallback((spotId: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('id', spotId)
    params.delete('lat'); params.delete('lng'); params.delete('name')
    router.push(`?${params.toString()}`)
    setOpen(false)
  }, [router, searchParams])

  const handleGeoSelect = useCallback((result: GeoResult) => {
    const shortName = result.display_name.split(',').slice(0, 2).join(', ').trim()
    const params    = new URLSearchParams(searchParams.toString())
    params.delete('id')
    params.set('lat',  parseFloat(result.lat).toFixed(4))
    params.set('lng',  parseFloat(result.lon).toFixed(4))
    params.set('name', shortName)
    router.push(`?${params.toString()}`)
    setOpen(false)
  }, [router, searchParams])

  const handleHeart = useCallback((e: React.MouseEvent, spotId: string) => {
    e.stopPropagation()
    toggleFavourite(spotId)
    setFavIds(getFavourites())
  }, [])

  const hasActive     = !!activeSpot || !!customName
  const showGeo       = geoResults.length > 0 || geoLoading
  const showNoResults = presetFiltered.length === 0 && !showGeo && filter.length > 0

  return (
    <div ref={containerRef} className="relative">

      {/* ── Trigger button ─────────────────────────────── */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold transition-all max-w-[180px] sm:max-w-[220px]"
        style={{
          background: hasActive ? 'rgba(0,245,255,0.08)' : 'rgba(255,255,255,0.05)',
          border:     `1px solid ${hasActive ? 'rgba(0,245,255,0.3)' : 'rgba(255,255,255,0.1)'}`,
          color:      hasActive ? '#00F5FF' : '#64748B',
          boxShadow:  hasActive && open ? '0 0 10px rgba(0,245,255,0.2)' : 'none',
        }}
      >
        <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" aria-hidden style={{ flexShrink: 0 }}>
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
        </svg>
        <span className="truncate flex-1 text-left">{displayName}</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden
          style={{ flexShrink: 0, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s', color: '#64748B' }}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* ── Dropdown panel ─────────────────────────────── */}
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            className="absolute top-full left-0 mt-2 w-64 rounded-2xl overflow-hidden z-50"
            style={{
              background:     'rgba(16,33,62,0.97)',
              border:         '1px solid rgba(0,245,255,0.15)',
              backdropFilter: 'blur(16px)',
              boxShadow:      '0 12px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(0,245,255,0.05)',
            }}
          >
            {/* Search input */}
            <div className="flex items-center gap-2 px-3 py-2.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              {geoLoading ? (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" className="animate-spin" aria-hidden style={{ color: '#00F5FF', flexShrink: 0 }}>
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
              ) : (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden style={{ color: '#64748B', flexShrink: 0 }}>
                  <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                </svg>
              )}
              <input
                ref={inputRef}
                type="text"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder="Search spots…"
                className="bg-transparent outline-none flex-1 text-xs placeholder:text-slate-600"
                style={{ color: '#FFFFFF' }}
                aria-label="Search surf spots"
              />
              {filter && (
                <button onClick={() => { setFilter(''); setGeo([]) }} style={{ color: '#64748B' }} aria-label="Clear">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden>
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              )}
            </div>

            <div className="overflow-y-auto" style={{ maxHeight: 300 }}>

              {/* ── Preset spots ─────────────────────── */}
              {presetFiltered.length > 0 && (
                <ul role="listbox" aria-label="Preset spots">
                  {presetFiltered.map((spot) => {
                    const isActive = spot.id === activeId
                    const isFav    = favouriteIds.includes(spot.id)
                    return (
                      <li
                        key={spot.id}
                        role="option"
                        aria-selected={isActive}
                        onClick={() => handlePresetSelect(spot.id)}
                        className="flex items-center justify-between px-3 py-2.5 cursor-pointer"
                        style={{ background: isActive ? 'rgba(0,245,255,0.1)' : 'transparent', borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                        onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
                        onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = isActive ? 'rgba(0,245,255,0.1)' : 'transparent' }}
                      >
                        <span className="text-xs font-medium truncate flex-1" style={{ color: isActive ? '#00F5FF' : '#FFFFFF' }}>
                          {spot.name}
                        </span>
                        <button
                          onClick={(e) => handleHeart(e, spot.id)}
                          className="ml-2 flex-shrink-0"
                          style={{ color: isFav ? '#00F5FF' : '#3B4A60', opacity: isFav ? 1 : 0.5 }}
                          aria-label={isFav ? `Remove ${spot.name} from favourites` : `Add ${spot.name} to favourites`}
                        >
                          <HeartIcon filled={isFav} />
                        </button>
                      </li>
                    )
                  })}
                </ul>
              )}

              {/* ── Geocoded results ─────────────────── */}
              {showGeo && (
                <>
                  <div className="px-3 py-1.5" style={{ borderTop: presetFiltered.length > 0 ? '1px solid rgba(255,255,255,0.07)' : 'none' }}>
                    <span className="text-xs font-semibold" style={{ color: '#64748B', letterSpacing: '0.06em' }}>
                      {geoLoading ? 'SEARCHING…' : 'OTHER LOCATIONS'}
                    </span>
                  </div>
                  {!geoLoading && (
                    <ul role="listbox" aria-label="Custom locations">
                      {geoResults.map((r) => {
                        const parts   = r.display_name.split(',')
                        const primary = parts[0].trim()
                        const sub     = parts.slice(1, 3).join(',').trim()
                        return (
                          <li
                            key={r.place_id}
                            role="option"
                            aria-selected="false"
                            onClick={() => handleGeoSelect(r)}
                            className="px-3 py-2.5 cursor-pointer"
                            style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
                          >
                            <p className="text-xs font-medium truncate" style={{ color: '#FFFFFF' }}>{primary}</p>
                            {sub && <p className="text-xs truncate mt-0.5" style={{ color: '#64748B' }}>{sub}</p>}
                          </li>
                        )
                      })}
                    </ul>
                  )}
                </>
              )}

              {/* ── Empty state ──────────────────────── */}
              {showNoResults && (
                <p className="px-4 py-3 text-xs" style={{ color: '#64748B' }}>
                  No spots found — try a city or beach name
                </p>
              )}

            </div>
          </div>
        </>
      )}
    </div>
  )
}
