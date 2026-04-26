'use client'

// ---------------------------------------------------------------------------
// Favourites — typed localStorage schema v1
// Only imported by Client Components (e.g. SpotSelector).
// ---------------------------------------------------------------------------

const STORAGE_KEY = 'swellsense-favourites'

interface FavouritesStore {
  version: 1
  ids: string[]
}

function read(): FavouritesStore {
  if (typeof window === 'undefined') return { version: 1, ids: [] }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { version: 1, ids: [] }
    const parsed = JSON.parse(raw) as Partial<FavouritesStore>
    if (parsed.version === 1 && Array.isArray(parsed.ids)) {
      return parsed as FavouritesStore
    }
  } catch {
    // corrupt storage — reset
  }
  return { version: 1, ids: [] }
}

function write(store: FavouritesStore): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
}

/** Returns the current list of favourite spot IDs. */
export function getFavourites(): string[] {
  return read().ids
}

/** Returns true if the given spot ID is favourited. */
export function isFavourite(id: string): boolean {
  return read().ids.includes(id)
}

/** Adds a spot ID to favourites. No-op if already present. */
export function addFavourite(id: string): void {
  const store = read()
  if (!store.ids.includes(id)) {
    write({ ...store, ids: [id, ...store.ids] })
  }
}

/** Removes a spot ID from favourites. No-op if not present. */
export function removeFavourite(id: string): void {
  const store = read()
  write({ ...store, ids: store.ids.filter((x) => x !== id) })
}

/** Toggles a spot ID in favourites. Returns the new favourite state. */
export function toggleFavourite(id: string): boolean {
  if (isFavourite(id)) {
    removeFavourite(id)
    return false
  }
  addFavourite(id)
  return true
}
