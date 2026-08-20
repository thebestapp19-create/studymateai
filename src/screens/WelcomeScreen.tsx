import { useState } from 'react'
import { GRADES, saveUserProfile, type UserProfile } from '../lib/userProfile'

type WelcomeScreenProps = {
  onComplete: (profile: UserProfile) => void
}

export default function WelcomeScreen({ onComplete }: WelcomeScreenProps) {
  const [name, setName] = useState('')
  const [grade, setGrade] = useState('')

  const trimmedName = name.trim()
  const canContinue = trimmedName.length > 0 && grade.length > 0

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!canContinue) return

    const profile = { name: trimmedName, grade }
    saveUserProfile(profile)
    onComplete(profile)
  }

  return (
    <div className="flex min-h-dvh justify-center bg-ink px-6 py-12">
      <form
        onSubmit={handleSubmit}
        className="flex w-full max-w-sm flex-col justify-center"
      >
        <header>
          <p className="text-sm font-semibold tracking-wide text-brand">
            StudyMate AI
          </p>
          <h1 className="mt-3 text-[2.6rem] leading-[1.08] font-extrabold tracking-tight text-fg">
            Welcome! Let's get you set up.
          </h1>
          <p className="mt-4 text-lg leading-snug text-muted">
            Tell us a little about yourself so we can personalize your study
            experience.
          </p>
        </header>

        <div className="mt-10">
          <label
            htmlFor="name"
            className="block text-sm font-medium text-muted"
          >
            What should we call you?
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Enter your first name"
            autoComplete="given-name"
            autoFocus
            className="mt-2 w-full rounded-2xl border border-line bg-card px-5 py-4 text-lg text-fg placeholder:text-faint outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-brand/40"
          />
        </div>

        <fieldset className="mt-8 border-0 p-0">
          <legend className="text-sm font-medium text-muted">
            What grade are you in?
          </legend>
          <div className="mt-3 flex flex-wrap gap-2.5">
            {GRADES.map((option) => {
              const selected = option === grade
              return (
                <button
                  key={option}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setGrade(option)}
                  className={`rounded-full border px-4 py-2.5 text-sm font-medium transition-colors ${
                    selected
                      ? 'border-brand bg-brand/15 text-brand'
                      : 'border-line bg-card text-fg hover:border-line-strong'
                  }`}
                >
                  {selected && <span className="mr-1.5">✓</span>}
                  {option}
                </button>
              )
            })}
          </div>
        </fieldset>

        <button
          type="submit"
          disabled={!canContinue}
          className="mt-12 flex w-full items-center justify-center gap-2 rounded-full bg-brand px-6 py-4 text-base font-semibold text-white transition-colors hover:bg-brand-strong disabled:cursor-not-allowed disabled:bg-card disabled:text-faint"
        >
          Continue
          <span aria-hidden="true">→</span>
        </button>
      </form>
    </div>
  )
}
