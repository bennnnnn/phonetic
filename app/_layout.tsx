import { useEffect } from 'react'
import { Text } from 'react-native'
import { Stack, router, useSegments } from 'expo-router'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { useFonts } from 'expo-font'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { useSettingsStore } from '@/store/settingsStore'
import { soundEngine } from '@/lib/sounds'


export default function RootLayout() {
  const { setSession, session, loading } = useAuthStore()
  const segments = useSegments()
  const { dyslexiaFont, largerText } = useSettingsStore()

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

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setSession(session)
    })

    soundEngine.preload(['correct', 'wrong', 'tap', 'wordRevealed', 'lessonComplete', 'xpEarned'])

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (loading) return
    const inAuth = segments[0] === '(auth)'
    if (!session && !inAuth) router.replace('/(auth)/welcome')
    else if (session && inAuth) {
      const segs = segments as string[]
      if (segs[1] === 'reset-password') return
      router.replace('/(tabs)/home')
    }
  }, [session, loading, segments])

  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </SafeAreaProvider>
  )
}
