import { useEffect } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { router } from 'expo-router'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import Animated, {
  useSharedValue, useAnimatedStyle,
  withSpring, withTiming, withDelay,
} from 'react-native-reanimated'
import { colors, spacing, radius, fontSize } from '@/lib/tokens'

const PILLS = [
  { consonant: 'b',  pattern: 'ake'  },
  { consonant: 'c',  pattern: 'ake'  },
  { consonant: 'l',  pattern: 'ight' },
  { consonant: 'sn', pattern: 'ake'  },
  { consonant: 'n',  pattern: 'ight' },
  { consonant: 'f',  pattern: 'eat'  },
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
      <Text style={styles.pillC}>{consonant}</Text>
      <Text style={styles.pillP}>{pattern}</Text>
    </Animated.View>
  )
}

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets()

  const logoY   = useSharedValue(-40)
  const logoOp  = useSharedValue(0)
  const sheetY  = useSharedValue(60)
  const sheetOp = useSharedValue(0)

  useEffect(() => {
    logoY.value  = withSpring(0, { damping: 14, stiffness: 100 })
    logoOp.value = withTiming(1, { duration: 300 })
    sheetY.value  = withDelay(320, withSpring(0, { damping: 18, stiffness: 110 }))
    sheetOp.value = withDelay(320, withTiming(1, { duration: 300 }))
  }, [])

  const logoStyle  = useAnimatedStyle(() => ({ transform: [{ translateY: logoY.value }], opacity: logoOp.value }))
  const sheetStyle = useAnimatedStyle(() => ({ transform: [{ translateY: sheetY.value }], opacity: sheetOp.value }))

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      {/* ── Teal hero ─────────────────────────────────── */}
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
            <Pill key={p.consonant + p.pattern} consonant={p.consonant} pattern={p.pattern} delay={220 + i * 65} />
          ))}
        </View>
      </View>

      {/* ── Bottom sheet ──────────────────────────────── */}
      <Animated.View style={[styles.sheet, sheetStyle, { paddingBottom: Math.max(insets.bottom + spacing.md, spacing.xl) }]}>
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => router.push('/(auth)/signup')}
          activeOpacity={0.88}
        >
          <Text style={styles.primaryBtnText}>Create an account</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={() => router.push('/(auth)/login')}
          activeOpacity={0.8}
        >
          <Text style={styles.secondaryBtnText}>I already have an account</Text>
        </TouchableOpacity>

        <Text style={styles.terms}>
          By continuing you agree to our Terms and Privacy Policy
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
    width: 72, height: 72, borderRadius: 20,
    backgroundColor: colors.surface,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.18, shadowRadius: 14,
    shadowOffset: { width: 0, height: 5 }, elevation: 6,
  },
  logoText: { fontFamily: 'Georgia', fontSize: 28, fontWeight: '500', color: colors.primary },
  appName:  { color: '#fff', fontSize: 26, fontWeight: '700', letterSpacing: -0.5 },
  tagline:  { color: '#9FE1CB', fontSize: fontSize.lg },

  pillRow: {
    flexDirection: 'row', flexWrap: 'wrap',
    justifyContent: 'center', gap: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  pill: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: radius.full,
    paddingHorizontal: 14, paddingVertical: 8,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)',
  },
  pillC: { fontSize: fontSize.lg, color: '#B4E8D6', fontFamily: 'Georgia' },
  pillP: { fontSize: fontSize.lg, color: '#fff',    fontFamily: 'Georgia', fontWeight: '600' },

  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    gap: spacing.md,
    shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 20,
    shadowOffset: { width: 0, height: -4 },
  },

  primaryBtn: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: fontSize.xl,
    fontWeight: '700',
    letterSpacing: 0.2,
  },

  secondaryBtn: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    paddingVertical: 17,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
  },
  secondaryBtnText: {
    color: colors.text,
    fontSize: fontSize.xl,
    fontWeight: '600',
  },

  terms: {
    textAlign: 'center',
    color: colors.textHint,
    fontSize: fontSize.xs,
    lineHeight: 16,
    paddingBottom: spacing.xs,
  },
})
