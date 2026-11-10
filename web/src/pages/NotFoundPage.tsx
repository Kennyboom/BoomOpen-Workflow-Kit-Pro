import { motion, useReducedMotion } from 'framer-motion'
import { ArrowLeft, Compass, Terminal } from 'lucide-react'
import { SEO } from '../components/seo/SEO'
import { ActionLink, StatusBadge, SurfaceCard } from '../components/ui/Primitives'
import { KIT_STATS, formatCount } from '../data/kitStats'
import { useLanguage } from '../i18n/context'

/**
 * 404 Route Recovery Surface — Obsidian Tungsten & Forge Amber oklch() @theme surfaces.
 * Our mission: fast keyboard-first navigation trusted across 1,462+ indexed skills.
 */
export function NotFoundPage() {
  const { t } = useLanguage()
  const reduceMotion = useReducedMotion()
  const copy = t.notFoundPage

  return (
    <div className="flex min-h-dvh items-center justify-center bg-canvas px-4 py-16 text-ink sm:px-6">
      <SEO routeId="notFound" />

      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="w-full max-w-2xl"
      >
        <SurfaceCard variant="elevated" className="space-y-6 p-6 sm:p-10">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <StatusBadge tone="amber">
              <Compass aria-hidden="true" className="size-3.5" />
              <span className="uppercase tracking-wider">{copy.eyebrow}</span>
            </StatusBadge>
            <span className="font-mono text-[clamp(0.75rem,0.1vw+0.72rem,0.8125rem)] leading-none text-muted tabular-nums">
              HTTP {copy.code} · {formatCount(KIT_STATS.skills)} Skills Indexed
            </span>
          </div>

          <div className="space-y-3">
            <div className="font-mono text-[clamp(2.75rem,4vw+1.75rem,4.5rem)] leading-none font-semibold tracking-tight text-primary tabular-nums">
              {copy.code}
            </div>
            <h1 className="font-display text-[clamp(1.5rem,1.4vw+1.1rem,2.15rem)] leading-tight font-semibold tracking-tight text-ink">
              {copy.title}
            </h1>
            <p className="max-w-prose text-[clamp(0.95rem,0.18vw+0.9rem,1.05rem)] leading-relaxed font-normal text-muted">
              {copy.description}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 border-t border-hairline pt-5">
            <ActionLink
              to="/"
              variant="primary"
              icon={<ArrowLeft aria-hidden="true" className="size-4" />}
            >
              {copy.backHomeCta}
            </ActionLink>
            <ActionLink
              to="/commands"
              variant="secondary"
              icon={<Terminal aria-hidden="true" className="size-4" />}
            >
              {copy.exploreCommandsCta}
            </ActionLink>
          </div>
        </SurfaceCard>
      </motion.div>
    </div>
  )
}
