import { useEffect, useState } from 'react'
import { Text, StyleSheet } from 'react-native'
import Animated, {
  useSharedValue, useAnimatedStyle,
  withSpring, withDelay,
} from 'react-native-reanimated'

export function Star({ filled, delay }: { filled: boolean; delay: number }) {
  const scale = useSharedValue(0)
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }))

  useEffect(() => {
    if (filled) {
      scale.value = withDelay(delay, withSpring(1, { damping: 6 }))
    }
  }, [filled])

  return (
    <Animated.Text style={[styles.star, style]}>
      {filled ? '⭐' : '☆'}
    </Animated.Text>
  )
}

/**
 * Animated count-up: runs via requestAnimationFrame over `dur` ms.
 */
export function useScoreCountUp(target: number): number {
  const [display, setDisplay] = useState(0)
  useEffect(() => {
    let raf = 0
    const start = performance.now()
    const dur = 650
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / dur)
      setDisplay(Math.round(target * t))
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target])
  return display
}

const styles = StyleSheet.create({
  star: { fontSize: 36 },
})
