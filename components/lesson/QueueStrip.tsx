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
  const remaining = words.filter(
    (w) => w.id !== currentId && !masteredIds.includes(w.id) && !skippedIds.includes(w.id)
  ).length

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        up next — {remaining} remaining
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
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
  label: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    paddingHorizontal: spacing.lg,
  },
  scroll: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    flexDirection: 'row',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.neutral,
    borderRadius: radius.full,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  pillCurrent: {
    backgroundColor: colors.primary,
  },
  pillMastered: {
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: colors.primaryMid,
  },
  pillSkipped: {
    backgroundColor: colors.neutral,
  },
  pillText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    fontWeight: '500',
  },
  pillTextCurrent: {
    color: '#fff',
    fontWeight: '700',
  },
  pillTextMastered: {
    color: colors.primary,
  },
  pillTextSkipped: {
    color: colors.textHint,
    textDecorationLine: 'line-through',
  },
})
