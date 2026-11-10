import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { clsx } from 'clsx'
import { ExternalLink, ShieldCheck } from 'lucide-react'
import { KIT_STATS, formatCount } from '../../data/kitStats'
import { REPO_URL, SITE_NAME } from '../../data/seoRoutes'
import { useLanguage } from '../../i18n/context'

const FOCUS_RING =
  'outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-canvas'

interface InternalFooterLink {
  readonly to: string
  readonly label: string
}

interface ExternalFooterLink {
  readonly href: string
  readonly label: string
  readonly newTab: boolean
}

/**
 * Featured Open-Source Authority Footer — 1,462 indexed skills & live `KIT_STATS` telemetry.
 */
export function Footer() {
  const { t } = useLanguage()
  const reduceMotion = useReducedMotion()

  const telemetryItems: ReadonlyArray<{ readonly value: string; readonly label: string }> = [
    { value: `v${KIT_STATS.version}`, label: SITE_NAME },
    { value: String(KIT_STATS.platforms), label: t.hero.metrics.platforms },
    { value: `${KIT_STATS.commands.length || 32} (${KIT_STATS.commandFiles})`, label: t.nav.commands },
    { value: `${KIT_STATS.agents} + ${KIT_STATS.teams}`, label: t.nav.agents },
    { value: formatCount(KIT_STATS.skills), label: t.nav.skills },
    { value: String(KIT_STATS.i18nLocales), label: t.hero.metrics.languages },
  ]

  const internalLinks: readonly InternalFooterLink[] = [
    { to: '/', label: t.footer.links.overview },
    { to: '/commands', label: t.footer.links.commands },
    { to: '/agents', label: t.footer.links.agents },
    { to: '/skills', label: t.footer.links.skills },
    { to: '/architecture', label: t.footer.links.architecture },
    { to: '/install', label: t.footer.links.install },
  ]

  const externalLinks: readonly ExternalFooterLink[] = [
    { href: REPO_URL, label: t.footer.links.github, newTab: true },
    { href: `${REPO_URL}/releases`, label: t.footer.links.releases, newTab: true },
    { href: `${REPO_URL}/blob/main/CHANGELOG.md`, label: t.footer.links.changelog, newTab: true },
    { href: `${REPO_URL}/blob/main/LICENSE`, label: t.footer.links.license, newTab: true },
    { href: `${REPO_URL}/blob/main/SECURITY.md`, label: t.footer.links.security, newTab: true },
    { href: '/llms.txt', label: t.footer.links.llmsTxt, newTab: true },
    { href: '/sitemap.xml', label: 'sitemap.xml', newTab: true },
  ]

  return (
    <motion.footer
      initial={reduceMotion ? false : { opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="border-t border-hairline bg-overlay/50"
    >
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {telemetryItems.map((metric) => (
            <div
              key={metric.label}
              className="rounded-xl border border-hairline bg-canvas/80 px-3.5 py-3"
            >
              <div className="font-mono text-[clamp(0.95rem,0.25vw+0.88rem,1.1rem)] leading-tight font-semibold text-primary tabular-nums">
                {metric.value}
              </div>
              <div className="mt-1 text-[clamp(0.75rem,0.1vw+0.72rem,0.8125rem)] leading-snug font-normal text-muted">
                {metric.label}
              </div>
            </div>
          ))}
        </div>

        <div className="grid gap-10 lg:grid-cols-12">
          <div className="space-y-4 lg:col-span-5">
            <Link
              to="/"
              className={clsx(
                'inline-flex min-h-11 items-center gap-2.5 rounded-[10px] pr-2 no-underline',
                FOCUS_RING,
              )}
            >
              <img
                src="/assets/logo.webp"
                alt={SITE_NAME}
                width={32}
                height={32}
                className="size-8 rounded-lg border border-hairline bg-elevated object-contain"
              />
              <span className="font-display text-[clamp(1.05rem,0.25vw+0.98rem,1.2rem)] leading-tight font-semibold tracking-tight text-ink">
                {SITE_NAME}
              </span>
            </Link>

            <div className="max-w-prose text-[clamp(0.875rem,0.12vw+0.85rem,0.95rem)] leading-relaxed font-normal text-muted">
              {t.footer.tagline}
            </div>
            <div className="max-w-prose text-[clamp(0.8125rem,0.1vw+0.79rem,0.875rem)] leading-relaxed font-normal text-subtle">
              {t.footer.missionNote}
            </div>

            <div className="inline-flex items-center gap-2 rounded-full border border-accent/35 bg-accent/12 px-3 py-1.5 font-mono text-[clamp(0.72rem,0.08vw+0.7rem,0.78rem)] leading-tight font-semibold text-accent">
              <ShieldCheck aria-hidden="true" className="size-4 shrink-0" />
              <span>{t.footer.featuredBadge}</span>
            </div>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:col-span-7">
            <div>
              <div className="mb-3 font-mono text-[clamp(0.75rem,0.08vw+0.73rem,0.8125rem)] leading-tight font-semibold uppercase tracking-widest text-ink">
                {`${t.footer.columns.product} · ${t.footer.columns.resources}`}
              </div>
              <ul className="space-y-1">
                {internalLinks.map((item) => (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      className={clsx(
                        'inline-flex min-h-11 items-center rounded-lg px-2 text-[clamp(0.85rem,0.1vw+0.82rem,0.92rem)] leading-snug font-normal text-muted hover:text-ink transition-colors duration-150 motion-reduce:transition-none no-underline',
                        FOCUS_RING,
                      )}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <div className="mb-3 font-mono text-[clamp(0.75rem,0.08vw+0.73rem,0.8125rem)] leading-tight font-semibold uppercase tracking-widest text-ink">
                {t.footer.columns.governance}
              </div>
              <ul className="space-y-1">
                {externalLinks.map((item) => (
                  <li key={item.href}>
                    <a
                      href={item.href}
                      target={item.newTab ? '_blank' : undefined}
                      rel={item.newTab ? 'noopener noreferrer' : undefined}
                      className={clsx(
                        'inline-flex min-h-11 items-center gap-1.5 rounded-lg px-2 text-[clamp(0.85rem,0.1vw+0.82rem,0.92rem)] leading-snug font-normal text-muted hover:text-ink transition-colors duration-150 motion-reduce:transition-none no-underline',
                        FOCUS_RING,
                      )}
                    >
                      <span>{item.label}</span>
                      {item.newTab && (
                        <>
                          <ExternalLink aria-hidden="true" className="size-3.5 text-subtle" />
                          <span className="sr-only">({t.common.openNewTab})</span>
                        </>
                      )}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-3 border-t border-hairline pt-6 text-[clamp(0.78rem,0.1vw+0.76rem,0.85rem)] leading-relaxed font-normal text-subtle sm:flex-row sm:items-center">
          <div>{t.footer.copyright}</div>
          <div className="font-mono">{t.footer.builtForLabel}</div>
        </div>
      </div>
    </motion.footer>
  )
}
