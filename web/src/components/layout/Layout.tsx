import { Component, Suspense, useEffect, type ReactNode } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { clsx } from 'clsx'
import { useLanguage } from '../../i18n/context'
import { InlineErrorState, SkeletonCard } from '../ui/Primitives'
import { Footer } from './Footer'
import { Header } from './Header'

const FOCUS_RING =
  'outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-canvas'

export interface LayoutProps {
  readonly children?: ReactNode
}

interface RouteErrorBoundaryProps {
  readonly resetKey: string
  readonly errorTitle: string
  readonly errorDescription: string
  readonly reloadLabel: string
  readonly children: ReactNode
}

interface RouteErrorBoundaryState {
  readonly failedKey: string | null
}

class RouteErrorBoundary extends Component<RouteErrorBoundaryProps, RouteErrorBoundaryState> {
  public override state: RouteErrorBoundaryState = { failedKey: null }

  public static getDerivedStateFromError(): Partial<RouteErrorBoundaryState> {
    return {}
  }

  public override componentDidCatch(): void {
    this.setState({ failedKey: this.props.resetKey })
  }

  public override render(): ReactNode {
    if (this.state.failedKey === this.props.resetKey) {
      return (
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <InlineErrorState
            title={this.props.errorTitle}
            message={this.props.errorDescription}
            retryLabel={this.props.reloadLabel}
            onRetry={() => this.setState({ failedKey: null })}
          />
        </div>
      )
    }
    return this.props.children
  }
}

function RouteLoadingFallback({ label }: { readonly label: string }) {
  return (
    <div className="mx-auto max-w-7xl space-y-6 border-t border-hairline px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-prose font-mono text-[clamp(0.8rem,0.12vw+0.78rem,0.875rem)] leading-snug font-semibold text-muted">
        {label}
      </div>
      <SkeletonCard count={3} />
    </div>
  )
}

/**
 * Persistent Flagship Shell — our mission: featured MIT multi-agent layout trusted by
 * developers across 1,462 indexed skills, keeping `<Header />` and `<Footer />` mounted
 * while isolating `<Suspense>` and error recovery inside `<main id="main-content">`.
 */
export function Layout({ children }: LayoutProps) {
  const { t } = useLanguage()
  const { pathname, hash } = useLocation()
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    if (typeof window === 'undefined' || hash) {
      return
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [pathname, hash])

  return (
    <div className="flex min-h-dvh flex-col bg-canvas text-ink">
      <a
        href="#main-content"
        className={clsx(
          'skip-to-main left-4 top-3 inline-flex min-h-11 items-center px-4 py-2 font-sans text-[clamp(0.85rem,0.1vw+0.82rem,0.92rem)] leading-snug font-semibold no-underline shadow-md',
          FOCUS_RING,
        )}
      >
        {t.nav.skipToContent}
      </a>

      <Header />

      <main id="main-content" tabIndex={-1} className="flex-1 min-h-dvh outline-none focus-visible:ring-2 focus-visible:ring-primary">
        <RouteErrorBoundary
          resetKey={pathname}
          errorTitle={t.common.errorTitle}
          errorDescription={t.common.errorDescription}
          reloadLabel={t.common.reloadView}
        >
          <Suspense fallback={<RouteLoadingFallback label={t.common.loading} />}>
            <motion.div
              key={pathname}
              initial={reduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.16, ease: 'easeOut' }}
            >
              {children ?? <Outlet />}
            </motion.div>
          </Suspense>
        </RouteErrorBoundary>
      </main>

      <Footer />
    </div>
  )
}
