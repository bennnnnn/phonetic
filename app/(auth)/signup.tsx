import { useState, useRef, useEffect, useCallback } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  LayoutAnimation,
  UIManager,
} from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  runOnJS,
} from 'react-native-reanimated'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { useOnboardingStore } from '@/store/onboardingStore'
import { pushNotification } from '@/lib/notifications'
import { friendlyEmailAuthMessage } from '@/lib/authErrors'
import { haptics } from '@/lib/haptics'
import { colors, spacing, radius, fontSize } from '@/lib/tokens'

// Enable LayoutAnimation on Android
if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true)
}

export default function SignupScreen() {
  const { setSession } = useAuthStore()
  const { displayName, dailyGoal } = useOnboardingStore()
  const { ref: referralRef } = useLocalSearchParams<{ ref?: string }>()

  const [emailExpanded, setEmailExpanded] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const emailRef = useRef<TextInput>(null)
  const passwordRef = useRef<TextInput>(null)

  // ── Entrance animations ──────────────────────────────────────────────
  const heroY = useSharedValue(-30)
  const heroOp = useSharedValue(0)

  const contentY = useSharedValue(30)
  const contentOp = useSharedValue(0)

  const googleY = useSharedValue(20)
  const googleOp = useSharedValue(0)

  const emailBtnY = useSharedValue(20)
  const emailBtnOp = useSharedValue(0)

  const bottomOp = useSharedValue(0)

  useEffect(() => {
    // Hero drops in
    heroY.value = withSpring(0, { damping: 14, stiffness: 100 })
    heroOp.value = withTiming(1, { duration: 300 })

    // Content slides up
    contentY.value = withDelay(150, withSpring(0, { damping: 16, stiffness: 120 }))
    contentOp.value = withDelay(150, withTiming(1, { duration: 300 }))

    // Buttons stagger in
    googleY.value = withDelay(300, withSpring(0, { damping: 14, stiffness: 130 }))
    googleOp.value = withDelay(300, withTiming(1, { duration: 250 }))

    emailBtnY.value = withDelay(380, withSpring(0, { damping: 14, stiffness: 130 }))
    emailBtnOp.value = withDelay(380, withTiming(1, { duration: 250 }))

    // Bottom links fade in last
    bottomOp.value = withDelay(500, withTiming(1, { duration: 300 }))
  }, [])

  const heroStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: heroY.value }],
    opacity: heroOp.value,
  }))

  const contentStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: contentY.value }],
    opacity: contentOp.value,
  }))

  const googleStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: googleY.value }],
    opacity: googleOp.value,
  }))

  const emailBtnStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: emailBtnY.value }],
    opacity: emailBtnOp.value,
  }))

  const bottomStyle = useAnimatedStyle(() => ({
    opacity: bottomOp.value,
  }))

  // ── Email expansion ──────────────────────────────────────────────────
  const handleEmailExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    setEmailExpanded(true)
    haptics.tap()
    setTimeout(() => emailRef.current?.focus(), 350)
  }

  const handleGoogle = () => {
    haptics.tap()
    // Google OAuth will be wired in a future update
  }

  // ── Signup ───────────────────────────────────────────────────────────
  const handleSignup = async () => {
    KeyboardAvoidingView
    const trimmedEmail = email.trim()
    const trimmedPassword = password

    if (!trimmedEmail || !trimmedEmail.includes('@') || !trimmedEmail.includes('.')) {
      setError('Please enter a valid email address.')
      return
    }
    if (trimmedPassword.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    setError(null)
    setLoading(true)

    try {
      const { data, error: signupErr } = await supabase.auth.signUp({
        email: trimmedEmail,
        password: trimmedPassword,
        options: {
          data: { display_name: displayName.trim() || 'Learner' },
        },
      })

      if (signupErr) throw signupErr
      if (!data.user) throw new Error('Signup failed')

      // Create user profile with onboarding data
      await supabase.from('user_profiles').upsert(
        {
          id: data.user.id,
          display_name: displayName.trim() || 'Learner',
          daily_goal: dailyGoal,
        },
        { onConflict: 'id' }
      )

      // If user arrived via an invite link, create the friendship
      if (referralRef) {
        try {
          const { data: referrer } = await supabase
            .from('user_profiles')
            .select('id')
            .eq('referral_code', referralRef)
            .maybeSingle()
          if (referrer) {
            await supabase.from('friendships').upsert(
              {
                referrer_id: referrer.id,
                referred_id: data.user.id,
              },
              { onConflict: 'referrer_id,referred_id' },
            )

            // Increment referrer's referral count and grant free months
            const REFERRALS_PER_MONTH = 10
            const { data: rewards } = await supabase
              .from('referral_rewards')
              .select('referral_count, free_months')
              .eq('user_id', referrer.id)
              .maybeSingle()

            let newCount = 0
            if (rewards) {
              const r = rewards as { referral_count: number; free_months: number }
              newCount = r.referral_count + 1
              const newFreeMonths = Math.floor(newCount / REFERRALS_PER_MONTH)
              await supabase.from('referral_rewards').update({
                referral_count: newCount,
                free_months: newFreeMonths,
                updated_at: new Date().toISOString(),
              }).eq('user_id', referrer.id)
            } else {
              const newFreeMonths = Math.floor(1 / REFERRALS_PER_MONTH)
              await supabase.from('referral_rewards').insert({
                user_id: referrer.id,
                referral_count: 1,
                free_months: newFreeMonths,
              })
            }

            // Notify referrer that a friend joined
            try {
              const displayName = (data?.user?.user_metadata?.display_name as string) || 'Someone'
              await pushNotification({
                userId: referrer.id,
                type: 'friend_joined',
                title: `${displayName} joined PhonicsFlow!`,
                body: 'They used your invite link — check your Friends tab.',
                emoji: '🤝',
                linkRoute: '/(tabs)/friends',
              })
              // Notify after 10 referrals milestone
              if (newCount > 0 && newCount % 10 === 0) {
                await pushNotification({
                  userId: referrer.id,
                  type: 'referral_milestone',
                  title: `You've referred ${newCount} friends! 🎉`,
                  body: `You earned 1 free month of Pro. Check your Profile.`,
                  emoji: '🎉',
                  linkRoute: '/(tabs)/profile',
                })
              }
            } catch {}
          }
        } catch {
          // Silent fail — referral is best-effort
        }
      }

      if (data.session) {
        setSession(data.session)
        router.replace('/(tabs)/home')
      }
    } catch (err) {
      setError(friendlyEmailAuthMessage(err, 'Signup failed. Please try again.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ── Teal hero ──────────────────────────────────────────── */}
          <Animated.View style={[styles.hero, heroStyle]}>
            <View style={styles.heroLogoCard}>
              <Text style={styles.heroLogoText}>Pf</Text>
            </View>
            <Text style={styles.heroAppName}>PhonicsFlow</Text>
            <Text style={styles.heroTagline}>free to start · no credit card</Text>
          </Animated.View>

          {/* ── Content area ────────────────────────────────────────── */}
          <Animated.View style={[styles.content, contentStyle]}>
            <Text style={styles.headline}>Create your account</Text>
            <Text style={styles.sub}>Join in seconds.</Text>

            {/* Error banner */}
            {error ? (
              <Animated.View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </Animated.View>
            ) : null}

            {/* Google button — PRIMARY (on top, more prominent) */}
            {/* Google button — disabled/coming-soon state */}
            <Animated.View style={googleStyle}>
              <TouchableOpacity
                style={[styles.googleBtn, { opacity: 0.5 }]}
                disabled
              >
                <View style={styles.googleIcon}>
                  <Text style={styles.googleG}>G</Text>
                </View>
                <Text style={[styles.googleLabel, { color: colors.textMuted }]}>Continue with Google — coming soon</Text>
              </TouchableOpacity>
            </Animated.View>

            {/* Divider */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Email button — SECONDARY, expands inline */}
            <Animated.View style={emailBtnStyle}>
              <TouchableOpacity
                style={[
                  styles.emailBtn,
                  emailExpanded && styles.emailBtnExpanded,
                ]}
                onPress={emailExpanded ? undefined : handleEmailExpand}
                activeOpacity={emailExpanded ? 1 : 0.85}
              >
                {emailExpanded ? (
                  <View style={styles.emailForm}>
                    {/* Email field */}
                    <TextInput
                      ref={emailRef}
                      style={styles.input}
                      value={email}
                      onChangeText={(v) => { setEmail(v); setError(null) }}
                      placeholder="you@example.com"
                      placeholderTextColor={colors.textHint}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoComplete="email"
                      returnKeyType="next"
                      onSubmitEditing={() => passwordRef.current?.focus()}
                    />

                    {/* Password field */}
                    <View style={styles.passwordWrap}>
                      <TextInput
                        ref={passwordRef}
                        style={[styles.input, styles.passwordInput]}
                        value={password}
                        onChangeText={(v) => { setPassword(v); setError(null) }}
                        placeholder="Password (min. 6 characters)"
                        placeholderTextColor={colors.textHint}
                        secureTextEntry={!showPassword}
                        autoComplete="new-password"
                        returnKeyType="done"
                        onSubmitEditing={handleSignup}
                      />
                      <TouchableOpacity
                        onPress={() => setShowPassword((v) => !v)}
                        style={styles.showBtn}
                        hitSlop={8}
                      >
                        <Ionicons
                          name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                          size={20}
                          color={colors.textMuted}
                        />
                      </TouchableOpacity>
                    </View>

                    {/* Sign up button */}
                    <TouchableOpacity
                      style={[styles.primaryBtn, loading && styles.disabled]}
                      onPress={handleSignup}
                      disabled={loading}
                      activeOpacity={0.85}
                    >
                      {loading ? (
                        <ActivityIndicator color="#fff" />
                      ) : (
                        <Text style={styles.primaryBtnText}>Create account</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                ) : (
                  <Text style={styles.emailBtnLabel}>Continue with email</Text>
                )}
              </TouchableOpacity>
            </Animated.View>

            {/* Sign in link */}
            <Animated.View style={bottomStyle}>
              <TouchableOpacity
                onPress={() => router.replace('/(auth)/login')}
                style={styles.signInRow}
              >
                <Text style={styles.signInText}>
                  already have an account?{' '}
                  <Text style={styles.signInLink}>sign in</Text>
                </Text>
              </TouchableOpacity>

              {/* Terms */}
              <Text style={styles.terms}>
                By signing up you agree to our{' '}
                <Text
                  style={styles.termsLink}
                  onPress={() => router.push('/(auth)/terms')}
                >
                  Terms
                </Text>{' '}
                and{' '}
                <Text
                  style={styles.termsLink}
                  onPress={() => router.push('/(auth)/privacy')}
                >
                  Privacy Policy
                </Text>
              </Text>
            </Animated.View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

// ── Styles ──────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  flex: { flex: 1 },
  scroll: { flexGrow: 1 },

  // Hero
  hero: {
    backgroundColor: colors.primary,
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  heroLogoCard: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  heroLogoText: {
    fontFamily: 'Georgia',
    fontSize: 18,
    fontWeight: '500',
    color: colors.primary,
  },
  heroAppName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: -0.3,
  },
  heroTagline: {
    color: '#9FE1CB',
    fontSize: fontSize.sm,
  },

  // Content
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
    gap: spacing.md,
  },
  headline: {
    fontSize: 22,
    fontWeight: '600',
    color: colors.text,
    letterSpacing: -0.3,
  },
  sub: {
    fontSize: fontSize.md,
    color: colors.textMuted,
    marginTop: -spacing.sm,
  },

  // Error
  errorBox: {
    backgroundColor: colors.errorLight,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  errorText: { color: colors.error, fontSize: fontSize.md },

  // Google button — PRIMARY
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 14,
    paddingVertical: 15,
    paddingHorizontal: 15,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  googleIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleG: {
    fontSize: 13,
    fontWeight: '600',
    color: '#D85A30',
  },
  googleLabel: {
    fontSize: fontSize.lg,
    fontWeight: '500',
    color: colors.text,
  },

  // Divider
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginVertical: 2,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.border },
  dividerText: { fontSize: fontSize.sm, color: colors.textHint },

  // Email button — SECONDARY, expands inline
  emailBtn: {
    backgroundColor: colors.primaryLight,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
  },
  emailBtnExpanded: {
    backgroundColor: colors.surface,
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
  emailBtnLabel: {
    color: colors.primary,
    fontSize: fontSize.lg,
    fontWeight: '600',
  },
  emailForm: {
    padding: spacing.md,
    gap: spacing.sm,
    width: '100%',
  },

  // Inputs
  input: {
    borderWidth: 1.5,
    borderColor: colors.borderLight,
    borderRadius: 12,
    paddingVertical: 13,
    paddingHorizontal: 14,
    fontSize: fontSize.lg,
    color: colors.text,
    backgroundColor: colors.surface,
  },
  passwordWrap: { position: 'relative' },
  passwordInput: { paddingRight: 44 },
  showBtn: {
    position: 'absolute',
    right: 14,
    top: 14,
  },

  // Primary button (Create account)
  primaryBtn: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: fontSize.lg,
    fontWeight: '600',
  },
  disabled: { opacity: 0.6 },

  // Sign in + terms
  signInRow: {
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  signInText: {
    fontSize: fontSize.md,
    color: colors.textMuted,
  },
  signInLink: {
    color: colors.primary,
    fontWeight: '600',
  },
  terms: {
    textAlign: 'center',
    color: colors.textHint,
    fontSize: 10,
    lineHeight: 16,
    marginTop: spacing.xs,
  },
  termsLink: {
    color: colors.textMuted,
    textDecorationLine: 'underline',
  },
})
