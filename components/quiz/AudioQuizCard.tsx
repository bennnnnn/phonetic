import { useEffect } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import * as Speech from 'expo-speech'
import { useAudio } from '@/hooks/useAudio'
import { haptics } from '@/lib/haptics'
import { pickRoundStartPhrase } from '@/lib/quizVoices'
import { colors, spacing, radius, fontSize } from '@/lib/tokens'
import type { Word } from '@/lib/types'

type Props = {
  word: Word
  /** Called each time a new question is shown — used to trigger auto-speak */
  questionKey: number
  cardFeedback: 'neutral' | 'correct' | 'wrong'
}

export default function AudioQuizCard({ word, questionKey, cardFeedback }: Props) {
  const { play: playTts } = useAudio()

  // Auto-speak the word whenever a new question appears
  useEffect(() => {
    const timer = setTimeout(() => {
      Speech.stop()
      playTts('', word.text)
      haptics.tap()
    }, 400)
    return () => clearTimeout(timer)
  }, [questionKey])

  const handleListenAgain = () => {
    Speech.stop()
    playTts('', word.text)
    haptics.tap()
  }

  return (
    <View
      style={[
        styles.card,
        cardFeedback === 'correct' && styles.cardCorrect,
        cardFeedback === 'wrong' && styles.cardWrong,
      ]}
    >
      <View style={styles.content}>
        <TouchableOpacity
          style={styles.playBtn}
          onPress={handleListenAgain}
          accessibilityRole="button"
          accessibilityLabel="Listen to the word again"
        >
          <Ionicons name="volume-high" size={44} color="#fff" />
        </TouchableOpacity>

        <Text style={styles.hint}>
          {word.pastText
            ? 'pick the past tense'
            : 'tap the play button to hear it again'}
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xxl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 180,
  },
  cardCorrect: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  cardWrong: {
    borderColor: colors.error,
    backgroundColor: colors.errorLight,
  },
  content: {
    alignItems: 'center',
    gap: spacing.lg,
  },
  playBtn: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hint: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    textAlign: 'center',
  },
})
