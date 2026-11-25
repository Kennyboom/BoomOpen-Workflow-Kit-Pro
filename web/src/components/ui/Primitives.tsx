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

/** Obsidian Monograph 5-State UI Primitives: accessible controls across 1,462 indexed skills. */
const FOCUS_RING =
  'outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-canvas'

const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-primary-ink border border-primary hover:bg-primary-hover font-medium',
  secondary: 'bg-white/[0.03] text-ink border border-hairline hover:border-line-strong hover:bg-white/[0.06] font-medium',
  ghost: 'bg-transparent text-muted border border-transparent hover:text-ink hover:bg-white/[0.04] font-normal',
  terminal: 'bg-[#0D0D10] text-ink border border-hairline hover:border-line-strong font-mono font-normal',
}

const BADGE_TONES: Record<BadgeTone, string> = {
  neutral: 'bg-white/[0.03] text-muted border-hairline',
  amber: 'bg-white/[0.06] text-ink border-line-strong',
  cobalt: 'bg-white/[0.04] text-muted border-hairline',
  emerald: 'bg-accent/10 text-accent border-accent/25',
  danger: 'bg-danger/10 text-danger border-danger/25',
}

const SURFACE_VARIANTS: Record<SurfaceVariant, string> = {
  default: 'bg-card border border-hairline specular-surface',
  elevated: 'bg-elevated border border-hairline specular-surface',
  interactive:
    'bg-card border border-hairline specular-surface transition-colors duration-150 motion-reduce:transition-none hover:border-line-strong',
  subtle: 'bg-white/[0.02] border border-hairline',
}

const BUTTON_BASE = clsx(
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-[clamp(0.85rem,0.12vw+0.82rem,0.925rem)] leading-snug transition-colors duration-150 motion-reduce:transition-none',
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
      className={clsx(
        BUTTON_BASE,
        'disabled:pointer-events-none disabled:opacity-50 cursor-pointer',
        BUTTON_VARIANTS[variant],
        className,
      )}
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
    <Tag className={clsx('rounded-xl p-5 sm:p-6', SURFACE_VARIANTS[variant], className)} {...rest}>
      {children}
    </Tag>
  )
}

export function StatusBadge({ tone = 'neutral', mono = true, className, children, ...rest }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs leading-tight font-medium tabular-nums',
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
        'inline-flex min-h-11 items-center gap-2 rounded-lg border px-3.5 py-2 text-[clamp(0.8125rem,0.1vw+0.79rem,0.875rem)] leading-snug transition-colors duration-150 motion-reduce:transition-none disabled:pointer-events-none disabled:opacity-40 cursor-pointer',
        FOCUS_RING,
        active
          ? 'bg-primary text-primary-ink border-primary font-medium'
          : 'bg-transparent text-muted border-hairline hover:text-ink hover:border-line-strong font-normal',
      )}
    >
      <span>{label}</span>
      {typeof count === 'number' && (
        <span
          className={clsx(
            'rounded px-1.5 py-0.5 font-mono text-[11px] leading-none tabular-nums',
            active ? 'bg-canvas/15 text-primary-ink' : 'bg-white/[0.05] text-subtle',
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
        <label htmlFor={id} className="text-xs leading-snug font-medium text-muted">
          {label}
        </label>
        {resultCountLabel && (
          <span
            aria-live="polite"
            className="font-mono text-xs leading-snug text-subtle tabular-nums"
          >
            {resultCountLabel}
          </span>
        )}
      </div>
      <div className="relative flex items-center">
        <Search aria-hidden="true" className="pointer-events-none absolute left-3.5 size-4 text-subtle" />
        <input
          id={id}
          type="search"
          value={value}
          aria-label={label}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          className={clsx(
            'min-h-11 w-full rounded-lg border border-hairline bg-[#0D0D10] pl-10 pr-12 py-2.5 text-[clamp(0.9rem,0.12vw+0.87rem,0.95rem)] leading-normal font-normal text-ink transition-colors duration-150 motion-reduce:transition-none hover:border-line-strong',
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
              'absolute right-1 inline-flex min-h-11 min-w-11 items-center justify-center rounded-md text-muted hover:text-ink transition-colors duration-150 motion-reduce:transition-none cursor-pointer',
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
  manualCopyHint = 'Clipboard unavailable. Command selected: press Ctrl+C or Cmd+C.',
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
    <div className={clsx('w-full', className)}>
      {label && <div className="mb-1.5 text-xs leading-snug font-medium text-subtle">{label}</div>}
      <div
        className={clsx(
          'flex items-center justify-between gap-3 rounded-xl border border-hairline bg-[#0D0D10] px-3.5',
          compact ? 'py-1.5' : 'py-2',
        )}
      >
        <div className="flex min-w-0 items-center gap-2.5 overflow-x-auto">
          <span aria-hidden="true" className="select-none font-mono text-xs text-subtle">$</span>
          <code
            ref={codeRef}
            className="whitespace-nowrap font-mono text-[clamp(0.78rem,0.12vw+0.75rem,0.85rem)] leading-relaxed text-ink tabular-nums"
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
            'inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-lg border px-3 py-1.5 font-mono text-xs leading-none font-medium transition-colors duration-150 motion-reduce:transition-none cursor-pointer',
            FOCUS_RING,
            copied
              ? 'border-accent/30 bg-accent/10 text-accent'
              : 'border-hairline bg-white/[0.04] text-muted hover:bg-white/[0.08] hover:text-ink',
          )}
        >
          {copied ? <Check aria-hidden="true" className="size-3.5 text-accent" /> : <Copy aria-hidden="true" className="size-3.5" />}
          <span>{copied ? copiedLabel : copyLabel}</span>
        </button>
      </div>
      <div aria-live="polite" className="sr-only">{copied ? copiedLabel : copyFailed ? manualCopyHint : ''}</div>
      {copyFailed && <div className="mt-1.5 max-w-prose text-xs leading-relaxed text-muted">{manualCopyHint}</div>}
    </div>
  )
}

export const CopyCommandBox = CopyCommandBar

export function SkeletonCard({ count = 3, className }: SkeletonCardProps) {
  return (
    <div role="status" aria-live="polite" aria-label="Loading content" className={clsx('grid gap-4 sm:grid-cols-2 lg:grid-cols-3', className)}>
      {Array.from({ length: count }, (_, idx) => (
        <div key={idx} className="rounded-xl border border-hairline bg-card p-6 animate-pulse motion-reduce:animate-none">
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
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.16, ease: 'easeOut' }}
    >
      <SurfaceCard variant="subtle" className="flex flex-col items-start gap-4 py-8">
        <div className="space-y-1.5">
          <div className="font-display text-[clamp(1.05rem,0.3vw+0.98rem,1.25rem)] leading-tight font-semibold text-ink">
            {title}
          </div>
          <div className="max-w-prose text-[clamp(0.875rem,0.12vw+0.85rem,0.95rem)] leading-relaxed text-muted">
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
    <div role="alert" className="rounded-xl border border-danger/30 bg-danger/10 p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <AlertTriangle aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-danger" />
        <div className="space-y-2">
          <div className="font-display text-[clamp(1.02rem,0.25vw+0.96rem,1.18rem)] leading-tight font-semibold text-ink">
            {title}
          </div>
          <div className="max-w-prose text-[clamp(0.875rem,0.12vw+0.85rem,0.95rem)] leading-relaxed text-muted">
            {message}
          </div>
          {retryLabel && onRetry && <ActionButton variant="secondary" onClick={onRetry}>{retryLabel}</ActionButton>}
        </div>
      </div>
    </div>
  )
}
