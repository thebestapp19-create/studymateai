import {
  conceptsForBand,
  findTopic,
  generatorsForBand,
  isCustomTopic,
  type Band,
  type Concept,
  type Subject,
  type Topic,
} from '../curriculum'
import { bandLevel } from '../curriculum/types'
import { buildChoices } from '../curriculum/genUtils'
import { createRng, type Rng } from '../rng'

export type ItemForm =
  | 'define'
  | 'identify'
  | 'complete'
  | 'example'
  | 'apply'
  | 'truth'
  | 'spotFalse'
  | 'calc'

export type Difficulty = 1 | 2 | 3

export type QuizItem = {
  /** Stable for concept items so the app can avoid repeating them. */
  id: string
  topicKey: string
  topicName: string
  subjectId: string
  form: ItemForm
  prompt: string
  choices: string[]
  answerIndex: number
  explanation: string
  difficulty: Difficulty
  skill: string
}

const FORM_DIFFICULTY: Record<ItemForm, Difficulty> = {
  define: 1,
  identify: 2,
  complete: 2,
  example: 2,
  apply: 3,
  truth: 2,
  spotFalse: 3,
  calc: 2,
}

const PROMPTS: Record<Exclude<ItemForm, 'calc'>, string[]> = {
  define: [
    'What does “{term}” mean?',
    'In {topic}, how is {term} best defined?',
    'Which statement describes {term} correctly?',
    '{term} — pick the right definition.',
  ],
  identify: [
    'Which term is being described?\n\n“{definition}”',
    '“{definition}”\n\nWhat is this called?',
    'Name the idea:\n\n“{definition}”',
  ],
  complete: [
    'Complete the definition.\n\n{term}: {stem}…',
    'How does this definition finish?\n\n{term}: {stem}…',
  ],
  example: [
    'Which idea does this illustrate?\n\n{example}',
    '{example}\n\nThis is an example of…',
    'Which concept is at work here?\n\n{example}',
  ],
  apply: [
    'Which statement explains {term} most accurately?',
    'Going a level deeper — which is true of {term}?',
    'Which of these captures how {term} actually works?',
  ],
  truth: [
    'Which one is matched correctly?',
    'Only one of these pairings is right. Which?',
    'Which term and description belong together?',
  ],
  spotFalse: [
    'Which one of these is FALSE?',
    'Three are true, one is not. Which is false?',
    'Spot the mistake — which claim is wrong?',
  ],
}

function fill(
  template: string,
  values: { term?: string; topic?: string; definition?: string; example?: string; stem?: string },
): string {
  return template
    .replace('{term}', values.term ?? '')
    .replace('{topic}', values.topic ?? '')
    .replace('{definition}', values.definition ?? '')
    .replace('{example}', values.example ?? '')
    .replace('{stem}', values.stem ?? '')
}

/**
 * Concepts usable as distractors.
 *
 * Level matters here: a younger learner gets options drawn from across the
 * subject, which are easy to tell apart, while an older one gets near
 * neighbours from the same topic, which are not.
 */
function siblingPool(subject: Subject, topic: Topic, band: Band, excludeId: string): Concept[] {
  const near = conceptsForBand(topic, band).filter((concept) => concept.id !== excludeId)
  const far = subject.topics
    .filter((candidate) => candidate.id !== topic.id)
    .flatMap((candidate) => conceptsForBand(candidate, band))

  // Ordered by preference — callers take from the front. Repeating the near
  // pool keeps it in front even after the caller rotates the list.
  if (bandLevel(band) >= 2) return [...near, ...near, ...far]
  if (bandLevel(band) === 0) return [...far, ...near]
  return interleave(near, far)
}

/** Alternates the two pools, so mid-level options are a genuine mix. */
function interleave(a: Concept[], b: Concept[]): Concept[] {
  const merged: Concept[] = []
  for (let index = 0; index < Math.max(a.length, b.length); index += 1) {
    if (index < a.length) merged.push(a[index])
    if (index < b.length) merged.push(b[index])
  }
  return merged
}

/** Split a definition roughly in half on a word boundary. */
function splitDefinition(definition: string): { stem: string; tail: string } | null {
  const words = definition.replace(/\.$/, '').split(' ')
  if (words.length < 8) return null
  const cut = Math.max(3, Math.round(words.length * 0.45))
  return { stem: words.slice(0, cut).join(' '), tail: words.slice(cut).join(' ') }
}

/** "Term — claim", the shared shape for true/false style options. */
function statement(term: string, claim: string): string {
  return `${term} — ${claim.charAt(0).toLowerCase()}${claim.slice(1)}`
}

function explanationFor(concept: Concept, band: Band): string {
  const parts = [concept.definition]
  if (concept.detail && bandLevel(band) >= 1) parts.push(concept.detail)
  else if (concept.example) parts.push(`For example: ${concept.example}`)
  return parts.join(' ')
}

type Spec =
  | { kind: 'concept'; concept: Concept; form: Exclude<ItemForm, 'calc'>; difficulty: Difficulty }
  | { kind: 'generator'; index: number; difficulty: Difficulty }

function specsFor(topic: Topic, band: Band): Spec[] {
  const specs: Spec[] = []

  for (const concept of conceptsForBand(topic, band)) {
    specs.push({ kind: 'concept', concept, form: 'define', difficulty: 1 })
    specs.push({ kind: 'concept', concept, form: 'identify', difficulty: 2 })
    specs.push({ kind: 'concept', concept, form: 'truth', difficulty: 2 })
    if (splitDefinition(concept.definition)) {
      specs.push({ kind: 'concept', concept, form: 'complete', difficulty: 2 })
    }
    if (concept.example) {
      specs.push({ kind: 'concept', concept, form: 'example', difficulty: 2 })
    }
    if (concept.detail) {
      specs.push({ kind: 'concept', concept, form: 'apply', difficulty: 3 })
    }
    if (concept.misconception) {
      specs.push({ kind: 'concept', concept, form: 'spotFalse', difficulty: 3 })
    }
  }

  generatorsForBand(topic, band).forEach((generator, index) => {
    specs.push({ kind: 'generator', index, difficulty: generator.difficulty })
  })

  return specs
}

function specId(topicKey: string, spec: Spec): string {
  return spec.kind === 'concept'
    ? `${topicKey}#${spec.concept.id}#${spec.form}`
    : `${topicKey}#gen${spec.index}`
}

function materialise(
  spec: Spec,
  context: { subject: Subject; topic: Topic; topicKey: string; band: Band; rng: Rng },
): QuizItem | null {
  const { subject, topic, topicKey, band, rng } = context

  if (spec.kind === 'generator') {
    const generator = generatorsForBand(topic, band)[spec.index]
    if (!generator) return null
    const generated = generator.make(rng, bandLevel(band))
    return {
      id: `${topicKey}#gen${spec.index}#${rng.int(1, 1_000_000)}`,
      topicKey,
      topicName: topic.name,
      subjectId: subject.id,
      form: 'calc',
      prompt: generated.prompt,
      choices: generated.choices,
      answerIndex: generated.answerIndex,
      explanation: generated.explanation,
      difficulty: generator.difficulty,
      skill: generated.skill,
    }
  }

  const { concept, form } = spec
  const ordered = siblingPool(subject, topic, band, concept.id)
  // Rotate the front of the pool so repeated questions do not reuse the same
  // three distractors, while keeping the level-appropriate ordering.
  const offset = ordered.length === 0 ? 0 : rng.int(0, Math.min(3, ordered.length - 1))
  const siblings = [...ordered.slice(offset), ...ordered.slice(0, offset)]
  const base = {
    id: specId(topicKey, spec),
    topicKey,
    topicName: topic.name,
    subjectId: subject.id,
    form,
    difficulty: FORM_DIFFICULTY[form],
    skill: concept.term,
  }
  // Phrasings are ordered plain-first: the level nudges the register, the rng
  // keeps two questions in the same session from reading identically.
  const phrasings = PROMPTS[form]
  const bias = (bandLevel(band) / 3) * phrasings.length * 0.45
  const phrasing =
    phrasings[
      Math.min(phrasings.length - 1, Math.floor(bias + rng.next() * phrasings.length * 0.85))
    ]
  const prompt = (values: Parameters<typeof fill>[1]) =>
    fill(phrasing, { topic: topic.name, ...values })

  if (form === 'define') {
    const distractors = siblings.slice(0, 12).map((sibling) => sibling.definition)
    const { choices, answerIndex } = buildChoices(rng, concept.definition, distractors)
    if (choices.length < 3) return null
    return {
      ...base,
      prompt: prompt({ term: concept.term }),
      choices,
      answerIndex,
      explanation: explanationFor(concept, band),
    }
  }

  if (form === 'identify') {
    const distractors = siblings.slice(0, 12).map((sibling) => sibling.term)
    const { choices, answerIndex } = buildChoices(rng, concept.term, distractors)
    return {
      ...base,
      prompt: prompt({ definition: concept.definition }),
      choices,
      answerIndex,
      explanation: `${concept.term}. ${explanationFor(concept, band)}`,
    }
  }

  if (form === 'complete') {
    const split = splitDefinition(concept.definition)
    if (!split) return null
    const distractors = siblings
      .slice(0, 24)
      .map((sibling) => splitDefinition(sibling.definition)?.tail)
      .filter((tail): tail is string => Boolean(tail))
    const { choices, answerIndex } = buildChoices(rng, split.tail, distractors)
    if (choices.length < 3) return null
    return {
      ...base,
      prompt: prompt({ term: concept.term, stem: split.stem }),
      choices,
      answerIndex,
      explanation: explanationFor(concept, band),
    }
  }

  if (form === 'example') {
    if (!concept.example) return null
    const distractors = siblings.slice(0, 12).map((sibling) => sibling.term)
    const { choices, answerIndex } = buildChoices(rng, concept.term, distractors)
    return {
      ...base,
      prompt: prompt({ example: `“${concept.example}”` }),
      choices,
      answerIndex,
      explanation: `This shows ${concept.term.toLowerCase()}. ${explanationFor(concept, band)}`,
    }
  }

  if (form === 'apply') {
    if (!concept.detail) return null
    const distractors = siblings
      .slice(0, 24)
      .map((sibling) => sibling.detail)
      .filter((detail): detail is string => Boolean(detail))
    const { choices, answerIndex } = buildChoices(rng, concept.detail, distractors)
    if (choices.length < 3) return null
    return {
      ...base,
      prompt: prompt({ term: concept.term }),
      choices,
      answerIndex,
      explanation: `${concept.term}: ${concept.detail}`,
    }
  }

  if (form === 'truth') {
    // Distractors are real terms bolted onto the wrong definition — plausible
    // on a skim, clearly wrong once you know the material.
    const pool = siblings.slice(0, 12)
    const distractors = pool
      .map((sibling, index) => {
        const other = pool[(index + 1) % pool.length]
        if (!other || other.id === sibling.id || sibling.term === concept.term) return null
        return statement(sibling.term, other.definition)
      })
      .filter((entry): entry is string => Boolean(entry))

    const { choices, answerIndex } = buildChoices(
      rng,
      statement(concept.term, concept.definition),
      distractors,
    )
    if (choices.length < 4) return null
    return {
      ...base,
      prompt: prompt({}),
      choices,
      answerIndex,
      explanation: explanationFor(concept, band),
    }
  }

  // spotFalse — the odd one out is a misconception students actually hold.
  if (!concept.misconception) return null
  const trueStatements = siblings
    .slice(0, 16)
    .filter((sibling) => sibling.term !== concept.term)
    .map((sibling) => statement(sibling.term, sibling.definition))
  const { choices, answerIndex } = buildChoices(
    rng,
    statement(concept.term, concept.misconception),
    trueStatements,
  )
  if (choices.length < 4) return null
  return {
    ...base,
    prompt: prompt({}),
    choices,
    answerIndex,
    explanation: `That one is false. In fact: ${explanationFor(concept, band)}`,
  }
}

/** Difficulty mix for a learner at a given mastery, 0–100. */
export function difficultyMix(mastery: number, band: Band): Record<Difficulty, number> {
  const level = bandLevel(band)
  // Level sets the ceiling, mastery decides where inside it you sit.
  const easy = 3.2 - level * 0.85
  const hard = 0.5 + level * 1.25

  if (mastery < 35) return { 1: easy + 0.8, 2: 2, 3: Math.max(0.2, hard - 0.5) }
  if (mastery < 65) return { 1: Math.max(0.4, easy - 1), 2: 3, 3: hard + 0.4 }
  return { 1: Math.max(0.2, easy - 2), 2: 2.2, 3: hard + 1.6 }
}

export type BuildOptions = {
  topicKey: string
  band: Band
  count: number
  seed: string | number
  /** Current mastery for the topic, 0–100. Shapes the difficulty mix. */
  mastery?: number
  /** Item ids to avoid repeating when there is enough other material. */
  exclude?: string[]
}

/**
 * Build a set of questions for one topic.
 *
 * Every call reshuffles forms, phrasings and distractors, and parametric
 * generators produce fresh numbers, so two sessions on the same topic do not
 * look like the same quiz.
 */
export function buildQuizItems(options: BuildOptions): QuizItem[] {
  const { topicKey, band, count, seed, mastery = 0, exclude = [] } = options
  if (isCustomTopic(topicKey)) return []

  const found = findTopic(topicKey)
  if (!found) return []

  const rng = createRng(`${seed}:${topicKey}`)
  const mix = difficultyMix(mastery, band)
  const excluded = new Set(exclude)

  const specs = specsFor(found.topic, band)
  const scored = specs.map((spec) => {
    const weight = mix[spec.difficulty] * (0.5 + rng.next())
    const penalty = excluded.has(specId(topicKey, spec)) ? 0.06 : 1
    return { spec, score: weight * penalty }
  })
  scored.sort((a, b) => b.score - a.score)

  const items: QuizItem[] = []
  const usedConcepts = new Set<string>()
  const usedSpecs = new Set<string>()
  const formCounts = new Map<string, number>()
  const formOf = (spec: Spec) => (spec.kind === 'concept' ? spec.form : `gen${spec.index}`)
  // Two of any one question shape is plenty — more and a session reads samey.
  // Generators are exempt: each call produces fresh numbers anyway.
  const formCap = 2
  const capped = (spec: Spec) =>
    spec.kind === 'concept' && (formCounts.get(formOf(spec)) ?? 0) >= formCap

  const add = (spec: Spec): boolean => {
    const item = materialise(spec, {
      subject: found.subject,
      topic: found.topic,
      topicKey,
      band,
      rng,
    })
    if (!item) return false
    if (spec.kind === 'concept') usedConcepts.add(spec.concept.id)
    usedSpecs.add(specId(topicKey, spec))
    formCounts.set(formOf(spec), (formCounts.get(formOf(spec)) ?? 0) + 1)
    items.push(item)
    return true
  }

  // Breadth first — one question per concept, and a spread of question shapes.
  for (const { spec } of scored) {
    if (items.length >= count) break
    if (spec.kind === 'concept' && usedConcepts.has(spec.concept.id)) continue
    if (capped(spec)) continue
    add(spec)
  }

  // Then depth: other angles on concepts already covered, never the same
  // question twice in one session.
  for (const { spec } of scored) {
    if (items.length >= count) break
    if (spec.kind === 'concept' && usedSpecs.has(specId(topicKey, spec))) continue
    if (capped(spec)) continue
    add(spec)
  }

  // Last resort: fill the set even if that means repeating a question shape.
  for (const { spec } of scored) {
    if (items.length >= count) break
    if (spec.kind === 'concept' && usedSpecs.has(specId(topicKey, spec))) continue
    add(spec)
  }

  // Top up from generators if the concept pool ran dry.
  const generators = generatorsForBand(found.topic, band)
  let guard = 0
  while (items.length < count && generators.length > 0 && guard < count * 3) {
    guard += 1
    const index = rng.int(0, generators.length - 1)
    const item = materialise(
      { kind: 'generator', index, difficulty: generators[index].difficulty },
      { subject: found.subject, topic: found.topic, topicKey, band, rng },
    )
    if (item) items.push(item)
  }

  return items
}

/** Pool of items split by difficulty, so a session can adapt as it goes. */
export type ItemPool = {
  1: QuizItem[]
  2: QuizItem[]
  3: QuizItem[]
}

export function poolFrom(items: QuizItem[]): ItemPool {
  return {
    1: items.filter((item) => item.difficulty === 1),
    2: items.filter((item) => item.difficulty === 2),
    3: items.filter((item) => item.difficulty === 3),
  }
}

export function poolSize(pool: ItemPool): number {
  return pool[1].length + pool[2].length + pool[3].length
}

/** Take the next question at (or nearest to) the requested difficulty. */
export function takeFromPool(
  pool: ItemPool,
  level: Difficulty,
): { item: QuizItem | null; pool: ItemPool } {
  const order: Difficulty[] =
    level === 1 ? [1, 2, 3] : level === 2 ? [2, 1, 3] : [3, 2, 1]

  for (const candidate of order) {
    const bucket = pool[candidate]
    if (bucket.length > 0) {
      const [item, ...rest] = bucket
      return { item, pool: { ...pool, [candidate]: rest } }
    }
  }
  return { item: null, pool }
}
