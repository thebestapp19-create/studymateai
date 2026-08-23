import { useEffect, useState } from 'react'

/**
 * The current time, refreshed on an interval.
 *
 * Countdowns, "last studied" labels and readiness all depend on the clock, so
 * the clock is treated as what it is — an external system the UI subscribes to
 * rather than something read during render.
 */
export function useNow(intervalMs = 60_000): number {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), intervalMs)
    return () => window.clearInterval(timer)
  }, [intervalMs])

  return now
}
