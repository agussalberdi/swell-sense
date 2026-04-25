'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useCompletion } from '@ai-sdk/react'
import type { SurfData } from '@/lib/stormglass'
import type { Spot } from '@/lib/spots'

// ---------------------------------------------------------------------------
// Typewriter — animates a string character-by-character
// ---------------------------------------------------------------------------
function useTypewriter(text: string, speed = 18) {
  const [displayed, setDisplayed] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    setDisplayed('')
    setDone(false)
    let i = 0
    const tick = setInterval(() => {
      i++
      setDisplayed(text.slice(0, i))
      if (i >= text.length) {
        setDone(true)
        clearInterval(tick)
      }
    }, speed)
    return () => clearInterval(tick)
  }, [text, speed])

  return { displayed, done }
}

// ---------------------------------------------------------------------------
// Blinking cursor — only visible while text is still animating
// ---------------------------------------------------------------------------
function Cursor({ visible }: { visible: boolean }) {
  if (!visible) return null
  return (
    <span
      aria-hidden
      className="inline-block w-0.5 h-[1em] ml-0.5 align-middle"
      style={{
        background: '#00F5FF',
        animation: 'pulse 1s ease-in-out infinite',
        verticalAlign: 'text-bottom',
      }}
    />
  )
}

// ---------------------------------------------------------------------------
// AIBriefing
//
// Props:
//   initialText  — server-precomputed briefing (cached, arrives with the HTML)
//   data / spot  — forwarded to /api/briefing for on-demand regeneration
// ---------------------------------------------------------------------------
interface Props {
  initialText: string
  data: SurfData
  spot: Spot
}

export default function AIBriefing({ initialText, data, spot }: Props) {
  const [source, setSource] = useState<'initial' | 'regenerated'>('initial')

  // ── Typewriter for the server-precomputed text ───────────────────────────
  const { displayed: typedInitial, done: initialDone } = useTypewriter(initialText)

  // ── useCompletion for on-demand streaming regeneration ───────────────────
  const { completion, complete, isLoading } = useCompletion({
    api: '/api/briefing',
  })

  const handleRegenerate = useCallback(() => {
    setSource('regenerated')
    complete('', { body: { data, spot } })
  }, [complete, data, spot])

  // Active text: either the live stream or the initial typewriter
  const streamedText  = source === 'regenerated' ? completion : ''
  const displayedText = source === 'regenerated' ? streamedText : typedInitial
  const isAnimating   = source === 'regenerated' ? isLoading : !initialDone

  return (
    <div>
      <p
        className="text-sm leading-relaxed"
        style={{ color: '#FFFFFF', minHeight: '2.8em' }}
      >
        {displayedText || '\u00A0'}
        <Cursor visible={isAnimating} />
      </p>

      {/* Regenerate button — Phase 2.3: only shown after initial animation finishes */}
      {initialDone && source === 'initial' && (
        <button
          onClick={handleRegenerate}
          disabled={isLoading}
          className="mt-3 flex items-center gap-1.5 text-xs transition-opacity disabled:opacity-40"
          style={{ color: '#00F5FF' }}
        >
          <svg
            width="11"
            height="11"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
            <path d="M21 3v5h-5" />
            <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
            <path d="M8 16H3v5" />
          </svg>
          Ask again
        </button>
      )}

      {/* After regeneration, show the "Ask again" button once streaming is done */}
      {source === 'regenerated' && !isLoading && completion && (
        <button
          onClick={handleRegenerate}
          className="mt-3 flex items-center gap-1.5 text-xs transition-opacity"
          style={{ color: '#00F5FF' }}
        >
          <svg
            width="11"
            height="11"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
            <path d="M21 3v5h-5" />
            <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
            <path d="M8 16H3v5" />
          </svg>
          Ask again
        </button>
      )}
    </div>
  )
}
