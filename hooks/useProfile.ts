import { useState, useEffect, useCallback } from 'react'
import { supabase, supabaseErrorMessage } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { readCache, writeCache, CACHE_TYPES } from '@/lib/offlineCache'
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
    const currentUser = useAuthStore.getState().user
    if (!currentUser) {
      setProfile(null)
      setLoading(false)
      return
    }

    // 1. Check cache first for instant render
    const cached = await readCache<UserProfile>(CACHE_TYPES.USER_PROFILE, currentUser.id)
    if (cached) {
      setProfile(cached.data)
      setLoading(false)
      if (!cached.stale) return // fresh cache, skip network
    }

    // 2. Fetch from network
    try {
      if (!cached) setLoading(true)
      setError(null)
      const { data, error: sbError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', currentUser.id)
        .maybeSingle()
      if (sbError) throw sbError
      const p = (data as UserProfile | null) ?? null
      setProfile(p)
      // 3. Write to cache on success
      if (p) {
        void writeCache(CACHE_TYPES.USER_PROFILE, currentUser.id, p)
      }
    } catch (err) {
      setError(supabaseErrorMessage(err))
      // Keep cached data if network fails
    } finally {
      setLoading(false)
    }
  }, []) // no deps — reads user synchronously from store

  useEffect(() => { fetchProfile() }, [fetchProfile])

  return { profile, loading, error, refetch: fetchProfile }
}
