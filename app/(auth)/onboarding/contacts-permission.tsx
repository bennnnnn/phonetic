import React from 'react'
import { StyleSheet, View, Text } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
} from 'react-native-reanimated'
import { router } from 'expo-router'
import * as Contacts from 'expo-contacts'
import PermissionScreen from '@/components/onboarding/PermissionScreen'
import { colors, spacing, radius, fontSize } from '@/lib/tokens'

export default function ContactsPermissionScreen() {
  const featuresOp = useSharedValue(0)

  const featuresStyle = useAnimatedStyle(() => ({
    opacity: featuresOp.value,
  }))

  React.useEffect(() => {
    featuresOp.value = withDelay(400, withTiming(1, { duration: 300 }))
  }, [])

  const handleEnable = async () => {
    await Contacts.requestPermissionsAsync()
    router.push('/(auth)/signup')
  }

  return (
    <PermissionScreen
      icon="👥"
      eyebrow="LEARN TOGETHER"
      headline="See how your friends are doing"
      body="Find friends who use PhonicsFlow and follow each other's progress. A little friendly competition makes learning stick."
      ctaLabel="Find my friends"
      dotsFilled={6}
      onEnable={handleEnable}
      onSkip={() => router.push('/(auth)/signup')}
    >
      {/* Extra features section unique to contacts */}
      <Animated.View style={[styles.featureCards, featuresStyle]}>
        <View style={styles.featureRow}>
          <Text style={styles.featureEmoji}>🏆</Text>
          <Text style={styles.featureText}>Compete on weekly leaderboards</Text>
        </View>
        <View style={styles.featureRow}>
          <Text style={styles.featureEmoji}>🔥</Text>
          <Text style={styles.featureText}>Compare streaks and XP</Text>
        </View>
        <View style={styles.featureRow}>
          <Text style={styles.featureEmoji}>👋</Text>
          <Text style={styles.featureText}>Cheer each other on</Text>
        </View>
      </Animated.View>
    </PermissionScreen>
  )
}

const styles = StyleSheet.create({
  featureCards: {
    gap: spacing.sm,
    backgroundColor: colors.primaryLight,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  featureEmoji: {
    fontSize: 18,
  },
  featureText: {
    fontSize: fontSize.md,
    color: colors.primaryDark,
    fontWeight: '500',
  },
})
