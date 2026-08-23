import type { OwlExpression } from '../../components/Owl'
import { formatCountdown, formatDuration, isoDate, plural } from '../format'
import type { AppState } from '../store/types'
import { studyStreak } from './insights'
import type { PlanItem } from './planner'
import type { ReadinessReport } from './readiness'

export type MascotTone = 'calm' | 'nudge' | 'celebrate'

export type MascotMoment = {
  expression: OwlExpression
  line: string
  tone: MascotTone
}

const STREAK_MILESTONES = [3, 7, 14, 30, 60, 100]

/**
 * Pick a line that is stable for the day but not the same one forever.
 * Same trigger tomorrow, different words.
 */
function pick(lines: string[], salt: string, now: number): string {
  const day = Math.floor(new Date(now).setHours(0, 0, 0, 0) / 86_400_000)
  let hash = day
  for (let index = 0; index < salt.length; index += 1) {
    hash = (hash * 31 + salt.charCodeAt(index)) >>> 0
  }
  return lines[hash % lines.length]
}

function daysSinceLastSession(state: AppState, now: number): number {
  const last = state.sessions[0]
  if (!last) return Infinity
  const lastDay = new Date(last.at).setHours(0, 0, 0, 0)
  const today = new Date(now).setHours(0, 0, 0, 0)
  return Math.round((today - lastDay) / 86_400_000)
}

/**
 * What the owl has to say on the home screen — or nothing at all.
 *
 * It stays quiet unless something is genuinely worth a word, so it never
 * becomes furniture the eye learns to skip.
 */
export function homeMoment(
  state: AppState,
  report: ReadinessReport | null,
  next: PlanItem | null,
  now: number = Date.now(),
): MascotMoment | null {
  const name = state.profile.name.trim().split(/\s+/)[0] || 'there'
  const today = state.days[isoDate(new Date(now))]
  const minutesToday = today?.minutes ?? 0
  const goal = state.profile.dailyGoalMinutes
  const streak = studyStreak(state, now)
  const away = daysSinceLastSession(state, now)
  const hour = new Date(now).getHours()

  if (state.exams.length === 0) {
    return {
      expression: 'encouraging',
      tone: 'calm',
      line: pick(
        [
          `Hello ${name}. Tell me what you're sitting and I'll work out the rest.`,
          `Nice to meet you, ${name}. Add an exam and I'll take it from there.`,
          `Right then, ${name} — one exam is all I need to get started.`,
        ],
        'empty',
        now,
      ),
    }
  }

  // A streak milestone, on the day it lands.
  if (minutesToday > 0 && STREAK_MILESTONES.includes(streak)) {
    return {
      expression: 'proud',
      tone: 'celebrate',
      line: pick(
        [
          `${streak} days in a row. That consistency is the whole trick.`,
          `${streak} straight days. Most people stop long before this.`,
          `Day ${streak}. You've turned this into a habit — that's the hard part done.`,
        ],
        `streak-${streak}`,
        now,
      ),
    }
  }

  // A real jump in readiness since last week.
  if (report && report.delta !== null && report.delta >= 5) {
    return {
      expression: 'excited',
      tone: 'celebrate',
      line: pick(
        [
          `Up ${report.delta} points this week. That climb is you, not luck.`,
          `+${report.delta}% on ${report.topics.length > 1 ? 'this exam' : 'your exam'} in seven days. Keep the same rhythm.`,
          `${report.delta} points better than last week. It's working.`,
        ],
        `delta-${report.delta}`,
        now,
      ),
    }
  }

  // Back after a gap.
  if (away >= 2 && Number.isFinite(away)) {
    return {
      expression: 'encouraging',
      tone: 'nudge',
      line: pick(
        [
          `${away} days away. Twenty minutes today is enough to get moving again.`,
          `Welcome back, ${name}. Start small — one short session and you're rolling.`,
          `It's been ${away} days. Nothing lost; let's pick up the weakest topic.`,
        ],
        `away-${away}`,
        now,
      ),
    }
  }

  // The exam is close.
  if (report && report.daysLeft <= 3 && report.daysLeft >= 0) {
    return {
      expression: 'focused',
      tone: 'nudge',
      line: pick(
        [
          `Exam ${formatCountdown(report.daysLeft)}. Let's spend what's left where it counts.`,
          `${report.daysLeft === 0 ? 'Today is the day' : `${report.daysLeft} ${plural(report.daysLeft, 'day')} to go`}. Narrow the focus — weakest topic first.`,
          `Close now. Steady beats frantic from here.`,
        ],
        `close-${report.daysLeft}`,
        now,
      ),
    }
  }

  // Goal met.
  if (minutesToday >= goal) {
    return {
      expression: 'happy',
      tone: 'celebrate',
      line: pick(
        [
          `${formatDuration(minutesToday)} done today — that's your goal met.`,
          `Goal cleared. Anything past this is a bonus.`,
          `That's the day's work done, ${name}. Well played.`,
        ],
        'goal',
        now,
      ),
    }
  }

  // Late and nothing done — say the honest thing, not the pushy one.
  if (minutesToday === 0 && hour >= 22) {
    return {
      expression: 'sleepy',
      tone: 'calm',
      line: pick(
        [
          `It's late. One short review beats a long session you won't remember.`,
          `Late one. Ten minutes of flashcards and call it a night?`,
          `Tired brains don't retain much. A quick pass, then sleep.`,
        ],
        'late',
        now,
      ),
    }
  }

  // The daily welcome, before any work is done.
  if (minutesToday === 0) {
    return {
      expression: 'happy',
      tone: 'calm',
      line: next
        ? pick(
            [
              `Morning plan is ready: ${next.topicName} first, ${formatDuration(next.minutes)}.`,
              `Here's the short version — ${next.topicName}, ${formatDuration(next.minutes)}, then you're free.`,
              `One thing to start with today: ${next.topicName}.`,
            ],
            `plan-${next.topicKey}`,
            now,
          )
        : `Ready when you are, ${name}.`,
    }
  }

  // Mid-session day: stay out of the way.
  return null
}

/** How the owl reacts to a finished set of questions. */
export function quizMoment(input: {
  correct: number
  total: number
  masteryDelta: number
  isAssessment: boolean
  now?: number
}): MascotMoment {
  const now = input.now ?? Date.now()
  const accuracy = input.total === 0 ? 0 : input.correct / input.total

  if (input.isAssessment) {
    return {
      expression: 'thinking',
      tone: 'calm',
      line: pick(
        [
          `That's your starting point mapped. Now I know where to send you.`,
          `Measured. From here the plan aims at what you actually got wrong.`,
          `Good — I have enough to work with. Let's put it to use.`,
        ],
        'assessed',
        now,
      ),
    }
  }

  if (input.masteryDelta >= 8 && accuracy >= 0.5) {
    return {
      expression: 'proud',
      tone: 'celebrate',
      line: pick(
        [
          `Mastery up ${input.masteryDelta} points in one sitting. That's a real jump.`,
          `Big move — ${input.masteryDelta} points on that topic.`,
          `That session moved the needle properly. +${input.masteryDelta}.`,
        ],
        `jump-${input.masteryDelta}`,
        now,
      ),
    }
  }

  if (accuracy >= 0.85) {
    return {
      expression: 'excited',
      tone: 'celebrate',
      line: pick(
        [
          `${input.correct} out of ${input.total}. This one's close to done.`,
          `Almost clean. Time to make the questions harder.`,
          `You barely needed me for that one.`,
        ],
        'strong',
        now,
      ),
    }
  }

  if (accuracy >= 0.55) {
    return {
      expression: 'happy',
      tone: 'calm',
      line: pick(
        [
          `Solid middle. The misses are the interesting part — read those explanations.`,
          `More right than wrong. Another set like that and it tips over.`,
          `Getting there. The shaky bits will come round again soon.`,
        ],
        'mid',
        now,
      ),
    }
  }

  if (input.masteryDelta > 0) {
    return {
      expression: 'encouraging',
      tone: 'nudge',
      line: pick(
        [
          `${input.correct} of ${input.total} — and mastery still went up ${input.masteryDelta}, because you were starting from behind.`,
          `Tough set, but it moved you forward. Read the explanations on the misses.`,
          `Not pretty, and still progress. This topic stays near the top of your plan.`,
        ],
        'weak-progress',
        now,
      ),
    }
  }

  return {
    expression: 'encouraging',
    tone: 'nudge',
    line: pick(
      [
        `Rough set — but now we know exactly what to fix. That's worth more than an easy win.`,
        `That one bit. Nothing wasted: this topic just moved up your plan.`,
        `Hard going. Flashcards on this first, then come back to the questions.`,
      ],
      'weak',
      now,
    ),
  }
}

/** How the owl reacts to a finished deck. */
export function flashcardMoment(input: {
  known: number
  total: number
  unknown: number
  now?: number
}): MascotMoment {
  const now = input.now ?? Date.now()
  const ratio = input.total === 0 ? 0 : input.known / input.total

  if (ratio >= 0.8) {
    return {
      expression: 'proud',
      tone: 'celebrate',
      line: pick(
        [
          `${input.known} of ${input.total} solid. These are spacing out further now.`,
          `Nearly all of them. I'll stop showing you the easy ones.`,
          `That deck is close to retired.`,
        ],
        'cards-strong',
        now,
      ),
    }
  }

  if (input.unknown >= Math.max(2, input.total * 0.4)) {
    return {
      expression: 'encouraging',
      tone: 'nudge',
      line: pick(
        [
          `${input.unknown} blanks. They're back at the front of the deck — that's how this works.`,
          `Plenty of gaps, which is exactly what the deck is for. Same cards tomorrow.`,
          `Blanking on cards is the cheapest way to find holes. Good session.`,
        ],
        'cards-weak',
        now,
      ),
    }
  }

  return {
    expression: 'happy',
    tone: 'calm',
    line: pick(
      [
        `Decent pass. The shaky ones come back tomorrow, the rest in a few days.`,
        `That's the deck rebalanced around what you actually know.`,
        `Nicely done. Spacing handled — you just have to show up.`,
      ],
      'cards-mid',
      now,
    ),
  }
}

/** Encouragement on an exam page when the date is close. */
export function examMoment(report: ReadinessReport, now: number = Date.now()): MascotMoment | null {
  if (report.daysLeft > 5 || report.daysLeft < 0) return null

  if (report.score >= 75) {
    return {
      expression: 'proud',
      tone: 'celebrate',
      line: pick(
        [
          `${report.daysLeft === 0 ? 'Today' : formatCountdown(report.daysLeft)} — and you're ${report.score}% ready. Light review, then rest.`,
          `You've done the work. Keep the last days calm.`,
        ],
        'exam-ready',
        now,
      ),
    }
  }

  return {
    expression: 'focused',
    tone: 'nudge',
    line: pick(
      [
        `${formatCountdown(report.daysLeft)}. ${report.needsWork[0]?.name ?? 'Your weakest topic'} is where the marks are.`,
        `Not much time left, so no scattering. One topic at a time, weakest first.`,
      ],
      'exam-push',
      now,
    ),
  }
}
