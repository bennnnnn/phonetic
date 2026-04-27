import { useEffect, useRef } from 'react'
import { Animated, Dimensions, StyleSheet, View } from 'react-native'
import { colors } from '@/lib/tokens'

const { width: W } = Dimensions.get('window')

const CONFETTI_COLORS = ['#fff', '#9FE1CB', colors.accent, colors.amber, colors.error]

type Piece = { id: number; left: number; delay: number; color: string; size: number }

const PIECES: Piece[] = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  left: (W / 18) * i + Math.random() * 8,
  delay: Math.random() * 400,
  color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
  size: 6 + Math.random() * 6,
}))

export default function ConfettiBurst() {
  const anims = useRef(PIECES.map(() => new Animated.Value(0))).current

  useEffect(() => {
    const loops = anims.map((v, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(PIECES[i].delay),
          Animated.timing(v, {
            toValue: 1,
            duration: 2200 + Math.random() * 800,
            useNativeDriver: true,
          }),
          Animated.timing(v, { toValue: 0, duration: 0, useNativeDriver: true }),
        ])
      )
    )
    loops.forEach((l) => l.start())
    return () => loops.forEach((l) => l.stop())
  }, [anims])

  return (
    <View style={styles.wrap} pointerEvents="none">
      {PIECES.map((p, i) => {
        const translateY = anims[i].interpolate({
          inputRange: [0, 1],
          outputRange: [-20, 420],
        })
        const rotate = anims[i].interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', `${360 + i * 40}deg`],
        })
        const opacity = anims[i].interpolate({
          inputRange: [0, 0.1, 0.85, 1],
          outputRange: [0, 1, 1, 0],
        })
        return (
          <Animated.View
            key={p.id}
            style={[
              styles.piece,
              {
                left: p.left,
                width: p.size,
                height: p.size * 0.55,
                backgroundColor: p.color,
                opacity,
                transform: [{ translateY }, { rotate }],
              },
            ]}
          />
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { ...StyleSheet.absoluteFillObject, overflow: 'hidden' },
  piece: {
    position: 'absolute',
    top: 0,
    borderRadius: 2,
  },
})
