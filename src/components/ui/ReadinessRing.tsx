import { useEffect, useState } from 'react'
import { useCountUp } from '../../lib/useCountUp'

type ReadinessRingProps = {
  value: number
  size?: number
  stroke?: number
  caption?: string
  sub?: string
}

export default function ReadinessRing({
  value,
  size = 188,
  stroke = 13,
  caption = 'ready',
  sub,
}: ReadinessRingProps) {
  const [mounted, setMounted] = useState(false)
  const display = useCountUp(value)
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const clamped = Math.min(100, Math.max(0, value))
  const offset = circumference * (1 - (mounted ? clamped : 0) / 100)

  useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true))
    return () => cancelAnimationFrame(frame)
  }, [])

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <defs>
          <linearGradient id="readiness-arc" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#60a5fa" />
            <stop offset="55%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#2563eb" />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.07)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#readiness-arc)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1.1s cubic-bezier(0.22, 1, 0.36, 1)' }}
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="tnum font-extrabold tracking-[-0.04em] text-fg"
          style={{ fontSize: size * 0.3, lineHeight: 1 }}
        >
          {display}
          <span className="text-muted" style={{ fontSize: size * 0.14 }}>
            %
          </span>
        </span>
        <span className="mt-1 text-sm font-medium text-muted">{caption}</span>
        {sub && <span className="mt-0.5 text-xs text-faint">{sub}</span>}
      </div>
    </div>
  )
}
