import { useState } from 'react'
import FlashcardRunner from '../components/session/FlashcardRunner'
import QuizRunner from '../components/session/QuizRunner'
import SelfStudyRunner from '../components/session/SelfStudyRunner'
import OverlayShell from '../components/ui/OverlayShell'
import { Button, Card } from '../components/ui/primitives'
import { bandOf, isCustomTopic } from '../lib/curriculum'
import { clamp } from '../lib/format'
import { useNav, type SessionConfig } from '../lib/nav'
import { useAppState } from '../lib/store/context'
import { examById } from '../lib/store/selectors'

export default function SessionScreen({ config }: { config: SessionConfig }) {
  const nav = useNav()
  const state = useAppState()
  const [runId, setRunId] = useState(0)

  const exam = examById(state, config.examId)
  const band = bandOf(exam?.gradeId ?? state.profile.gradeId ?? undefined)
  const restart = () => setRunId((value) => value + 1)

  if (config.mode === 'assessment') {
    const topics = (exam?.topics ?? []).filter((topic) => !topic.custom && !isCustomTopic(topic.key))

    if (!exam || topics.length === 0) {
      return (
        <OverlayShell title="Level check" onClose={nav.close}>
          <Card className="p-6 text-center">
            <p className="text-sm text-muted">
              This exam only has topics you added yourself, so there is nothing to test
              automatically. Use a self-study session instead.
            </p>
            <Button className="mt-4" onClick={nav.close}>
              Back
            </Button>
          </Card>
        </OverlayShell>
      )
    }

    return (
      <QuizRunner
        key={runId}
        kind="assessment"
        title={`${exam.title} level check`}
        subtitle="Finding your starting point"
        examId={exam.id}
        subjectId={exam.subjectId}
        band={band}
        topics={topics.map((topic) => ({ key: topic.key, name: topic.name }))}
        total={clamp(topics.length * 2, 6, 10)}
        onClose={nav.close}
      />
    )
  }

  const topicKey = config.topicKey
  const topicName = config.topicName ?? 'Topic'

  if (!topicKey) {
    return (
      <OverlayShell title="Study" onClose={nav.close}>
        <Card className="p-6 text-center">
          <p className="text-sm text-muted">Pick a topic to study.</p>
          <Button className="mt-4" onClick={nav.close}>
            Back
          </Button>
        </Card>
      </OverlayShell>
    )
  }

  const custom = isCustomTopic(topicKey)

  if (custom || (config.mode === 'review' && custom)) {
    return (
      <SelfStudyRunner
        key={runId}
        topicKey={topicKey}
        topicName={topicName}
        examId={config.examId}
        subjectId={config.subjectId}
        targetMinutes={20}
        onClose={nav.close}
      />
    )
  }

  if (config.mode === 'flashcards' || config.mode === 'review') {
    return (
      <FlashcardRunner
        key={runId}
        topicKey={topicKey}
        topicName={topicName}
        examId={config.examId}
        subjectId={config.subjectId}
        band={band}
        size={config.mode === 'review' ? 8 : 10}
        onClose={nav.close}
        onRestart={restart}
      />
    )
  }

  return (
    <QuizRunner
      key={runId}
      kind="practice"
      title={topicName}
      subtitle="Practice"
      examId={config.examId}
      subjectId={config.subjectId}
      band={band}
      topics={[{ key: topicKey, name: topicName }]}
      total={8}
      onClose={nav.close}
      onRestart={restart}
    />
  )
}
