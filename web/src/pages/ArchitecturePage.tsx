import { useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { clsx } from 'clsx'
import { SEO } from '../components/seo/SEO'
import { ActionLink, CopyCommandBar } from '../components/ui/Primitives'
import { KIT_STATS, formatCount } from '../data/kitStats'
import { useLanguage } from '../i18n/context'

/**
 * Editorial architecture reference covering the 7 rule modules, execution presets,
 * SHA-256 project ledger, 2-tier coding gates, and overnight /autopilot playbook.
 */
const FOCUS_RING =
  'outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-canvas'

function CoreRulesSection() {
  const { t } = useLanguage()
  const { coreRules } = t.architecturePage

  return (
    <section aria-labelledby="core-rules-heading" className="space-y-6 border-t border-hairline py-12">
      <div className="space-y-1.5">
        <p className="font-mono text-xs tracking-wider text-subtle uppercase">{coreRules.badge}</p>
        <h2 id="core-rules-heading" className="text-2xl font-semibold tracking-tight text-ink">
          {coreRules.title}
        </h2>
        <p className="max-w-[60ch] text-sm leading-relaxed text-muted">{coreRules.subtitle}</p>
      </div>

      <div className="divide-y divide-hairline rounded-xl border border-hairline bg-card">
        {coreRules.items.map((rule, index) => (
          <div
            key={rule.file}
            className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6"
          >
            <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-4">
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-xs text-subtle tabular-nums">{`0${index + 1}`}</span>
                <code className="font-mono text-sm font-medium text-ink">{`rules/${rule.file}`}</code>
              </div>
              <p className="text-sm leading-relaxed text-muted">{rule.summary}</p>
            </div>
            <span className="shrink-0 self-start rounded bg-white/[0.04] px-2 py-0.5 font-mono text-xs text-subtle sm:self-center">
              {rule.trigger}
            </span>
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
    <section aria-labelledby="standards-ratchet-heading" className="space-y-6 border-t border-hairline py-12">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-5 rounded-xl border border-hairline bg-card p-6">
          <div className="space-y-1.5">
            <p className="font-mono text-xs tracking-wider text-subtle uppercase">{codingStandards.badge}</p>
            <h2 id="standards-ratchet-heading" className="text-xl font-semibold tracking-tight text-ink">
              {codingStandards.title}
            </h2>
            <p className="text-sm leading-relaxed text-muted">{codingStandards.subtitle}</p>
          </div>

          <div className="flex flex-wrap gap-8 border-y border-hairline py-3.5">
            <div>
              <div className="font-mono text-xl font-semibold text-ink tabular-nums">{`${codingStandards.softLines}L`}</div>
              <div className="text-xs text-subtle">
                {locale === 'vi' ? 'Trần mềm cho module gắn kết' : 'Soft ceiling per module'}
              </div>
            </div>
            <div>
              <div className="font-mono text-xl font-semibold text-ink tabular-nums">{`${codingStandards.hardLines}L`}</div>
              <div className="text-xs text-subtle">
                {locale === 'vi' ? 'Ngưỡng tách file bắt buộc' : 'Hard split threshold'}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-ink">{codingStandards.tier1Title}</h3>
              <ul className="space-y-1.5 text-sm leading-relaxed text-muted">
                {codingStandards.tier1Items.map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <span aria-hidden="true" className="mt-2 inline-block size-1 shrink-0 rounded-full bg-subtle" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-2 border-t border-hairline pt-4">
              <h3 className="text-sm font-semibold text-ink">{codingStandards.tier2Title}</h3>
              <ul className="space-y-1.5 text-sm leading-relaxed text-muted">
                {codingStandards.tier2Items.map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <span aria-hidden="true" className="mt-2 inline-block size-1 shrink-0 rounded-full bg-subtle" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-between gap-6 rounded-xl border border-hairline bg-card p-6">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <p className="font-mono text-xs tracking-wider text-subtle uppercase">{specRatchet.badge}</p>
              <h2 className="text-xl font-semibold tracking-tight text-ink">{specRatchet.title}</h2>
              <p className="text-sm leading-relaxed text-muted">{specRatchet.subtitle}</p>
            </div>
            <div className="divide-y divide-hairline border-t border-hairline">
              {specRatchet.guarantees.map((item) => (
                <div key={item.title} className="space-y-1 py-3.5">
                  <h3 className="text-sm font-semibold text-ink">{item.title}</h3>
                  <p className="text-xs leading-relaxed text-muted">{item.summary}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2 border-t border-hairline pt-4">
            <div className="font-mono text-xs text-subtle">{specRatchet.ledgerFile}</div>
            <CopyCommandBar
              command={specRatchet.auditCommand}
              copyLabel={t.common.copy}
              copiedLabel={t.common.copied}
              manualCopyHint={t.common.copyManualHint}
              compact
            />
          </div>
        </div>
      </div>

      <div className="grid divide-y divide-hairline rounded-xl border border-hairline bg-card md:grid-cols-2 md:divide-x md:divide-y-0">
        <div className="space-y-2 p-5">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-ink">{artifactRouting.brainCard.title}</h3>
            <span className="rounded bg-white/[0.04] px-2 py-0.5 font-mono text-xs text-subtle">
              {locale === 'vi' ? 'Mặc định' : 'Default'}
            </span>
          </div>
          <code className="block font-mono text-xs text-ink">{artifactRouting.brainCard.pathPattern}</code>
          <p className="text-xs leading-relaxed text-muted">{artifactRouting.brainCard.summary}</p>
        </div>

        <div className="space-y-2 p-5">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-ink">{artifactRouting.workspaceCard.title}</h3>
            <span className="rounded bg-white/[0.04] px-2 py-0.5 font-mono text-xs text-subtle">/docs</span>
          </div>
          <code className="block font-mono text-xs text-ink">{artifactRouting.workspaceCard.pathPattern}</code>
          <p className="text-xs leading-relaxed text-muted">{artifactRouting.workspaceCard.summary}</p>
        </div>
      </div>
    </section>
  )
}

export function ArchitecturePage() {
  const { locale, t } = useLanguage()
  const reduceMotion = useReducedMotion()
  const [selectedPresetIdx, setSelectedPresetIdx] = useState(0)

  const copy = t.architecturePage
  const activePreset = copy.controlCenter.presets[selectedPresetIdx] ?? copy.controlCenter.presets[0]
  const overnight = copy.specRatchet.overnightPlaybook

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      className="mx-auto min-h-dvh max-w-[75rem] px-4 py-12 sm:px-6 lg:px-8 lg:py-16"
    >
      <SEO routeId="architecture" />

      <header className="space-y-4 pb-12">
        <p className="font-mono text-xs tracking-wider text-subtle uppercase">{copy.eyebrow}</p>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <h1 className="text-[clamp(1.85rem,3vw,2.75rem)] leading-[1.12] font-semibold tracking-[-0.032em] text-ink">
              {copy.title}
            </h1>
            <p className="max-w-[58ch] text-base leading-relaxed text-muted">{copy.subtitle}</p>
            <p className="pt-1 font-mono text-xs text-subtle tabular-nums">
              {`< 10ms AOT Sync · ${copy.controlCenter.presets.length} Presets · ${formatCount(KIT_STATS.skills)} Skills · <= 300L Entrypoints`}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <ActionLink to="/install" variant="primary" trailingIcon={<ArrowRight aria-hidden="true" className="size-4" />}>
              {t.nav.install}
            </ActionLink>
            <ActionLink to="/agents" variant="ghost">{t.nav.agents}</ActionLink>
          </div>
        </div>
      </header>

      <CoreRulesSection />

      <section aria-labelledby="control-center-heading" className="space-y-6 border-t border-hairline py-12">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-1.5">
            <p className="font-mono text-xs tracking-wider text-subtle uppercase">{copy.controlCenter.badge}</p>
            <h2 id="control-center-heading" className="text-2xl font-semibold tracking-tight text-ink">
              {copy.controlCenter.title}
            </h2>
            <p className="max-w-[60ch] text-sm leading-relaxed text-muted">{copy.controlCenter.subtitle}</p>
          </div>
          <span className="font-mono text-xs text-subtle tabular-nums">{copy.controlCenter.webUiUrl}</span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {copy.controlCenter.presets.map((preset, idx) => {
            const isSelected = idx === selectedPresetIdx
            const isDefault = preset.name === 'frontier-guardrails'
            return (
              <button
                key={preset.name}
                type="button"
                aria-pressed={isSelected}
                onClick={() => setSelectedPresetIdx(idx)}
                className={clsx(
                  'flex min-h-11 flex-col justify-between gap-3 rounded-xl border p-4 text-left transition-colors duration-150 motion-reduce:transition-none cursor-pointer',
                  FOCUS_RING,
                  isSelected
                    ? 'border-line-strong bg-elevated text-ink'
                    : 'border-hairline bg-card text-muted hover:border-line-strong hover:text-ink',
                )}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <code className="font-mono text-sm font-semibold text-ink">{preset.name}</code>
                    {isDefault ? (
                      <span className="rounded bg-primary px-2 py-0.5 font-mono text-[11px] font-semibold text-primary-ink">
                        {locale === 'vi' ? 'Mặc định' : 'Default'}
                      </span>
                    ) : (
                      <span className="font-mono text-xs text-subtle tabular-nums">{preset.lineBudget}</span>
                    )}
                  </div>
                  <div className="font-mono text-xs text-subtle">{preset.mode}</div>
                </div>
                <p className="text-xs leading-relaxed text-muted">{preset.summary}</p>
              </button>
            )
          })}
        </div>

        <CopyCommandBar
          command={`boomopen settings preset ${activePreset.name}`}
          copyLabel={t.common.copy}
          copiedLabel={t.common.copied}
          manualCopyHint={t.common.copyManualHint}
          compact
        />

        <div className="grid divide-y divide-hairline rounded-xl border border-hairline bg-card lg:grid-cols-3 lg:divide-x lg:divide-y-0">
          {copy.controlCenter.surfaces.map((surface) => (
            <div key={surface.title} className="flex flex-col justify-between gap-3 p-5">
              <div className="space-y-1.5">
                <h3 className="text-sm font-semibold text-ink">{surface.title}</h3>
                <p className="text-xs leading-relaxed text-muted">{surface.summary}</p>
              </div>
              <code className="block truncate rounded bg-white/[0.04] px-2.5 py-1.5 font-mono text-xs text-ink">
                {surface.command}
              </code>
            </div>
          ))}
        </div>
      </section>

      <StandardsAndLedgerSection />

      <section aria-labelledby="overnight-playbook-heading" className="border-t border-hairline pt-12">
        <div className="space-y-5 rounded-xl border border-hairline bg-card p-6">
          <div className="space-y-1.5">
            <p className="font-mono text-xs tracking-wider text-subtle uppercase">{overnight.badge}</p>
            <h2 id="overnight-playbook-heading" className="text-xl font-semibold tracking-tight text-ink">
              {overnight.title}
            </h2>
            <p className="max-w-[65ch] text-sm leading-relaxed text-muted">{overnight.subtitle}</p>
          </div>

          <div className="grid divide-y divide-hairline border-y border-hairline md:grid-cols-2 md:divide-x md:divide-y-0">
            {overnight.modes.map((row, idx) => (
              <div key={row.workflow} className={clsx('space-y-1.5 py-4', idx === 0 ? 'md:pr-6' : 'md:pl-6')}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <code className="font-mono text-sm font-medium text-ink">{row.workflow}</code>
                  <span className="font-mono text-xs text-subtle">{row.scope}</span>
                </div>
                <p className="text-xs leading-relaxed text-muted">{row.behavior}</p>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <div className="font-mono text-xs text-subtle">{overnight.promptLabel}</div>
            <CopyCommandBar
              command={overnight.prompt}
              copyLabel={t.common.copy}
              copiedLabel={t.common.copied}
              manualCopyHint={t.common.copyManualHint}
            />
          </div>
        </div>
      </section>
    </motion.div>
  )
}
