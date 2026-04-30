import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { hasProEntitlement, purchasePro, restorePurchases } from '@/lib/revenuecat'

const REFERRALS_PER_FREE_MONTH = 10

type SubscriptionStatus = {
  isPro: boolean
  loading: boolean
  referralCount: number
  freeMonthsEarned: number
  freeMonthsRemaining: number
  referralsToNextMonth: number
  purchasePro: () => Promise<boolean>
  restorePurchases: () => Promise<boolean>
}

export function useSubscription(): SubscriptionStatus {
  const { user } = useAuthStore()
  const [isPro, setIsPro] = useState(false)
  const [loading, setLoading] = useState(true)
  const [referralCount, setReferralCount] = useState(0)
  const [freeMonthsEarned, setFreeMonthsEarned] = useState(0)
  const [freeMonthsConsumed, setFreeMonthsConsumed] = useState(0)

  const checkStatus = useCallback(async () => {
    if (!user) {
      setIsPro(false)
      setLoading(false)
      return
    }

    try {
      setLoading(true)

      // 1. Check RevenueCat entitlement
      let proActive = false
      try {
        proActive = await hasProEntitlement()
      } catch {
        // RevenueCat not configured
      }

      // 2. Check Supabase subscription_tier (set by referral rewards)
      if (!proActive) {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('subscription_tier')
          .eq('id', user.id)
          .single()
        const tier = (profile as { subscription_tier?: string } | null)?.subscription_tier
        proActive = tier === 'pro' || tier === 'lifetime'
      }

      // 3. Check referral rewards
      const { data: rewards } = await supabase
        .from('referral_rewards')
        .select('referral_count, free_months, consumed_months')
        .eq('user_id', user.id)
        .maybeSingle()

      if (rewards) {
        const r = rewards as { referral_count: number; free_months: number; consumed_months: number }
        setReferralCount(r.referral_count)
        setFreeMonthsEarned(r.free_months)
        setFreeMonthsConsumed(r.consumed_months)

        // If they have unconsumed free months, grant pro and consume one
        if (!proActive && r.free_months > r.consumed_months) {
          const newConsumed = r.consumed_months + 1
          await supabase
            .from('user_profiles')
            .update({ subscription_tier: 'pro' })
            .eq('id', user.id)
          await supabase
            .from('referral_rewards')
            .update({ consumed_months: newConsumed })
            .eq('user_id', user.id)
          setFreeMonthsConsumed(newConsumed)
          proActive = true
        }
      } else {
        setReferralCount(0)
        setFreeMonthsEarned(0)
        setFreeMonthsConsumed(0)
      }

      setIsPro(proActive)
    } catch {
      // Silent fail
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  useEffect(() => { void checkStatus() }, [checkStatus])

  const handlePurchase = useCallback(async (): Promise<boolean> => {
    const ok = await purchasePro()
    if (ok) setIsPro(true)
    return ok
  }, [])

  const handleRestore = useCallback(async (): Promise<boolean> => {
    const ok = await restorePurchases()
    if (ok) setIsPro(true)
    return ok
  }, [])

  const referralsToNextMonth = REFERRALS_PER_FREE_MONTH - (referralCount % REFERRALS_PER_FREE_MONTH)
  const freeMonthsRemaining = freeMonthsEarned - freeMonthsConsumed

  return {
    isPro,
    loading,
    referralCount,
    freeMonthsEarned,
    freeMonthsRemaining,
    referralsToNextMonth,
    purchasePro: handlePurchase,
    restorePurchases: handleRestore,
  }
}
