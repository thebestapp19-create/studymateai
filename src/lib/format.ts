export function isoDate(date: Date = new Date()): string {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

export function isoDateInDays(days: number, from: Date = new Date()): string {
  return isoDate(new Date(from.getFullYear(), from.getMonth(), from.getDate() + days))
}

export function parseIsoDate(value: string): Date {
  const [year, month, day] = value.split('-').map(Number)
  return new Date(year, month - 1, day)
}

/** Whole days from today until the date; negative once it has passed. */
export function daysUntil(value: string, from: Date = new Date()): number {
  const target = parseIsoDate(value)
  const today = new Date(from.getFullYear(), from.getMonth(), from.getDate())
  return Math.round((target.getTime() - today.getTime()) / 86_400_000)
}

export function daysBetween(a: number, b: number): number {
  return Math.floor((b - a) / 86_400_000)
}

export function formatExamDate(value: string): string {
  return parseIsoDate(value).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

export function formatLongDate(value: string): string {
  return parseIsoDate(value).toLocaleDateString(undefined, {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

export function formatCountdown(days: number): string {
  if (days < 0) return 'passed'
  if (days === 0) return 'today'
  if (days === 1) return 'tomorrow'
  return `in ${days} days`
}

export function formatDuration(minutes: number): string {
  const rounded = Math.max(0, Math.round(minutes))
  const hours = Math.floor(rounded / 60)
  const rest = rounded % 60
  if (hours === 0) return `${rest} min`
  if (rest === 0) return `${hours}h`
  return `${hours}h ${rest}m`
}

export function plural(count: number, singular: string, pluralForm?: string): string {
  return count === 1 ? singular : (pluralForm ?? `${singular}s`)
}

export function relativeDay(timestamp: number, now: number = Date.now()): string {
  const days = daysBetween(
    new Date(timestamp).setHours(0, 0, 0, 0),
    new Date(now).setHours(0, 0, 0, 0),
  )
  if (days <= 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days} days ago`
  if (days < 14) return 'Last week'
  return new Date(timestamp).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  })
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

export function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] ?? name
}
