import { cardStrength, type CardRating, type CardSchedule } from '../content/flashcards'
import type { Difficulty } from '../content/items'
import { clamp } from '../format'
import type { TopicStat } from '../store/types'

export const MAX_SEEN = 60
const MAX_HISTORY = 40

export function emptyStat(): TopicStat {
  return {
    attempts: 0,
    correct: 0,
    accuracy: 0,
    minutes: 0,
    sessions: 0,
    lastStudiedAt: null,
    cards: {},
    history: [],
    seen: [],
  }
}

export function statFor(
  stats: Record<string, TopicStat>,
  key: string,
): TopicStat {
  return stats[key] ?? emptyStat()
}

/** Average strength of the flashcards the learner has actually rated. */
export function cardScore(cards: Record<string, CardSchedule>): {
  score: number
  rated: number
} {
  const states = Object.values(cards).filter((state) => state.reps > 0)
  if (states.length === 0) return { score: 0, rated: 0 }
  const total = states.reduce((sum, state) => sum + cardStrength(state), 0)
  return { score: total / states.length, rated: states.length }
}

/**
 * Mastery, 0–100.
 *
 * Two signals feed it — question accuracy and flashcard recall — each weighted
 * by how much evidence there is. A topic with three lucky answers cannot look
 * mastered, and a topic never studied returns 0.
 */
export function masteryOf(stat: TopicStat): number {
  const cards = cardScore(stat.cards)
  const answerWeight = Math.min(1, stat.attempts / 8)
  const cardWeight = Math.min(1, cards.rated / 6) * 0.7
  const totalWeight = answerWeight + cardWeight

  if (totalWeight === 0) return 0

  const score = (stat.accuracy * answerWeight + cards.score * cardWeight) / totalWeight
  const confidence = Math.min(1, (stat.attempts + cards.rated) / 10)
  return clamp(Math.round(score * 100 * (0.6 + 0.4 * confidence)), 0, 100)
}

export function confidenceOf(stat: TopicStat): number {
  const cards = cardScore(stat.cards)
  return Math.min(1, (stat.attempts + cards.rated) / 10)
}

export function hasData(stat: TopicStat): boolean {
  return stat.attempts > 0 || cardScore(stat.cards).rated > 0
}

/** Knowledge fades: a topic untouched for weeks counts for a little less. */
export function retentionOf(stat: TopicStat, now: number = Date.now()): number {
  if (!stat.lastStudiedAt) return 1
  const days = Math.max(0, (now - stat.lastStudiedAt) / 86_400_000)
  return clamp(1 - days * 0.012, 0.7, 1)
}

export function effectiveMastery(stat: TopicStat, now: number = Date.now()): number {
  return Math.round(masteryOf(stat) * retentionOf(stat, now))
}

/** How much one answer should move the needle, by difficulty. */
function answerValue(correct: boolean, difficulty: Difficulty): number {
  if (correct) return difficulty === 3 ? 1 : difficulty === 2 ? 0.97 : 0.92
  return difficulty === 1 ? 0 : difficulty === 2 ? 0.05 : 0.12
}

function pushHistory(stat: TopicStat, mastery: number, now: number) {
  const history = [...stat.history, { at: now, mastery }]
  return history.slice(-MAX_HISTORY)
}

export type AnswerResult = {
  itemId: string
  correct: boolean
  difficulty: Difficulty
}

export function applyAnswers(
  stat: TopicStat,
  results: AnswerResult[],
  minutes: number,
  now: number = Date.now(),
): TopicStat {
  if (results.length === 0) return stat

  let accuracy = stat.accuracy
  let attempts = stat.attempts
  let correct = stat.correct

  for (const result of results) {
    const value = answerValue(result.correct, result.difficulty)
    // Early answers should move mastery quickly; later ones smooth it out.
    const alpha = attempts === 0 ? 1 : Math.max(0.18, 1 / (attempts + 1.6))
    accuracy = accuracy + alpha * (value - accuracy)
    attempts += 1
    if (result.correct) correct += 1
  }

  const seen = [...results.map((result) => result.itemId), ...stat.seen].slice(0, MAX_SEEN)

  const next: TopicStat = {
    ...stat,
    accuracy: clamp(accuracy, 0, 1),
    attempts,
    correct,
    minutes: stat.minutes + minutes,
    sessions: stat.sessions + 1,
    lastStudiedAt: now,
    seen,
  }

  return { ...next, history: pushHistory(next, masteryOf(next), now) }
}

export function applyCardRatings(
  stat: TopicStat,
  updates: { cardId: string; rating: CardRating; schedule: CardSchedule }[],
  minutes: number,
  now: number = Date.now(),
): TopicStat {
  if (updates.length === 0) return stat

  const cards = { ...stat.cards }
  for (const update of updates) {
    cards[update.cardId] = update.schedule
  }

  const next: TopicStat = {
    ...stat,
    cards,
    minutes: stat.minutes + minutes,
    sessions: stat.sessions + 1,
    lastStudiedAt: now,
  }

  return { ...next, history: pushHistory(next, masteryOf(next), now) }
}

/**
 * What this topic would look like after a couple of solid sessions — used to
 * estimate how much readiness a recommended action would actually buy.
 */
export function projectImprovement(stat: TopicStat, sessions = 2): TopicStat {
  const results: AnswerResult[] = []
  for (let index = 0; index < sessions * 6; index += 1) {
    results.push({ itemId: `sim-${index}`, correct: index % 5 !== 4, difficulty: 2 })
  }
  return applyAnswers(stat, results, 0, Date.now())
}
