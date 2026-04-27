import { View, Text, StyleSheet } from 'react-native'
import { colors, spacing, fontSize, radius } from '@/lib/tokens'

type Props = {
  pattern: string  // e.g. "-ake"
  sound: string    // e.g. "/eɪk/"
  rule: string
}

export default function PatternHeader({ pattern, sound, rule }: Props) {
  // Split pattern: "-ake" → prefix "-" and suffix "ake"
  const dashIdx = pattern.indexOf('-')
  const patternText = dashIdx !== -1 ? pattern.slice(dashIdx + 1) : pattern

  return (
    <View style={styles.container}>
      <View style={styles.patternRow}>
        <Text style={styles.dash}>–</Text>
        <Text style={styles.pattern}>{patternText}</Text>
        <View style={styles.soundBadge}>
          <Text style={styles.soundText}>{sound}</Text>
        </View>
      </View>
      <Text style={styles.rule}>{rule}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.primaryLight,
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.sm,
  },
  patternRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  dash: {
    fontFamily: 'Georgia',
    fontSize: 36,
    color: colors.consonant,
  },
  pattern: {
    fontFamily: 'Georgia',
    fontSize: 48,
    color: colors.pattern,
    fontWeight: '700',
  },
  soundBadge: {
    backgroundColor: colors.surface,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginLeft: spacing.xs,
  },
  soundText: {
    color: colors.primary,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  rule: {
    color: colors.primaryDeep,
    fontSize: fontSize.md,
    textAlign: 'center',
    fontWeight: '500',
  },
})
