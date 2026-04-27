import { useEffect, useRef } from 'react'
import { Animated, StyleSheet } from 'react-native'
import { colors } from '@/lib/tokens'

type Props = {
  width: number | string
  height: number
  borderRadius?: number
  style?: object
}

/** Pulse placeholder without Reanimated (avoids native TurboModule mismatch on some clients). */
export default function Skeleton({ width, height, borderRadius = 8, style }: Props) {
  const opacity = useRef(new Animated.Value(0.55)).current

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 700, useNativeDriver: true }),
      ])
    )
    loop.start()
    return () => loop.stop()
  }, [opacity])

  return (
    <Animated.View
      style={[
        styles.base,
        { width: width as number, height, borderRadius, opacity },
        style,
      ]}
    />
  )
}

const styles = StyleSheet.create({
  base: { backgroundColor: colors.border },
})
