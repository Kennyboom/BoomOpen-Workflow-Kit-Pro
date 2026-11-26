import { motion, useReducedMotion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { SEO } from '../components/seo/SEO'
import { ActionLink } from '../components/ui/Primitives'
import { useLanguage } from '../i18n/context'

/**
 * Expansive centered 404 monograph recovery stage.
 */
export function NotFoundPage() {
  const { t } = useLanguage()
  const reduceMotion = useReducedMotion()
  const copy = t.notFoundPage

  return (
    <div className="flex min-h-[76dvh] items-center justify-center bg-canvas px-4 py-20 text-ink sm:px-6">
      <SEO routeId="notFound" />

      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
        className="specular-surface w-full max-w-2xl rounded-3xl border border-indigo-200/[0.14] p-12 text-center transition-colors duration-150 hover:border-sky-300/30 sm:p-16"
      >
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200/[0.16] bg-white/[0.05] px-3.5 py-1 font-mono text-xs tracking-wider text-slate-300 uppercase tabular-nums">
          <span>{copy.eyebrow}</span>
        </div>

        <div className="hero-display-gradient mt-6 pb-1 font-mono text-[4rem] leading-[1.16] font-bold tracking-[-0.04em] text-ink tabular-nums sm:text-[4.5rem]">
          {copy.code}
        </div>

        <div className="mt-4 space-y-3">
          <h1 className="pb-1 text-2xl leading-[1.16] font-bold tracking-[-0.028em] text-ink sm:text-3xl">
            {copy.title}
          </h1>
          <p className="mx-auto max-w-[48ch] text-base leading-relaxed text-muted sm:text-lg">
            {copy.description}
          </p>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5">
          <ActionLink
            to="/"
            variant="primary"
            icon={<ArrowLeft aria-hidden="true" className="size-4" />}
          >
            {copy.backHomeCta}
          </ActionLink>
          <ActionLink to="/commands" variant="secondary">
            {copy.exploreCommandsCta}
          </ActionLink>
        </div>
      </motion.div>
    </div>
  )
}
