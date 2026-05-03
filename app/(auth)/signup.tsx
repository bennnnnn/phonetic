import { useEffect } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { router } from 'expo-router'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import Animated, {
  useSharedValue, useAnimatedStyle,
  withSpring, withTiming, withDelay, withSequence,
} from 'react-native-reanimated'
import { haptics } from '@/lib/haptics'
import { colors, spacing, radius, fontSize } from '@/lib/tokens'

const PERKS = [
  { emoji: '🧠', text: 'Crack the code behind English spelling' },
  { emoji: '🎯', text: 'Personalised lessons, your pace' },
  { emoji: '🔥', text: 'Build a streak, track your progress' },
]

function PerkRow({ emoji, text, delay }: { emoji: string; text: string; delay: number }) {
  const op = useSharedValue(0)
  const x  = useSharedValue(-16)
  useEffect(() => {
    op.value = withDelay(delay, withTiming(1,  { duration: 280 }))
    x.value  = withDelay(delay, withSpring(0,  { damping: 18, stiffness: 180 }))
  }, [])
  const style = useAnimatedStyle(() => ({ opacity: op.value, transform: [{ translateX: x.value }] }))
  return (
    <Animated.View style={[styles.perkRow, style]}>
      <Text style={styles.perkEmoji}>{emoji}</Text>
      <Text style={styles.perkText}>{text}</Text>
    </Animated.View>
  )
}

export default function SignupScreen() {
  const insets = useSafeAreaInsets()

  const logoScale = useSharedValue(0.7)
  const logoOp    = useSharedValue(0)
  const sheetY    = useSharedValue(80)
  const sheetOp   = useSharedValue(0)

  useEffect(() => {
    logoScale.value = withSpring(1,  { damping: 12, stiffness: 160 })
    logoOp.value    = withTiming(1,  { duration: 320 })
    sheetY.value    = withDelay(220, withSpring(0, { damping: 20, stiffness: 140 }))
    sheetOp.value   = withDelay(220, withTiming(1, { duration: 300 }))
  }, [])

  const logoStyle  = useAnimatedStyle(() => ({ transform: [{ scale: logoScale.value }], opacity: logoOp.value }))
  const sheetStyle = useAnimatedStyle(() => ({ transform: [{ translateY: sheetY.value }], opacity: sheetOp.value }))

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      {/* ── Teal hero ──────────────────────────────────── */}
      <View style={styles.hero}>
        <Animated.View style={[styles.logoWrap, logoStyle]}>
          <View style={styles.logoCard}>
            <Text style={styles.logoText}>Pf</Text>
          </View>
          <Text style={styles.appName}>PhonicsFlow</Text>

        </Animated.View>

        {/* Value props */}
        <View style={styles.perks}>
          {PERKS.map((p, i) => (
            <PerkRow key={p.emoji} emoji={p.emoji} text={p.text} delay={340 + i * 90} />
          ))}
        </View>
      </View>

      {/* ── Bottom sheet ──────────────────────────────── */}
      <Animated.View style={[styles.sheet, sheetStyle, { paddingBottom: Math.max(insets.bottom + spacing.md, spacing.xl) }]}>
        <Text style={styles.headline}>Create your account</Text>

        {/* Google — coming soon */}
        <TouchableOpacity style={styles.googleBtn} disabled activeOpacity={1}>
          <View style={styles.googleIcon}><Text style={styles.googleG}>G</Text></View>
          <Text style={styles.googleLabel}>Continue with Google</Text>
        </TouchableOpacity>

        {/* Divider */}
        <View style={styles.divRow}>
          <View style={styles.divLine} />
          <Text style={styles.divLabel}>or</Text>
          <View style={styles.divLine} />
        </View>

        {/* Email — primary CTA */}
        <TouchableOpacity
          style={styles.emailBtn}
          onPress={() => {
            haptics.tap()
            router.push('/(auth)/signup-email')
          }}
          activeOpacity={0.86}
        >
          <Text style={styles.emailIcon}>✉️</Text>
          <Text style={styles.emailBtnText}>Continue with email</Text>
        </TouchableOpacity>

        {/* Sign in */}
        <TouchableOpacity
          onPress={() => router.replace('/(auth)/login')}
          style={styles.signInRow}
          activeOpacity={0.7}
        >
          <Text style={styles.signInText}>
            Already have an account?{'  '}
            <Text style={styles.signInLink}>Sign in</Text>
          </Text>
        </TouchableOpacity>

        <Text style={styles.terms}>
          By continuing you agree to our{' '}
          <Text style={styles.termsLink}>Terms</Text>
          {' '}and{' '}
          <Text style={styles.termsLink}>Privacy Policy</Text>
        </Text>
      </Animated.View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.primary },

  /* ── Hero ── */
  hero: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    gap: spacing.xl,
  },
  logoWrap:  { alignItems: 'center', gap: spacing.xs },
  logoCard:  {
    width: 68, height: 68, borderRadius: 20,
    backgroundColor: colors.surface,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: spacing.xs,
    shadowColor: '#000', shadowOpacity: 0.18, shadowRadius: 14,
    shadowOffset: { width: 0, height: 5 }, elevation: 6,
  },
  logoText:  { fontFamily: 'Georgia', fontSize: 26, fontWeight: '500', color: colors.primary },
  appName:   { color: '#fff', fontSize: 24, fontWeight: '700', letterSpacing: -0.4 },

  perks:     { gap: spacing.md, alignSelf: 'stretch' },
  perkRow:   { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  perkEmoji: { fontSize: 22, width: 32, textAlign: 'center' },
  perkText:  { fontSize: fontSize.md, color: 'rgba(255,255,255,0.88)', fontWeight: '500', flex: 1 },

  /* ── Sheet ── */
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    gap: spacing.md,
    shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 24,
    shadowOffset: { width: 0, height: -6 },
  },
  headline: {
    fontSize: 22, fontWeight: '700', color: colors.text,
    letterSpacing: -0.3, textAlign: 'center',
    marginBottom: spacing.xs,
  },

  /* Google */
  googleBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10, backgroundColor: colors.surface,
    borderWidth: 1.5, borderColor: colors.border,
    borderRadius: 14, paddingVertical: 15,
    opacity: 0.55,
  },
  googleIcon: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: '#FEE9E0',
    alignItems: 'center', justifyContent: 'center',
  },
  googleG:    { fontSize: 13, fontWeight: '700', color: '#D85A30' },
  googleLabel:{ fontSize: fontSize.lg, fontWeight: '500', color: colors.text },
  /* Divider */
  divRow:  { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  divLine: { flex: 1, height: 1, backgroundColor: colors.border },
  divLabel:{ fontSize: fontSize.sm, color: colors.textHint },

  /* Email */
  emailBtn: {
    backgroundColor: colors.primary,
    borderRadius: 16, paddingVertical: 17,
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: spacing.sm,
  },
  emailIcon:    { fontSize: 20 },
  emailBtnText: { color: '#fff', fontSize: fontSize.xl, fontWeight: '700', letterSpacing: 0.2 },

  /* Links */
  signInRow:  { alignItems: 'center', paddingVertical: spacing.xs },
  signInText: { fontSize: fontSize.md, color: colors.textMuted },
  signInLink: { color: colors.primary, fontWeight: '700' },

  terms:     { textAlign: 'center', color: colors.textHint, fontSize: fontSize.xs, lineHeight: 17 },
  termsLink: { textDecorationLine: 'underline' },
})
