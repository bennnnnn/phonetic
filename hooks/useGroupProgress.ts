import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'

export function useGroupProgress() {
  const { user } = useAuthStore()
  const [completedGroups, setCompletedGroups] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const refetch = useCallback(async () => {
    if (!user) { setCompletedGroups([]); return }
    setLoading(true)
    const { data } = await supabase
      .from('group_progress')
      .select('group_name')
      .eq('user_id', user.id)
      .eq('completed', true)
    setCompletedGroups((data ?? []).map((r: { group_name: string }) => r.group_name))
    setLoading(false)
  }, [user?.id])

  useEffect(() => { void refetch() }, [refetch])

  return { completedGroups, loading, refetch }
}
