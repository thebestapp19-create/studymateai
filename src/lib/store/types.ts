import type { CardSchedule } from '../content/flashcards'

export type TopicStat = {
  attempts: number
  correct: number
  /** Exponentially weighted accuracy, 0–1: recent answers matter more. */
  accuracy: number
  minutes: number
  sessions: number
  lastStudiedAt: number | null
  /** Flashcard scheduling, keyed by card id. */
  cards: Record<string, CardSchedule>
  /** Mastery snapshots for the progress chart. */
  history: { at: number; mastery: number }[]
  /** Ids of questions already asked, so sessions stay fresh. */
  seen: string[]
}

export type ExamTopic = {
  /** `subjectId:topicId`, or `custom:examId:slug` for the user's own topics. */
  key: string
  name: string
  custom?: boolean
}

export type Exam = {
  id: string
  title: string
  subjectId: string
  gradeId: string
  /** ISO date, e.g. "2026-06-18". */
  date: string
  topics: ExamTopic[]
  createdAt: number
  assessedAt: number | null
  readinessHistory: { at: number; score: number }[]
}

export type SessionKind = 'assessment' | 'practice' | 'flashcards' | 'review'

export type SessionLog = {
  id: string
  at: number
  kind: SessionKind
  examId: string | null
  subjectId: string
  topicKeys: string[]
  label: string
  minutes: number
  correct: number
  total: number
  masteryBefore: number
  masteryAfter: number
}

export type DayActivity = {
  minutes: number
  sessions: number
  correct: number
  total: number
}

export type Profile = {
  name: string
  gradeId: string | null
  dailyGoalMinutes: number
  createdAt: number
}

export type AppState = {
  version: number
  profile: Profile
  exams: Exam[]
  /** Topic stats keyed by topic key — knowledge is shared between exams. */
  stats: Record<string, TopicStat>
  /** Newest first, capped. */
  sessions: SessionLog[]
  /** Keyed by ISO date. */
  days: Record<string, DayActivity>
  /** Plan items ticked off by hand, keyed by ISO date. */
  planDone: Record<string, string[]>
}
