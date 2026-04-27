import { useState, useEffect, useCallback, useRef } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { Stack, router, useLocalSearchParams } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import * as Speech from 'expo-speech'
import { useGroupLesson } from '@/hooks/useGroupLesson'
import { useLessonStore } from '@/store/lessonStore'
import { haptics } from '@/lib/haptics'
import { soundEngine } from '@/lib/sounds'
import { ROUTES } from '@/lib/routes'
import { WORD_THEMES } from '@/lib/practiceThemes'
import { colors, spacing, radius, fontSize } from '@/lib/tokens'
import QuizOption from '@/components/quiz/QuizOption'
import ScoreBar from '@/components/quiz/ScoreBar'
import Skeleton from '@/components/ui/Skeleton'
import SegmentedStepBar from '@/components/ui/SegmentedStepBar'
import type { Word } from '@/lib/types'

const QUIZ_COUNT     = 6
const CORRECT_DELAY  = 900
const WRONG_DELAY    = 1400

type OptionState  = 'idle' | 'correct' | 'wrong' | 'reveal'
type CardFeedback = 'neutral' | 'correct' | 'wrong'

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5)
}

function buildQuestions(words: Word[]) {
  const pool = shuffle(words).slice(0, Math.min(QUIZ_COUNT, words.length))
  return pool.map((word) => {
    const distractors = shuffle(words.filter((w) => w.id !== word.id)).slice(0, 3)
    const options = shuffle([word, ...distractors])
    return { word, options, correctId: word.id }
  })
}

export default function GroupQuizScreen() {
  const { theme } = useLocalSearchParams<{ theme: string }>()
  const { words, loading } = useGroupLesson(theme)
  const { setQuizResult } = useLessonStore()

  const themeData = WORD_THEMES[theme]
  const title     = `${themeData?.emoji ?? '🗂'} ${theme}`

  const [questions, setQuestions] = useState<ReturnType<typeof buildQuestions>>([])
  const [currentQ, setCurrentQ]   = useState(0)
  const [score, setScore]         = useState(0)
  const scoreRef = useRef(0)
  scoreRef.current = score

  const [answered, setAnswered]       = useState(false)
  const [selectedId, setSelectedId]   = useState<string | null>(null)
  const [done, setDone]               = useState(false)
  const [cardFeedback, setCardFeedback] = useState<CardFeedback>('neutral')

  const questionsLenRef = useRef(0)
  questionsLenRef.current = questions.length

  useEffect(() => {
    if (words.length >= 2) setQuestions(buildQuestions(words))
  }, [words])

  const question = questions[currentQ]

  const getOptionState = (wordId: string): OptionState => {
    if (!answered || !question) return 'idle'
    if (wordId === question.correctId) return selectedId === wordId ? 'correct' : 'reveal'
    if (wordId === selectedId) return 'wrong'
    return 'idle'
  }

  const advanceAfterDelay = useCallback((delay: number) => {
    const len = questionsLenRef.current
    setTimeout(() => {
      setCardFeedback('neutral')
      setCurrentQ((q) => {
        if (q + 1 >= len) { setDone(true); return q }
        setAnswered(false)
        setSelectedId(null)
        return q + 1
      })
    }, delay)
  }, [])

  const handleAnswer = useCallback((wordId: string) => {
    if (answered || !question) return
    setAnswered(true)
    setSelectedId(wordId)
    const correct = wordId === question.correctId
    setCardFeedback(correct ? 'correct' : 'wrong')
    if (correct) {
      haptics.success()
      soundEngine.play('correct')
      setScore((s) => s + 1)
      advanceAfterDelay(CORRECT_DELAY)
    } else {
      haptics.error()
      soundEngine.play('wrong', 0.6)
      advanceAfterDelay(WRONG_DELAY)
    }
  }, [answered, question, advanceAfterDelay])

  const handleFinish = () => {
    const len = questions.length
    if (len === 0) return
    setQuizResult(scoreRef.current, len)
    router.replace(ROUTES.GROUP_COMPLETE(theme))
  }

  if (loading || questions.length === 0) {
    return (
      <SafeAreaView style={styles.safe}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.skeletonContainer}>
          <Skeleton width="100%" height={12} borderRadius={6} />
          <Skeleton width="100%" height={200} borderRadius={20} />
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} width="100%" height={56} borderRadius={12} />
          ))}
        </View>
      </SafeAreaView>
    )
  }

  const donePct = Math.round((score / questions.length) * 100)

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
          <View style={styles.doneCard}>
            <Text style={styles.doneScore}>{donePct}%</Text>
            <Text style={styles.doneLabel}>{score}/{questions.length} correct</Text>
            <Text style={styles.doneMessage}>
              {score === questions.length
                ? 'Perfect! You nailed it.'
                : score >= questions.length * 0.7
                  ? 'Great work! Almost perfect.'
                  : "Keep practicing! You'll get it."}
            </Text>
            <TouchableOpacity style={styles.finishBtn} onPress={handleFinish} accessibilityRole="button">
              <Text style={styles.finishBtnText}>finish →</Text>
            </TouchableOpacity>
          </View>
        ) : question ? (
          <>
            <View style={[
              styles.wordCard,
              cardFeedback === 'correct' && styles.wordCardCorrect,
              cardFeedback === 'wrong'   && styles.wordCardWrong,
            ]}>
              <View style={styles.wordCardTop}>
                <Text style={styles.questionLabel}>Which word matches this meaning?</Text>
                <Text style={styles.questionDef}>{question.word.definition}</Text>
                <TouchableOpacity
                  style={styles.hearClueBtn}
                  onPress={() => {
                    Speech.stop()
                    Speech.speak(question.word.definition, { language: 'en-US', rate: 0.92 })
                    haptics.tap()
                  }}
                  accessibilityRole="button"
                >
                  <Ionicons name="volume-medium" size={18} color={colors.primary} />
                  <Text style={styles.hearClueText}>hear meaning</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.options}>
              {question.options.map((opt) => (
                <QuizOption
                  key={opt.id}
                  label={opt.text}
                  state={getOptionState(opt.id)}
                  onPress={() => handleAnswer(opt.id)}
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
  wordCard: {
    backgroundColor: colors.surface, borderRadius: radius.xxl,
    padding: spacing.xl, borderWidth: 1, borderColor: colors.border,
  },
  wordCardCorrect: { borderColor: colors.primary, backgroundColor: colors.primaryLight },
  wordCardWrong:   { borderColor: colors.error,   backgroundColor: colors.errorLight },
  wordCardTop: { gap: spacing.sm },
  questionLabel: { fontSize: fontSize.sm, color: colors.textMuted, fontWeight: '500' },
  questionDef:   { fontSize: fontSize.lg, color: colors.text, fontWeight: '600', lineHeight: 26 },
  hearClueBtn: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    alignSelf: 'flex-start', marginTop: spacing.md,
    paddingVertical: spacing.sm, paddingHorizontal: spacing.md,
    borderRadius: radius.full, borderWidth: 1,
    borderColor: colors.primaryMid, backgroundColor: colors.primaryLight,
  },
  hearClueText: { color: colors.primaryDark, fontSize: fontSize.sm, fontWeight: '600' },
  options: { gap: spacing.sm },
  doneCard: {
    flex: 1, backgroundColor: colors.surface, borderRadius: radius.xxl,
    padding: spacing.xl, alignItems: 'center', justifyContent: 'center',
    gap: spacing.lg, borderWidth: 1, borderColor: colors.border,
  },
  doneScore:   { fontSize: 72, fontWeight: '800', color: colors.primary },
  doneLabel:   { fontSize: fontSize.lg, color: colors.textMuted },
  doneMessage: { fontSize: fontSize.lg, color: colors.text, fontWeight: '600', textAlign: 'center' },
  finishBtn: {
    backgroundColor: colors.primary, borderRadius: radius.md,
    paddingVertical: spacing.md, paddingHorizontal: spacing.xl,
    alignItems: 'center', width: '100%',
  },
  finishBtnText: { color: '#fff', fontSize: fontSize.lg, fontWeight: '700' },
})
