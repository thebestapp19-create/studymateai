type SparklineProps = {
  values: number[]
  width?: number
  height?: number
  className?: string
}

export default function Sparkline({
  values,
  width = 220,
  height = 56,
  className = '',
}: SparklineProps) {
  if (values.length < 2) {
    return (
      <div
        className={`flex items-center text-xs text-faint ${className}`}
        style={{ height }}
      >
        Not enough history yet — study twice and a trend appears here.
      </div>
    )
  }

  const max = Math.max(...values, 1)
  const min = Math.min(...values, 0)
  const span = Math.max(1, max - min)
  const step = width / (values.length - 1)

  const points = values.map((value, index) => {
    const x = index * step
    const y = height - ((value - min) / span) * (height - 8) - 4
    return `${x.toFixed(1)},${y.toFixed(1)}`
  })

  const area = `M0,${height} L${points.join(' L')} L${width},${height} Z`

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={`w-full ${className}`}
      style={{ height }}
      preserveAspectRatio="none"
      aria-hidden
    >
      <defs>
        <linearGradient id="spark-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(59,130,246,0.35)" />
          <stop offset="100%" stopColor="rgba(59,130,246,0)" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#spark-fill)" />
      <polyline
        points={points.join(' ')}
        fill="none"
        stroke="#60a5fa"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  )
}
