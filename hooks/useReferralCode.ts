import { useCallback, useEffect, useState } from 'react'
import { Share } from 'react-native'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import * as Linking from 'expo-linking'

export function useReferralCode() {
  const [code, setCode] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Fetch the code internally so we can build the invite link,
  // but never expose it to the user UI.
  const fetch = useCallback(async () => {
    const { user } = useAuthStore.getState()
    if (!user) { setLoading(false); return }
    try {
      const { data } = await supabase
        .from('user_profiles')
        .select('referral_code')
        .eq('id', user.id)
        .maybeSingle()

      setCode((data as { referral_code?: string } | null)?.referral_code ?? null)
    } catch {
      setCode(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void fetch() }, [fetch])

  const share = useCallback(async (displayName: string) => {
    if (!code) return
    const inviteLink = Linking.createURL('/signup', { queryParams: { ref: code } })
    try {
      await Share.share({
        message: `${displayName} has been learning English phonics with PhonicsFlow 📚\n\nDownload it using their invite link to learn together! 🙌\n\n👉 ${inviteLink}`,
        url: inviteLink,
        title: 'Join me on PhonicsFlow',
      })
    } catch {
      // user dismissed the share sheet — noop
    }
  }, [code])

  return { code, share, loading, refetch: fetch }
}
