import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import type { LeagueTier } from '@/lib/types'

type UseLeagueTierReturn = {
  tierName: LeagueTier | null
  daysUntilReset: number
  loading: boolean
}

function getDaysUntilSunday(): number {
  const now = new Date()
  const dayOfWeek = now.getDay() // 0 = Sunday
  return dayOfWeek === 0 ? 7 : 7 - dayOfWeek
}

export function useLeagueTier(): UseLeagueTierReturn {
  const { user } = useAuthStore()
  const [tierName, setTierName] = useState<LeagueTier | null>(null)
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    if (!user) { setLoading(false); return }
    try {
      const { data } = await supabase
        .from('league_members')
        .select('leagues!inner(league_tiers!inner(name))')
        .eq('user_id', user.id)
        .single()

      if (data) {
        const name = (data as any).leagues?.league_tiers?.name
        if (name) setTierName(name as LeagueTier)
      }
    } catch {}
    finally { setLoading(false) }
  }, [user])

  useEffect(() => { fetch() }, [fetch])

  return { tierName, daysUntilReset: getDaysUntilSunday(), loading }
}
