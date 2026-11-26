import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useReducedMotion } from 'framer-motion'
import { clsx } from 'clsx'
import { ExternalLink } from 'lucide-react'
import { KIT_VERSION } from '../../data/kitStats'
import { REPO_URL, SITE_NAME } from '../../data/seoRoutes'
import { useLanguage, type Dictionary } from '../../i18n/context'

const FOCUS_RING =
  'outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-canvas'

interface FooterItem {
  readonly label: string
  readonly to?: string
  readonly href?: string
  readonly newTab?: boolean
}

function FooterBrandStatement({ t }: { readonly t: Dictionary }) {
  return (
    <div className="space-y-5 lg:col-span-5">
      <Link
        to="/"
        className={clsx(
          'inline-flex min-h-11 flex-wrap items-center gap-3 rounded-xl pr-2 no-underline transition-opacity duration-150 motion-reduce:transition-none hover:opacity-90',
          FOCUS_RING,
        )}
      >
        <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl border border-indigo-200/[0.18] bg-[#0D1530] p-1 shadow-[0_0_20px_-4px_rgba(56,189,248,0.32)]">
          <img
            src="/assets/logo.webp"
            alt={SITE_NAME}
            width={36}
            height={36}
            className="size-full rounded-lg object-contain"
          />
        </span>
        <span className="font-display text-lg sm:text-xl leading-tight font-bold tracking-tight text-white">
          BoomOpen Workflow Kit
        </span>
        <span className="rounded-full border border-sky-400/25 bg-sky-400/10 px-2.5 py-0.5 font-mono text-xs leading-snug font-semibold text-sky-300 tabular-nums">
          {`v${KIT_VERSION}`}
        </span>
      </Link>

      <p className="max-w-[46ch] text-base leading-relaxed font-normal text-muted">
        {t.footer.tagline}
      </p>

      <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200/[0.16] bg-[#090F24]/75 px-3.5 py-1.5 font-mono text-[13px] leading-snug text-slate-300">
        <span aria-hidden="true" className="size-2 rounded-full bg-accent" />
        <span>{t.footer.featuredBadge}</span>
      </div>
    </div>
  )
}

function FooterColumn({
  heading,
  items,
  openNewTabLabel,
}: {
  readonly heading: string
  readonly items: readonly FooterItem[]
  readonly openNewTabLabel: string
}) {
  return (
    <div>
      <div className="mb-4 font-mono text-xs leading-tight font-semibold tracking-[0.09em] text-slate-300 uppercase">
        {heading}
      </div>
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item.to ?? item.href}>
            {item.to ? (
              <Link
                to={item.to}
                className={clsx(
                  'inline-flex min-h-11 items-center rounded-lg text-[15px] leading-snug font-normal text-slate-400 hover:text-white transition-colors duration-150 motion-reduce:transition-none no-underline',
                  FOCUS_RING,
                )}
              >
                {item.label}
              </Link>
            ) : (
              <a
                href={item.href}
                target={item.newTab ? '_blank' : undefined}
                rel={item.newTab ? 'noopener noreferrer' : undefined}
                className={clsx(
                  'inline-flex min-h-11 items-center gap-2 rounded-lg text-[15px] leading-snug font-normal text-slate-400 hover:text-white transition-colors duration-150 motion-reduce:transition-none no-underline',
                  FOCUS_RING,
                )}
              >
                <span>{item.label}</span>
                {item.newTab && (
                  <>
                    <ExternalLink aria-hidden="true" className="size-3.5 text-subtle" />
                    <span className="sr-only">({openNewTabLabel})</span>
                  </>
                )}
              </a>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

/**
 * Open cosmic glyph stage footer inspired by treg.to:
 * transparent unblurred surface revealing the live WebGL interactive micro-glyph forcefield,
 * scroll-linked rising columns, and a colossal bled-edge architectural watermark at the bottom.
 */
export function Footer() {
  const { t } = useLanguage()
  const reduceMotion = Boolean(useReducedMotion())
  const footerRef = useRef<HTMLElement | null>(null)
  const contentRef = useRef<HTMLDivElement | null>(null)
  const watermarkRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (reduceMotion || typeof window === 'undefined') return
    let rafId = 0

    const updateParallax = () => {
      rafId = 0
      const foot = footerRef.current
      if (!foot) return
      const rect = foot.getBoundingClientRect()
      const vh = Math.max(1, window.innerHeight)
      const progress = Math.max(0, Math.min(1, (vh - rect.top) / Math.min(vh, rect.height + 120)))
      const eased = 1 - Math.pow(1 - progress, 2)
      const contentRise = ((1 - eased) * 36).toFixed(2)
      const markDrift = ((1 - eased) * 64).toFixed(2)

      if (contentRef.current) {
        contentRef.current.style.transform = `translate3d(0, ${contentRise}px, 0)`
      }
      if (watermarkRef.current) {
        watermarkRef.current.style.transform = `translate3d(-50%, ${markDrift}px, 0)`
      }
    }

    const onScroll = () => {
      if (rafId === 0) {
        rafId = window.requestAnimationFrame(updateParallax)
      }
    }

    updateParallax()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    return () => {
      if (rafId !== 0) window.cancelAnimationFrame(rafId)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [reduceMotion])

  const productLinks: readonly FooterItem[] = [
    { to: '/', label: t.footer.links.overview },
    { to: '/commands', label: t.footer.links.commands },
    { to: '/agents', label: t.footer.links.agents },
    { to: '/skills', label: t.footer.links.skills },
  ]

  const architectureLinks: readonly FooterItem[] = [
    { to: '/architecture', label: t.footer.links.architecture },
    { to: '/install', label: t.footer.links.install },
    { href: `${REPO_URL}/blob/main/CHANGELOG.md`, label: t.footer.links.changelog, newTab: true },
    { href: `${REPO_URL}/blob/main/SECURITY.md`, label: t.footer.links.security, newTab: true },
  ]

  const resourceLinks: readonly FooterItem[] = [
    { href: REPO_URL, label: t.footer.links.github, newTab: true },
    { href: `${REPO_URL}/releases`, label: t.footer.links.releases, newTab: true },
    { href: '/llms.txt', label: t.footer.links.llmsTxt, newTab: true },
    { href: '/sitemap.xml', label: 'sitemap.xml', newTab: true },
  ]

  return (
    <footer
      ref={footerRef}
      className="relative z-10 overflow-hidden border-t border-indigo-200/[0.12] bg-transparent pt-16 pb-28 sm:pb-36 lg:pt-20 lg:pb-44"
    >
      <div ref={contentRef} className="relative z-10 mx-auto max-w-[90rem] px-5 sm:px-8 lg:px-12 will-change-transform">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-12 lg:gap-16">
          <FooterBrandStatement t={t} />

          <div className="grid gap-10 sm:grid-cols-3 lg:col-span-7">
            <FooterColumn
              heading={t.footer.columns.product}
              items={productLinks}
              openNewTabLabel={t.common.openNewTab}
            />
            <FooterColumn
              heading={t.nav.architecture}
              items={architectureLinks}
              openNewTabLabel={t.common.openNewTab}
            />
            <FooterColumn
              heading={t.footer.columns.resources}
              items={resourceLinks}
              openNewTabLabel={t.common.openNewTab}
            />
          </div>
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-3 border-t border-indigo-200/[0.10] pt-8 text-sm leading-relaxed font-normal text-subtle sm:flex-row sm:items-center">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span>{t.footer.copyright}</span>
            <span aria-hidden="true" className="hidden sm:inline">/</span>
            <span>{t.footer.builtForLabel}</span>
          </div>
          <div className="font-mono text-[13px] tabular-nums">{`MIT License / v${KIT_VERSION}`}</div>
        </div>
      </div>

      {/* Colossal bled-edge architectural watermark over the live WebGL glyph field */}
      <div
        ref={watermarkRef}
        aria-hidden="true"
        style={{ transform: 'translate3d(-50%, 0px, 0)' }}
        className="pointer-events-none absolute bottom-[-0.26em] left-1/2 z-0 font-mono text-[clamp(5.2rem,17.5vw,16.5rem)] leading-none font-bold tracking-[-0.045em] whitespace-nowrap text-white/[0.055] select-none will-change-transform"
      >
        BoomOpen
      </div>
    </footer>
  )
}
