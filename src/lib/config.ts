// ---------------------------------------------------------------------------
// Global feature flags
// ---------------------------------------------------------------------------

/**
 * When true, the Stormglass fetcher returns a hardcoded raw-API fixture
 * instead of hitting the real endpoint. This protects the free-tier quota
 * (10 requests/day) during development and CI.
 *
 * Set to false only after adding a real STORMGLASS_API_KEY to .env.local.
 *
 * Quota note for live mode (IS_MOCK_MODE = false):
 *   Each getSurfData() call = 2 API requests (weather + tides).
 *   Free tier: 10 req/day → max 5 getSurfData calls/day.
 *   cacheLife('hours') = 1-hour TTL → theoretical max 48 req/day.
 *   → For free tier, change cacheLife to { revalidate: 21_600 } (6 h)
 *     in src/lib/stormglass.ts to stay safely within quota.
 */
export const IS_MOCK_MODE = true;
