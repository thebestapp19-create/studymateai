/**
 * The StudyMate owl.
 *
 * Built for appeal rather than restraint: round shapes stacked into a chunky
 * silhouette, eyes that take up most of the face, flat fills and no outlines.
 * The palette lives in CSS custom properties so the character can be retuned
 * without touching the artwork.
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
  browRight?: [number, number]
  /** How far the head tips, in degrees. */
  tilt: number
  beak: 'closed' | 'open'
  /** Wings behave like arms: down, waving, or thrown up. */
  pose: 'rest' | 'wave' | 'cheer'
  extras: Extras
  blush: boolean
}

const FACES: Record<OwlExpression, Face> = {
  happy: { eye: 'open', look: [0, 0], brow: [0, 4], tilt: 0, beak: 'closed', pose: 'wave', extras: null, blush: true },
  excited: { eye: 'wide', look: [0, -1], brow: [3, 9], tilt: -4, beak: 'open', pose: 'cheer', extras: 'sparkles', blush: true },
  proud: { eye: 'archUp', look: [0, 0], brow: [2.5, 7], tilt: 0, beak: 'closed', pose: 'cheer', extras: 'star', blush: true },
  focused: { eye: 'half', look: [0, 1.5], brow: [-2.5, -14], tilt: 0, beak: 'closed', pose: 'rest', extras: null, blush: false },
  thinking: { eye: 'open', look: [-3, -2.5], brow: [-0.5, 2], browRight: [4, -7], tilt: 7, beak: 'closed', pose: 'rest', extras: 'dots', blush: false },
  encouraging: { eye: 'open', look: [1, 0], brow: [2, 6], tilt: -5, beak: 'closed', pose: 'wave', extras: null, blush: true },
  surprised: { eye: 'wide', look: [0, 0.5], brow: [5, 0], tilt: 0, beak: 'open', pose: 'rest', extras: null, blush: false },
  sleepy: { eye: 'archDown', look: [0, 0], brow: [-1.5, -5], tilt: 9, beak: 'closed', pose: 'rest', extras: 'zzz', blush: false },
}

const EYE_Y = 47
const EYE_X = { left: 44, right: 76 }

/** The cream mask the eyes sit in — wide, soft, with a gentle heart notch. */
const MASK =
  'M60 22 C50 12 30 16 25 33 C20 49 26 66 38 74 C46 79 54 84 60 90 ' +
  'C66 84 74 79 82 74 C94 66 100 49 95 33 C90 16 70 12 60 22 Z'

function Eye({ cx, face }: { cx: number; face: Face }) {
  const { eye, look } = face
  const radius = eye === 'wide' ? 16.5 : 15
  const pupil = eye === 'wide' ? 7 : 8.4

  if (eye === 'archUp' || eye === 'archDown') {
    const sweep = eye === 'archUp' ? -13 : 12
    return (
      <path
        d={`M${cx - 12} ${EYE_Y + (eye === 'archUp' ? 4 : -2)} q12 ${sweep} 24 0`}
        fill="none"
        stroke="var(--owl-eye)"
        strokeWidth={4.6}
        strokeLinecap="round"
      />
    )
  }

  return (
    <g>
      <circle cx={cx} cy={EYE_Y} r={radius} fill="var(--owl-disc-lit)" />
      <circle cx={cx + look[0]} cy={EYE_Y + look[1]} r={pupil} fill="var(--owl-eye)" />
      <circle
        cx={cx + look[0] - pupil * 0.34}
        cy={EYE_Y + look[1] - pupil * 0.4}
        r={pupil * 0.34}
        fill="#ffffff"
      />
      {eye === 'half' && (
        <path
          d={`M${cx - radius} ${EYE_Y - radius} h${radius * 2} v${radius * 0.5} a${radius} ${radius} 0 0 1 ${-radius * 2} 0 z`}
          fill="var(--owl-disc)"
        />
      )}
      {/* Lid, parked open — the blink animation sweeps it down. */}
      <g className="owl-blink" style={{ transformOrigin: `${cx}px ${EYE_Y - radius}px` }}>
        <circle cx={cx} cy={EYE_Y} r={radius + 0.5} fill="var(--owl-disc)" />
      </g>
    </g>
  )
}

function Brow({ cx, lift, tilt }: { cx: number; lift: number; tilt: number }) {
  const y = EYE_Y - 18 - lift
  return (
    <path
      d={`M${cx - 11} ${y} q11 -5 22 0`}
      fill="none"
      stroke="var(--owl-brow)"
      strokeWidth={3.4}
      strokeLinecap="round"
      transform={`rotate(${tilt} ${cx} ${y})`}
    />
  )
}

export default function Owl({
  expression = 'happy',
  size = 96,
  variant = 'full',
  bounce = false,
  className = '',
}: {
  expression?: OwlExpression
  size?: number
  /** `mark` drops the small detail that turns to mush below ~32px. */
  variant?: 'full' | 'mark'
  /** A single hop, for the moment a celebration lands. */
  bounce?: boolean
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
        <radialGradient id="owl-halo" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="var(--owl-halo)" stopOpacity="0.26" />
          <stop offset="100%" stopColor="var(--owl-halo)" stopOpacity="0" />
        </radialGradient>
      </defs>

      <ellipse cx={60} cy={60} rx={58} ry={56} fill="url(#owl-halo)" />

      <g className={bounce ? 'owl-celebrate' : 'owl-float'}>
        {detailed && (
          <g fill="var(--owl-foot)">
            <ellipse cx={49} cy={110} rx={9} ry={5} />
            <ellipse cx={71} cy={110} rx={9} ry={5} />
          </g>
        )}

        <g style={{ transformOrigin: '60px 80px' }} transform={`rotate(${face.tilt} 60 80)`}>
          {/* Ear tufts, soft and low. */}
          <path d="M31 30 Q28 10 46 17 Z" fill="var(--owl-body)" />
          <path d="M89 30 Q92 10 74 17 Z" fill="var(--owl-body)" />

          {/* Body: a rounded base with a big round head stacked on it. */}
          <ellipse cx={60} cy={86} rx={35} ry={26} fill="var(--owl-body)" />
          <circle cx={60} cy={50} r={40} fill="var(--owl-body)" />

          {detailed && (
            <>
              {/* Wings behave like arms. */}
              <g
                className={face.pose === 'wave' ? 'owl-wave' : ''}
                style={{ transformOrigin: '27px 84px' }}
              >
                <ellipse
                  cx={face.pose === 'cheer' ? 20 : 24}
                  cy={face.pose === 'cheer' ? 52 : 84}
                  rx={11}
                  ry={19}
                  fill="var(--owl-wing)"
                  transform={face.pose === 'cheer' ? 'rotate(38 20 52)' : 'rotate(-8 24 84)'}
                />
              </g>
              <ellipse
                cx={face.pose === 'cheer' ? 100 : 96}
                cy={face.pose === 'cheer' ? 52 : 84}
                rx={11}
                ry={19}
                fill="var(--owl-wing)"
                transform={face.pose === 'cheer' ? 'rotate(-38 100 52)' : 'rotate(8 96 84)'}
              />

              <ellipse cx={60} cy={92} rx={22} ry={17} fill="var(--owl-belly)" />
            </>
          )}

          {/* The face the eyes live in. */}
          <path d={MASK} fill="var(--owl-disc)" />

          {face.blush && detailed && (
            <>
              <ellipse cx={31} cy={62} rx={6.5} ry={4} fill="var(--owl-blush)" fillOpacity={0.6} />
              <ellipse cx={89} cy={62} rx={6.5} ry={4} fill="var(--owl-blush)" fillOpacity={0.6} />
            </>
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

          {face.beak === 'open' ? (
            <path d="M53 62 h14 q0 12 -7 12 q-7 0 -7 -12 z" fill="var(--owl-beak)" />
          ) : (
            <path d="M60 60 l7.5 9 q-7.5 7 -15 0 z" fill="var(--owl-beak)" />
          )}
        </g>

        {face.extras === 'sparkles' && detailed && (
          <g fill="var(--owl-spark)">
            <path className="owl-spark owl-spark-1" d="M104 24 l2.2 5.6 5.6 2.2 -5.6 2.2 -2.2 5.6 -2.2 -5.6 -5.6 -2.2 5.6 -2.2 z" />
            <path className="owl-spark owl-spark-2" d="M11 36 l1.6 4 4 1.6 -4 1.6 -1.6 4 -1.6 -4 -4 -1.6 4 -1.6 z" />
            <path className="owl-spark owl-spark-3" d="M108 50 l1.2 3 3 1.2 -3 1.2 -1.2 3 -1.2 -3 -3 -1.2 3 -1.2 z" />
          </g>
        )}

        {face.extras === 'star' && detailed && (
          <path
            className="owl-spark owl-spark-1"
            d="M103 22 l2.6 6.4 6.4 2.6 -6.4 2.6 -2.6 6.4 -2.6 -6.4 -6.4 -2.6 6.4 -2.6 z"
            fill="var(--owl-beak)"
          />
        )}

        {face.extras === 'dots' && detailed && (
          <g fill="var(--owl-spark)">
            <circle className="owl-dot owl-dot-1" cx={101} cy={30} r={2.6} />
            <circle className="owl-dot owl-dot-2" cx={108} cy={20} r={3.4} />
            <circle className="owl-dot owl-dot-3" cx={115} cy={10} r={4.2} />
          </g>
        )}

        {face.extras === 'zzz' && detailed && (
          <g fill="none" stroke="var(--owl-spark)" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
            <path className="owl-zzz owl-zzz-1" d="M98 30 h7 l-7 8 h7" />
            <path className="owl-zzz owl-zzz-2" d="M108 16 h9 l-9 10 h9" />
          </g>
        )}
      </g>
    </svg>
  )
}
