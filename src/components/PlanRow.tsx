import { CheckIcon, ChevronRightIcon } from './icons'
import { MODE_LABEL, type PlanItem } from '../lib/engine/planner'
import { formatDuration } from '../lib/format'

type PlanRowProps = {
  item: PlanItem
  done: boolean
  onToggle: () => void
  onStart: () => void
}

export default function PlanRow({ item, done, onToggle, onStart }: PlanRowProps) {
  return (
    <li className="flex items-center gap-2 rounded-[18px] border border-line bg-card pr-2 pl-3 transition-colors hover:border-line-strong">
      <button
        type="button"
        aria-pressed={done}
        aria-label={done ? `Mark ${item.topicName} as not done` : `Mark ${item.topicName} as done`}
        onClick={onToggle}
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-all duration-200 ${
          done
            ? 'border-good bg-good text-ink'
            : 'border-line-strong text-transparent hover:border-muted'
        }`}
      >
        <CheckIcon className="h-3.5 w-3.5" />
      </button>

      <button
        type="button"
        onClick={onStart}
        className="flex min-w-0 flex-1 items-center gap-3 py-3.5 text-left"
      >
        <span className="min-w-0 flex-1">
          <span
            className={`block truncate text-[0.95rem] font-semibold tracking-tight ${
              done ? 'text-faint line-through' : 'text-fg'
            }`}
          >
            {item.topicName}
          </span>
          <span className="mt-0.5 block truncate text-xs text-faint">
            {MODE_LABEL[item.mode]} · {formatDuration(item.minutes)} · {item.examTitle}
          </span>
        </span>
        <ChevronRightIcon className="h-4 w-4 shrink-0 text-faint" />
      </button>
    </li>
  )
}
