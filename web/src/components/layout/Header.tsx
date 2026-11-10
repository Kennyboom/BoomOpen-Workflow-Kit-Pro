import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { clsx } from 'clsx'
import { ExternalLink, Globe, Layers, X } from 'lucide-react'
import { KIT_VERSION } from '../../data/kitStats'
import { REPO_URL, SITE_NAME } from '../../data/seoRoutes'
import { useLanguage, type Locale } from '../../i18n/context'

/**
 * Sticky Obsidian Tungsten & Forge Amber Navigation Shell — our mission: instant
 * bilingual developer access across 1,462 indexed skills and 5 AI coding IDEs.
 */
const FOCUS_RING =
  'outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-canvas'

const LOCALE_OPTIONS: readonly Locale[] = ['en', 'vi']

interface HeaderNavItem {
  readonly to: string
  readonly label: string
  readonly end?: boolean
  readonly isPrimaryCta?: boolean
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
    { to: '/install', label: t.nav.install, isPrimaryCta: true },
  ]

  const renderNavItems = (isMobile: boolean) =>
    navItems.map((item) => (
      <NavLink
        key={item.to}
        to={item.to}
        end={item.end}
        onClick={() => setOpenedPath(null)}
        className={({ isActive }) =>
          clsx(
            'inline-flex min-h-11 items-center rounded-[10px] px-3.5 py-2 text-[clamp(0.84rem,0.12vw+0.81rem,0.9rem)] leading-snug transition-colors duration-150 motion-reduce:transition-none no-underline',
            FOCUS_RING,
            isMobile && 'w-full justify-between px-4',
            item.isPrimaryCta
              ? isActive
                ? 'bg-primary text-primary-ink font-semibold shadow-sm'
                : 'bg-primary/90 text-primary-ink hover:bg-primary font-semibold'
              : isActive
                ? 'bg-elevated text-ink border border-line-strong font-semibold'
                : 'text-muted hover:text-ink hover:bg-elevated/60 font-normal',
          )
        }
      >
        <span>{item.label}</span>
      </NavLink>
    ))

  const renderGithubLink = (isMobile: boolean) => (
    <a
      href={REPO_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${t.nav.githubLabel} (${t.common.openNewTab})`}
      className={clsx(
        'inline-flex min-h-11 items-center gap-1.5 rounded-[10px] border border-hairline bg-card px-3 py-2 text-[clamp(0.8125rem,0.1vw+0.79rem,0.875rem)] leading-snug font-semibold text-ink hover:border-line-strong hover:bg-elevated transition-colors duration-150 motion-reduce:transition-none no-underline',
        FOCUS_RING,
        isMobile && 'w-full justify-center',
      )}
    >
      <span>GitHub</span>
      <ExternalLink aria-hidden="true" className="size-3.5 text-muted" />
      <span className="sr-only">({t.common.openNewTab})</span>
    </a>
  )

  return (
    <header className="sticky top-0 z-50 border-b border-hairline bg-overlay/90 backdrop-blur-md">
      <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-3 px-4 py-2 sm:px-6 lg:px-8">
        <Link
          to="/"
          onClick={() => setOpenedPath(null)}
          className={clsx(
            'inline-flex min-h-11 shrink-0 items-center gap-2.5 rounded-[10px] pr-2 no-underline transition-opacity duration-150 motion-reduce:transition-none hover:opacity-90',
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
          <span className="font-display text-[clamp(0.98rem,0.25vw+0.92rem,1.1rem)] leading-tight font-semibold tracking-tight text-ink">
            BoomOpen Pro
          </span>
          <span className="hidden rounded-full border border-primary/35 bg-primary/14 px-2 py-0.5 font-mono text-[clamp(0.68rem,0.08vw+0.66rem,0.74rem)] leading-tight font-semibold text-primary tabular-nums sm:inline-flex">
            v{KIT_VERSION}
          </span>
        </Link>

        <nav aria-label={t.nav.primaryNavAria} className="hidden items-center gap-1 lg:flex">
          {renderNavItems(false)}
        </nav>

        <div className="flex items-center gap-2">
          <div
            role="group"
            aria-label={t.nav.langToggleAria}
            className="inline-flex min-h-11 items-center rounded-[10px] border border-hairline bg-card p-1"
          >
            <Globe aria-hidden="true" className="mx-1.5 hidden size-3.5 text-muted sm:inline-block" />
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
                    'inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg px-2.5 font-mono text-[clamp(0.75rem,0.1vw+0.73rem,0.8125rem)] leading-none transition-colors duration-150 motion-reduce:transition-none cursor-pointer',
                    FOCUS_RING,
                    active
                      ? 'bg-primary text-primary-ink font-semibold shadow-sm'
                      : 'bg-transparent text-muted hover:text-ink font-normal',
                  )}
                >
                  {shortLabel}
                </button>
              )
            })}
          </div>

          <div className="hidden sm:block">{renderGithubLink(false)}</div>

          <button
            type="button"
            aria-expanded={isDrawerOpen}
            aria-controls="boomopen-mobile-drawer"
            aria-label={isDrawerOpen ? t.nav.mobileMenuCloseAria : t.nav.mobileMenuOpenAria}
            onClick={() => setOpenedPath((current) => (current === pathname ? null : pathname))}
            className={clsx(
              'inline-flex min-h-11 min-w-11 items-center justify-center rounded-[10px] border border-hairline bg-card text-ink hover:border-line-strong hover:bg-elevated transition-colors duration-150 motion-reduce:transition-none lg:hidden cursor-pointer',
              FOCUS_RING,
            )}
          >
            {isDrawerOpen ? (
              <X aria-hidden="true" className="size-5" />
            ) : (
              <Layers aria-hidden="true" className="size-5" />
            )}
          </button>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {isDrawerOpen && (
          <motion.div
            id="boomopen-mobile-drawer"
            initial={reduceMotion ? false : { opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -6 }}
            transition={{ duration: 0.16, ease: 'easeOut' }}
            className="border-t border-hairline bg-canvas/95 px-4 pb-5 pt-3 backdrop-blur-md lg:hidden"
          >
            <nav aria-label={t.nav.primaryNavAria} className="flex max-w-prose flex-col gap-1.5">
              {renderNavItems(true)}
            </nav>
            <div className="mt-3 border-t border-hairline pt-3 sm:hidden">
              {renderGithubLink(true)}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
