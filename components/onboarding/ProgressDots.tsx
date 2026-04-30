import { View, StyleSheet } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
} from 'react-native-reanimated'
import { useEffect } from 'react'
import { colors } from '@/lib/tokens'

/** `filled` = number of dots filled with primary (1–4).
 *  Dots animate in with a spring when mounted. */
export function OnboardingProgressDots({
  filled,
  total = 6,
}: {
  filled: number
  total?: number
}) {
  return (
    <View style={styles.row}>
      {Array.from({ length: total }, (_, i) => (
        <ProgressDot key={i} active={i < filled} delayMs={i * 60} />
      ))}
    </View>
  )
}

function ProgressDot({ active, delayMs }: { active: boolean; delayMs: number }) {
  const scale = useSharedValue(0)
  const opacity = useSharedValue(0)

  useEffect(() => {
    scale.value = withDelay(
      delayMs,
      withSpring(1, { damping: 10, stiffness: 200 })
    )
    opacity.value = withDelay(delayMs, withTiming(1, { duration: 200 }))
  }, [])

  const dotStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
    backgroundColor: active ? colors.primary : colors.primaryLight,
  }))

  return <Animated.View style={[styles.dot, dotStyle]} />
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
})
