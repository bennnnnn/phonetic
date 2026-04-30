import { useEffect, useRef } from 'react'
import { ScrollView, View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors, spacing, radius, fontSize } from '@/lib/tokens'
import type { Word } from '@/lib/types'
import type { WordStatus } from '@/lib/types'

type Props = {
  words: Word[]
  currentId: string
  masteredIds: string[]
  skippedIds: string[]
  onWordPress?: (wordId: string) => void
}

function getStatus(word: Word, currentId: string, masteredIds: string[], skippedIds: string[]): WordStatus {
  if (masteredIds.includes(word.id)) return 'mastered'
  if (skippedIds.includes(word.id)) return 'skipped'
  return 'unseen'
}

export default function QueueStrip({ words, currentId, masteredIds, skippedIds, onWordPress }: Props) {
  const scrollRef = useRef<ScrollView>(null)

  // Auto-scroll so the current word pill stays visible — only scrolls when
  // the current pill would be beyond the right edge of the viewport
  useEffect(() => {
    const currentIdx = words.findIndex((w) => w.id === currentId)
    if (currentIdx < 0) return

    const pillWidth = 70
    const gap = spacing.sm // 8
    const paddingLeft = spacing.lg // 24
    const screenWidth = 375 // rough iPhone SE width; fine for this estimate
    const currentPillRight = currentIdx * (pillWidth + gap) + paddingLeft + pillWidth + 24 // 24 right padding

    // Only scroll forward if the pill is past the visible area
    if (currentPillRight > screenWidth) {
      const offsetX = currentIdx * (pillWidth + gap) + paddingLeft - 60 // leave a few pills visible to the left
      scrollRef.current?.scrollTo({ x: offsetX, animated: true })
    }
  }, [currentId, words.length])

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {words.map((word) => {
          const isCurrent = word.id === currentId
          const status = getStatus(word, currentId, masteredIds, skippedIds)

          return (
            <TouchableOpacity
              key={word.id}
              style={[
                styles.pill,
                isCurrent && styles.pillCurrent,
                status === 'mastered' && styles.pillMastered,
                status === 'skipped' && styles.pillSkipped,
              ]}
              onPress={() => onWordPress?.(word.id)}
              accessibilityRole="button"
              accessibilityLabel={`Go to word ${word.text}`}
              activeOpacity={isCurrent ? 1 : 0.65}
            >
              <Text
                style={[
                  styles.pillText,
                  isCurrent && styles.pillTextCurrent,
                  status === 'mastered' && styles.pillTextMastered,
                  status === 'skipped' && styles.pillTextSkipped,
                ]}
              >
                {word.text}
              </Text>
              {status === 'mastered' && (
                <Ionicons name="checkmark" size={12} color={colors.primary} />
              )}
            </TouchableOpacity>
          )
        })}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
    gap: spacing.sm,
  },
  scroll: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    flexDirection: 'row',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.neutral,
    borderRadius: radius.full,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  pillCurrent: {
    backgroundColor: colors.primary,
  },
  pillMastered: {
    backgroundColor: colors.primaryLight,
    borderWidth: 1.5,
    borderColor: colors.primaryMid,
  },
  pillSkipped: {
    backgroundColor: colors.neutral,
  },
  pillText: {
    fontSize: fontSize.md,
    color: colors.textMuted,
    fontWeight: '600',
  },
  pillTextCurrent: {
    color: '#fff',
    fontWeight: '800',
  },
  pillTextMastered: {
    color: colors.primary,
  },
  pillTextSkipped: {
    color: colors.textHint,
    textDecorationLine: 'line-through',
  },
})
