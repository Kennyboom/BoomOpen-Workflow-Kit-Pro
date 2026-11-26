import { Link } from 'react-router-dom'
import { clsx } from 'clsx'
import { ArrowUpRight } from 'lucide-react'
import { useLanguage } from '../../i18n/context'

/**
 * 2x2 Cosmic 3D Crystal Bento cards showcasing BoomOpen Workflow Kit's 4 core capabilities
 * with bespoke deep-space optical artwork and localized 1-line captions across all 15 languages.
 */
const FOCUS_RING =
  'outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050816]'

export function FeatureBento() {
  const { t } = useLanguage()
  const cards = t.homeSurface.bentoCards

  return (
    <div className="grid grid-cols-1 gap-7 md:grid-cols-2">
      {cards.map((card) => (
        <article
          key={card.id}
          className="specular-surface group relative overflow-hidden rounded-[32px] border border-indigo-200/[0.14] transition-all duration-300 hover:-translate-y-1 hover:border-sky-300/35 hover:shadow-[0_28px_64px_-14px_rgba(14,165,233,0.20)] motion-reduce:transition-none motion-reduce:hover:translate-y-0"
        >
          <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#050816] after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-16 after:bg-gradient-to-t after:from-[#090F24] after:to-transparent">
            <img
              src={`/assets/bento-${card.id}.jpg`}
              alt={card.imageAlt}
              loading="lazy"
              className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transition-none"
            />
            <span className="absolute top-4 start-4 z-10 rounded-full border border-indigo-200/[0.22] bg-[#070C1F]/80 px-3.5 py-1 font-mono text-xs font-semibold text-sky-200 backdrop-blur-md">
              {card.badge}
            </span>
          </div>

          <div className="flex items-end justify-between gap-4 border-t border-indigo-200/[0.08] bg-[#090F24]/95 p-7 sm:p-8">
            <div className="min-w-0 space-y-1.5">
              <h3 className="font-display text-xl leading-snug font-bold tracking-[-0.028em] text-white sm:text-2xl">
                {card.title}
              </h3>
              <p className="max-w-[46ch] text-sm leading-relaxed text-slate-300 sm:text-base">
                {card.caption}
              </p>
            </div>

            <Link
              to={card.to}
              aria-label={card.title}
              className={clsx(
                'inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-full border border-indigo-200/[0.18] bg-white/[0.06] text-slate-200 transition-colors duration-200 group-hover:border-white group-hover:bg-white group-hover:text-[#050816] motion-reduce:transition-none after:absolute after:inset-0 no-underline',
                FOCUS_RING,
              )}
            >
              <ArrowUpRight aria-hidden="true" className="size-5" />
            </Link>
          </div>
        </article>
      ))}
    </div>
  )
}
