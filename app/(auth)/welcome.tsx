import { useEffect } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native'
import { router } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import Animated, {
  useSharedValue, useAnimatedStyle,
  withSpring, withTiming, withDelay, withSequence,
} from 'react-native-reanimated'
import { colors, spacing, radius, fontSize } from '@/lib/tokens'

const PILLS = [
  { consonant: 'b', pattern: 'ake' },
  { consonant: 'c', pattern: 'ake' },
  { consonant: 'l', pattern: 'ight' },
  { consonant: 'sn', pattern: 'ake' },
  { consonant: 'n', pattern: 'ight' },
  { consonant: 'f', pattern: 'eat' },
]

function Pill({ consonant, pattern, delay }: { consonant: string; pattern: string; delay: number }) {
  const y  = useSharedValue(24)
  const op = useSharedValue(0)
  useEffect(() => {
    y.value  = withDelay(delay, withSpring(0, { damping: 14, stiffness: 120 }))
    op.value = withDelay(delay, withTiming(1, { duration: 220 }))
  }, [])
  const style = useAnimatedStyle(() => ({ transform: [{ translateY: y.value }], opacity: op.value }))
  return (
    <Animated.View style={[styles.pill, style]}>
      <Text style={styles.pillConsonant}>{consonant}</Text>
      <Text style={styles.pillPattern}>{pattern}</Text>
    </Animated.View>
  )
}

export default function WelcomeScreen() {
  const logoY  = useSharedValue(-40)
  const logoOp = useSharedValue(0)
  const sheetY = useSharedValue(60)
  const sheetOp = useSharedValue(0)

  useEffect(() => {
    logoY.value  = withSpring(0, { damping: 14, stiffness: 100 })
    logoOp.value = withTiming(1, { duration: 300 })
    sheetY.value  = withDelay(300, withSpring(0, { damping: 18, stiffness: 120 }))
    sheetOp.value = withDelay(300, withTiming(1, { duration: 300 }))
  }, [])

  const logoStyle  = useAnimatedStyle(() => ({ transform: [{ translateY: logoY.value }], opacity: logoOp.value }))
  const sheetStyle = useAnimatedStyle(() => ({ transform: [{ translateY: sheetY.value }], opacity: sheetOp.value }))

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      {/* ── Teal hero ─────────────────────────────────────────────────── */}
      <View style={styles.hero}>
        <Animated.View style={[styles.heroInner, logoStyle]}>
          <View style={styles.logoCard}>
            <Text style={styles.logoText}>Pf</Text>
          </View>
          <Text style={styles.appName}>PhonicsFlow</Text>
          <Text style={styles.tagline}>crack the english code</Text>
        </Animated.View>

        <View style={styles.pillRow}>
          {PILLS.map((p, i) => (
            <Pill key={p.consonant + p.pattern} consonant={p.consonant} pattern={p.pattern} delay={200 + i * 70} />
          ))}
        </View>
      </View>

      {/* ── Bottom action sheet ───────────────────────────────────────── */}
      <Animated.View style={[styles.sheet, sheetStyle]}>
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => router.push('/(auth)/signup')}
          activeOpacity={0.88}
        >
          <Text style={styles.primaryBtnText}>Continue with email</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.googleBtn} activeOpacity={0.8}>
          <View style={styles.googleIcon}>
            <Text style={styles.googleG}>G</Text>
          </View>
          <Text style={styles.googleLabel}>Continue with Google</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push('/(auth)/login')}
          style={styles.signInRow}
          activeOpacity={0.7}
        >
          <Text style={styles.signInText}>
            Already have an account?{' '}
            <Text style={styles.signInLink}>Sign in</Text>
          </Text>
        </TouchableOpacity>

        <Text style={styles.terms}>
          By continuing you agree to our{' '}
          <Text style={styles.termsLink} onPress={() => router.push('/(auth)/terms')}>Terms</Text>
          {' '}and{' '}
          <Text style={styles.termsLink} onPress={() => router.push('/(auth)/privacy')}>Privacy Policy</Text>
        </Text>
      </Animated.View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.primary },

  hero: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  heroInner: { alignItems: 'center', gap: spacing.sm },
  logoCard: {
    width: 64, height: 64, borderRadius: 18,
    backgroundColor: colors.surface,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 }, elevation: 4,
  },
  logoText: { fontFamily: 'Georgia', fontSize: 26, fontWeight: '500', color: colors.primary },
  appName:  { color: '#fff', fontSize: 22, fontWeight: '600', letterSpacing: -0.3 },
  tagline:  { color: '#9FE1CB', fontSize: fontSize.md },

  pillRow: {
    flexDirection: 'row', flexWrap: 'wrap',
    justifyContent: 'center', gap: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  pill: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: radius.full,
    paddingHorizontal: 14, paddingVertical: 7,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)',
  },
  pillConsonant: { fontSize: fontSize.lg, color: '#B4E8D6', fontFamily: 'Georgia' },
  pillPattern:   { fontSize: fontSize.lg, color: '#fff',    fontFamily: 'Georgia' },

  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
    gap: spacing.md,
    shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 20,
    shadowOffset: { width: 0, height: -4 },
  },
  primaryBtn: {
    backgroundColor: colors.primary,
    borderRadius: 14, paddingVertical: 14,
    alignItems: 'center', marginTop: spacing.sm,
  },
  primaryBtnText: { color: '#fff', fontSize: fontSize.lg, fontWeight: '600' },

  googleBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: colors.surface,
    borderWidth: 1.5, borderColor: colors.border,
    borderRadius: 14, paddingVertical: 13, paddingHorizontal: 15,
  },
  googleIcon: {
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: colors.accentLight,
    alignItems: 'center', justifyContent: 'center',
  },
  googleG:     { fontSize: 12, fontWeight: '500', color: '#D85A30' },
  googleLabel: { fontSize: fontSize.lg, fontWeight: '500', color: colors.text },

  signInRow: { alignItems: 'center', paddingVertical: spacing.xs },
  signInText: { fontSize: fontSize.md, color: colors.textMuted },
  signInLink: { color: colors.primary, fontWeight: '600' },

  terms: { textAlign: 'center', color: colors.textHint, fontSize: 10, lineHeight: 16, marginTop: spacing.xs },
  termsLink: { color: colors.textMuted, textDecorationLine: 'underline' },
})
