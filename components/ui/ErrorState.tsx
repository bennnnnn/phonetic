import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { colors, spacing, radius, fontSize } from '@/lib/tokens'

type Props = {
  message: string
  onRetry?: () => void
}

export default function ErrorState({ message, onRetry }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.message}>{message}</Text>
      {onRetry && (
        <TouchableOpacity style={styles.retryBtn} onPress={onRetry} activeOpacity={0.85}>
          <Text style={styles.retryText}>Try again</Text>
        </TouchableOpacity>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.md,
  },
  message: {
    color: colors.textMuted,
    fontSize: fontSize.md,
    textAlign: 'center',
  },
  retryBtn: {
    backgroundColor: colors.primaryLight,
    borderRadius: radius.full,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  retryText: {
    color: colors.primary,
    fontSize: fontSize.md,
    fontWeight: '700',
  },
})
