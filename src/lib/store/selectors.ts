import { findTopic } from '../curriculum'
import type { PlanItem, StudyMode } from '../engine/planner'
import { isoDate } from '../format'
import type { AppState, Exam, SessionKind } from './types'

export function examById(state: AppState, id: string | null): Exam | null {
  if (!id) return null
  return state.exams.find((exam) => exam.id === id) ?? null
}

export function topicLabel(state: AppState, key: string): string {
  for (const exam of state.exams) {
    const match = exam.topics.find((topic) => topic.key === key)
    if (match) return match.name
  }
  return findTopic(key)?.topic.name ?? 'Topic'
}

export function minutesToday(state: AppState, now: number = Date.now()): number {
  return state.days[isoDate(new Date(now))]?.minutes ?? 0
}

export function remainingMinutesToday(state: AppState, now: number = Date.now()): number {
  return Math.max(0, state.profile.dailyGoalMinutes - minutesToday(state, now))
}

const MODE_TO_KIND: Record<StudyMode, SessionKind> = {
  assessment: 'assessment',
  flashcards: 'flashcards',
  practice: 'practice',
  review: 'review',
}

/** A plan item counts as done when it was ticked, or actually studied today. */
export function isPlanItemDone(
  state: AppState,
  item: PlanItem,
  now: number = Date.now(),
): boolean {
  const today = isoDate(new Date(now))
  if ((state.planDone[today] ?? []).includes(item.id)) return true

  const startOfDay = new Date(now)
  startOfDay.setHours(0, 0, 0, 0)

  return state.sessions.some(
    (session) =>
      session.at >= startOfDay.getTime() &&
      session.kind === MODE_TO_KIND[item.mode] &&
      session.topicKeys.includes(item.topicKey),
  )
}

export function sessionsToday(state: AppState, now: number = Date.now()): number {
  return state.days[isoDate(new Date(now))]?.sessions ?? 0
}

/** Every topic the learner has data on, newest activity first. */
export function studiedTopics(state: AppState): { key: string; lastStudiedAt: number }[] {
  return Object.entries(state.stats)
    .filter(([, stat]) => stat.lastStudiedAt !== null)
    .map(([key, stat]) => ({ key, lastStudiedAt: stat.lastStudiedAt ?? 0 }))
    .sort((a, b) => b.lastStudiedAt - a.lastStudiedAt)
}
