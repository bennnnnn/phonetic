import { useEffect } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
} from 'react-native-reanimated'
import { Ionicons } from '@expo/vector-icons'
import { colors, spacing, radius, fontSize } from '@/lib/tokens'

export default function ConfirmEmailScreen() {
  const { email } = useLocalSearchParams<{ email?: string }>()

  const iconScale = useSharedValue(0)
  const contentY = useSharedValue(30)
  const contentOp = useSharedValue(0)
  const btnOp = useSharedValue(0)

  useEffect(() => {
    iconScale.value = withSpring(1, { damping: 8, stiffness: 120 })
    contentY.value = withDelay(200, withSpring(0, { damping: 14, stiffness: 120 }))
    contentOp.value = withDelay(200, withTiming(1, { duration: 300 }))
    btnOp.value = withDelay(600, withTiming(1, { duration: 250 }))
  }, [])

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value }],
  }))

  const contentStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: contentY.value }],
    opacity: contentOp.value,
  }))

  const btnStyle = useAnimatedStyle(() => ({
    opacity: btnOp.value,
  }))

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.center}>
        <Animated.View style={[styles.iconCircle, iconStyle]}>
          <Ionicons name="mail-outline" size={36} color={colors.primary} />
        </Animated.View>

        <Animated.View style={[styles.textWrap, contentStyle]}>
          <Text style={styles.headline}>Check your email</Text>
          <Text style={styles.body}>
            We sent a confirmation link to{' '}
            <Text style={styles.email}>{email || 'your email'}</Text>.
            {'\n\n'}
            Tap the link in the email to activate your account and get started.
          </Text>
        </Animated.View>

        <Animated.View style={btnStyle}>
          <TouchableOpacity
            style={styles.cta}
            onPress={() => router.replace('/(auth)/login')}
            activeOpacity={0.85}
          >
            <Text style={styles.ctaText}>Back to sign in</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    gap: spacing.xl,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrap: {
    alignItems: 'center',
    gap: spacing.md,
  },
  headline: {
    fontSize: fontSize.xxl,
    fontWeight: '600',
    color: colors.text,
    letterSpacing: -0.3,
  },
  body: {
    fontSize: fontSize.lg,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 24,
  },
  email: {
    color: colors.primary,
    fontWeight: '600',
  },
  cta: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    minWidth: 200,
  },
  ctaText: {
    color: '#fff',
    fontSize: fontSize.lg,
    fontWeight: '600',
  },
})
