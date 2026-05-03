import { useEffect } from 'react'
import { View, StyleSheet } from 'react-native'
import Animated, {
  useSharedValue, useAnimatedStyle,
  withRepeat, withTiming, withSequence, withDelay,
} from 'react-native-reanimated'

const BAR_COUNT = 5
const BAR_WIDTH = 3
const BAR_GAP = 3

function AnimatedBar({ index, playing }: { index: number; playing: boolean }) {
  const height = useSharedValue(4)

  useEffect(() => {
    if (playing) {
      // Each bar animates at a different rhythm for a natural look
      const baseDelay = index * 150
      height.value = withRepeat(
        withSequence(
          withDelay(baseDelay, withTiming(14 + index * 4, { duration: 300 })),
          withDelay(baseDelay, withTiming(4, { duration: 300 })),
        ),
        -1, true,
      )
    } else {
      height.value = withTiming(4, { duration: 150 })
    }
  }, [playing])

  const style = useAnimatedStyle(() => ({
    height: height.value,
  }))

  return <Animated.View style={[styles.bar, style]} />
}

export default function WaveformBars({ playing }: { playing: boolean }) {
  return (
    <View style={styles.row}>
      {Array.from({ length: BAR_COUNT }, (_, i) => (
        <AnimatedBar key={i} index={i} playing={playing} />
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: BAR_GAP,
    height: 22,
  },
  bar: {
    width: BAR_WIDTH,
    borderRadius: 2,
    backgroundColor: '#fff',
  },
})
