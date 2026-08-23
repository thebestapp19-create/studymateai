import { useMemo } from 'react'
import ExamRow from '../components/ExamRow'
import { BookIcon, PlusIcon } from '../components/icons'
import { Button, Card, EmptyState, SectionHeading } from '../components/ui/primitives'
import { pastExams, readinessFor, upcomingExams } from '../lib/engine/readiness'
import { formatLongDate, plural } from '../lib/format'
import { useNav } from '../lib/nav'
import { useNow } from '../lib/useNow'
import { useAppState } from '../lib/store/context'

export default function ExamsScreen() {
  const state = useAppState()
  const nav = useNav()
  const now = useNow()

  const upcoming = useMemo(() => upcomingExams(state, now), [state, now])
  const past = useMemo(() => pastExams(state, now), [state, now])

  return (
    <div className="px-5 pt-6 pb-8">
      <header className="animate-rise flex items-end justify-between gap-3">
        <div>
          <h1 className="text-[1.8rem] leading-none font-extrabold tracking-[-0.03em] text-fg">
            Exams
          </h1>
          <p className="mt-1.5 text-sm text-muted">
            {upcoming.length > 0
              ? `${upcoming.length} coming up`
              : 'Nothing scheduled yet'}
          </p>
        </div>
        <Button size="sm" onClick={nav.newExam}>
          <PlusIcon className="h-4 w-4" />
          New
        </Button>
      </header>

      {upcoming.length === 0 && past.length === 0 ? (
        <div className="mt-7">
          <EmptyState
            icon={<BookIcon className="h-6 w-6" />}
            title="No exams yet"
            body="Add one and StudyMate builds the topic breakdown, the readiness score and the daily plan around it."
            action={
              <Button size="lg" full onClick={nav.newExam}>
                <PlusIcon className="h-5 w-5" />
                Create my first exam
              </Button>
            }
          />
        </div>
      ) : (
        <>
          {upcoming.length > 0 && (
            <section className="mt-7">
              <SectionHeading title="Upcoming" hint="soonest first" />
              <div className="space-y-2">
                {upcoming.map((exam) => (
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

          {past.length > 0 && (
            <section className="mt-7">
              <SectionHeading title="Past" hint={`${past.length} ${plural(past.length, 'exam')}`} />
              <div className="space-y-2">
                {past.map((exam) => (
                  <button
                    key={exam.id}
                    type="button"
                    onClick={() => nav.openExam(exam.id)}
                    className="flex w-full items-center justify-between gap-3 rounded-[18px] border border-line bg-card px-4 py-3.5 text-left transition-colors hover:border-line-strong"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-[0.92rem] font-medium text-muted">
                        {exam.title}
                      </span>
                      <span className="mt-0.5 block text-xs text-faint">
                        {formatLongDate(exam.date)}
                      </span>
                    </span>
                    <span className="tnum shrink-0 text-sm font-semibold text-faint">
                      {readinessFor(exam, state, now).score}%
                    </span>
                  </button>
                ))}
              </div>
            </section>
          )}

          <Card className="mt-7 p-4">
            <p className="text-xs leading-relaxed text-faint">
              Mastery is tracked per topic, not per exam. Two exams covering the same topic
              share what you have learned, so nothing is measured twice.
            </p>
          </Card>
        </>
      )}
    </div>
  )
}
