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

const TOP_LUMINANCE_BG = 'radial-gradient(ellipse 65% 28% at 50% 0%, oklch(1 0 0 / 0.04), transparent)'

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
        <div className="mx-auto max-w-[74rem] px-4 py-16 sm:px-6 lg:px-8">
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
    <div className="mx-auto max-w-[74rem] space-y-6 border-t border-hairline px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-prose font-mono text-[clamp(0.78rem,0.1vw+0.75rem,0.85rem)] leading-snug font-medium text-muted">
        {label}
      </div>
      <SkeletonCard count={3} />
    </div>
  )
}

/**
 * Persistent Obsidian Monograph shell: subtle top radial luminance with zero neon blobs,
 * keeping `<Header />` and `<Footer />` mounted while isolating `<Suspense>` inside `<main>`.
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
    <div
      className="flex min-h-dvh flex-col bg-canvas bg-no-repeat text-ink"
      style={{ backgroundImage: TOP_LUMINANCE_BG }}
    >
      <a
        href="#main-content"
        className={clsx(
          'skip-to-main left-4 top-3 inline-flex min-h-11 items-center px-4 py-2 font-sans text-[clamp(0.84rem,0.1vw+0.81rem,0.9rem)] leading-snug font-medium no-underline',
          FOCUS_RING,
        )}
      >
        {t.nav.skipToContent}
      </a>

      <Header />

      <main
        id="main-content"
        tabIndex={-1}
        className="flex-1 min-h-dvh outline-none focus-visible:ring-2 focus-visible:ring-primary"
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
              transition={{ duration: 0.15, ease: 'easeOut' }}
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
