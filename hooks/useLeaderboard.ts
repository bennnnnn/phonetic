import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import type { LeagueMember } from '@/lib/types'

type UseLeaderboardReturn = {
  members: LeagueMember[]
  userRank: number
  userMember: LeagueMember | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useLeaderboard(): UseLeaderboardReturn {
  const { user } = useAuthStore()
  const [members, setMembers] = useState<LeagueMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchLeaderboard = useCallback(async () => {
    if (!user) {
      setLoading(false)
      return
    }
    try {
      setLoading(true)
      setError(null)

      // Get current user's league
      const { data: memberRow, error: memberErr } = await supabase
        .from('league_members')
        .select('league_id')
        .eq('user_id', user.id)
        .single()

      if (memberErr || !memberRow) {
        setMembers([])
        return
      }

      // Get all members in that league with their profile info
      const { data, error: listErr } = await supabase
        .from('league_members')
        .select(`
          id,
          user_id,
          weekly_xp,
          rank,
          movement,
          user_profiles!inner(display_name, streak_days)
        `)
        .eq('league_id', memberRow.league_id)
        .order('weekly_xp', { ascending: false })

      if (listErr) throw listErr

      const formatted: LeagueMember[] = (data ?? []).map((row: any) => ({
        id: row.id,
        user_id: row.user_id,
        weekly_xp: row.weekly_xp,
        rank: row.rank,
        movement: row.movement,
        display_name: row.user_profiles?.display_name ?? 'Player',
        streak_days: row.user_profiles?.streak_days ?? 0,
      }))

      setMembers(formatted)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchLeaderboard()
  }, [fetchLeaderboard])

  const userMember = members.find((m) => m.user_id === user?.id) ?? null
  const userRank = userMember ? members.indexOf(userMember) + 1 : 0

  return { members, userRank, userMember, loading, error, refetch: fetchLeaderboard }
}
