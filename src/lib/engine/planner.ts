import { isCustomTopic } from '../curriculum'
import { clamp, daysUntil } from '../format'
import type { AppState, Exam } from '../store/types'
import { cardScore, effectiveMastery, hasData, statFor } from './mastery'
import { estimateGain, readinessFor, upcomingExams } from './readiness'

export type StudyMode = 'assessment' | 'flashcards' | 'practice' | 'review'

export type PlanItem = {
  id: string
  examId: string
  examTitle: string
  subjectId: string
  topicKey: string
  topicName: string
  custom: boolean
  mode: StudyMode
  minutes: number
  reason: string
  gain: number
  priority: number
}

export const MODE_LABEL: Record<StudyMode, string> = {
  assessment: 'Level check',
  flashcards: 'Flashcards',
  practice: 'Practice',
  review: 'Review',
}

export const MODE_VERB: Record<StudyMode, string> = {
  assessment: 'Take the level check',
  flashcards: 'Run flashcards on',
  practice: 'Practise',
  review: 'Review',
}

/** Closer exams matter more, but never to the exclusion of everything else. */
function urgency(days: number): number {
  return clamp(3 / (1 + Math.max(0, days) / 6), 0.3, 3)
}

function daysSince(timestamp: number | null, now: number): number {
  if (!timestamp) return Infinity
  return Math.max(0, (now - timestamp) / 86_400_000)
}

function chooseMode(
  state: AppState,
  topicKey: string,
  custom: boolean,
  now: number,
): StudyMode {
  if (custom || isCustomTopic(topicKey)) return 'review'
  const stat = statFor(state.stats, topicKey)
  const mastery = effectiveMastery(stat, now)
  const cards = cardScore(stat.cards)

  if (!hasData(stat)) return 'flashcards'
  if (mastery < 45 && cards.rated < 6) return 'flashcards'
  if (mastery < 78) return 'practice'
  return daysSince(stat.lastStudiedAt, now) > 5 ? 'review' : 'practice'
}

function reasonFor(
  mode: StudyMode,
  input: { topicName: string; mastery: number; started: boolean; stale: number; rank: number },
): string {
  if (mode === 'assessment') {
    return 'A five-minute level check tells the planner where to aim everything else.'
  }
  if (!input.started) {
    return 'No data on this topic yet — one pass shows exactly where you stand.'
  }
  if (input.mastery < 45) {
    return input.rank === 0
      ? `Your weakest topic at ${input.mastery}% — the fastest readiness win available.`
      : `Still shaky at ${input.mastery}% mastery.`
  }
  if (input.stale > 6) {
    return `${input.mastery}% mastery but untouched for ${Math.round(input.stale)} days — a review holds it in place.`
  }
  if (input.mastery < 78) {
    return `${input.mastery}% mastery. A focused set should push this past 78%.`
  }
  return `Strong at ${input.mastery}% — a short review keeps it there.`
}

type Candidate = Omit<PlanItem, 'minutes'>

function candidatesFor(state: AppState, now: number): Candidate[] {
  const candidates: Candidate[] = []

  const queue = upcomingExams(state, now).slice(0, 4)

  for (const [index, exam] of queue.entries()) {
    const days = daysUntil(exam.date, new Date(now))
    // The nearest exam owns the day; later ones stay in view without taking it over.
    const focusWeight = index === 0 ? 1 : 0.7
    const examUrgency = urgency(days) * focusWeight
    const report = readinessFor(exam, state, now)

    if (!exam.assessedAt && exam.topics.some((topic) => !topic.custom)) {
      const unmeasured =
        report.topics.length === 0
          ? 1
          : report.untouched.length / report.topics.length

      candidates.push({
        id: `${exam.id}:assessment`,
        examId: exam.id,
        examTitle: exam.title,
        subjectId: exam.subjectId,
        topicKey: exam.topics[0].key,
        topicName: exam.title,
        custom: false,
        mode: 'assessment',
        reason: reasonFor('assessment', {
          topicName: exam.title,
          mastery: 0,
          started: false,
          stale: 0,
          rank: 0,
        }),
        gain: Math.max(4, Math.round(12 - report.score / 12)),
        // Worth a lot when the exam is a blank sheet, much less once measured.
        priority: examUrgency * (1.15 + 1.35 * unmeasured),
      })
    }

    const ranked = [...exam.topics]
      .map((topic) => ({
        topic,
        mastery: effectiveMastery(statFor(state.stats, topic.key), now),
      }))
      .sort((a, b) => a.mastery - b.mastery)

    ranked.forEach(({ topic, mastery }, rank) => {
      const stat = statFor(state.stats, topic.key)
      const started = hasData(stat)
      const stale = daysSince(stat.lastStudiedAt, now)
      const mode = chooseMode(state, topic.key, Boolean(topic.custom), now)
      const gap = (100 - mastery) / 100 + (started ? 0 : 0.18)
      const staleness = Number.isFinite(stale) ? clamp(stale / 30, 0, 0.35) : 0.2

      candidates.push({
        id: `${exam.id}:${topic.key}:${mode}`,
        examId: exam.id,
        examTitle: exam.title,
        subjectId: exam.subjectId,
        topicKey: topic.key,
        topicName: topic.name,
        custom: Boolean(topic.custom),
        mode,
        reason: reasonFor(mode, { topicName: topic.name, mastery, started, stale, rank }),
        gain: topic.custom ? 0 : estimateGain(exam, state, topic.key, report.score, now),
        priority: examUrgency * (gap + staleness),
      })
    })
  }

  return candidates.sort((a, b) => b.priority - a.priority)
}

/**
 * Today's plan: at most three things, weighted towards the weakest topics of
 * the nearest exam, sized to the time the learner has said they have.
 */
export function buildDailyPlan(
  state: AppState,
  now: number = Date.now(),
  size = 3,
): PlanItem[] {
  const candidates = candidatesFor(state, now)
  const picked: Candidate[] = []
  const usedTopics = new Set<string>()

  for (const candidate of candidates) {
    if (picked.length >= size) break
    if (usedTopics.has(candidate.topicKey) && candidate.mode !== 'assessment') continue
    usedTopics.add(candidate.topicKey)
    picked.push(candidate)
  }

  if (picked.length === 0) return []

  const budget = clamp(state.profile.dailyGoalMinutes, 15, 240)
  const totalPriority = picked.reduce((sum, item) => sum + item.priority, 0) || 1

  return picked.map((item) => {
    const share = (budget * item.priority) / totalPriority
    const minutes = clamp(Math.round(share / 5) * 5, 10, 45)
    return { ...item, minutes }
  })
}

export function nextBestAction(state: AppState, now: number = Date.now()): PlanItem | null {
  return buildDailyPlan(state, now, 1)[0] ?? null
}

/** The single weakest topic across every upcoming exam. */
export function weakestTopic(
  state: AppState,
  now: number = Date.now(),
): { exam: Exam; topicKey: string; topicName: string; mastery: number; started: boolean } | null {
  let weakest: {
    exam: Exam
    topicKey: string
    topicName: string
    mastery: number
    started: boolean
  } | null = null

  for (const exam of upcomingExams(state, now)) {
    for (const topic of exam.topics) {
      const stat = statFor(state.stats, topic.key)
      const started = hasData(stat)
      if (!started) continue
      const mastery = effectiveMastery(stat, now)
      if (!weakest || mastery < weakest.mastery) {
        weakest = { exam, topicKey: topic.key, topicName: topic.name, mastery, started }
      }
    }
  }

  return weakest
}
