import { useState } from 'react'
import { CheckIcon, ClockIcon, ShieldIcon, TrashIcon } from '../components/icons'
import Owl from '../components/Owl'
import Sheet from '../components/ui/Sheet'
import { Button, Card, Chip, Eyebrow, SectionHeading } from '../components/ui/primitives'
import { GRADES, gradeById } from '../lib/curriculum'
import { studyStreak } from '../lib/engine/insights'
import { OWL_NAME, partnerSummary } from '../lib/engine/mascot'
import { clamp, formatDuration, plural } from '../lib/format'
import { useNav } from '../lib/nav'
import { clearState } from '../lib/store/persistence'
import { useAppState, useDispatch } from '../lib/store/context'

const GOAL_STEP = 15
const GOAL_MIN = 15
const GOAL_MAX = 180

export default function ProfileScreen() {
  const state = useAppState()
  const dispatch = useDispatch()
  const nav = useNav()

  const [name, setName] = useState(state.profile.name)
  const [confirmReset, setConfirmReset] = useState(false)

  const grade = gradeById(state.profile.gradeId ?? undefined)
  const partner = partnerSummary(state)
  const totalMinutes = Object.values(state.days).reduce((sum, day) => sum + day.minutes, 0)
  const streak = studyStreak(state)

  function commitName() {
    const trimmed = name.trim()
    if (trimmed.length === 0) {
      setName(state.profile.name)
      return
    }
    if (trimmed !== state.profile.name) {
      dispatch({ type: 'setName', name: trimmed })
      nav.toast('Name updated')
    }
  }

  function adjustGoal(delta: number) {
    dispatch({
      type: 'setDailyGoal',
      minutes: clamp(state.profile.dailyGoalMinutes + delta, GOAL_MIN, GOAL_MAX),
    })
  }

  return (
    <div className="px-5 pt-6 pb-8">
      <header className="animate-rise">
        <h1 className="text-[1.8rem] leading-none font-extrabold tracking-[-0.03em] text-fg">
          Profile
        </h1>
        <p className="mt-1.5 text-sm text-muted">
          {streak > 0
            ? `${streak} ${plural(streak, 'day')} in a row · ${formatDuration(totalMinutes)} studied in total`
            : `${formatDuration(totalMinutes)} studied in total`}
        </p>
      </header>

      <section className="mt-6">
        <Card className="flex items-center gap-3.5 p-4" sheen>
          <Owl expression="happy" size={64} className="shrink-0" />
          <div className="min-w-0">
            <p className="text-[0.95rem] font-bold tracking-tight text-fg">
              {OWL_NAME} · your study partner
            </p>
            <p className="mt-1 text-xs leading-relaxed text-muted">{partner.line}</p>
            {partner.sessions > 0 && (
              <p className="mt-1 text-[0.7rem] text-faint">
                Studying together since {partner.since.toLowerCase()}
              </p>
            )}
          </div>
        </Card>
      </section>

      <section className="mt-6">
        <label htmlFor="profile-name" className="block">
          <Eyebrow tone="muted">Your name</Eyebrow>
          <input
            id="profile-name"
            type="text"
            value={name}
            maxLength={24}
            onChange={(event) => setName(event.target.value)}
            onBlur={commitName}
            onKeyDown={(event) => {
              if (event.key === 'Enter') event.currentTarget.blur()
            }}
            className="mt-2 w-full rounded-2xl border border-line bg-card px-4 py-3.5 text-[1.05rem] font-medium text-fg transition-colors outline-none focus:border-brand/70 focus:bg-raised"
          />
        </label>
      </section>

      <section className="mt-6">
        <Eyebrow tone="muted">Your level</Eyebrow>
        <p className="mt-1.5 text-xs leading-relaxed text-faint">
          Sets the default difficulty and topic list for new exams. Existing exams keep the
          level you chose for them.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {GRADES.map((option) => (
            <Chip
              key={option.id}
              selected={option.id === state.profile.gradeId}
              onClick={() => {
                dispatch({ type: 'setGrade', gradeId: option.id })
                nav.toast(`Level set to ${option.label}`)
              }}
            >
              {option.id === state.profile.gradeId && <CheckIcon className="h-3 w-3" />}
              {option.label}
            </Chip>
          ))}
        </div>
        {grade && (
          <p className="mt-2.5 text-xs text-faint">
            Content is pitched at {grade.label.toLowerCase()} level.
          </p>
        )}
      </section>

      <section className="mt-7">
        <SectionHeading title="Daily study goal" hint="what your plan is sized to" />
        <Card className="flex items-center gap-4 p-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand/12 text-brand">
            <ClockIcon className="h-5 w-5" />
          </span>
          <span className="tnum flex-1 text-2xl font-bold tracking-tight text-fg">
            {formatDuration(state.profile.dailyGoalMinutes)}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              aria-label="Reduce daily goal"
              disabled={state.profile.dailyGoalMinutes <= GOAL_MIN}
              onClick={() => adjustGoal(-GOAL_STEP)}
              className="h-9 w-9 rounded-full border border-line text-muted transition-colors hover:border-line-strong hover:text-fg disabled:opacity-30"
            >
              −
            </button>
            <button
              type="button"
              aria-label="Increase daily goal"
              disabled={state.profile.dailyGoalMinutes >= GOAL_MAX}
              onClick={() => adjustGoal(GOAL_STEP)}
              className="h-9 w-9 rounded-full border border-line text-muted transition-colors hover:border-line-strong hover:text-fg disabled:opacity-30"
            >
              +
            </button>
          </div>
        </Card>
      </section>

      <section className="mt-7">
        <SectionHeading title="Your data" />
        <Card className="flex gap-3 p-4">
          <ShieldIcon className="mt-0.5 h-4 w-4 shrink-0 text-muted" />
          <p className="text-xs leading-relaxed text-faint">
            Everything — your name, exams, answers and mastery — is stored only in this
            browser. There is no account and nothing is uploaded.
          </p>
        </Card>

        <button
          type="button"
          onClick={() => setConfirmReset(true)}
          className="mt-2 flex w-full items-center gap-3 rounded-[18px] border border-line bg-card px-4 py-3.5 text-left transition-colors hover:border-risk/40"
        >
          <TrashIcon className="h-4 w-4 text-risk" />
          <span className="flex-1 text-sm font-medium text-risk">Reset everything</span>
        </button>
      </section>

      {confirmReset && (
        <Sheet
          title="Reset everything"
          onClose={() => setConfirmReset(false)}
          footer={
            <div className="flex gap-2">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => setConfirmReset(false)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                className="flex-1"
                onClick={() => {
                  clearState()
                  dispatch({ type: 'reset' })
                  setConfirmReset(false)
                }}
              >
                Reset
              </Button>
            </div>
          }
        >
          <p className="text-sm leading-relaxed text-muted">
            This deletes your exams, every answer you have given and all mastery history,
            and takes you back to the first screen. It cannot be undone.
          </p>
        </Sheet>
      )}
    </div>
  )
}
