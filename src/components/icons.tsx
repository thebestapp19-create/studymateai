type IconProps = {
  className?: string
}

const base = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.7,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  viewBox: '0 0 24 24',
  'aria-hidden': true,
}

export function UserIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M4.5 19.5a7.5 7.5 0 0 1 15 0" />
    </svg>
  )
}

export function SparkleIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M12 3.5 13.7 9l5.5 1.7-5.5 1.7L12 18l-1.7-5.6L4.8 10.7 10.3 9 12 3.5Z" />
      <path d="M18.5 15.5 19.2 18l2.3.8-2.3.7-.7 2.5-.7-2.5-2.3-.7 2.3-.8.7-2.5Z" />
    </svg>
  )
}

export function HomeIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1v-9.5Z" />
    </svg>
  )
}

export function BookIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M3 5.5A1.5 1.5 0 0 1 4.5 4H10a2 2 0 0 1 2 2v13a2 2 0 0 0-2-2H4.5A1.5 1.5 0 0 1 3 15.5v-10Z" />
      <path d="M21 5.5A1.5 1.5 0 0 0 19.5 4H14a2 2 0 0 0-2 2v13a2 2 0 0 1 2-2h5.5a1.5 1.5 0 0 0 1.5-1.5v-10Z" />
    </svg>
  )
}

export function ProgressIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M3 16.5 8 11l3.5 3.5L20 6" />
      <path d="M15.5 6H20v4.5" />
    </svg>
  )
}

export function ClockIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 1.8" />
    </svg>
  )
}

export function PlusIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}

export function ArrowRightIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  )
}

export function ArrowLeftIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M19 12H5M11 18l-6-6 6-6" />
    </svg>
  )
}

export function ArrowUpIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M12 19V5M6 11l6-6 6 6" />
    </svg>
  )
}

export function CheckIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className} strokeWidth={2.4}>
      <path d="M5 12.5 10 17l9-10" />
    </svg>
  )
}

export function XIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className} strokeWidth={2}>
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  )
}

export function TargetIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="4.5" />
      <circle cx="12" cy="12" r="1" />
    </svg>
  )
}

export function CalendarIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" />
      <path d="M3.5 9.5h17M8 3.5V6M16 3.5V6" />
    </svg>
  )
}

export function LayersIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M12 3.5 21 8l-9 4.5L3 8l9-4.5Z" />
      <path d="M3.8 12.2 12 16.4l8.2-4.2M3.8 16.2 12 20.4l8.2-4.2" />
    </svg>
  )
}

export function BoltIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M13.5 3 5 13.5h5.5L10 21l8.5-10.5H13L13.5 3Z" />
    </svg>
  )
}

export function FlameIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M12 3.5s5 3.9 5 8.6a5 5 0 0 1-10 0c0-1.7.7-3 1.6-4.1.3 1.2 1 2 1.9 2.3 0-2.7.7-5.1 1.5-6.8Z" />
    </svg>
  )
}

export function ChevronRightIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M9.5 5.5 16 12l-6.5 6.5" />
    </svg>
  )
}

export function ChevronLeftIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M14.5 5.5 8 12l6.5 6.5" />
    </svg>
  )
}

export function BrainIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M9.5 4.2A2.7 2.7 0 0 0 6.8 7a2.6 2.6 0 0 0-1.6 4.4A2.8 2.8 0 0 0 6.6 16a2.7 2.7 0 0 0 2.9 2.4c.9 0 1.7-.4 2.2-1V4.9a2.7 2.7 0 0 0-2.2-.7Z" />
      <path d="M14.5 4.2A2.7 2.7 0 0 1 17.2 7a2.6 2.6 0 0 1 1.6 4.4A2.8 2.8 0 0 1 17.4 16a2.7 2.7 0 0 1-2.9 2.4c-.9 0-1.7-.4-2.2-1" />
    </svg>
  )
}

export function TrashIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M4.5 6.5h15M9.5 6.5V4.8a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v1.7M7 6.5l.8 12a1.5 1.5 0 0 0 1.5 1.4h5.4a1.5 1.5 0 0 0 1.5-1.4l.8-12" />
    </svg>
  )
}

export function PencilIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M4.5 19.5h3l10-10a2.1 2.1 0 0 0-3-3l-10 10v3Z" />
      <path d="M13.5 6.5l3 3" />
    </svg>
  )
}

export function PlayIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M7.5 5.2 18 12 7.5 18.8V5.2Z" />
    </svg>
  )
}

export function ShieldIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M12 3.5 19 6v6c0 4-3 7-7 8.5C8 19 5 16 5 12V6l7-2.5Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  )
}
