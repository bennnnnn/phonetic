import { Pressable, Text, StyleSheet, View } from 'react-native'
import { colors, spacing, radius, fontSize } from '@/lib/tokens'

type Props = {
  title: string
  onPress: () => void
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  icon?: React.ReactNode
  fullWidth?: boolean
}

export default function Button({ title, onPress, variant = 'primary', size = 'md', disabled, icon, fullWidth }: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        styles[`size_${size}` as keyof typeof styles],
        fullWidth && styles.fullWidth,
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
      ] as any}
    >
      {icon ? <View style={styles.iconWrap}>{icon}</View> : null}
      <Text style={[styles.text, styles[`text_${variant}` as keyof typeof styles], disabled && styles.textDisabled]}>
        {title}
      </Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm,
    borderRadius: radius.md,
  },

  // Variants
  primary:   { backgroundColor: colors.primary },
  secondary: { backgroundColor: colors.neutral },
  ghost:     { backgroundColor: 'transparent' },
  danger:    { backgroundColor: colors.error },

  // Sizes
  size_sm: { paddingVertical: spacing.sm, paddingHorizontal: spacing.md },
  size_md: { paddingVertical: spacing.md, paddingHorizontal: spacing.lg },
  size_lg: { paddingVertical: 14, paddingHorizontal: spacing.xl },

  fullWidth: { flex: 1 },

  pressed: { opacity: 0.85 },
  disabled: { opacity: 0.4 },

  iconWrap: { marginRight: 2 },

  text: { fontWeight: '700' },
  text_primary:   { color: '#fff' },
  text_secondary: { color: colors.text },
  text_ghost:     { color: colors.primary },
  text_danger:    { color: '#fff' },
  textDisabled:   { color: colors.textMuted },
})
