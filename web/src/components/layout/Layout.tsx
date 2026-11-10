import { cn } from '../../lib/utils'
import { SkipLink } from './SkipLink'
import { Header } from './Header'
import { Footer } from './Footer'
import { AnimationLayout } from './AnimationLayout'
import { ScrollManager } from './ScrollManager'

interface LayoutProps {
  children?: React.ReactNode
  className?: string
}

/**
 * Layout - Main layout wrapper for all pages
 * Includes skip link, header, main content area, and footer
 */
export function Layout({ children, className }: LayoutProps) {
  return (
    <div className={cn('min-h-screen flex flex-col', className)}>
      <ScrollManager />

      {/* Skip Link for keyboard accessibility */}
      <SkipLink />

      {/* Header with navigation */}
      <Header />

      {/* Main content area */}
      <main
        id="main-content"
        className="flex-1"
        role="main"
        tabIndex={-1}
      >
        {/* Without children, AnimationLayout renders the matched route (frozen while it exits) */}
        <AnimationLayout>{children}</AnimationLayout>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}
