import type { CardRating, CardSchedule } from '../content/flashcards'
import { readinessFor, upcomingExams } from '../engine/readiness'
import {
  applyAnswers,
  applyCardRatings,
  effectiveMastery,
  statFor,
  type AnswerResult,
} from '../engine/mastery'
import { isoDate } from '../format'
import { createInitialState } from './persistence'
import type { AppState, DayActivity, Exam, SessionKind, SessionLog } from './types'

const MAX_SESSIONS = 60
const MAX_SNAPSHOTS = 80

export type QuizTopicResult = {
  topicKey: string
  results: AnswerResult[]
}

export type Action =
  | { type: 'setName'; name: string }
  | { type: 'setGrade'; gradeId: string }
  | { type: 'setDailyGoal'; minutes: number }
  | { type: 'addExam'; exam: Exam }
  | { type: 'updateExam'; examId: string; patch: Partial<Exam> }
  | { type: 'deleteExam'; examId: string }
  | {
      type: 'recordQuiz'
      kind: SessionKind
      examId: string | null
      subjectId: string
      label: string
      minutes: number
      topics: QuizTopicResult[]
      now?: number
    }
  | {
      type: 'recordCards'
      examId: string | null
      subjectId: string
      topicKey: string
      label: string
      minutes: number
      updates: { cardId: string; rating: CardRating; schedule: CardSchedule }[]
      now?: number
    }
  | {
      type: 'recordSelfStudy'
      examId: string | null
      subjectId: string
      topicKey: string
      label: string
      minutes: number
      rating: CardRating
      now?: number
    }
  | { type: 'togglePlanItem'; id: string; now?: number }
  | { type: 'snapshotReadiness'; now?: number }
  | { type: 'reset' }

function bumpDay(
  days: Record<string, DayActivity>,
  now: number,
  patch: Partial<DayActivity>,
): Record<string, DayActivity> {
  const key = isoDate(new Date(now))
  const current = days[key] ?? { minutes: 0, sessions: 0, correct: 0, total: 0 }
  return {
    ...days,
    [key]: {
      minutes: current.minutes + (patch.minutes ?? 0),
      sessions: current.sessions + (patch.sessions ?? 0),
      correct: current.correct + (patch.correct ?? 0),
      total: current.total + (patch.total ?? 0),
    },
  }
}

/** Record where readiness stands now, so trends and deltas are real history. */
function snapshot(state: AppState, now: number): AppState {
  const exams = upcomingExams(state, now)
  if (exams.length === 0) return state

  let changed = false
  const updated = state.exams.map((exam) => {
    if (!exams.some((candidate) => candidate.id === exam.id)) return exam
    const score = readinessFor(exam, state, now).score
    const history = exam.readinessHistory ?? []
    const last = history[history.length - 1]
    if (last && last.score === score && now - last.at < 6 * 60 * 60 * 1000) return exam
    if (last && now - last.at < 60 * 1000) {
      // Collapse rapid-fire updates into the latest value.
      const trimmed = [...history.slice(0, -1), { at: now, score }]
      changed = true
      return { ...exam, readinessHistory: trimmed.slice(-MAX_SNAPSHOTS) }
    }
    changed = true
    return {
      ...exam,
      readinessHistory: [...history, { at: now, score }].slice(-MAX_SNAPSHOTS),
    }
  })

  return changed ? { ...state, exams: updated } : state
}

function logSession(state: AppState, entry: SessionLog): AppState {
  return { ...state, sessions: [entry, ...state.sessions].slice(0, MAX_SESSIONS) }
}

function averageMastery(state: AppState, keys: string[], now: number): number {
  if (keys.length === 0) return 0
  const total = keys.reduce(
    (sum, key) => sum + effectiveMastery(statFor(state.stats, key), now),
    0,
  )
  return Math.round(total / keys.length)
}

export function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'setName':
      return { ...state, profile: { ...state.profile, name: action.name.trim() } }

    case 'setGrade':
      return { ...state, profile: { ...state.profile, gradeId: action.gradeId } }

    case 'setDailyGoal':
      return {
        ...state,
        profile: { ...state.profile, dailyGoalMinutes: Math.round(action.minutes) },
      }

    case 'addExam': {
      const next = { ...state, exams: [...state.exams, action.exam] }
      return snapshot(next, Date.now())
    }

    case 'updateExam':
      return {
        ...state,
        exams: state.exams.map((exam) =>
          exam.id === action.examId ? { ...exam, ...action.patch } : exam,
        ),
      }

    case 'deleteExam':
      return { ...state, exams: state.exams.filter((exam) => exam.id !== action.examId) }

    case 'recordQuiz': {
      const now = action.now ?? Date.now()
      const keys = action.topics.map((topic) => topic.topicKey)
      const before = averageMastery(state, keys, now)
      const perTopicMinutes =
        action.topics.length === 0 ? 0 : action.minutes / action.topics.length

      let stats = state.stats
      for (const topic of action.topics) {
        stats = {
          ...stats,
          [topic.topicKey]: applyAnswers(
            statFor(stats, topic.topicKey),
            topic.results,
            perTopicMinutes,
            now,
          ),
        }
      }

      const correct = action.topics.reduce(
        (sum, topic) => sum + topic.results.filter((result) => result.correct).length,
        0,
      )
      const total = action.topics.reduce((sum, topic) => sum + topic.results.length, 0)

      let next: AppState = {
        ...state,
        stats,
        days: bumpDay(state.days, now, {
          minutes: action.minutes,
          sessions: 1,
          correct,
          total,
        }),
      }

      if (action.kind === 'assessment' && action.examId) {
        next = {
          ...next,
          exams: next.exams.map((exam) =>
            exam.id === action.examId ? { ...exam, assessedAt: now } : exam,
          ),
        }
      }

      next = logSession(next, {
        id: `session-${now}`,
        at: now,
        kind: action.kind,
        examId: action.examId,
        subjectId: action.subjectId,
        topicKeys: keys,
        label: action.label,
        minutes: action.minutes,
        correct,
        total,
        masteryBefore: before,
        masteryAfter: averageMastery(next, keys, now),
      })

      return snapshot(next, now)
    }

    case 'recordCards': {
      const now = action.now ?? Date.now()
      const before = averageMastery(state, [action.topicKey], now)
      const stats = {
        ...state.stats,
        [action.topicKey]: applyCardRatings(
          statFor(state.stats, action.topicKey),
          action.updates,
          action.minutes,
          now,
        ),
      }

      const known = action.updates.filter((update) => update.rating === 'known').length

      let next: AppState = {
        ...state,
        stats,
        days: bumpDay(state.days, now, {
          minutes: action.minutes,
          sessions: 1,
          correct: known,
          total: action.updates.length,
        }),
      }

      next = logSession(next, {
        id: `session-${now}`,
        at: now,
        kind: 'flashcards',
        examId: action.examId,
        subjectId: action.subjectId,
        topicKeys: [action.topicKey],
        label: action.label,
        minutes: action.minutes,
        correct: known,
        total: action.updates.length,
        masteryBefore: before,
        masteryAfter: averageMastery(next, [action.topicKey], now),
      })

      return snapshot(next, now)
    }

    case 'recordSelfStudy': {
      const now = action.now ?? Date.now()
      const value = action.rating === 'known' ? 1 : action.rating === 'shaky' ? 0.6 : 0.25
      const results: AnswerResult[] = Array.from({ length: 3 }, (_, index) => ({
        itemId: `self-${now}-${index}`,
        correct: index < Math.round(value * 3),
        difficulty: 2,
      }))
      const before = averageMastery(state, [action.topicKey], now)

      const stats = {
        ...state.stats,
        [action.topicKey]: applyAnswers(
          statFor(state.stats, action.topicKey),
          results,
          action.minutes,
          now,
        ),
      }

      let next: AppState = {
        ...state,
        stats,
        days: bumpDay(state.days, now, { minutes: action.minutes, sessions: 1 }),
      }

      next = logSession(next, {
        id: `session-${now}`,
        at: now,
        kind: 'review',
        examId: action.examId,
        subjectId: action.subjectId,
        topicKeys: [action.topicKey],
        label: action.label,
        minutes: action.minutes,
        correct: results.filter((result) => result.correct).length,
        total: results.length,
        masteryBefore: before,
        masteryAfter: averageMastery(next, [action.topicKey], now),
      })

      return snapshot(next, now)
    }

    case 'togglePlanItem': {
      const key = isoDate(new Date(action.now ?? Date.now()))
      const current = state.planDone[key] ?? []
      const next = current.includes(action.id)
        ? current.filter((id) => id !== action.id)
        : [...current, action.id]
      return { ...state, planDone: { ...state.planDone, [key]: next } }
    }

    case 'snapshotReadiness':
      return snapshot(state, action.now ?? Date.now())

    case 'reset':
      return createInitialState()

    default:
      return state
  }
}
