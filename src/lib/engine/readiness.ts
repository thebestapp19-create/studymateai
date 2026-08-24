import { clamp, daysUntil, isoDate } from '../format'
import type { AppState, Exam, TopicStat } from '../store/types'
import {
  confidenceOf,
  effectiveMastery,
  hasData,
  masteryOf,
  projectImprovement,
  statFor,
} from './mastery'

export type TopicStatus = 'untouched' | 'weak' | 'building' | 'strong'

export type TopicReadiness = {
  key: string
  name: string
  custom: boolean
  mastery: number
  rawMastery: number
  confidence: number
  attempts: number
  status: TopicStatus
  contribution: number
  lastStudiedAt: number | null
}

export type ReadinessDriver = {
  label: string
  detail: string
  tone: 'good' | 'warn' | 'risk' | 'neutral'
}

export type Opportunity = {
  topicKey: string
  topicName: string
  gain: number
  action: string
}

export type ReadinessReport = {
  score: number
  topics: TopicReadiness[]
  strong: TopicReadiness[]
  needsWork: TopicReadiness[]
  untouched: TopicReadiness[]
  coverage: number
  consistencyBonus: number
  consistencyDays: number
  daysLeft: number
  delta: number | null
  projected: number
  opportunity: Opportunity | null
  drivers: ReadinessDriver[]
}

function statusOf(stat: TopicStat, mastery: number): TopicStatus {
  if (!hasData(stat)) return 'untouched'
  if (mastery < 45) return 'weak'
  if (mastery < 75) return 'building'
  return 'strong'
}

/** How many of the last 7 days had any study on them. */
export function studyDaysInLastWeek(state: AppState, now: number = Date.now()): number {
  let count = 0
  for (let offset = 0; offset < 7; offset += 1) {
    const day = isoDate(new Date(now - offset * 86_400_000))
    const activity = state.days[day]
    if (activity && activity.minutes > 0) count += 1
  }
  return count
}

function scoreFromTopics(topics: TopicReadiness[]): number {
  if (topics.length === 0) return 0
  const total = topics.reduce((sum, topic) => sum + topic.contribution, 0)
  return total / topics.length
}

function topicReadiness(
  key: string,
  name: string,
  custom: boolean,
  stat: TopicStat,
  now: number,
): TopicReadiness {
  const mastery = effectiveMastery(stat, now)
  const confidence = confidenceOf(stat)
  return {
    key,
    name,
    custom,
    mastery,
    rawMastery: masteryOf(stat),
    confidence,
    attempts: stat.attempts,
    status: statusOf(stat, mastery),
    // Shallow evidence is discounted: three right answers is not mastery.
    contribution: mastery * (0.55 + 0.45 * confidence),
    lastStudiedAt: stat.lastStudiedAt,
  }
}

/** Readiness with the whole explanation attached, so the UI never guesses. */
export function readinessFor(
  exam: Exam,
  state: AppState,
  now: number = Date.now(),
): ReadinessReport {
  const topics = exam.topics.map((topic) =>
    topicReadiness(topic.key, topic.name, Boolean(topic.custom), statFor(state.stats, topic.key), now),
  )

  const base = scoreFromTopics(topics)
  const consistencyDays = studyDaysInLastWeek(state, now)
  // A small, honest nudge for showing up — capped so it can never carry a score.
  const consistencyBonus = Math.round(Math.min(5, consistencyDays) * (1 - base / 100) * 1.1)
  const score = clamp(Math.round(base + consistencyBonus), 0, 99)

  const studied = topics.filter((topic) => topic.status !== 'untouched')
  const coverage = topics.length === 0 ? 0 : studied.length / topics.length

  const sorted = [...topics].sort((a, b) => a.mastery - b.mastery)
  const untouched = topics.filter((topic) => topic.status === 'untouched')
  const needsWork = sorted.filter((topic) => topic.status === 'weak' || topic.status === 'building')
  const strong = [...topics]
    .filter((topic) => topic.status === 'strong')
    .sort((a, b) => b.mastery - a.mastery)

  const daysLeft = daysUntil(exam.date, new Date(now))
  const delta = deltaSince(exam, score, now)
  const opportunity = biggestOpportunity(exam, state, score, now)

  return {
    score,
    topics,
    strong,
    needsWork,
    untouched,
    coverage,
    consistencyBonus,
    consistencyDays,
    daysLeft,
    delta,
    projected: projectedScore(exam, score, daysLeft, now),
    opportunity,
    drivers: buildDrivers({
      score,
      topics,
      strong,
      needsWork,
      untouched,
      coverage,
      consistencyDays,
      consistencyBonus,
      daysLeft,
    }),
  }
}

/** Change in readiness over the last week, from stored snapshots. */
function deltaSince(exam: Exam, score: number, now: number): number | null {
  const cutoff = now - 7 * 86_400_000
  const older = [...exam.readinessHistory]
    .filter((entry) => entry.at <= cutoff)
    .sort((a, b) => b.at - a.at)[0]
  const earliest = [...exam.readinessHistory].sort((a, b) => a.at - b.at)[0]
  const reference = older ?? earliest
  if (!reference) return null
  if (now - reference.at < 60 * 60 * 1000) return null
  return score - reference.score
}

/** Recompute readiness as if one topic had two more solid sessions on it. */
export function estimateGain(
  exam: Exam,
  state: AppState,
  topicKey: string,
  currentScore: number,
  now: number = Date.now(),
): number {
  const improved = projectImprovement(statFor(state.stats, topicKey))
  const nextState: AppState = {
    ...state,
    stats: { ...state.stats, [topicKey]: improved },
  }
  const next = scoreFromTopics(
    exam.topics.map((topic) =>
      topicReadiness(
        topic.key,
        topic.name,
        Boolean(topic.custom),
        statFor(nextState.stats, topic.key),
        now,
      ),
    ),
  )
  const consistencyDays = studyDaysInLastWeek(state, now)
  const bonus = Math.round(Math.min(5, Math.max(1, consistencyDays)) * (1 - next / 100) * 1.1)
  return Math.max(0, clamp(Math.round(next + bonus), 0, 99) - currentScore)
}

function biggestOpportunity(
  exam: Exam,
  state: AppState,
  score: number,
  now: number,
): Opportunity | null {
  let best: Opportunity | null = null

  for (const topic of exam.topics) {
    const stat = statFor(state.stats, topic.key)
    const gain = estimateGain(exam, state, topic.key, score, now)
    const mastery = effectiveMastery(stat, now)
    const action = !hasData(stat)
      ? `Run a first session on ${topic.name} — it has no data yet`
      : mastery < 45
        ? `Two practice sessions on ${topic.name} would lift you most`
        : `Push ${topic.name} from ${mastery}% towards mastery`

    if (!best || gain > best.gain) {
      best = { topicKey: topic.key, topicName: topic.name, gain, action }
    }
  }

  return best && best.gain > 0 ? best : null
}

/** Where readiness lands by exam day if the current weekly pace continues. */
function projectedScore(
  exam: Exam,
  score: number,
  daysLeft: number,
  now: number,
): number {
  if (daysLeft <= 0) return score
  const week = now - 7 * 86_400_000
  const recent = exam.readinessHistory.filter((entry) => entry.at >= week)
  if (recent.length < 2) {
    // No trend yet: assume the plan is followed at a modest pace.
    return clamp(Math.round(score + Math.min(30, daysLeft * 1.1)), 0, 99)
  }
  const first = recent[0]
  const days = Math.max(1, (now - first.at) / 86_400_000)
  const perDay = (score - first.score) / days
  return clamp(Math.round(score + perDay * daysLeft), 0, 99)
}

function buildDrivers(input: {
  score: number
  topics: TopicReadiness[]
  strong: TopicReadiness[]
  needsWork: TopicReadiness[]
  untouched: TopicReadiness[]
  coverage: number
  consistencyDays: number
  consistencyBonus: number
  daysLeft: number
}): ReadinessDriver[] {
  const drivers: ReadinessDriver[] = []

  if (input.strong.length > 0) {
    drivers.push({
      label: 'Strong in',
      detail: input.strong
        .slice(0, 2)
        .map((topic) => `${topic.name} (${topic.mastery}%)`)
        .join(', '),
      tone: 'good',
    })
  }

  const weakest = input.needsWork[0]
  if (weakest) {
    drivers.push({
      label: 'Needs work',
      detail: `${weakest.name} — ${weakest.mastery}% mastery`,
      tone: weakest.mastery < 45 ? 'risk' : 'warn',
    })
  }

  if (input.untouched.length > 0) {
    drivers.push({
      label: 'Not started',
      detail: `${input.untouched.length} of ${input.topics.length} topics have no data yet`,
      tone: 'warn',
    })
  }

  if (input.consistencyDays > 0) {
    drivers.push({
      label: 'Consistency',
      detail:
        input.consistencyDays >= 4
          ? `Studied ${input.consistencyDays} of the last 7 days (+${input.consistencyBonus})`
          : `Studied ${input.consistencyDays} of the last 7 days`,
      tone: input.consistencyDays >= 4 ? 'good' : 'neutral',
    })
  }

  if (input.daysLeft >= 0 && input.daysLeft <= 7 && input.score < 70) {
    drivers.push({
      label: 'Risk',
      detail: `Only ${input.daysLeft} ${input.daysLeft === 1 ? 'day' : 'days'} left at ${input.score}% ready`,
      tone: 'risk',
    })
  }

  return drivers
}

/** Readiness across every upcoming exam, used for the progress screen. */
export function overallReadiness(state: AppState, now: number = Date.now()): number {
  const exams = upcomingExams(state, now)
  if (exams.length === 0) return 0
  const total = exams.reduce((sum, exam) => sum + readinessFor(exam, state, now).score, 0)
  return Math.round(total / exams.length)
}

export function upcomingExams(state: AppState, now: number = Date.now()): Exam[] {
  return [...state.exams]
    .filter((exam) => daysUntil(exam.date, new Date(now)) >= 0)
    .sort((a, b) => a.date.localeCompare(b.date))
}

export function pastExams(state: AppState, now: number = Date.now()): Exam[] {
  return [...state.exams]
    .filter((exam) => daysUntil(exam.date, new Date(now)) < 0)
    .sort((a, b) => b.date.localeCompare(a.date))
}
