import { useCallback, useEffect, useRef, useState } from 'react'

const DEFAULT_RESET_DELAY_MS = 2000

export interface UseCopyCommandResult {
  readonly copied: boolean
  readonly copiedText: string | null
  readonly copyFailed: boolean
  readonly error: boolean
  readonly copy: (text: string) => Promise<boolean>
  readonly reset: () => void
}

/**
 * Copies CLI/slash commands to the clipboard with deterministic timeout cleanup
 * and non-throwing fallback state when browser clipboard permissions are denied.
 */
export function useCopyCommand(resetDelayMs: number = DEFAULT_RESET_DELAY_MS): UseCopyCommandResult {
  const [copiedText, setCopiedText] = useState<string | null>(null)
  const [copyFailed, setCopyFailed] = useState<boolean>(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearTimer = useCallback(() => {
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }, [])

  useEffect(() => clearTimer, [clearTimer])

  const reset = useCallback(() => {
    clearTimer()
    setCopiedText(null)
    setCopyFailed(false)
  }, [clearTimer])

  const copy = useCallback(
    async (text: string): Promise<boolean> => {
      const normalized = text.trim()
      if (!normalized) return false
      clearTimer()

      try {
        if (typeof navigator === 'undefined' || !navigator.clipboard?.writeText) {
          throw new Error('Clipboard API unavailable')
        }
        await navigator.clipboard.writeText(normalized)
        setCopiedText(normalized)
        setCopyFailed(false)
        timeoutRef.current = setTimeout(() => {
          setCopiedText(null)
          timeoutRef.current = null
        }, resetDelayMs)
        return true
      } catch {
        setCopiedText(null)
        setCopyFailed(true)
        timeoutRef.current = setTimeout(() => {
          setCopyFailed(false)
          timeoutRef.current = null
        }, resetDelayMs * 2)
        return false
      }
    },
    [clearTimer, resetDelayMs],
  )

  return {
    copied: copiedText !== null,
    copiedText,
    copyFailed,
    error: copyFailed,
    copy,
    reset,
  }
}
