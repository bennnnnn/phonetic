import { useEffect } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import Animated, {
  useSharedValue, useAnimatedStyle,
  withSpring, withSequence, useDerivedValue,
} from 'react-native-reanimated'
import { colors, spacing, radius, fontSize } from '@/lib/tokens'

type Props = {
  amount: number
  visible: boolean
  color?: string
}

/**
 * Floats up from the tap point and fades out — " +5 XP " style popup.
 * Rendered as an absolutely-positioned overlay.
 */
export default function XpPop({ amount, visible, color = colors.amber }: Props) {
  const scale = useSharedValue(0)
  const translateY = useSharedValue(0)
  const opacity = useSharedValue(0)

  useEffect(() => {
    if (!visible) {
      scale.value = 0
      translateY.value = 0
      opacity.value = 0
      return
    }
    scale.value = withSequence(
      withSpring(1.3, { damping: 5, stiffness: 180 }),
      withSpring(1, { damping: 10, stiffness: 200 }),
    )
    translateY.value = withSequence(
      withSpring(-40, { damping: 12, stiffness: 100 }),
      withSpring(-60, { damping: 15, stiffness: 80 }),
    )
    opacity.value = withSequence(
      withSpring(1, { damping: 15 }),
      withSpring(0, { damping: 8, stiffness: 40 }),
    )
  }, [visible])

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
    opacity: opacity.value,
  }))

  return (
    <Animated.View style={[styles.wrap, style]} pointerEvents="none">
      <Text style={[styles.text, { color }]}>+{amount}</Text>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute', top: -20, right: 10,
    backgroundColor: colors.amberLight, borderRadius: radius.full,
    paddingVertical: 3, paddingHorizontal: 8,
    zIndex: 50,
  },
  text: { fontSize: 13, fontWeight: '800' },
})
