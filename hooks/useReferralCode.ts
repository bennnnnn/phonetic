import { useState, useEffect, useCallback } from 'react'
import { Share, Platform } from 'react-native'
import * as Linking from 'expo-linking'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'

export function useReferralCode() {
  const { user } = useAuthStore()
  const [code, setCode] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return
    supabase
      .from('user_profiles')
      .select('referral_code')
      .eq('id', user.id)
      .single()
      .then(({ data }) => {
        if (data?.referral_code) setCode(data.referral_code as string)
      })
  }, [user?.id])

  const share = useCallback(async (displayName: string) => {
    if (!code) return

    // Creates phonicsflow:///signup?ref=CODE (or exp+phonicsflow:// in Expo Go)
    const inviteLink = Linking.createURL('/signup', { queryParams: { ref: code } })

    const message = Platform.select({
      ios:
        `Hey! I've been using PhonicsFlow to learn English phonics 📚 — it's brilliant.\n\n` +
        `Tap the link to download and sign up — I'll be your study buddy 🙌`,
      default:
        `Hey! I've been using PhonicsFlow to learn English phonics 📚 — it's brilliant.\n\n` +
        `Download the app and sign up with my invite link to be study buddies 🙌\n\n` +
        `👉 ${inviteLink}`,
    })

    await Share.share(
      {
        message: message ?? '',
        url: inviteLink,   // iOS attaches this as a tappable link in the share sheet
        title: 'Join me on PhonicsFlow',
      },
      { dialogTitle: 'Invite a friend to PhonicsFlow' }
    )
  }, [code])

  return { code, share }
}
