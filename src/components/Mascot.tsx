import Owl from './Owl'
import type { MascotMoment } from '../lib/engine/mascot'

const TONE_CARD: Record<MascotMoment['tone'], string> = {
  calm: 'border-line bg-card',
  nudge: 'border-line-strong bg-raised',
  celebrate: 'border-brand/25 bg-brand/[0.07]',
}

/**
 * The owl's inline voice — one line, one expression, sized to sit inside a
 * screen without taking it over.
 */
export function MascotNote({
  moment,
  className = '',
}: {
  moment: MascotMoment
  className?: string
}) {
  return (
    <div
      className={`flex items-center gap-3 rounded-[20px] border py-3.5 pr-4 pl-3 ${TONE_CARD[moment.tone]} ${className}`}
    >
      <Owl expression={moment.expression} size={54} className="shrink-0" />
      <p className="min-w-0 text-[0.88rem] leading-relaxed text-muted">{moment.line}</p>
    </div>
  )
}

/** The owl at full height, for the moments that deserve one. */
export function MascotHero({
  moment,
  size = 104,
  className = '',
}: {
  moment: MascotMoment
  size?: number
  className?: string
}) {
  return (
    <div className={`flex flex-col items-center text-center ${className}`}>
      <Owl expression={moment.expression} size={size} />
      <p className="mt-2 max-w-[19rem] text-[0.92rem] leading-relaxed text-muted">
        {moment.line}
      </p>
    </div>
  )
}
