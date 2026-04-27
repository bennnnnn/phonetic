import { Pressable, StyleSheet } from 'react-native'
import Animated, { useSharedValue, withSpring, useAnimatedStyle } from 'react-native-reanimated'
import { Ionicons } from '@expo/vector-icons'
import { useAudio } from '@/hooks/useAudio'
import { colors } from '@/lib/tokens'

type Props = {
  audioUrl: string
  fallbackText?: string
  size?: 'sm' | 'md' | 'lg'
  accessibilityLabel?: string
}

export default function AudioButton({ audioUrl, fallbackText, size = 'md', accessibilityLabel }: Props) {
  const { play, playing, loading } = useAudio()
  const scale = useSharedValue(1)

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  const handlePress = async () => {
    scale.value = withSpring(0.88, { damping: 8 }, () => {
      scale.value = withSpring(1)
    })
    await play(audioUrl, fallbackText)
  }

  const buttonSize = { sm: 36, md: 48, lg: 60 }[size]
  const iconSize = { sm: 16, md: 22, lg: 28 }[size]

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        style={[
          styles.button,
          {
            width: buttonSize,
            height: buttonSize,
            borderRadius: buttonSize / 2,
            backgroundColor: playing ? colors.primaryMid : colors.primary,
          },
        ]}
        onPress={handlePress}
        disabled={loading}
        accessibilityLabel={accessibilityLabel ?? 'Play audio'}
        accessibilityRole="button"
      >
        <Ionicons
          name={playing ? 'volume-high' : 'volume-medium'}
          size={iconSize}
          color="#fff"
        />
      </Pressable>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
  },
})
