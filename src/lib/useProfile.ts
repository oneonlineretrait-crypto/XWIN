import { useEffect, useState } from 'react'
import { useAuth } from './AuthContext'
import { supabase } from './supabase'

type Profile = {
  id: string
  subscription_status: 'free' | 'vip'
  subscription_expires_at: string | null
}

export function useProfile() {
  const { session } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)

  useEffect(() => {
    if (!session) return
    supabase
      .from('profiles')
      .select('id, subscription_status, subscription_expires_at')
      .eq('id', session.user.id)
      .single()
      .then(({ data }) => setProfile(data))
  }, [session])

  return profile
}
