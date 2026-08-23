import {
  conceptsForBand,
  findTopic,
  generatorsForBand,
  isCustomTopic,
  type Band,
} from '../curriculum'
import { bandLevel } from '../curriculum/types'
import { createRng } from '../rng'
import type { Difficulty } from './items'

export type CardForm = 'term' | 'reverse' | 'example' | 'insight' | 'myth' | 'drill'

export type Flashcard = {
  /** Stable across sessions so mastery scheduling sticks to the card. */
  id: string
  topicKey: string
  topicName: string
  subjectId: string
  form: CardForm
  /** Short label shown on the card, e.g. "Definition". */
  kind: string
  front: string
  prompt: string
  back: string
  extra?: string
  difficulty: Difficulty
}

const KIND_LABEL: Record<CardForm, string> = {
  term: 'Definition',
  reverse: 'Recall the term',
  example: 'Apply it',
  insight: 'Go deeper',
  myth: 'True or false',
  drill: 'Practice problem',
}

const CARD_DIFFICULTY: Record<CardForm, Difficulty> = {
  term: 1,
  reverse: 2,
  example: 2,
  insight: 3,
  myth: 2,
  drill: 2,
}

/** Every card the engine can build for a topic at this level. */
export function buildFlashcards(topicKey: string, band: Band, seed: string | number): Flashcard[] {
  if (isCustomTopic(topicKey)) return []
  const found = findTopic(topicKey)
  if (!found) return []

  const { subject, topic } = found
  const rng = createRng(`${seed}:cards:${topicKey}`)
  const cards: Flashcard[] = []

  const push = (
    form: CardForm,
    conceptId: string,
    parts: { front: string; prompt: string; back: string; extra?: string },
  ) => {
    cards.push({
      id: `${topicKey}#${conceptId}#${form}`,
      topicKey,
      topicName: topic.name,
      subjectId: subject.id,
      form,
      kind: KIND_LABEL[form],
      difficulty: CARD_DIFFICULTY[form],
      ...parts,
    })
  }

  for (const concept of conceptsForBand(topic, band)) {
    push('term', concept.id, {
      front: concept.term,
      prompt: 'What does this mean?',
      back: concept.definition,
      extra: concept.detail,
    })

    push('reverse', concept.id, {
      front: concept.definition,
      prompt: 'Which term is being described?',
      back: concept.term,
      extra: concept.example ? `e.g. ${concept.example}` : undefined,
    })

    if (concept.example) {
      push('example', concept.id, {
        front: concept.example,
        prompt: 'Which idea is at work here?',
        back: concept.term,
        extra: concept.definition,
      })
    }

    if (concept.detail && bandLevel(band) >= 1) {
      push('insight', concept.id, {
        front: concept.term,
        prompt: 'Explain how this actually works.',
        back: concept.detail,
        extra: concept.example ? `e.g. ${concept.example}` : undefined,
      })
    }

    if (concept.misconception) {
      push('myth', concept.id, {
        front: concept.misconception,
        prompt: 'True or false?',
        back: `False — ${concept.definition}`,
        extra: concept.detail,
      })
    }
  }

  generatorsForBand(topic, band).forEach((generator, index) => {
    const generated = generator.make(rng, bandLevel(band))
    cards.push({
      id: `${topicKey}#gen${index}#drill`,
      topicKey,
      topicName: topic.name,
      subjectId: subject.id,
      form: 'drill',
      kind: KIND_LABEL.drill,
      difficulty: generator.difficulty,
      front: generated.prompt,
      prompt: 'Work it out, then check.',
      back: generated.choices[generated.answerIndex],
      extra: generated.explanation,
    })
  })

  return rng.shuffle(cards)
}

export type CardSchedule = {
  /** SM-2 style ease factor. */
  ease: number
  /** Days until the next review. */
  interval: number
  /** Timestamp the card is next due. */
  due: number
  reps: number
  lapses: number
  lastRating: CardRating | null
}

export type CardRating = 'known' | 'shaky' | 'unknown'

export const NEW_CARD: CardSchedule = {
  ease: 2.3,
  interval: 0,
  due: 0,
  reps: 0,
  lapses: 0,
  lastRating: null,
}

/** SM-2 lite: weak cards come back within the session, strong ones fade out. */
export function scheduleCard(
  current: CardSchedule | undefined,
  rating: CardRating,
  now: number = Date.now(),
): CardSchedule {
  const state = current ?? NEW_CARD

  if (rating === 'unknown') {
    return {
      ease: Math.max(1.4, state.ease - 0.25),
      interval: 0,
      due: now,
      reps: state.reps + 1,
      lapses: state.lapses + 1,
      lastRating: rating,
    }
  }

  if (rating === 'shaky') {
    const interval = state.interval < 1 ? 1 : Math.max(1, Math.round(state.interval * 1.2))
    return {
      ease: Math.max(1.5, state.ease - 0.12),
      interval,
      due: now + interval * 86_400_000,
      reps: state.reps + 1,
      lapses: state.lapses,
      lastRating: rating,
    }
  }

  const interval =
    state.interval < 1 ? 1 : state.interval === 1 ? 3 : Math.round(state.interval * state.ease)
  return {
    ease: Math.min(2.9, state.ease + 0.1),
    interval,
    due: now + interval * 86_400_000,
    reps: state.reps + 1,
    lapses: state.lapses,
    lastRating: rating,
  }
}

/** Mastery contribution of a card, 0–1, from how it was last rated. */
export function cardStrength(state: CardSchedule | undefined): number {
  if (!state || state.reps === 0) return 0
  const base = state.lastRating === 'known' ? 1 : state.lastRating === 'shaky' ? 0.55 : 0.15
  const depth = Math.min(1, state.reps / 3)
  return base * (0.6 + 0.4 * depth)
}

/**
 * Order a deck: cards that are due (weakest first), then unseen cards, then
 * anything else, so a session always leads with what is shakiest.
 */
export function buildDeck(
  cards: Flashcard[],
  schedule: Record<string, CardSchedule>,
  size: number,
  now: number = Date.now(),
): Flashcard[] {
  const due: Flashcard[] = []
  const fresh: Flashcard[] = []
  const later: Flashcard[] = []

  for (const card of cards) {
    const state = schedule[card.id]
    if (!state || state.reps === 0) fresh.push(card)
    else if (state.due <= now) due.push(card)
    else later.push(card)
  }

  due.sort((a, b) => cardStrength(schedule[a.id]) - cardStrength(schedule[b.id]))
  later.sort((a, b) => (schedule[a.id]?.due ?? 0) - (schedule[b.id]?.due ?? 0))

  return [...due, ...fresh, ...later].slice(0, size)
}
