import { streamText } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'
import type { SurfData } from '@/lib/stormglass'
import type { Spot } from '@/lib/spots'

// ---------------------------------------------------------------------------
// POST /api/briefing
//
// Accepts { data: SurfData, spot: Spot } in the request body.
// Returns a streaming text response using the Vercel AI SDK data stream format.
//
// Used by the client for on-demand regeneration (Phase 2.3 "Regenerate" button).
// The server-side cached path (generateBriefing in src/lib/briefing.ts) is used
// for the initial page render to avoid latency on every load.
// ---------------------------------------------------------------------------
export async function POST(req: Request) {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey || apiKey === 'your_openai_key_here') {
    return new Response('OPENAI_API_KEY not configured', { status: 503 })
  }

  let data: SurfData
  let spot: Spot
  try {
    ;({ data, spot } = await req.json())
  } catch {
    return new Response('Invalid JSON body', { status: 400 })
  }

  const openai = createOpenAI({ apiKey })

  const prompt = `\
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

  const result = streamText({
    model: openai('gpt-4o-mini'),
    prompt,
    maxOutputTokens: 110,
    temperature: 0.75,
  })

  return result.toTextStreamResponse()
}
