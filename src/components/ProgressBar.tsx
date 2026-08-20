type ProgressBarProps = {
  value: number
  label: string
  className?: string
}

export default function ProgressBar({
  value,
  label,
  className = '',
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, Math.round(value)))

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      className={`h-1.5 w-full overflow-hidden rounded-full bg-line ${className}`}
    >
      <div
        className="h-full rounded-full bg-brand transition-[width] duration-500"
        style={{ width: `${clamped}%` }}
      />
    </div>
  )
}
