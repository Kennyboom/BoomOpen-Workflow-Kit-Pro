import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'framer-motion'

interface CrossStarSpec {
  readonly top: string
  readonly left: string
  readonly sizePx: number
  readonly color: string
  readonly delaySec: number
  readonly durationSec: number
}

interface MeteorSpec {
  readonly top: string
  readonly left: string
  readonly widthPx: number
  readonly delaySec: number
  readonly durationSec: number
}

const CELESTIAL_STARS: readonly CrossStarSpec[] = [
  { top: '9%', left: '11%', sizePx: 14, color: '#7DD3FC', delaySec: 0, durationSec: 5.2 },
  { top: '14%', left: '86%', sizePx: 16, color: '#C4B5FD', delaySec: 1.4, durationSec: 6.4 },
  { top: '27%', left: '7%', sizePx: 11, color: '#E0F2FE', delaySec: 2.6, durationSec: 4.8 },
  { top: '31%', left: '91%', sizePx: 13, color: '#38BDF8', delaySec: 0.8, durationSec: 5.8 },
  { top: '52%', left: '5%', sizePx: 12, color: '#A5B4FC', delaySec: 3.1, durationSec: 6.2 },
  { top: '58%', left: '93%', sizePx: 15, color: '#E879F9', delaySec: 1.9, durationSec: 7.0 },
  { top: '76%', left: '12%', sizePx: 11, color: '#7DD3FC', delaySec: 2.2, durationSec: 5.4 },
  { top: '82%', left: '88%', sizePx: 13, color: '#C4B5FD', delaySec: 3.7, durationSec: 6.6 },
]

const SHOOTING_METEORS: readonly MeteorSpec[] = [
  { top: '8%', left: '68%', widthPx: 150, delaySec: 1.8, durationSec: 9.5 },
  { top: '22%', left: '28%', widthPx: 125, delaySec: 5.6, durationSec: 13.0 },
  { top: '44%', left: '82%', widthPx: 140, delaySec: 9.4, durationSec: 15.5 },
]

/**
 * Mystical GPU-composited deep-space backdrop:
 * layered drifting aurora nebulae, multi-depth twinkling stars, 4-point celestial flares,
 * periodic shooting meteors, and a zero-rerender interactive pointer starlight halo.
 */
export function CosmicBackdrop() {
  const reduceMotion = Boolean(useReducedMotion())
  const spotlightRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (reduceMotion || typeof window === 'undefined') {
      return
    }
    const node = spotlightRef.current
    if (!node) {
      return
    }
    let rafId = 0
    const handlePointerMove = (event: PointerEvent) => {
      if (rafId !== 0) {
        return
      }
      const nextX = event.clientX
      const nextY = event.clientY
      rafId = window.requestAnimationFrame(() => {
        rafId = 0
        node.style.setProperty('--cosmic-x', `${nextX}px`)
        node.style.setProperty('--cosmic-y', `${nextY}px`)
      })
    }
    window.addEventListener('pointermove', handlePointerMove, { passive: true })
    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      if (rafId !== 0) {
        window.cancelAnimationFrame(rafId)
      }
    }
  }, [reduceMotion])

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none"
    >
      {/* 1. Drifting Mystical Aurora Nebulae (Sapphire-Cyan, Violet-Amethyst, Indigo-Teal) */}
      <div
        className="cosmic-aurora-primary absolute -top-36 left-1/2 h-[540px] w-[1080px] -translate-x-1/2 rounded-full opacity-90 blur-[110px]"
      />
      <div
        className="cosmic-aurora-violet absolute top-[6%] -right-32 h-[480px] w-[680px] rounded-full opacity-80 blur-[120px]"
      />
      <div
        className="cosmic-aurora-indigo absolute top-[38%] -left-36 h-[500px] w-[660px] rounded-full opacity-75 blur-[125px]"
      />
      <div
        className="cosmic-aurora-horizon absolute -bottom-44 left-1/2 h-[420px] w-[960px] -translate-x-1/2 rounded-full opacity-65 blur-[120px]"
      />

      {/* 2. Deep-Space Pinprick Starfield + Shimmering Twinkle Layer */}
      <div className="cosmic-starfield absolute inset-0 opacity-75" />
      <div className="cosmic-starfield-twinkle absolute inset-0" />

      {/* 3. Subtle Architectural Coordinate Grid Near Zenith */}
      <div className="architectural-grid-bg absolute inset-x-0 top-0 h-[780px]" />

      {/* 4. Sculpted 4-Point Celestial Cross-Stars */}
      {CELESTIAL_STARS.map((star, idx) => (
        <svg
          key={idx}
          viewBox="0 0 24 24"
          width={star.sizePx}
          height={star.sizePx}
          style={{
            top: star.top,
            left: star.left,
            color: star.color,
            animationDelay: `${star.delaySec}s`,
            animationDuration: `${star.durationSec}s`,
          }}
          className="cosmic-cross-star absolute drop-shadow-[0_0_8px_currentColor]"
        >
          <path
            fill="currentColor"
            d="M12 0 C12.6 8.2 15.8 11.4 24 12 C15.8 12.6 12.6 15.8 12 24 C11.4 15.8 8.2 12.6 0 12 C8.2 11.4 11.4 8.2 12 0 Z"
          />
        </svg>
      ))}

      {/* 5. Graceful Shooting Stars / Cosmic Meteors */}
      {!reduceMotion &&
        SHOOTING_METEORS.map((meteor, idx) => (
          <span
            key={idx}
            style={{
              top: meteor.top,
              left: meteor.left,
              width: `${meteor.widthPx}px`,
              animationDelay: `${meteor.delaySec}s`,
              animationDuration: `${meteor.durationSec}s`,
            }}
            className="cosmic-meteor absolute h-[1.5px] rounded-full"
          />
        ))}

      {/* 6. Interactive Pointer Starlight Halo */}
      <div
        ref={spotlightRef}
        className="cosmic-pointer-halo absolute inset-0 hidden lg:block"
      />
    </div>
  )
}
