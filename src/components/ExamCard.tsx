import ProgressBar from './ProgressBar'
import { daysUntil, formatExamDate, type Exam } from '../lib/studyData'

type ExamCardProps = {
  exam: Exam
  /** The exam to focus on first gets the stronger treatment. */
  focus?: boolean
}

function urgencyColor(days: number): string {
  if (days <= 7) return 'text-red-400'
  if (days <= 21) return 'text-accent'
  return 'text-muted'
}

export default function ExamCard({ exam, focus = false }: ExamCardProps) {
  const days = daysUntil(exam.date)
  const daysLabel =
    days === 0 ? 'today' : days === 1 ? '1 day left' : `${days} days left`

  return (
    <article
      className={`rounded-2xl border p-5 ${
        focus
          ? 'border-brand/50 bg-brand/[0.07]'
          : 'border-line bg-card'
      }`}
    >
      {focus && (
        <p className="mb-2 text-xs font-semibold tracking-wide text-brand uppercase">
          Focus first
        </p>
      )}

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3
            className={`truncate font-bold tracking-tight text-fg ${
              focus ? 'text-2xl' : 'text-xl'
            }`}
          >
            {exam.subject}
          </h3>
          <p className="mt-1 text-sm text-muted">
            {formatExamDate(exam.date)}{' '}
            <span className={urgencyColor(days)}>({daysLabel})</span>
          </p>
        </div>
        <span className="shrink-0 rounded-full border border-line bg-surface px-3 py-1 text-xs font-medium text-muted">
          {exam.category}
        </span>
      </div>

      <div className="mt-5 flex items-baseline justify-between">
        <span className="text-sm text-muted">Ready</span>
        <span className="text-lg font-bold text-brand">{exam.readiness}%</span>
      </div>
      <ProgressBar
        className="mt-2"
        value={exam.readiness}
        label={`${exam.subject} readiness`}
      />
    </article>
  )
}
