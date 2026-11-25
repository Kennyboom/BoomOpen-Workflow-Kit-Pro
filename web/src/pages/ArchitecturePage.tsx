import { useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { clsx } from 'clsx'
import { SEO } from '../components/seo/SEO'
import { ActionLink, CopyCommandBar } from '../components/ui/Primitives'
import { useLanguage } from '../i18n/context'

/**
 * Flagship 1440px architecture reference covering the 7 lazy-loaded rule modules,
 * wide preset cards, SHA-256 project ledger, 2-tier coding gates, and overnight playbook.
 */
const FOCUS_RING =
  'outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-canvas'

function ArchitectureHeroHeader() {
  const { locale, t } = useLanguage()
  const copy = t.architecturePage
  const stats = [
    { value: '21L', label: locale === 'vi' ? 'Tệp đầu vào' : '< 2.3 KB Entry' },
    { value: String(copy.coreRules.items.length), label: locale === 'vi' ? 'Module quy tắc' : 'Rule Modules' },
    { value: String(copy.controlCenter.presets.length), label: locale === 'vi' ? 'Preset đồng bộ' : 'Sync Presets' },
  ]

  return (
    <header className="border-b border-white/[0.09] pt-10 pb-12 sm:pt-14 sm:pb-16">
      <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/[0.12] bg-white/[0.04] px-3.5 py-1 font-mono text-xs tracking-wider text-muted uppercase">
            <span aria-hidden="true" className="size-1.5 rounded-full bg-accent" />
            <span>{copy.eyebrow}</span>
          </div>
          <h1 className="hero-display-gradient text-[clamp(2.5rem,4.4vw,4rem)] leading-[1.06] font-bold tracking-[-0.036em] text-ink">
            {copy.title}
          </h1>
          <p className="mt-4 max-w-[58ch] text-lg leading-relaxed text-muted sm:text-xl">{copy.subtitle}</p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <ActionLink to="/install" variant="primary" trailingIcon={<ArrowRight aria-hidden="true" className="size-4" />}>
              {t.nav.install}
            </ActionLink>
            <ActionLink to="/agents" variant="secondary">{t.nav.agents}</ActionLink>
          </div>
        </div>

        <dl className="specular-surface grid grid-cols-3 gap-6 rounded-2xl border border-white/[0.10] bg-white/[0.025] px-6 py-5 sm:gap-8">
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

function CoreRulesSection() {
  const { t } = useLanguage()
  const { coreRules } = t.architecturePage

  return (
    <section aria-labelledby="core-rules-heading" className="space-y-8 border-b border-white/[0.09] py-16 lg:py-20">
      <div className="space-y-2.5">
        <p className="font-mono text-xs tracking-wider text-subtle uppercase">{coreRules.badge}</p>
        <h2 id="core-rules-heading" className="text-[clamp(2rem,3vw,2.75rem)] leading-[1.08] font-bold tracking-[-0.032em] text-ink">
          {coreRules.title}
        </h2>
        <p className="max-w-[62ch] text-base leading-relaxed text-muted sm:text-lg">{coreRules.subtitle}</p>
      </div>

      <div className="specular-surface divide-y divide-white/[0.08] rounded-3xl border border-white/[0.09] bg-card">
        {coreRules.items.map((rule, index) => (
          <div key={rule.file} className="flex flex-col gap-3 px-7 py-5 sm:px-8 sm:py-6 lg:flex-row lg:items-center lg:justify-between lg:gap-8">
            <div className="flex flex-col gap-2 lg:flex-row lg:items-baseline lg:gap-6">
              <div className="flex shrink-0 items-center gap-3">
                <span className="font-mono text-xs font-semibold text-subtle tabular-nums">{`0${index + 1}`}</span>
                <code className="font-mono text-base font-bold text-ink sm:text-[17px]">{`rules/${rule.file}`}</code>
              </div>
              <p className="text-[15.5px] leading-relaxed text-muted sm:text-base">{rule.summary}</p>
            </div>
            <span className="shrink-0 self-start rounded-lg border border-white/[0.12] bg-[#090B10] px-3.5 py-1.5 font-mono text-xs text-ink/90 lg:self-center">
              {rule.trigger}
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}

function PresetsControlSection({
  selectedPresetIdx,
  onSelectPreset,
}: {
  readonly selectedPresetIdx: number
  readonly onSelectPreset: (idx: number) => void
}) {
  const { locale, t } = useLanguage()
  const { controlCenter } = t.architecturePage
  const activePreset = controlCenter.presets[selectedPresetIdx] ?? controlCenter.presets[0]

  return (
    <section aria-labelledby="control-center-heading" className="space-y-8 border-b border-white/[0.09] py-16 lg:py-20">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-2.5">
          <p className="font-mono text-xs tracking-wider text-subtle uppercase">{controlCenter.badge}</p>
          <h2 id="control-center-heading" className="text-[clamp(2rem,3vw,2.75rem)] leading-[1.08] font-bold tracking-[-0.032em] text-ink">
            {controlCenter.title}
          </h2>
          <p className="max-w-[62ch] text-base leading-relaxed text-muted sm:text-lg">{controlCenter.subtitle}</p>
        </div>
        <code className="rounded-xl border border-white/[0.12] bg-[#090B10] px-4 py-2 font-mono text-sm text-ink/90 tabular-nums">
          {controlCenter.webUiUrl}
        </code>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {controlCenter.presets.map((preset, idx) => {
          const isSelected = idx === selectedPresetIdx
          const isDefault = preset.name === 'frontier-guardrails'
          return (
            <button
              key={preset.name}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onSelectPreset(idx)}
              className={clsx(
                'specular-surface flex min-h-11 flex-col justify-between gap-5 rounded-3xl border p-7 text-left transition-colors duration-150 motion-reduce:transition-none cursor-pointer sm:p-8',
                FOCUS_RING,
                isSelected ? 'border-white/[0.30] bg-elevated text-ink' : 'border-white/[0.09] bg-card text-muted hover:border-white/[0.20] hover:text-ink',
              )}
            >
              <div className="space-y-3.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <code className="font-mono text-lg font-bold text-ink sm:text-xl">{preset.name}</code>
                  {isDefault ? (
                    <span className="rounded-full bg-primary px-3 py-1 font-mono text-xs font-semibold text-primary-ink">
                      {locale === 'vi' ? 'Mặc định' : 'Default'}
                    </span>
                  ) : (
                    <span className="rounded-full border border-white/[0.10] bg-white/[0.04] px-3 py-1 font-mono text-xs text-subtle tabular-nums">
                      {preset.lineBudget}
                    </span>
                  )}
                </div>
                <code className="inline-block max-w-full truncate rounded-lg border border-white/[0.09] bg-[#090B10] px-3 py-1.5 font-mono text-xs text-ink/90">
                  {preset.mode}
                </code>
                <p className="text-[15.5px] leading-relaxed text-muted sm:text-base">{preset.summary}</p>
              </div>
            </button>
          )
        })}
      </div>

      <CopyCommandBar
        command={`boomopen settings preset ${activePreset.name}`}
        copyLabel={t.common.copy}
        copiedLabel={t.common.copied}
        manualCopyHint={t.common.copyManualHint}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {controlCenter.surfaces.map((surface) => (
          <div key={surface.title} className="specular-surface flex flex-col justify-between gap-5 rounded-3xl border border-white/[0.09] bg-card p-7 sm:p-8">
            <div className="space-y-2">
              <h3 className="text-lg font-bold tracking-tight text-ink">{surface.title}</h3>
              <p className="text-[15.5px] leading-relaxed text-muted">{surface.summary}</p>
            </div>
            <code className="block truncate rounded-xl border border-white/[0.10] bg-[#090B10] px-3.5 py-2.5 font-mono text-xs text-ink sm:text-[13px]">
              {surface.command}
            </code>
          </div>
        ))}
      </div>
    </section>
  )
}

function StandardsAndLedgerSection() {
  const { locale, t } = useLanguage()
  const { codingStandards, specRatchet, artifactRouting } = t.architecturePage

  return (
    <section aria-labelledby="standards-ratchet-heading" className="space-y-7 border-b border-white/[0.09] py-16 lg:py-20">
      <div className="grid gap-7 lg:grid-cols-2">
        <div className="specular-surface space-y-6 rounded-3xl border border-white/[0.09] bg-card p-8 sm:p-10">
          <div className="space-y-2">
            <p className="font-mono text-xs tracking-wider text-subtle uppercase">{codingStandards.badge}</p>
            <h2 id="standards-ratchet-heading" className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">{codingStandards.title}</h2>
            <p className="text-base leading-relaxed text-muted">{codingStandards.subtitle}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-2xl border border-white/[0.09] bg-[#090B10]/80 p-5">
              <div className="font-mono text-3xl font-bold text-ink tabular-nums sm:text-4xl">{`${codingStandards.softLines}L`}</div>
              <div className="mt-1 text-xs font-medium text-muted">{locale === 'vi' ? 'Trần mềm cho module gắn kết' : 'Soft ceiling per module'}</div>
            </div>
            <div className="rounded-2xl border border-white/[0.09] bg-[#090B10]/80 p-5">
              <div className="font-mono text-3xl font-bold text-ink tabular-nums sm:text-4xl">{`${codingStandards.hardLines}L`}</div>
              <div className="mt-1 text-xs font-medium text-muted">{locale === 'vi' ? 'Ngưỡng tách file bắt buộc' : 'Hard split threshold'}</div>
            </div>
          </div>

          <div className="space-y-5">
            <div className="space-y-2.5">
              <h3 className="text-base font-bold text-ink">{codingStandards.tier1Title}</h3>
              <ul className="space-y-2 text-[15.5px] leading-relaxed text-muted">
                {codingStandards.tier1Items.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span aria-hidden="true" className="mt-2.5 inline-block size-1.5 shrink-0 rounded-full bg-accent" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-2.5 border-t border-white/[0.08] pt-5">
              <h3 className="text-base font-bold text-ink">{codingStandards.tier2Title}</h3>
              <ul className="space-y-2 text-[15.5px] leading-relaxed text-muted">
                {codingStandards.tier2Items.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span aria-hidden="true" className="mt-2.5 inline-block size-1.5 shrink-0 rounded-full bg-subtle" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="specular-surface flex flex-col justify-between gap-7 rounded-3xl border border-white/[0.09] bg-card p-8 sm:p-10">
          <div className="space-y-6">
            <div className="space-y-2">
              <p className="font-mono text-xs tracking-wider text-subtle uppercase">{specRatchet.badge}</p>
              <h2 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">{specRatchet.title}</h2>
              <p className="text-base leading-relaxed text-muted">{specRatchet.subtitle}</p>
            </div>
            <div className="space-y-3.5">
              {specRatchet.guarantees.map((item) => (
                <div key={item.title} className="space-y-1.5 rounded-2xl border border-white/[0.09] bg-[#090B10]/75 p-5">
                  <h3 className="text-base font-bold text-ink">{item.title}</h3>
                  <p className="text-sm leading-relaxed text-muted sm:text-[15px]">{item.summary}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2.5 border-t border-white/[0.08] pt-5">
            <div className="font-mono text-xs text-subtle">{specRatchet.ledgerFile}</div>
            <CopyCommandBar command={specRatchet.auditCommand} copyLabel={t.common.copy} copiedLabel={t.common.copied} manualCopyHint={t.common.copyManualHint} />
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {[
          { card: artifactRouting.brainCard, tag: locale === 'vi' ? 'Mặc định' : 'Default' },
          { card: artifactRouting.workspaceCard, tag: '/docs' },
        ].map(({ card, tag }) => (
          <div key={card.title} className="specular-surface space-y-3 rounded-3xl border border-white/[0.09] bg-card p-7 sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-lg font-bold text-ink">{card.title}</h3>
              <span className="rounded-full border border-white/[0.12] bg-white/[0.04] px-3 py-1 font-mono text-xs text-muted">{tag}</span>
            </div>
            <code className="block rounded-xl border border-white/[0.09] bg-[#090B10] px-3.5 py-2 font-mono text-xs text-ink/90">{card.pathPattern}</code>
            <p className="text-[15px] leading-relaxed text-muted">{card.summary}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

export function ArchitecturePage() {
  const { t } = useLanguage()
  const reduceMotion = useReducedMotion()
  const [selectedPresetIdx, setSelectedPresetIdx] = useState(0)
  const overnight = t.architecturePage.specRatchet.overnightPlaybook

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      className="mx-auto min-h-dvh max-w-[90rem] px-4 pb-20 sm:px-6 lg:px-8 lg:pb-24"
    >
      <SEO routeId="architecture" />
      <ArchitectureHeroHeader />
      <CoreRulesSection />
      <PresetsControlSection selectedPresetIdx={selectedPresetIdx} onSelectPreset={setSelectedPresetIdx} />
      <StandardsAndLedgerSection />

      <section aria-labelledby="overnight-playbook-heading" className="pt-16 lg:pt-20">
        <div className="hardware-bezel rounded-3xl border border-white/[0.12] bg-[#090B10]/90 p-2.5 sm:p-3.5">
          <div className="specular-surface space-y-8 rounded-2xl border border-white/[0.09] bg-card p-8 sm:p-10">
            <div className="space-y-2.5">
              <span className="inline-flex rounded-full border border-white/[0.12] bg-white/[0.04] px-3.5 py-1 font-mono text-xs tracking-wider text-muted uppercase">
                {overnight.badge}
              </span>
              <h2 id="overnight-playbook-heading" className="text-[clamp(1.85rem,2.8vw,2.5rem)] leading-[1.1] font-bold tracking-[-0.032em] text-ink">
                {overnight.title}
              </h2>
              <p className="max-w-[65ch] text-base leading-relaxed text-muted sm:text-lg">{overnight.subtitle}</p>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              {overnight.modes.map((row) => (
                <div key={row.workflow} className="space-y-3 rounded-2xl border border-white/[0.09] bg-[#090B10]/85 p-6">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <code className="font-mono text-lg font-bold text-ink">{row.workflow}</code>
                    <span className="rounded-full border border-white/[0.10] bg-white/[0.04] px-3 py-1 font-mono text-xs text-muted">{row.scope}</span>
                  </div>
                  <p className="text-[15.5px] leading-relaxed text-muted">{row.behavior}</p>
                </div>
              ))}
            </div>

            <div className="space-y-2.5">
              <div className="font-mono text-xs tracking-wider text-subtle uppercase">{overnight.promptLabel}</div>
              <CopyCommandBar command={overnight.prompt} copyLabel={t.common.copy} copiedLabel={t.common.copied} manualCopyHint={t.common.copyManualHint} />
            </div>
          </div>
        </div>
      </section>
    </motion.div>
  )
}
