import { useState } from 'react'
import { ArrowRightIcon, SparkleIcon } from '../components/icons'
import { Button } from '../components/ui/primitives'
import { useDispatch } from '../lib/store/context'

export default function WelcomeScreen() {
  const dispatch = useDispatch()
  const [name, setName] = useState('')
  const trimmed = name.trim()

  function submit(event: React.FormEvent) {
    event.preventDefault()
    if (trimmed.length === 0) return
    dispatch({ type: 'setName', name: trimmed })
  }

  return (
    <div className="app-glow relative flex min-h-dvh justify-center px-6 py-12">
      <form
        onSubmit={submit}
        className="relative z-10 flex w-full max-w-sm flex-col justify-center"
      >
        <div className="animate-rise">
          <span className="inline-flex items-center gap-2 rounded-full border border-line bg-card px-3 py-1.5 text-[0.72rem] font-semibold tracking-[0.12em] text-brand uppercase">
            <SparkleIcon className="h-3.5 w-3.5" />
            StudyMate AI
          </span>
        </div>

        <h1
          className="animate-rise mt-7 text-[2.7rem] leading-[1.05] font-extrabold tracking-[-0.035em] text-fg"
          style={{ animationDelay: '60ms' }}
        >
          What should we call you?
        </h1>

        <p
          className="animate-rise mt-4 text-[1.05rem] leading-relaxed text-muted"
          style={{ animationDelay: '120ms' }}
        >
          That is the whole setup. No account, no questionnaire — StudyMate learns
          your level from how you actually answer.
        </p>

        <div className="animate-rise mt-9" style={{ animationDelay: '180ms' }}>
          <label htmlFor="name" className="sr-only">
            Your name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Your first name"
            autoComplete="given-name"
            autoFocus
            maxLength={24}
            className="w-full rounded-2xl border border-line bg-card px-5 py-4 text-lg text-fg transition-colors outline-none placeholder:text-faint focus:border-brand/70 focus:bg-raised"
          />
        </div>

        <div className="animate-rise mt-6" style={{ animationDelay: '240ms' }}>
          <Button type="submit" size="lg" full disabled={trimmed.length === 0}>
            Start
            <ArrowRightIcon className="h-5 w-5" />
          </Button>
        </div>
      </form>
    </div>
  )
}
