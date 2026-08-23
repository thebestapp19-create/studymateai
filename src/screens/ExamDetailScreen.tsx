import { useMemo, useState } from 'react'
import {
  BrainIcon,
  CalendarIcon,
  LayersIcon,
  PlayIcon,
  TargetIcon,
  TrashIcon,
} from '../components/icons'
import DatePicker from '../components/ui/DatePicker'
import OverlayShell from '../components/ui/OverlayShell'
import ReadinessRing from '../components/ui/ReadinessRing'
import Sheet from '../components/ui/Sheet'
import {
  Button,
  Card,
  Chip,
  Eyebrow,
  ProgressBar,
  SectionHeading,
} from '../components/ui/primitives'
import { gradeById, subjectById } from '../lib/curriculum'
import { MascotNote } from '../components/Mascot'
import { examInsight } from '../lib/engine/insights'
import { examMoment } from '../lib/engine/mascot'
import { readinessFor, type TopicReadiness } from '../lib/engine/readiness'
import { cardScore, statFor } from '../lib/engine/mastery'
import type { AppState } from '../lib/store/types'
import { formatCountdown, formatLongDate, plural } from '../lib/format'
import { useNav } from '../lib/nav'
import { useAppState, useDispatch } from '../lib/store/context'

const STATUS_LABEL: Record<TopicReadiness['status'], string> = {
  untouched: 'Not started',
  weak: 'Weak',
  building: 'Building',
  strong: 'Strong',
}

const STATUS_TONE: Record<TopicReadiness['status'], string> = {
  untouched: 'text-faint',
  weak: 'text-risk',
  building: 'text-warn',
  strong: 'text-good',
}

/** What the mastery number is actually based on, in plain words. */
function evidenceLabel(state: AppState, topic: TopicReadiness): string {
  if (topic.custom) return 'your own topic'
  const stat = statFor(state.stats, topic.key)
  const cards = cardScore(stat.cards).rated
  const parts: string[] = []
  if (stat.attempts > 0) parts.push(`${stat.attempts} ${plural(stat.attempts, 'question')}`)
  if (cards > 0) parts.push(`${cards} ${plural(cards, 'card')}`)
  return parts.length === 0 ? 'nothing answered yet' : `${parts.join(' · ')} answered`
}

export default function ExamDetailScreen({ examId }: { examId: string }) {
  const nav = useNav()
  const state = useAppState()
  const dispatch = useDispatch()

  const exam = state.exams.find((candidate) => candidate.id === examId) ?? null
  const [sheet, setSheet] = useState<'date' | 'delete' | null>(null)
  const [topicSheet, setTopicSheet] = useState<TopicReadiness | null>(null)

  const report = useMemo(
    () => (exam ? readinessFor(exam, state) : null),
    [exam, state],
  )

  if (!exam || !report) {
    return (
      <OverlayShell title="Exam" onClose={nav.close}>
        <Card className="p-6 text-center">
          <p className="text-sm text-muted">This exam no longer exists.</p>
          <Button className="mt-4" onClick={nav.close}>
            Back
          </Button>
        </Card>
      </OverlayShell>
    )
  }

  const subject = subjectById(exam.subjectId)
  const grade = gradeById(exam.gradeId)
  const insight = examInsight(exam, report)
  const moment = examMoment(report)
  const sorted = [...report.topics].sort((a, b) => a.mastery - b.mastery)

  return (
    <OverlayShell
      title={exam.title}
      subtitle={`${subject?.name ?? ''}${grade ? ` · ${grade.label}` : ''}`}
      onClose={nav.close}
      footer={
        <Button
          full
          size="lg"
          onClick={() =>
            nav.startSession(
              exam.assessedAt
                ? {
                    mode: 'practice',
                    examId: exam.id,
                    subjectId: exam.subjectId,
                    topicKey: sorted[0]?.key,
                    topicName: sorted[0]?.name,
                  }
                : { mode: 'assessment', examId: exam.id, subjectId: exam.subjectId },
            )
          }
        >
          {exam.assessedAt ? (
            <>
              <PlayIcon className="h-4 w-4" />
              Study {sorted[0]?.name ?? 'next topic'}
            </>
          ) : (
            <>
              <BrainIcon className="h-4.5 w-4.5" />
              Take the level check
            </>
          )}
        </Button>
      }
    >
      <section className="animate-rise flex flex-col items-center">
        <button
          type="button"
          onClick={() => setSheet('date')}
          className="flex items-center gap-2 rounded-full border border-line bg-card px-3.5 py-1.5 text-xs font-medium text-muted transition-colors hover:border-line-strong hover:text-fg"
        >
          <CalendarIcon className="h-3.5 w-3.5" />
          {formatLongDate(exam.date)}
          <span className="h-1 w-1 rounded-full bg-line-strong" />
          <span className={report.daysLeft <= 7 ? 'text-warn' : ''}>
            {formatCountdown(report.daysLeft)}
          </span>
        </button>

        <div className="mt-4">
          <ReadinessRing value={report.score} size={168} caption="ready" />
        </div>
      </section>

      {moment && <MascotNote moment={moment} className="animate-rise mt-5" />}

      <Card className="animate-rise mt-4 p-5" sheen>
        <p className="text-[1.02rem] leading-snug font-bold tracking-tight text-fg">
          {insight.headline}
        </p>
        <p className="mt-1.5 text-sm leading-relaxed text-muted">{insight.body}</p>

        {report.opportunity && report.opportunity.gain > 0 && (
          <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-brand/25 bg-brand/[0.08] px-3.5 py-3">
            <div className="min-w-0">
              <p className="text-xs font-semibold tracking-wide text-brand uppercase">
                Biggest opportunity
              </p>
              <p className="mt-1 text-sm text-fg">{report.opportunity.action}</p>
            </div>
            <span className="tnum shrink-0 text-sm font-bold text-brand">
              +{report.opportunity.gain}%
            </span>
          </div>
        )}
      </Card>

      <section className="mt-6">
        <SectionHeading
          title="Topics"
          hint={`${report.topics.length} tracked · ${report.untouched.length} not started`}
        />
        <ul className="space-y-2">
          {sorted.map((topic) => (
            <li key={topic.key}>
              <button
                type="button"
                onClick={() => setTopicSheet(topic)}
                className="w-full rounded-[18px] border border-line bg-card px-4 py-3.5 text-left transition-colors hover:border-line-strong"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <span className="min-w-0 truncate text-[0.95rem] font-semibold tracking-tight text-fg">
                    {topic.name}
                  </span>
                  <span className="tnum shrink-0 text-sm font-semibold text-fg">
                    {topic.mastery}%
                  </span>
                </div>
                <ProgressBar
                  className="mt-2"
                  value={topic.mastery}
                  label={`${topic.name} mastery`}
                  tone={
                    topic.status === 'strong'
                      ? 'good'
                      : topic.status === 'building'
                        ? 'brand'
                        : topic.status === 'weak'
                          ? 'risk'
                          : 'warn'
                  }
                />
                <div className="mt-2 flex items-center justify-between text-xs">
                  <span className={STATUS_TONE[topic.status]}>{STATUS_LABEL[topic.status]}</span>
                  <span className="text-faint">{evidenceLabel(state, topic)}</span>
                </div>
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-6">
        <SectionHeading title="Exam settings" />
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => setSheet('date')}
            className="flex w-full items-center gap-3 rounded-[18px] border border-line bg-card px-4 py-3.5 text-left transition-colors hover:border-line-strong"
          >
            <CalendarIcon className="h-4 w-4 text-muted" />
            <span className="flex-1 text-sm font-medium text-fg">Change exam date</span>
            <span className="text-xs text-faint">{formatLongDate(exam.date)}</span>
          </button>
          <button
            type="button"
            onClick={() => setSheet('delete')}
            className="flex w-full items-center gap-3 rounded-[18px] border border-line bg-card px-4 py-3.5 text-left transition-colors hover:border-risk/40"
          >
            <TrashIcon className="h-4 w-4 text-risk" />
            <span className="flex-1 text-sm font-medium text-risk">Delete this exam</span>
          </button>
        </div>
      </section>

      {sheet === 'date' && (
        <Sheet title="Exam date" onClose={() => setSheet(null)}>
          <DatePicker
            value={exam.date}
            onChange={(date) => {
              dispatch({ type: 'updateExam', examId: exam.id, patch: { date } })
              setSheet(null)
              nav.toast('Date updated — your plan has been rescheduled')
            }}
          />
        </Sheet>
      )}

      {sheet === 'delete' && (
        <Sheet
          title="Delete exam"
          onClose={() => setSheet(null)}
          footer={
            <div className="flex gap-2">
              <Button variant="secondary" className="flex-1" onClick={() => setSheet(null)}>
                Keep it
              </Button>
              <Button
                variant="danger"
                className="flex-1"
                onClick={() => {
                  dispatch({ type: 'deleteExam', examId: exam.id })
                  nav.close()
                  nav.toast('Exam deleted')
                }}
              >
                Delete
              </Button>
            </div>
          }
        >
          <p className="text-sm leading-relaxed text-muted">
            {exam.title} will be removed along with its countdown and readiness history.
            What you have learned stays — topic mastery is kept for any other exam that
            covers it.
          </p>
        </Sheet>
      )}

      {topicSheet && (
        <Sheet title={topicSheet.name} onClose={() => setTopicSheet(null)}>
          <div className="flex items-baseline justify-between">
            <span className="text-sm text-muted">Mastery</span>
            <span className="tnum text-2xl font-bold text-fg">{topicSheet.mastery}%</span>
          </div>
          <ProgressBar
            className="mt-2"
            thick
            value={topicSheet.mastery}
            label={`${topicSheet.name} mastery`}
            tone={
              topicSheet.status === 'strong'
                ? 'good'
                : topicSheet.status === 'building'
                  ? 'brand'
                  : 'warn'
            }
          />
          <div className="mt-3 flex flex-wrap gap-2">
            <Chip>{STATUS_LABEL[topicSheet.status]}</Chip>
            <Chip>{topicSheet.attempts} answered</Chip>
            {topicSheet.confidence < 0.6 && <Chip>Low evidence</Chip>}
          </div>

          <div className="mt-5">
            <Eyebrow tone="muted">Study this topic</Eyebrow>
            <div className="mt-3 space-y-2">
              {(topicSheet.custom
                ? ([{ mode: 'review', label: 'Timed self-study', icon: <TargetIcon className="h-4 w-4" /> }] as const)
                : ([
                    {
                      mode: 'flashcards',
                      label: 'Flashcards',
                      icon: <LayersIcon className="h-4 w-4" />,
                    },
                    {
                      mode: 'practice',
                      label: 'Practice questions',
                      icon: <TargetIcon className="h-4 w-4" />,
                    },
                  ] as const)
              ).map((option) => (
                <button
                  key={option.mode}
                  type="button"
                  onClick={() => {
                    setTopicSheet(null)
                    nav.startSession({
                      mode: option.mode,
                      examId: exam.id,
                      subjectId: exam.subjectId,
                      topicKey: topicSheet.key,
                      topicName: topicSheet.name,
                    })
                  }}
                  className="flex w-full items-center gap-3 rounded-2xl border border-line bg-card px-4 py-3.5 text-left transition-colors hover:border-brand/40"
                >
                  <span className="text-brand">{option.icon}</span>
                  <span className="flex-1 text-sm font-semibold text-fg">{option.label}</span>
                  <PlayIcon className="h-3.5 w-3.5 text-faint" />
                </button>
              ))}
            </div>
          </div>
        </Sheet>
      )}
    </OverlayShell>
  )
}
