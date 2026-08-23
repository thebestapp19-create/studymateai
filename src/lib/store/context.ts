import { createContext, useContext, type Dispatch } from 'react'
import { createInitialState } from './persistence'
import type { Action } from './reducer'
import type { AppState } from './types'

export type StoreValue = {
  state: AppState
  dispatch: Dispatch<Action>
}

export const StoreContext = createContext<StoreValue>({
  state: createInitialState(0),
  dispatch: () => undefined,
})

export function useStore(): StoreValue {
  return useContext(StoreContext)
}

export function useAppState(): AppState {
  return useContext(StoreContext).state
}

export function useDispatch(): Dispatch<Action> {
  return useContext(StoreContext).dispatch
}
