import { useState } from 'react'
import HomeScreen from './screens/HomeScreen'
import WelcomeScreen from './screens/WelcomeScreen'
import { loadUserProfile, type UserProfile } from './lib/userProfile'

export default function App() {
  const [profile, setProfile] = useState<UserProfile | null>(loadUserProfile)

  if (!profile) {
    return <WelcomeScreen onComplete={setProfile} />
  }

  return <HomeScreen profile={profile} />
}
