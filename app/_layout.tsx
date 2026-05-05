import { useEffect } from 'react'
import { Text, AppState } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { Stack, router, useSegments } from 'expo-router'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { useFonts } from 'expo-font'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { useSettingsStore } from '@/store/settingsStore'
import { initRevenueCat } from '@/lib/revenuecat'
import { soundEngine } from '@/lib/sounds'
import { setHapticsEnabled } from '@/lib/haptics'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'


export default function RootLayout() {
  const { setSession, session, loading } = useAuthStore()
  const segments = useSegments()
  const { dyslexiaFont, largerText, soundEnabled, hapticsEnabled } = useSettingsStore()

  const [fontsLoaded] = useFonts({
    'OpenDyslexic-Regular': require('../assets/fonts/OpenDyslexic-Regular.otf'),
  })

  // Apply dyslexia font and larger text globally via Text.defaultProps
  useEffect(() => {
    if (!fontsLoaded) return
    const style: Record<string, unknown> = {}
    if (dyslexiaFont) style.fontFamily = 'OpenDyslexic-Regular'
    if (largerText) style.fontSize = 16
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const T = Text as any
    T.defaultProps = T.defaultProps ?? {}
    T.defaultProps.style = Object.keys(style).length > 0 ? style : undefined
  }, [dyslexiaFont, largerText, fontsLoaded])

  // Sync sound and haptic settings to the global engine singletons
  useEffect(() => {
    soundEngine.setMuted(!soundEnabled)
  }, [soundEnabled])

  useEffect(() => {
    setHapticsEnabled(hapticsEnabled)
  }, [hapticsEnabled])

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setSession(session)
    })

    soundEngine.preload(['correct', 'wrong', 'tap', 'wordRevealed', 'lessonComplete', 'xpEarned'])

    initRevenueCat()

    // Register for push notifications on physical devices
    ;(async () => {
      try {
        const { registerPushToken } = await import('@/lib/notifications')
        await registerPushToken()
      } catch {}
    })()

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (loading) return
    if ((segments as string[]).length === 0) return   // navigator not mounted yet
    const inAuth = segments[0] === '(auth)'
    if (!session && !inAuth) router.replace('/(auth)/welcome')
    else if (session && inAuth) {
      const segs = segments as string[]
      // Let these auth sub-flows complete without interruption
      if (segs[1] === 'reset-password') return
      if (segs[1] === 'onboarding') return
      if (segs[1] === 'signup-email') return
      if (segs[1] === 'confirm-email') return
      router.replace('/(tabs)/home')
    } else if (session && !inAuth) {
      // Authenticated user is in main app — check if onboarding was completed
      if (!useSettingsStore.getState().onboardingComplete) {
        router.replace('/(auth)/onboarding/goal')
      }
    }
  }, [session, loading, segments])

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ErrorBoundary>
          <Stack screenOptions={{ headerShown: false }} />
        </ErrorBoundary>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}
