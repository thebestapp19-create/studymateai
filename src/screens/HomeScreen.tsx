import { useMemo } from 'react'
import ExamRow from '../components/ExamRow'
import NextStepCard from '../components/NextStepCard'
import PlanRow from '../components/PlanRow'
import {
  ArrowUpIcon,
  BrainIcon,
  ClockIcon,
  FlameIcon,
  PlusIcon,
  TargetIcon,
} from '../components/icons'
import ReadinessRing from '../components/ui/ReadinessRing'
import {
  Button,
  Card,
  EmptyState,
  Eyebrow,
  ProgressBar,
  SectionHeading,
  StatTile,
} from '../components/ui/primitives'
import { examInsight, studyStreak } from '../lib/engine/insights'
import { buildDailyPlan, type PlanItem } from '../lib/engine/planner'
import { readinessFor, upcomingExams } from '../lib/engine/readiness'
import { statFor } from '../lib/engine/mastery'
import { formatCountdown, formatDuration, firstName, plural } from '../lib/format'
import { useNav } from '../lib/nav'
import { getDailyQuote } from '../lib/quotes'
import { useDispatch, useAppState } from '../lib/store/context'
import { useNow } from '../lib/useNow'
import { isPlanItemDone, minutesToday } from '../lib/store/selectors'

function greeting(date: Date): string {
  const hour = date.getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

const TONE_DOT: Record<string, string> = {
  good: 'bg-good',
  warn: 'bg-warn',
  risk: 'bg-risk',
  neutral: 'bg-line-strong',
}

export default function HomeScreen() {
  const state = useAppState()
  const dispatch = useDispatch()
  const nav = useNav()

  const now = useNow()
  const quote = useMemo(() => getDailyQuote(), [])
  const name = firstName(state.profile.name)

  const exams = useMemo(() => upcomingExams(state, now), [state, now])
  const focus = exams[0] ?? null
  const report = useMemo(
    () => (focus ? readinessFor(focus, state, now) : null),
    [focus, state, now],
  )
  const plan = useMemo(() => buildDailyPlan(state, now), [state, now])
  const insight = focus && report ? examInsight(focus, report) : null

  const studied = minutesToday(state, now)
  const goal = state.profile.dailyGoalMinutes
  const remaining = Math.max(0, goal - studied)
  const streak = studyStreak(state, now)

  const nextStep = plan[0] ?? null
  const restOfPlan = plan.slice(1)

  const weakest = report?.needsWork[0] ?? report?.untouched[0] ?? null
  const weakestStat = weakest ? statFor(state.stats, weakest.key) : null

  function start(item: PlanItem) {
    nav.startSession({
      mode: item.mode,
      examId: item.examId,
      subjectId: item.subjectId,
      topicKey: item.topicKey,
      topicName: item.topicName,
    })
  }

  return (
    <div className="px-5 pt-6 pb-8">
      <header className="animate-rise flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-muted">{greeting(new Date(now))},</p>
          <h1 className="mt-0.5 truncate text-[2.1rem] leading-none font-extrabold tracking-[-0.035em] text-fg">
            {name}
          </h1>
        </div>
        {streak > 0 && (
          <span className="flex shrink-0 items-center gap-1.5 rounded-full border border-line bg-card px-3 py-1.5 text-xs font-semibold text-warn">
            <FlameIcon className="h-3.5 w-3.5" />
            {streak} {plural(streak, 'day')}
          </span>
        )}
      </header>

      <figure className="animate-rise mt-5 border-l-2 border-brand/60 pl-4" style={{ animationDelay: '50ms' }}>
        <blockquote className="text-[0.95rem] leading-relaxed text-muted">
          <span className="font-semibold text-fg">{name},</span> “{quote.text}”
        </blockquote>
        <figcaption className="mt-1 text-xs text-faint">— {quote.author}</figcaption>
      </figure>

      {focus && report ? (
        <>
          <section
            className="animate-rise mt-7 flex flex-col items-center"
            style={{ animationDelay: '100ms' }}
          >
            <button
              type="button"
              onClick={() => nav.openExam(focus.id)}
              className="flex items-center gap-2 rounded-full border border-line bg-card px-3.5 py-1.5 text-xs font-medium text-muted transition-colors hover:border-line-strong hover:text-fg"
            >
              <span className="truncate">{focus.title}</span>
              <span className="h-1 w-1 rounded-full bg-line-strong" />
              <span className={report.daysLeft <= 7 ? 'text-warn' : ''}>
                {formatCountdown(report.daysLeft)}
              </span>
            </button>

            <div className="mt-4">
              <ReadinessRing
                value={report.score}
                caption="ready"
                sub={
                  report.delta !== null && report.delta !== 0
                    ? `${report.delta > 0 ? '+' : ''}${report.delta} this week`
                    : undefined
                }
              />
            </div>

            {report.drivers.length > 0 && (
              <ul className="mt-5 w-full space-y-2">
                {report.drivers.slice(0, 3).map((driver) => (
                  <li
                    key={driver.label}
                    className="flex items-start gap-2.5 rounded-2xl border border-line bg-card px-3.5 py-2.5"
                  >
                    <span
                      className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${TONE_DOT[driver.tone]}`}
                    />
                    <span className="min-w-0 text-sm">
                      <span className="font-semibold text-fg">{driver.label}: </span>
                      <span className="text-muted">{driver.detail}</span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {nextStep && (
            <div className="animate-rise mt-6" style={{ animationDelay: '150ms' }}>
              <NextStepCard
                item={nextStep}
                done={isPlanItemDone(state, nextStep, now)}
                onStart={() => start(nextStep)}
              />
            </div>
          )}

          {insight && (
            <section className="mt-4 rounded-[20px] border border-line bg-card p-4">
              <Eyebrow tone="muted">Why</Eyebrow>
              <p className="mt-2 text-[0.95rem] leading-relaxed font-medium text-fg">
                {insight.headline}
              </p>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">{insight.body}</p>
            </section>
          )}

          <section className="mt-7">
            <SectionHeading
              title="Today’s plan"
              hint={`${formatDuration(plan.reduce((sum, item) => sum + item.minutes, 0))} across ${plan.length} ${plural(plan.length, 'session')}`}
            />
            {restOfPlan.length > 0 ? (
              <ul className="space-y-2">
                {restOfPlan.map((item) => (
                  <PlanRow
                    key={item.id}
                    item={item}
                    done={isPlanItemDone(state, item, now)}
                    onToggle={() => dispatch({ type: 'togglePlanItem', id: item.id })}
                    onStart={() => start(item)}
                  />
                ))}
              </ul>
            ) : (
              <Card className="px-4 py-4 text-sm text-muted">
                One focused session is the whole plan today. Finish it and StudyMate will
                pick the next one.
              </Card>
            )}
          </section>

          <section className="mt-4 grid grid-cols-2 gap-3">
            <StatTile
              label="Time today"
              value={formatDuration(studied)}
              icon={<ClockIcon className="h-3.5 w-3.5" />}
              hint={
                <div>
                  <ProgressBar
                    value={(studied / Math.max(1, goal)) * 100}
                    label="Daily goal progress"
                    tone={studied >= goal ? 'good' : 'brand'}
                  />
                  <p className="mt-1.5 text-xs text-faint">
                    {remaining === 0
                      ? `Goal of ${formatDuration(goal)} met`
                      : `${formatDuration(remaining)} left of your goal`}
                  </p>
                </div>
              }
            />
            <StatTile
              label="Projected"
              value={`${report.projected}%`}
              icon={<ArrowUpIcon className="h-3.5 w-3.5" />}
              hint={
                <p className="text-xs text-faint">
                  by exam day if you keep this pace
                </p>
              }
            />
          </section>

          {weakest && (
            <section className="mt-4">
              <SectionHeading title="Your weakest area" />
              <Card className="p-5" sheen>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="text-xl leading-tight font-bold tracking-tight text-fg">
                      {weakest.name}
                    </h3>
                    <p className="mt-1 text-sm text-muted">
                      {weakest.status === 'untouched'
                        ? 'No data yet — one session will place it'
                        : `Recent accuracy ${Math.round((weakestStat?.accuracy ?? 0) * 100)}% over ${weakest.attempts} ${plural(weakest.attempts, 'question')}`}
                    </p>
                  </div>
                  <span className="tnum shrink-0 text-2xl font-bold tracking-tight text-warn">
                    {weakest.mastery}%
                  </span>
                </div>

                <ProgressBar
                  className="mt-4"
                  thick
                  value={weakest.mastery}
                  label={`${weakest.name} mastery`}
                  tone={weakest.mastery < 45 ? 'risk' : 'warn'}
                />

                <div className="mt-4 flex gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() =>
                      nav.startSession({
                        mode: 'flashcards',
                        examId: focus.id,
                        subjectId: focus.subjectId,
                        topicKey: weakest.key,
                        topicName: weakest.name,
                      })
                    }
                  >
                    Flashcards
                  </Button>
                  <Button
                    size="sm"
                    onClick={() =>
                      nav.startSession({
                        mode: weakest.custom ? 'review' : 'practice',
                        examId: focus.id,
                        subjectId: focus.subjectId,
                        topicKey: weakest.key,
                        topicName: weakest.name,
                      })
                    }
                  >
                    Practise now
                  </Button>
                </div>
              </Card>
            </section>
          )}

          {exams.length > 1 && (
            <section className="mt-7">
              <SectionHeading
                title="Also coming up"
                hint={`${exams.length - 1} other ${plural(exams.length - 1, 'exam')}`}
              />
              <div className="space-y-2">
                {exams.slice(1, 4).map((exam) => (
                  <ExamRow
                    key={exam.id}
                    exam={exam}
                    readiness={readinessFor(exam, state, now).score}
                    onOpen={() => nav.openExam(exam.id)}
                  />
                ))}
              </div>
            </section>
          )}

          <div className="mt-7">
            <Button variant="secondary" full size="md" onClick={nav.newExam}>
              <PlusIcon className="h-4 w-4" />
              Prepare for another exam
            </Button>
          </div>
        </>
      ) : (
        <section className="mt-8">
          <EmptyState
            icon={<TargetIcon className="h-6 w-6" />}
            title="Let’s get you ready"
            body="Add your first exam and StudyMate will work out what to study, how prepared you are, and what to do next."
            action={
              <Button size="lg" full onClick={nav.newExam}>
                <PlusIcon className="h-5 w-5" />
                Create my first exam
              </Button>
            }
          />

          <div className="mt-4 grid gap-2">
            {[
              {
                icon: <BrainIcon className="h-4 w-4" />,
                title: 'A five-minute level check',
                body: 'Questions pitched at your grade place every topic on the map.',
              },
              {
                icon: <TargetIcon className="h-4 w-4" />,
                title: 'A readiness score that means something',
                body: 'Built from your accuracy, coverage and recall — not a guess.',
              },
              {
                icon: <ClockIcon className="h-4 w-4" />,
                title: 'One clear thing to do each day',
                body: 'Sized to the time you have, aimed at your weakest topic.',
              },
            ].map((row) => (
              <div key={row.title} className="flex gap-3 rounded-[18px] border border-line bg-card px-4 py-3.5">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-brand/12 text-brand">
                  {row.icon}
                </span>
                <span>
                  <span className="block text-sm font-semibold text-fg">{row.title}</span>
                  <span className="mt-0.5 block text-xs leading-relaxed text-faint">
                    {row.body}
                  </span>
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
