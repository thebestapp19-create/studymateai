/**
 * The StudyMate owl.
 *
 * Drawn from the app's own geometry so it reads as part of the product rather
 * than a sticker on top of it:
 *
 *   · the silhouette is a shield with two chevron peaks — the same chevron the
 *     app uses for upward progress, built into the outline so the shape is
 *     recognisable down to favicon size;
 *   · the face is one of the app's rounded cards, with the blue hairline it
 *     uses for a selected state;
 *   · a progress arc sits across the belly, filled the way the app fills bars.
 *
 * Palette stays inside the existing tokens: slate body, one blue accent, amber
 * only on the beak and feet.
 */

export type OwlExpression =
  | 'happy'
  | 'excited'
  | 'proud'
  | 'focused'
  | 'thinking'
  | 'encouraging'
  | 'surprised'
  | 'sleepy'

type EyeShape = 'open' | 'wide' | 'half' | 'archUp' | 'archDown'
type Extras = 'sparkles' | 'dots' | 'zzz' | 'star' | null

type Face = {
  eye: EyeShape
  /** Pupil offset from the eye centre, in viewBox units. */
  look: [number, number]
  /** Brow lift above the eye and inward tilt in degrees. */
  brow: [number, number]
  /** Overrides for the right brow, for the asymmetric thinking face. */
  browRight?: [number, number]
  /** How far the head tips, in degrees. */
  tilt: number
  beak: 'closed' | 'open'
  wave: boolean
  extras: Extras
  cheeks: boolean
}

const FACES: Record<OwlExpression, Face> = {
  happy: { eye: 'open', look: [0, 0], brow: [0.4, 4], tilt: 0, beak: 'closed', wave: false, extras: null, cheeks: true },
  excited: { eye: 'wide', look: [0, -0.8], brow: [3, 8], tilt: -3, beak: 'open', wave: false, extras: 'sparkles', cheeks: true },
  proud: { eye: 'archUp', look: [0, 0], brow: [2.4, 6], tilt: 0, beak: 'closed', wave: false, extras: 'star', cheeks: true },
  focused: { eye: 'half', look: [0, 1.2], brow: [-2.4, -13], tilt: 0, beak: 'closed', wave: false, extras: null, cheeks: false },
  thinking: { eye: 'open', look: [-2.2, -1.8], brow: [-0.4, 2], browRight: [3.6, -6], tilt: 6, beak: 'closed', wave: false, extras: 'dots', cheeks: false },
  encouraging: { eye: 'open', look: [0.6, 0], brow: [1.8, 5], tilt: -4, beak: 'closed', wave: true, extras: null, cheeks: true },
  surprised: { eye: 'wide', look: [0, 0.4], brow: [4.4, 0], tilt: 0, beak: 'open', wave: false, extras: null, cheeks: false },
  sleepy: { eye: 'archDown', look: [0, 0], brow: [-1.4, -4], tilt: 8, beak: 'closed', wave: false, extras: 'zzz', cheeks: false },
}

const EYE_Y = 56
const EYE_X = { left: 45, right: 75 }

/** Shield with two swept feather peaks — the whole mark lives in this outline. */
const BODY =
  'M25 47 Q26 33 31 26 Q36 17 42 29 C48 34 53 32 60 32 C67 32 72 34 78 29 ' +
  'Q84 17 89 26 Q94 33 95 47 C101 59 101 78 96 90 C91 102 78 109 60 109 ' +
  'C42 109 29 102 24 90 C19 78 19 59 25 47 Z'

function Eye({ cx, face }: { cx: number; face: Face }) {
  const { eye, look } = face
  const radius = eye === 'wide' ? 11.2 : 9.8
  const pupil = eye === 'wide' ? 4.6 : 5.6

  if (eye === 'archUp' || eye === 'archDown') {
    const sweep = eye === 'archUp' ? -9 : 8
    return (
      <path
        d={`M${cx - 8.5} ${EYE_Y + (eye === 'archUp' ? 2.5 : -1.5)} q8.5 ${sweep} 17 0`}
        fill="none"
        stroke="#0b0e14"
        strokeWidth={3.2}
        strokeLinecap="round"
      />
    )
  }

  return (
    <g>
      <circle cx={cx} cy={EYE_Y} r={radius} fill="#f0f4fd" />
      <circle cx={cx + look[0]} cy={EYE_Y + look[1]} r={pupil} fill="#0b0e14" />
      <circle
        cx={cx + look[0] - pupil * 0.36}
        cy={EYE_Y + look[1] - pupil * 0.42}
        r={pupil * 0.32}
        fill="#ffffff"
      />
      {eye === 'half' && (
        <path
          d={`M${cx - radius} ${EYE_Y - radius} h${radius * 2} v${radius * 0.52} a${radius} ${radius} 0 0 1 ${-radius * 2} 0 z`}
          fill="url(#owl-face)"
        />
      )}
      {/* Lid, parked open — the blink animation sweeps it down. */}
      <g className="owl-blink" style={{ transformOrigin: `${cx}px ${EYE_Y - radius}px` }}>
        <circle cx={cx} cy={EYE_Y} r={radius + 0.5} fill="url(#owl-face)" />
      </g>
    </g>
  )
}

function Brow({ cx, lift, tilt }: { cx: number; lift: number; tilt: number }) {
  const y = EYE_Y - 14.5 - lift
  return (
    <path
      d={`M${cx - 7.6} ${y} q7.6 -3.2 15.2 0`}
      fill="none"
      stroke="#7f93b4"
      strokeWidth={2.4}
      strokeLinecap="round"
      transform={`rotate(${tilt} ${cx} ${y})`}
    />
  )
}

export default function Owl({
  expression = 'happy',
  size = 96,
  variant = 'full',
  className = '',
}: {
  expression?: OwlExpression
  size?: number
  /** `mark` drops the small detail that turns to mush below ~32px. */
  variant?: 'full' | 'mark'
  className?: string
}) {
  const face = FACES[expression]
  const detailed = variant === 'full'

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      className={className}
      role="img"
      aria-label={`StudyMate owl, ${expression}`}
    >
      <defs>
        <linearGradient id="owl-body" x1="0.2" y1="0" x2="0.7" y2="1">
          <stop offset="0%" stopColor="#2a3446" />
          <stop offset="100%" stopColor="#141a24" />
        </linearGradient>
        <linearGradient id="owl-face" x1="0.2" y1="0" x2="0.8" y2="1">
          <stop offset="0%" stopColor="#333f54" />
          <stop offset="100%" stopColor="#1e2634" />
        </linearGradient>
        <linearGradient id="owl-beak" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f2b862" />
          <stop offset="100%" stopColor="#d18723" />
        </linearGradient>
      </defs>

      <g className="owl-float">
        {detailed && (
          // Feet first, so the body sits on top of them.
          <g stroke="#d18723" strokeWidth={3.2} strokeLinecap="round" strokeLinejoin="round" fill="none">
            <path d="M50 103 v4 M50 107 l-5 4 M50 107 v4.5 M50 107 l5 4" />
            <path d="M70 103 v4 M70 107 l-5 4 M70 107 v4.5 M70 107 l5 4" />
          </g>
        )}

        {face.wave && detailed && (
          <g className="owl-wave" style={{ transformOrigin: '30px 76px' }}>
            <path
              d="M30 68 q-14 2 -18 -10 q9 -6 20 -2 z"
              fill="url(#owl-body)"
              stroke="#ffffff"
              strokeOpacity={0.12}
              strokeWidth={1.3}
              strokeLinejoin="round"
            />
          </g>
        )}

        <g style={{ transformOrigin: '60px 80px' }} transform={`rotate(${face.tilt} 60 80)`}>
          <path
            d={BODY}
            fill="url(#owl-body)"
            stroke="#ffffff"
            strokeOpacity={0.13}
            strokeWidth={1.5}
            strokeLinejoin="round"
          />

          {detailed && (
            <>
              {/* Folded wings, indicated inside the silhouette. */}
              <path
                d="M27 58 q-3 18 4 33"
                fill="none"
                stroke="#ffffff"
                strokeOpacity={0.09}
                strokeWidth={1.6}
                strokeLinecap="round"
              />
              <path
                d="M93 58 q3 18 -4 33"
                fill="none"
                stroke="#ffffff"
                strokeOpacity={0.09}
                strokeWidth={1.6}
                strokeLinecap="round"
              />

              {/* Belly: a progress bar, filled the way the app fills its bars. */}
              <rect x={46} y={92} width={28} height={4} rx={2} fill="#ffffff" fillOpacity={0.09} />
              <rect x={46} y={92} width={17} height={4} rx={2} fill="#3b82f6" fillOpacity={0.85} />
            </>
          )}

          {/* The face is one of the app's cards. */}
          <rect x={25} y={34} width={70} height={44} rx={21} fill="url(#owl-face)" />
          <rect
            x={25}
            y={34}
            width={70}
            height={44}
            rx={21}
            fill="none"
            stroke="#3b82f6"
            strokeOpacity={0.55}
            strokeWidth={1.7}
          />

          {face.cheeks && detailed && (
            <rect
              x={27}
              y={36}
              width={66}
              height={40}
              rx={19}
              fill="#3b82f6"
              fillOpacity={0.07}
            />
          )}

          <Eye cx={EYE_X.left} face={face} />
          <Eye cx={EYE_X.right} face={face} />

          {detailed && (
            <>
              <Brow cx={EYE_X.left} lift={face.brow[0]} tilt={face.brow[1]} />
              <Brow
                cx={EYE_X.right}
                lift={(face.browRight ?? face.brow)[0]}
                tilt={-(face.browRight ?? face.brow)[1]}
              />
            </>
          )}

          {/* Beak — the one warm note in the palette. */}
          {face.beak === 'open' ? (
            <path
              d="M54.5 67 h11 q0 9 -5.5 9 q-5.5 0 -5.5 -9 z"
              fill="url(#owl-beak)"
              strokeLinejoin="round"
            />
          ) : (
            <path
              d="M60 67.5 l5.5 6.5 q-5.5 5 -11 0 z"
              fill="url(#owl-beak)"
              strokeLinejoin="round"
            />
          )}
        </g>

        {face.extras === 'sparkles' && detailed && (
          <g fill="#93b8fb">
            <path className="owl-spark owl-spark-1" d="M101 28 l1.9 4.8 4.8 1.9 -4.8 1.9 -1.9 4.8 -1.9 -4.8 -4.8 -1.9 4.8 -1.9 z" />
            <path className="owl-spark owl-spark-2" d="M15 42 l1.4 3.6 3.6 1.4 -3.6 1.4 -1.4 3.6 -1.4 -3.6 -3.6 -1.4 3.6 -1.4 z" />
            <path className="owl-spark owl-spark-3" d="M104 52 l1.1 2.8 2.8 1.1 -2.8 1.1 -1.1 2.8 -1.1 -2.8 -2.8 -1.1 2.8 -1.1 z" />
          </g>
        )}

        {face.extras === 'star' && detailed && (
          <path
            className="owl-spark owl-spark-1"
            d="M100 26 l2.3 5.8 5.8 2.3 -5.8 2.3 -2.3 5.8 -2.3 -5.8 -5.8 -2.3 5.8 -2.3 z"
            fill="#f2b862"
          />
        )}

        {face.extras === 'dots' && detailed && (
          <g fill="#93b8fb">
            <circle className="owl-dot owl-dot-1" cx={99} cy={40} r={2.4} />
            <circle className="owl-dot owl-dot-2" cx={106} cy={31} r={3.2} />
            <circle className="owl-dot owl-dot-3" cx={114} cy={21} r={4} />
          </g>
        )}

        {face.extras === 'zzz' && detailed && (
          <g fill="none" stroke="#93b8fb" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
            <path className="owl-zzz owl-zzz-1" d="M96 40 h7 l-7 8 h7" />
            <path className="owl-zzz owl-zzz-2" d="M106 26 h9 l-9 10 h9" />
          </g>
        )}
      </g>
    </svg>
  )
}
