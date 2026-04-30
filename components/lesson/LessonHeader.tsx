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

// ── AnimatedRemaining ──────────────────────────────────────────────────────────

function AnimatedRemaining({ remaining, total }: { remaining: number; total: number }) {
  const scale = useSharedValue(1)

  useEffect(() => {
    scale.value = withSequence(
      withSpring(1.3, { damping: 4, stiffness: 200 }),
      withSpring(1, { damping: 10, stiffness: 200 }),
    )
  }, [remaining])

  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }))

  return (
    <View style={styles.remainingWrap}>
      <Animated.Text style={[styles.remainingNum, style]}>{remaining}</Animated.Text>
      <Text style={styles.remainingTotal}> / {total}</Text>
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
      <View style={styles.titleBlock}>
        <Text style={styles.titleText} numberOfLines={1}>{title}</Text>
      </View>
      <View style={styles.metaRow}>
        <AnimatedTotal count={total} />
        <View style={styles.counterRow}>
          <BounceCounter count={mastered} icon="✓" color={colors.primary} />
          <BounceCounter count={skipped} icon="–" color={colors.textHint} />
        </View>
      </View>
    </View>
  )
}

// ── BounceCounter (kept for the complete banner) ───────────────────────────────

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
      <Text style={styles.completeSub}>{mastered} mastered · {skipped} skipped</Text>
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
  },
  backBtn: { padding: spacing.xs, marginRight: spacing.xs },
  titleBlock: { flex: 1, minWidth: 0 },
  titleText: { fontSize: fontSize.xl, fontWeight: '700', color: colors.text, fontFamily: 'Georgia' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  totalPill: {
    backgroundColor: colors.primaryLight,
    borderRadius: radius.full,
    paddingVertical: 6, paddingHorizontal: 14,
  },
  totalText: { fontSize: fontSize.lg, fontWeight: '800', color: colors.primary },
  counterRow: { flexDirection: 'row', gap: spacing.sm },

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

  completeCard: {
    backgroundColor: colors.surface, borderRadius: radius.xxl,
    padding: spacing.xl, alignItems: 'center', gap: spacing.lg,
  },
  completeTitle: { fontSize: fontSize.xxl, fontWeight: '700', color: colors.text, textAlign: 'center' },
  completeSub:   { fontSize: fontSize.md, color: colors.textMuted },
  continueBtn: {
    backgroundColor: colors.primary, borderRadius: radius.md,
    paddingVertical: spacing.md, paddingHorizontal: spacing.xl,
    alignItems: 'center', width: '100%',
  },
  continueBtnText: { color: '#fff', fontSize: fontSize.lg, fontWeight: '700' },
})
