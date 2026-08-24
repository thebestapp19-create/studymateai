import type { Rng } from '../rng'

/** Curriculum level. Everything in the app scales off these four bands. */
export type Band = 'middle' | 'lower' | 'upper' | 'tertiary'

export const BAND_ORDER: Band[] = ['middle', 'lower', 'upper', 'tertiary']

export const BAND_LABEL: Record<Band, string> = {
  middle: 'Middle school',
  lower: 'Lower secondary',
  upper: 'Upper secondary',
  tertiary: 'University',
}

export type Grade = {
  id: string
  label: string
  band: Band
}

export const GRADES: Grade[] = [
  { id: 'g6', label: 'Grade 6', band: 'middle' },
  { id: 'g7', label: 'Grade 7', band: 'middle' },
  { id: 'g8', label: 'Grade 8', band: 'middle' },
  { id: 'g9', label: 'Grade 9', band: 'lower' },
  { id: 'g10', label: 'Grade 10', band: 'lower' },
  { id: 'g11', label: 'Grade 11', band: 'upper' },
  { id: 'g12', label: 'Grade 12', band: 'upper' },
  { id: 'uni', label: 'University', band: 'tertiary' },
]

export function gradeById(id: string | undefined): Grade | undefined {
  return GRADES.find((grade) => grade.id === id)
}

export function bandOf(gradeId: string | undefined): Band {
  return gradeById(gradeId)?.band ?? 'lower'
}

export function bandLevel(band: Band): number {
  return BAND_ORDER.indexOf(band)
}

/**
 * One idea inside a topic. A concept is deliberately richer than a
 * question/answer pair: the content engine turns each one into several
 * different questions and flashcards, and uses sibling concepts as
 * distractors, so nothing reads like the same template twice.
 */
export type Concept = {
  id: string
  /** The thing being learned, e.g. "Discriminant". */
  term: string
  /** One-sentence answer to "what is it?". */
  definition: string
  /** The deeper why/how — powers harder questions and explanations. */
  detail?: string
  /** A concrete instance, used for "which idea does this show?" items. */
  example?: string
  /** A plausible but false statement students often believe. */
  misconception?: string
  /** Restrict to certain bands; defaults to the topic's bands. */
  bands?: Band[]
}

export type GeneratedItem = {
  prompt: string
  choices: string[]
  answerIndex: number
  explanation: string
  /** Short label of the skill exercised, shown in results. */
  skill: string
}

/** A parametric question factory: new numbers, new answer, every call. */
export type Generator = {
  id: string
  difficulty: 1 | 2 | 3
  bands?: Band[]
  /** `level` is 0–3, taken from the learner's band. */
  make: (rng: Rng, level: number) => GeneratedItem
}

export type Topic = {
  id: string
  name: string
  summary: string
  bands: Band[]
  concepts: Concept[]
  generators?: Generator[]
}

export type Subject = {
  id: string
  name: string
  tagline: string
  topics: Topic[]
}
