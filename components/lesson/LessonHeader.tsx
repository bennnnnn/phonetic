import { useEffect } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import Animated, {
  useSharedValue, useAnimatedStyle,
  withSpring, withTiming, withSequence,
} from 'react-native-reanimated'
import { colors, spacing, radius, fontSize } from '@/lib/tokens'

// ── AnimatedTotal ──────────────────────────────────────────────────────────────

function AnimatedTotal({ count }: { count: number }) {
  const scale = useSharedValue(1)

  useEffect(() => {
    scale.value = withSequence(
      withSpring(1.6, { damping: 3, stiffness: 180 }),
      withSpring(1, { damping: 8, stiffness: 200 }),
    )
  }, [count])

  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }))

  return (
    <Animated.View style={[styles.totalPill, style]}>
      <Text style={styles.totalText}>{count}</Text>
    </Animated.View>
  )
}

// ── RollingCounter ───────────────────────────────────────────────────────────
// Pops with a vertical stretch when count changes

function RollingCounter({ count, icon, color }: { count: number; icon: string; color: string }) {
  const translateY = useSharedValue(0)
  const prevCount = useSharedValue(count)
  const digits = String(count)
  const digitHeight = 16 // approximate height of the number text

  useEffect(() => {
    const diff = count - prevCount.value
    if (diff > 0) {
      // Rolling up: new number slides in from bottom, old slides out to top
      translateY.value = withSequence(
        withTiming(-digitHeight, { duration: 80 }),
        withTiming(0, { duration: 120 }),
      )
    } else if (diff < 0) {
      // Rolling down (shouldn't happen often)
      translateY.value = withSequence(
        withTiming(digitHeight, { duration: 80 }),
        withTiming(0, { duration: 120 }),
      )
    }
    prevCount.value = count
  }, [count])

  const textStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }))

  return (
    <View style={styles.counterPill}>
      <Text style={styles.counterIcon}>{icon}</Text>
      <View style={styles.rollWrap}>
        <Animated.Text style={[styles.counterNum, { color }, textStyle]}>
          {count}
        </Animated.Text>
      </View>
    </View>
  )
}

// ── LessonHeader ───────────────────────────────────────────────────────────────

type Props = {
  title: string
  total: number
  mastered: number
  skipped: number
  onBack: () => void
}

export default function LessonHeader({ title, total, mastered, skipped, onBack }: Props) {
  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={onBack} style={styles.backBtn} accessibilityLabel="Go back">
        <Ionicons name="chevron-back" size={24} color={colors.text} />
      </TouchableOpacity>
      <View style={styles.metaRow}>
        <AnimatedTotal count={total} />
        <View style={styles.counterRow}>
          <RollingCounter count={mastered} icon="✓" color={colors.primary} />
          <RollingCounter count={skipped} icon="–" color={colors.textHint} />
        </View>
      </View>
    </View>
  )
}

// ── BounceCounter (used by LessonCompleteBanner) ───────────────────────────────

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

// ── RollingDigit ────────────────────────────────────────────────────────────────

function RollingDigit({ value, color }: { value: number; color: string }) {
  const translateY = useSharedValue(20)
  const op = useSharedValue(0)

  useEffect(() => {
    translateY.value = withTiming(0, { duration: 300 })
    op.value = withTiming(1, { duration: 200 })
  }, [])

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: op.value,
  }))

  return (
    <View style={styles.rollDigitWrap}>
      <Animated.Text style={[styles.rollDigit, { color }, style]}>
        {value}
      </Animated.Text>
    </View>
  )
}

// ── AnimatedStatCard ───────────────────────────────────────────────────────────

function AnimatedStatCard({ label, count, color, bgColor, icon }: {
  label: string; count: number; color: string; bgColor: string; icon: string
}) {
  const displayCount = count

  return (
    <Animated.View style={[styles.statCard, { backgroundColor: bgColor }]}>
      <Text style={styles.statIcon}>{icon}</Text>
      <RollingDigit value={displayCount} color={color} />
      <Text style={[styles.statLabel, { color }]}>{label}</Text>
    </Animated.View>
  )
}

// ── LessonCompleteBanner ───────────────────────────────────────────────────────

export function LessonCompleteBanner({
  mastered, skipped, onContinue, label = 'Next: Sentences →',
}: {
  mastered: number; skipped: number; onContinue: () => void; label?: string
}) {
  const scale = useSharedValue(0.8)
  const op    = useSharedValue(0)

  useEffect(() => {
    scale.value = withSpring(1, { damping: 12, stiffness: 140 })
    op.value    = withTiming(1, { duration: 220 })
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

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    gap: spacing.sm,
    borderBottomWidth: 1, borderBottomColor: colors.border,
    overflow: 'hidden',
  },
  backBtn: { padding: spacing.xs, marginRight: spacing.xs },
  titleBlock: { flex: 1, minWidth: 0 },
  titleText: { fontSize: fontSize.xl, fontWeight: '700', color: colors.text, fontFamily: 'Georgia' },
  metaRow: { flexDirection: 'row', alignItems: 'center', flex: 1, justifyContent: 'space-between' },
  totalPill: {
    backgroundColor: colors.primaryLight,
    borderRadius: radius.full,
    paddingVertical: 6, paddingHorizontal: 16,
    minWidth: 44, alignItems: 'center',
  },
  totalText: { fontSize: fontSize.lg, fontWeight: '800', color: colors.primary },
  counterRow: {
    flexDirection: 'row', gap: spacing.md,
  },

  remainingWrap: {
    flexDirection: 'row', alignItems: 'baseline',
    backgroundColor: colors.neutral,
    borderRadius: radius.full,
    paddingVertical: spacing.xs, paddingHorizontal: spacing.md,
  },
  remainingNum: {
    fontSize: fontSize.lg,
    fontWeight: '800',
    color: colors.primary,
  },
  remainingTotal: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.textMuted,
  },

  counterPill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: colors.neutral, borderRadius: radius.full,
    paddingVertical: spacing.xs, paddingHorizontal: spacing.sm,
  },
  counterIcon: { fontSize: 12, fontWeight: '800' },
  counterNum:  { fontSize: 13, fontWeight: '800' },
  rollWrap: {
    height: 16,
    overflow: 'hidden',
  },

  completeCard: {
    backgroundColor: colors.surface, borderRadius: radius.xxl,
    padding: spacing.xl, alignItems: 'center', gap: spacing.lg,
  },
  completeTitle: { fontSize: fontSize.xxl, fontWeight: '700', color: colors.text, textAlign: 'center' },
  completeSub:   { fontSize: fontSize.md, color: colors.textMuted },
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
