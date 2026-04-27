import { Pressable, View, Text, StyleSheet } from 'react-native'
import Animated, {
  useSharedValue,
  withSpring,
  useAnimatedStyle,
  FadeInDown,
} from 'react-native-reanimated'
import AudioButton from './AudioButton'
import { colors, spacing, radius, fontSize } from '@/lib/tokens'
import type { Word } from '@/lib/types'

type Props = {
  word: Word
  onPress?: () => void
  revealed?: boolean
  index?: number
}

export default function WordCard({ word, onPress, revealed = false, index = 0 }: Props) {
  const scale = useSharedValue(1)

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  const handlePress = () => {
    scale.value = withSpring(0.94, { damping: 8 }, () => {
      scale.value = withSpring(1)
    })
    onPress?.()
  }

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 80).springify()}
      style={animatedStyle}
    >
      <Pressable
        onPress={handlePress}
        style={[styles.card, revealed && styles.revealed]}
        accessibilityRole="button"
        accessibilityLabel={`Word: ${word.text}`}
      >
        <View style={styles.wordRow}>
          <View style={styles.wordTextContainer}>
            <Text style={styles.wordText}>
              <Text style={styles.consonant}>{word.consonant}</Text>
              <Text style={styles.pattern}>{word.pattern}</Text>
            </Text>
            <Text style={styles.phoneme}>{word.phoneme}</Text>
          </View>
          <AudioButton
            audioUrl={word.audio_url}
            fallbackText={word.text}
            size="md"
            accessibilityLabel={`Hear ${word.text}`}
          />
        </View>
        {revealed && (
          <Text style={styles.definition}>{word.definition}</Text>
        )}
      </Pressable>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  revealed: {
    borderColor: colors.primaryMid,
    backgroundColor: colors.primaryLight,
  },
  wordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  wordTextContainer: {
    gap: 2,
  },
  wordText: {
    fontSize: fontSize.xxl,
    fontFamily: 'Georgia',
  },
  consonant: {
    color: colors.consonant,
  },
  pattern: {
    color: colors.pattern,
  },
  phoneme: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
  },
  definition: {
    color: colors.text,
    fontSize: fontSize.md,
    lineHeight: 20,
  },
})
