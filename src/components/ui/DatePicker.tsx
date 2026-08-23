import { useMemo, useState } from 'react'
import { ChevronLeftIcon, ChevronRightIcon } from '../icons'
import { daysUntil, isoDate, isoDateInDays, parseIsoDate } from '../../lib/format'

const WEEKDAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

type DatePickerProps = {
  value: string | null
  onChange: (value: string) => void
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

/** Days shown in the grid, padded so the 1st lands on the right weekday. */
function monthGrid(month: Date): (string | null)[] {
  const first = startOfMonth(month)
  const offset = (first.getDay() + 6) % 7
  const total = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()

  const cells: (string | null)[] = Array.from({ length: offset }, () => null)
  for (let day = 1; day <= total; day += 1) {
    cells.push(isoDate(new Date(month.getFullYear(), month.getMonth(), day)))
  }
  return cells
}

const QUICK_PICKS = [
  { label: 'In 1 week', days: 7 },
  { label: 'In 2 weeks', days: 14 },
  { label: 'In a month', days: 30 },
]

export default function DatePicker({ value, onChange }: DatePickerProps) {
  const today = useMemo(() => new Date(), [])
  const [month, setMonth] = useState(() =>
    startOfMonth(value ? parseIsoDate(value) : today),
  )

  const cells = useMemo(() => monthGrid(month), [month])
  const canGoBack =
    month.getFullYear() > today.getFullYear() ||
    (month.getFullYear() === today.getFullYear() && month.getMonth() > today.getMonth())

  const shift = (delta: number) =>
    setMonth((current) => new Date(current.getFullYear(), current.getMonth() + delta, 1))

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {QUICK_PICKS.map((pick) => {
          const iso = isoDateInDays(pick.days, today)
          const selected = value === iso
          return (
            <button
              key={pick.label}
              type="button"
              onClick={() => {
                onChange(iso)
                setMonth(startOfMonth(parseIsoDate(iso)))
              }}
              className={`rounded-full border px-3.5 py-2 text-[0.82rem] font-medium transition-colors ${
                selected
                  ? 'border-brand/60 bg-brand/15 text-brand'
                  : 'border-line bg-raised text-muted hover:border-line-strong hover:text-fg'
              }`}
            >
              {pick.label}
            </button>
          )
        })}
      </div>

      <div className="mt-4 rounded-[18px] border border-line bg-card p-3">
        <div className="flex items-center justify-between px-1 pb-2">
          <button
            type="button"
            aria-label="Previous month"
            disabled={!canGoBack}
            onClick={() => shift(-1)}
            className="flex h-8 w-8 items-center justify-center rounded-full text-muted transition-colors hover:bg-white/[0.06] hover:text-fg disabled:opacity-30 disabled:hover:bg-transparent"
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </button>
          <p className="text-sm font-semibold tracking-tight text-fg">
            {month.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
          </p>
          <button
            type="button"
            aria-label="Next month"
            onClick={() => shift(1)}
            className="flex h-8 w-8 items-center justify-center rounded-full text-muted transition-colors hover:bg-white/[0.06] hover:text-fg"
          >
            <ChevronRightIcon className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center">
          {WEEKDAYS.map((day, index) => (
            <span key={`${day}-${index}`} className="py-1 text-[0.68rem] font-medium text-faint">
              {day}
            </span>
          ))}

          {cells.map((iso, index) => {
            if (!iso) return <span key={`pad-${index}`} />
            const offset = daysUntil(iso, today)
            const disabled = offset < 0
            const selected = iso === value
            const isToday = offset === 0

            return (
              <button
                key={iso}
                type="button"
                disabled={disabled}
                aria-pressed={selected}
                onClick={() => onChange(iso)}
                className={`tnum flex h-9 items-center justify-center rounded-xl text-sm font-medium transition-all duration-150 ${
                  selected
                    ? 'bg-brand text-white shadow-[0_6px_18px_-8px_rgba(59,130,246,0.9)]'
                    : disabled
                      ? 'text-faint/40'
                      : isToday
                        ? 'bg-white/[0.06] text-fg ring-1 ring-line-strong'
                        : 'text-muted hover:bg-white/[0.06] hover:text-fg'
                }`}
              >
                {parseIsoDate(iso).getDate()}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
