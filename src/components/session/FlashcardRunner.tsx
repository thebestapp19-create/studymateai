import { useState } from 'react'
import OverlayShell from '../ui/OverlayShell'
import { Button, Card, Eyebrow, ProgressBar } from '../ui/primitives'
import {
  buildDeck,
  buildFlashcards,
  scheduleCard,
  type CardRating,
  type CardSchedule,
  type Flashcard,
} from '../../lib/content/flashcards'
import type { Band } from '../../lib/curriculum'
import { effectiveMastery, statFor } from '../../lib/engine/mastery'
import { readinessFor } from '../../lib/engine/readiness'
import { clamp } from '../../lib/format'
import { useAppState, useDispatch } from '../../lib/store/context'
import { examById } from '../../lib/store/selectors'

type FlashcardRunnerProps = {
  topicKey: string
  topicName: string
  examId: string | null
  subjectId: string
  band: Band
  size?: number
  onClose: () => void
  onRestart?: () => void
}

const RATINGS: { id: CardRating; label: string; hint: string; tone: string }[] = [
  {
    id: 'unknown',
    label: 'Didn’t know',
    hint: 'comes back today',
    tone: 'border-risk/40 bg-risk/10 text-risk hover:bg-risk/16',
  },
  {
    id: 'shaky',
    label: 'Shaky',
    hint: 'back tomorrow',
    tone: 'border-warn/40 bg-warn/10 text-warn hover:bg-warn/16',
  },
  {
    id: 'known',
    label: 'Got it',
    hint: 'back later',
    tone: 'border-good/40 bg-good/10 text-good hover:bg-good/16',
  },
]

export default function FlashcardRunner({
  topicKey,
  topicName,
  examId,
  subjectId,
  band,
  size = 10,
  onClose,
  onRestart,
}: FlashcardRunnerProps) {
  const state = useAppState()
  const dispatch = useDispatch()

  const [seed] = useState(() => Date.now())
  const [startedAt] = useState(() => Date.now())
  const [before] = useState(() => ({
    mastery: effectiveMastery(statFor(state.stats, topicKey)),
    readiness: (() => {
      const exam = examById(state, examId)
      return exam ? readinessFor(exam, state).score : 0
    })(),
  }))

  // A new seed each session reshuffles the drill problems.
  const [queue, setQueue] = useState<Flashcard[]>(() =>
    buildDeck(buildFlashcards(topicKey, band, seed), statFor(state.stats, topicKey).cards, size),
  )
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [updates, setUpdates] = useState<
    { cardId: string; rating: CardRating; schedule: CardSchedule }[]
  >([])
  const [done, setDone] = useState(false)

  const card = queue[index] ?? null
  const rated = updates.length

  function rate(rating: CardRating) {
    if (!card) return
    const existing: CardSchedule | undefined =
      updates.find((update) => update.cardId === card.id)?.schedule ??
      statFor(state.stats, topicKey).cards[card.id]

    const schedule = scheduleCard(existing, rating)
    const nextUpdates = [
      ...updates.filter((update) => update.cardId !== card.id),
      { cardId: card.id, rating, schedule },
    ]
    setUpdates(nextUpdates)

    let nextQueue = queue
    // Anything they blanked on comes back before the session ends.
    if (rating === 'unknown' && queue.length < size + 4) {
      nextQueue = [...queue, card]
      setQueue(nextQueue)
    }

    setFlipped(false)

    if (index + 1 >= nextQueue.length) {
      finish(nextUpdates)
      return
    }
    setIndex(index + 1)
  }

  function finish(finalUpdates: typeof updates) {
    if (finalUpdates.length === 0) {
      onClose()
      return
    }
    const minutes = clamp(Math.round((Date.now() - startedAt) / 60_000), 1, 60)
    dispatch({
      type: 'recordCards',
      examId,
      subjectId,
      topicKey,
      label: `${topicName} flashcards`,
      minutes,
      updates: finalUpdates,
    })
    setDone(true)
  }

  if (done) {
    const after = effectiveMastery(statFor(state.stats, topicKey))
    const exam = examById(state, examId)
    const readinessAfter = exam ? readinessFor(exam, state).score : before.readiness
    const counts = {
      known: updates.filter((update) => update.rating === 'known').length,
      shaky: updates.filter((update) => update.rating === 'shaky').length,
      unknown: updates.filter((update) => update.rating === 'unknown').length,
    }
    const delta = after - before.mastery
    const readinessDelta = readinessAfter - before.readiness

    return (
      <OverlayShell
        title="Deck complete"
        onClose={onClose}
        footer={
          <div className="flex gap-2">
            {onRestart && (
              <Button variant="secondary" size="lg" className="flex-1" onClick={onRestart}>
                Another deck
              </Button>
            )}
            <Button size="lg" className="flex-1" onClick={onClose}>
              Done
            </Button>
          </div>
        }
      >
        <div className="animate-rise text-center">
          <p className="tnum text-[3.2rem] leading-none font-extrabold tracking-[-0.04em] text-fg">
            {counts.known}
            <span className="text-muted">/{updates.length}</span>
          </p>
          <p className="mt-2 text-sm text-muted">cards you had solid</p>
        </div>

        <Card className="animate-rise mt-6 p-5" sheen>
          <p className="text-[1.05rem] leading-snug font-bold tracking-tight text-fg">
            {delta > 0
              ? `${topicName} is up to ${after}%`
              : delta === 0
                ? `${topicName} held at ${after}%`
                : `${topicName} moved to ${after}%`}
          </p>
          <p className="mt-1.5 text-sm leading-relaxed text-muted">
            {counts.unknown > 0
              ? `${counts.unknown} card${counts.unknown === 1 ? '' : 's'} you blanked on will come back first next time.`
              : 'Nothing was a blank — the deck will space itself out further from here.'}
            {readinessDelta > 0 && ` Readiness moved +${readinessDelta}%.`}
          </p>
          <ProgressBar
            className="mt-4"
            thick
            value={after}
            label={`${topicName} mastery`}
            tone={after >= 75 ? 'good' : after >= 45 ? 'brand' : 'warn'}
          />
        </Card>

        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          {[
            { label: 'Got it', value: counts.known, tone: 'text-good' },
            { label: 'Shaky', value: counts.shaky, tone: 'text-warn' },
            { label: 'Blank', value: counts.unknown, tone: 'text-risk' },
          ].map((cell) => (
            <div key={cell.label} className="rounded-2xl border border-line bg-card py-3">
              <p className={`tnum text-xl font-bold ${cell.tone}`}>{cell.value}</p>
              <p className="mt-0.5 text-xs text-faint">{cell.label}</p>
            </div>
          ))}
        </div>
      </OverlayShell>
    )
  }

  if (!card) {
    return (
      <OverlayShell title={topicName} onClose={onClose}>
        <Card className="p-6 text-center">
          <p className="text-sm text-muted">
            No cards for this topic yet. Try a practice session instead.
          </p>
          <Button className="mt-4" onClick={onClose}>
            Back
          </Button>
        </Card>
      </OverlayShell>
    )
  }

  return (
    <OverlayShell
      title={topicName}
      subtitle={`Card ${index + 1} of ${queue.length}`}
      onClose={() => finish(updates)}
      progress={(rated / Math.max(1, queue.length)) * 100}
    >
      <div className="flip-scene" key={card.id}>
        <div
          className="flip-inner relative min-h-[19rem]"
          data-flipped={flipped}
          role="button"
          tabIndex={0}
          onClick={() => setFlipped((value) => !value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault()
              setFlipped((value) => !value)
            }
          }}
        >
          <div className="flip-face card-sheen flex min-h-[19rem] flex-col rounded-[22px] border border-line bg-card p-6">
            <Eyebrow tone="muted">{card.kind}</Eyebrow>
            <p className="mt-4 flex-1 text-[1.35rem] leading-snug font-semibold tracking-tight whitespace-pre-line text-fg">
              {card.front}
            </p>
            <p className="mt-6 text-sm text-faint">{card.prompt}</p>
            <p className="mt-1 text-xs text-brand">Tap to reveal</p>
          </div>

          <div className="flip-face flip-face-back absolute inset-0 flex min-h-[19rem] flex-col rounded-[22px] border border-brand/30 bg-brand/[0.06] p-6">
            <Eyebrow>Answer</Eyebrow>
            <p className="mt-2.5 line-clamp-3 text-xs leading-relaxed whitespace-pre-line text-faint">
              {card.front}
            </p>
            <p className="mt-3 text-[1.2rem] leading-snug font-semibold tracking-tight whitespace-pre-line text-fg">
              {card.back}
            </p>
            {card.extra && (
              <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">{card.extra}</p>
            )}
          </div>
        </div>
      </div>

      {flipped ? (
        <div className="animate-rise mt-5">
          <p className="mb-2.5 text-center text-xs text-faint">How well did you know it?</p>
          <div className="grid grid-cols-3 gap-2">
            {RATINGS.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => rate(option.id)}
                className={`rounded-2xl border px-2 py-3 text-center transition-colors active:scale-[0.98] ${option.tone}`}
              >
                <span className="block text-sm font-semibold">{option.label}</span>
                <span className="mt-0.5 block text-[0.68rem] opacity-70">{option.hint}</span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-5">
          <Button full size="lg" variant="secondary" onClick={() => setFlipped(true)}>
            Reveal answer
          </Button>
        </div>
      )}
    </OverlayShell>
  )
}
