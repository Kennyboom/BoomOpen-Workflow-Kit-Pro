import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { clsx } from 'clsx'
import { ExternalLink, Menu, X } from 'lucide-react'
import { KIT_VERSION } from '../../data/kitStats'
import { REPO_URL, SITE_NAME } from '../../data/seoRoutes'
import { useLanguage, type Locale } from '../../i18n/context'

/**
 * Translucent Obsidian Monograph sticky header (h-14): clean typography nav,
 * compact EN / VI segmented toggle, GitHub link, and Platinum Install CTA.
 */
const FOCUS_RING =
  'outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-canvas'

const LOCALE_OPTIONS: readonly Locale[] = ['en', 'vi']
const SHORT_VERSION = KIT_VERSION.split('.').slice(0, 2).join('.')

interface HeaderNavItem {
  readonly to: string
  readonly label: string
  readonly end?: boolean
}

export function Header() {
  const { locale, setLocale, t } = useLanguage()
  const { pathname } = useLocation()
  const reduceMotion = useReducedMotion()
  const [openedPath, setOpenedPath] = useState<string | null>(null)
  const isDrawerOpen = openedPath === pathname

  useEffect(() => {
    if (!isDrawerOpen) {
      return
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpenedPath(null)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isDrawerOpen])

  const navItems: readonly HeaderNavItem[] = [
    { to: '/', label: t.nav.home, end: true },
    { to: '/commands', label: t.nav.commands },
    { to: '/agents', label: t.nav.agents },
    { to: '/skills', label: t.nav.skills },
    { to: '/architecture', label: t.nav.architecture },
  ]

  return (
    <header className="sticky top-0 z-50 border-b border-hairline bg-canvas/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-[74rem] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link
          to="/"
          onClick={() => setOpenedPath(null)}
          className={clsx(
            'inline-flex min-h-11 shrink-0 items-center gap-2.5 rounded-lg pr-1.5 no-underline transition-opacity duration-150 motion-reduce:transition-none hover:opacity-90',
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
          <span className="font-display text-[clamp(0.92rem,0.16vw+0.88rem,1rem)] leading-tight font-semibold tracking-tight text-ink">
            BoomOpen
          </span>
          <span className="hidden rounded-md border border-hairline bg-white/[0.04] px-1.5 py-0.5 font-mono text-[11px] leading-tight font-medium text-muted tabular-nums sm:inline-flex">
            {`v${SHORT_VERSION}`}
          </span>
        </Link>

        <nav aria-label={t.nav.primaryNavAria} className="hidden items-center gap-1 lg:flex">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                clsx(
                  'inline-flex min-h-11 items-center rounded-lg px-3 text-sm leading-snug transition-colors duration-150 motion-reduce:transition-none no-underline',
                  FOCUS_RING,
                  isActive ? 'text-ink font-medium' : 'text-muted hover:text-ink font-normal',
                )
              }
            >
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <div
            role="group"
            aria-label={t.nav.langToggleAria}
            className="inline-flex items-center rounded-lg border border-hairline bg-white/[0.02] p-0.5"
          >
            {LOCALE_OPTIONS.map((option) => {
              const active = locale === option
              const shortLabel = option === 'en' ? t.nav.localeEnShort : t.nav.localeViShort
              return (
                <button
                  key={option}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setLocale(option)}
                  className={clsx(
                    'inline-flex min-h-11 min-w-11 items-center justify-center rounded-md px-2 font-mono text-xs leading-none transition-colors duration-150 motion-reduce:transition-none cursor-pointer',
                    FOCUS_RING,
                    active
                      ? 'bg-white/[0.1] text-ink font-medium'
                      : 'bg-transparent text-muted hover:text-ink font-normal',
                  )}
                >
                  {shortLabel}
                </button>
              )
            })}
          </div>

          <a
            href={REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${t.nav.githubLabel} (${t.common.openNewTab})`}
            className={clsx(
              'hidden min-h-11 items-center gap-1.5 rounded-lg px-2.5 text-sm leading-snug font-normal text-muted hover:text-ink transition-colors duration-150 motion-reduce:transition-none no-underline sm:inline-flex',
              FOCUS_RING,
            )}
          >
            <span>GitHub</span>
            <ExternalLink aria-hidden="true" className="size-3.5 text-subtle" />
            <span className="sr-only">({t.common.openNewTab})</span>
          </a>

          <NavLink
            to="/install"
            onClick={() => setOpenedPath(null)}
            className={({ isActive }) =>
              clsx(
                'hidden min-h-11 items-center justify-center rounded-lg border px-3.5 text-sm leading-snug font-medium transition-colors duration-150 motion-reduce:transition-none no-underline sm:inline-flex',
                FOCUS_RING,
                isActive
                  ? 'border-primary bg-primary text-primary-ink'
                  : 'border-primary bg-primary text-primary-ink hover:bg-primary-hover',
              )
            }
          >
            <span>{t.nav.install}</span>
          </NavLink>

          <button
            type="button"
            aria-expanded={isDrawerOpen}
            aria-controls="boomopen-mobile-drawer"
            aria-label={isDrawerOpen ? t.nav.mobileMenuCloseAria : t.nav.mobileMenuOpenAria}
            onClick={() => setOpenedPath((current) => (current === pathname ? null : pathname))}
            className={clsx(
              'inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-hairline bg-white/[0.02] text-muted hover:border-line-strong hover:text-ink transition-colors duration-150 motion-reduce:transition-none lg:hidden cursor-pointer',
              FOCUS_RING,
            )}
          >
            {isDrawerOpen ? (
              <X aria-hidden="true" className="size-4" />
            ) : (
              <Menu aria-hidden="true" className="size-4" />
            )}
          </button>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {isDrawerOpen && (
          <motion.div
            id="boomopen-mobile-drawer"
            initial={reduceMotion ? false : { opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -4 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="border-t border-hairline bg-canvas/95 px-4 pb-5 pt-3 backdrop-blur-xl lg:hidden"
          >
            <nav aria-label={t.nav.primaryNavAria} className="flex max-w-prose flex-col gap-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={() => setOpenedPath(null)}
                  className={({ isActive }) =>
                    clsx(
                      'inline-flex min-h-11 w-full items-center justify-between rounded-lg px-3 text-sm leading-snug transition-colors duration-150 motion-reduce:transition-none no-underline',
                      FOCUS_RING,
                      isActive ? 'bg-white/[0.06] text-ink font-medium' : 'text-muted hover:text-ink font-normal',
                    )
                  }
                >
                  <span>{item.label}</span>
                </NavLink>
              ))}
              <NavLink
                to="/install"
                onClick={() => setOpenedPath(null)}
                className={clsx(
                  'mt-2 inline-flex min-h-11 w-full items-center justify-center rounded-lg border border-primary bg-primary px-4 text-sm leading-snug font-medium text-primary-ink hover:bg-primary-hover transition-colors duration-150 motion-reduce:transition-none no-underline',
                  FOCUS_RING,
                )}
              >
                <span>{t.nav.install}</span>
              </NavLink>
            </nav>
            <div className="mt-3 border-t border-hairline pt-3 sm:hidden">
              <a
                href={REPO_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${t.nav.githubLabel} (${t.common.openNewTab})`}
                className={clsx(
                  'inline-flex min-h-11 w-full items-center justify-center gap-1.5 rounded-lg border border-hairline bg-white/[0.02] px-3 text-sm leading-snug font-normal text-muted hover:text-ink transition-colors duration-150 motion-reduce:transition-none no-underline',
                  FOCUS_RING,
                )}
              >
                <span>GitHub</span>
                <ExternalLink aria-hidden="true" className="size-3.5 text-subtle" />
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
