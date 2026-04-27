import { useEffect } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import Animated, { useSharedValue, withSpring, useAnimatedStyle } from 'react-native-reanimated'
import { colors, spacing, radius, fontSize } from '@/lib/tokens'

type Props = {
  correct: number
  total: number
}

export default function ScoreBar({ correct, total }: Props) {
  const progress = total > 0 ? correct / total : 0
  const widthAnim = useSharedValue(0)

  useEffect(() => {
    widthAnim.value = withSpring(progress, { damping: 20 })
  }, [progress])

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${widthAnim.value * 100}%` as any,
  }))

  return (
    <View style={styles.container}>
      <View style={styles.track}>
        <Animated.View style={[styles.fill, animatedStyle]} />
      </View>
      <Text style={styles.label}>{correct}/{total}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  track: {
    flex: 1,
    height: 8,
    backgroundColor: colors.neutral,
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: radius.full,
  },
  label: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    fontWeight: '600',
    minWidth: 32,
  },
})
