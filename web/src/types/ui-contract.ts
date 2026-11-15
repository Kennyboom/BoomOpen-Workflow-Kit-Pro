import type { ButtonHTMLAttributes, HTMLAttributes, InputHTMLAttributes, ReactNode } from 'react'

export type Locale = 'en' | 'vi'

export type UiInteractiveState = 'default' | 'loading' | 'empty' | 'error' | 'disabled'

export interface BilingualText {
  readonly en: string
  readonly vi: string
}

export type AsyncViewState<T> =
  | { readonly status: 'idle' }
  | { readonly status: 'loading'; readonly skeletonCount?: number }
  | { readonly status: 'empty'; readonly title: string; readonly resetLabel: string }
  | { readonly status: 'error'; readonly message: string; readonly retryable: boolean }
  | { readonly status: 'success'; readonly data: T }

export interface TrailerChapter {
  readonly seconds: number
  readonly label: string
}

export interface TrailerMediaAsset {
  readonly locale: Locale
  readonly videoSrc: '/media/boomopen_v55_trailer_en.mp4' | '/media/boomopen_v55_trailer_vi.mp4'
  readonly posterSrc: '/media/poster_en.png' | '/media/poster_vi.png'
  readonly fallbackUrl: string
  readonly caption: string
  readonly chapters: readonly TrailerChapter[]
}

export type PlatformId = 'antigravity' | 'claude' | 'codex' | 'cursor' | 'copilot'

export interface PlatformSpec {
  readonly id: PlatformId
  readonly name: string
  readonly vendor: string
  readonly entryFile: string
  readonly frameworkPath: string
  readonly installCommand: string
  readonly verifyCommand: string
  readonly uninstallCommand: string
  readonly summary: BilingualText
}

export type CliCommandId =
  | 'research'
  | 'design'
  | 'plan'
  | 'cook'
  | 'reconcile'
  | 'audit'
  | 'ledger'
  | 'conduct'
  | 'check'
  | 'settings'
  | 'doctor'
  | 'install'
  | 'uninstall'
  | 'list'

export interface CliCommandSpec {
  readonly id: CliCommandId
  readonly invocation: string
  readonly category: 'compiler' | 'orchestration' | 'lifecycle'
  readonly gates: readonly string[]
  readonly summary: BilingualText
  readonly passOutput: string
  readonly failOutput: string
}

export type CommandCategory =
  | 'orchestration'
  | 'engineering'
  | 'research-design'
  | 'quality-security'
  | 'session-ops'

export interface CommandCatalogItem {
  readonly name: string
  readonly slash: string
  readonly variants: readonly string[]
  readonly category: CommandCategory
  readonly hasTeamVariant: boolean
  readonly summary: BilingualText
  readonly nlExamples: BilingualText
}

export interface AgentSpec {
  readonly id: string
  readonly title: BilingualText
  readonly domain: string
  readonly deliverable: string
  readonly modelPolicy: 'inherit'
  readonly summary: BilingualText
}

export interface TeamRoleAgents {
  readonly techlead: readonly string[]
  readonly executor: readonly string[]
  readonly reviewer: readonly string[]
}

export interface TeamSpec {
  readonly id: string
  readonly dirName: string
  readonly triggerCommand: string
  readonly roles: TeamRoleAgents
  readonly summary: BilingualText
}

export interface SkillShowcaseItem {
  readonly id: string
  readonly domainId: string
  readonly tier: 'core' | 'library'
  readonly summary: BilingualText
}

export type PageRouteId =
  | 'home'
  | 'commands'
  | 'agents'
  | 'skills'
  | 'architecture'
  | 'install'
  | 'notFound'

export interface PageSeoEntry {
  readonly id: PageRouteId
  readonly pathname?: string
  readonly priority?: number
  readonly noindex?: boolean
  readonly title: BilingualText
  readonly description: BilingualText
}

/* Shared Flagship UI Primitive Props */

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'terminal'
export type BadgeTone = 'neutral' | 'amber' | 'emerald' | 'cobalt' | 'danger'
export type SurfaceVariant = 'default' | 'elevated' | 'interactive' | 'subtle'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  readonly variant?: ButtonVariant
  readonly state?: UiInteractiveState
  readonly icon?: ReactNode
  readonly trailingIcon?: ReactNode
}

export interface ActionLinkProps {
  readonly to: string
  readonly external?: boolean
  readonly variant?: ButtonVariant
  readonly icon?: ReactNode
  readonly trailingIcon?: ReactNode
  readonly ariaLabel?: string
  readonly className?: string
  readonly children: ReactNode
}

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  readonly tone?: BadgeTone
  readonly mono?: boolean
}

export interface SurfaceCardProps extends HTMLAttributes<HTMLDivElement> {
  readonly variant?: SurfaceVariant
  readonly as?: 'div' | 'article' | 'section'
}

export interface FilterPillProps {
  readonly label: string
  readonly count?: number
  readonly active: boolean
  readonly onSelect: () => void
  readonly disabled?: boolean
}

export interface SearchInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  readonly id: string
  readonly label: string
  readonly value: string
  readonly onChange: (nextValue: string) => void
  readonly clearLabel?: string
  readonly resultCountLabel?: string
}

export interface CopyCommandBarProps {
  readonly command: string
  readonly label?: string
  readonly copyLabel?: string
  readonly copiedLabel?: string
  readonly manualCopyHint?: string
  readonly compact?: boolean
  readonly className?: string
}

export interface EmptyCatalogStateProps {
  readonly title: string
  readonly description: string
  readonly resetLabel: string
  readonly onReset: () => void
}

export interface InlineErrorStateProps {
  readonly title: string
  readonly message: string
  readonly retryLabel?: string
  readonly onRetry?: () => void
}

export interface SkeletonCardProps {
  readonly count?: number
  readonly className?: string
}
