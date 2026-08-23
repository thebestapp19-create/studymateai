import { formatCountdown, formatDuration, plural } from '../format'
import type { AppState, Exam } from '../store/types'
import { MODE_VERB, type PlanItem } from './planner'
import type { ReadinessReport } from './readiness'

export type Insight = {
  headline: string
  body: string
  tone: 'neutral' | 'good' | 'warn' | 'risk'
}

/** The proactive read on an exam: where you stand and what is at risk. */
export function examInsight(exam: Exam, report: ReadinessReport): Insight {
  const when = formatCountdown(report.daysLeft)
  const strongest = report.strong[0]
  const weakest = report.needsWork[0] ?? report.untouched[0]

  if (report.topics.length === 0) {
    return {
      headline: `${exam.title} is ${when}.`,
      body: 'Add the topics it covers and the planner can start working out what to study.',
      tone: 'neutral',
    }
  }

  if (report.untouched.length === report.topics.length) {
    return {
      headline: `${exam.title} is ${when}.`,
      body: `Nothing measured yet. A five-minute level check across your ${report.topics.length} ${plural(report.topics.length, 'topic')} will set your starting point.`,
      tone: 'neutral',
    }
  }

  const parts: string[] = []
  if (strongest) parts.push(`You're solid on ${strongest.name} at ${strongest.mastery}%`)
  if (weakest) {
    parts.push(
      `${parts.length > 0 ? 'but ' : ''}${weakest.name} is your weakest area${
        weakest.status === 'untouched' ? ' and still untested' : ` at ${weakest.mastery}%`
      }`,
    )
  }

  const risky = report.daysLeft <= 7 && report.score < 65
  return {
    headline: `${exam.title} is ${when} — you're ${report.score}% ready.`,
    body: `${parts.join(', ')}.${
      risky ? ' At this range the next few sessions matter more than anything else.' : ''
    }`,
    tone: risky ? 'risk' : report.score >= 75 ? 'good' : 'warn',
  }
}

/** One clear sentence for the "do this next" card. */
export function actionLine(item: PlanItem): string {
  const verb = MODE_VERB[item.mode]
  if (item.mode === 'assessment') {
    return `${verb} for ${item.examTitle} — ${formatDuration(item.minutes)}`
  }
  return `${verb} ${item.topicName} for ${formatDuration(item.minutes)}`
}

export function gainLine(item: PlanItem): string | null {
  if (item.gain <= 0) return null
  return `Worth about +${item.gain}% readiness`
}

/** Feedback after a session — ties what just happened to visible progress. */
export function sessionFeedback(input: {
  topicName: string
  before: number
  after: number
  correct: number
  total: number
  readinessDelta: number
}): Insight {
  const gain = input.after - input.before
  const accuracy = input.total === 0 ? 0 : Math.round((input.correct / input.total) * 100)

  if (gain > 0) {
    return {
      headline: `${input.topicName} is up to ${input.after}%`,
      body: `You scored ${input.correct}/${input.total} (${accuracy}%), moving mastery from ${input.before}% to ${input.after}%${
        input.readinessDelta > 0 ? ` and readiness by +${input.readinessDelta}%` : ''
      }.`,
      tone: 'good',
    }
  }

  if (gain === 0) {
    return {
      headline: `${input.topicName} held at ${input.after}%`,
      body: `${input.correct}/${input.total} correct. Steady, but it will take a stronger run to move mastery up.`,
      tone: 'neutral',
    }
  }

  return {
    headline: `${input.topicName} slipped to ${input.after}%`,
    body: `${input.correct}/${input.total} this time. That is useful information — this topic is now higher in your plan.`,
    tone: 'warn',
  }
}

/** Small nudges for the home screen when there is nothing more urgent. */
export function studyStreak(state: AppState, now: number = Date.now()): number {
  let streak = 0
  for (let offset = 0; offset < 365; offset += 1) {
    const date = new Date(now - offset * 86_400_000)
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
      date.getDate(),
    ).padStart(2, '0')}`
    const activity = state.days[key]
    if (activity && activity.minutes > 0) {
      streak += 1
    } else if (offset > 0) {
      break
    }
  }
  return streak
}
