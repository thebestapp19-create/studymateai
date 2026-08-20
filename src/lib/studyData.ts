/**
 * Study data for the Home screen.
 *
 * Everything is read through the functions below so the screens never touch
 * storage directly. Today they are backed by localStorage seeded with sample
 * data; later they can be swapped for real exams, assessments and AI-generated
 * study plans without changing the UI.
 */

export type Topic = {
  name: string
  /** 0–100, how well the user knows this topic. */
  mastery: number
}

export type Exam = {
  id: string
  subject: string
  category: string
  /** Exam day as an ISO date, e.g. "2026-06-18". */
  date: string
  /** 0–100, overall preparation for this exam. */
  readiness: number
  topics: Topic[]
}

export type PlanItem = {
  id: string
  examId: string
  topic: string
  minutes: number
  done: boolean
}

const EXAMS_KEY = 'studymate.exams'
const PLAN_KEY = 'studymate.plan'
const AVAILABLE_MINUTES_KEY = 'studymate.availableMinutes'

export const DEFAULT_AVAILABLE_MINUTES = 150

function isoDateInDays(days: number, from: Date = new Date()): string {
  const date = new Date(from.getFullYear(), from.getMonth(), from.getDate() + days)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

/** Sample exams used until the user can create their own. */
function seedExams(): Exam[] {
  return [
    {
      id: 'exam-mathematics',
      subject: 'Mathematics',
      category: 'Core',
      date: isoDateInDays(12),
      readiness: 64,
      topics: [
        { name: 'Algebra', mastery: 80 },
        { name: 'Geometry', mastery: 52 },
        { name: 'Functions', mastery: 31 },
      ],
    },
    {
      id: 'exam-biology',
      subject: 'Biology',
      category: 'Science',
      date: isoDateInDays(19),
      readiness: 42,
      topics: [
        { name: 'Cell Biology', mastery: 58 },
        { name: 'Genetics', mastery: 40 },
        { name: 'Ecology', mastery: 28 },
      ],
    },
    {
      id: 'exam-physics',
      subject: 'Physics',
      category: 'Science',
      date: isoDateInDays(24),
      readiness: 15,
      topics: [
        { name: 'Kinematics', mastery: 22 },
        { name: 'Forces', mastery: 14 },
        { name: 'Energy', mastery: 9 },
      ],
    },
  ]
}

export function loadExams(): Exam[] {
  const raw = localStorage.getItem(EXAMS_KEY)
  if (raw === null) {
    const seeded = seedExams()
    saveExams(seeded)
    return seeded
  }

  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as Exam[]) : []
  } catch {
    return []
  }
}

export function saveExams(exams: Exam[]): void {
  localStorage.setItem(EXAMS_KEY, JSON.stringify(exams))
}

/** Whole days from today until the exam; negative once it has passed. */
export function daysUntil(isoDate: string, from: Date = new Date()): number {
  const [year, month, day] = isoDate.split('-').map(Number)
  const target = new Date(year, month - 1, day)
  const today = new Date(from.getFullYear(), from.getMonth(), from.getDate())
  return Math.round((target.getTime() - today.getTime()) / 86_400_000)
}

export function formatExamDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-').map(Number)
  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    month: 'long',
    day: 'numeric',
  })
}

export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  if (hours === 0) return `${rest} min`
  if (rest === 0) return `${hours}h`
  return `${hours}h ${rest}m`
}

/** Exams still ahead of us, soonest first. The first one is the focus exam. */
export function upcomingExams(exams: Exam[], from: Date = new Date()): Exam[] {
  return exams
    .filter((exam) => daysUntil(exam.date, from) >= 0)
    .sort((a, b) => a.date.localeCompare(b.date))
}

/** The topic the user is furthest behind on, across all upcoming exams. */
export function weakestTopic(
  exams: Exam[],
): { exam: Exam; topic: Topic } | null {
  let weakest: { exam: Exam; topic: Topic } | null = null

  for (const exam of exams) {
    for (const topic of exam.topics) {
      if (!weakest || topic.mastery < weakest.topic.mastery) {
        weakest = { exam, topic }
      }
    }
  }

  return weakest
}

/**
 * Today's plan: the weakest topics of the most urgent exams, filled up to the
 * time the user has available. Stands in for the AI planner for now.
 */
export function buildTodaysPlan(
  exams: Exam[],
  availableMinutes: number,
): PlanItem[] {
  const candidates = exams
    .flatMap((exam) => exam.topics.map((topic) => ({ exam, topic })))
    .sort((a, b) => {
      const urgency = daysUntil(a.exam.date) - daysUntil(b.exam.date)
      return urgency !== 0 ? urgency : a.topic.mastery - b.topic.mastery
    })
    .slice(0, 3)

  if (candidates.length === 0) return []

  // Split the available time into 15-minute blocks, weighted towards the
  // topics the user knows least well.
  const weights = candidates.map(({ topic }) => 100 - topic.mastery + 20)
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0)

  return candidates.map(({ exam, topic }, index) => ({
    id: `${exam.id}:${topic.name}`,
    examId: exam.id,
    topic: `${topic.name} · ${exam.subject}`,
    minutes: Math.max(
      15,
      Math.round((availableMinutes * weights[index]) / totalWeight / 15) * 15,
    ),
    done: false,
  }))
}

function todayKey(from: Date = new Date()): string {
  return `${PLAN_KEY}.${isoDateInDays(0, from)}`
}

/** Which of today's plan items are already ticked off. */
export function loadCompletedPlanItems(from: Date = new Date()): string[] {
  const raw = localStorage.getItem(todayKey(from))
  if (!raw) return []

  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as string[]) : []
  } catch {
    return []
  }
}

export function saveCompletedPlanItems(
  ids: string[],
  from: Date = new Date(),
): void {
  localStorage.setItem(todayKey(from), JSON.stringify(ids))
}

export function loadAvailableMinutes(): number {
  const raw = localStorage.getItem(AVAILABLE_MINUTES_KEY)
  const parsed = Number(raw)
  return Number.isFinite(parsed) && parsed > 0
    ? parsed
    : DEFAULT_AVAILABLE_MINUTES
}

export function saveAvailableMinutes(minutes: number): void {
  localStorage.setItem(AVAILABLE_MINUTES_KEY, String(minutes))
}
