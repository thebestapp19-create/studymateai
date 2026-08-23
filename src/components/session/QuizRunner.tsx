import { useState } from 'react'
import { ArrowRightIcon, CheckIcon, XIcon } from '../icons'
import { MascotHero, MascotReaction } from '../Mascot'
import Owl from '../Owl'
import OverlayShell from '../ui/OverlayShell'
import { Button, Card, Eyebrow, ProgressBar } from '../ui/primitives'
import {
  buildQuizItems,
  poolFrom,
  poolSize,
  takeFromPool,
  type Difficulty,
  type ItemPool,
  type QuizItem,
} from '../../lib/content/items'
import type { Band } from '../../lib/curriculum'
import { sessionFeedback } from '../../lib/engine/insights'
import { answerReaction, quizMoment } from '../../lib/engine/mascot'
import { effectiveMastery, statFor, type AnswerResult } from '../../lib/engine/mastery'
import { readinessFor } from '../../lib/engine/readiness'
import { clamp, plural } from '../../lib/format'
import { useAppState, useDispatch } from '../../lib/store/context'
import { examById } from '../../lib/store/selectors'

type QuizRunnerProps = {
  kind: 'assessment' | 'practice'
  title: string
  subtitle: string
  examId: string | null
  subjectId: string
  band: Band
  topics: { key: string; name: string }[]
  total: number
  onClose: () => void
  onRestart?: () => void
}

const LETTERS = ['A', 'B', 'C', 'D']

export default function QuizRunner({
  kind,
  title,
  subtitle,
  examId,
  subjectId,
  band,
  topics,
  total,
  onClose,
  onRestart,
}: QuizRunnerProps) {
  const state = useAppState()
  const dispatch = useDispatch()

  const [seed] = useState(() => Date.now())
  const [startedAt] = useState(() => Date.now())

  // Where things stood before this session, captured once, for the summary.
  const [before] = useState(() => ({
    mastery: Object.fromEntries(
      topics.map((topic) => [topic.key, effectiveMastery(statFor(state.stats, topic.key))]),
    ) as Record<string, number>,
    readiness: (() => {
      const exam = examById(state, examId)
      return exam ? readinessFor(exam, state).score : 0
    })(),
  }))

  const levelFor = (key: string): Difficulty => {
    const mastery = effectiveMastery(statFor(state.stats, key))
    return mastery >= 70 ? 3 : mastery >= 40 ? 2 : 1
  }

  const [initial] = useState(() => {
    const perTopic = Math.max(3, Math.ceil((total / Math.max(1, topics.length)) * 2))
    const built: Record<string, ItemPool> = {}
    for (const topic of topics) {
      const stat = statFor(state.stats, topic.key)
      built[topic.key] = poolFrom(
        buildQuizItems({
          topicKey: topic.key,
          band,
          count: perTopic,
          seed: `${seed}:${topic.key}`,
          mastery: effectiveMastery(stat),
          exclude: stat.seen,
        }),
      )
    }

    let first: { item: QuizItem; topicKey: string } | null = null
    for (const topic of topics) {
      const taken = takeFromPool(built[topic.key], levelFor(topic.key))
      if (taken.item) {
        built[topic.key] = taken.pool
        first = { item: taken.item, topicKey: topic.key }
        break
      }
    }

    return { pools: built, first }
  })

  const [pools, setPools] = useState(initial.pools)
  const [levels, setLevels] = useState<Record<string, Difficulty>>(() =>
    Object.fromEntries(topics.map((topic) => [topic.key, levelFor(topic.key)])),
  )
  const [turn, setTurn] = useState(0)
  const [answers, setAnswers] = useState<{ topicKey: string; result: AnswerResult }[]>([])
  const [selected, setSelected] = useState<number | null>(null)
  const [phase, setPhase] = useState<'question' | 'feedback' | 'analysing' | 'summary'>(
    'question',
  )
  const [current, setCurrent] = useState(initial.first)

  const answered = answers.length
  const correctCount = answers.filter((entry) => entry.result.correct).length

  // How many in a row are right, for the owl to notice.
  let runStreak = 0
  for (let index = answers.length - 1; index >= 0; index -= 1) {
    if (!answers[index].result.correct) break
    runStreak += 1
  }

  function choose(index: number) {
    if (phase !== 'question' || !current) return
    const correct = index === current.item.answerIndex
    setSelected(index)
    setPhase('feedback')
    setAnswers((list) => [
      ...list,
      {
        topicKey: current.topicKey,
        result: { itemId: current.item.id, correct, difficulty: current.item.difficulty },
      },
    ])
    setLevels((current_) => ({
      ...current_,
      [current.topicKey]: clamp(
        (current_[current.topicKey] ?? 2) + (correct ? 1 : -1),
        1,
        3,
      ) as Difficulty,
    }))
  }

  function finish(finalAnswers: { topicKey: string; result: AnswerResult }[]) {
    const minutes = clamp(Math.round((Date.now() - startedAt) / 60_000), 1, 90)
    const grouped = topics
      .map((topic) => ({
        topicKey: topic.key,
        results: finalAnswers
          .filter((entry) => entry.topicKey === topic.key)
          .map((entry) => entry.result),
      }))
      .filter((group) => group.results.length > 0)

    dispatch({
      type: 'recordQuiz',
      kind,
      examId,
      subjectId,
      label: title,
      minutes,
      topics: grouped,
    })

    if (kind === 'assessment') {
      // The level check is the one moment where the app forms its whole
      // picture of you — worth a beat before the numbers land.
      setPhase('analysing')
      window.setTimeout(() => setPhase('summary'), 1500)
      return
    }
    setPhase('summary')
  }

  function next() {
    const nextTurn = turn + 1
    if (answers.length >= total) {
      finish(answers)
      return
    }

    // Rotate topics so an assessment spreads across the whole exam.
    const order = topics.map((topic) => topic.key)
    let found: { item: QuizItem; topicKey: string } | null = null
    let workingPools = pools

    for (let offset = 0; offset < order.length; offset += 1) {
      const key = order[(nextTurn + offset) % order.length]
      const pool = workingPools[key]
      if (!pool || poolSize(pool) === 0) continue
      const taken = takeFromPool(pool, levels[key] ?? 2)
      if (taken.item) {
        workingPools = { ...workingPools, [key]: taken.pool }
        found = { item: taken.item, topicKey: key }
        break
      }
    }

    if (!found) {
      finish(answers)
      return
    }

    setPools(workingPools)
    setCurrent(found)
    setSelected(null)
    setTurn(nextTurn)
    setPhase('question')
  }

  if (phase === 'analysing') {
    return (
      <OverlayShell title="Level check" onClose={onClose}>
        <div className="flex flex-col items-center pt-14 text-center">
          <Owl expression="thinking" size={132} />
          <p className="animate-shimmer mt-5 text-[1.05rem] font-semibold tracking-tight text-fg">
            Reading your answers…
          </p>
          <p className="mt-1.5 max-w-[17rem] text-sm leading-relaxed text-muted">
            Placing every topic, then working out where your time is best spent.
          </p>
        </div>
      </OverlayShell>
    )
  }

  if (phase === 'summary') {
    return (
      <Summary
        kind={kind}
        title={title}
        topics={topics.filter((topic) =>
          answers.some((entry) => entry.topicKey === topic.key),
        )}
        before={before}
        correct={correctCount}
        total={answers.length}
        examId={examId}
        onClose={onClose}
        onRestart={onRestart}
      />
    )
  }

  if (!current) {
    return (
      <OverlayShell title={title} subtitle={subtitle} onClose={onClose}>
        <Card className="p-6 text-center">
          <p className="text-sm text-muted">
            No questions available for this topic yet. Try flashcards instead.
          </p>
          <Button className="mt-4" onClick={onClose}>
            Back
          </Button>
        </Card>
      </OverlayShell>
    )
  }

  const item = current.item
  const topicName = topics.find((topic) => topic.key === current.topicKey)?.name ?? ''

  return (
    <OverlayShell
      title={title}
      subtitle={`Question ${answered + (phase === 'feedback' ? 0 : 1)} of ${total}`}
      onClose={onClose}
      progress={(answered / total) * 100}
      footer={
        phase === 'feedback' ? (
          <Button full size="lg" onClick={next}>
            {answers.length >= total ? 'See results' : 'Next question'}
            <ArrowRightIcon className="h-4.5 w-4.5" />
          </Button>
        ) : undefined
      }
    >
      <div key={item.id} className="animate-slide-in">
        <div className="flex items-center justify-between gap-3">
          <Eyebrow>{topicName}</Eyebrow>
          <span className="text-[0.7rem] font-medium text-faint">
            {item.difficulty === 1 ? 'Warm-up' : item.difficulty === 2 ? 'Core' : 'Stretch'}
          </span>
        </div>

        <h2 className="mt-3 text-[1.3rem] leading-snug font-semibold tracking-tight whitespace-pre-line text-fg">
          {item.prompt}
        </h2>

        <ul className="mt-5 space-y-2.5">
          {item.choices.map((choice, index) => {
            const isAnswer = index === item.answerIndex
            const isChosen = index === selected
            const revealed = phase === 'feedback'

            const tone = revealed
              ? isAnswer
                ? 'border-good/60 bg-good/10 text-fg'
                : isChosen
                  ? 'border-risk/60 bg-risk/10 text-fg'
                  : 'border-line bg-card text-faint'
              : 'border-line bg-card text-fg hover:border-line-strong'

            return (
              <li key={choice}>
                <button
                  type="button"
                  disabled={revealed}
                  onClick={() => choose(index)}
                  className={`flex w-full items-start gap-3 rounded-[18px] border px-4 py-3.5 text-left transition-all duration-200 active:scale-[0.99] disabled:active:scale-100 ${tone}`}
                >
                  <span
                    className={`mt-px flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                      revealed && isAnswer
                        ? 'bg-good text-ink'
                        : revealed && isChosen
                          ? 'bg-risk text-ink'
                          : 'bg-white/[0.06] text-muted'
                    }`}
                  >
                    {revealed && isAnswer ? (
                      <CheckIcon className="h-3.5 w-3.5" />
                    ) : revealed && isChosen ? (
                      <XIcon className="h-3 w-3" />
                    ) : (
                      LETTERS[index]
                    )}
                  </span>
                  <span className="min-w-0 flex-1 text-[0.95rem] leading-relaxed">{choice}</span>
                </button>
              </li>
            )
          })}
        </ul>

        {phase === 'feedback' && (
          <Card className="animate-rise mt-4 p-4">
            <MascotReaction
              moment={answerReaction({
                correct: selected === item.answerIndex,
                difficulty: item.difficulty,
                streak: runStreak,
              })}
              label={selected === item.answerIndex ? 'Correct' : 'Not quite'}
              labelClass={selected === item.answerIndex ? 'text-good' : 'text-warn'}
            >
              <p className="mt-1.5 text-sm leading-relaxed text-muted">{item.explanation}</p>
              <p className="mt-2.5 text-xs text-faint">Skill: {item.skill}</p>
            </MascotReaction>
          </Card>
        )}
      </div>
    </OverlayShell>
  )
}

function Summary({
  kind,
  title,
  topics,
  before,
  correct,
  total,
  examId,
  onClose,
  onRestart,
}: {
  kind: 'assessment' | 'practice'
  title: string
  topics: { key: string; name: string }[]
  before: { mastery: Record<string, number>; readiness: number }
  correct: number
  total: number
  examId: string | null
  onClose: () => void
  onRestart?: () => void
}) {
  const state = useAppState()
  const exam = examById(state, examId)
  const readinessAfter = exam ? readinessFor(exam, state).score : before.readiness
  const readinessDelta = readinessAfter - before.readiness

  const rows = topics.map((topic) => ({
    name: topic.name,
    before: before.mastery[topic.key] ?? 0,
    after: effectiveMastery(statFor(state.stats, topic.key)),
  }))

  const headline = sessionFeedback({
    topicName: rows.length === 1 ? rows[0].name : title,
    before: rows.length === 1 ? rows[0].before : before.readiness,
    after: rows.length === 1 ? rows[0].after : readinessAfter,
    correct,
    total,
    readinessDelta,
  })

  return (
    <OverlayShell
      title={kind === 'assessment' ? 'Level check complete' : 'Session complete'}
      onClose={onClose}
      footer={
        <div className="flex gap-2">
          {onRestart && (
            <Button variant="secondary" size="lg" onClick={onRestart} className="flex-1">
              Another set
            </Button>
          )}
          <Button size="lg" onClick={onClose} className="flex-1">
            Done
          </Button>
        </div>
      }
    >
      <div className="animate-rise text-center">
        <MascotHero
          moment={quizMoment({
            correct,
            total,
            masteryDelta: rows.length === 1 ? rows[0].after - rows[0].before : readinessDelta,
            isAssessment: kind === 'assessment',
          })}
          size={112}
        />
        <p className="tnum mt-5 text-[3.4rem] leading-none font-extrabold tracking-[-0.04em] text-fg">
          {correct}
          <span className="text-muted">/{total}</span>
        </p>
        <p className="mt-1 text-sm text-muted">
          {Math.round((correct / Math.max(1, total)) * 100)}% correct in this session
        </p>
      </div>

      <Card className="animate-rise mt-6 p-5" sheen>
        <p className="text-[1.05rem] leading-snug font-bold tracking-tight text-fg">
          {headline.headline}
        </p>
        <p className="mt-1.5 text-sm leading-relaxed text-muted">{headline.body}</p>
      </Card>

      {rows.length > 0 && (
        <section className="mt-6">
          <Eyebrow tone="muted">Mastery change</Eyebrow>
          <ul className="mt-3 space-y-3">
            {rows.map((row) => {
              const delta = row.after - row.before
              return (
                <li key={row.name}>
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="min-w-0 truncate text-sm font-medium text-fg">
                      {row.name}
                    </span>
                    <span className="tnum shrink-0 text-sm font-semibold text-fg">
                      {row.after}%
                      {delta !== 0 && (
                        <span className={delta > 0 ? 'ml-1.5 text-good' : 'ml-1.5 text-warn'}>
                          {delta > 0 ? '+' : ''}
                          {delta}
                        </span>
                      )}
                    </span>
                  </div>
                  <ProgressBar
                    className="mt-1.5"
                    value={row.after}
                    label={`${row.name} mastery`}
                    tone={row.after >= 75 ? 'good' : row.after >= 45 ? 'brand' : 'warn'}
                  />
                </li>
              )
            })}
          </ul>
        </section>
      )}

      {exam && (
        <Card className="mt-6 p-4">
          <div className="flex items-baseline justify-between">
            <span className="text-sm text-muted">Readiness for {exam.title}</span>
            <span className="tnum text-lg font-bold text-fg">
              {readinessAfter}%
              {readinessDelta !== 0 && (
                <span className={readinessDelta > 0 ? 'ml-1.5 text-good' : 'ml-1.5 text-warn'}>
                  {readinessDelta > 0 ? '+' : ''}
                  {readinessDelta}
                </span>
              )}
            </span>
          </div>
          <ProgressBar
            className="mt-2"
            thick
            value={readinessAfter}
            label="Exam readiness"
            tone={readinessAfter >= 75 ? 'good' : readinessAfter >= 45 ? 'brand' : 'warn'}
          />
          <p className="mt-2.5 text-xs text-faint">
            {total} {plural(total, 'answer')} fed into this score.
          </p>
        </Card>
      )}
    </OverlayShell>
  )
}
