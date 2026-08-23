import { useMemo } from 'react'
import { BoltIcon, ClockIcon, FlameIcon, TargetIcon } from '../components/icons'
import Owl from '../components/Owl'
import Sparkline from '../components/ui/Sparkline'
import {
  Card,
  EmptyState,
  Eyebrow,
  ProgressBar,
  SectionHeading,
  StatTile,
} from '../components/ui/primitives'
import { studyStreak } from '../lib/engine/insights'
import { effectiveMastery } from '../lib/engine/mastery'
import { readinessFor, upcomingExams } from '../lib/engine/readiness'
import { formatDuration, plural, relativeDay } from '../lib/format'
import { useNav } from '../lib/nav'
import { useNow } from '../lib/useNow'
import { useAppState } from '../lib/store/context'
import { topicLabel } from '../lib/store/selectors'
import type { SessionKind } from '../lib/store/types'

const KIND_LABEL: Record<SessionKind, string> = {
  assessment: 'Level check',
  practice: 'Practice',
  flashcards: 'Flashcards',
  review: 'Review',
}

export default function ProgressScreen() {
  const state = useAppState()
  const nav = useNav()
  const now = useNow()

  const exams = useMemo(() => upcomingExams(state, now), [state, now])
  const focus = exams[0] ?? null
  const report = focus ? readinessFor(focus, state, now) : null

  const totals = useMemo(() => {
    const days = Object.values(state.days)
    return {
      minutes: days.reduce((sum, day) => sum + day.minutes, 0),
      answered: days.reduce((sum, day) => sum + day.total, 0),
      correct: days.reduce((sum, day) => sum + day.correct, 0),
      sessions: state.sessions.length,
    }
  }, [state])

  const tracked = useMemo(
    () =>
      Object.entries(state.stats)
        .map(([key, stat]) => ({
          key,
          name: topicLabel(state, key),
          mastery: effectiveMastery(stat, now),
          attempts: stat.attempts,
          lastStudiedAt: stat.lastStudiedAt,
        }))
        .filter((topic) => topic.lastStudiedAt !== null)
        .sort((a, b) => b.mastery - a.mastery),
    [state, now],
  )

  const trend = focus?.readinessHistory.map((entry) => entry.score) ?? []
  const accuracy =
    totals.answered === 0 ? 0 : Math.round((totals.correct / totals.answered) * 100)
  const streak = studyStreak(state, now)

  if (tracked.length === 0 && state.sessions.length === 0) {
    return (
      <div className="px-5 pt-6 pb-8">
        <h1 className="text-[1.8rem] leading-none font-extrabold tracking-[-0.03em] text-fg">
          Progress
        </h1>
        <div className="mt-7">
          <EmptyState
            art={<Owl expression="thinking" size={92} />}
            title="Nothing measured yet"
            body="Finish one session and this fills with your mastery per topic, your accuracy, and how readiness has moved over time."
          />
        </div>
      </div>
    )
  }

  return (
    <div className="px-5 pt-6 pb-8">
      <header className="animate-rise">
        <h1 className="text-[1.8rem] leading-none font-extrabold tracking-[-0.03em] text-fg">
          Progress
        </h1>
        <p className="mt-1.5 text-sm text-muted">
          Everything here comes from sessions you have actually finished.
        </p>
      </header>

      {focus && report && (
        <Card className="animate-rise mt-6 p-5" sheen>
          <div className="flex items-baseline justify-between gap-3">
            <div className="min-w-0">
              <Eyebrow tone="muted">Readiness · {focus.title}</Eyebrow>
              <p className="tnum mt-1.5 text-[2.4rem] leading-none font-extrabold tracking-[-0.04em] text-fg">
                {report.score}%
              </p>
            </div>
            {report.delta !== null && report.delta !== 0 && (
              <span
                className={`tnum shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                  report.delta > 0 ? 'bg-good/12 text-good' : 'bg-warn/12 text-warn'
                }`}
              >
                {report.delta > 0 ? '+' : ''}
                {report.delta} this week
              </span>
            )}
          </div>
          <div className="mt-4">
            <Sparkline values={trend} />
          </div>
        </Card>
      )}

      <section className="mt-4 grid grid-cols-2 gap-3">
        <StatTile
          label="Study time"
          value={formatDuration(totals.minutes)}
          icon={<ClockIcon className="h-3.5 w-3.5" />}
          hint={<span className="text-xs text-faint">{totals.sessions} sessions logged</span>}
        />
        <StatTile
          label="Accuracy"
          value={`${accuracy}%`}
          icon={<TargetIcon className="h-3.5 w-3.5" />}
          hint={
            <span className="text-xs text-faint">
              {totals.answered} {plural(totals.answered, 'question')} answered
            </span>
          }
        />
        <StatTile
          label="Streak"
          value={`${streak}`}
          icon={<FlameIcon className="h-3.5 w-3.5" />}
          hint={<span className="text-xs text-faint">{plural(streak, 'day')} in a row</span>}
        />
        <StatTile
          label="Topics tracked"
          value={`${tracked.length}`}
          icon={<BoltIcon className="h-3.5 w-3.5" />}
          hint={
            <span className="text-xs text-faint">
              {tracked.filter((topic) => topic.mastery >= 75).length} at mastery
            </span>
          }
        />
      </section>

      {tracked.length > 0 && (
        <section className="mt-7">
          <SectionHeading title="Mastery by topic" hint="strongest first" />
          <ul className="space-y-3">
            {tracked.map((topic) => (
              <li key={topic.key}>
                <div className="flex items-baseline justify-between gap-3">
                  <span className="min-w-0 truncate text-sm font-medium text-fg">
                    {topic.name}
                  </span>
                  <span className="tnum shrink-0 text-sm font-semibold text-fg">
                    {topic.mastery}%
                  </span>
                </div>
                <ProgressBar
                  className="mt-1.5"
                  value={topic.mastery}
                  label={`${topic.name} mastery`}
                  tone={topic.mastery >= 75 ? 'good' : topic.mastery >= 45 ? 'brand' : 'warn'}
                />
                <p className="mt-1 text-[0.7rem] text-faint">
                  {topic.attempts} answered · last studied{' '}
                  {relativeDay(topic.lastStudiedAt ?? now, now).toLowerCase()}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {state.sessions.length > 0 && (
        <section className="mt-7">
          <SectionHeading title="Recent sessions" hint="newest first" />
          <ul className="space-y-2">
            {state.sessions.slice(0, 8).map((session) => {
              const delta = session.masteryAfter - session.masteryBefore
              return (
                <li
                  key={session.id}
                  className="flex items-center gap-3 rounded-[18px] border border-line bg-card px-4 py-3"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-fg">
                      {session.label}
                    </span>
                    <span className="mt-0.5 block text-xs text-faint">
                      {KIND_LABEL[session.kind]} · {relativeDay(session.at, now)} ·{' '}
                      {formatDuration(session.minutes)}
                    </span>
                  </span>
                  <span className="shrink-0 text-right">
                    <span className="tnum block text-sm font-semibold text-fg">
                      {session.total > 0 ? `${session.correct}/${session.total}` : '—'}
                    </span>
                    {delta !== 0 && (
                      <span
                        className={`tnum block text-xs font-medium ${
                          delta > 0 ? 'text-good' : 'text-warn'
                        }`}
                      >
                        {delta > 0 ? '+' : ''}
                        {delta}% mastery
                      </span>
                    )}
                  </span>
                </li>
              )
            })}
          </ul>
        </section>
      )}

      {exams.length > 0 && (
        <button
          type="button"
          onClick={() => nav.setTab('exams')}
          className="mt-7 w-full rounded-[18px] border border-line bg-card px-4 py-3.5 text-sm font-medium text-muted transition-colors hover:border-line-strong hover:text-fg"
        >
          See all exams
        </button>
      )}
    </div>
  )
}
