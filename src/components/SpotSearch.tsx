'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

interface NominatimResult {
  place_id: number
  display_name: string
  lat: string
  lon: string
  address?: {
    country?: string
    state?: string
    city?: string
    town?: string
  }
}

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}

function SearchIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  )
}

function SpinnerIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      aria-hidden
      className="animate-spin"
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  )
}

export default function SpotSearch() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [query, setQuery] = useState('')
  const [results, setResults] = useState<NominatimResult[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const debouncedQuery = useDebounce(query, 500)

  // Fetch from Nominatim when debounced query changes
  useEffect(() => {
    const trimmed = debouncedQuery.trim()
    if (trimmed.length < 2) {
      setResults([])
      setOpen(false)
      return
    }

    let cancelled = false
    setLoading(true)

    fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(trimmed)}&format=json&limit=6&addressdetails=1`,
      { headers: { 'Accept-Language': 'en' } },
    )
      .then((r) => r.json())
      .then((data: NominatimResult[]) => {
        if (!cancelled) {
          setResults(data)
          setOpen(data.length > 0)
          setLoading(false)
        }
      })
      .catch(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [debouncedQuery])

  // Close dropdown on outside click
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  const handleSelect = useCallback(
    (result: NominatimResult) => {
      // Strip verbose parts of display_name — keep first two segments
      const shortName = result.display_name.split(',').slice(0, 2).join(',').trim()
      const params = new URLSearchParams(searchParams.toString())
      params.delete('id')
      params.set('lat', parseFloat(result.lat).toFixed(4))
      params.set('lng', parseFloat(result.lon).toFixed(4))
      params.set('name', shortName)
      router.push(`?${params.toString()}`)
      setQuery('')
      setOpen(false)
    },
    [router, searchParams],
  )

  return (
    <div ref={containerRef} className="relative">
      {/* Input */}
      <div
        className="flex items-center gap-2 rounded-full px-3 py-1.5 text-sm transition-all"
        style={{
          background: 'rgba(255,255,255,0.06)',
          border: `1px solid ${query ? 'rgba(0,245,255,0.4)' : 'rgba(255,255,255,0.1)'}`,
          color: '#94A3B8',
        }}
      >
        <span style={{ color: query ? '#00F5FF' : '#94A3B8' }}>
          {loading ? <SpinnerIcon /> : <SearchIcon />}
        </span>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search a spot…"
          className="bg-transparent outline-none w-32 text-xs placeholder:text-slate-600"
          style={{ color: '#FFFFFF' }}
          aria-label="Search surf spots"
          aria-expanded={open}
          aria-controls="spot-search-results"
          role="combobox"
          autoComplete="off"
        />
        {query && (
          <button
            onClick={() => { setQuery(''); setOpen(false) }}
            className="text-slate-500 hover:text-slate-300 transition-colors"
            aria-label="Clear search"
          >
            ×
          </button>
        )}
      </div>

      {/* Dropdown */}
      {open && results.length > 0 && (
        <ul
          id="spot-search-results"
          role="listbox"
          className="absolute top-full left-0 mt-1.5 w-72 rounded-xl overflow-hidden z-50"
          style={{
            background: 'rgba(16, 33, 62, 0.97)',
            border: '1px solid rgba(0,245,255,0.2)',
            backdropFilter: 'blur(12px)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          }}
        >
          {results.map((r) => {
            const parts = r.display_name.split(',')
            const primary = parts[0].trim()
            const secondary = parts.slice(1, 3).join(',').trim()
            return (
              <li
                key={r.place_id}
                role="option"
                aria-selected="false"
                onClick={() => handleSelect(r)}
                className="px-4 py-2.5 cursor-pointer transition-colors text-sm"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
                onMouseEnter={(e) => {
                  ;(e.currentTarget as HTMLElement).style.background = 'rgba(0,245,255,0.08)'
                }}
                onMouseLeave={(e) => {
                  ;(e.currentTarget as HTMLElement).style.background = 'transparent'
                }}
              >
                <p className="font-medium truncate" style={{ color: '#FFFFFF' }}>{primary}</p>
                <p className="text-xs truncate mt-0.5" style={{ color: '#94A3B8' }}>{secondary}</p>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
