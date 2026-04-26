import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'SwellSense — Your AI Surf Caddy is arriving.',
  description:
    'Stop guessing. Start surfing. Get real-time AI-calculated Vibe Scores for your favourite breaks. Join the lineup.',
  openGraph: {
    title: 'SwellSense — Your AI Surf Caddy is arriving.',
    description:
      'Real-time Vibe Scores, AI board picks, and tidal data for 20+ world-class breaks.',
    siteName: 'SwellSense',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SwellSense — Your AI Surf Caddy is arriving.',
    description: 'Real-time Vibe Scores and AI board picks for surfers.',
  },
}

export default function LaunchLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
