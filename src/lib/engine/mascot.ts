import type { OwlExpression } from '../../components/Owl'
import { formatCountdown, formatDuration, isoDate, plural, relativeDay } from '../format'
import type { AppState } from '../store/types'
import { studyStreak } from './insights'
import type { PlanItem } from './planner'
import type { ReadinessReport } from './readiness'

/** The owl has a name. It gets used sparingly — introductions, not every line. */
export const OWL_NAME = 'Otto'

export type MascotTone = 'calm' | 'nudge' | 'celebrate'

export type MascotMoment = {
  expression: OwlExpression
  tone: MascotTone
  /** The line to show. */
  line: string
  /** The rest of what it could say — tapping the owl moves through these. */
  lines: string[]
}

const STREAK_MILESTONES = [3, 7, 14, 30, 60, 100]

function hash(salt: string, seed: number): number {
  let value = seed
  for (let index = 0; index < salt.length; index += 1) {
    value = (value * 31 + salt.charCodeAt(index)) >>> 0
  }
  return value
}

/**
 * Rotate a set of lines so the same trigger says something different tomorrow —
 * and so tapping the owl moves through the rest of what it has to say.
 */
function say(
  expression: OwlExpression,
  tone: MascotTone,
  lines: string[],
  salt: string,
  now: number,
): MascotMoment {
  const day = Math.floor(new Date(now).setHours(0, 0, 0, 0) / 86_400_000)
  const start = hash(salt, day) % lines.length
  const rotated = [...lines.slice(start), ...lines.slice(0, start)]
  return { expression, tone, line: rotated[0], lines: rotated }
}

function firstName(state: AppState): string {
  return state.profile.name.trim().split(/\s+/)[0] || 'there'
}

function daysSinceLastSession(state: AppState, now: number): number {
  const last = state.sessions[0]
  if (!last) return Infinity
  const lastDay = new Date(last.at).setHours(0, 0, 0, 0)
  const today = new Date(now).setHours(0, 0, 0, 0)
  return Math.round((today - lastDay) / 86_400_000)
}

/**
 * What the owl says on the home screen.
 *
 * It always has something, because a study partner who only turns up for
 * milestones is not much of a partner — but every line is built from something
 * the app actually knows, so none of it is filler.
 */
export function homeMoment(
  state: AppState,
  report: ReadinessReport | null,
  next: PlanItem | null,
  now: number = Date.now(),
): MascotMoment {
  const name = firstName(state)
  const minutesToday = state.days[isoDate(new Date(now))]?.minutes ?? 0
  const goal = state.profile.dailyGoalMinutes
  const streak = studyStreak(state, now)
  const away = daysSinceLastSession(state, now)
  const hour = new Date(now).getHours()

  if (state.exams.length === 0) {
    return say(
      'encouraging',
      'calm',
      [
        `I'm ${OWL_NAME}. Tell me what you're sitting and I'll work out the rest.`,
        `Add your first exam and I'll build the plan around it — that's my job.`,
        `Nice to meet you, ${name}. One exam is all I need to get started.`,
      ],
      'empty',
      now,
    )
  }

  if (minutesToday > 0 && STREAK_MILESTONES.includes(streak)) {
    return say(
      'proud',
      'celebrate',
      [
        `${streak} days in a row. That consistency is the whole trick — I'm impressed.`,
        `Day ${streak}. Most people stop long before this. You didn't.`,
        `${streak} straight days together. This is a habit now, not an effort.`,
      ],
      `streak-${streak}`,
      now,
    )
  }

  if (report && report.delta !== null && report.delta >= 5) {
    return say(
      'excited',
      'celebrate',
      [
        `Up ${report.delta} points this week. That climb is you, not luck.`,
        `I've watched you gain ${report.delta}% in seven days. Keep this rhythm.`,
        `${report.delta} points better than last week — whatever you changed, keep it.`,
      ],
      `delta-${report.delta}`,
      now,
    )
  }

  if (away >= 2 && Number.isFinite(away)) {
    return say(
      'encouraging',
      'nudge',
      [
        `${away} days away — no lecture from me. Twenty minutes and you're moving again.`,
        `Welcome back, ${name}. Start small; I'll keep the plan honest.`,
        `It's been ${away} days. Nothing is lost — let's take the weakest topic first.`,
      ],
      `away-${away}`,
      now,
    )
  }

  if (report && report.daysLeft <= 3 && report.daysLeft >= 0) {
    return say(
      'focused',
      'nudge',
      [
        `Exam ${formatCountdown(report.daysLeft)}. I'd spend what's left on ${report.needsWork[0]?.name ?? 'your weakest topic'}.`,
        `${report.daysLeft === 0 ? "It's today" : `${report.daysLeft} ${plural(report.daysLeft, 'day')} left`}. Narrow the focus and I'll keep you pointed at the marks.`,
        `Close now. Steady beats frantic — I'll tell you what matters, you do the work.`,
      ],
      `close-${report.daysLeft}`,
      now,
    )
  }

  if (minutesToday >= goal) {
    return say(
      'happy',
      'celebrate',
      [
        `${formatDuration(minutesToday)} today — that's your goal met. Go and do something else.`,
        `Goal cleared. Anything past this is a bonus, and rest counts too.`,
        `That's the day's work done, ${name}. Well played.`,
      ],
      'goal',
      now,
    )
  }

  if (minutesToday === 0 && hour >= 22) {
    return say(
      'sleepy',
      'calm',
      [
        `It's late. One short review beats a long session you won't remember.`,
        `I'd take ten minutes of flashcards and call it a night.`,
        `Tired brains don't hold much. Quick pass, then sleep — I'll be here.`,
      ],
      'late',
      now,
    )
  }

  if (minutesToday === 0 && next) {
    return say(
      'happy',
      'calm',
      [
        `I've put ${next.topicName} first today — ${formatDuration(next.minutes)} and you're done.`,
        `Here's the short version: ${next.topicName}, ${formatDuration(next.minutes)}. Then you're free.`,
        `Start with ${next.topicName}. I picked it because it's where you'll gain most.`,
      ],
      `plan-${next.topicKey}`,
      now,
    )
  }

  // Mid-session day: stay warm, stay brief.
  const weakest = report?.needsWork[0]
  return say(
    'happy',
    'calm',
    [
      `${formatDuration(minutesToday)} in so far. ${formatDuration(Math.max(0, goal - minutesToday))} left if you want the goal.`,
      weakest
        ? `Good work today. ${weakest.name} is still the soft spot when you're ready.`
        : `Good work today. I'll keep watching the weak spots.`,
      streak > 1
        ? `Day ${streak} of your run, and you're already moving. Nice.`
        : `You've started — that's the hard part.`,
    ],
    'midday',
    now,
  )
}

/** A short reaction while answering, shown next to the feedback. */
export function answerReaction(input: {
  correct: boolean
  difficulty: 1 | 2 | 3
  streak: number
  now?: number
}): MascotMoment {
  const now = input.now ?? Date.now()

  if (input.correct && input.streak >= 3) {
    return say(
      'excited',
      'celebrate',
      [
        `${input.streak} in a row.`,
        `That's ${input.streak} straight — you've got this one.`,
        `Still going. ${input.streak} clean.`,
      ],
      `run-${input.streak}`,
      now,
    )
  }

  if (input.correct) {
    return say(
      'happy',
      'calm',
      input.difficulty === 3
        ? [`That was a hard one.`, `Stretch question — and you took it.`, `Nicely done, that one bites.`]
        : [`That's it.`, `Yes — straight through.`, `Good.`],
      `right-${input.difficulty}`,
      now,
    )
  }

  return say(
    'encouraging',
    'nudge',
    input.difficulty === 1
      ? [`Worth a second look.`, `Easy to slip on — read the why.`, `That one's a foundation. Worth fixing.`]
      : [`Not that one. The explanation is the useful bit.`, `Close. Read why, then move on.`, `Fine — that's what practice is for.`],
    `wrong-${input.difficulty}`,
    now,
  )
}

/** The line above the flashcard rating buttons. */
export function cardPrompt(input: {
  known: number
  unknown: number
  seen: number
  now?: number
}): MascotMoment {
  const now = input.now ?? Date.now()

  if (input.seen >= 3 && input.unknown === 0) {
    return say(
      'proud',
      'celebrate',
      [`Clean run so far — how was that one?`, `Nothing blanked yet. This one?`],
      'cards-clean',
      now,
    )
  }

  if (input.unknown >= 3) {
    return say(
      'encouraging',
      'nudge',
      [
        `Plenty of gaps today — that's the deck doing its job. Honest answer?`,
        `Blanks are useful to me. How did this one go?`,
      ],
      'cards-gaps',
      now,
    )
  }

  return say(
    'happy',
    'calm',
    [`How well did you know it?`, `Be honest — I schedule from this.`, `Straight answer: how was it?`],
    'cards-normal',
    now,
  )
}

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
    return say(
      'thinking',
      'calm',
      [
        `That's your starting point mapped. Now I know where to send you.`,
        `Measured. From here I aim the plan at what you actually got wrong.`,
        `Good — I have enough to work with. Let's put it to use.`,
      ],
      'assessed',
      now,
    )
  }

  if (input.masteryDelta >= 8 && accuracy >= 0.5) {
    return say(
      'proud',
      'celebrate',
      [
        `Mastery up ${input.masteryDelta} points in one sitting. That's a real jump.`,
        `+${input.masteryDelta} on that topic. I'm moving it down the plan.`,
        `That session moved the needle properly.`,
      ],
      `jump-${input.masteryDelta}`,
      now,
    )
  }

  if (accuracy >= 0.85) {
    return say(
      'excited',
      'celebrate',
      [
        `${input.correct} out of ${input.total}. This one's close to done.`,
        `Almost clean — I'll make the questions harder next time.`,
        `You barely needed me for that.`,
      ],
      'strong',
      now,
    )
  }

  if (accuracy >= 0.55) {
    return say(
      'happy',
      'calm',
      [
        `More right than wrong. Read the misses and it tips over.`,
        `Solid middle. The shaky ones will come back around.`,
        `Getting there. Another set like that does it.`,
      ],
      'mid',
      now,
    )
  }

  if (input.masteryDelta > 0) {
    return say(
      'encouraging',
      'nudge',
      [
        `${input.correct} of ${input.total} — and mastery still went up ${input.masteryDelta}, because you were starting from behind.`,
        `Tough set, and it still moved you forward.`,
        `Not pretty, still progress. This one stays near the top of your plan.`,
      ],
      'weak-progress',
      now,
    )
  }

  return say(
    'encouraging',
    'nudge',
    [
      `Rough set — but now I know exactly what to fix. That beats an easy win.`,
      `That one bit. Nothing wasted: it just moved up your plan.`,
      `Flashcards on this first, then come back to the questions. My call.`,
    ],
    'weak',
    now,
  )
}

export function flashcardMoment(input: {
  known: number
  total: number
  unknown: number
  now?: number
}): MascotMoment {
  const now = input.now ?? Date.now()
  const ratio = input.total === 0 ? 0 : input.known / input.total

  if (ratio >= 0.8) {
    return say(
      'proud',
      'celebrate',
      [
        `${input.known} of ${input.total} solid. I'm spacing these out further.`,
        `Nearly all of them. I'll stop showing you the easy ones.`,
        `That deck is close to retired.`,
      ],
      'cards-strong',
      now,
    )
  }

  if (input.unknown >= Math.max(2, input.total * 0.4)) {
    return say(
      'encouraging',
      'nudge',
      [
        `${input.unknown} blanks — they're back at the front of the deck. That's how this works.`,
        `Plenty of gaps, which is what the deck is for. Same cards tomorrow.`,
        `Blanking is the cheapest way to find holes. Good session.`,
      ],
      'cards-weak',
      now,
    )
  }

  return say(
    'happy',
    'calm',
    [
      `Decent pass. Shaky ones tomorrow, the rest in a few days.`,
      `Deck rebalanced around what you actually know.`,
      `Spacing is handled — you just have to show up.`,
    ],
    'cards-mid',
    now,
  )
}

export function examMoment(report: ReadinessReport, now: number = Date.now()): MascotMoment | null {
  if (report.daysLeft > 5 || report.daysLeft < 0) return null

  if (report.score >= 75) {
    return say(
      'proud',
      'celebrate',
      [
        `${report.daysLeft === 0 ? 'Today' : formatCountdown(report.daysLeft)} — and you're ${report.score}% ready. Light review, then rest.`,
        `You've done the work. I'd keep the last days calm.`,
      ],
      'exam-ready',
      now,
    )
  }

  return say(
    'focused',
    'nudge',
    [
      `${formatCountdown(report.daysLeft)}. ${report.needsWork[0]?.name ?? 'Your weakest topic'} is where the marks are.`,
      `Not much time, so no scattering. One topic at a time, weakest first.`,
    ],
    'exam-push',
    now,
  )
}

/** The owl's read on the progress screen. */
export function progressMoment(
  state: AppState,
  overall: number,
  now: number = Date.now(),
): MascotMoment {
  const sessions = state.sessions.length
  const streak = studyStreak(state, now)
  const minutes = Object.values(state.days).reduce((sum, day) => sum + day.minutes, 0)

  return say(
    streak >= 3 ? 'proud' : 'happy',
    streak >= 3 ? 'celebrate' : 'calm',
    [
      `${sessions} ${plural(sessions, 'session')} together, ${formatDuration(minutes)} of work. This is the record, not a guess.`,
      streak >= 3
        ? `${streak} days running. The graph below is what that buys you.`
        : `Every number here came from something you actually finished.`,
      `Overall you're sitting at ${overall}% across your exams. I'll keep chipping at the gaps.`,
    ],
    'progress',
    now,
  )
}

/** A short bio for the profile screen. */
export function partnerSummary(state: AppState): { since: string; sessions: number; line: string } {
  const sessions = state.sessions.length
  const oldest = state.sessions[state.sessions.length - 1]
  return {
    since: oldest ? relativeDay(oldest.at) : 'today',
    sessions,
    line:
      sessions === 0
        ? `I'm ${OWL_NAME}. I read how you answer, work out what's weak, and tell you what to do next.`
        : `${sessions} ${plural(sessions, 'session')} in. I track what you get wrong so you don't have to.`,
  }
}
