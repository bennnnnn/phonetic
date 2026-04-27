import { useState, useEffect, useCallback } from 'react'
import { supabase, supabaseErrorMessage } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import type { UserProfile } from '@/lib/types'

type UseProfileReturn = {
  profile: UserProfile | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useProfile(): UseProfileReturn {
  const { user } = useAuthStore()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProfile = useCallback(async () => {
    if (!user) {
      setLoading(false)
      return
    }
    try {
      setLoading(true)
      setError(null)
      const { data, error: sbError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle()
      if (sbError) throw sbError
      setProfile((data as UserProfile | null) ?? null)
    } catch (err) {
      setError(supabaseErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => { fetchProfile() }, [fetchProfile])

  return { profile, loading, error, refetch: fetchProfile }
}
