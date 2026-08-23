import { useMemo, useState } from 'react'
import { ArrowRightIcon, CalendarIcon, CheckIcon, PlusIcon } from '../components/icons'
import DatePicker from '../components/ui/DatePicker'
import OverlayShell from '../components/ui/OverlayShell'
import { Button, Card, Chip, Eyebrow, SubjectMark } from '../components/ui/primitives'
import {
  GRADES,
  SUBJECTS,
  bandOf,
  customTopicKey,
  subjectById,
  topicKey,
  topicsForBand,
} from '../lib/curriculum'
import { formatLongDate, plural } from '../lib/format'
import { useNav } from '../lib/nav'
import { useAppState, useDispatch } from '../lib/store/context'
import type { Exam, ExamTopic } from '../lib/store/types'

type Step = 0 | 1 | 2

const STEP_TITLE = ['Which subject?', 'When is it?', 'What does it cover?']

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40)
}

export default function NewExamScreen() {
  const nav = useNav()
  const state = useAppState()
  const dispatch = useDispatch()

  const [examId] = useState(() => `exam-${Date.now().toString(36)}`)
  const [step, setStep] = useState<Step>(0)
  const [subjectId, setSubjectId] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [gradeId, setGradeId] = useState<string>(state.profile.gradeId ?? 'g10')
  const [date, setDate] = useState<string | null>(null)
  const [selected, setSelected] = useState<string[]>([])
  const [custom, setCustom] = useState<ExamTopic[]>([])
  const [customDraft, setCustomDraft] = useState('')

  const subject = subjectId ? subjectById(subjectId) : undefined
  const band = bandOf(gradeId)
  const suggested = useMemo(
    () => (subject ? topicsForBand(subject, band) : []),
    [subject, band],
  )

  function chooseSubject(id: string) {
    setSubjectId(id)
    const picked = subjectById(id)
    if (picked && title.trim() === '') setTitle(`${picked.name} exam`)
    // Default to the full syllabus for this level; trimming is one tap away.
    setSelected(picked ? topicsForBand(picked, band).map((topic) => topicKey(id, topic.id)) : [])
    setStep(1)
  }

  function toggleTopic(key: string) {
    setSelected((current) =>
      current.includes(key) ? current.filter((item) => item !== key) : [...current, key],
    )
  }

  function addCustomTopic() {
    const name = customDraft.trim()
    if (name.length === 0) return
    const key = customTopicKey(examId, slugify(name) || `topic-${custom.length + 1}`)
    if (custom.some((topic) => topic.key === key)) return
    setCustom((current) => [...current, { key, name, custom: true }])
    setCustomDraft('')
  }

  const totalTopics = selected.length + custom.length
  const canContinue =
    step === 0 ? subjectId !== null : step === 1 ? date !== null && title.trim() !== '' : totalTopics > 0

  function create() {
    if (!subjectId || !date || totalTopics === 0) return

    const topics: ExamTopic[] = [
      ...selected.map((key) => {
        const topic = suggested.find((candidate) => topicKey(subjectId, candidate.id) === key)
        return { key, name: topic?.name ?? key }
      }),
      ...custom,
    ]

    const exam: Exam = {
      id: examId,
      title: title.trim(),
      subjectId,
      gradeId,
      date,
      topics,
      createdAt: Date.now(),
      assessedAt: null,
      readinessHistory: [],
    }

    dispatch({ type: 'addExam', exam })
    if (state.profile.gradeId !== gradeId) dispatch({ type: 'setGrade', gradeId })
    nav.close()
    nav.openExam(exam.id)
    nav.toast('Exam added — start with the level check')
  }

  return (
    <OverlayShell
      title="New exam"
      subtitle={STEP_TITLE[step]}
      progress={((step + 1) / 3) * 100}
      onBack={step > 0 ? () => setStep((current) => (current - 1) as Step) : undefined}
      onClose={nav.close}
      footer={
        <Button
          full
          size="lg"
          disabled={!canContinue}
          onClick={() => (step === 2 ? create() : setStep((current) => (current + 1) as Step))}
        >
          {step === 2 ? 'Create exam' : 'Continue'}
          <ArrowRightIcon className="h-4.5 w-4.5" />
        </Button>
      }
    >
      {step === 0 && (
        <div className="animate-rise">
          <h2 className="text-[1.6rem] leading-tight font-bold tracking-tight text-fg">
            Which subject is the exam in?
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            This decides the topics, the questions and the difficulty you will see.
          </p>

          <div className="mt-5 grid gap-2">
            {SUBJECTS.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => chooseSubject(option.id)}
                className={`flex items-center gap-3 rounded-[18px] border px-3.5 py-3 text-left transition-colors ${
                  subjectId === option.id
                    ? 'border-brand/50 bg-brand/[0.08]'
                    : 'border-line bg-card hover:border-line-strong'
                }`}
              >
                <SubjectMark name={option.name} active={subjectId === option.id} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[0.95rem] font-semibold tracking-tight text-fg">
                    {option.name}
                  </span>
                  <span className="mt-0.5 block truncate text-xs text-faint">
                    {option.tagline}
                  </span>
                </span>
                {subjectId === option.id && <CheckIcon className="h-4 w-4 text-brand" />}
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="animate-rise">
          <label htmlFor="exam-title" className="block">
            <Eyebrow tone="muted">Exam name</Eyebrow>
            <input
              id="exam-title"
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              maxLength={40}
              placeholder="e.g. Biology mock"
              className="mt-2 w-full rounded-2xl border border-line bg-card px-4 py-3.5 text-[1.05rem] font-medium text-fg transition-colors outline-none placeholder:text-faint focus:border-brand/70 focus:bg-raised"
            />
          </label>

          <div className="mt-6">
            <Eyebrow tone="muted">Your level</Eyebrow>
            <p className="mt-1.5 text-xs text-faint">
              Questions, topics and explanations are pitched to this.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {GRADES.map((grade) => (
                <Chip
                  key={grade.id}
                  selected={grade.id === gradeId}
                  onClick={() => {
                    setGradeId(grade.id)
                    if (subjectId) {
                      const picked = subjectById(subjectId)
                      setSelected(
                        picked
                          ? topicsForBand(picked, bandOf(grade.id)).map((topic) =>
                              topicKey(subjectId, topic.id),
                            )
                          : [],
                      )
                    }
                  }}
                >
                  {grade.id === gradeId && <CheckIcon className="h-3 w-3" />}
                  {grade.label}
                </Chip>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <Eyebrow tone="muted">Exam date</Eyebrow>
            <p className="mt-1.5 flex items-center gap-1.5 text-sm font-medium text-fg">
              <CalendarIcon className="h-4 w-4 text-brand" />
              {date ? formatLongDate(date) : 'Pick a date'}
            </p>
            <div className="mt-3">
              <DatePicker value={date} onChange={setDate} />
            </div>
          </div>
        </div>
      )}

      {step === 2 && subject && (
        <div className="animate-rise">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-[1.4rem] leading-tight font-bold tracking-tight text-fg">
                Topics covered
              </h2>
              <p className="mt-1.5 text-sm text-muted">
                {totalTopics} of {suggested.length + custom.length} selected · tuned for{' '}
                {GRADES.find((grade) => grade.id === gradeId)?.label}
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                setSelected(
                  selected.length === suggested.length
                    ? []
                    : suggested.map((topic) => topicKey(subject.id, topic.id)),
                )
              }
              className="shrink-0 text-xs font-semibold text-brand"
            >
              {selected.length === suggested.length ? 'Clear all' : 'Select all'}
            </button>
          </div>

          <ul className="mt-4 space-y-2">
            {suggested.map((topic) => {
              const key = topicKey(subject.id, topic.id)
              const active = selected.includes(key)
              return (
                <li key={key}>
                  <button
                    type="button"
                    onClick={() => toggleTopic(key)}
                    aria-pressed={active}
                    className={`flex w-full items-start gap-3 rounded-[18px] border px-3.5 py-3 text-left transition-colors ${
                      active
                        ? 'border-brand/45 bg-brand/[0.07]'
                        : 'border-line bg-card hover:border-line-strong'
                    }`}
                  >
                    <span
                      className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors ${
                        active
                          ? 'border-brand bg-brand text-white'
                          : 'border-line-strong text-transparent'
                      }`}
                    >
                      <CheckIcon className="h-3 w-3" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[0.92rem] font-semibold tracking-tight text-fg">
                        {topic.name}
                      </span>
                      <span className="mt-0.5 block text-xs leading-relaxed text-faint">
                        {topic.summary}
                      </span>
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>

          <Card className="mt-4 p-4">
            <Eyebrow tone="muted">Something not listed?</Eyebrow>
            <p className="mt-1.5 text-xs leading-relaxed text-faint">
              Add your own topic. StudyMate has no question bank for it, so it will be
              tracked with timed self-study sessions instead.
            </p>
            <div className="mt-3 flex gap-2">
              <input
                type="text"
                value={customDraft}
                onChange={(event) => setCustomDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault()
                    addCustomTopic()
                  }
                }}
                maxLength={40}
                placeholder="Your own topic"
                className="min-w-0 flex-1 rounded-xl border border-line bg-raised px-3.5 py-2.5 text-sm text-fg outline-none placeholder:text-faint focus:border-brand/70"
              />
              <Button
                size="sm"
                variant="secondary"
                onClick={addCustomTopic}
                disabled={customDraft.trim() === ''}
              >
                <PlusIcon className="h-4 w-4" />
                Add
              </Button>
            </div>

            {custom.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {custom.map((topic) => (
                  <Chip
                    key={topic.key}
                    selected
                    onClick={() =>
                      setCustom((current) => current.filter((item) => item.key !== topic.key))
                    }
                  >
                    {topic.name}
                    <span className="text-brand/70">×</span>
                  </Chip>
                ))}
              </div>
            )}
          </Card>

          <p className="mt-4 text-center text-xs text-faint">
            {totalTopics} {plural(totalTopics, 'topic')} will be tracked separately for
            mastery and readiness.
          </p>
        </div>
      )}
    </OverlayShell>
  )
}
