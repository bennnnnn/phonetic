import { useEffect } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import Animated, {
  useSharedValue, useAnimatedStyle,
  withSpring, withTiming, withSequence,
} from 'react-native-reanimated'
import { colors, spacing, radius, fontSize } from '@/lib/tokens'

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

// ── CompleteBanner ─────────────────────────────────────────────────────────────

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
