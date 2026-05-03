import { useState, useEffect } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Stack, router, useLocalSearchParams } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useGroupLesson } from '@/hooks/useGroupLesson'
import { useLessonStore } from '@/store/lessonStore'
import { useAuthStore } from '@/store/authStore'
import { useProfile } from '@/hooks/useProfile'
import { prefetchTranslations } from '@/hooks/useTranslation'
import { supabase } from '@/lib/supabase'
import { haptics } from '@/lib/haptics'
import { soundEngine } from '@/lib/sounds'
import { updateStreak } from '@/lib/streak'
import { ROUTES } from '@/lib/routes'
import { WORD_THEMES, IRREGULAR_VERB_GROUPS, HOMOPHONE_GROUPS } from '@/lib/practiceThemes'
import { colors, spacing, radius, fontSize } from '@/lib/tokens'
import ErrorState from '@/components/ui/ErrorState'
import Skeleton from '@/components/ui/Skeleton'
import QueueStrip from '@/components/lesson/QueueStrip'
import WordFocusCard from '@/components/lesson/WordFocusCard'
import { LessonCompleteBanner } from '@/components/lesson/BannerBar'
import LessonHeader from '@/components/lesson/LessonHeader'
import type { Word } from '@/lib/types'

export default function GroupLessonScreen() {
  const { theme } = useLocalSearchParams<{ theme: string }>()
  const { words, loading, error, refetch } = useGroupLesson(theme)
  const { masterWord, skipWord, wordsMastered, wordsSkipped, startLesson } = useLessonStore()
  const { user } = useAuthStore()
  const [currentIndex, setCurrentIndex] = useState(0)

  const themeData    = WORD_THEMES[theme] ?? IRREGULAR_VERB_GROUPS[theme] ?? HOMOPHONE_GROUPS[theme]
  const title        = `${themeData?.emoji ?? '🗂'} ${theme}`
  const sortedWords = [...words].sort((a, b) => a.text.localeCompare(b.text))

  // Save incremental progress to Supabase on each action
  const saveProgress = async (mastered: string[], skipped: string[]) => {
    try {
      if (!user || !theme) return
      await supabase.from('group_progress').upsert(
        {
          user_id: user.id, group_name: theme, completed: false,
          words_mastered: mastered, words_skipped: skipped,
          completed_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,group_name' },
      )
    } catch { /* silent — best-effort */ }
  }

  useEffect(() => {
    if (words.length) startLesson(`group:${theme}`)
  }, [theme, words.length])

  // Pre-fetch translations for all words in this group
  const { profile } = useProfile()
  const nativeLang = profile?.native_language
  useEffect(() => {
    if (words.length > 0 && nativeLang && nativeLang !== 'en') {
      prefetchTranslations(words.map((w) => w.text), nativeLang)
    }
  }, [words.length, nativeLang])

  const currentWord = sortedWords[currentIndex] ?? null
  const isComplete  = currentIndex >= sortedWords.length

  const handleMaster = () => {
    if (!currentWord || !user) return
    masterWord(currentWord.id)
    haptics.success()
    soundEngine.play('wordRevealed')
    setCurrentIndex((i) => i + 1)
    updateStreak(user.id).catch(() => {})
    void saveProgress([...wordsMastered, currentWord.id], wordsSkipped)
  }

  const handleSkip = () => {
    if (!currentWord) return
    skipWord(currentWord.id)
    haptics.tap()
    setCurrentIndex((i) => i + 1)
    void saveProgress(wordsMastered, [...wordsSkipped, currentWord.id])
  }

  const handleWordSelect = (wordId: string) => {
    const idx = sortedWords.findIndex((w) => w.id === wordId)
    if (idx >= 0) setCurrentIndex(idx)
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.skeletonContainer}>
          <Skeleton width="100%" height={300} borderRadius={20} />
          <Skeleton width="100%" height={56} borderRadius={14} />
          <Skeleton width="100%" height={56} borderRadius={14} />
        </View>
      </SafeAreaView>
    )
  }

  if (error || !words.length) {
    return (
      <SafeAreaView style={styles.safe}>
        <Stack.Screen options={{ headerShown: false }} />
        <ErrorState message={error ?? 'No words found for this group'} onRetry={refetch} />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.safe}>
      <Stack.Screen options={{ headerShown: false }} />

      <LessonHeader
        title={theme}
        total={sortedWords.length - wordsMastered.length - wordsSkipped.length}
        mastered={wordsMastered.length}
        skipped={wordsSkipped.length}
        onBack={() => router.back()}
      />

      <View style={styles.content}>
        {isComplete ? (
          <LessonCompleteBanner
            mastered={wordsMastered.length}
            skipped={wordsSkipped.length}
            label="start quiz →"
            onContinue={() => router.push(ROUTES.GROUP_QUIZ(theme))}
          />
        ) : currentWord ? (
          <WordFocusCard key={currentIndex} word={currentWord} onMaster={handleMaster} onSkip={handleSkip}
            index={currentIndex} total={sortedWords.length} words={sortedWords}
            masteredIds={wordsMastered} skippedIds={wordsSkipped} />
        ) : null}
      </View>

      {!isComplete && sortedWords.length > 0 && !sortedWords[0]?.id.startsWith('proverb:') && (
        <QueueStrip words={sortedWords} currentId={currentWord?.id ?? ''}
          masteredIds={wordsMastered} skippedIds={wordsSkipped} onWordPress={handleWordSelect} />
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.neutral },
  skeletonContainer: { flex: 1, padding: spacing.lg, gap: spacing.md },

  content: { flex: 1, padding: spacing.lg, paddingTop: spacing.xs, paddingBottom: spacing.md, justifyContent: 'flex-start' },
})
