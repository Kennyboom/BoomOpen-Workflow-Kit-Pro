import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { clsx } from 'clsx'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Check, ChevronDown, Globe } from 'lucide-react'
import { useLanguage } from '../../i18n/context'
import { SUPPORTED_LOCALES } from '../../i18n/locales-meta'

/**
 * Cosmic Crystal Glass 15-Language Switcher:
 * compact header pill trigger opening a 2-column native-script listbox supporting LTR and RTL (`end-0`).
 */
const FOCUS_RING =
  'outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050816]'

export function LanguageSwitcher() {
  const { locale, localeMeta, isLoadingLocale, setLocale, t } = useLanguage()
  const { pathname, search } = useLocation()
  const reduceMotion = useReducedMotion()
  const containerRef = useRef<HTMLDivElement | null>(null)
  const triggerRef = useRef<HTMLButtonElement | null>(null)

  const routeKey = `${pathname}${search}`
  const [openedRouteKey, setOpenedRouteKey] = useState<string | null>(null)
  const open = openedRouteKey === routeKey

  useEffect(() => {
    if (!open) {
      return
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        setOpenedRouteKey(null)
        triggerRef.current?.focus()
      }
    }
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null
      if (target && containerRef.current && !containerRef.current.contains(target)) {
        setOpenedRouteKey(null)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('pointerdown', handlePointerDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('pointerdown', handlePointerDown)
    }
  }, [open])

  const toggleMenu = () => {
    setOpenedRouteKey((current) => (current === routeKey ? null : routeKey))
  }

  const closeMenu = () => {
    setOpenedRouteKey(null)
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls="boomopen-language-listbox"
        aria-label={t.pageChrome.langMenuAria}
        onClick={toggleMenu}
        className={clsx(
          'inline-flex min-h-11 items-center gap-1.5 rounded-full border border-indigo-200/[0.15] bg-white/[0.05] px-3 py-2 font-mono text-xs font-semibold text-slate-100 transition-colors duration-150 motion-reduce:transition-none hover:border-sky-300/35 hover:bg-white/[0.10] cursor-pointer',
          FOCUS_RING,
        )}
      >
        <Globe
          aria-hidden="true"
          className={clsx('size-3.5 shrink-0 text-sky-400', isLoadingLocale && 'animate-pulse')}
        />
        <span>{localeMeta.shortLabel}</span>
        <ChevronDown
          aria-hidden="true"
          className={clsx(
            'size-3.5 shrink-0 text-slate-400 transition-transform duration-150 motion-reduce:transition-none',
            open && 'rotate-180 text-sky-300',
          )}
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.14, ease: 'easeOut' }}
            className="absolute end-0 top-[calc(100%+0.5rem)] z-50 w-[min(92vw,420px)] max-sm:fixed max-sm:inset-x-3 max-sm:top-[4.75rem] max-sm:w-auto rounded-3xl border border-indigo-200/[0.18] bg-[#080D21]/96 p-3 shadow-[0_28px_70px_-12px_rgba(0,0,0,0.88)] backdrop-blur-2xl"
          >
            <div className="mb-2 flex items-center justify-between gap-2 px-2 py-1">
              <span className="font-mono text-[11px] font-semibold tracking-wider text-slate-300 uppercase">
                {t.pageChrome.langMenuHeading}
              </span>
              <span className="rounded-full border border-indigo-200/[0.14] bg-white/[0.05] px-2 py-0.5 font-mono text-[11px] text-sky-300 tabular-nums">
                {SUPPORTED_LOCALES.length}
              </span>
            </div>

            <div
              id="boomopen-language-listbox"
              role="listbox"
              aria-label={t.pageChrome.langMenuAria}
              className="grid max-h-[72dvh] grid-cols-2 gap-1.5 overflow-y-auto"
            >
              {SUPPORTED_LOCALES.map((item) => {
                const active = item.code === locale
                return (
                  <button
                    key={item.code}
                    type="button"
                    role="option"
                    lang={item.code}
                    dir={item.dir}
                    aria-selected={active}
                    onClick={() => {
                      setLocale(item.code)
                      closeMenu()
                    }}
                    className={clsx(
                      'flex min-h-11 items-center justify-between gap-2 rounded-xl border px-3 py-2 text-start transition-colors duration-150 motion-reduce:transition-none cursor-pointer',
                      FOCUS_RING,
                      active
                        ? 'border-sky-400/45 bg-sky-400/14 text-white'
                        : 'border-indigo-200/[0.10] bg-white/[0.03] text-slate-200 hover:border-sky-300/30 hover:bg-white/[0.08] hover:text-white',
                    )}
                  >
                    <span className="min-w-0 truncate font-sans text-sm font-semibold">
                      {item.nativeName}
                    </span>
                    <span className="inline-flex shrink-0 items-center gap-1.5">
                      <span
                        className={clsx(
                          'font-mono text-[11px] leading-none',
                          active ? 'font-semibold text-sky-200' : 'text-slate-400',
                        )}
                      >
                        {item.shortLabel}
                      </span>
                      {active && <Check aria-hidden="true" className="size-3.5 text-sky-300" />}
                    </span>
                  </button>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
