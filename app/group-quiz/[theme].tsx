import { useEffect, useCallback, useRef } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { Stack, router, useLocalSearchParams } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import * as Speech from 'expo-speech'
import { useGroupLesson } from '@/hooks/useGroupLesson'
import { useLessonStore } from '@/store/lessonStore'
import { useAudio } from '@/hooks/useAudio'
import { useQuizLogic, getOptionState } from '@/hooks/useQuizLogic'
import { pickCorrectPhrase, pickWrongPhrase } from '@/lib/quizVoices'
import { ROUTES } from '@/lib/routes'
import { WORD_THEMES, IRREGULAR_VERB_GROUPS, HOMOPHONE_GROUPS } from '@/lib/practiceThemes'
import { colors, spacing, radius, fontSize } from '@/lib/tokens'
import QuizOption from '@/components/quiz/QuizOption'
import ScoreBar from '@/components/quiz/ScoreBar'
import QuizDoneCard from '@/components/quiz/QuizDoneCard'
import AudioQuizCard from '@/components/quiz/AudioQuizCard'
import Skeleton from '@/components/ui/Skeleton'
import SegmentedStepBar from '@/components/ui/SegmentedStepBar'

export default function GroupQuizScreen() {
  const { theme } = useLocalSearchParams<{ theme: string }>()
  const { words, loading } = useGroupLesson(theme)
  const { setQuizResult } = useLessonStore()
  const { play: playTts } = useAudio()

  const quiz = useQuizLogic(words, (score, total) => {
    setQuizResult(score, total)
  })
  const { question, done, score, scoreRef, questions, answered, selectedId, cardFeedback, handleAnswer, currentQ } = quiz

  const themeData = WORD_THEMES[theme] ?? IRREGULAR_VERB_GROUPS[theme] ?? HOMOPHONE_GROUPS[theme]
  const title     = `${themeData?.emoji ?? '🗂'} ${theme}`

  const attemptCountRef = useRef(0)

  // Auto-play proverb audio when a new proverb question appears
  useEffect(() => {
    if (question?.word.id.startsWith('proverb:')) {
      setTimeout(() => {
        playTts(question.word.audio_url, question.word.text)
      }, 500)
    }
  }, [currentQ, question?.word.id])

  useEffect(() => {
    if (!answered || !selectedId || !question) return

    const thisAttempt = ++attemptCountRef.current
    const correct = selectedId === question.correctId

    Speech.stop()
    const phrase = correct ? pickCorrectPhrase() : pickWrongPhrase()
    setTimeout(() => playTts('', phrase), 200)

    if (!correct) {
      setTimeout(() => {
        if (attemptCountRef.current === thisAttempt) {
          Speech.stop()
          playTts('', question.word.text)
        }
      }, 1200)
    }
  }, [answered])

  const handleFinish = () => {
    setQuizResult(scoreRef.current, questions.length)
    router.replace(ROUTES.GROUP_COMPLETE(theme))
  }

  const wrappedHandleAnswer = useCallback((wordId: string) => {
    handleAnswer(wordId)
  }, [handleAnswer])

  if (loading || quiz.loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.skeletonContainer}>
          <Skeleton width="100%" height={180} borderRadius={20} />
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} width="100%" height={56} borderRadius={12} />
          ))}
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.safe}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} accessibilityLabel="Go back">
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.lessonTitle} numberOfLines={1}>{title}</Text>
          <SegmentedStepBar current={3} />
        </View>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.scoreBarWrap}>
        <ScoreBar correct={score} total={questions.length} />
      </View>

      <View style={styles.content}>
        {done ? (
          <QuizDoneCard
            score={scoreRef.current}
            total={questions.length}
            onFinish={handleFinish}
          />
        ) : question ? (
          <>
            {question.word.id.startsWith('proverb:') ? (
              // Proverbs: speaker-only prompt, options are definitions
              <View style={styles.quizPromptWrap}>
                <Text style={styles.quizPromptLabel}>Tap to hear the proverb</Text>
                <TouchableOpacity
                  style={styles.quizSpeakerBtn}
                  onPress={async () => {
                    await playTts(question.word.audio_url, question.word.text)
                  }}
                >
                  <Ionicons name="volume-high" size={52} color={colors.primary} />
                </TouchableOpacity>
              </View>
            ) : question.word.id.startsWith('homo:') ? (
              // Homophones: show definition, pick the word
              <View style={styles.quizPromptWrap}>
                <Text style={styles.quizPromptLabel}>Which word matches this definition?</Text>
                <View style={styles.homoDefCard}>
                  <Text style={styles.homoDefText}>{question.word.definition}</Text>
                </View>
                <TouchableOpacity
                  style={styles.homoSpeakerMini}
                  onPress={async () => {
                    await playTts(question.word.audio_url, question.word.text)
                  }}
                >
                  <Ionicons name="volume-high" size={22} color={colors.primary} />
                </TouchableOpacity>
              </View>
            ) : question.word.id.startsWith('idiom:') ? (
              // Idioms: show the idiom, pick the meaning
              <View style={styles.quizPromptWrap}>
                <Text style={styles.quizPromptLabel}>What does this idiom mean?</Text>
                <View style={styles.homoDefCard}>
                  <Text style={styles.homoDefText}>{question.word.text}</Text>
                </View>
                <TouchableOpacity
                  style={styles.homoSpeakerMini}
                  onPress={async () => {
                    await playTts(question.word.audio_url, question.word.text)
                  }}
                >
                  <Ionicons name="volume-high" size={22} color={colors.primary} />
                </TouchableOpacity>
              </View>
            ) : (
              <AudioQuizCard
                word={question.word}
                questionKey={currentQ}
                cardFeedback={cardFeedback}
              />
            )}

            <View style={styles.options}>
              {question.options.map((opt) => (
                <QuizOption
                  key={opt.id}
                  label={question.word.id.startsWith('proverb:') || question.word.id.startsWith('idiom:') ? opt.definition : (opt.pastText ?? opt.text)}
                  state={getOptionState(opt.id, question.correctId, answered, selectedId)}
                  onPress={() => wrappedHandleAnswer(opt.id)}
                  disabled={answered}
                />
              ))}
            </View>
          </>
        ) : null}
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.neutral },
  skeletonContainer: { flex: 1, padding: spacing.lg, gap: spacing.md },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    backgroundColor: colors.surface, gap: spacing.sm,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  backBtn: { padding: spacing.xs },
  headerCenter: { flex: 1, alignItems: 'center', gap: spacing.xs, minWidth: 0 },
  lessonTitle: { fontSize: fontSize.md, fontWeight: '600', color: colors.text },
  placeholder: { width: 40 },
  scoreBarWrap: { paddingVertical: spacing.sm },
  content: { flex: 1, padding: spacing.lg, gap: spacing.lg },
  options: { gap: spacing.sm },
  quizPromptWrap: {
    backgroundColor: colors.surface, borderRadius: radius.xl,
    padding: spacing.xxl, gap: spacing.md, alignItems: 'center',
    justifyContent: 'center', minHeight: 180,
  },
  quizSpeakerBtn: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: colors.surface,
    alignItems: 'center', justifyContent: 'center',
  },
  quizPromptLabel: {
    fontSize: fontSize.sm, color: colors.textMuted,
    textTransform: 'uppercase', letterSpacing: 1,
  },
  homoDefCard: {
    backgroundColor: colors.primaryLight,
    borderRadius: radius.lg,
    padding: spacing.md,
    width: '100%',
  },
  homoDefText: {
    fontSize: fontSize.lg,
    color: colors.primaryDark,
    textAlign: 'center',
    lineHeight: 24,
  },
  homoSpeakerMini: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: colors.surface,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: colors.border,
  },
  homoExample: {
    fontSize: fontSize.md,
    color: colors.primaryDark,
    textAlign: 'center',
    lineHeight: 20,
    fontStyle: 'italic',
    marginTop: spacing.sm,
  },
})
