import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import type { Friend } from '@/lib/types'

export type { Friend }

type StatsRow = {
  friend_id: string
  lessons_completed_total: number
  lessons_completed_last_7d: number
}

export function useFriends() {
  const [friends, setFriends]   = useState<Friend[]>([])
  const [loading, setLoading]   = useState(true)
  const [error,   setError]     = useState<string | null>(null)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => { mountedRef.current = false }
  }, [])

  const fetchFriends = useCallback(async (): Promise<Friend[]> => {
    const { user } = useAuthStore.getState()
    if (!user) {
      if (mountedRef.current) setFriends([])
      return []
    }
    if (mountedRef.current) { setLoading(true); setError(null) }
    try {
      const { data: rows, error: fErr } = await supabase
        .from('friendships')
        .select('referrer_id, referred_id, created_at')
        .or(`referrer_id.eq.${user.id},referred_id.eq.${user.id}`)

      if (fErr) throw fErr
      if (!rows?.length) {
        if (mountedRef.current) setFriends([])
        return []
      }

      const friendIds = rows.map((r) =>
        r.referrer_id === user.id ? r.referred_id : r.referrer_id)

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

      let statsById: Record<string, { total: number; last7: number }> = {}
      try {
        const { data: statRows, error: sErr } = await supabase.rpc('get_friends_lesson_stats')
        if (!sErr && Array.isArray(statRows)) {
          for (const r of statRows as StatsRow[]) {
            statsById[r.friend_id] = {
              total: r.lessons_completed_total ?? 0,
              last7: r.lessons_completed_last_7d ?? 0,
            }
          }
        }
      } catch {
        // RPC missing until migration 023 — friends list still works
      }

      const result: Friend[] = (profiles ?? []).map((p) => {
        const s = statsById[p.id]
        return {
          id:            p.id,
          display_name:  p.display_name ?? 'Friend',
          streak_days:   p.streak_days  ?? 0,
          total_xp:      p.total_xp     ?? 0,
          joined_at:     joinedAtById[p.id] ?? '',
          ...(s
            ? {
                lessons_completed_total: s.total,
                lessons_completed_last_7d: s.last7,
              }
            : {}),
        }
      })

      result.sort((a, b) => {
        if (b.total_xp !== a.total_xp) return b.total_xp - a.total_xp
        return a.display_name.localeCompare(b.display_name, undefined, { sensitivity: 'base' })
      })
      if (mountedRef.current) setFriends(result)
      return result
    } catch (err: unknown) {
      if (mountedRef.current) {
        setError(err instanceof Error ? err.message : 'Could not load friends')
        setFriends([])
      }
      return []
    } finally {
      if (mountedRef.current) setLoading(false)
    }
  }, [])

  useEffect(() => { void fetchFriends() }, [fetchFriends])

  return { friends, loading, error, refetch: fetchFriends }
}
