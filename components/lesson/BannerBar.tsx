import { useEffect, useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import Animated, {
  useSharedValue, useAnimatedStyle,
  withSpring, withTiming, withSequence,
} from 'react-native-reanimated'
import { colors, spacing, radius, fontSize } from '@/lib/tokens'
import { soundEngine } from '@/lib/sounds'

// ── RollingDigit ────────────────────────────────────────────────────────────────

function RollingDigit({ value, color }: { value: number; color: string }) {
  const [display, setDisplay] = useState(0)
  const translateY = useSharedValue(20)
  const op = useSharedValue(0)

  useEffect(() => {
    translateY.value = withTiming(0, { duration: 300 })
    op.value = withTiming(1, { duration: 200 })

    // Count up to the final value like a gas pump
    if (value === 0) {
      setDisplay(0)
      return
    }
    const duration = 800 // total counting time
    const stepTime = Math.max(40, Math.floor(duration / value))
    let current = 0
    const timer = setInterval(() => {
      current++
      setDisplay(current)
      if (current >= value) clearInterval(timer)
    }, stepTime)
    return () => clearInterval(timer)
  }, [value])

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: op.value,
  }))

  return (
    <View style={styles.rollDigitWrap}>
      <Animated.Text style={[styles.rollDigit, { color }, style]}>
        {display}
      </Animated.Text>
    </View>
  )
}

// ── AnimatedStatCard ───────────────────────────────────────────────────────────

function AnimatedStatCard({ label, count, color, bgColor, icon }: {
  label: string; count: number; color: string; bgColor: string; icon: string
}) {
  return (
    <View style={[styles.statCard, { backgroundColor: bgColor }]}>
      <Text style={styles.statIcon}>{icon}</Text>
      <RollingDigit value={count} color={color} />
      <Text style={[styles.statLabel, { color }]}>{label}</Text>
    </View>
  )
}

// ── BounceCounter ──────────────────────────────────────────────────────────────

export function BounceCounter({ count, icon, color }: { count: number; icon: string; color: string }) {
  const scale = useSharedValue(1)

  useEffect(() => {
    scale.value = withSequence(
      withSpring(1.5, { damping: 4, stiffness: 200 }),
      withSpring(1, { damping: 10, stiffness: 200 }),
    )
  }, [count])

  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }))

  return (
    <Animated.View style={[styles.counterPill, style]}>
      <Text style={styles.counterIcon}>{icon}</Text>
      <Text style={[styles.counterNum, { color }]}>{count}</Text>
    </Animated.View>
  )
}

// ── LessonCompleteBanner ───────────────────────────────────────────────────────

export function LessonCompleteBanner({
  mastered, skipped, onContinue, label = 'start quiz →',
}: {
  mastered: number; skipped: number; onContinue: () => void; label?: string
}) {
  const scale = useSharedValue(0.8)
  const op    = useSharedValue(0)

  useEffect(() => {
    scale.value = withSpring(1, { damping: 12, stiffness: 140 })
    op.value    = withTiming(1, { duration: 220 })
    soundEngine.play('lessonComplete')
  }, [])

  const style = useAnimatedStyle(() => ({
    opacity: op.value,
    transform: [{ scale: scale.value }],
  }))

  return (
    <Animated.View style={[styles.completeCard, style]}>
      <Text style={styles.completeTitle}>Word learning done! 🎉</Text>
      <View style={styles.statRow}>
        <AnimatedStatCard
          label="mastered"
          count={mastered}
          color={colors.primary}
          bgColor={colors.primaryLight}
          icon="✓"
        />
        <AnimatedStatCard
          label="skipped"
          count={skipped}
          color={colors.amber}
          bgColor={colors.amberLight}
          icon="–"
        />
      </View>
      <TouchableOpacity
        style={styles.continueBtn}
        onPress={onContinue}
        accessibilityRole="button"
      >
        <Text style={styles.continueBtnText}>{label}</Text>
      </TouchableOpacity>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  counterPill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: colors.neutral, borderRadius: radius.full,
    paddingVertical: spacing.xs, paddingHorizontal: spacing.sm,
  },
  counterIcon: { fontSize: 12, fontWeight: '800' },
  counterNum:  { fontSize: 13, fontWeight: '800' },

  completeCard: {
    backgroundColor: colors.surface, borderRadius: radius.xxl,
    padding: spacing.xl, alignItems: 'center', gap: spacing.lg,
  },
  completeTitle: { fontSize: fontSize.xxl, fontWeight: '700', color: colors.text, textAlign: 'center' },
  statRow: {
    flexDirection: 'row',
    gap: spacing.md,
    width: '100%',
  },
  statCard: {
    flex: 1,
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.xs,
  },
  statIcon: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
    opacity: 0.3,
  },
  statLabel: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  rollDigitWrap: {
    height: 36,
    overflow: 'hidden',
  },
  rollDigit: {
    fontSize: 34,
    fontWeight: '800',
    fontFamily: 'Georgia',
  },
  continueBtn: {
    backgroundColor: colors.primary, borderRadius: radius.md,
    paddingVertical: spacing.md, paddingHorizontal: spacing.xl,
    alignItems: 'center', width: '100%',
  },
  continueBtnText: { color: '#fff', fontSize: fontSize.lg, fontWeight: '700' },
})
