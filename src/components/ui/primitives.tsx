import type { ButtonHTMLAttributes, ReactNode } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'quiet' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg'

const VARIANT: Record<ButtonVariant, string> = {
  primary:
    'bg-brand text-white shadow-[0_10px_30px_-12px_rgba(59,130,246,0.9)] hover:bg-brand-strong disabled:bg-raised disabled:text-faint disabled:shadow-none',
  secondary:
    'bg-raised text-fg border border-line hover:border-line-strong disabled:text-faint',
  ghost: 'text-muted hover:text-fg',
  quiet: 'bg-white/[0.04] text-fg hover:bg-white/[0.07]',
  danger: 'bg-risk/12 text-risk border border-risk/25 hover:bg-risk/20',
}

const SIZE: Record<ButtonSize, string> = {
  sm: 'px-3.5 py-2 text-sm gap-1.5',
  md: 'px-5 py-3 text-[0.95rem] gap-2',
  lg: 'px-6 py-4 text-base gap-2',
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  size?: ButtonSize
  full?: boolean
}

export function Button({
  variant = 'primary',
  size = 'md',
  full = false,
  className = '',
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      {...rest}
      className={`inline-flex items-center justify-center rounded-full font-semibold tracking-tight transition-all duration-200 active:scale-[0.985] disabled:cursor-not-allowed disabled:active:scale-100 ${VARIANT[variant]} ${SIZE[size]} ${full ? 'w-full' : ''} ${className}`}
    >
      {children}
    </button>
  )
}

export function Card({
  children,
  className = '',
  sheen = false,
  as: Tag = 'div',
}: {
  children: ReactNode
  className?: string
  sheen?: boolean
  as?: 'div' | 'section' | 'article' | 'li'
}) {
  return (
    <Tag
      className={`rounded-[20px] border border-line bg-card ${sheen ? 'card-sheen' : ''} ${className}`}
    >
      {children}
    </Tag>
  )
}

export function SectionHeading({
  title,
  hint,
  action,
}: {
  title: string
  hint?: string
  action?: ReactNode
}) {
  return (
    <div className="mb-3 flex items-end justify-between gap-3">
      <div className="min-w-0">
        <h2 className="text-[0.95rem] font-semibold tracking-tight text-fg">{title}</h2>
        {hint && <p className="mt-0.5 truncate text-xs text-faint">{hint}</p>}
      </div>
      {action}
    </div>
  )
}

export function Eyebrow({ children, tone = 'brand' }: { children: ReactNode; tone?: 'brand' | 'muted' }) {
  return (
    <p
      className={`text-[0.68rem] font-semibold tracking-[0.14em] uppercase ${
        tone === 'brand' ? 'text-brand' : 'text-faint'
      }`}
    >
      {children}
    </p>
  )
}

export function Chip({
  children,
  selected = false,
  onClick,
  className = '',
}: {
  children: ReactNode
  selected?: boolean
  onClick?: () => void
  className?: string
}) {
  const style = selected
    ? 'border-brand/60 bg-brand/15 text-brand'
    : 'border-line bg-raised text-muted hover:border-line-strong hover:text-fg'

  if (!onClick) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[0.8rem] font-medium ${style} ${className}`}
      >
        {children}
      </span>
    )
  }

  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-[0.83rem] font-medium transition-colors ${style} ${className}`}
    >
      {children}
    </button>
  )
}

export function ProgressBar({
  value,
  label,
  className = '',
  tone = 'brand',
  thick = false,
}: {
  value: number
  label: string
  className?: string
  tone?: 'brand' | 'good' | 'warn' | 'risk'
  thick?: boolean
}) {
  const clamped = Math.min(100, Math.max(0, Math.round(value)))
  const fill = {
    brand: 'bg-brand',
    good: 'bg-good',
    warn: 'bg-warn',
    risk: 'bg-risk',
  }[tone]

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      className={`w-full overflow-hidden rounded-full bg-white/[0.07] ${thick ? 'h-2' : 'h-1.5'} ${className}`}
    >
      <div
        className={`h-full rounded-full ${fill} transition-[width] duration-700 ease-out`}
        style={{ width: `${clamped}%` }}
      />
    </div>
  )
}

export function StatTile({
  label,
  value,
  hint,
  icon,
  className = '',
}: {
  label: string
  value: ReactNode
  hint?: ReactNode
  icon?: ReactNode
  className?: string
}) {
  return (
    <div className={`rounded-[18px] border border-line bg-card px-4 py-3.5 ${className}`}>
      <p className="flex items-center gap-1.5 text-[0.72rem] font-medium tracking-wide text-faint uppercase">
        {icon}
        {label}
      </p>
      <p className="tnum mt-1.5 text-[1.65rem] leading-none font-bold tracking-tight text-fg">
        {value}
      </p>
      {hint && <div className="mt-1.5 text-xs text-muted">{hint}</div>}
    </div>
  )
}

export function EmptyState({
  icon,
  title,
  body,
  action,
}: {
  icon: ReactNode
  title: string
  body: string
  action?: ReactNode
}) {
  return (
    <Card className="px-6 py-8 text-center" sheen>
      <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brand/12 text-brand">
        {icon}
      </span>
      <h3 className="mt-4 text-lg font-bold tracking-tight text-fg">{title}</h3>
      <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-muted">{body}</p>
      {action && <div className="mt-5">{action}</div>}
    </Card>
  )
}

export function Toast({ message }: { message: string }) {
  return (
    <div
      role="status"
      className="pointer-events-none fixed inset-x-0 bottom-24 z-50 flex justify-center px-6"
    >
      <div className="animate-pop rounded-full border border-line-strong bg-raised/95 px-4 py-2.5 text-sm font-medium text-fg shadow-2xl backdrop-blur">
        {message}
      </div>
    </div>
  )
}

/** Subject monogram — quieter and more consistent than a pile of icons. */
export function SubjectMark({
  name,
  size = 'md',
  active = false,
}: {
  name: string
  size?: 'sm' | 'md'
  active?: boolean
}) {
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase()

  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-xl border font-bold tracking-tight ${
        active
          ? 'border-brand/40 bg-brand/15 text-brand'
          : 'border-line bg-raised text-muted'
      } ${size === 'sm' ? 'h-8 w-8 text-[0.7rem]' : 'h-11 w-11 text-sm'}`}
    >
      {initials}
    </span>
  )
}
