import { View, Text, StyleSheet } from 'react-native'
import { colors, spacing, fontSize } from '@/lib/tokens'

type Props = {
  message: string
  subtitle?: string
}

export default function EmptyState({ message, subtitle }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.message}>{message}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.sm,
  },
  message: {
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: '500',
    textAlign: 'center',
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: fontSize.md,
    textAlign: 'center',
  },
})
