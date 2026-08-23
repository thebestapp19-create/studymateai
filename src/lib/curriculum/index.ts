import { BIOLOGY } from './biology'
import { CHEMISTRY } from './chemistry'
import { COMPUTER_SCIENCE } from './computerScience'
import { ENGLISH } from './english'
import { GEOGRAPHY } from './geography'
import { HISTORY } from './history'
import { MATHEMATICS } from './mathematics'
import { PHYSICS } from './physics'
import type { Band, Concept, Subject, Topic } from './types'

export * from './types'

export const SUBJECTS: Subject[] = [
  MATHEMATICS,
  BIOLOGY,
  CHEMISTRY,
  PHYSICS,
  ENGLISH,
  HISTORY,
  GEOGRAPHY,
  COMPUTER_SCIENCE,
]

/** Custom topics the user typed themselves are keyed with this prefix. */
export const CUSTOM_PREFIX = 'custom:'

export function isCustomTopic(key: string): boolean {
  return key.startsWith(CUSTOM_PREFIX)
}

export function topicKey(subjectId: string, topicId: string): string {
  return `${subjectId}:${topicId}`
}

export function customTopicKey(examId: string, slug: string): string {
  return `${CUSTOM_PREFIX}${examId}:${slug}`
}

export function subjectById(id: string): Subject | undefined {
  return SUBJECTS.find((subject) => subject.id === id)
}

export function findTopic(key: string): { subject: Subject; topic: Topic } | null {
  const [subjectId, topicId] = key.split(':')
  const subject = subjectById(subjectId)
  const topic = subject?.topics.find((candidate) => candidate.id === topicId)
  return subject && topic ? { subject, topic } : null
}

/** Topics from a subject that suit the learner's level, in curriculum order. */
export function topicsForBand(subject: Subject, band: Band): Topic[] {
  const matching = subject.topics.filter((topic) => topic.bands.includes(band))
  return matching.length > 0 ? matching : subject.topics
}

/** Concepts inside a topic that suit the learner's level. */
export function conceptsForBand(topic: Topic, band: Band): Concept[] {
  const matching = topic.concepts.filter(
    (concept) => !concept.bands || concept.bands.includes(band),
  )
  return matching.length >= 3 ? matching : topic.concepts
}

export function generatorsForBand(topic: Topic, band: Band) {
  const generators = topic.generators ?? []
  const matching = generators.filter(
    (generator) => !generator.bands || generator.bands.includes(band),
  )
  return matching.length > 0 ? matching : generators
}

/** How many distinct questions the engine can build for a topic at this level. */
export function topicItemCapacity(topic: Topic, band: Band): number {
  const concepts = conceptsForBand(topic, band)
  const conceptForms = concepts.reduce((total, concept) => {
    let forms = 3
    if (concept.example) forms += 1
    if (concept.detail) forms += 1
    if (concept.misconception) forms += 1
    return total + forms
  }, 0)
  // Parametric generators are effectively unbounded; count each as plenty.
  return conceptForms + generatorsForBand(topic, band).length * 30
}
