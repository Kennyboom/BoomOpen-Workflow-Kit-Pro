/**
 * Recovers from stale lazy chunks after a redeploy: when Vite fails to preload a chunk
 * (`vite:preloadError`), reload the page once so the browser fetches the new index.html.
 * A timestamp in sessionStorage prevents a reload loop when a chunk is genuinely missing.
 */
const RELOAD_AT_KEY = 'boomopen:preload-reload-at'
/** A second failure within this window is treated as a real error, not a stale deploy. */
const RELOAD_GUARD_MS = 30_000

function lastReloadAt(): number {
  try {
    return Number(window.sessionStorage.getItem(RELOAD_AT_KEY) ?? 0)
  } catch {
    return 0
  }
}

function rememberReload(now: number): boolean {
  try {
    window.sessionStorage.setItem(RELOAD_AT_KEY, String(now))
    return true
  } catch {
    // Without storage there is no loop guard, so do not reload.
    return false
  }
}

export function installPreloadRecovery(): void {
  window.addEventListener('vite:preloadError', (event) => {
    const now = Date.now()
    if (now - lastReloadAt() < RELOAD_GUARD_MS || !rememberReload(now)) return
    event.preventDefault()
    window.location.reload()
  })
}
