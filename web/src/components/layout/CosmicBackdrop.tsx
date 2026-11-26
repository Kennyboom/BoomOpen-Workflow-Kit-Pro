import { useReducedMotion } from 'framer-motion'
import { CosmicGlyphCanvas } from './CosmicGlyphCanvas'

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
  { top: '9%', left: '11%', sizePx: 13, color: '#7DD3FC', delaySec: 0, durationSec: 5.2 },
  { top: '14%', left: '86%', sizePx: 15, color: '#C4B5FD', delaySec: 1.4, durationSec: 6.4 },
  { top: '28%', left: '7%', sizePx: 11, color: '#E0F2FE', delaySec: 2.6, durationSec: 4.8 },
  { top: '32%', left: '91%', sizePx: 12, color: '#38BDF8', delaySec: 0.8, durationSec: 5.8 },
  { top: '56%', left: '5%', sizePx: 11, color: '#A5B4FC', delaySec: 3.1, durationSec: 6.2 },
  { top: '62%', left: '93%', sizePx: 14, color: '#E879F9', delaySec: 1.9, durationSec: 7.0 },
]

const SHOOTING_METEORS: readonly MeteorSpec[] = [
  { top: '8%', left: '68%', widthPx: 145, delaySec: 2.2, durationSec: 11.0 },
  { top: '24%', left: '28%', widthPx: 120, delaySec: 7.4, durationSec: 14.5 },
]

/**
 * Mystical GPU-composited deep-space backdrop combining:
 * 1) Drifting sapphire/violet aurora nebulae,
 * 2) treg.to-inspired WebGL procedural geometric micro-glyph field with cursor repulsion + comet wake,
 * 3) Celestial 4-point cross-stars & subtle meteors.
 */
export function CosmicBackdrop() {
  const reduceMotion = Boolean(useReducedMotion())

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none"
    >
      {/* 1. Soft Deep-Space Aurora Nebulae */}
      <div
        className="cosmic-aurora-primary absolute -top-40 left-1/2 h-[520px] w-[1040px] -translate-x-1/2 rounded-full opacity-75 blur-[115px]"
      />
      <div
        className="cosmic-aurora-violet absolute top-[6%] -right-32 h-[460px] w-[640px] rounded-full opacity-65 blur-[125px]"
      />
      <div
        className="cosmic-aurora-indigo absolute top-[40%] -left-36 h-[480px] w-[620px] rounded-full opacity-60 blur-[125px]"
      />
      <div
        className="cosmic-aurora-horizon absolute -bottom-48 left-1/2 h-[420px] w-[980px] -translate-x-1/2 rounded-full opacity-55 blur-[125px]"
      />

      {/* 2. Static Fallback Starfield (always present underneath or for reduced-motion) */}
      <div className="cosmic-starfield absolute inset-0 opacity-45" />

      {/* 3. Interactive WebGL Geometric Micro-Glyph Matrix + Repulsion + Comet Trail */}
      <CosmicGlyphCanvas />

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

      {/* 5. Periodic Shooting Meteors */}
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
    </div>
  )
}
