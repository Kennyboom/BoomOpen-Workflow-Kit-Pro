import { useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { CheckCircle2, ChevronDown, ExternalLink, ShieldAlert, ShieldCheck, Terminal, Wrench } from 'lucide-react'
import { clsx } from 'clsx'
import { SEO } from '../components/seo/SEO'
import { ActionLink, CopyCommandBar, StatusBadge, SurfaceCard } from '../components/ui/Primitives'
import { CLI_COMMANDS } from '../data/cliSuite'
import { KIT_STATS, formatCount } from '../data/kitStats'
import { DOCTOR_VERIFY_COMMAND, INSTALL_ALL_COMMAND, PLATFORMS, REPO_URL } from '../data/platforms'
import { useLanguage } from '../i18n/context'
import type { PlatformId } from '../types/ui-contract'

/**
 * Safe 5-Platform Installer Guide — Obsidian Tungsten & Forge Amber oklch() @theme surfaces.
 * Our mission: SHA-256 manifest-protected installation trusted across 1,462+ indexed skills.
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

export function InstallPage() {
  const { locale, t, pick } = useLanguage()
  const reduceMotion = useReducedMotion()
  const [selectedId, setSelectedId] = useState<InstallTargetId>('antigravity')
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([])
  const copy = t.installPage

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
    <div className="min-h-dvh bg-canvas text-ink">
      <SEO routeId="install" />

      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
        className="mx-auto max-w-7xl space-y-14 px-4 py-12 sm:px-6 lg:px-8 lg:py-16"
      >
        <header className="space-y-7 border-b border-hairline pb-10">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <StatusBadge tone="amber">
              <ShieldCheck aria-hidden="true" className="size-3.5" />
              <span className="uppercase tracking-wider">{copy.eyebrow}</span>
            </StatusBadge>
            <StatusBadge tone="emerald">
              v{KIT_STATS.version} · {KIT_STATS.platforms} IDEs · {formatCount(KIT_STATS.skills)} Skills
            </StatusBadge>
          </div>

          <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
            <div className="space-y-4 lg:col-span-8">
              <h1 className="font-display text-[clamp(2rem,2.6vw+1.25rem,3.25rem)] leading-tight font-semibold tracking-tight text-ink">
                {copy.title}
              </h1>
              <p className="max-w-prose text-[clamp(1rem,0.25vw+0.94rem,1.125rem)] leading-relaxed font-normal text-muted">
                {copy.subtitle}
              </p>
            </div>
            <div className="flex flex-wrap gap-3 lg:col-span-4 lg:justify-end">
              <ActionLink to={REPO_URL} external variant="primary" trailingIcon={<ExternalLink aria-hidden="true" className="size-4" />}>
                {t.nav.githubLabel}
              </ActionLink>
              <ActionLink to="/architecture" variant="secondary">
                {t.nav.architecture}
              </ActionLink>
            </div>
          </div>

          <div role="note" className="flex items-start gap-3 rounded-2xl border border-primary/35 bg-primary/10 p-4 sm:p-5">
            <ShieldAlert aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-primary" />
            <p className="max-w-prose text-[clamp(0.875rem,0.14vw+0.84rem,0.95rem)] leading-relaxed font-normal text-ink">
              {copy.gitOnlyNotice}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {copy.prerequisites.items.map((req) => (
              <SurfaceCard key={req.name} variant="subtle" className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-display text-[clamp(0.95rem,0.18vw+0.9rem,1.05rem)] leading-snug font-semibold text-ink">
                    {req.name}
                  </span>
                  <StatusBadge tone="neutral">{req.version}</StatusBadge>
                </div>
                <p className="max-w-prose text-[clamp(0.825rem,0.1vw+0.8rem,0.9rem)] leading-relaxed font-normal text-muted">
                  {req.detail}
                </p>
              </SurfaceCard>
            ))}
          </div>
        </header>

        <section aria-labelledby="platform-install-heading" className="space-y-6">
          <div className="space-y-2">
            <h2 id="platform-install-heading" className="font-display text-[clamp(1.45rem,1.2vw+1.1rem,2rem)] leading-tight font-semibold tracking-tight text-ink">
              {copy.steps.title}
            </h2>
            <p className="max-w-prose text-[clamp(0.9rem,0.14vw+0.86rem,0.975rem)] leading-relaxed font-normal text-muted">
              {t.platformsSection.safetyGuarantee}
            </p>
          </div>

          <div role="tablist" aria-label={t.platformsSection.tabsAriaLabel} className="flex flex-wrap gap-2 rounded-2xl border border-hairline bg-card p-2">
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
                    'inline-flex min-h-11 items-center gap-2 rounded-[10px] border px-4 py-2.5 text-[clamp(0.85rem,0.12vw+0.82rem,0.925rem)] leading-snug transition-colors duration-150 motion-reduce:transition-none cursor-pointer',
                    FOCUS_RING,
                    isSelected
                      ? 'border-primary bg-primary text-primary-ink font-semibold'
                      : 'border-transparent bg-transparent text-muted hover:border-hairline hover:bg-elevated hover:text-ink font-normal',
                  )}
                >
                  <span>{target.label}</span>
                </button>
              )
            })}
          </div>

          <div
            id={`install-panel-${activeTarget.id}`}
            role="tabpanel"
            aria-labelledby={`install-tab-${activeTarget.id}`}
            tabIndex={0}
            className={clsx('space-y-6 rounded-2xl', FOCUS_RING)}
          >
            <SurfaceCard variant="elevated" className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <StatusBadge tone="amber">STEP 01</StatusBadge>
                  <h3 className="font-display text-[clamp(1.1rem,0.35vw+1rem,1.3rem)] leading-tight font-semibold text-ink">
                    {t.platformsSection.safeInstallLabel} — {activeTarget.label}
                  </h3>
                </div>
                <StatusBadge tone="neutral" mono={false}>{activeTarget.vendor}</StatusBadge>
              </div>
              <p className="max-w-prose text-[clamp(0.875rem,0.12vw+0.84rem,0.95rem)] leading-relaxed font-normal text-muted">
                {activeTarget.summary}
              </p>
              <CopyCommandBar
                command={activeTarget.installCommand}
                label={`${t.platformsSection.safeInstallLabel} (${activeTarget.id})`}
                copyLabel={t.common.copy}
                copiedLabel={t.common.copied}
                manualCopyHint={t.common.copyManualHint}
              />
            </SurfaceCard>

            <SurfaceCard variant="default" className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <StatusBadge tone="emerald">STEP 02</StatusBadge>
                  <h3 className="font-display text-[clamp(1.1rem,0.35vw+1rem,1.3rem)] leading-tight font-semibold text-ink">
                    {copy.verification.title}
                  </h3>
                </div>
                <StatusBadge tone="emerald">{copy.verification.badge}</StatusBadge>
              </div>

              <CopyCommandBar
                command={activeTarget.verifyCommand}
                label={t.platformsSection.verifyDoctorLabel}
                copyLabel={t.common.copy}
                copiedLabel={t.common.copied}
                manualCopyHint={t.common.copyManualHint}
                compact
              />

              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-xl border border-hairline bg-canvas p-4 space-y-1">
                  <div className="font-mono text-[clamp(0.72rem,0.08vw+0.7rem,0.78rem)] leading-tight uppercase tracking-wider text-subtle">
                    {t.platformsSection.entryPointLabel}
                  </div>
                  <code className="block font-mono text-[clamp(0.825rem,0.1vw+0.8rem,0.9rem)] leading-relaxed text-primary">
                    {activeTarget.entryFile}
                  </code>
                </div>
                <div className="rounded-xl border border-hairline bg-canvas p-4 space-y-1">
                  <div className="font-mono text-[clamp(0.72rem,0.08vw+0.7rem,0.78rem)] leading-tight uppercase tracking-wider text-subtle">
                    {t.platformsSection.installPathLabel}
                  </div>
                  <code className="block font-mono text-[clamp(0.825rem,0.1vw+0.8rem,0.9rem)] leading-relaxed text-accent">
                    {activeTarget.frameworkPath}
                  </code>
                </div>
              </div>

              <ul className="grid gap-2 sm:grid-cols-2 text-[clamp(0.85rem,0.12vw+0.82rem,0.925rem)] leading-relaxed text-muted">
                {copy.verification.checks.map((check) => (
                  <li key={check} className="flex max-w-prose items-start gap-2">
                    <CheckCircle2 aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-accent" />
                    <span>{check}</span>
                  </li>
                ))}
              </ul>
            </SurfaceCard>

            <SurfaceCard variant="default" className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <StatusBadge tone="cobalt">STEP 03</StatusBadge>
                  <h3 className="font-display text-[clamp(1.1rem,0.35vw+1rem,1.3rem)] leading-tight font-semibold text-ink">{copy.globalLink.title}</h3>
                </div>
                <StatusBadge tone="cobalt">
                  <Terminal aria-hidden="true" className="size-3.5" />
                  <span>{CLI_COMMANDS.length} CLI Gates</span>
                </StatusBadge>
              </div>
              <p className="max-w-prose text-[clamp(0.875rem,0.12vw+0.84rem,0.95rem)] leading-relaxed font-normal text-muted">{copy.globalLink.summary}</p>
              <CopyCommandBar command={copy.globalLink.command} copyLabel={t.common.copy} copiedLabel={t.common.copied} manualCopyHint={t.common.copyManualHint} compact />
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {compilerQuickList.map((cli) => (
                  <div key={cli.id} className="rounded-xl border border-hairline bg-canvas p-3.5 space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-[clamp(0.825rem,0.1vw+0.8rem,0.9rem)] leading-tight font-semibold text-primary">boomopen {cli.id}</span>
                      <span className="font-mono text-[clamp(0.7rem,0.08vw+0.68rem,0.75rem)] leading-none text-subtle tabular-nums">{cli.gates.length} gates</span>
                    </div>
                    <code className="block truncate font-mono text-[clamp(0.72rem,0.08vw+0.7rem,0.78rem)] leading-relaxed text-ink">{cli.invocation}</code>
                  </div>
                ))}
              </div>
            </SurfaceCard>
          </div>
        </section>

        <section aria-labelledby="maintenance-heading" className="border-t border-hairline pt-8">
          <h2 id="maintenance-heading" className="sr-only">{copy.maintenance.summaryToggle}</h2>
          <details className="group rounded-2xl border border-hairline bg-card specular-surface">
            <summary className={clsx('flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 rounded-2xl px-5 py-4 font-display text-[clamp(0.975rem,0.2vw+0.92rem,1.1rem)] leading-snug font-semibold text-ink', FOCUS_RING)}>
              <span className="flex items-center gap-2.5">
                <Wrench aria-hidden="true" className="size-4 text-muted" />
                <span>{copy.maintenance.summaryToggle}</span>
              </span>
              <span className="flex items-center gap-2">
                <StatusBadge tone="neutral">{copy.maintenance.badge}</StatusBadge>
                <ChevronDown aria-hidden="true" className="size-4 text-muted transition-transform duration-150 motion-reduce:transition-none group-open:rotate-180" />
              </span>
            </summary>
            <div className="space-y-4 border-t border-hairline px-5 py-5">
              <p className="max-w-prose text-[clamp(0.875rem,0.12vw+0.84rem,0.95rem)] leading-relaxed font-normal text-accent">{copy.maintenance.safetyNotice}</p>
              <p className="max-w-prose text-[clamp(0.85rem,0.12vw+0.82rem,0.925rem)] leading-relaxed font-normal text-muted">{copy.maintenance.description}</p>
              <CopyCommandBar command={activeTarget.maintenanceCommand} label={`${copy.maintenance.commandHeading} (${activeTarget.label})`} copyLabel={t.common.copy} copiedLabel={t.common.copied} manualCopyHint={t.common.copyManualHint} compact />
            </div>
          </details>
        </section>
      </motion.div>
    </div>
  )
}
