import { cache } from 'react'
import { cacheLife } from 'next/cache'
import { generateText } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'
import type { SurfData } from './stormglass'
import type { Spot } from './spots'
import type { Profile } from './db/schema'
import { IS_MOCK_MODE } from './config'

// ---------------------------------------------------------------------------
// Prompt builder — personalised when a profile is provided
// ---------------------------------------------------------------------------
function buildPrompt(data: SurfData, spot: Spot, profile?: Profile): string {
  const profileLine = profile?.skillLevel || (profile?.boards && profile.boards.length > 0)
    ? `Surfer profile: ${profile.skillLevel ?? 'unknown'} level. Quiver: ${
        profile.boards && profile.boards.length > 0
          ? profile.boards.map((b) => b.type).join(', ')
          : 'unspecified'
      }.`
    : null

  return `\
You are a no-nonsense surf coach at ${spot.name}. Today's conditions:
  • Waves:   ${data.waveHeight}, ${data.period} period (peak: ${data.peakSwell})
  • Wind:    ${data.wind.speed} — ${data.wind.direction}
  • Water:   ${data.waterTemp.temp} — ${data.waterTemp.gear} recommended
  • Vibe Score: ${data.vibeScore}/100
${profileLine ? `\n${profileLine}` : ''}
Available boards: shortboard, fish, longboard, step-up, gun.

In exactly 2 sentences:
1. Name the board${profileLine ? ' from their quiver if suitable, otherwise suggest the best fit' : ''} and explain why it suits today's conditions.
2. Give one actionable session tip (positioning, timing, technique)${profileLine ? ' tailored to their skill level' : ''}.

Be direct, enthusiastic, surfer-brained. Do not repeat the numbers above.`
}

// ---------------------------------------------------------------------------
// Core generation — 'use cache' persists result in Data Cache for 1 hour.
// Cache key includes serialised profile so personalised and anonymous briefs
// are stored separately without invalidating each other.
// ---------------------------------------------------------------------------
async function generateBriefingRaw(
  data: SurfData,
  spot: Spot,
  profile?: Profile,
): Promise<string> {
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
      prompt: buildPrompt(data, spot, profile),
      maxOutputTokens: 120,
      temperature: 0.75,
    })
    return text.trim()
  } catch (err) {
    console.error('[SwellSense] AI briefing failed — using static pick.', err)
    return data.boardPick
  }
}

/**
 * generateBriefing — single public entry point.
 * React.cache() deduplicates within the same render pass.
 * 'use cache' inside handles cross-request Data Cache persistence.
 */
export const generateBriefing = cache(generateBriefingRaw)
