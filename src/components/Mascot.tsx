import { useState, type ReactNode } from 'react'
import Owl from './Owl'
import { OWL_NAME, type MascotMoment } from '../lib/engine/mascot'

const TONE_CARD: Record<MascotMoment['tone'], string> = {
  calm: 'border-line bg-card',
  nudge: 'border-line-strong bg-raised',
  celebrate: 'border-brand/25 bg-brand/[0.07]',
}

const TONE_TAIL: Record<MascotMoment['tone'], string> = {
  calm: 'border-line bg-card',
  nudge: 'border-line-strong bg-raised',
  celebrate: 'border-brand/25 bg-[#161e2c]',
}

/**
 * The owl, talking.
 *
 * A study partner that only ever appears in a caption is a logo; the speech
 * bubble is what makes it read as someone in the room. Tapping the owl moves
 * to the next thing it has to say.
 */
export function MascotSay({
  moment,
  size = 64,
  className = '',
}: {
  moment: MascotMoment
  size?: number
  className?: string
}) {
  const [index, setIndex] = useState(0)
  const [pokes, setPokes] = useState(0)
  const [shown, setShown] = useState(moment.lines[0])

  // A new trigger starts from its own first line.
  if (shown !== moment.lines[0]) {
    setShown(moment.lines[0])
    setIndex(0)
  }

  const line = moment.lines[index % moment.lines.length]
  const celebrate = moment.tone === 'celebrate'

  return (
    <div className={`flex items-start gap-2.5 ${className}`}>
      <button
        type="button"
        onClick={() => {
          setIndex((value) => value + 1)
          setPokes((value) => value + 1)
        }}
        aria-label={`${OWL_NAME} has more to say`}
        className="-mt-1 shrink-0 rounded-full transition-transform active:scale-95"
      >
        <span key={pokes} className={pokes > 0 ? 'owl-poke block' : 'block'}>
          <Owl expression={moment.expression} size={size} bounce={celebrate && pokes === 0} />
        </span>
      </button>

      <div
        className={`relative mt-1.5 min-w-0 flex-1 rounded-[18px] border px-3.5 py-2.5 ${TONE_CARD[moment.tone]}`}
      >
        <span
          className={`absolute top-4 -left-[7px] h-3 w-3 rotate-45 border-b border-l ${TONE_TAIL[moment.tone]}`}
        />
        <p className="relative text-[0.88rem] leading-relaxed text-muted">{line}</p>
      </div>
    </div>
  )
}

/** A compact line with no bubble, for places that already have a card. */
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
      <Owl
        expression={moment.expression}
        size={size}
        bounce={moment.tone === 'celebrate'}
      />
      <p className="mt-2 max-w-[19rem] text-[0.92rem] leading-relaxed text-muted">
        {moment.line}
      </p>
    </div>
  )
}

/** Small inline reaction, for use mid-session. */
export function MascotReaction({
  moment,
  label,
  labelClass,
  children,
}: {
  moment: MascotMoment
  label: string
  labelClass: string
  children?: ReactNode
}) {
  return (
    <div className="flex items-start gap-2.5">
      <Owl expression={moment.expression} size={40} className="-mt-1 shrink-0" />
      <div className="min-w-0 flex-1">
        <p className={`text-sm font-semibold ${labelClass}`}>{label}</p>
        <p className="mt-0.5 text-[0.82rem] leading-relaxed text-brand-tint/80">
          {moment.line}
        </p>
        {children}
      </div>
    </div>
  )
}
