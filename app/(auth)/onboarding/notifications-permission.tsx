import { router } from 'expo-router'
import * as Notifications from 'expo-notifications'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { tryRegisterPushToken } from '@/hooks/useNotifications'
import PermissionScreen from '@/components/onboarding/PermissionScreen'

async function enableNotifications() {
  const { status } = await Notifications.requestPermissionsAsync()
  if (status !== 'granted') return

  // Get Expo push token and save it to the user's profile
  const token = await tryRegisterPushToken()
  if (token) {
    const { user } = useAuthStore.getState()
    if (user) {
      await supabase
        .from('user_profiles')
        .update({ push_token: token })
        .eq('id', user.id)
    }
  }

  // Schedule a daily reminder at 8 AM (user can change the time in profile settings)
  try {
    await Notifications.cancelAllScheduledNotificationsAsync()
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Time to practice! 📚',
        body: 'Your daily phonics lesson is waiting.',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
        hour: 8,
        minute: 0,
        repeats: true,
      },
    })
  } catch {
    // Expo Go or simulator — silently skip scheduling
  }
}

export default function NotificationsPermissionScreen() {
  const handleEnable = async () => {
    await enableNotifications()
    router.replace('/(auth)/onboarding/complete')
  }

  return (
    <PermissionScreen
      icon="🔔"
      eyebrow="STAY ON TRACK"
      headline="Keep your streak alive"
      body="We'll send you a friendly nudge when it's time for your daily lesson. No spam — just one reminder a day."
      ctaLabel="Enable notifications"
      dotsFilled={6}
      onEnable={handleEnable}
      onSkip={() => router.replace('/(auth)/onboarding/complete')}
    />
  )
}
