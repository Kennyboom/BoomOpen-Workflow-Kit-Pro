import { useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, BookOpen, Check, CheckCircle2, Copy, FolderGit2, Lock, Moon, ShieldCheck, Sliders } from 'lucide-react'
import { clsx } from 'clsx'
import { SEO } from '../components/seo/SEO'
import { ActionLink, CopyCommandBar, StatusBadge, SurfaceCard } from '../components/ui/Primitives'
import { KIT_STATS, formatCount } from '../data/kitStats'
import { useCopyCommand } from '../hooks/useCopyCommand'
import { useLanguage } from '../i18n/context'

/**
 * Smart-Hybrid v5.5 System Architecture — Obsidian Tungsten & Forge Amber oklch() @theme surfaces.
 * Our mission: deterministic contract-first engineering trusted across 5+ AI IDE runtimes.
 */
const FOCUS_RING =
  'outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-canvas'

export function ArchitecturePage() {
  const { locale, t } = useLanguage()
  const reduceMotion = useReducedMotion()
  const [selectedPresetIdx, setSelectedPresetIdx] = useState(0)
  const { copied: promptCopied, copyFailed: promptCopyFailed, copy: copyPrompt } = useCopyCommand()
  const promptRef = useRef<HTMLElement | null>(null)

  const copy = t.architecturePage
  const activePreset = copy.controlCenter.presets[selectedPresetIdx] ?? copy.controlCenter.presets[0]
  const overnight = copy.specRatchet.overnightPlaybook

  const handleCopyPrompt = async () => {
    const ok = await copyPrompt(overnight.prompt)
    if (!ok && promptRef.current && typeof window !== 'undefined') {
      const selection = window.getSelection()
      if (selection) {
        const range = document.createRange()
        range.selectNodeContents(promptRef.current)
        selection.removeAllRanges()
        selection.addRange(range)
      }
    }
  }

  return (
    <div className="min-h-dvh bg-canvas text-ink">
      <SEO routeId="architecture" />

      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
        className="mx-auto max-w-7xl space-y-16 px-4 py-12 sm:px-6 lg:px-8 lg:py-16"
      >
        <header className="space-y-8 border-b border-hairline pb-10">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <StatusBadge tone="amber">
              <ShieldCheck aria-hidden="true" className="size-3.5" />
              <span className="uppercase tracking-wider">{copy.eyebrow}</span>
            </StatusBadge>
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge tone="emerald">&lt; 10ms AOT Sync</StatusBadge>
              <StatusBadge tone="cobalt">{formatCount(KIT_STATS.skills)} Indexed Skills</StatusBadge>
              <StatusBadge tone="neutral">&lt;= 300L Entrypoints</StatusBadge>
            </div>
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
              <ActionLink to="/install" variant="primary" trailingIcon={<ArrowRight aria-hidden="true" className="size-4" />}>
                {t.nav.install}
              </ActionLink>
              <ActionLink to="/agents" variant="secondary">
                {t.nav.agents}
              </ActionLink>
            </div>
          </div>
        </header>

        <section aria-labelledby="core-rules-heading" className="space-y-6">
          <div className="space-y-2">
            <StatusBadge tone="cobalt">
              <BookOpen aria-hidden="true" className="size-3.5" />
              <span className="uppercase tracking-wider">{copy.coreRules.badge}</span>
            </StatusBadge>
            <h2 id="core-rules-heading" className="font-display text-[clamp(1.45rem,1.2vw+1.1rem,2rem)] leading-tight font-semibold tracking-tight text-ink">
              {copy.coreRules.title}
            </h2>
            <p className="max-w-prose text-[clamp(0.925rem,0.15vw+0.88rem,1rem)] leading-relaxed font-normal text-muted">
              {copy.coreRules.subtitle}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {copy.coreRules.items.map((rule, index) => (
              <SurfaceCard
                key={rule.file}
                variant={index === 0 ? 'elevated' : 'default'}
                as="article"
                className={clsx('space-y-3', index === 0 && 'sm:col-span-2')}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-[clamp(0.75rem,0.1vw+0.72rem,0.8125rem)] leading-none font-semibold text-primary tabular-nums">
                    0{index + 1} · &lt;= 300L
                  </span>
                  <StatusBadge tone="neutral">{rule.trigger}</StatusBadge>
                </div>
                <h3 className="font-mono text-[clamp(1rem,0.25vw+0.94rem,1.15rem)] leading-tight font-semibold text-ink">
                  rules/{rule.file}
                </h3>
                <p className="max-w-prose text-[clamp(0.875rem,0.12vw+0.84rem,0.95rem)] leading-relaxed font-normal text-muted">
                  {rule.summary}
                </p>
              </SurfaceCard>
            ))}
          </div>
        </section>

        <section aria-labelledby="control-center-heading" className="space-y-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="space-y-2">
              <StatusBadge tone="amber">
                <Sliders aria-hidden="true" className="size-3.5" />
                <span className="uppercase tracking-wider">{copy.controlCenter.badge}</span>
              </StatusBadge>
              <h2 id="control-center-heading" className="font-display text-[clamp(1.45rem,1.2vw+1.1rem,2rem)] leading-tight font-semibold tracking-tight text-ink">
                {copy.controlCenter.title}
              </h2>
              <p className="max-w-prose text-[clamp(0.925rem,0.15vw+0.88rem,1rem)] leading-relaxed font-normal text-muted">
                {copy.controlCenter.subtitle}
              </p>
            </div>
            <StatusBadge tone="emerald">npm run settings:ui · {copy.controlCenter.webUiUrl}</StatusBadge>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {copy.controlCenter.surfaces.map((surface) => (
              <SurfaceCard key={surface.title} variant="default" as="article" className="flex flex-col justify-between gap-5">
                <div className="space-y-2.5">
                  <h3 className="font-display text-[clamp(1.05rem,0.28vw+0.98rem,1.2rem)] leading-tight font-semibold text-ink">{surface.title}</h3>
                  <p className="max-w-prose text-[clamp(0.875rem,0.12vw+0.84rem,0.95rem)] leading-relaxed font-normal text-muted">{surface.summary}</p>
                </div>
                <CopyCommandBar command={surface.command} copyLabel={t.common.copy} copiedLabel={t.common.copied} manualCopyHint={t.common.copyManualHint} compact />
              </SurfaceCard>
            ))}
          </div>

          <SurfaceCard variant="elevated" className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="font-display text-[clamp(1.1rem,0.35vw+1rem,1.3rem)] leading-tight font-semibold text-ink">
                {locale === 'vi'
                  ? '5 Chế Độ Cấu Hình Định Sẵn (Đồng Bộ < 10ms Sang 5 IDE)'
                  : '5 Built-In Execution Presets (< 10ms AOT Sync Across 5 IDEs)'}
              </h3>
              <StatusBadge tone="amber">{activePreset.lineBudget}</StatusBadge>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {copy.controlCenter.presets.map((preset, idx) => {
                const isSelected = idx === selectedPresetIdx
                return (
                  <button
                    key={preset.name}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => setSelectedPresetIdx(idx)}
                    className={clsx(
                      'flex min-h-11 flex-col justify-between gap-2.5 rounded-xl border p-4 text-left transition-colors duration-150 motion-reduce:transition-none cursor-pointer',
                      FOCUS_RING,
                      isSelected ? 'border-primary bg-canvas text-ink' : 'border-hairline bg-card text-muted hover:border-line-strong hover:text-ink',
                    )}
                  >
                    <div className="flex w-full items-center justify-between gap-2">
                      <span className="font-mono text-[clamp(0.85rem,0.12vw+0.82rem,0.925rem)] leading-tight font-semibold text-primary">{preset.name}</span>
                      <span className="font-mono text-[clamp(0.7rem,0.08vw+0.68rem,0.75rem)] leading-none text-subtle tabular-nums">{preset.lineBudget}</span>
                    </div>
                    <div className="font-mono text-[clamp(0.72rem,0.08vw+0.7rem,0.78rem)] leading-snug text-accent">{preset.mode}</div>
                    <p className="max-w-prose text-[clamp(0.8rem,0.1vw+0.78rem,0.875rem)] leading-relaxed font-normal text-muted">{preset.summary}</p>
                  </button>
                )
              })}
            </div>

            <CopyCommandBar
              command={`boomopen settings preset ${activePreset.name}`}
              label={locale === 'vi' ? `Áp dụng ngay cấu hình ${activePreset.name} cho cả 5 nền tảng` : `Apply ${activePreset.name} preset across all ${KIT_STATS.platforms} platforms`}
              copyLabel={t.common.copy}
              copiedLabel={t.common.copied}
              manualCopyHint={t.common.copyManualHint}
              compact
            />
          </SurfaceCard>
        </section>

        <section aria-labelledby="standards-ratchet-heading" className="grid gap-6 lg:grid-cols-12">
          <SurfaceCard variant="default" className="space-y-5 lg:col-span-7">
            <div className="space-y-2">
              <StatusBadge tone="emerald">
                <CheckCircle2 aria-hidden="true" className="size-3.5" />
                <span className="uppercase tracking-wider">{copy.codingStandards.badge}</span>
              </StatusBadge>
              <h2 id="standards-ratchet-heading" className="font-display text-[clamp(1.35rem,1vw+1.05rem,1.8rem)] leading-tight font-semibold tracking-tight text-ink">
                {copy.codingStandards.title}
              </h2>
              <p className="max-w-prose text-[clamp(0.875rem,0.12vw+0.84rem,0.95rem)] leading-relaxed font-normal text-muted">
                {copy.codingStandards.subtitle}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-hairline bg-canvas p-4">
                <div className="font-mono text-[clamp(1.5rem,1vw+1.2rem,2rem)] leading-tight font-semibold text-primary tabular-nums">
                  {copy.codingStandards.softLines}L
                </div>
                <div className="text-[clamp(0.8rem,0.1vw+0.78rem,0.875rem)] leading-relaxed text-muted">
                  {locale === 'vi' ? 'Trần mềm linh hoạt cho module gắn kết' : 'Soft target ceiling for cohesive modules'}
                </div>
              </div>
              <div className="rounded-xl border border-hairline bg-canvas p-4">
                <div className="font-mono text-[clamp(1.5rem,1vw+1.2rem,2rem)] leading-tight font-semibold text-accent tabular-nums">
                  {copy.codingStandards.hardLines}L
                </div>
                <div className="text-[clamp(0.8rem,0.1vw+0.78rem,0.875rem)] leading-relaxed text-muted">
                  {locale === 'vi' ? 'Ngưỡng tách file bắt buộc (trừ Test/Types/Docs)' : 'Hard split gate (Test/Schema/Docs exempt)'}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-display text-[clamp(1rem,0.22vw+0.95rem,1.125rem)] leading-tight font-semibold text-ink">
                  {copy.codingStandards.tier1Title}
                </h3>
                <ul className="space-y-1.5 text-[clamp(0.85rem,0.12vw+0.82rem,0.925rem)] leading-relaxed text-muted">
                  {copy.codingStandards.tier1Items.map((item) => (
                    <li key={item} className="flex max-w-prose items-start gap-2">
                      <span aria-hidden="true" className="mt-1.5 inline-block size-1.5 shrink-0 rounded-full bg-primary" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="space-y-2 border-t border-hairline pt-4">
                <h3 className="font-display text-[clamp(1rem,0.22vw+0.95rem,1.125rem)] leading-tight font-semibold text-ink">
                  {copy.codingStandards.tier2Title}
                </h3>
                <ul className="space-y-1.5 text-[clamp(0.85rem,0.12vw+0.82rem,0.925rem)] leading-relaxed text-muted">
                  {copy.codingStandards.tier2Items.map((item) => (
                    <li key={item} className="flex max-w-prose items-start gap-2">
                      <span aria-hidden="true" className="mt-1.5 inline-block size-1.5 shrink-0 rounded-full bg-accent" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </SurfaceCard>

          <SurfaceCard variant="elevated" className="flex flex-col justify-between gap-5 lg:col-span-5">
            <div className="space-y-4">
              <StatusBadge tone="cobalt">
                <Lock aria-hidden="true" className="size-3.5" />
                <span className="uppercase tracking-wider">{copy.specRatchet.badge}</span>
              </StatusBadge>
              <h3 className="font-display text-[clamp(1.25rem,0.8vw+1rem,1.6rem)] leading-tight font-semibold tracking-tight text-ink">
                {copy.specRatchet.title}
              </h3>
              <p className="max-w-prose text-[clamp(0.875rem,0.12vw+0.84rem,0.95rem)] leading-relaxed font-normal text-muted">
                {copy.specRatchet.subtitle}
              </p>

              <div className="space-y-3 pt-1">
                {copy.specRatchet.guarantees.map((item) => (
                  <div key={item.title} className="rounded-xl border border-hairline bg-canvas p-3.5 space-y-1">
                    <div className="font-display text-[clamp(0.925rem,0.15vw+0.88rem,1rem)] leading-snug font-semibold text-ink">
                      {item.title}
                    </div>
                    <p className="max-w-prose text-[clamp(0.825rem,0.1vw+0.8rem,0.9rem)] leading-relaxed font-normal text-muted">
                      {item.summary}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <CopyCommandBar command={copy.specRatchet.auditCommand} label={copy.specRatchet.ledgerFile} copyLabel={t.common.copy} copiedLabel={t.common.copied} manualCopyHint={t.common.copyManualHint} compact />
          </SurfaceCard>

          <SurfaceCard variant="elevated" className="space-y-5 lg:col-span-12">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-2">
                <StatusBadge tone="amber">
                  <Moon aria-hidden="true" className="size-3.5" />
                  <span className="uppercase tracking-wider">{overnight.badge}</span>
                </StatusBadge>
                <h3 className="font-display text-[clamp(1.2rem,0.6vw+1rem,1.5rem)] leading-tight font-semibold tracking-tight text-ink">{overnight.title}</h3>
                <p className="max-w-prose text-[clamp(0.875rem,0.12vw+0.84rem,0.95rem)] leading-relaxed font-normal text-muted">{overnight.subtitle}</p>
              </div>
              <button
                type="button"
                aria-label={`${t.common.copy}: ${overnight.promptLabel}`}
                onClick={() => { void handleCopyPrompt() }}
                className={clsx(
                  'inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-[10px] border px-3.5 py-2 font-mono text-[clamp(0.75rem,0.1vw+0.73rem,0.8125rem)] leading-none font-semibold transition-colors duration-150 motion-reduce:transition-none cursor-pointer',
                  FOCUS_RING,
                  promptCopied ? 'border-accent/50 bg-accent/15 text-accent' : 'border-line-strong bg-canvas text-ink hover:border-primary/60',
                )}
              >
                {promptCopied ? <Check aria-hidden="true" className="size-4 text-accent" /> : <Copy aria-hidden="true" className="size-4 text-primary" />}
                <span>{promptCopied ? t.common.copied : t.common.copy}</span>
              </button>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              {overnight.modes.map((row) => (
                <div key={row.workflow} className="rounded-xl border border-hairline bg-canvas p-4 space-y-1.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <code className="font-mono text-[clamp(0.82rem,0.12vw+0.79rem,0.9rem)] font-semibold text-primary">{row.workflow}</code>
                    <StatusBadge tone="neutral" mono={false}>{row.scope}</StatusBadge>
                  </div>
                  <p className="max-w-prose text-[clamp(0.825rem,0.1vw+0.8rem,0.9rem)] leading-relaxed font-normal text-muted">{row.behavior}</p>
                </div>
              ))}
            </div>

            <div className="rounded-xl border border-hairline bg-canvas p-4 space-y-2">
              <div className="font-mono text-[clamp(0.72rem,0.1vw+0.7rem,0.78rem)] font-semibold uppercase tracking-wider text-subtle">{overnight.promptLabel}</div>
              <code ref={promptRef} className="block whitespace-pre-wrap font-mono text-[clamp(0.8rem,0.1vw+0.77rem,0.875rem)] leading-relaxed text-ink">{overnight.prompt}</code>
              <div aria-live="polite" className="sr-only">{promptCopied ? t.common.copied : promptCopyFailed ? t.common.copyManualHint : ''}</div>
              {promptCopyFailed && <p className="text-[clamp(0.75rem,0.1vw+0.73rem,0.8125rem)] text-warning">{t.common.copyManualHint}</p>}
            </div>
          </SurfaceCard>
        </section>

        <section aria-labelledby="artifact-routing-heading" className="space-y-6">
          <div className="space-y-2">
            <StatusBadge tone="emerald">
              <FolderGit2 aria-hidden="true" className="size-3.5" />
              <span className="uppercase tracking-wider">{copy.artifactRouting.badge}</span>
            </StatusBadge>
            <h2 id="artifact-routing-heading" className="font-display text-[clamp(1.45rem,1.2vw+1.1rem,2rem)] leading-tight font-semibold tracking-tight text-ink">{copy.artifactRouting.title}</h2>
            <p className="max-w-prose text-[clamp(0.925rem,0.15vw+0.88rem,1rem)] leading-relaxed font-normal text-muted">{copy.artifactRouting.subtitle}</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <SurfaceCard variant="elevated" as="article" className="space-y-3">
              <StatusBadge tone="amber">DEFAULT · ZERO GIT NOISE</StatusBadge>
              <h3 className="font-display text-[clamp(1.1rem,0.35vw+1rem,1.3rem)] leading-tight font-semibold text-ink">{copy.artifactRouting.brainCard.title}</h3>
              <code className="block rounded-lg border border-hairline bg-canvas px-3 py-2 font-mono text-[clamp(0.78rem,0.1vw+0.75rem,0.85rem)] leading-relaxed text-primary">{copy.artifactRouting.brainCard.pathPattern}</code>
              <p className="max-w-prose text-[clamp(0.875rem,0.12vw+0.84rem,0.95rem)] leading-relaxed font-normal text-muted">{copy.artifactRouting.brainCard.summary}</p>
            </SurfaceCard>

            <SurfaceCard variant="default" as="article" className="space-y-3">
              <StatusBadge tone="cobalt">EXPLICIT · /docs WORKFLOWS</StatusBadge>
              <h3 className="font-display text-[clamp(1.1rem,0.35vw+1rem,1.3rem)] leading-tight font-semibold text-ink">{copy.artifactRouting.workspaceCard.title}</h3>
              <code className="block rounded-lg border border-hairline bg-canvas px-3 py-2 font-mono text-[clamp(0.78rem,0.1vw+0.75rem,0.85rem)] leading-relaxed text-accent">{copy.artifactRouting.workspaceCard.pathPattern}</code>
              <p className="max-w-prose text-[clamp(0.875rem,0.12vw+0.84rem,0.95rem)] leading-relaxed font-normal text-muted">{copy.artifactRouting.workspaceCard.summary}</p>
            </SurfaceCard>
          </div>
        </section>
      </motion.div>
    </div>
  )
}
