import { useState } from 'react'
import WelcomeScreen from './screens/WelcomeScreen'
import { loadUserProfile, type UserProfile } from './lib/userProfile'

export default function App() {
  const [profile, setProfile] = useState<UserProfile | null>(loadUserProfile)

  if (!profile) {
    return <WelcomeScreen onComplete={setProfile} />
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-ink px-6 text-center">
      <h1 className="text-4xl font-extrabold tracking-tight text-fg">
        You're all set, {profile.name}.
      </h1>
      <p className="mt-3 text-lg text-muted">{profile.grade}</p>
    </div>
  )
}
