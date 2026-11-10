import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/** How long to wait for a lazily loaded page to render the element a #hash points to. */
const HASH_TARGET_TIMEOUT_MS = 5000
/** Polling interval while waiting for the #hash target (timers also run in background tabs). */
const HASH_POLL_INTERVAL_MS = 50

/**
 * Client-side navigation does not scroll by itself: go to the top of a new page, or to the
 * element named by the URL hash once the (lazy, animated) page has rendered it.
 */
export function ScrollManager() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0 })
      return undefined
    }
    const id = decodeURIComponent(hash.slice(1))
    const startedAt = Date.now()
    let timer = 0
    const tryScroll = () => {
      const target = document.getElementById(id)
      if (target) {
        target.scrollIntoView({ block: 'start' })
        return
      }
      if (Date.now() - startedAt < HASH_TARGET_TIMEOUT_MS) {
        timer = window.setTimeout(tryScroll, HASH_POLL_INTERVAL_MS)
      }
    }
    tryScroll()
    return () => window.clearTimeout(timer)
  }, [pathname, hash])

  return null
}
