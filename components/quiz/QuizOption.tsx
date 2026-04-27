import { Pressable, Text, StyleSheet } from 'react-native'
import Animated, {
  useSharedValue,
  withSequence,
  withSpring,
  useAnimatedStyle,
} from 'react-native-reanimated'
import { colors, spacing, radius, fontSize } from '@/lib/tokens'

type OptionState = 'idle' | 'correct' | 'wrong' | 'reveal'

type Props = {
  label: string
  state: OptionState
  onPress: () => void
  disabled?: boolean
}

export default function QuizOption({ label, state, onPress, disabled = false }: Props) {
  const scale = useSharedValue(1)
  const translateX = useSharedValue(0)

  const handlePress = () => {
    if (state === 'idle') {
      scale.value = withSequence(
        withSpring(0.97, { damping: 10 }),
        withSpring(1)
      )
    }
    onPress()
  }

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateX: translateX.value }],
  }))

  const containerStyle = [
    styles.option,
    state === 'correct' && styles.correct,
    state === 'wrong' && styles.wrong,
    state === 'reveal' && styles.reveal,
  ]

  const textStyle = [
    styles.label,
    state === 'correct' && styles.correctText,
    state === 'wrong' && styles.wrongText,
    state === 'reveal' && styles.revealText,
  ]

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        style={containerStyle}
        onPress={handlePress}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={label}
      >
        <Text style={textStyle}>{label}</Text>
      </Pressable>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  option: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    padding: spacing.md,
    alignItems: 'center',
  },
  correct: {
    backgroundColor: '#E8F5EC',
    borderColor: '#2E9E5B',
  },
  wrong: {
    backgroundColor: colors.errorLight,
    borderColor: colors.error,
  },
  reveal: {
    backgroundColor: '#E8F5EC',
    borderColor: '#2E9E5B',
  },
  label: {
    fontSize: fontSize.md,
    color: colors.text,
    fontWeight: '500',
    textAlign: 'center',
  },
  correctText: { color: '#1A6B3C', fontWeight: '700' },
  wrongText: { color: colors.error, fontWeight: '700' },
  revealText: { color: '#1A6B3C', fontWeight: '700' },
})
