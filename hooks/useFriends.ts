import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'

export type Friend = {
  id: string
  display_name: string
  streak_days: number
  total_xp: number
  joined_at: string
}

export function useFriends() {
  const [friends, setFriends]   = useState<Friend[]>([])
  const [loading, setLoading]   = useState(true)
  const [error,   setError]     = useState<string | null>(null)

  const fetch = useCallback(async () => {
    const { user } = useAuthStore.getState()
    if (!user) return
    setLoading(true)
    setError(null)
    try {
      const { data: rows, error: fErr } = await supabase
        .from('friendships')
        .select('referrer_id, referred_id, created_at')
        .or(`referrer_id.eq.${user.id},referred_id.eq.${user.id}`)

      if (fErr) throw fErr
      if (!rows || rows.length === 0) { setFriends([]); return }

      const friendIds = rows.map((r) =>
        r.referrer_id === user.id ? r.referred_id : r.referrer_id
      )

      const joinedAtById: Record<string, string> = {}
      rows.forEach((r) => {
        const fid = r.referrer_id === user.id ? r.referred_id : r.referrer_id
        joinedAtById[fid] = r.created_at
      })

      const { data: profiles, error: pErr } = await supabase
        .from('user_profiles')
        .select('id, display_name, streak_days, total_xp')
        .in('id', friendIds)

      if (pErr) throw pErr

      const result: Friend[] = (profiles ?? []).map((p) => ({
        id:            p.id,
        display_name:  p.display_name ?? 'Friend',
        streak_days:   p.streak_days  ?? 0,
        total_xp:      p.total_xp     ?? 0,
        joined_at:     joinedAtById[p.id] ?? '',
      }))

      setFriends(result.sort((a, b) => b.total_xp - a.total_xp))
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Could not load friends')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void fetch() }, [])

  return { friends, loading, error, refetch: fetch }
}
