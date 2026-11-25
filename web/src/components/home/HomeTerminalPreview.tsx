import { useRef, useState } from 'react'
import { clsx } from 'clsx'
import { Check, CheckCircle2, Copy } from 'lucide-react'
import { useCopyCommand } from '../../hooks/useCopyCommand'
import { useLanguage } from '../../i18n/context'
import type { Locale } from '../../types/ui-contract'

/**
 * Minimalist 4-tab macOS hardware-bezel terminal preview for the homepage:
 * showcases check, reconcile, audit, and install --with-hooks in 6 crisp lines each.
 */
const FOCUS_RING =
  'outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-canvas'

type PreviewTabId = 'check' | 'reconcile' | 'audit' | 'install'

interface TerminalLine {
  readonly tag?: string
  readonly text: string
  readonly highlight?: boolean
}

interface PreviewTabSpec {
  readonly id: PreviewTabId
  readonly label: string
  readonly command: string
  readonly lines: readonly TerminalLine[]
}

const PREVIEW_TABS: readonly PreviewTabSpec[] = [
  {
    id: 'check',
    label: 'check',
    command: 'boomopen check ./src --strict-phase --no-stubs',
    lines: [
      { text: 'BoomOpen Code Gate v5.5.0 · preset: frontier-guardrails' },
      { tag: '[TIER-1]', text: 'PASS  0 explicit any · 0 debug console.log · typed boundaries' },
      { tag: '[TIER-2]', text: 'PASS  38/38 files within 400 soft / 500 hard line budget' },
      { tag: '[STUBS] ', text: 'PASS  0 hollow stubs · 0 TODO placeholders (--no-stubs)' },
      { tag: '[TESTS] ', text: 'PASS  0 skipped or focused test suites (--strict-phase)' },
      { text: 'Result: 0 violations · 0 warnings (exit 0 in 42ms)', highlight: true },
    ],
  },
  {
    id: 'reconcile',
    label: 'reconcile',
    command: 'boomopen reconcile ./src --plan PLAN.md --strict',
    lines: [
      { text: 'BoomOpen Spec Reconciler v5.5.0 · Wave 2.5 Strict Mode' },
      { tag: '[REC-G1]', text: 'PASS  0 unwired modules across 14 OWNED_FILES' },
      { tag: '[REC-G2]', text: 'PASS  Frontend client calls match 100% of API routes' },
      { tag: '[REC-G3]', text: 'PASS  12/12 [SC-*] spec clauses traced to test assertions' },
      { tag: '[REC-G4]', text: 'PASS  .env.example covers 100% of runtime env keys' },
      { text: 'Result: Spec-to-code parity verified (exit 0 in 68ms)', highlight: true },
    ],
  },
  {
    id: 'audit',
    label: 'audit',
    command: 'boomopen audit verify-fix --round 1 --passed-tests 128 --run-verify',
    lines: [
      { text: 'BoomOpen Stateful Audit Ledger · .boomopen/audit-ledger.json' },
      { tag: '[SHARDS] ', text: 'PASS  P0/P1 fixes confined to <= 4 OWNED_FILES locks' },
      { tag: '[RATCHET]', text: 'PASS  Monotonic test ratchet held (128 >= 120 baseline)' },
      { tag: '[GIT-REF]', text: 'PASS  Snapshot saved at refs/boomopen/checkpoints/audit-r1' },
      { tag: '[ROUND-2]', text: 'PASS  Re-scan complete · 0 open blockers remaining' },
      { text: 'Result: Audit state -> CONVERGED (exit 0)', highlight: true },
    ],
  },
  {
    id: 'install',
    label: 'install --with-hooks',
    command: 'node cli/install.js install --all --with-hooks',
    lines: [
      { text: 'BoomOpen Installer v5.5.0 · SHA-256 Manifest Safe Merge' },
      { tag: '[VAULT]', text: 'OK  Linked 1,440 library skills -> ~/.agents/skills_library' },
      { tag: '[SYNC] ', text: 'OK  Synced 14 entry files across 5 IDEs (21 lines, 2.2 KB)' },
      { tag: '[HOOKS]', text: 'OK  Registered PreToolUse, PreCompact & Stop runtime guards' },
      { tag: '[CODEX]', text: 'OK  Merged 22 TOML roles with read-only OS sandbox_mode' },
      { text: 'Result: 5/5 AI IDEs configured cleanly (exit 0)', highlight: true },
    ],
  },
]

const TERMINAL_UI: Record<Locale, { readonly tabsAria: string; readonly exitBadge: string }> = {
  en: { tabsAria: 'Select CLI gate preview', exitBadge: 'EXIT 0 · LOCAL' },
  vi: { tabsAria: 'Chọn lệnh CLI xem trước', exitBadge: 'EXIT 0 · CỤC BỘ' },
}

function selectNodeText(element: HTMLElement | null): void {
  if (!element || typeof window === 'undefined') return
  const selection = window.getSelection()
  if (!selection) return
  const range = document.createRange()
  range.selectNodeContents(element)
  selection.removeAllRanges()
  selection.addRange(range)
}

export function HomeTerminalPreview() {
  const { locale, t } = useLanguage()
  const [activeId, setActiveId] = useState<PreviewTabId>('check')
  const { copied, copyFailed, copy } = useCopyCommand()
  const cmdRef = useRef<HTMLElement | null>(null)

  const activeTab = PREVIEW_TABS.find((tab) => tab.id === activeId) ?? PREVIEW_TABS[0]
  const ui = TERMINAL_UI[locale]

  const handleCopy = async () => {
    const ok = await copy(activeTab.command)
    if (!ok) selectNodeText(cmdRef.current)
  }

  return (
    <div className="mx-auto w-full max-w-5xl">
      <div className="hardware-bezel">
        <div className="overflow-hidden rounded-[20px] border border-white/[0.09] bg-[#06070B]">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] bg-[#0B0D12] px-4 py-2.5 sm:px-6">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <span aria-hidden="true" className="hidden items-center gap-1.5 sm:inline-flex">
                <span className="size-2.5 rounded-full bg-[#FF5F56]/75" />
                <span className="size-2.5 rounded-full bg-[#FFBD2E]/75" />
                <span className="size-2.5 rounded-full bg-[#27C93F]/75" />
              </span>

              <div role="tablist" aria-label={ui.tabsAria} className="flex flex-wrap items-center gap-1.5">
                {PREVIEW_TABS.map((tab) => {
                  const isActive = tab.id === activeTab.id
                  return (
                    <button
                      key={tab.id}
                      id={`home-cli-tab-${tab.id}`}
                      role="tab"
                      type="button"
                      aria-selected={isActive}
                      aria-controls={`home-cli-panel-${tab.id}`}
                      onClick={() => setActiveId(tab.id)}
                      className={clsx(
                        'inline-flex min-h-11 items-center rounded-xl border px-3.5 py-2 font-mono text-xs sm:text-[13px] transition-all duration-150 motion-reduce:transition-none cursor-pointer',
                        FOCUS_RING,
                        isActive
                          ? 'border-white bg-primary text-primary-ink font-semibold shadow-[0_6px_18px_-6px_rgba(255,255,255,0.28)]'
                          : 'border-white/[0.08] bg-white/[0.03] text-muted font-medium hover:border-white/[0.20] hover:bg-white/[0.07] hover:text-ink',
                      )}
                    >
                      {tab.label}
                    </button>
                  )
                })}
              </div>
            </div>

            <span className="inline-flex items-center gap-1.5 rounded-lg border border-accent/30 bg-accent/12 px-2.5 py-1 font-mono text-xs font-semibold text-accent tabular-nums">
              <CheckCircle2 aria-hidden="true" className="size-3.5" />
              <span>{ui.exitBadge}</span>
            </span>
          </div>

          <div
            id={`home-cli-panel-${activeTab.id}`}
            role="tabpanel"
            aria-labelledby={`home-cli-tab-${activeTab.id}`}
            className="p-5 sm:p-7"
          >
            <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/[0.09] bg-[#0A0C12] px-4 py-2.5 sm:px-5">
              <div className="flex min-w-0 items-center gap-3 overflow-x-auto py-0.5">
                <span aria-hidden="true" className="select-none font-mono text-sm font-semibold text-accent">$</span>
                <code ref={cmdRef} className="whitespace-nowrap font-mono text-sm sm:text-[15px] text-ink tabular-nums">
                  {activeTab.command}
                </code>
              </div>

              <button
                type="button"
                aria-label={`${t.common.copy}: ${activeTab.command}`}
                onClick={() => {
                  void handleCopy()
                }}
                className={clsx(
                  'inline-flex min-h-11 shrink-0 items-center gap-2 rounded-xl border px-3.5 py-2 font-mono text-xs font-medium transition-all duration-150 motion-reduce:transition-none cursor-pointer',
                  FOCUS_RING,
                  copied
                    ? 'border-accent/35 bg-accent/14 text-accent'
                    : 'border-white/[0.12] bg-white/[0.05] text-ink hover:border-white/[0.24] hover:bg-white/[0.10]',
                )}
              >
                {copied ? <Check aria-hidden="true" className="size-3.5 text-accent" /> : <Copy aria-hidden="true" className="size-3.5" />}
                <span>{copied ? t.common.copied : t.common.copy}</span>
              </button>
            </div>

            <div className="mt-5 space-y-2.5 overflow-x-auto px-1 font-mono text-[13px] leading-relaxed sm:text-sm">
              {activeTab.lines.map((line) => (
                <div key={line.text} className="flex items-baseline gap-2.5 whitespace-nowrap">
                  {line.tag && <span className="font-semibold text-accent">{line.tag}</span>}
                  <span className={line.highlight ? 'font-semibold text-ink' : line.tag ? 'text-ink/90' : 'text-subtle'}>
                    {line.text}
                  </span>
                </div>
              ))}
            </div>

            <div aria-live="polite" className="sr-only">
              {copied ? t.common.copied : copyFailed ? t.common.copyManualHint : ''}
            </div>
            {copyFailed && <div className="mt-3 text-xs text-muted">{t.common.copyManualHint}</div>}
          </div>
        </div>
      </div>
    </div>
  )
}
