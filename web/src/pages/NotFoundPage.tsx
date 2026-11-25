import { motion, useReducedMotion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { SEO } from '../components/seo/SEO'
import { ActionLink } from '../components/ui/Primitives'
import { useLanguage } from '../i18n/context'

/**
 * Minimal centered 404 monograph recovery panel.
 */
export function NotFoundPage() {
  const { t } = useLanguage()
  const reduceMotion = useReducedMotion()
  const copy = t.notFoundPage

  return (
    <div className="flex min-h-[72dvh] items-center justify-center bg-canvas px-4 py-16 text-ink sm:px-6">
      <SEO routeId="notFound" />

      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
        className="w-full max-w-lg rounded-xl border border-hairline bg-card p-8 text-center space-y-5"
      >
        <p className="font-mono text-xs tracking-wider text-subtle uppercase tabular-nums">
          {`${copy.code} · ${copy.eyebrow}`}
        </p>

        <div className="space-y-2.5">
          <h1 className="text-2xl font-semibold tracking-[-0.028em] text-ink sm:text-3xl">
            {copy.title}
          </h1>
          <p className="mx-auto max-w-[46ch] text-sm leading-relaxed text-muted">
            {copy.description}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <ActionLink
            to="/"
            variant="primary"
            icon={<ArrowLeft aria-hidden="true" className="size-4" />}
          >
            {copy.backHomeCta}
          </ActionLink>
          <ActionLink to="/commands" variant="ghost">
            {copy.exploreCommandsCta}
          </ActionLink>
        </div>
      </motion.div>
    </div>
  )
}
