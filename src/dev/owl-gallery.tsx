/**
 * Mascot sheet — every expression and size in one place.
 *
 * Dev only: run `npm run dev` and open /owl.html. It is not part of the
 * production build, but it is the reference to check against whenever the
 * owl changes.
 */
import { createRoot } from 'react-dom/client'
import '../index.css'
import Owl, { type OwlExpression } from '../components/Owl'

const EXPRESSIONS: { id: OwlExpression; use: string }[] = [
  { id: 'happy', use: 'daily welcome, empty states' },
  { id: 'excited', use: 'readiness jumped, near-perfect set' },
  { id: 'proud', use: 'streak milestone, big mastery gain' },
  { id: 'focused', use: 'exam is close' },
  { id: 'thinking', use: 'working out your level' },
  { id: 'encouraging', use: 'back after a gap, rough session' },
  { id: 'surprised', use: 'unexpected result' },
  { id: 'sleepy', use: 'late at night with nothing done' },
]

createRoot(document.getElementById('root')!).render(
  <div className="min-h-dvh bg-ink px-8 py-10">
    <header className="mx-auto max-w-5xl">
      <h1 className="text-2xl font-extrabold tracking-tight text-fg">StudyMate owl</h1>
      <p className="mt-1.5 text-sm text-muted">
        Eight expressions, each tied to a moment the app can actually detect.
      </p>
    </header>

    <div className="mx-auto mt-8 grid max-w-5xl grid-cols-4 gap-4">
      {EXPRESSIONS.map(({ id, use }) => (
        <div key={id} className="rounded-[20px] border border-line bg-card p-5 text-center">
          <Owl expression={id} size={124} />
          <p className="mt-3 text-sm font-semibold text-fg">{id}</p>
          <p className="mt-1 text-xs leading-relaxed text-faint">{use}</p>
        </div>
      ))}
    </div>

    <div className="mx-auto mt-6 max-w-5xl rounded-[20px] border border-line bg-card p-6">
      <p className="text-xs font-semibold tracking-[0.14em] text-faint uppercase">
        Sizes · mark variant below 32px
      </p>
      <div className="mt-4 flex items-end gap-8">
        {[20, 24, 32, 48, 72, 112].map((size) => (
          <div key={size} className="text-center">
            <Owl expression="happy" size={size} variant={size <= 32 ? 'mark' : 'full'} />
            <p className="mt-2 text-[0.68rem] text-faint">{size}px</p>
          </div>
        ))}
      </div>
    </div>
  </div>,
)
