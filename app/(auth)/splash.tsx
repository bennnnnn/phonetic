import { useEffect } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { router } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { colors, spacing, radius, fontSize } from '@/lib/tokens'

const SPLASH_MS = 2200

export default function SplashScreen() {
  useEffect(() => {
    const t = setTimeout(() => {
      router.replace('/(auth)/welcome')
    }, SPLASH_MS)
    return () => clearTimeout(t)
  }, [])

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.center}>
        <View style={styles.logoCard}>
          <Text style={styles.logoText}>Pf</Text>
        </View>
        <View style={styles.titles}>
          <Text style={styles.appName}>PhonicsFlow</Text>
          <Text style={styles.tagline}>crack the english code</Text>
        </View>
        <View style={styles.dots}>
          <View style={styles.dotLong} />
          <View style={styles.dotSmall} />
          <View style={styles.dotSmall} />
        </View>
      </View>
      <View style={styles.homeIndicator} />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.primary },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
  },
  logoCard: {
    width: 80,
    height: 80,
    borderRadius: radius.xxl,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontFamily: 'Georgia',
    fontSize: 32,
    fontWeight: '500',
    color: colors.primary,
  },
  titles: { alignItems: 'center' },
  appName: {
    fontSize: 26,
    fontWeight: '500',
    color: '#fff',
    letterSpacing: -0.5,
  },
  tagline: {
    marginTop: 4,
    fontSize: fontSize.md,
    color: '#9FE1CB',
  },
  dots: { flexDirection: 'row', gap: 6, marginTop: spacing.xl },
  dotLong:  { width: 18, height: 4, borderRadius: 2, backgroundColor: '#fff' },
  dotSmall: { width: 6,  height: 4, borderRadius: 4, backgroundColor: '#9FE1CB' },
  homeIndicator: {
    alignSelf: 'center',
    width: 90,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginBottom: spacing.md,
  },
})
