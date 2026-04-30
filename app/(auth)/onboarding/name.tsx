import React, { useEffect, useRef, useState } from 'react'
import {
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  withSequence,
  runOnJS,
} from 'react-native-reanimated'
import { router } from 'expo-router'
import { colors, spacing, radius, fontSize } from '@/lib/tokens'
import { OnboardingProgressDots } from '@/components/onboarding/ProgressDots'
import { useOnboardingStore } from '@/store/onboardingStore'
import { soundEngine } from '@/lib/sounds'
import { haptics } from '@/lib/haptics'

const SCREEN_WIDTH = Dimensions.get('window').width

function navigate() {
  router.push('/(auth)/onboarding/notifications-permission')
}

export default function NameScreen() {
  const { displayName, setDisplayName } = useOnboardingStore()
  const [containerWidth, setContainerWidth] = useState(SCREEN_WIDTH)
  const prevNameRef = useRef(displayName)

  // Avatar
  const avatarScale = useSharedValue(0)
  const initialScale = useSharedValue(1)

  // Greeting
  const greetingScale = useSharedValue(1)

  // Input section
  const inputOpacity = useSharedValue(0)
  const inputY = useSharedValue(20)

  // "Let's go" button expand
  const btnScale = useSharedValue(1)
  const btnOpacity = useSharedValue(1)
  const overlayScale = useSharedValue(0)
  const overlayOpacity = useSharedValue(0)

  useEffect(() => {
    avatarScale.value = withSpring(1, { damping: 8, stiffness: 120 })
    inputOpacity.value = withDelay(300, withTiming(1, { duration: 300 }))
    inputY.value = withDelay(300, withTiming(0, { duration: 300 }))
  }, [])

  useEffect(() => {
    if (prevNameRef.current === displayName) return
    prevNameRef.current = displayName

    // Avatar initial bounces on every keystroke
    initialScale.value = withSequence(
      withSpring(0.8, { damping: 6, stiffness: 300 }),
      withSpring(1, { damping: 8, stiffness: 200 })
    )

    // Greeting pulses scale
    greetingScale.value = withSequence(
      withSpring(0.95, { damping: 8, stiffness: 300 }),
      withSpring(1, { damping: 10, stiffness: 200 })
    )
  }, [displayName])

  const handleLetsGo = () => {
    Keyboard.dismiss()
    soundEngine.play('levelUp')
    haptics.celebrate()

    // Button scales up to fill the screen, creating the expand-to-fill effect
    btnScale.value = withSpring(30, { damping: 14, stiffness: 60 })
    btnOpacity.value = withTiming(0, { duration: 150 })

    overlayOpacity.value = withTiming(1, { duration: 100 })
    overlayScale.value = withSpring(30, { damping: 12, stiffness: 60 })

    setTimeout(() => {
      runOnJS(navigate)()
    }, 400)
  }

  const avatarStyle = useAnimatedStyle(() => ({
    transform: [{ scale: avatarScale.value }],
  }))

  const initialStyle = useAnimatedStyle(() => ({
    transform: [{ scale: initialScale.value }],
  }))

  const greetingStyle = useAnimatedStyle(() => ({
    transform: [{ scale: greetingScale.value }],
  }))

  const inputSectionStyle = useAnimatedStyle(() => ({
    opacity: inputOpacity.value,
    transform: [{ translateY: inputY.value }],
  }))

  const btnStyle = useAnimatedStyle(() => ({
    transform: [{ scale: btnScale.value }],
    opacity: btnOpacity.value,
  }))

  const overlayStyle = useAnimatedStyle(() => ({
    transform: [{ scale: overlayScale.value }],
    opacity: overlayOpacity.value,
  }))

  const initial = displayName.trim().charAt(0).toUpperCase() || '?'
  const ctaLabel = displayName.trim()
    ? `let's go, ${displayName.trim()}!`
    : `let's go`

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Full-screen teal overlay that expands on tap */}
        <Animated.View
          pointerEvents="none"
          style={[styles.expandOverlay, overlayStyle]}
        />

        <View style={styles.hero}>
          <Animated.View style={[styles.avatar, avatarStyle]}>
            <Animated.Text style={[styles.avatarInitial, initialStyle]}>
              {initial}
            </Animated.Text>
          </Animated.View>

          <Animated.View style={greetingStyle}>
            <Text style={styles.greeting}>
              Hey,{' '}
              <Text style={styles.greetingName}>
                {displayName.trim() || 'friend'}
              </Text>
              !
            </Text>
            <Text style={styles.tagline}>ready to crack the code?</Text>
          </Animated.View>
        </View>

        <Animated.View
          style={[styles.bottom, inputSectionStyle]}
          onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
        >
          <Text style={styles.eyebrow}>ALMOST THERE</Text>
          <Text style={styles.headline}>What should we call you?</Text>

          <TextInput
            style={styles.input}
            placeholder="your name"
            placeholderTextColor={colors.textHint}
            value={displayName}
            onChangeText={setDisplayName}
            autoCapitalize="words"
            autoCorrect={false}
            returnKeyType="done"
            onSubmitEditing={handleLetsGo}
            maxLength={32}
          />

          <Text style={styles.helper}>
            We'll use this to personalise your experience.
          </Text>

          <View style={styles.dotsRow}>
            <OnboardingProgressDots filled={4} />
          </View>

          <View style={styles.ctaWrap}>
            <Animated.View style={[styles.ctaAnim, btnStyle]}>
              <Pressable style={styles.cta} onPress={handleLetsGo}>
                <Text style={styles.ctaText}>{ctaLabel}</Text>
              </Pressable>
            </Animated.View>
          </View>

          <Text style={styles.subText}>takes 10 seconds to sign up</Text>
        </Animated.View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  flex: {
    flex: 1,
  },
  expandOverlay: {
    position: 'absolute',
    // Centered so it expands outward evenly
    alignSelf: 'center',
    bottom: 80,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    zIndex: 100,
  },
  hero: {
    backgroundColor: colors.primary,
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
    color: colors.primary,
  },
  greeting: {
    fontSize: fontSize.xxl,
    fontWeight: '600',
    color: colors.surface,
    textAlign: 'center',
  },
  greetingName: {
    color: '#9FE1CB',
  },
  tagline: {
    fontSize: fontSize.md,
    color: '#9FE1CB',
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  bottom: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    gap: spacing.md,
  },
  eyebrow: {
    fontSize: fontSize.sm,
    color: colors.primary,
    letterSpacing: 0.8,
    fontWeight: '600',
  },
  headline: {
    fontSize: fontSize.xxl,
    fontWeight: '500',
    color: colors.text,
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#9FE1CB',
    borderRadius: 14,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.surface,
  },
  helper: {
    fontSize: fontSize.md,
    color: colors.textMuted,
    marginTop: -spacing.xs,
  },
  dotsRow: {
    alignItems: 'flex-start',
  },
  ctaWrap: {
    // Contains the button at its natural size; overflow hidden so scale-expand is clipped to screen edges
    overflow: 'hidden',
    borderRadius: 14,
  },
  ctaAnim: {
    // The animated wrapper that scales up
  },
  cta: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  ctaText: {
    color: colors.surface,
    fontSize: fontSize.lg,
    fontWeight: '600',
  },
  subText: {
    fontSize: fontSize.md,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: -spacing.xs,
  },
})
