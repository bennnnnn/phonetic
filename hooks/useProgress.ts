import { useState, useEffect, useCallback } from 'react'
import { supabase, supabaseErrorMessage } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import type { Session } from '@supabase/supabase-js'
import type { UserProgress } from '@/lib/types'

type UseProgressReturn = {
  progress: UserProgress[]
  completedLessonIds: string[]
  totalXP: number
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

/** One row per lesson_id (latest completed_at wins if duplicates exist). */
function dedupeByLesson(rows: UserProgress[]): UserProgress[] {
  const byLesson = new Map<string, UserProgress>()
  for (const row of rows) {
    const prev = byLesson.get(row.lesson_id)
    if (!prev) {
      byLesson.set(row.lesson_id, row)
      continue
    }
    const prevT = prev.completed_at ? new Date(prev.completed_at).getTime() : 0
    const rowT = row.completed_at ? new Date(row.completed_at).getTime() : 0
    if (rowT >= prevT) byLesson.set(row.lesson_id, row)
  }
  return Array.from(byLesson.values())
}

export function useProgress(): UseProgressReturn {
  const { user } = useAuthStore()
  const [progress, setProgress] = useState<UserProgress[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProgress = useCallback(async (userId?: string | null) => {
    const id = userId ?? user?.id ?? null
    if (!id) {
      setProgress([])
      setLoading(false)
      return
    }
    try {
      setLoading(true)
      setError(null)

      const { data, error: sbError } = await supabase.from('user_progress').select('*').eq('user_id', id)

      if (sbError) throw sbError
      setProgress(dedupeByLesson((data as UserProgress[]) ?? []))
    } catch (err) {
      setError(supabaseErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    void fetchProgress()
  }, [fetchProgress])

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: string, session: Session | null) => {
      if (session?.user?.id) void fetchProgress(session.user.id)
      else {
        setProgress([])
        setLoading(false)
        setError(null)
      }
    })
    return () => subscription.unsubscribe()
  }, [fetchProgress])

  const completedLessonIds = progress.filter((p) => p.completed).map((p) => p.lesson_id)
  const totalXP = progress.reduce((sum, p) => sum + (p.xp_earned || 0), 0)

  return { progress, completedLessonIds, totalXP, loading, error, refetch: fetchProgress }
}
