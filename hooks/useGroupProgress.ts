import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { writeCache, CACHE_TYPES } from '@/lib/offlineCache'

/** Check if a words_mastered field has actual content (array or JSONB string with items). */
function hasWords(wm: string[] | string | null | undefined): boolean {
  if (!wm) return false
  if (Array.isArray(wm)) return wm.length > 0
  if (typeof wm === 'string') {
    try {
      const parsed = JSON.parse(wm)
      return Array.isArray(parsed) && parsed.length > 0
    } catch {
      return false
    }
  }
  return false
}

export function starsFor(_score?: number): number {
  // Always 3 — the quiz ends only when users answer all correctly,
  // and the celebration screen always shows 100%.
  return 3
}

export function useGroupProgress() {
  const [completedGroups, setCompletedGroups] = useState<string[]>([])
  const [startedGroups, setStartedGroups] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const refetch = useCallback(async () => {
    const { user } = useAuthStore.getState()
    if (!user) { setCompletedGroups([]); setStartedGroups([]); return }

    setLoading(true)

    try {
      const { data, error } = await supabase
        .from('group_progress')
        .select('group_name, completed')
        .eq('user_id', user.id)

      if (error) throw error

      const rows = (data ?? []) as { group_name: string; completed: boolean }[]
      const completed = rows.filter((r) => r.completed).map((r) => r.group_name)
      const started = [...new Set(rows.map((r) => r.group_name))]

      setCompletedGroups(completed)
      setStartedGroups(started)
      void writeCache(CACHE_TYPES.COMPLETED_GROUPS, user.id, completed)
    } catch (err) {
      console.warn('[groupProgress] fetch error:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void refetch() }, [])

  return { completedGroups, startedGroups, loading, refetch }
}
