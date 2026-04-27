import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { levelFromTotalXp } from '@/lib/xpLevel'

type SaveProgressInput = {
  lessonId: string
  score: number
  xpEarned: number
  wordsMastered?: string[]
  wordsSkipped?: string[]
}

type UseSaveProgressReturn = {
  saving: boolean
  error: string | null
  saveProgress: (input: SaveProgressInput) => Promise<void>
}

async function syncProfileTotalXp(userId: string, displayName: string) {
  const { data: rows, error } = await supabase.from('user_progress').select('xp_earned').eq('user_id', userId)
  if (error) throw error
  const total = (rows ?? []).reduce((s, r) => s + Number((r as { xp_earned?: number }).xp_earned ?? 0), 0)

  const { data: existing } = await supabase.from('user_profiles').select('id').eq('id', userId).maybeSingle()

  const level = levelFromTotalXp(total)
  if (existing) {
    const { error: upErr } = await supabase.from('user_profiles').update({ total_xp: total, level }).eq('id', userId)
    if (upErr) throw upErr
  } else {
    const { error: insErr } = await supabase.from('user_profiles').insert({ id: userId, display_name: displayName, total_xp: total })
    if (insErr) throw insErr
  }
}

async function ensureLeagueMembership(userId: string, weeklyXp: number) {
  const { data: existing } = await supabase.from('league_members').select('id').eq('user_id', userId).maybeSingle()
  if (existing) return

  // Find a Teal league (tier_id=1) with room for more members
  const { data: tealLeagues } = await supabase.from('leagues').select('id').eq('tier_id', 1)

  let leagueId: string | null = null
  for (const league of tealLeagues ?? []) {
    const { count } = await supabase
      .from('league_members')
      .select('*', { count: 'exact', head: true })
      .eq('league_id', league.id)
    if ((count ?? 0) < 25) {
      leagueId = league.id
      break
    }
  }

  if (!leagueId) {
    const { data: newLeague, error: leagueErr } = await supabase.from('leagues').insert({ tier_id: 1 }).select('id').single()
    if (leagueErr) throw leagueErr
    leagueId = newLeague!.id
  }

  await supabase.from('league_members').insert({ league_id: leagueId, user_id: userId, weekly_xp: weeklyXp, rank: 0, movement: 0 })
}

export function useSaveProgress(): UseSaveProgressReturn {
  const { user } = useAuthStore()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const saveProgress = useCallback(async (input: SaveProgressInput) => {
    if (!user) return
    try {
      setSaving(true)
      setError(null)

      const { error: sbError } = await supabase.from('user_progress').upsert(
        {
          user_id: user.id,
          lesson_id: input.lessonId,
          score: input.score,
          xp_earned: input.xpEarned,
          completed: true,
          words_mastered: input.wordsMastered ?? [],
          words_skipped: input.wordsSkipped ?? [],
          completed_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,lesson_id' }
      )

      if (sbError) throw sbError

      const displayName =
        (user.user_metadata?.display_name as string | undefined) ?? user.email?.split('@')[0] ?? 'Learner'

      try {
        await syncProfileTotalXp(user.id, displayName)
      } catch (syncErr) {
        console.warn('[useSaveProgress] syncProfileTotalXp', syncErr)
      }

      try {
        await ensureLeagueMembership(user.id, input.xpEarned)
      } catch (leagueErr) {
        console.warn('[useSaveProgress] ensureLeagueMembership', leagueErr)
      }

      const { error: rpcError } = await supabase.rpc('increment_weekly_xp', {
        target_user_id: user.id,
        xp_amount: input.xpEarned,
      })
      if (rpcError) console.warn('[useSaveProgress] increment_weekly_xp', rpcError.message)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save progress')
    } finally {
      setSaving(false)
    }
  }, [user])

  return { saving, error, saveProgress }
}
