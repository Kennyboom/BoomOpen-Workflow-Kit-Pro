import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { clsx } from 'clsx'
import { AlertTriangle, Check, Copy, RotateCcw, Search, Sparkles, X } from 'lucide-react'
import { useCopyCommand } from '../../hooks/useCopyCommand'
import type {
  ActionLinkProps, BadgeProps, BadgeTone, ButtonProps, ButtonVariant, CopyCommandBarProps,
  EmptyCatalogStateProps, FilterPillProps, InlineErrorStateProps, SearchInputProps,
  SkeletonCardProps, SurfaceCardProps, SurfaceVariant,
} from '../../types/ui-contract'

/** Flagship 5-State UI Primitives — our mission: accessible controls across 1,462 skills. */
const FOCUS_RING =
  'outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-canvas'

const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-primary-ink border border-primary hover:bg-primary-hover font-semibold shadow-sm',
  secondary: 'bg-elevated text-ink border border-line-strong hover:border-primary/60 hover:bg-card font-semibold',
  ghost: 'bg-transparent text-muted border border-transparent hover:text-ink hover:bg-elevated/70 font-normal',
  terminal: 'bg-canvas text-ink border border-hairline hover:border-primary/60 font-mono font-normal',
}

const BADGE_TONES: Record<BadgeTone, string> = {
  neutral: 'bg-elevated text-muted border-hairline',
  amber: 'bg-primary/14 text-primary border-primary/35',
  emerald: 'bg-accent/14 text-accent border-accent/35',
  cobalt: 'bg-cobalt/14 text-cobalt border-cobalt/35',
  danger: 'bg-danger/14 text-danger border-danger/35',
}

const SURFACE_VARIANTS: Record<SurfaceVariant, string> = {
  default: 'bg-card border border-hairline specular-surface',
  elevated: 'bg-elevated border border-line-strong specular-surface',
  interactive:
    'bg-card border border-hairline specular-surface transition-colors duration-200 motion-reduce:transition-none hover:border-line-strong',
  subtle: 'bg-canvas/70 border border-hairline',
}

const BUTTON_BASE = clsx(
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-[10px] px-4 py-2.5 text-[clamp(0.875rem,0.15vw+0.84rem,0.9375rem)] leading-snug transition-colors duration-150 motion-reduce:transition-none',
  FOCUS_RING,
)

export function ActionButton({
  variant = 'primary',
  state = 'default',
  icon,
  trailingIcon,
  disabled,
  className,
  type = 'button',
  children,
  ...rest
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
        <span
          aria-hidden="true"
          className="inline-block size-4 rounded-full border-2 border-current border-r-transparent animate-spin motion-reduce:animate-none"
        />
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
  to,
  external = false,
  variant = 'secondary',
  icon,
  trailingIcon,
  ariaLabel,
  className,
  children,
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
    <Tag className={clsx('rounded-2xl p-5 sm:p-6', SURFACE_VARIANTS[variant], className)} {...rest}>
      {children}
    </Tag>
  )
}

export function StatusBadge({ tone = 'neutral', mono = true, className, children, ...rest }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[clamp(0.72rem,0.1vw+0.7rem,0.78rem)] leading-tight font-semibold tabular-nums',
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
        'inline-flex min-h-11 items-center gap-2 rounded-[10px] border px-3.5 py-2 text-[clamp(0.8125rem,0.12vw+0.79rem,0.875rem)] leading-snug transition-colors duration-150 motion-reduce:transition-none disabled:pointer-events-none disabled:opacity-40 cursor-pointer',
        FOCUS_RING,
        active
          ? 'bg-primary text-primary-ink border-primary font-semibold'
          : 'bg-card text-muted border-hairline hover:text-ink hover:border-line-strong font-normal',
      )}
    >
      <span>{label}</span>
      {typeof count === 'number' && (
        <span
          className={clsx(
            'rounded-md px-1.5 py-0.5 font-mono text-[clamp(0.7rem,0.1vw+0.68rem,0.75rem)] leading-none tabular-nums',
            active ? 'bg-canvas/20 text-primary-ink' : 'bg-elevated text-muted',
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
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <label htmlFor={id} className="text-[clamp(0.8125rem,0.1vw+0.79rem,0.875rem)] leading-snug font-semibold text-ink">
          {label}
        </label>
        {resultCountLabel && (
          <span
            aria-live="polite"
            className="font-mono text-[clamp(0.75rem,0.1vw+0.72rem,0.8125rem)] leading-snug text-muted tabular-nums"
          >
            {resultCountLabel}
          </span>
        )}
      </div>
      <div className="relative flex items-center">
        <Search aria-hidden="true" className="pointer-events-none absolute left-3.5 size-4 text-muted" />
        <input
          id={id}
          type="search"
          value={value}
          aria-label={label}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          className={clsx(
            'min-h-11 w-full rounded-[10px] border border-hairline bg-canvas pl-10 pr-12 py-2.5 text-[clamp(0.9375rem,0.15vw+0.9rem,1rem)] leading-normal font-normal text-ink transition-colors duration-150 motion-reduce:transition-none hover:border-line-strong',
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
              'absolute right-1 inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg text-muted hover:text-ink transition-colors duration-150 motion-reduce:transition-none cursor-pointer',
              FOCUS_RING,
            )}
          >
            <X aria-hidden="true" className="size-4" />
          </button>
        )}
      </div>
    </div>
  )
}

export function CopyCommandBar({
  command,
  label,
  copyLabel = 'Copy',
  copiedLabel = 'Copied',
  manualCopyHint = 'Clipboard blocked — command selected for manual copy (Ctrl+C / Cmd+C).',
  compact = false,
  className,
}: CopyCommandBarProps) {
  const { copied, copyFailed, copy } = useCopyCommand()
  const codeRef = useRef<HTMLElement | null>(null)

  const handleCopy = async () => {
    const ok = await copy(command)
    if (!ok && codeRef.current && typeof window !== 'undefined') {
      const selection = window.getSelection()
      if (selection) {
        const range = document.createRange()
        range.selectNodeContents(codeRef.current)
        selection.removeAllRanges()
        selection.addRange(range)
      }
    }
  }

  return (
    <div className={clsx('rounded-2xl border border-hairline bg-card p-1.5 specular-surface', className)}>
      {label && (
        <div className="flex items-center justify-between px-3 py-1.5 text-[clamp(0.72rem,0.1vw+0.7rem,0.78rem)] leading-tight font-mono text-muted">
          <span>{label}</span>
          <span
            className="font-semibold text-accent"
          >
            HTTPS · MIT Verified
          </span>
        </div>
      )}
      <div className={clsx('flex items-center justify-between gap-3 rounded-[10px] border border-hairline bg-canvas px-3.5', compact ? 'py-1.5' : 'py-2.5')}>
        <code ref={codeRef} className="overflow-x-auto whitespace-nowrap font-mono text-[clamp(0.8rem,0.15vw+0.76rem,0.875rem)] leading-relaxed text-ink tabular-nums">
          {command}
        </code>
        <button
          type="button"
          aria-label={`${copyLabel}: ${command}`}
          onClick={() => {
            void handleCopy()
          }}
          className={clsx(
            'inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-lg border px-3 py-2 font-mono text-[clamp(0.75rem,0.1vw+0.73rem,0.8125rem)] leading-none font-semibold transition-colors duration-150 motion-reduce:transition-none cursor-pointer',
            FOCUS_RING,
            copied ? 'border-accent/50 bg-accent/15 text-accent' : 'border-line-strong bg-elevated text-ink hover:border-primary/60',
          )}
        >
          {copied ? <Check aria-hidden="true" className="size-4 text-accent" /> : <Copy aria-hidden="true" className="size-4 text-primary" />}
          <span>{copied ? copiedLabel : copyLabel}</span>
        </button>
      </div>
      <div aria-live="polite" className="sr-only">{copied ? copiedLabel : copyFailed ? manualCopyHint : ''}</div>
      {copyFailed && (
        <div className="mt-1.5 max-w-prose px-2 text-[clamp(0.75rem,0.1vw+0.73rem,0.8125rem)] leading-relaxed text-warning">
          {manualCopyHint}
        </div>
      )}
    </div>
  )
}

export const CopyCommandBox = CopyCommandBar

export function SkeletonCard({ count = 3, className }: SkeletonCardProps) {
  return (
    <div role="status" aria-live="polite" aria-label="Loading content" className={clsx('grid gap-4 sm:grid-cols-2 lg:grid-cols-3', className)}>
      {Array.from({ length: count }, (_, idx) => (
        <div key={idx} className="rounded-2xl border border-hairline bg-card p-6 animate-pulse motion-reduce:animate-none">
          <div className="mb-4 h-[14px] w-24 rounded bg-elevated" />
          <div className="mb-2.5 h-[20px] w-3/4 rounded bg-elevated" />
          <div className="h-[14px] w-full rounded bg-elevated" />
        </div>
      ))}
    </div>
  )
}

export const SkeletonGrid = SkeletonCard

export function EmptyCatalogState({ title, description, resetLabel, onReset }: EmptyCatalogStateProps) {
  const reduceMotion = useReducedMotion()
  return (
    <motion.div initial={reduceMotion ? false : { opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.18, ease: 'easeOut' }}>
      <SurfaceCard variant="subtle" className="flex flex-col items-start gap-4 py-8">
        <StatusBadge tone="amber">
          <Sparkles aria-hidden="true" className="size-3.5" />
          <span>0 matches</span>
        </StatusBadge>
        <div className="space-y-1.5">
          <div className="font-display text-[clamp(1.125rem,0.4vw+1rem,1.35rem)] leading-tight font-semibold text-ink">{title}</div>
          <div className="max-w-prose text-[clamp(0.9rem,0.15vw+0.87rem,0.975rem)] leading-relaxed text-muted">{description}</div>
        </div>
        <ActionButton variant="primary" icon={<RotateCcw aria-hidden="true" className="size-4" />} onClick={onReset}>
          {resetLabel}
        </ActionButton>
      </SurfaceCard>
    </motion.div>
  )
}

export function InlineErrorState({ title, message, retryLabel, onRetry }: InlineErrorStateProps) {
  return (
    <div role="alert" className="rounded-2xl border border-danger/40 bg-danger/10 p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <AlertTriangle aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-danger" />
        <div className="space-y-2">
          <div className="font-display text-[clamp(1.05rem,0.3vw+0.98rem,1.25rem)] leading-tight font-semibold text-ink">{title}</div>
          <div className="max-w-prose text-[clamp(0.875rem,0.15vw+0.85rem,0.95rem)] leading-relaxed text-muted">{message}</div>
          {retryLabel && onRetry && <ActionButton variant="secondary" onClick={onRetry}>{retryLabel}</ActionButton>}
        </div>
      </div>
    </div>
  )
}
