import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import BottomNav from './components/BottomNav'
import { Toast } from './components/ui/primitives'
import ExamDetailScreen from './screens/ExamDetailScreen'
import ExamsScreen from './screens/ExamsScreen'
import HomeScreen from './screens/HomeScreen'
import NewExamScreen from './screens/NewExamScreen'
import ProfileScreen from './screens/ProfileScreen'
import ProgressScreen from './screens/ProgressScreen'
import SessionScreen from './screens/SessionScreen'
import WelcomeScreen from './screens/WelcomeScreen'
import { NavContext, type Overlay, type SessionConfig, type Tab } from './lib/nav'
import StoreProvider from './lib/store/StoreProvider'
import { useAppState } from './lib/store/context'

export default function App() {
  return (
    <StoreProvider>
      <Shell />
    </StoreProvider>
  )
}

function Shell() {
  const state = useAppState()
  const [tab, setTab] = useState<Tab>('home')
  const [overlay, setOverlay] = useState<Overlay>(null)
  const [message, setMessage] = useState<string | null>(null)
  const toastTimer = useRef(0)

  const toast = useCallback((text: string) => {
    setMessage(text)
    window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setMessage(null), 2600)
  }, [])

  useEffect(() => () => window.clearTimeout(toastTimer.current), [])

  const nav = useMemo(
    () => ({
      tab,
      setTab: (next: Tab) => {
        setOverlay(null)
        setTab(next)
      },
      openExam: (examId: string) => setOverlay({ kind: 'exam', examId }),
      newExam: () => setOverlay({ kind: 'newExam' }),
      startSession: (config: SessionConfig) => setOverlay({ kind: 'session', config }),
      close: () => setOverlay(null),
      toast,
    }),
    [tab, toast],
  )

  // Scrolling the overlay should not scroll the page behind it.
  useEffect(() => {
    document.body.style.overflow = overlay ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [overlay])

  if (state.profile.name.trim() === '') {
    return <WelcomeScreen />
  }

  return (
    <NavContext.Provider value={nav}>
      <div className="app-glow relative flex min-h-dvh flex-col">
        <main className="relative z-10 mx-auto w-full max-w-md flex-1 sm:border-x sm:border-line/70">
          {tab === 'home' && <HomeScreen />}
          {tab === 'exams' && <ExamsScreen />}
          {tab === 'progress' && <ProgressScreen />}
          {tab === 'profile' && <ProfileScreen />}
        </main>

        <BottomNav />

        {overlay?.kind === 'newExam' && <NewExamScreen />}
        {overlay?.kind === 'exam' && <ExamDetailScreen examId={overlay.examId} />}
        {overlay?.kind === 'session' && <SessionScreen config={overlay.config} />}

        {message && <Toast message={message} />}
      </div>
    </NavContext.Provider>
  )
}
