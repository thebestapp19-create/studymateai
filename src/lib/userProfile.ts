export type UserProfile = {
  name: string
  grade: string
}

export const GRADES = [
  'Grade 6',
  'Grade 7',
  'Grade 8',
  'Grade 9',
  'Grade 10',
  'Grade 11',
  'Grade 12',
  'University',
] as const

const STORAGE_KEY = 'studymate.userProfile'

export function loadUserProfile(): UserProfile | null {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return null

  try {
    const parsed = JSON.parse(raw) as Partial<UserProfile>
    if (typeof parsed.name !== 'string' || typeof parsed.grade !== 'string') {
      return null
    }
    return { name: parsed.name, grade: parsed.grade }
  } catch {
    return null
  }
}

export function saveUserProfile(profile: UserProfile): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profile))
}
