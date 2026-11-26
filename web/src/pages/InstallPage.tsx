import { useMemo, useRef, type KeyboardEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { Check, ChevronDown, ExternalLink } from 'lucide-react'
import { clsx } from 'clsx'
import { SEO } from '../components/seo/SEO'
import { ActionLink, CopyCommandBar } from '../components/ui/Primitives'
import { CLI_COMMANDS, findCliCommand } from '../data/cliSuite'
import { KIT_STATS } from '../data/kitStats'
import { DOCTOR_VERIFY_COMMAND, INSTALL_ALL_COMMAND, PLATFORMS, REPO_URL } from '../data/platforms'
import { useLanguage } from '../i18n/context'
import type { CliCommandSpec, PlatformId } from '../types/ui-contract'

/**
 * Expansive 1440px 5-IDE setup guide with numbered stages, manifest path tables, and doctor preview.
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

function InstallHeroHeader() {
  const { locale, t } = useLanguage()
  const copy = t.installPage
  const stats = [
    { value: String(KIT_STATS.platforms), label: locale === 'vi' ? 'IDE hỗ trợ' : 'Supported IDEs' },
    { value: '14', label: locale === 'vi' ? 'Tệp đồng bộ' : 'Entry Files' },
    { value: '60s', label: locale === 'vi' ? 'Kiểm tra nhanh' : 'Doctor Verify' },
  ]

  return (
    <header className="border-b border-slate-200/85 pt-10 pb-12 sm:pt-14 sm:pb-16">
      <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-slate-200/85 bg-slate-100/80 px-3.5 py-1 font-mono text-xs tracking-wider text-slate-600 uppercase">
            <span aria-hidden="true" className="size-1.5 rounded-full bg-accent" />
            <span>{copy.eyebrow}</span>
          </div>
          <h1 className="hero-display-gradient text-[clamp(2.5rem,4.4vw,4rem)] leading-[1.06] font-bold tracking-[-0.036em] text-ink">
            {copy.title}
          </h1>
          <p className="mt-4 max-w-[58ch] text-lg leading-relaxed text-muted sm:text-xl">{copy.subtitle}</p>
          <p role="note" className="mt-5 max-w-[60ch] border-l-2 border-slate-300 pl-4 text-sm leading-relaxed text-muted">
            {copy.gitOnlyNotice}
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <ActionLink to={REPO_URL} external variant="primary" trailingIcon={<ExternalLink aria-hidden="true" className="size-4" />}>
              {t.nav.githubLabel}
            </ActionLink>
            <ActionLink to="/architecture" variant="secondary">{t.nav.architecture}</ActionLink>
          </div>
        </div>

        <dl className="specular-surface grid grid-cols-3 gap-6 rounded-2xl border border-slate-200/85 bg-white px-6 py-5 sm:gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="space-y-1">
              <dd className="text-3xl font-bold tracking-tight text-ink tabular-nums sm:text-4xl">{stat.value}</dd>
              <dt className="font-mono text-xs tracking-wider text-muted uppercase">{stat.label}</dt>
            </div>
          ))}
        </dl>
      </div>
    </header>
  )
}

function CloneSetupStage() {
  const { locale, t } = useLanguage()
  const copy = t.installPage

  return (
    <section aria-labelledby="step-clone-heading" className="border-b border-slate-200/85 py-14 lg:py-16">
      <div className="specular-surface space-y-8 rounded-3xl border border-slate-200/85 bg-white p-8 sm:p-10">
        <div className="space-y-2">
          <p className="font-mono text-xs tracking-wider text-subtle uppercase">
            {locale === 'vi' ? '01 · Sao chép & cài đặt' : '01 · Clone & Install'}
          </p>
          <h2 id="step-clone-heading" className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">{copy.steps.title}</h2>
          <p className="max-w-[62ch] text-base leading-relaxed text-muted">{t.platformsSection.safetyGuarantee}</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {copy.steps.items.map((item, idx) => (
            <div key={item.step} className="flex flex-col justify-between gap-5 rounded-2xl border border-slate-200/80 bg-slate-50/90 p-6 text-slate-800">
              <div className="space-y-2.5">
                <div className="font-mono text-sm font-bold text-ink tabular-nums">{`0${idx + 1}`}</div>
                <h3 className="text-lg font-bold tracking-tight text-ink">{item.title}</h3>
                <p className="text-[15px] leading-relaxed text-muted">{item.summary}</p>
              </div>
              <CopyCommandBar command={item.command} copyLabel={t.common.copy} copiedLabel={t.common.copied} manualCopyHint={t.common.copyManualHint} compact />
            </div>
          ))}
        </div>

        <div className="grid gap-4 border-t border-slate-200/85 pt-6 sm:grid-cols-3">
          {copy.prerequisites.items.map((req) => (
            <div key={req.name} className="space-y-1 rounded-2xl border border-slate-200/80 bg-slate-50/90 p-4">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-bold text-ink">{req.name}</span>
                <code className="font-mono text-xs text-accent tabular-nums">{req.version}</code>
              </div>
              <p className="text-xs leading-relaxed text-muted">{req.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
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
  const doctorOutput = findCliCommand('doctor')?.passOutput ?? ''

  return (
    <section aria-labelledby="step-doctor-heading" className="border-b border-slate-200/85 py-14 lg:py-16">
      <div className="grid gap-7 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="hardware-bezel rounded-3xl border border-slate-200/85 bg-slate-100/80 p-2.5 sm:p-3">
          <div className="specular-surface h-full space-y-6 rounded-2xl border border-slate-200/85 bg-white p-7 sm:p-9">
            <div className="space-y-2">
              <p className="font-mono text-xs tracking-wider text-subtle uppercase">
                {locale === 'vi' ? '03 · Kiểm tra với Doctor' : '03 · Verify with Doctor'}
              </p>
              <h2 id="step-doctor-heading" className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">{copy.verification.title}</h2>
              <p className="text-base leading-relaxed text-muted">{copy.verification.subtitle}</p>
            </div>

            <CopyCommandBar command={verifyCommand} copyLabel={t.common.copy} copiedLabel={t.common.copied} manualCopyHint={t.common.copyManualHint} />

            {doctorOutput && (
              <pre className="overflow-x-auto rounded-2xl border border-slate-800 bg-[#0F172A] p-5 font-mono text-xs leading-relaxed text-slate-100 sm:text-[13.5px]">
                <code className="text-slate-100">{doctorOutput}</code>
              </pre>
            )}

            <ul className="space-y-2.5 pt-1 text-[15px] leading-relaxed text-muted sm:text-base">
              {copy.verification.checks.map((check) => (
                <li key={check} className="flex items-start gap-3">
                  <Check aria-hidden="true" className="mt-1 size-4 shrink-0 text-accent" />
                  <span>{check}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="specular-surface flex flex-col justify-between gap-6 rounded-3xl border border-slate-200/85 bg-white p-8 sm:p-10">
          <div className="space-y-5">
            <div className="space-y-2">
              <p className="font-mono text-xs tracking-wider text-subtle uppercase">{`CLI · ${CLI_COMMANDS.length} Commands`}</p>
              <h2 className="text-2xl font-bold tracking-tight text-ink">{copy.globalLink.title}</h2>
              <p className="text-base leading-relaxed text-muted">{copy.globalLink.summary}</p>
            </div>
            <CopyCommandBar command={copy.globalLink.command} copyLabel={t.common.copy} copiedLabel={t.common.copied} manualCopyHint={t.common.copyManualHint} />
          </div>

          <div className="divide-y divide-slate-200/80 rounded-2xl border border-slate-200/80 bg-slate-50/90 px-5 py-2 text-slate-800">
            {compilerQuickList.map((cli) => (
              <div key={cli.id} className="flex items-center justify-between gap-3 py-3 font-mono text-sm">
                <span className="font-semibold text-ink">{`boomopen ${cli.id}`}</span>
                <span className="text-xs text-subtle tabular-nums">{`${cli.gates.length} gates`}</span>
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
    <section aria-labelledby="maintenance-heading" className="pt-10">
      <h2 id="maintenance-heading" className="sr-only">{copy.maintenance.summaryToggle}</h2>
      <details className="specular-surface group rounded-3xl border border-slate-200/85 bg-white">
        <summary className={clsx('flex min-h-12 cursor-pointer list-none items-center justify-between gap-4 rounded-3xl px-7 py-5 text-base font-bold text-ink', FOCUS_RING)}>
          <span>{copy.maintenance.summaryToggle}</span>
          <ChevronDown aria-hidden="true" className="size-5 text-subtle transition-transform duration-150 motion-reduce:transition-none group-open:rotate-180" />
        </summary>
        <div className="space-y-4 border-t border-slate-200/85 px-7 py-6">
          <p className="text-base leading-relaxed text-ink">{copy.maintenance.safetyNotice}</p>
          <p className="text-sm leading-relaxed text-muted">{copy.maintenance.description}</p>
          <CopyCommandBar command={maintenanceCommand} copyLabel={t.common.copy} copiedLabel={t.common.copied} manualCopyHint={t.common.copyManualHint} />
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
      id: p.id, label: p.name, vendor: p.vendor, entryFile: p.entryFile, frameworkPath: p.frameworkPath,
      installCommand: p.installCommand, verifyCommand: p.verifyCommand, maintenanceCommand: p.uninstallCommand,
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
      className="mx-auto min-h-dvh max-w-[90rem] px-4 pb-20 sm:px-6 lg:px-8 lg:pb-24"
    >
      <SEO routeId="install" />
      <InstallHeroHeader />
      <CloneSetupStage />

      <section aria-labelledby="step-ide-heading" className="border-b border-slate-200/85 py-14 lg:py-16">
        <div className="specular-surface space-y-7 rounded-3xl border border-slate-200/85 bg-white p-8 sm:p-10">
          <div className="space-y-2">
            <p className="font-mono text-xs tracking-wider text-subtle uppercase">
              {locale === 'vi' ? '02 · Chọn môi trường IDE' : '02 · Select Target IDE'}
            </p>
            <h2 id="step-ide-heading" className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">{t.platformsSection.title}</h2>
            <p className="max-w-[62ch] text-base leading-relaxed text-muted">{t.platformsSection.subtitle}</p>
          </div>

          {hasUnrecognizedTool && (
            <div role="status" className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/85 bg-slate-50/90 px-5 py-3.5 text-sm text-slate-700">
              <span>{t.platformsSection.unrecognizedToolHint}</span>
              <code className="rounded-lg border border-slate-200/80 bg-white px-2.5 py-1 font-mono text-xs text-slate-800">{`?tool=${rawTool ?? ''}`}</code>
            </div>
          )}

          <div role="tablist" aria-label={t.platformsSection.tabsAriaLabel} className="flex flex-wrap gap-2 rounded-2xl border border-slate-200/90 bg-slate-100/85 p-2">
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
                    'inline-flex min-h-12 items-center rounded-xl px-5 py-2.5 text-base transition-colors duration-150 motion-reduce:transition-none cursor-pointer',
                    FOCUS_RING,
                    isSelected ? 'bg-primary font-semibold text-primary-ink shadow-sm' : 'bg-transparent font-medium text-slate-600 hover:bg-white/80 hover:text-slate-950',
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
            className={clsx('space-y-6 rounded-2xl border border-slate-200/80 bg-slate-50/90 p-6 sm:p-8', FOCUS_RING)}
          >
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <h3 className="text-xl font-bold tracking-tight text-ink sm:text-[22px]">
                {`${t.platformsSection.safeInstallLabel}: ${activeTarget.label}`}
              </h3>
              <span className="font-mono text-xs text-subtle sm:text-sm">{activeTarget.vendor}</span>
            </div>
            <p className="max-w-[65ch] text-base leading-relaxed text-muted">{activeTarget.summary}</p>
            <CopyCommandBar command={activeTarget.installCommand} copyLabel={t.common.copy} copiedLabel={t.common.copied} manualCopyHint={t.common.copyManualHint} />
            <div className="divide-y divide-slate-200/80 rounded-2xl border border-slate-200/85 bg-white">
              <div className="flex flex-col gap-1.5 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-[15px] font-medium text-muted sm:text-base">{t.platformsSection.entryPointLabel}</span>
                <code className="font-mono text-[15px] text-ink sm:text-base">{activeTarget.entryFile}</code>
              </div>
              <div className="flex flex-col gap-1.5 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-[15px] font-medium text-muted sm:text-base">{t.platformsSection.installPathLabel}</span>
                <code className="font-mono text-[15px] text-ink sm:text-base">{activeTarget.frameworkPath}</code>
              </div>
            </div>
          </div>
        </div>
      </section>

      <DoctorAndCliSection verifyCommand={activeTarget.verifyCommand} compilerQuickList={compilerQuickList} />
      <SafeUninstallNote maintenanceCommand={activeTarget.maintenanceCommand} />
    </motion.div>
  )
}
