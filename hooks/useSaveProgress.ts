import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { levelFromTotalXp } from '@/lib/xpLevel'
import { updateStreak } from '@/lib/streak'
import { nextReviewDate } from '@/lib/spacedRep'

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

export function useSaveProgress(): UseSaveProgressReturn {
  const { user } = useAuthStore()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const saveProgress = useCallback(async (input: SaveProgressInput) => {
    if (!user) return
    try {
      setSaving(true)
      setError(null)

      // Determine repetition count for this lesson
      let repetitions = 0
      try {
        const { data: existingRows } = await supabase
          .from('user_progress')
          .select('repetitions')
          .eq('user_id', user.id)
          .eq('lesson_id', input.lessonId)
          .maybeSingle()
        repetitions = ((existingRows as { repetitions?: number } | null)?.repetitions ?? 0) + 1
      } catch { /* default to 1 */ }

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
          next_review_at: nextReviewDate(repetitions).toISOString(),
          repetitions,
        },
        { onConflict: 'user_id,lesson_id' }
      )

      if (sbError) throw sbError

      // Update streak based on last completion date
      try {
        await updateStreak(user.id)
      } catch (streakErr) {
        console.warn('[useSaveProgress] updateStreak', streakErr)
      }

      const displayName =
        (user.user_metadata?.display_name as string | undefined) ?? user.email?.split('@')[0] ?? 'Learner'

      try {
        await syncProfileTotalXp(user.id, displayName)
      } catch (syncErr) {
        console.warn('[useSaveProgress] syncProfileTotalXp', syncErr)
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save progress')
    } finally {
      setSaving(false)
    }
  }, [user])

  return { saving, error, saveProgress }
}
