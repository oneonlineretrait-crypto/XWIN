import { useEffect, useState } from 'react'
import { useAuth } from './AuthContext'
import { supabase } from './supabase'

type Profile = {
  id: string
  display_name: string | null
  subscription_status: 'free' | 'vip'
  subscription_expires_at: string | null
  referral_code: string
  public_id: string
}

export function useProfile() {
  const { session } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)

  function refresh() {
    if (!session) return
    supabase
      .from('profiles')
      .select('id, display_name, subscription_status, subscription_expires_at, referral_code, public_id')
      .eq('id', session.user.id)
      .single()
      .then(({ data }) => setProfile(data))
  }

  useEffect(() => {
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session])

  return { profile, refreshProfile: refresh }
}
