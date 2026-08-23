import { GRADES } from '../curriculum'
import type { AppState } from './types'

const STORAGE_KEY = 'studymate.state.v1'
const LEGACY_PROFILE_KEY = 'studymate.userProfile'

export const STATE_VERSION = 1

export function createInitialState(now: number = Date.now()): AppState {
  return {
    version: STATE_VERSION,
    profile: { name: '', gradeId: null, dailyGoalMinutes: 45, createdAt: now },
    exams: [],
    stats: {},
    sessions: [],
    days: {},
    planDone: {},
  }
}

/** Pull across the name and grade from the first version of the app. */
function migrateLegacy(now: number): AppState | null {
  try {
    const raw = localStorage.getItem(LEGACY_PROFILE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as { name?: unknown; grade?: unknown }
    if (typeof parsed.name !== 'string' || parsed.name.trim() === '') return null

    const state = createInitialState(now)
    state.profile.name = parsed.name.trim()
    if (typeof parsed.grade === 'string') {
      state.profile.gradeId = GRADES.find((grade) => grade.label === parsed.grade)?.id ?? null
    }
    return state
  } catch {
    return null
  }
}

export function loadState(now: number = Date.now()): AppState {
  if (typeof localStorage === 'undefined') return createInitialState(now)

  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return migrateLegacy(now) ?? createInitialState(now)

    const parsed = JSON.parse(raw) as Partial<AppState>
    const base = createInitialState(now)
    return {
      ...base,
      ...parsed,
      version: STATE_VERSION,
      profile: { ...base.profile, ...(parsed.profile ?? {}) },
      exams: Array.isArray(parsed.exams) ? parsed.exams : [],
      stats: parsed.stats && typeof parsed.stats === 'object' ? parsed.stats : {},
      sessions: Array.isArray(parsed.sessions) ? parsed.sessions : [],
      days: parsed.days && typeof parsed.days === 'object' ? parsed.days : {},
      planDone: parsed.planDone && typeof parsed.planDone === 'object' ? parsed.planDone : {},
    }
  } catch {
    return createInitialState(now)
  }
}

export function saveState(state: AppState): void {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // Storage full or blocked — the app keeps working from memory.
  }
}

export function clearState(): void {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(LEGACY_PROFILE_KEY)
  } catch {
    // Nothing to do.
  }
}
