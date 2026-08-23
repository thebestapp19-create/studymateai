import { useEffect, useRef, useState } from 'react'

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true
  )
}

/** Animate a number towards its new value — used for readiness and mastery. */
export function useCountUp(value: number, duration = 900): number {
  const [reduced] = useState(prefersReducedMotion)
  const [display, setDisplay] = useState(value)
  const fromRef = useRef(value)
  const frameRef = useRef(0)

  useEffect(() => {
    if (reduced) return

    const from = fromRef.current
    if (from === value) return

    const start = performance.now()
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration)
      const eased = 1 - (1 - progress) ** 3
      setDisplay(Math.round(from + (value - from) * eased))
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick)
      } else {
        fromRef.current = value
      }
    }

    frameRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frameRef.current)
  }, [value, duration, reduced])

  return reduced ? value : display
}
