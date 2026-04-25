import { cache } from 'react'
import { cacheLife } from 'next/cache'
import { generateText } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'
import type { SurfData } from './stormglass'
import type { Spot } from './spots'
import { IS_MOCK_MODE } from './config'

// ---------------------------------------------------------------------------
// Prompt builder
// Board quiver options are injected so the model makes a concrete pick.
// ---------------------------------------------------------------------------
function buildPrompt(data: SurfData, spot: Spot): string {
  return `\
You are a no-nonsense surf coach at ${spot.name}. Today's conditions:
  • Waves:   ${data.waveHeight}, ${data.period} period (peak: ${data.peakSwell})
  • Wind:    ${data.wind.speed} — ${data.wind.direction}
  • Water:   ${data.waterTemp.temp} — ${data.waterTemp.gear} recommended
  • Vibe Score: ${data.vibeScore}/100

Available boards: shortboard, fish, longboard, step-up, gun.

In exactly 2 sentences:
1. Name the board and explain why it suits today's conditions.
2. Give one actionable session tip (positioning, timing, technique).

Be direct, enthusiastic, surfer-brained. Do not repeat the numbers above.`
}

// ---------------------------------------------------------------------------
// Core generation function
// 'use cache' stores the result in Next.js Data Cache for 1 hour.
// The cache key is derived from the function arguments (data + spot), which
// are themselves stable for 1 hour via the Stormglass cache — so OpenAI is
// called at most once per hour per spot in production.
// ---------------------------------------------------------------------------
async function generateBriefingRaw(data: SurfData, spot: Spot): Promise<string> {
  'use cache'
  cacheLife('hours')

  if (IS_MOCK_MODE) {
    return data.boardPick
  }

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey || apiKey === 'your_openai_key_here') {
    console.warn('[SwellSense] OPENAI_API_KEY not set — using static board pick.')
    return data.boardPick
  }

  try {
    const openai = createOpenAI({ apiKey })
    const { text } = await generateText({
      model: openai('gpt-4o-mini'),
      prompt: buildPrompt(data, spot),
      maxOutputTokens: 110,
      temperature: 0.75,
    })
    return text.trim()
  } catch (err) {
    console.error('[SwellSense] AI briefing failed — using static pick.', err)
    return data.boardPick
  }
}

/**
 * generateBriefing — the single public entry point.
 * React.cache() deduplicates within the same render pass.
 * 'use cache' inside handles cross-request Data Cache persistence.
 */
export const generateBriefing = cache(generateBriefingRaw)
