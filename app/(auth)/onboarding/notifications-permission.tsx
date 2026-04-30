import React from 'react'
import { router } from 'expo-router'
import * as Notifications from 'expo-notifications'
import PermissionScreen from '@/components/onboarding/PermissionScreen'

export default function NotificationsPermissionScreen() {
  const handleEnable = async () => {
    await Notifications.requestPermissionsAsync()
    router.push('/(auth)/onboarding/contacts-permission')
  }

  return (
    <PermissionScreen
      icon="🔔"
      eyebrow="STAY ON TRACK"
      headline="Keep your streak alive"
      body="We'll send you a friendly nudge when it's time for your daily lesson. No spam — just one reminder a day."
      ctaLabel="Enable notifications"
      dotsFilled={5}
      onEnable={handleEnable}
      onSkip={() => router.push('/(auth)/onboarding/contacts-permission')}
    />
  )
}
