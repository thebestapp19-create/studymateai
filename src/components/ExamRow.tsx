import { ChevronRightIcon } from './icons'
import { ProgressBar, SubjectMark } from './ui/primitives'
import { subjectById } from '../lib/curriculum'
import { daysUntil, formatCountdown, formatExamDate } from '../lib/format'
import type { Exam } from '../lib/store/types'

type ExamRowProps = {
  exam: Exam
  readiness: number
  onOpen: () => void
}

export default function ExamRow({ exam, readiness, onOpen }: ExamRowProps) {
  const days = daysUntil(exam.date)
  const subject = subjectById(exam.subjectId)
  const urgent = days <= 7

  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex w-full items-center gap-3 rounded-[18px] border border-line bg-card px-3.5 py-3.5 text-left transition-colors hover:border-line-strong"
    >
      <SubjectMark name={subject?.name ?? exam.title} />
      <span className="min-w-0 flex-1">
        <span className="flex items-baseline justify-between gap-2">
          <span className="truncate text-[0.95rem] font-semibold tracking-tight text-fg">
            {exam.title}
          </span>
          <span className="tnum shrink-0 text-sm font-semibold text-fg">{readiness}%</span>
        </span>
        <span className="mt-1 flex items-baseline justify-between gap-2">
          <span className={`truncate text-xs ${urgent ? 'text-warn' : 'text-faint'}`}>
            {formatExamDate(exam.date)} · {formatCountdown(days)}
          </span>
          <span className="shrink-0 text-[0.7rem] text-faint">ready</span>
        </span>
        <ProgressBar
          className="mt-2"
          value={readiness}
          label={`${exam.title} readiness`}
          tone={readiness >= 75 ? 'good' : readiness >= 45 ? 'brand' : 'warn'}
        />
      </span>
      <ChevronRightIcon className="h-4 w-4 shrink-0 text-faint" />
    </button>
  )
}
