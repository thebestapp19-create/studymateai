import { useEffect, useMemo, useReducer, type ReactNode } from 'react'
import { StoreContext } from './context'
import { loadState, saveState } from './persistence'
import { reducer } from './reducer'

export default function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, () => loadState())

  useEffect(() => {
    saveState(state)
  }, [state])

  // Keep readiness history ticking over even on days with no study.
  useEffect(() => {
    dispatch({ type: 'snapshotReadiness' })
  }, [])

  const value = useMemo(() => ({ state, dispatch }), [state])

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}
