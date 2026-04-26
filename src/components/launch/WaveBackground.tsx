'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

// ---------------------------------------------------------------------------
// WaveBackground — two layered SVG wave shapes with scroll-linked parallax.
// Deep layer moves slower, surface layer moves faster, creating ocean depth.
// ---------------------------------------------------------------------------

export default function WaveBackground() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollY } = useScroll()

  // Deep wave: slow, subtle upward drift
  const deepY = useTransform(scrollY, [0, 600], [0, -60])
  const deepOpacity = useTransform(scrollY, [0, 400], [0.35, 0.1])

  // Surface wave: faster, more visible
  const surfaceY = useTransform(scrollY, [0, 600], [0, -120])
  const surfaceOpacity = useTransform(scrollY, [0, 400], [0.5, 0.15])

  return (
    <div
      ref={ref}
      className="absolute inset-0 overflow-hidden pointer-events-none"
      aria-hidden
    >
      {/* Deep ocean wave layer */}
      <motion.div
        className="absolute inset-x-0"
        style={{ y: deepY, opacity: deepOpacity, bottom: '-10%' }}
      >
        <svg
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
          width="100%"
          height="320"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="deepWaveGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00F5FF" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#00F5FF" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d="M0,192 C240,256 480,128 720,192 C960,256 1200,128 1440,192 L1440,320 L0,320 Z"
            fill="url(#deepWaveGrad)"
          />
          <path
            d="M0,192 C240,256 480,128 720,192 C960,256 1200,128 1440,192"
            stroke="#00F5FF"
            strokeWidth="1"
            strokeOpacity="0.2"
            fill="none"
          />
        </svg>
      </motion.div>

      {/* Surface wave layer — lighter, faster */}
      <motion.div
        className="absolute inset-x-0"
        style={{ y: surfaceY, opacity: surfaceOpacity, bottom: '5%' }}
      >
        <svg
          viewBox="0 0 1440 240"
          preserveAspectRatio="none"
          width="100%"
          height="240"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="surfaceWaveGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#7D26CD" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#7D26CD" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d="M0,96 C360,160 720,32 1080,96 C1260,128 1360,80 1440,96 L1440,240 L0,240 Z"
            fill="url(#surfaceWaveGrad)"
          />
          <path
            d="M0,96 C360,160 720,32 1080,96 C1260,128 1360,80 1440,96"
            stroke="#7D26CD"
            strokeWidth="0.8"
            strokeOpacity="0.3"
            fill="none"
          />
        </svg>
      </motion.div>

      {/* Ambient glow orb — top centre */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          width: 600,
          height: 600,
          background: 'radial-gradient(circle, rgba(0,245,255,0.06) 0%, transparent 70%)',
        }}
      />
    </div>
  )
}
