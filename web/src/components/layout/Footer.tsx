import { Link } from 'react-router-dom'
import { clsx } from 'clsx'
import { ExternalLink } from 'lucide-react'
import { KIT_VERSION } from '../../data/kitStats'
import { REPO_URL, SITE_NAME } from '../../data/seoRoutes'
import { useLanguage } from '../../i18n/context'

const FOCUS_RING =
  'outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-canvas'

interface FooterItem {
  readonly label: string
  readonly to?: string
  readonly href?: string
  readonly newTab?: boolean
}

/**
 * Architectural 4-column Linear-style footer: concise featured open-source brand column
 * paired with Product, Architecture, and Resources navigation links.
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
    { href: REPO_URL, label: 'GitHub', newTab: true },
    { href: `${REPO_URL}/releases`, label: `v${KIT_VERSION} Release`, newTab: true },
    { href: '/llms.txt', label: 'llms.txt', newTab: true },
    { href: '/sitemap.xml', label: 'sitemap.xml', newTab: true },
  ]

  const renderColumn = (heading: string, items: readonly FooterItem[]) => (
    <div>
      <div className="mb-2 text-xs leading-tight font-medium text-ink">
        {heading}
      </div>
      <ul className="space-y-0.5">
        {items.map((item) => (
          <li key={item.to ?? item.href}>
            {item.to ? (
              <Link
                to={item.to}
                className={clsx(
                  'inline-flex min-h-11 items-center rounded-md text-[clamp(0.82rem,0.1vw+0.8rem,0.875rem)] leading-snug font-normal text-muted hover:text-ink transition-colors duration-150 motion-reduce:transition-none no-underline',
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
                  'inline-flex min-h-11 items-center gap-1.5 rounded-md text-[clamp(0.82rem,0.1vw+0.8rem,0.875rem)] leading-snug font-normal text-muted hover:text-ink transition-colors duration-150 motion-reduce:transition-none no-underline',
                  FOCUS_RING,
                )}
              >
                <span>{item.label}</span>
                {item.newTab && (
                  <>
                    <ExternalLink aria-hidden="true" className="size-3 text-subtle" />
                    <span className="sr-only">({t.common.openNewTab})</span>
                  </>
                )}
              </a>
            )}
          </li>
        ))}
      </ul>
    </div>
  )

  return (
    <footer className="border-t border-hairline bg-canvas py-12">
      <div className="mx-auto max-w-[74rem] px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-12">
          <div className="space-y-3 lg:col-span-5">
            <Link
              to="/"
              className={clsx(
                'inline-flex min-h-11 items-center gap-2.5 rounded-lg pr-2 no-underline',
                FOCUS_RING,
              )}
            >
              <img
                src="/assets/logo.webp"
                alt={SITE_NAME}
                width={28}
                height={28}
                className="size-7 rounded-md border border-hairline bg-elevated object-contain"
              />
              <span className="font-display text-[clamp(0.95rem,0.2vw+0.9rem,1.05rem)] leading-tight font-semibold tracking-tight text-ink">
                BoomOpen
              </span>
            </Link>

            <p className="max-w-[44ch] text-[clamp(0.84rem,0.1vw+0.81rem,0.9rem)] leading-relaxed font-normal text-muted">
              {t.footer.tagline}
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-3 lg:col-span-7">
            {renderColumn(t.footer.columns.product, productLinks)}
            {renderColumn(t.nav.architecture, architectureLinks)}
            {renderColumn(t.footer.columns.resources, resourceLinks)}
          </div>
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-2 border-t border-hairline pt-6 text-xs leading-relaxed font-normal text-subtle sm:flex-row sm:items-center">
          <div>{t.footer.copyright}</div>
          <div className="font-mono tabular-nums">{`MIT License · v${KIT_VERSION}`}</div>
        </div>
      </div>
    </footer>
  )
}
