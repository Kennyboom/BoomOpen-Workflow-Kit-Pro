import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { clsx } from 'clsx'
import { AlertTriangle, Check, Copy, RotateCcw, Search, X } from 'lucide-react'
import { useCopyCommand } from '../../hooks/useCopyCommand'
import type {
  ActionLinkProps, BadgeProps, BadgeTone, ButtonProps, ButtonVariant, CopyCommandBarProps,
  EmptyCatalogStateProps, FilterPillProps, InlineErrorStateProps, SearchInputProps,
  SkeletonCardProps, SurfaceCardProps, SurfaceVariant,
} from '../../types/ui-contract'

/** Flagship Widescreen 5-State UI Primitives: tactile obsidian glass controls across 1,462 skills. */
const FOCUS_RING =
  'outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-canvas'

const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
  primary:
    'bg-primary text-primary-ink border border-white hover:bg-primary-hover shadow-[inset_0_1px_0_rgba(255,255,255,0.6),0_10px_28px_-6px_rgba(255,255,255,0.22)]',
  secondary:
    'bg-white/[0.05] text-ink border border-white/[0.14] hover:bg-white/[0.09] hover:border-white/[0.24] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]',
  ghost:
    'bg-transparent text-muted border border-transparent hover:text-ink hover:bg-white/[0.06] font-medium',
  terminal:
    'bg-[#090B10] text-ink border border-white/[0.12] hover:border-white/[0.24] hover:bg-[#0E1118] font-mono font-medium shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]',
}

const BADGE_TONES: Record<BadgeTone, string> = {
  neutral: 'bg-white/[0.05] text-muted border-white/[0.10]',
  amber: 'bg-white/[0.08] text-ink border-white/[0.16]',
  emerald: 'bg-accent/12 text-accent border-accent/30',
  cobalt: 'bg-cobalt/12 text-cobalt border-cobalt/30',
  danger: 'bg-danger/12 text-danger border-danger/30',
}

const SURFACE_VARIANTS: Record<SurfaceVariant, string> = {
  default: 'border border-hairline specular-surface',
  elevated: 'border border-white/[0.12] specular-surface-elevated',
  interactive:
    'border border-hairline specular-surface transition-all duration-200 motion-reduce:transition-none hover:border-white/[0.22] hover:-translate-y-0.5 motion-reduce:hover:translate-y-0',
  subtle: 'bg-white/[0.025] border border-hairline shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]',
}

const BUTTON_BASE = clsx(
  'inline-flex min-h-12 items-center justify-center gap-2.5 rounded-xl px-6 py-3 text-[15px] sm:text-base leading-snug font-semibold transition-all duration-150 motion-reduce:transition-none',
  FOCUS_RING,
)

export function ActionButton({
  variant = 'primary', state = 'default', icon, trailingIcon, disabled, className, type = 'button', children, ...rest
}: ButtonProps) {
  const isDisabled = Boolean(disabled) || state === 'disabled' || state === 'loading'
  return (
    <button
      type={type}
      disabled={isDisabled}
      aria-busy={state === 'loading' || undefined}
      className={clsx(BUTTON_BASE, 'disabled:pointer-events-none disabled:opacity-50 cursor-pointer', BUTTON_VARIANTS[variant], className)}
      {...rest}
    >
      {state === 'loading' ? (
        <span aria-hidden="true" className="inline-block size-4 rounded-full border-2 border-current border-r-transparent animate-spin motion-reduce:animate-none" />
      ) : (
        icon
      )}
      <span>{children}</span>
      {trailingIcon}
    </button>
  )
}

export const Button = ActionButton

export function ActionLink({
  to, external = false, variant = 'secondary', icon, trailingIcon, ariaLabel, className, children,
}: ActionLinkProps) {
  const classes = clsx(BUTTON_BASE, 'no-underline', BUTTON_VARIANTS[variant], className)
  if (external || to.startsWith('http')) {
    return (
      <a href={to} target="_blank" rel="noopener noreferrer" aria-label={ariaLabel} className={classes}>
        {icon}
        <span>{children}</span>
        {trailingIcon}
      </a>
    )
  }
  return (
    <Link to={to} aria-label={ariaLabel} className={classes}>
      {icon}
      <span>{children}</span>
      {trailingIcon}
    </Link>
  )
}

export function SurfaceCard({ variant = 'default', as, className, children, ...rest }: SurfaceCardProps) {
  const Tag = as ?? 'div'
  return (
    <Tag className={clsx('rounded-3xl p-7 sm:p-8 lg:p-9', SURFACE_VARIANTS[variant], className)} {...rest}>
      {children}
    </Tag>
  )
}

export function StatusBadge({ tone = 'neutral', mono = true, className, children, ...rest }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-lg border px-3 py-1 text-[13px] leading-snug font-medium tabular-nums',
        mono ? 'font-mono' : 'font-sans',
        BADGE_TONES[tone],
        className,
      )}
      {...rest}
    >
      {children}
    </span>
  )
}

export const Badge = StatusBadge

export function FilterPill({ label, count, active, onSelect, disabled = false }: FilterPillProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      aria-pressed={active}
      onClick={onSelect}
      className={clsx(
        'inline-flex min-h-11 items-center gap-2.5 rounded-xl border px-4 py-2.5 text-[14px] sm:text-[15px] leading-snug transition-all duration-150 motion-reduce:transition-none disabled:pointer-events-none disabled:opacity-40 cursor-pointer',
        FOCUS_RING,
        active
          ? 'border-white bg-primary text-primary-ink font-semibold shadow-[0_8px_22px_-6px_rgba(255,255,255,0.26)]'
          : 'border-white/[0.10] bg-white/[0.03] text-muted hover:border-white/[0.20] hover:bg-white/[0.07] hover:text-ink font-medium',
      )}
    >
      <span>{label}</span>
      {typeof count === 'number' && (
        <span
          className={clsx(
            'rounded-md px-2 py-0.5 font-mono text-xs leading-none tabular-nums',
            active ? 'bg-canvas/18 text-primary-ink font-semibold' : 'bg-white/[0.07] text-subtle',
          )}
        >
          {count.toLocaleString('en-US')}
        </span>
      )}
    </button>
  )
}

export function SearchField({
  id,
  label,
  value,
  onChange,
  placeholder,
  clearLabel = 'Clear search',
  resultCountLabel,
  className,
  ...rest
}: SearchInputProps) {
  return (
    <div className={clsx('w-full', className)}>
      <div className="mb-2 flex items-center justify-between gap-3">
        <label htmlFor={id} className="text-sm leading-snug font-medium text-muted">
          {label}
        </label>
        {resultCountLabel && (
          <span
            aria-live="polite"
            className="shrink-0 whitespace-nowrap font-mono text-sm leading-snug text-subtle tabular-nums"
          >
            {resultCountLabel}
          </span>
        )}
      </div>
      <div className="relative flex items-center">
        <Search aria-hidden="true" className="pointer-events-none absolute left-4 size-5 text-subtle" />
        <input
          id={id}
          type="search"
          value={value}
          aria-label={label}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          className={clsx(
            'min-h-13 w-full rounded-2xl border border-white/[0.12] bg-[#0B0D13] pl-12 pr-12 py-3.5 text-base leading-normal font-normal text-ink shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] transition-colors duration-150 motion-reduce:transition-none hover:border-white/[0.22] focus:border-white/[0.32]',
            FOCUS_RING,
          )}
          {...rest}
        />
        {value.length > 0 && (
          <button
            type="button"
            aria-label={clearLabel}
            onClick={() => onChange('')}
            className={clsx(
              'absolute right-1.5 inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl text-muted hover:bg-white/[0.06] hover:text-ink transition-colors duration-150 motion-reduce:transition-none cursor-pointer',
              FOCUS_RING,
            )}
          >
            <X aria-hidden="true" className="size-4.5" />
          </button>
        )}
      </div>
    </div>
  )
}

function selectElementText(element: HTMLElement | null): void {
  if (!element || typeof window === 'undefined') {
    return
  }
  const selection = window.getSelection()
  if (!selection) {
    return
  }
  const range = document.createRange()
  range.selectNodeContents(element)
  selection.removeAllRanges()
  selection.addRange(range)
}

export function CopyCommandBar({
  command,
  label,
  copyLabel = 'Copy',
  copiedLabel = 'Copied',
  manualCopyHint = 'Clipboard unavailable. Command selected: press Ctrl+C or Cmd+C.',
  compact = false,
  className,
}: CopyCommandBarProps) {
  const { copied, copyFailed, copy } = useCopyCommand()
  const codeRef = useRef<HTMLElement | null>(null)

  const handleCopy = async () => {
    const ok = await copy(command)
    if (!ok) {
      selectElementText(codeRef.current)
    }
  }

  return (
    <div className={clsx('w-full', className)}>
      {label && <div className="mb-2 text-sm leading-snug font-medium text-muted">{label}</div>}
      <div
        className={clsx(
          'flex items-center justify-between gap-4 rounded-2xl border border-white/[0.11] bg-[#090B10] px-4 sm:px-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_16px_38px_-18px_rgba(0,0,0,0.75)]',
          compact ? 'py-2.5' : 'py-3',
        )}
      >
        <div className="scrollbar-none flex min-w-0 items-center gap-3 overflow-x-auto py-0.5">
          <span aria-hidden="true" className="select-none font-mono text-sm font-semibold text-accent">$</span>
          <code
            ref={codeRef}
            className="whitespace-nowrap font-mono text-[14px] sm:text-[15px] leading-relaxed text-ink tabular-nums"
          >
            {command}
          </code>
        </div>
        <button
          type="button"
          aria-label={`${copyLabel}: ${command}`}
          onClick={() => {
            void handleCopy()
          }}
          className={clsx(
            'inline-flex min-h-11 shrink-0 items-center gap-2 rounded-xl border px-4 py-2 font-mono text-[13px] leading-none font-medium transition-all duration-150 motion-reduce:transition-none cursor-pointer',
            FOCUS_RING,
            copied
              ? 'border-accent/35 bg-accent/14 text-accent'
              : 'border-white/[0.12] bg-white/[0.05] text-ink hover:border-white/[0.24] hover:bg-white/[0.10]',
          )}
        >
          {copied ? <Check aria-hidden="true" className="size-4 text-accent" /> : <Copy aria-hidden="true" className="size-4" />}
          <span>{copied ? copiedLabel : copyLabel}</span>
        </button>
      </div>
      <div aria-live="polite" className="sr-only">{copied ? copiedLabel : copyFailed ? manualCopyHint : ''}</div>
      {copyFailed && <div className="mt-2 max-w-prose text-sm leading-relaxed text-muted">{manualCopyHint}</div>}
    </div>
  )
}

export const CopyCommandBox = CopyCommandBar

export function SkeletonCard({ count = 3, className }: SkeletonCardProps) {
  return (
    <div role="status" aria-live="polite" aria-label="Loading content" className={clsx('grid gap-6 sm:grid-cols-2 lg:grid-cols-3', className)}>
      {Array.from({ length: count }, (_, idx) => (
        <div key={idx} className="rounded-3xl border border-hairline specular-surface p-7 sm:p-8 animate-pulse motion-reduce:animate-none">
          <div className="mb-5 h-5 w-28 rounded-md bg-elevated" />
          <div className="mb-3 h-6 w-3/4 rounded-md bg-elevated" />
          <div className="h-4 w-full rounded-md bg-elevated" />
        </div>
      ))}
    </div>
  )
}

export const SkeletonGrid = SkeletonCard

export function EmptyCatalogState({ title, description, resetLabel, onReset }: EmptyCatalogStateProps) {
  const reduceMotion = useReducedMotion()
  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.16, ease: 'easeOut' }}
    >
      <SurfaceCard variant="subtle" className="flex flex-col items-start gap-5 py-10">
        <div className="space-y-2">
          <div className="font-display text-xl sm:text-2xl leading-tight font-bold text-ink">
            {title}
          </div>
          <div className="max-w-prose text-base leading-relaxed text-muted">
            {description}
          </div>
        </div>
        <ActionButton variant="secondary" icon={<RotateCcw aria-hidden="true" className="size-4" />} onClick={onReset}>
          {resetLabel}
        </ActionButton>
      </SurfaceCard>
    </motion.div>
  )
}

export function InlineErrorState({ title, message, retryLabel, onRetry }: InlineErrorStateProps) {
  return (
    <div role="alert" className="rounded-3xl border border-danger/30 bg-danger/10 p-7 sm:p-8">
      <div className="flex items-start gap-4">
        <AlertTriangle aria-hidden="true" className="mt-1 size-6 shrink-0 text-danger" />
        <div className="space-y-3">
          <div className="font-display text-xl sm:text-2xl leading-tight font-bold text-ink">
            {title}
          </div>
          <div className="max-w-prose text-base leading-relaxed text-muted">
            {message}
          </div>
          {retryLabel && onRetry && <ActionButton variant="secondary" onClick={onRetry}>{retryLabel}</ActionButton>}
        </div>
      </div>
    </div>
  )
}
