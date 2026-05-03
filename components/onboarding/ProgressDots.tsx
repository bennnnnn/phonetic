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

/** `filled` = how many dots use primary (left to right).
 *  Main onboarding uses **4** dots. Pass `total={6}` for the post-signup permission steps. */
export function OnboardingProgressDots({
  filled,
  total = 4,
  variant = 'light',
}: {
  filled: number
  total?: number
  /** 'light' = on white bg (teal active, mint inactive)
   *  'dark'  = on teal bg (white active, semi-white inactive) */
  variant?: 'light' | 'dark'
}) {
  return (
    <View style={styles.row}>
      {Array.from({ length: total }, (_, i) => (
        <ProgressDot key={i} active={i < filled} delayMs={i * 50} variant={variant} />
      ))}
    </View>
  )
}

function ProgressDot({
  active, delayMs, variant,
}: {
  active: boolean
  delayMs: number
  variant: 'light' | 'dark'
}) {
  const width   = useSharedValue(active ? 20 : 8)
  const opacity = useSharedValue(0)

  useEffect(() => {
    width.value   = withDelay(delayMs, withSpring(active ? 20 : 8, { damping: 12, stiffness: 180 }))
    opacity.value = withDelay(delayMs, withTiming(1, { duration: 180 }))
  }, [])

  useEffect(() => {
    width.value = withSpring(active ? 20 : 8, { damping: 12, stiffness: 180 })
  }, [active])

  const activeColor   = variant === 'dark' ? '#fff'                  : colors.primary
  const inactiveColor = variant === 'dark' ? 'rgba(255,255,255,0.35)' : colors.primaryLight

  const dotStyle = useAnimatedStyle(() => ({
    width: width.value,
    opacity: opacity.value,
    backgroundColor: active ? activeColor : inactiveColor,
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
    height: 8,
    borderRadius: 4,
  },
})
