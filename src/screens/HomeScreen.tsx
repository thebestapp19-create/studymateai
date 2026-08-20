import { useMemo, useState } from 'react'
import BottomNav from '../components/BottomNav'
import ExamCard from '../components/ExamCard'
import ProgressBar from '../components/ProgressBar'
import {
  CheckIcon,
  ClockIcon,
  PlusIcon,
  SparkleIcon,
  TargetIcon,
  UserIcon,
} from '../components/icons'
import { getDailyQuote } from '../lib/quotes'
import {
  buildTodaysPlan,
  formatDuration,
  loadAvailableMinutes,
  loadCompletedPlanItems,
  loadExams,
  saveAvailableMinutes,
  saveCompletedPlanItems,
  upcomingExams,
  weakestTopic,
} from '../lib/studyData'
import type { UserProfile } from '../lib/userProfile'

const MIN_MINUTES = 15
const MAX_MINUTES = 480
const STEP_MINUTES = 15

function greetingFor(date: Date): string {
  const hour = date.getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

type HomeScreenProps = {
  profile: UserProfile
}

export default function HomeScreen({ profile }: HomeScreenProps) {
  const [availableMinutes, setAvailableMinutes] = useState(loadAvailableMinutes)
  const [completedIds, setCompletedIds] = useState(loadCompletedPlanItems)
  const [notice, setNotice] = useState<string | null>(null)

  const exams = useMemo(() => upcomingExams(loadExams()), [])
  const quote = useMemo(() => getDailyQuote(), [])
  const greeting = useMemo(() => greetingFor(new Date()), [])

  const plan = useMemo(
    () => buildTodaysPlan(exams, availableMinutes),
    [exams, availableMinutes],
  )
  const weakest = useMemo(() => weakestTopic(exams), [exams])

  const focusExam = exams[0]
  const otherExams = exams.slice(1)
  const plannedMinutes = plan.reduce((total, item) => total + item.minutes, 0)
  const doneCount = plan.filter((item) => completedIds.includes(item.id)).length

  function showNotice(message: string) {
    setNotice(message)
    window.setTimeout(() => setNotice(null), 2400)
  }

  function togglePlanItem(id: string) {
    const next = completedIds.includes(id)
      ? completedIds.filter((itemId) => itemId !== id)
      : [...completedIds, id]

    setCompletedIds(next)
    saveCompletedPlanItems(next)
  }

  function adjustAvailableMinutes(delta: number) {
    const next = Math.min(
      MAX_MINUTES,
      Math.max(MIN_MINUTES, availableMinutes + delta),
    )
    setAvailableMinutes(next)
    saveAvailableMinutes(next)
  }

  return (
    <div className="flex min-h-dvh flex-col bg-ink">
      <div className="mx-auto w-full max-w-md flex-1 px-5 pt-6 pb-10">
        <header className="flex items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-line bg-card text-muted">
            <UserIcon className="h-5 w-5" />
          </span>
          <h1 className="flex-1 text-xl font-bold tracking-tight text-fg">
            StudyMate<span className="text-brand">AI</span>
          </h1>
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-line bg-card text-brand">
            <SparkleIcon className="h-5 w-5" />
          </span>
        </header>

        <section className="mt-8">
          <p className="text-sm font-medium text-muted">
            {greeting} · {profile.grade}
          </p>
          <p className="mt-1 text-5xl font-extrabold tracking-tight text-fg">
            {profile.name}
          </p>
        </section>

        <section className="mt-6">
          <p className="text-xs font-medium text-faint">
            A thought for you today, {profile.name}
          </p>
          <blockquote className="mt-2 border-l-2 border-brand pl-4">
            <p className="text-base leading-snug text-muted italic">
              “{quote.text}”
            </p>
            <footer className="mt-1 text-sm text-faint">— {quote.author}</footer>
          </blockquote>
        </section>

        {focusExam ? (
          <>
            <section className="mt-9">
              <h2 className="text-2xl leading-tight font-bold tracking-tight text-fg">
                You have {exams.length}{' '}
                {exams.length === 1 ? 'exam' : 'exams'} to prepare for.
              </h2>

              <div className="mt-4 space-y-3">
                <ExamCard exam={focusExam} focus />
                {otherExams.map((exam) => (
                  <ExamCard key={exam.id} exam={exam} />
                ))}
              </div>
            </section>

            <section className="mt-9">
              <div className="flex items-baseline justify-between">
                <h2 className="text-lg font-bold tracking-tight text-fg">
                  Today's study plan
                </h2>
                <span className="text-sm text-muted">
                  {doneCount}/{plan.length} done ·{' '}
                  {formatDuration(plannedMinutes)}
                </span>
              </div>

              <ul className="mt-3 space-y-2">
                {plan.map((item) => {
                  const done = completedIds.includes(item.id)
                  return (
                    <li key={item.id}>
                      <button
                        type="button"
                        aria-pressed={done}
                        onClick={() => togglePlanItem(item.id)}
                        className="flex w-full items-center gap-3 rounded-2xl border border-line bg-card px-4 py-4 text-left transition-colors hover:border-line-strong"
                      >
                        <span
                          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-colors ${
                            done
                              ? 'border-brand bg-brand text-white'
                              : 'border-line-strong text-transparent'
                          }`}
                        >
                          <CheckIcon className="h-3.5 w-3.5" />
                        </span>
                        <span
                          className={`min-w-0 flex-1 truncate text-base font-medium ${
                            done ? 'text-faint line-through' : 'text-fg'
                          }`}
                        >
                          {item.topic}
                        </span>
                        <span className="shrink-0 text-sm font-semibold text-muted">
                          {formatDuration(item.minutes)}
                        </span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            </section>

            <section className="mt-6 grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-line bg-card p-4">
                <p className="flex items-center gap-1.5 text-xs font-medium text-muted">
                  <TargetIcon className="h-4 w-4" />
                  Preparation
                </p>
                <p className="mt-2 text-3xl font-extrabold tracking-tight text-fg">
                  {focusExam.readiness}%
                </p>
                <p className="mt-1 truncate text-xs text-faint">
                  for {focusExam.subject}
                </p>
              </div>

              <div className="rounded-2xl border border-line bg-card p-4">
                <p className="flex items-center gap-1.5 text-xs font-medium text-muted">
                  <ClockIcon className="h-4 w-4" />
                  Time today
                </p>
                <p className="mt-2 text-3xl font-extrabold tracking-tight text-fg">
                  {formatDuration(availableMinutes)}
                </p>
                <div className="mt-2 flex gap-2">
                  <button
                    type="button"
                    aria-label="Reduce time available today"
                    disabled={availableMinutes <= MIN_MINUTES}
                    onClick={() => adjustAvailableMinutes(-STEP_MINUTES)}
                    className="h-7 w-7 rounded-full border border-line text-muted transition-colors hover:border-line-strong disabled:opacity-40"
                  >
                    −
                  </button>
                  <button
                    type="button"
                    aria-label="Add time available today"
                    disabled={availableMinutes >= MAX_MINUTES}
                    onClick={() => adjustAvailableMinutes(STEP_MINUTES)}
                    className="h-7 w-7 rounded-full border border-line text-muted transition-colors hover:border-line-strong disabled:opacity-40"
                  >
                    +
                  </button>
                </div>
              </div>
            </section>

            {weakest && (
              <section className="mt-3 rounded-2xl border border-line bg-card p-5">
                <p className="text-xs font-medium text-accent">Weakest area</p>
                <h3 className="mt-1.5 text-xl font-bold tracking-tight text-fg">
                  {weakest.topic.name}
                </h3>
                <p className="mt-0.5 text-sm text-muted">
                  {weakest.exam.subject}
                </p>
                <div className="mt-4 flex items-baseline justify-between text-sm">
                  <span className="text-muted">Mastery</span>
                  <span className="font-semibold text-fg">
                    {weakest.topic.mastery}%
                  </span>
                </div>
                <ProgressBar
                  className="mt-2"
                  value={weakest.topic.mastery}
                  label={`${weakest.topic.name} mastery`}
                />
              </section>
            )}

            <button
              type="button"
              onClick={() => showNotice('Exam creation is coming soon.')}
              className="mt-9 flex w-full items-center justify-center gap-2 rounded-full bg-brand px-6 py-4 text-base font-semibold text-white transition-colors hover:bg-brand-strong"
            >
              <PlusIcon className="h-5 w-5" />
              Prepare for a new exam
            </button>
          </>
        ) : (
          <section className="mt-9">
            <h2 className="text-2xl leading-tight font-bold tracking-tight text-fg">
              No exams yet, {profile.name}.
            </h2>
            <div className="mt-4 rounded-2xl border border-line bg-card p-6 text-center">
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand/15 text-brand">
                <TargetIcon className="h-6 w-6" />
              </span>
              <p className="mt-4 text-base leading-snug text-muted">
                Add your first exam and StudyMateAI will build a daily study
                plan around your topics and the time you have.
              </p>
              <button
                type="button"
                onClick={() => showNotice('Exam creation is coming soon.')}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-brand px-6 py-4 text-base font-semibold text-white transition-colors hover:bg-brand-strong"
              >
                <PlusIcon className="h-5 w-5" />
                Prepare for a new exam
              </button>
            </div>
          </section>
        )}
      </div>

      {notice && (
        <div
          role="status"
          className="pointer-events-none sticky bottom-24 z-10 mx-auto w-max max-w-[90%] rounded-full border border-line bg-card px-4 py-2.5 text-sm text-fg shadow-lg"
        >
          {notice}
        </div>
      )}

      <BottomNav onUnavailable={(label) => showNotice(`${label} is coming soon.`)} />
    </div>
  )
}
