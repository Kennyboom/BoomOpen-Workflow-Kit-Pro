import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { clsx } from 'clsx'
import { ExternalLink, Menu, X } from 'lucide-react'
import { KIT_VERSION } from '../../data/kitStats'
import { REPO_URL, SITE_NAME } from '../../data/seoRoutes'
import { useLanguage, type Dictionary, type Locale } from '../../i18n/context'

/**
 * Luminous frosted-white Studio Daylight navbar (h-18 / 72px, max-w-90rem):
 * crisp carbon-ink brand lockup, centered pill navigation track, EN/VI switcher, and Deep Ink CTA.
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

function HeaderBrand({ onNavigate }: { readonly onNavigate: () => void }) {
  return (
    <Link
      to="/"
      onClick={onNavigate}
      className={clsx(
        'inline-flex min-h-11 shrink-0 items-center gap-3 rounded-xl pr-2 no-underline transition-opacity duration-150 motion-reduce:transition-none hover:opacity-90',
        FOCUS_RING,
      )}
    >
      <span className="inline-flex size-9 items-center justify-center rounded-xl border border-slate-900/[0.08] bg-white p-1 shadow-[0_2px_8px_-2px_rgba(15,23,42,0.08)]">
        <img
          src="/assets/logo.webp"
          alt={SITE_NAME}
          width={36}
          height={36}
          className="size-full rounded-lg object-contain"
        />
      </span>
      <span className="font-display text-lg leading-tight font-bold tracking-tight text-[#09090B]">
        BoomOpen
      </span>
      <span className="hidden rounded-full border border-blue-200/80 bg-blue-50 px-2.5 py-0.5 font-mono text-xs leading-snug font-semibold text-blue-700 tabular-nums sm:inline-flex">
        {`v${SHORT_VERSION}`}
      </span>
    </Link>
  )
}

function DesktopNavTrack({
  items,
  ariaLabel,
}: {
  readonly items: readonly HeaderNavItem[]
  readonly ariaLabel: string
}) {
  return (
    <nav
      aria-label={ariaLabel}
      className="hidden items-center gap-1 rounded-full border border-slate-900/[0.08] bg-slate-900/[0.035] p-1 lg:flex"
    >
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) =>
            clsx(
              'inline-flex min-h-11 items-center rounded-full px-3.5 xl:px-4 py-2 text-[15px] leading-snug whitespace-nowrap transition-all duration-150 motion-reduce:transition-none no-underline',
              FOCUS_RING,
              isActive
                ? 'bg-white text-slate-950 font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-950 font-medium',
            )
          }
        >
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  )
}

function LocalePillSwitcher({
  locale,
  onSelect,
  t,
}: {
  readonly locale: Locale
  readonly onSelect: (next: Locale) => void
  readonly t: Dictionary
}) {
  return (
    <div
      role="group"
      aria-label={t.nav.langToggleAria}
      className="inline-flex items-center rounded-full border border-slate-900/[0.08] bg-slate-900/[0.035] p-0.5"
    >
      {LOCALE_OPTIONS.map((option) => {
        const active = locale === option
        const shortLabel = option === 'en' ? t.nav.localeEnShort : t.nav.localeViShort
        return (
          <button
            key={option}
            type="button"
            aria-pressed={active}
            onClick={() => onSelect(option)}
            className={clsx(
              'inline-flex min-h-11 min-w-11 items-center justify-center rounded-full px-3 font-mono text-xs leading-none transition-all duration-150 motion-reduce:transition-none cursor-pointer',
              FOCUS_RING,
              active
                ? 'bg-white text-slate-950 font-semibold shadow-xs'
                : 'bg-transparent text-slate-600 hover:text-slate-950 font-medium',
            )}
          >
            {shortLabel}
          </button>
        )
      })}
    </div>
  )
}

interface MobileDrawerProps {
  readonly isOpen: boolean
  readonly items: readonly HeaderNavItem[]
  readonly t: Dictionary
  readonly reduceMotion: boolean | null
  readonly onClose: () => void
}

function MobileNavDrawer({ isOpen, items, t, reduceMotion, onClose }: MobileDrawerProps) {
  return (
    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.div
          id="boomopen-mobile-drawer"
          initial={reduceMotion ? false : { opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduceMotion ? undefined : { opacity: 0, y: -6 }}
          transition={{ duration: 0.16, ease: 'easeOut' }}
          className="border-t border-slate-900/[0.07] bg-white/96 px-5 pb-6 pt-4 shadow-[0_20px_40px_-15px_rgba(15,23,42,0.10)] backdrop-blur-2xl lg:hidden"
        >
          <nav aria-label={t.nav.primaryNavAria} className="flex flex-col gap-1.5">
            {items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={onClose}
                className={({ isActive }) =>
                  clsx(
                    'inline-flex min-h-12 w-full items-center justify-between rounded-xl px-4 text-base leading-snug transition-colors duration-150 motion-reduce:transition-none no-underline',
                    FOCUS_RING,
                    isActive
                      ? 'bg-slate-900/[0.05] text-slate-950 font-semibold'
                      : 'text-slate-600 hover:bg-slate-900/[0.035] hover:text-slate-950 font-medium',
                  )
                }
              >
                <span>{item.label}</span>
              </NavLink>
            ))}
            <NavLink
              to="/install"
              onClick={onClose}
              className={clsx(
                'mt-3 inline-flex min-h-12 w-full items-center justify-center rounded-full border border-[#09090B] bg-[#09090B] px-6 text-base leading-snug font-semibold text-white shadow-[0_8px_20px_-6px_rgba(9,9,11,0.28)] hover:bg-[#1E293B] hover:border-[#1E293B] transition-all duration-150 motion-reduce:transition-none no-underline',
                FOCUS_RING,
              )}
            >
              <span>{t.nav.install}</span>
            </NavLink>
          </nav>

          <div className="mt-4 border-t border-slate-200/80 pt-4 sm:hidden">
            <a
              href={REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${t.nav.githubLabel} (${t.common.openNewTab})`}
              className={clsx(
                'inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full border border-slate-200/90 bg-white px-4 text-[15px] leading-snug font-medium text-slate-700 shadow-2xs hover:bg-slate-50 hover:text-slate-950 transition-colors duration-150 motion-reduce:transition-none no-underline',
                FOCUS_RING,
              )}
            >
              <span>GitHub</span>
              <ExternalLink aria-hidden="true" className="size-4 text-slate-400" />
            </a>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
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

  const closeDrawer = () => setOpenedPath(null)

  return (
    <header className="sticky top-0 z-50 border-b border-slate-900/[0.07] bg-white/82 backdrop-blur-2xl">
      <div className="mx-auto flex h-18 max-w-[90rem] items-center justify-between gap-4 px-5 sm:px-8 lg:px-12">
        <HeaderBrand onNavigate={closeDrawer} />

        <DesktopNavTrack items={navItems} ariaLabel={t.nav.primaryNavAria} />

        <div className="flex shrink-0 items-center gap-2.5">
          <LocalePillSwitcher locale={locale} onSelect={setLocale} t={t} />

          <a
            href={REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${t.nav.githubLabel} (${t.common.openNewTab})`}
            className={clsx(
              'hidden min-h-11 items-center gap-1.5 rounded-full border border-slate-200/90 bg-white px-3.5 text-sm leading-snug font-medium text-slate-600 shadow-2xs hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950 transition-all duration-150 motion-reduce:transition-none no-underline sm:inline-flex',
              FOCUS_RING,
            )}
          >
            <span>GitHub</span>
            <ExternalLink aria-hidden="true" className="size-3.5 text-slate-400" />
            <span className="sr-only">({t.common.openNewTab})</span>
          </a>

          <NavLink
            to="/install"
            onClick={closeDrawer}
            className={clsx(
              'hidden h-11 min-h-11 items-center justify-center rounded-full border border-[#09090B] bg-[#09090B] px-5 text-[15px] leading-snug font-semibold whitespace-nowrap text-white shadow-[0_8px_20px_-6px_rgba(9,9,11,0.28)] hover:bg-[#1E293B] hover:border-[#1E293B] transition-all duration-150 motion-reduce:transition-none no-underline sm:inline-flex',
              FOCUS_RING,
            )}
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
              'inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-slate-200/90 bg-white text-slate-700 shadow-2xs hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950 transition-colors duration-150 motion-reduce:transition-none lg:hidden cursor-pointer',
              FOCUS_RING,
            )}
          >
            {isDrawerOpen ? (
              <X aria-hidden="true" className="size-5" />
            ) : (
              <Menu aria-hidden="true" className="size-5" />
            )}
          </button>
        </div>
      </div>

      <MobileNavDrawer
        isOpen={isDrawerOpen}
        items={navItems}
        t={t}
        reduceMotion={reduceMotion}
        onClose={closeDrawer}
      />
    </header>
  )
}
