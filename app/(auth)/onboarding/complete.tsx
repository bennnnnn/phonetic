/**
 * Final onboarding screen — shown after permissions are granted.
 * Full teal celebration screen before the user enters the app.
 */
import { useEffect, useRef } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Animated as RNAnimated } from 'react-native'
import { router } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import Animated, {
  useSharedValue, useAnimatedStyle,
  withSpring, withTiming, withDelay, withSequence, withRepeat,
} from 'react-native-reanimated'
import { useAuthStore } from '@/store/authStore'
import { useSettingsStore } from '@/store/settingsStore'
import { haptics } from '@/lib/haptics'
import { colors, spacing, radius, fontSize } from '@/lib/tokens'

const CONFETTI = ['🎉', '⭐', '🌟', '✨', '🎊', '💫']

// ─── Floating confetti piece ──────────────────────────────────────────────────

function ConfettiPiece({ emoji, delay, startX, startY }: {
  emoji: string; delay: number; startX: number; startY: number
}) {
  const y  = useSharedValue(startY)
  const op = useSharedValue(0)
  const sc = useSharedValue(0.4)

  useEffect(() => {
    op.value = withDelay(delay, withTiming(1,  { duration: 300 }))
    sc.value = withDelay(delay, withSpring(1,  { damping: 10, stiffness: 200 }))
    y.value  = withDelay(delay, withTiming(startY - 60, { duration: 1400 }))
    setTimeout(() => {
      op.value = withTiming(0, { duration: 600 })
    }, delay + 1200)
  }, [])

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: y.value }, { scale: sc.value }],
    opacity: op.value,
    position: 'absolute',
    left: startX,
    top: startY,
  }))

  return <Animated.Text style={[cf.emoji, style]}>{emoji}</Animated.Text>
}
const cf = StyleSheet.create({
  emoji: { fontSize: 28 },
})

// ─── Summary pill ─────────────────────────────────────────────────────────────

function SummaryPill({ emoji, label, delay }: { emoji: string; label: string; delay: number }) {
  const op = useSharedValue(0)
  const y  = useSharedValue(12)
  useEffect(() => {
    op.value = withDelay(delay, withTiming(1, { duration: 300 }))
    y.value  = withDelay(delay, withSpring(0, { damping: 16, stiffness: 180 }))
  }, [])
  const style = useAnimatedStyle(() => ({ opacity: op.value, transform: [{ translateY: y.value }] }))
  return (
    <Animated.View style={[sp.pill, style]}>
      <Text style={sp.pillEmoji}>{emoji}</Text>
      <Text style={sp.pillLabel}>{label}</Text>
    </Animated.View>
  )
}
const sp = StyleSheet.create({
  pill:      { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: radius.full, paddingHorizontal: 16, paddingVertical: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)' },
  pillEmoji: { fontSize: 18 },
  pillLabel: { fontSize: fontSize.md, color: '#fff', fontWeight: '600' },
})

// ─── Screen ───────────────────────────────────────────────────────────────────

const CONFETTI_PIECES = [
  { emoji: '🎉', delay: 100,  startX: 30,  startY: 180 },
  { emoji: '⭐', delay: 180,  startX: 280, startY: 140 },
  { emoji: '✨', delay: 60,   startX: 150, startY: 200 },
  { emoji: '🌟', delay: 240,  startX: 60,  startY: 300 },
  { emoji: '🎊', delay: 140,  startX: 300, startY: 260 },
  { emoji: '💫', delay: 300,  startX: 200, startY: 150 },
  { emoji: '⭐', delay: 80,   startX: 100, startY: 350 },
  { emoji: '✨', delay: 220,  startX: 250, startY: 320 },
]

export default function OnboardingComplete() {
  const user             = useAuthStore((s) => s.user)
  const dailyGoalMinutes = useSettingsStore((s) => s.dailyGoalMinutes)
  const nativeLanguage   = useSettingsStore((s) => s.nativeLanguage)
  const accent           = useSettingsStore((s) => s.accent)

  const firstName = (user?.user_metadata?.display_name as string | undefined)
    ?.trim().split(' ')[0] ?? 'there'

  // Main content animations
  const titleScale = useSharedValue(0.6)
  const titleOp    = useSharedValue(0)
  const subtitleOp = useSharedValue(0)
  const pillsOp    = useSharedValue(0)
  const btnY       = useSharedValue(40)
  const btnOp      = useSharedValue(0)

  // Trophy bounce
  const trophyScale = useSharedValue(0.3)
  const trophyRot   = useSharedValue(-15)

  useEffect(() => {
    haptics.celebrate()

    trophyScale.value = withDelay(0,   withSpring(1,    { damping: 8,  stiffness: 200 }))
    trophyRot.value   = withDelay(0,   withSequence(
      withSpring(10,  { damping: 5, stiffness: 300 }),
      withSpring(-5,  { damping: 8, stiffness: 200 }),
      withSpring(0,   { damping: 12, stiffness: 160 }),
    ))
    titleScale.value  = withDelay(200, withSpring(1,    { damping: 10, stiffness: 180 }))
    titleOp.value     = withDelay(200, withTiming(1,    { duration: 280 }))
    subtitleOp.value  = withDelay(500, withTiming(1,    { duration: 300 }))
    pillsOp.value     = withDelay(700, withTiming(1,    { duration: 300 }))
    btnY.value        = withDelay(900, withSpring(0,    { damping: 16, stiffness: 160 }))
    btnOp.value       = withDelay(900, withTiming(1,    { duration: 300 }))
  }, [])

  const trophyStyle   = useAnimatedStyle(() => ({
    transform: [{ scale: trophyScale.value }, { rotate: `${trophyRot.value}deg` }],
  }))
  const titleStyle    = useAnimatedStyle(() => ({ transform: [{ scale: titleScale.value }], opacity: titleOp.value }))
  const subtitleStyle = useAnimatedStyle(() => ({ opacity: subtitleOp.value }))
  const btnStyle      = useAnimatedStyle(() => ({ transform: [{ translateY: btnY.value }], opacity: btnOp.value }))

  // Accent label
  const accentLabel = accent === 'british' ? '🇬🇧 British' : '🇺🇸 American'
  const goalLabel   = `${dailyGoalMinutes} min / day`

  function handleStart() {
    haptics.celebrate()
    useSettingsStore.getState().setOnboardingComplete()
    router.replace('/(tabs)/home')
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom', 'left', 'right']}>
      {/* Confetti burst */}
      <View style={styles.confettiLayer} pointerEvents="none">
        {CONFETTI_PIECES.map((p, i) => (
          <ConfettiPiece key={i} {...p} />
        ))}
      </View>

      <View style={styles.body}>
        {/* Trophy */}
        <Animated.Text style={[styles.trophy, trophyStyle]}>🏆</Animated.Text>

        {/* Title */}
        <Animated.View style={titleStyle}>
          <Text style={styles.title}>You're all set,</Text>
          <Text style={styles.titleName}>{firstName}!</Text>
        </Animated.View>

        {/* Subtitle */}
        <Animated.Text style={[styles.subtitle, subtitleStyle]}>
          Your personalised English journey starts now.
        </Animated.Text>

        {/* Summary pills */}
        <Animated.View style={[styles.pills, { opacity: pillsOp }]}>
          <SummaryPill emoji="⏱️" label={goalLabel}   delay={800} />
          <SummaryPill emoji="🎙️" label={accentLabel} delay={880} />
          {nativeLanguage ? <SummaryPill emoji="🌐" label={nativeLanguage.charAt(0).toUpperCase() + nativeLanguage.slice(1)} delay={960} /> : null}
        </Animated.View>
      </View>

      {/* CTA */}
      <Animated.View style={[styles.footer, btnStyle]}>
        <TouchableOpacity style={styles.btn} onPress={handleStart} activeOpacity={0.88}>
          <Text style={styles.btnText}>Start learning  🚀</Text>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.primary },

  confettiLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
    pointerEvents: 'none',
  },

  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    gap: spacing.xl,
  },

  trophy: { fontSize: 96 },

  title:     { fontSize: 36, fontWeight: '700', color: '#fff', textAlign: 'center', letterSpacing: -0.5 },
  titleName: { fontSize: 44, fontWeight: '800', color: '#fff', textAlign: 'center', letterSpacing: -1, lineHeight: 52 },

  subtitle: {
    fontSize: fontSize.lg,
    color: 'rgba(255,255,255,0.75)',
    textAlign: 'center',
    lineHeight: 26,
    marginTop: -spacing.sm,
  },

  pills: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: spacing.sm },

  footer: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl },
  btn: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
  },
  btnText: {
    color: colors.primary,
    fontSize: fontSize.xl,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
})
