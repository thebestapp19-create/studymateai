import { useEffect, useState } from 'react'
import { ClockIcon } from '../icons'
import Owl from '../Owl'
import OverlayShell from '../ui/OverlayShell'
import { Button, Card, Eyebrow, ProgressBar } from '../ui/primitives'
import type { CardRating } from '../../lib/content/flashcards'
import { effectiveMastery, statFor } from '../../lib/engine/mastery'
import { clamp, formatDuration } from '../../lib/format'
import { useAppState, useDispatch } from '../../lib/store/context'

type SelfStudyRunnerProps = {
  topicKey: string
  topicName: string
  examId: string | null
  subjectId: string
  targetMinutes: number
  onClose: () => void
}

const OPTIONS: { id: CardRating; label: string; hint: string; tone: string }[] = [
  {
    id: 'unknown',
    label: 'Still lost',
    hint: 'needs another go soon',
    tone: 'border-risk/40 bg-risk/10 text-risk',
  },
  {
    id: 'shaky',
    label: 'Getting there',
    hint: 'parts still shaky',
    tone: 'border-warn/40 bg-warn/10 text-warn',
  },
  {
    id: 'known',
    label: 'Solid',
    hint: 'could answer questions on it',
    tone: 'border-good/40 bg-good/10 text-good',
  },
]

function formatClock(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  return `${String(minutes).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`
}

export default function SelfStudyRunner({
  topicKey,
  topicName,
  examId,
  subjectId,
  targetMinutes,
  onClose,
}: SelfStudyRunnerProps) {
  const state = useAppState()
  const dispatch = useDispatch()
  const [startedAt] = useState(() => Date.now())
  const [before] = useState(() => effectiveMastery(statFor(state.stats, topicKey)))

  const [seconds, setSeconds] = useState(0)
  const [phase, setPhase] = useState<'running' | 'rating' | 'done'>('running')

  useEffect(() => {
    if (phase !== 'running') return
    const timer = window.setInterval(() => {
      setSeconds(Math.round((Date.now() - startedAt) / 1000))
    }, 1000)
    return () => window.clearInterval(timer)
  }, [phase, startedAt])

  function submit(rating: CardRating) {
    dispatch({
      type: 'recordSelfStudy',
      examId,
      subjectId,
      topicKey,
      label: `${topicName} self-study`,
      minutes: clamp(Math.round(seconds / 60), 1, 90),
      rating,
    })
    setPhase('done')
  }

  if (phase === 'done') {
    const after = effectiveMastery(statFor(state.stats, topicKey))
    const delta = after - before
    return (
      <OverlayShell
        title="Session logged"
        onClose={onClose}
        footer={
          <Button full size="lg" onClick={onClose}>
            Done
          </Button>
        }
      >
        <div className="animate-rise mb-5 flex justify-center">
          <Owl expression={delta > 0 ? 'proud' : 'encouraging'} size={104} />
        </div>
        <Card className="animate-rise p-5" sheen>
          <p className="text-[1.05rem] leading-snug font-bold tracking-tight text-fg">
            {formatDuration(Math.max(1, Math.round(seconds / 60)))} on {topicName}
          </p>
          <p className="mt-1.5 text-sm leading-relaxed text-muted">
            Mastery is now {after}%{delta !== 0 && ` (${delta > 0 ? '+' : ''}${delta})`}. Self-rated
            sessions move it more slowly than answered questions — that is deliberate.
          </p>
          <ProgressBar
            className="mt-4"
            thick
            value={after}
            label={`${topicName} mastery`}
            tone={after >= 75 ? 'good' : after >= 45 ? 'brand' : 'warn'}
          />
        </Card>
      </OverlayShell>
    )
  }

  return (
    <OverlayShell
      title={topicName}
      subtitle="Self-study"
      onClose={onClose}
      footer={
        phase === 'running' ? (
          <Button full size="lg" onClick={() => setPhase('rating')}>
            I’m done
          </Button>
        ) : undefined
      }
    >
      {phase === 'running' ? (
        <div className="animate-rise pt-6 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brand/12 text-brand">
            <ClockIcon className="h-6 w-6" />
          </span>
          <p className="tnum mt-6 text-[3.6rem] leading-none font-extrabold tracking-[-0.04em] text-fg">
            {formatClock(seconds)}
          </p>
          <p className="mt-3 text-sm text-muted">
            Target {formatDuration(targetMinutes)} on your own notes for this topic.
          </p>

          <Card className="mt-8 p-5 text-left">
            <Eyebrow tone="muted">Why this is timed, not quizzed</Eyebrow>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              This is a topic you added yourself, so StudyMate has no question bank for it.
              Work from your own material, then rate how it went — that rating feeds your
              mastery and readiness like any other session.
            </p>
          </Card>
        </div>
      ) : (
        <div className="animate-rise">
          <h2 className="text-[1.4rem] leading-tight font-bold tracking-tight text-fg">
            How did that go?
          </h2>
          <p className="mt-2 text-sm text-muted">
            Be honest — the plan adapts to whatever you say here.
          </p>

          <div className="mt-5 space-y-2.5">
            {OPTIONS.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => submit(option.id)}
                className={`w-full rounded-[18px] border px-4 py-4 text-left transition-colors active:scale-[0.99] ${option.tone}`}
              >
                <span className="block text-[0.95rem] font-semibold">{option.label}</span>
                <span className="mt-0.5 block text-xs opacity-75">{option.hint}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </OverlayShell>
  )
}
