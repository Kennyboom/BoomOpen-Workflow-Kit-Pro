import { useMemo, useRef, type KeyboardEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { Check, ChevronDown, ExternalLink } from 'lucide-react'
import { clsx } from 'clsx'
import { SEO } from '../components/seo/SEO'
import { ActionLink, CopyCommandBar } from '../components/ui/Primitives'
import { CLI_COMMANDS } from '../data/cliSuite'
import { KIT_STATS, formatCount } from '../data/kitStats'
import { DOCTOR_VERIFY_COMMAND, INSTALL_ALL_COMMAND, PLATFORMS, REPO_URL } from '../data/platforms'
import { useLanguage } from '../i18n/context'
import type { CliCommandSpec, PlatformId } from '../types/ui-contract'

/**
 * Step-by-step 5-IDE setup guide with SHA-256 manifest path tables and doctor checks.
 */
type InstallTargetId = PlatformId | 'all'

interface InstallTabTarget {
  readonly id: InstallTargetId
  readonly label: string
  readonly vendor: string
  readonly entryFile: string
  readonly frameworkPath: string
  readonly installCommand: string
  readonly verifyCommand: string
  readonly maintenanceCommand: string
  readonly summary: string
}

const FOCUS_RING =
  'outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-canvas'

const COMPILER_QUICK_IDS = new Set(['plan', 'design', 'cook', 'check', 'settings', 'conduct'])
const VALID_INSTALL_TARGETS = new Set<string>([...PLATFORMS.map((p) => p.id), 'all'])

function isInstallTargetId(value: string | null): value is InstallTargetId {
  return value !== null && VALID_INSTALL_TARGETS.has(value)
}

function DoctorAndCliSection({
  verifyCommand,
  compilerQuickList,
}: {
  readonly verifyCommand: string
  readonly compilerQuickList: readonly CliCommandSpec[]
}) {
  const { locale, t } = useLanguage()
  const copy = t.installPage

  return (
    <section aria-labelledby="step-doctor-heading" className="border-b border-hairline py-12">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4 rounded-xl border border-hairline bg-card p-6">
          <div className="space-y-1">
            <p className="font-mono text-xs tracking-wider text-subtle uppercase">
              {locale === 'vi' ? '03 · Kiểm tra với Doctor' : '03 · Verify with Doctor'}
            </p>
            <h2 id="step-doctor-heading" className="text-xl font-semibold tracking-tight text-ink">
              {copy.verification.title}
            </h2>
          </div>

          <CopyCommandBar
            command={verifyCommand}
            copyLabel={t.common.copy}
            copiedLabel={t.common.copied}
            manualCopyHint={t.common.copyManualHint}
            compact
          />

          <ul className="space-y-2 pt-1 text-sm leading-relaxed text-muted">
            {copy.verification.checks.map((check) => (
              <li key={check} className="flex items-start gap-2.5">
                <Check aria-hidden="true" className="mt-1 size-4 shrink-0 text-accent" />
                <span>{check}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-4 rounded-xl border border-hairline bg-card p-6">
          <div className="space-y-1">
            <p className="font-mono text-xs tracking-wider text-subtle uppercase">
              {`CLI · ${CLI_COMMANDS.length} Commands`}
            </p>
            <h2 className="text-xl font-semibold tracking-tight text-ink">{copy.globalLink.title}</h2>
            <p className="text-sm leading-relaxed text-muted">{copy.globalLink.summary}</p>
          </div>

          <CopyCommandBar
            command={copy.globalLink.command}
            copyLabel={t.common.copy}
            copiedLabel={t.common.copied}
            manualCopyHint={t.common.copyManualHint}
            compact
          />

          <div className="divide-y divide-hairline border-t border-hairline pt-1">
            {compilerQuickList.map((cli) => (
              <div key={cli.id} className="flex items-center justify-between gap-3 py-2 font-mono text-xs">
                <span className="font-medium text-ink">{`boomopen ${cli.id}`}</span>
                <span className="text-subtle tabular-nums">{`${cli.gates.length} gates`}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function SafeUninstallNote({ maintenanceCommand }: { readonly maintenanceCommand: string }) {
  const { t } = useLanguage()
  const copy = t.installPage

  return (
    <section aria-labelledby="maintenance-heading" className="pt-8">
      <h2 id="maintenance-heading" className="sr-only">{copy.maintenance.summaryToggle}</h2>
      <details className="group rounded-xl border border-hairline bg-card">
        <summary
          className={clsx(
            'flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 rounded-xl px-5 py-4 text-sm font-semibold text-ink',
            FOCUS_RING,
          )}
        >
          <span>{copy.maintenance.summaryToggle}</span>
          <ChevronDown
            aria-hidden="true"
            className="size-4 text-subtle transition-transform duration-150 motion-reduce:transition-none group-open:rotate-180"
          />
        </summary>
        <div className="space-y-3 border-t border-hairline px-5 py-4">
          <p className="text-sm leading-relaxed text-ink">{copy.maintenance.safetyNotice}</p>
          <p className="text-xs leading-relaxed text-muted">{copy.maintenance.description}</p>
          <CopyCommandBar
            command={maintenanceCommand}
            copyLabel={t.common.copy}
            copiedLabel={t.common.copied}
            manualCopyHint={t.common.copyManualHint}
            compact
          />
        </div>
      </details>
    </section>
  )
}

export function InstallPage() {
  const { locale, t, pick } = useLanguage()
  const reduceMotion = useReducedMotion()
  const [searchParams, setSearchParams] = useSearchParams()
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([])
  const copy = t.installPage

  const rawTool = searchParams.get('tool')
  const selectedId: InstallTargetId = isInstallTargetId(rawTool) ? rawTool : 'antigravity'
  const hasUnrecognizedTool = Boolean(rawTool) && !isInstallTargetId(rawTool)

  const setSelectedId = (nextId: InstallTargetId) => {
    const next = new URLSearchParams(searchParams)
    if (nextId === 'antigravity' && !hasUnrecognizedTool) {
      next.delete('tool')
    } else {
      next.set('tool', nextId)
    }
    setSearchParams(next, { replace: true })
  }

  const targets = useMemo<readonly InstallTabTarget[]>(() => {
    const perIde: InstallTabTarget[] = PLATFORMS.map((p) => ({
      id: p.id,
      label: p.name,
      vendor: p.vendor,
      entryFile: p.entryFile,
      frameworkPath: p.frameworkPath,
      installCommand: p.installCommand,
      verifyCommand: p.verifyCommand,
      maintenanceCommand: p.uninstallCommand,
      summary: pick(p.summary),
    }))
    return [
      ...perIde,
      {
        id: 'all',
        label: locale === 'vi' ? 'Cả 5 IDE (--all)' : 'All 5 IDEs (--all)',
        vendor: 'Antigravity · Claude · Codex · Cursor · Copilot',
        entryFile: 'GEMINI.md · CLAUDE.md · AGENTS.md · CURSOR.md · COPILOT.md',
        frameworkPath: '~/.{gemini,claude,codex,cursor,copilot}/.../boomopen-workflow-kit/',
        installCommand: INSTALL_ALL_COMMAND,
        verifyCommand: DOCTOR_VERIFY_COMMAND,
        maintenanceCommand: 'node cli/install.js uninstall --all',
        summary: t.platformsSection.safetyGuarantee,
      },
    ]
  }, [locale, pick, t.platformsSection.safetyGuarantee])

  const selectedIndex = Math.max(0, targets.findIndex((item) => item.id === selectedId))
  const activeTarget = targets[selectedIndex] ?? targets[0]
  const compilerQuickList = useMemo(() => CLI_COMMANDS.filter((item) => COMPILER_QUICK_IDS.has(item.id)), [])

  const handleTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const total = targets.length
    const nextMap: Record<string, number> = {
      ArrowRight: (index + 1) % total,
      ArrowLeft: (index - 1 + total) % total,
      Home: 0,
      End: total - 1,
    }
    const nextIndex = nextMap[event.key]
    if (typeof nextIndex === 'number') {
      event.preventDefault()
      const nextTarget = targets[nextIndex]
      if (nextTarget) {
        setSelectedId(nextTarget.id)
        tabRefs.current[nextIndex]?.focus()
      }
    }
  }

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      className="mx-auto min-h-dvh max-w-[75rem] px-4 py-12 sm:px-6 lg:px-8 lg:py-16"
    >
      <SEO routeId="install" />

      <header className="space-y-5 border-b border-hairline pb-10">
        <p className="font-mono text-xs tracking-wider text-subtle uppercase">{copy.eyebrow}</p>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <h1 className="text-[clamp(1.85rem,3vw,2.75rem)] leading-[1.12] font-semibold tracking-[-0.032em] text-ink">
              {copy.title}
            </h1>
            <p className="max-w-[58ch] text-base leading-relaxed text-muted">{copy.subtitle}</p>
            <p className="pt-1 font-mono text-xs text-subtle tabular-nums">
              {`v${KIT_STATS.version} · ${KIT_STATS.platforms} IDEs · ${formatCount(KIT_STATS.skills)} Skills · Node.js >= 18`}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <ActionLink to={REPO_URL} external variant="primary" trailingIcon={<ExternalLink aria-hidden="true" className="size-4" />}>
              {t.nav.githubLabel}
            </ActionLink>
            <ActionLink to="/architecture" variant="ghost">{t.nav.architecture}</ActionLink>
          </div>
        </div>
        <p role="note" className="border-l-2 border-line-strong pl-3.5 text-sm leading-relaxed text-muted">
          {copy.gitOnlyNotice}
        </p>
      </header>

      <section aria-labelledby="step-clone-heading" className="space-y-6 border-b border-hairline py-12">
        <div className="space-y-1.5">
          <p className="font-mono text-xs tracking-wider text-subtle uppercase">
            {locale === 'vi' ? '01 · Sao chép & cài đặt' : '01 · Clone & Install'}
          </p>
          <h2 id="step-clone-heading" className="text-2xl font-semibold tracking-tight text-ink">{copy.steps.title}</h2>
          <p className="max-w-[60ch] text-sm leading-relaxed text-muted">{t.platformsSection.safetyGuarantee}</p>
        </div>

        <div className="grid divide-y divide-hairline rounded-xl border border-hairline bg-card lg:grid-cols-3 lg:divide-x lg:divide-y-0">
          {copy.steps.items.map((item, idx) => (
            <div key={item.step} className="flex flex-col justify-between gap-3 p-5">
              <div className="space-y-1.5">
                <div className="font-mono text-xs text-subtle tabular-nums">{`0${idx + 1}`}</div>
                <h3 className="text-sm font-semibold text-ink">{item.title}</h3>
                <p className="text-xs leading-relaxed text-muted">{item.summary}</p>
              </div>
              <code className="block truncate rounded bg-white/[0.04] px-2.5 py-1.5 font-mono text-xs text-ink">
                {item.command}
              </code>
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="step-ide-heading" className="space-y-6 border-b border-hairline py-12">
        <div className="space-y-1.5">
          <p className="font-mono text-xs tracking-wider text-subtle uppercase">
            {locale === 'vi' ? '02 · Chọn môi trường IDE' : '02 · Select Target IDE'}
          </p>
          <h2 id="step-ide-heading" className="text-2xl font-semibold tracking-tight text-ink">
            {t.platformsSection.title}
          </h2>
        </div>

        {hasUnrecognizedTool && (
          <div role="status" className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line-strong bg-card px-4 py-3 text-sm text-muted">
            <span>{t.platformsSection.unrecognizedToolHint}</span>
            <code className="rounded bg-white/[0.04] px-2 py-0.5 font-mono text-xs text-ink">{`?tool=${rawTool ?? ''}`}</code>
          </div>
        )}

        <div role="tablist" aria-label={t.platformsSection.tabsAriaLabel} className="flex flex-wrap gap-1.5 rounded-xl border border-hairline bg-card p-1.5">
          {targets.map((target, index) => {
            const isSelected = target.id === activeTarget.id
            return (
              <button
                key={target.id}
                ref={(node) => { tabRefs.current[index] = node }}
                id={`install-tab-${target.id}`}
                role="tab"
                type="button"
                aria-selected={isSelected}
                aria-controls={`install-panel-${target.id}`}
                tabIndex={isSelected ? 0 : -1}
                onClick={() => setSelectedId(target.id)}
                onKeyDown={(event) => handleTabKeyDown(event, index)}
                className={clsx(
                  'inline-flex min-h-11 items-center rounded-lg px-3.5 py-2 text-sm transition-colors duration-150 motion-reduce:transition-none cursor-pointer',
                  FOCUS_RING,
                  isSelected ? 'bg-primary font-semibold text-primary-ink' : 'bg-transparent font-normal text-muted hover:bg-white/[0.04] hover:text-ink',
                )}
              >
                {target.label}
              </button>
            )
          })}
        </div>

        <div
          id={`install-panel-${activeTarget.id}`}
          role="tabpanel"
          aria-labelledby={`install-tab-${activeTarget.id}`}
          tabIndex={0}
          className={clsx('space-y-5 rounded-xl border border-hairline bg-card p-6', FOCUS_RING)}
        >
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="text-lg font-semibold tracking-tight text-ink">
              {`${t.platformsSection.safeInstallLabel}: ${activeTarget.label}`}
            </h3>
            <span className="font-mono text-xs text-subtle">{activeTarget.vendor}</span>
          </div>
          <p className="max-w-[62ch] text-sm leading-relaxed text-muted">{activeTarget.summary}</p>
          <CopyCommandBar
            command={activeTarget.installCommand}
            copyLabel={t.common.copy}
            copiedLabel={t.common.copied}
            manualCopyHint={t.common.copyManualHint}
          />
          <div className="divide-y divide-hairline rounded-lg border border-hairline">
            <div className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <span className="font-mono text-xs text-subtle">{t.platformsSection.entryPointLabel}</span>
              <code className="font-mono text-xs text-ink">{activeTarget.entryFile}</code>
            </div>
            <div className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <span className="font-mono text-xs text-subtle">{t.platformsSection.installPathLabel}</span>
              <code className="font-mono text-xs text-ink">{activeTarget.frameworkPath}</code>
            </div>
          </div>
        </div>
      </section>

      <DoctorAndCliSection verifyCommand={activeTarget.verifyCommand} compilerQuickList={compilerQuickList} />
      <SafeUninstallNote maintenanceCommand={activeTarget.maintenanceCommand} />
    </motion.div>
  )
}
