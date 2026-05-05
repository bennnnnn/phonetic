import { useState, useEffect } from 'react'
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native'
import { Stack, router, useLocalSearchParams } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLesson } from '@/hooks/useLesson'
import { useLessonStore } from '@/store/lessonStore'
import { useAuthStore } from '@/store/authStore'
import { useProfile } from '@/hooks/useProfile'
import { prefetchTranslations } from '@/hooks/useTranslation'
import { supabase } from '@/lib/supabase'
import { wordsMasteredArray } from '@/lib/lessonProgress'
import { haptics } from '@/lib/haptics'
import { soundEngine } from '@/lib/sounds'
import { ROUTES } from '@/lib/routes'
import { colors, spacing, radius, fontSize } from '@/lib/tokens'
import ErrorState from '@/components/ui/ErrorState'
import Skeleton from '@/components/ui/Skeleton'
import QueueStrip from '@/components/lesson/QueueStrip'
import WordFocusCard from '@/components/lesson/WordFocusCard'
import { LessonCompleteBanner } from '@/components/lesson/BannerBar'
import LessonHeader from '@/components/lesson/LessonHeader'
import type { Word } from '@/lib/types'

export default function LessonScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { lesson, loading, error, refetch } = useLesson(id)
  const { masterWord, skipWord, wordsMastered, wordsSkipped, startLesson, resumeLesson } = useLessonStore()
  const { user } = useAuthStore()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [hydrated, setHydrated] = useState(false)

  const words: Word[] = (lesson?.word_family?.words ?? []).sort((a, b) => a.text.localeCompare(b.text))

  // Save partial progress to Supabase on each action
  const saveProgress = async (mastered: string[], skipped: string[]) => {
    try {
      if (!user || !id) return
      await supabase.from('user_progress').upsert(
        {
          user_id: user.id, lesson_id: id, completed: false,
          words_mastered: mastered, words_skipped: skipped,
        },
        { onConflict: 'user_id,lesson_id' },
      )
    } catch { /* silent — best-effort */ }
  }

  // Hydrate lesson store from saved DB progress on mount
  useEffect(() => {
    if (!lesson || !user || hydrated || loading) return
    void (async () => {
      try {
        const { data } = await supabase
          .from('user_progress')
          .select('words_mastered, words_skipped, completed')
          .eq('user_id', user.id)
          .eq('lesson_id', id)
          .maybeSingle()

        const row = data as { words_mastered?: unknown; words_skipped?: unknown; completed?: boolean } | null
        if (row && !row.completed) {
          const mastered = wordsMasteredArray({ words_mastered: row.words_mastered as string[] } as never)
          const skipped = Array.isArray(row.words_skipped) ? row.words_skipped as string[] : []
          resumeLesson(id, mastered, skipped)
          // Skip past already-handled words
          const handled = new Set([...mastered, ...skipped])
          const firstUnhandled = words.findIndex((w) => !handled.has(w.id))
          setCurrentIndex(firstUnhandled >= 0 ? firstUnhandled : words.length)
        } else {
          startLesson(id)
        }
      } catch {
        startLesson(id)
      } finally {
        setHydrated(true)
      }
    })()
  }, [lesson?.id, user?.id])

  // Pre-fetch translations for all words in this lesson (must be above early return — hooks rule)
  const { profile } = useProfile()
  const nativeLang = profile?.native_language
  useEffect(() => {
    if (words.length > 0 && nativeLang && nativeLang !== 'en') {
      prefetchTranslations(words.map((w) => w.text), nativeLang)
    }
  }, [words.length, nativeLang])

  // Show nothing until hydration is done (prevents flash of empty state)
  if (!hydrated) {
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

  const currentWord = words[currentIndex] ?? null
  const isComplete  = currentIndex >= words.length

  const handleMaster = () => {
    if (!currentWord) return
    masterWord(currentWord.id)
    haptics.success()
    soundEngine.play('wordRevealed')
    setCurrentIndex((i) => i + 1)
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
    const idx = words.findIndex((w) => w.id === wordId)
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

  if (error || !lesson) {
    return (
      <SafeAreaView style={styles.safe}>
        <Stack.Screen options={{ headerShown: false }} />
        <ErrorState message={error ?? 'Lesson not found'} onRetry={refetch} />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.safe}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <LessonHeader
        title={lesson.title.replace(/^The /, '').replace(/ family$/, '')}
        total={words.length - wordsMastered.length - wordsSkipped.length}
        mastered={wordsMastered.length}
        skipped={wordsSkipped.length}
        onBack={() => router.back()}
      />

      {/* Content */}
      <View style={styles.content}>
        {isComplete ? (
          <LessonCompleteBanner
            mastered={wordsMastered.length}
            skipped={wordsSkipped.length}
            onContinue={() => router.push(ROUTES.QUIZ(id))}
            label="start quiz →"
          />
        ) : currentWord ? (
          <WordFocusCard key={currentIndex} word={currentWord} onMaster={handleMaster} onSkip={handleSkip}
            index={currentIndex} total={words.length} words={words}
            masteredIds={wordsMastered} skippedIds={wordsSkipped} />
        ) : null}
      </View>

      {/* Queue Strip */}
      {!isComplete && words.length > 0 && (
        <QueueStrip words={words} currentId={currentWord?.id ?? ''}
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
