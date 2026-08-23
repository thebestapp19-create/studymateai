import { createContext, useContext } from 'react'
import type { StudyMode } from './engine/planner'

export type Tab = 'home' | 'exams' | 'progress' | 'profile'

export type SessionConfig = {
  mode: StudyMode
  examId: string | null
  subjectId: string
  /** Required for everything except a whole-exam level check. */
  topicKey?: string
  topicName?: string
}

export type Overlay =
  | { kind: 'newExam' }
  | { kind: 'exam'; examId: string }
  | { kind: 'session'; config: SessionConfig }
  | null

export type Nav = {
  tab: Tab
  setTab: (tab: Tab) => void
  openExam: (examId: string) => void
  newExam: () => void
  startSession: (config: SessionConfig) => void
  close: () => void
  toast: (message: string) => void
}

export const NavContext = createContext<Nav>({
  tab: 'home',
  setTab: () => undefined,
  openExam: () => undefined,
  newExam: () => undefined,
  startSession: () => undefined,
  close: () => undefined,
  toast: () => undefined,
})

export function useNav(): Nav {
  return useContext(NavContext)
}
