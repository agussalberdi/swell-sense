# SwellSense Roadmap

> **North Star:** A fully live AI Surf Caddy that tells you exactly when, where, and what board to ride — before you leave the house.
>
> **AI Session Tip:** Read `AGENTS.md` + `DESIGN.md` first. Each phase below is self-contained; link the relevant issue/branch at the top of your session.

---

## Current State (Phase 0 — complete ✅)

| What exists | File |
|---|---|
| Static dashboard UI matching the Stitch design | `src/app/page.tsx` |
| Animated SVG Vibe Score gauge (270° arc, stroke-dashoffset) | `src/components/VibeGauge.tsx` |
| Interactive SVG forecast area chart | `src/components/ForecastChart.tsx` |
| Deep Sea design tokens + `@keyframes` | `src/app/globals.css` |
| Inter + JetBrains Mono via `next/font` | `src/app/layout.tsx` |
| All data is **mock / hardcoded** | `src/app/page.tsx` → `SURF_DATA` |

---

## Phase 1 — Live Data Layer ✅

**Goal:** Replace mock data with real Stormglass API calls. The Vibe Score must be calculated server-side from actual ocean conditions.

### 1.1 Environment & API Client ✅
- [x] Add `STORMGLASS_API_KEY` to `.env.local` (placeholder — real key to be added before go-live)
- [x] Create `src/lib/stormglass.ts` — typed API client with `Promise.all` for parallel fetching of wave, weather, and tide endpoints
- [x] Add `src/lib/vibe-score.ts` — deterministic scoring function:
  ```
  vibeScore(waveHeight, period, windSpeed, windDir, swellDir, tide) → 0–100
  ```
  Consider: wave height sweet spot (3–6ft = max points), offshore wind bonus, period bonus (>10s), tide multiplier
- [x] Add `src/lib/config.ts` — `IS_MOCK_MODE` flag to protect free-tier quota during development
- [x] Add raw Stormglass-format mock fixture in `stormglass.ts` (goes through same `transform()` path as live data)

### 1.2 Server-Side Data Fetching ✅
- [x] Convert `page.tsx` `SURF_DATA` constant to `async` fetch using `React.cache()` for per-request deduplication
- [x] Cache with `'use cache'` + `cacheLife('hours')` (Next.js 16 Data Cache, 1-hour TTL); `experimental.useCache: true` in `next.config.ts`
- [x] Create `src/app/loading.tsx` — full-page skeleton matching the dashboard layout

### 1.3 Location ✅
- [x] Hardcode initial coordinates for Lower Trestles (`33.3822° N, 117.5897° W`)
- [x] Store as `SPOTS` constant in `src/lib/spots.ts` for future multi-spot support

**Key file:** `src/lib/stormglass.ts`
**Stormglass docs:** https://docs.stormglass.io/#wave-forecast

---

## Phase 2 — AI Board Pick (Real) ✅

**Goal:** Replace the hardcoded board recommendation with a live AI-generated briefing.

### 2.1 Vercel AI SDK Integration ✅
- [x] `npm install ai @ai-sdk/openai @ai-sdk/react` (AI SDK v6)
- [x] Create `src/app/api/briefing/route.ts` — streaming Route Handler (`streamText` → `toTextStreamResponse()`)
- [x] Prompt template: board quiver, conditions, 2-sentence output format

### 2.2 Streaming UI ✅
- [x] Create `src/components/AIBriefing.tsx` — Client Component with typewriter animation on server-precomputed text; `useCompletion` from `@ai-sdk/react` for "Ask again" live re-generation
- [x] Blinking neon-cyan cursor while text is animating or streaming
- [x] `generateBriefing()` in `src/lib/briefing.ts` wraps `generateText` with `'use cache'` + `cacheLife('hours')` — OpenAI called at most once per hour

### 2.3 Prompt Engineering ✅
- [x] Board quiver injected into prompt: `[shortboard, fish, longboard, step-up, gun]` — AI picks the right tool
- [ ] Include surfer skill level as a query param (`?level=intermediate`) for personalised picks — deferred to Phase 6 (Auth)

**Key files:** `src/lib/briefing.ts`, `src/app/api/briefing/route.ts`, `src/components/AIBriefing.tsx`

---

## Phase 3 — Multi-Spot & Location Search ✅

**Goal:** Let the user pick any surf spot in the world.

### 3.1 Spot Search ✅
- [x] Create `src/components/SpotSearch.tsx` — Client Component with debounced input
- [x] Geocode via OpenStreetMap Nominatim (free, 500 ms debounce)
- [x] On spot select: shallow-push `?lat=&lng=&name=` to the URL (no full page reload)

### 3.2 URL-Driven State ✅
- [x] `page.tsx` reads `searchParams` for coordinates — makes every dashboard URL shareable + bookmarkable
- [x] Add a "Favourite Spots" list persisted in `localStorage` (versioned schema, `v1`) via `src/lib/favourites.ts`

### 3.3 Spot Library ✅
- [x] Pre-seed `src/lib/spots.ts` with 20 iconic spots (Pipeline, Jeffreys Bay, Hossegor, Uluwatu, etc.) with coordinates + UTC offset
- [x] Render as quick-select chips in the header (`SpotChips.tsx`) — favourites sorted to front, heart toggle

---

## Phase 4 — Tidal & Wind Detail View ✅

**Goal:** Expand the forecast beyond 12 hours with richer data visualisation.

- [x] **7-Day Forecast Strip** — horizontal scroll row showing daily Vibe Score bars (RSC, no JS) — `WeekStrip.tsx`
- [x] **Tidal Chart** — SVG sine-wave chart showing today's tide curve (high/low points annotated) — `TidalChart.tsx`
- [x] **Wind Rose** — SVG polar chart showing wind direction/speed breakdown — `WindRose.tsx`
- [x] **Swell Window** — highlight the optimal 2-hour window within the day (computed server-side in `transform()`, rendered as badge in `page.tsx`)

**New components:** `WeekStrip.tsx`, `TidalChart.tsx`, `WindRose.tsx`

---

## Phase 5 — Push Notifications & Alerts 🔔

**Goal:** SwellSense tells you when conditions hit your threshold — without you checking.

- [ ] Integrate **Vercel Cron Jobs** (`vercel.json` cron config) to run a condition check every 3 hours
- [ ] Create `src/app/api/cron/check-conditions/route.ts` — fetch Stormglass, compute Vibe Score, compare against user thresholds
- [ ] **Web Push** via `web-push` npm package: store VAPID keys in env, subscription object in Vercel KV
- [ ] Alert card UI: user sets "Notify me when Vibe Score ≥ 75 at [spot]"
- [ ] Fallback: email digest via Resend API for users who block push

---

## Phase 6 — Authentication & Personalisation 👤

**Goal:** Persistent user profile — quiver, favourite spots, alert prefs.

- [ ] Auth via **NextAuth.js v5** with GitHub + Google providers (no passwords)
- [ ] Schema in **Vercel Postgres** (Drizzle ORM): `users`, `spots`, `alerts`, `sessions`
- [ ] Protected `/profile` route — manage quiver (board types + fin setups), skill level, home break
- [ ] AI briefing becomes personalised: "You ride a 5'10" thruster with FCS II Performers — here's why today's 12s period works for you"

---

## Phase 7 — Native PWA 📱

**Goal:** Install to home screen. Feels like a real app.

- [ ] Add `src/app/manifest.ts` — PWA manifest with Deep Sea theme colour
- [ ] Create Service Worker via `next-pwa` or manual `public/sw.js`
- [ ] Offline fallback page showing last cached conditions
- [ ] Add View Transitions API between spot changes (use the `vercel-react-view-transitions` skill)
- [ ] iOS splash screens + maskable icon set (`public/icons/`)

---

## Phase 8 — Production Hardening 🔒

**Goal:** Ship with confidence. Zero downtime. Observable.

- [ ] **Error monitoring** — Sentry with `next.config` `withSentryConfig` wrapper
- [ ] **Rate limiting** — Upstash Redis + `@upstash/ratelimit` on the briefing and cron routes
- [ ] **Stormglass quota guard** — LRU cache (`lru-cache`, 30-min TTL) in front of all API calls to survive free-tier limits
- [ ] **E2E tests** — Playwright smoke test: load dashboard → assert Vibe Score renders → assert forecast chart has 5 data points
- [ ] **Lighthouse CI** — enforce Performance ≥ 90, Accessibility ≥ 95 on every PR
- [ ] Custom domain + Vercel Analytics

---

## Tech Stack Reference

| Layer | Choice | Notes |
|---|---|---|
| Framework | Next.js 16 (App Router) | RSC-first, Turbopack dev |
| Styling | Tailwind CSS v4 | `@import "tailwindcss"`, CSS tokens in `globals.css` |
| Fonts | Inter + JetBrains Mono | via `next/font/google` |
| Surf data | Stormglass API | Wave, weather, tide endpoints |
| AI | Vercel AI SDK + OpenAI | Streaming Route Handler |
| Auth | NextAuth.js v5 | GitHub + Google |
| Database | Vercel Postgres + Drizzle | User profiles, alert prefs |
| Cache | Vercel KV (Upstash) | Push subscriptions, rate limits |
| Design | Google Stitch | MCP via `.cursor/mcp.json` |
| Deploy | Vercel | ISR, Cron Jobs, Edge config |

---

## Vibe Score Algorithm (reference)

```
score = 0

# Wave height (sweet spot 3–6ft)
if 3 ≤ height ≤ 6:   score += 35
elif 1 ≤ height < 3:  score += 15
elif 6 < height ≤ 10: score += 20

# Period (longer = more power)
if period ≥ 14:  score += 20
elif period ≥ 10: score += 15
elif period ≥ 8:  score += 8

# Wind (offshore = gold)
if wind === 'offshore':   score += 25
elif wind === 'cross-off': score += 12
elif wind === 'glassy':    score += 20

# Tide (mid-tide = universal)
if tide === 'mid':  score += 10
elif tide === 'low': score += 5

# Hard caps
return clamp(score, 0, 100)
```

---

*Last updated: Phase 4 complete. Up next: Phase 5 — Push Notifications & Alerts.*
