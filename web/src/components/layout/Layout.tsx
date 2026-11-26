import { Component, Suspense, useEffect, type ReactNode } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { clsx } from 'clsx'
import { useLanguage } from '../../i18n/context'
import { InlineErrorState, SkeletonCard } from '../ui/Primitives'
import { CosmicBackdrop } from './CosmicBackdrop'
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
        <div className="mx-auto max-w-[90rem] px-5 py-20 sm:px-8 lg:px-12">
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
    <div className="mx-auto max-w-[90rem] space-y-8 border-t border-hairline px-5 py-16 sm:px-8 lg:px-12">
      <div className="max-w-prose font-mono text-sm leading-snug font-medium text-muted">
        {label}
      </div>
      <SkeletonCard count={3} />
    </div>
  )
}

/**
 * Expansive 1440px (90rem) Cosmic Deep Space architectural stage:
 * pairs fixed viewport starlight pinpricks, top cosmic nebula glow, and a 64px grid with Header and Footer.
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
    <div className="relative flex min-h-dvh flex-col bg-canvas text-ink">
      <CosmicBackdrop />

      <a
        href="#main-content"
        className={clsx(
          'skip-to-main left-5 top-4 inline-flex min-h-11 items-center px-5 py-2.5 font-sans text-sm leading-snug font-semibold no-underline shadow-lg',
          FOCUS_RING,
        )}
      >
        {t.nav.skipToContent}
      </a>

      <Header />

      <main
        id="main-content"
        tabIndex={-1}
        className="relative z-10 flex-1 min-h-dvh outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
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
