import { Link } from 'react-router-dom'
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
          'inline-flex min-h-11 items-center gap-3 rounded-xl pr-2 no-underline transition-opacity duration-150 motion-reduce:transition-none hover:opacity-95',
          FOCUS_RING,
        )}
      >
        <span className="inline-flex size-9 items-center justify-center rounded-xl border border-white/[0.14] bg-elevated p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.16)]">
          <img
            src="/assets/logo.webp"
            alt={SITE_NAME}
            width={36}
            height={36}
            className="size-full rounded-lg object-contain"
          />
        </span>
        <span className="font-display text-xl leading-tight font-bold tracking-tight text-ink">
          BoomOpen
        </span>
        <span className="rounded-full border border-white/[0.12] bg-white/[0.05] px-2.5 py-0.5 font-mono text-xs leading-snug font-medium text-muted tabular-nums">
          {`v${KIT_VERSION}`}
        </span>
      </Link>

      <p className="max-w-[46ch] text-base leading-relaxed font-normal text-muted">
        {t.footer.tagline}
      </p>

      <div className="inline-flex items-center gap-2 rounded-lg border border-white/[0.10] bg-white/[0.03] px-3 py-1.5 font-mono text-[13px] leading-snug text-subtle">
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
      <div className="mb-4 text-sm leading-tight font-semibold tracking-wide text-ink">
        {heading}
      </div>
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item.to ?? item.href}>
            {item.to ? (
              <Link
                to={item.to}
                className={clsx(
                  'inline-flex min-h-11 items-center rounded-lg text-[15px] leading-snug font-normal text-muted hover:text-ink transition-colors duration-150 motion-reduce:transition-none no-underline',
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
                  'inline-flex min-h-11 items-center gap-2 rounded-lg text-[15px] leading-snug font-normal text-muted hover:text-ink transition-colors duration-150 motion-reduce:transition-none no-underline',
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
 * Expansive 1440px (90rem) architectural footer:
 * bold brand statement paired with 3 generous navigation columns and a crisp metadata bar.
 */
export function Footer() {
  const { t } = useLanguage()

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
    <footer className="relative z-10 border-t border-white/[0.08] bg-[#06070A] py-16 lg:py-20">
      <div className="mx-auto max-w-[90rem] px-5 sm:px-8 lg:px-12">
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

        <div className="mt-14 flex flex-col items-start justify-between gap-3 border-t border-white/[0.08] pt-8 text-sm leading-relaxed font-normal text-subtle sm:flex-row sm:items-center">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span>{t.footer.copyright}</span>
            <span aria-hidden="true" className="hidden sm:inline">/</span>
            <span>{t.footer.builtForLabel}</span>
          </div>
          <div className="font-mono text-[13px] tabular-nums">{`MIT License / v${KIT_VERSION}`}</div>
        </div>
      </div>
    </footer>
  )
}
