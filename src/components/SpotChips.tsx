'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
import { SPOTS } from '@/lib/spots'
import { getFavourites, toggleFavourite } from '@/lib/favourites'

const ALL_SPOTS = Object.values(SPOTS)

// Heart icon
function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      width="11"
      height="11"
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  )
}

export default function SpotChips() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const activeId = searchParams.get('id') ?? 'lower-trestles'

  const [favouriteIds, setFavouriteIds] = useState<string[]>([])

  // Load favourites on mount (client-only)
  useEffect(() => {
    setFavouriteIds(getFavourites())
  }, [])

  const handleToggleFavourite = useCallback(
    (e: React.MouseEvent, spotId: string) => {
      e.stopPropagation()
      toggleFavourite(spotId)
      setFavouriteIds(getFavourites())
    },
    [],
  )

  const handleSelect = useCallback(
    (spotId: string) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set('id', spotId)
      // Remove custom lat/lng if selecting a known spot
      params.delete('lat')
      params.delete('lng')
      params.delete('name')
      router.push(`?${params.toString()}`)
    },
    [router, searchParams],
  )

  // Sort: favourites first, then alphabetical
  const sorted = [...ALL_SPOTS].sort((a, b) => {
    const aFav = favouriteIds.includes(a.id)
    const bFav = favouriteIds.includes(b.id)
    if (aFav && !bFav) return -1
    if (!aFav && bFav) return 1
    return a.name.localeCompare(b.name)
  })

  return (
    <div
      className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide"
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      role="list"
      aria-label="Surf spots"
    >
      {sorted.map((spot) => {
        const isActive = spot.id === activeId
        const isFav = favouriteIds.includes(spot.id)

        return (
          <button
            key={spot.id}
            role="listitem"
            onClick={() => handleSelect(spot.id)}
            className="flex items-center gap-1.5 flex-shrink-0 rounded-full px-3 py-1 text-xs font-semibold transition-all"
            style={{
              background: isActive
                ? 'rgba(0,245,255,0.15)'
                : 'rgba(255,255,255,0.06)',
              border: `1px solid ${isActive ? '#00F5FF' : 'rgba(255,255,255,0.1)'}`,
              color: isActive ? '#00F5FF' : '#94A3B8',
              boxShadow: isActive ? '0 0 8px rgba(0,245,255,0.25)' : 'none',
            }}
            aria-current={isActive ? 'true' : undefined}
          >
            {isFav && (
              <span style={{ color: '#00F5FF' }}>
                <HeartIcon filled />
              </span>
            )}
            {spot.name}
            <span
              className="opacity-0 group-hover:opacity-100 transition-opacity ml-0.5"
              style={{ color: isFav ? '#00F5FF' : '#94A3B8' }}
              onClick={(e) => handleToggleFavourite(e, spot.id)}
              role="button"
              aria-label={isFav ? `Remove ${spot.name} from favourites` : `Add ${spot.name} to favourites`}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  handleToggleFavourite(e as unknown as React.MouseEvent, spot.id)
                }
              }}
            >
              <HeartIcon filled={isFav} />
            </span>
          </button>
        )
      })}
    </div>
  )
}
