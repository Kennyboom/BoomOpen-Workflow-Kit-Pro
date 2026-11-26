import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { clsx } from 'clsx'
import { AlertTriangle, Check, Copy, RotateCcw, Search, X } from 'lucide-react'
import { useCopyCommand } from '../../hooks/useCopyCommand'
import type {
  ActionLinkProps, BadgeProps, BadgeTone, ButtonProps, ButtonVariant, CopyCommandBarProps,
  EmptyCatalogStateProps, FilterPillProps, InlineErrorStateProps, SearchInputProps,
  SkeletonCardProps, SurfaceVariant, SurfaceCardProps,
} from '../../types/ui-contract'

/** Flagship Studio Daylight 5-State UI Primitives across 1,462 skills. */
const FOCUS_RING =
  'outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-canvas'

const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
  primary:
    'bg-primary text-primary-ink border border-primary hover:bg-primary-hover rounded-full font-semibold shadow-[0_8px_22px_-6px_rgba(9,9,11,0.28)]',
  secondary:
    'bg-white text-ink border border-slate-200/90 hover:bg-slate-50 hover:border-slate-300 rounded-full font-semibold shadow-2xs',
  ghost:
    'bg-transparent text-muted border border-transparent hover:text-ink hover:bg-slate-900/[0.04] rounded-full font-medium',
  terminal:
    'bg-[#0F172A] text-slate-100 border border-slate-800 hover:bg-slate-800 rounded-xl font-mono font-medium shadow-[0_10px_24px_-8px_rgba(15,23,42,0.22)]',
}

const BADGE_TONES: Record<BadgeTone, string> = {
  neutral: 'bg-slate-100 text-slate-600 border-slate-200/80',
  amber: 'bg-amber-50 text-amber-800 border-amber-200/80',
  emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
  cobalt: 'bg-blue-50 text-blue-700 border-blue-200/80',
  danger: 'bg-red-50 text-red-700 border-red-200/80',
}

const SURFACE_VARIANTS: Record<SurfaceVariant, string> = {
  default: 'specular-surface',
  elevated: 'specular-surface-elevated',
  interactive:
    'specular-surface transition-all duration-200 motion-reduce:transition-none hover:border-slate-300/90 hover:shadow-[0_2px_4px_rgba(15,23,42,0.04),0_20px_40px_-12px_rgba(15,23,42,0.10)] hover:-translate-y-0.5 motion-reduce:hover:translate-y-0',
  subtle: 'bg-elevated/85 border border-slate-200/80 shadow-2xs',
}

const BUTTON_BASE = clsx(
  'inline-flex min-h-12 items-center justify-center gap-2.5 px-6 py-3 text-[15px] sm:text-base leading-snug transition-all duration-150 motion-reduce:transition-none',
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
        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[13px] leading-snug font-medium tabular-nums',
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
        'inline-flex min-h-11 items-center gap-2.5 rounded-full border px-4 py-2.5 text-[14px] sm:text-[15px] leading-snug transition-all duration-150 motion-reduce:transition-none disabled:pointer-events-none disabled:opacity-40 cursor-pointer',
        FOCUS_RING,
        active
          ? 'bg-[#09090B] text-white border-[#09090B] shadow-xs font-semibold'
          : 'bg-white text-slate-600 border-slate-200/90 hover:text-slate-950 hover:border-slate-300 font-medium',
      )}
    >
      <span>{label}</span>
      {typeof count === 'number' && (
        <span
          className={clsx(
            'rounded-full px-2 py-0.5 font-mono text-xs leading-none tabular-nums',
            active ? 'bg-white/18 text-white font-semibold' : 'bg-slate-100 text-slate-600',
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
        <Search aria-hidden="true" className="pointer-events-none absolute left-4 size-5 text-slate-400" />
        <input
          id={id}
          type="search"
          value={value}
          aria-label={label}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          className={clsx(
            'min-h-13 w-full rounded-2xl border border-slate-200/90 bg-white pl-12 pr-12 py-3.5 text-base leading-normal font-normal text-slate-950 shadow-2xs transition-colors duration-150 motion-reduce:transition-none hover:border-slate-300 focus:border-blue-500',
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
              'absolute right-1.5 inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors duration-150 motion-reduce:transition-none cursor-pointer',
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
          'flex items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-[#0F172A] px-4 sm:px-5 shadow-[0_12px_28px_-10px_rgba(15,23,42,0.18)]',
          compact ? 'py-2.5' : 'py-3',
        )}
      >
        <div className="scrollbar-none flex min-w-0 items-center gap-3 overflow-x-auto py-0.5">
          <span aria-hidden="true" className="select-none font-mono text-sm font-semibold text-sky-400">$</span>
          <code
            ref={codeRef}
            className="whitespace-nowrap font-mono text-[14px] sm:text-[15px] leading-relaxed text-slate-100 tabular-nums"
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
            'inline-flex min-h-11 shrink-0 items-center gap-2 rounded-xl border px-4 py-2 font-mono text-[13px] leading-none font-medium transition-all duration-150 motion-reduce:transition-none cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0F172A]',
            copied
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30'
              : 'bg-white/10 text-slate-100 border-white/15 hover:bg-white/20',
          )}
        >
          {copied ? <Check aria-hidden="true" className="size-4 text-emerald-300" /> : <Copy aria-hidden="true" className="size-4" />}
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
        <div key={idx} className="rounded-3xl specular-surface p-7 sm:p-8 animate-pulse motion-reduce:animate-none">
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
    <div role="alert" className="rounded-3xl border border-red-200/90 bg-red-50/80 p-7 sm:p-8">
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
