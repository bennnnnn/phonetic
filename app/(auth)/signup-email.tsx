/**
 * Email signup wizard — 3 steps that slide in/out like Duolingo.
 *
 * Step 0 · Name     👋  "Last thing — what's your first name?"
 * Step 1 · Email    ✉️  "What's your email address?"
 * Step 2 · Password 🔒  "Create a strong password"
 *
 * Features:
 *  – Horizontal slide transition between steps (forward = slide left, back = slide right)
 *  – Progress bar at top animates (1/3 → 2/3 → 3/3)
 *  – Each step's emoji bounces in fresh after transition
 *  – Step 2: live avatar (colored circle with initial) appears as you type
 *  – Step 2: personalized greeting "Nice to meet you, {name}! 🎉" fades in
 */
import React, { useState, useRef, useEffect, forwardRef } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator, Dimensions, ScrollView,
} from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import Animated, {
  useSharedValue, useAnimatedStyle,
  withSpring, withTiming, withDelay, withSequence,
  runOnJS,
} from 'react-native-reanimated'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { useOnboardingStore } from '@/store/onboardingStore'
import { pushNotification } from '@/lib/notifications'
import { friendlyEmailAuthMessage } from '@/lib/authErrors'
import { haptics } from '@/lib/haptics'
import { colors, spacing, radius, fontSize } from '@/lib/tokens'

const { width: SCREEN_W } = Dimensions.get('window')

const TOTAL_STEPS = 3

// ─── Avatar palette (picked by first letter's char code) ────────────────────

const AVATAR_COLORS = [
  colors.primary,
  colors.accent,
  colors.amber,
  '#7B61FF',
  '#FF6B6B',
  '#4ECDC4',
]

function avatarColor(name: string) {
  if (!name) return colors.border
  return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length]
}

// ─── Progress bar ────────────────────────────────────────────────────────────

function ProgressBar({ step }: { step: number }) {
  const progress = useSharedValue(step / TOTAL_STEPS)
  useEffect(() => {
    progress.value = withTiming((step + 1) / TOTAL_STEPS, { duration: 450 })
  }, [step])
  const fill = useAnimatedStyle(() => ({ flex: progress.value }))
  const gap  = useAnimatedStyle(() => ({ flex: Math.max(1 - progress.value, 0) }))
  return (
    <View style={pb.track}>
      <Animated.View style={[pb.fill, fill]} />
      <Animated.View style={[pb.gap,  gap ]} />
    </View>
  )
}
const pb = StyleSheet.create({
  track: { flex: 1, height: 8, borderRadius: 999, backgroundColor: colors.primaryLight, flexDirection: 'row', overflow: 'hidden' },
  fill:  { backgroundColor: colors.primary },
  gap:   { backgroundColor: 'transparent' },
})

// ─── Bouncing emoji illustration ─────────────────────────────────────────────

function Illustration({ emoji }: { emoji: string }) {
  const scale = useSharedValue(0.3)
  const op    = useSharedValue(0)
  const ty    = useSharedValue(20)

  useEffect(() => {
    scale.value = withSpring(1, { damping: 10, stiffness: 200 })
    op.value    = withTiming(1, { duration: 200 })
    ty.value    = withSpring(0, { damping: 14, stiffness: 180 })
  }, [])

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateY: ty.value }],
    opacity: op.value,
  }))

  return (
    <Animated.View style={[il.wrap, style]}>
      <Text style={il.emoji}>{emoji}</Text>
    </Animated.View>
  )
}
const il = StyleSheet.create({
  wrap:  { alignItems: 'center', marginBottom: spacing.sm },
  emoji: { fontSize: 72 },
})

// ─── Live avatar (name step) ─────────────────────────────────────────────────

function LiveAvatar({ name }: { name: string }) {
  const hasName  = name.trim().length > 0
  const initial  = hasName ? name.trim()[0].toUpperCase() : ''
  const bgColor  = avatarColor(name.trim())

  const scale    = useSharedValue(hasName ? 1 : 0.85)
  const bgAnim   = useSharedValue(hasName ? 1 : 0)

  useEffect(() => {
    if (hasName) {
      scale.value  = withSequence(
        withSpring(1.15, { damping: 8, stiffness: 300 }),
        withSpring(1,    { damping: 12, stiffness: 200 }),
      )
      bgAnim.value = withTiming(1, { duration: 200 })
    } else {
      bgAnim.value = withTiming(0, { duration: 200 })
    }
  }, [initial])

  const circleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  return (
    <Animated.View style={[av.circle, { backgroundColor: hasName ? bgColor : colors.neutral }, circleStyle]}>
      {hasName
        ? <Text style={av.initial}>{initial}</Text>
        : <Text style={av.wave}>👋</Text>
      }
    </Animated.View>
  )
}
const av = StyleSheet.create({
  circle:  { width: 84, height: 84, borderRadius: 42, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm },
  initial: { fontSize: 38, fontWeight: '700', color: '#fff' },
  wave:    { fontSize: 42 },
})

// ─── Greeting text (name step) ───────────────────────────────────────────────

function Greeting({ name }: { name: string }) {
  const firstName = name.trim().split(' ')[0]
  const visible   = firstName.length > 1

  const op = useSharedValue(0)
  const ty = useSharedValue(8)

  useEffect(() => {
    if (visible) {
      op.value = withTiming(1, { duration: 250 })
      ty.value = withSpring(0, { damping: 18, stiffness: 200 })
    } else {
      op.value = withTiming(0, { duration: 180 })
      ty.value = withTiming(8, { duration: 180 })
    }
  }, [visible])

  const style = useAnimatedStyle(() => ({ opacity: op.value, transform: [{ translateY: ty.value }] }))

  return (
    <Animated.Text style={[gr.text, style]}>
      Nice to meet you, {firstName}! 🎉
    </Animated.Text>
  )
}
const gr = StyleSheet.create({
  text: { textAlign: 'center', fontSize: fontSize.md, color: colors.primary, fontWeight: '600', marginTop: spacing.xs },
})

// ─── Shared input ─────────────────────────────────────────────────────────────

const StyledInput = forwardRef<TextInput, React.ComponentProps<typeof TextInput> & { label?: string }>(
  function StyledInput(props, ref) {
  const { label, ...rest } = props
  const focused = useSharedValue(0)
  const borderStyle = useAnimatedStyle(() => ({
    borderColor: focused.value === 1 ? colors.primary : colors.border,
    borderWidth: focused.value === 1 ? 2 : 1.5,
  }))
  return (
    <View>
      {label ? <Text style={inp.label}>{label}</Text> : null}
      <Animated.View style={[inp.wrap, borderStyle]}>
        <TextInput
          ref={ref}
          style={inp.field}
          placeholderTextColor={colors.textHint}
          onFocus={() => { focused.value = withTiming(1, { duration: 150 }) }}
          onBlur={()  => { focused.value = withTiming(0, { duration: 150 }) }}
          {...rest}
        />
      </Animated.View>
    </View>
  )
})
const inp = StyleSheet.create({
  label: { fontSize: fontSize.sm, fontWeight: '600', color: colors.textMuted, marginBottom: spacing.xs, marginLeft: 2 },
  wrap:  { borderRadius: 14, backgroundColor: colors.surface, overflow: 'hidden' },
  field: { paddingVertical: 16, paddingHorizontal: 16, fontSize: fontSize.lg, color: colors.text },
})

// ─── Next / Submit button ─────────────────────────────────────────────────────

function ActionBtn({ label, enabled, loading, onPress }: {
  label: string; enabled: boolean; loading?: boolean; onPress: () => void
}) {
  const scale = useSharedValue(1)
  const op    = useSharedValue(enabled ? 1 : 0.45)
  useEffect(() => {
    op.value    = withTiming(enabled ? 1 : 0.45, { duration: 200 })
    scale.value = withSpring(enabled ? 1 : 0.97,  { damping: 12, stiffness: 200 })
  }, [enabled])
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }], opacity: op.value }))

  return (
    <Animated.View style={style}>
      <TouchableOpacity
        style={[ab.btn, enabled ? ab.active : ab.inactive]}
        onPress={onPress}
        disabled={!enabled || loading}
        activeOpacity={0.85}
      >
        {loading
          ? <ActivityIndicator color="#fff" />
          : <Text style={ab.label}>{label}</Text>
        }
      </TouchableOpacity>
    </Animated.View>
  )
}
const ab = StyleSheet.create({
  btn:     { borderRadius: 16, paddingVertical: 18, alignItems: 'center' },
  active:  { backgroundColor: colors.primary },
  inactive:{ backgroundColor: colors.border },
  label:   { color: '#fff', fontSize: fontSize.lg, fontWeight: '700', letterSpacing: 0.5 },
})

// ─── Error banner ────────────────────────────────────────────────────────────

function ErrorBanner({ message }: { message: string | null }) {
  const op = useSharedValue(0)
  const ty = useSharedValue(-8)
  useEffect(() => {
    if (message) {
      op.value = withTiming(1, { duration: 200 })
      ty.value = withSpring(0, { damping: 18, stiffness: 200 })
    } else {
      op.value = withTiming(0, { duration: 150 })
    }
  }, [message])
  const style = useAnimatedStyle(() => ({ opacity: op.value, transform: [{ translateY: ty.value }] }))
  if (!message) return null
  return (
    <Animated.View style={[eb.box, style]}>
      <Text style={eb.text}>⚠️  {message}</Text>
    </Animated.View>
  )
}
const eb = StyleSheet.create({
  box:  { backgroundColor: colors.errorLight, borderRadius: radius.md, padding: spacing.md },
  text: { color: colors.error, fontSize: fontSize.sm, lineHeight: 20 },
})

// ─── STEP CONTENT ─────────────────────────────────────────────────────────────

// Step 1 — Email
function EmailStep({
  value, onChange, onNext, error, clearError, name,
}: {
  value: string; onChange: (v: string) => void; onNext: () => void; error: string | null; clearError: () => void; name: string
}) {
  const inputRef = useRef<TextInput>(null)
  useEffect(() => { setTimeout(() => inputRef.current?.focus(), 300) }, [])

  const firstName = name.trim().split(' ')[0]
  const valid = value.trim().includes('@') && value.trim().includes('.')

  return (
    <View style={step.root}>
      <Text style={step.question}>{firstName}, what's your email?</Text>
      <Text style={step.hint}>We'll keep it private — no spam, ever.</Text>

      <ErrorBanner message={error} />

      <StyledInput
        ref={inputRef}
        value={value}
        onChangeText={(v) => { onChange(v); clearError() }}
        placeholder="you@example.com"
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        returnKeyType="next"
        onSubmitEditing={valid ? onNext : undefined}
      />

      <ActionBtn label="NEXT →" enabled={valid} onPress={onNext} />
    </View>
  )
}

// Step 2 — Password
function PasswordStep({
  value, onChange, onSubmit, loading, error, clearError,
}: {
  value: string; onChange: (v: string) => void; onSubmit: () => void; loading: boolean; error: string | null; clearError: () => void
}) {
  const inputRef = useRef<TextInput>(null)
  const [show, setShow] = useState(false)
  useEffect(() => { setTimeout(() => inputRef.current?.focus(), 300) }, [])

  const valid = value.length >= 6

  const strength = value.length === 0 ? null
    : value.length < 6  ? 'weak'
    : value.length < 10 ? 'ok'
    : 'strong'

  const strengthColor = strength === 'strong' ? colors.primary : strength === 'ok' ? colors.amber : colors.error
  const strengthLabel = strength === 'strong' ? 'Strong 💪' : strength === 'ok' ? 'Good 👍' : 'Too short'

  return (
    <View style={step.root}>
      <Text style={step.question}>Create a password</Text>

      <ErrorBanner message={error} />

      <View>
        <View style={pw.inputWrap}>
          <StyledInput
            ref={inputRef}
            value={value}
            onChangeText={(v) => { onChange(v); clearError() }}
            placeholder="Min. 6 characters"
            secureTextEntry={!show}
            autoComplete="new-password"
            returnKeyType="done"
            onSubmitEditing={valid ? onSubmit : undefined}
          />
          <TouchableOpacity onPress={() => setShow((s) => !s)} style={pw.eye} hitSlop={10}>
            <Ionicons name={show ? 'eye-off-outline' : 'eye-outline'} size={22} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        {strength && (
          <View style={pw.strengthRow}>
            <View style={pw.strengthTrack}>
              <View style={[
                pw.strengthFill,
                {
                  width: strength === 'strong' ? '100%' : strength === 'ok' ? '60%' : '25%',
                  backgroundColor: strengthColor,
                },
              ]} />
            </View>
            <Text style={[pw.strengthLabel, { color: strengthColor }]}>{strengthLabel}</Text>
          </View>
        )}
      </View>

      <ActionBtn label="LET'S GO 🚀" enabled={valid} loading={loading} onPress={onSubmit} />
    </View>
  )
}
const pw = StyleSheet.create({
  inputWrap:    { position: 'relative' },
  eye:          { position: 'absolute', right: 14, top: 15 },
  strengthRow:  { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.sm },
  strengthTrack:{ flex: 1, height: 4, borderRadius: 999, backgroundColor: colors.neutral, overflow: 'hidden' },
  strengthFill: { height: '100%', borderRadius: 999 },
  strengthLabel:{ fontSize: fontSize.sm, fontWeight: '600', width: 80, textAlign: 'right' },
})

// Step 0 — Name
function NameStep({
  value, onChange, onNext, error, clearError,
}: {
  value: string; onChange: (v: string) => void; onNext: () => void; error: string | null; clearError: () => void
}) {
  const inputRef = useRef<TextInput>(null)
  useEffect(() => { setTimeout(() => inputRef.current?.focus(), 300) }, [])

  const valid = value.trim().length >= 1

  return (
    <View style={step.root}>
      <Text style={step.question}>What's your first name?</Text>

      <ErrorBanner message={error} />

      <StyledInput
        ref={inputRef}
        value={value}
        onChangeText={(v) => { onChange(v); clearError() }}
        placeholder="Your first name"
        autoCapitalize="words"
        autoCorrect={false}
        returnKeyType="next"
        maxLength={32}
        onSubmitEditing={valid ? onNext : undefined}
      />

      <Greeting name={value} />

      <ActionBtn label="NEXT →" enabled={valid} onPress={onNext} />
    </View>
  )
}

const step = StyleSheet.create({
  root:     { flex: 1, gap: spacing.md, alignItems: 'stretch' },
  question: { fontSize: 26, fontWeight: '700', color: colors.text, textAlign: 'center', lineHeight: 34 },
  hint:     { fontSize: fontSize.md, color: colors.textMuted, textAlign: 'center', lineHeight: 22, marginTop: -spacing.xs },
})

// ─── MAIN SCREEN ──────────────────────────────────────────────────────────────

export default function SignupEmailScreen() {
  const insets = useSafeAreaInsets()
  const { setSession } = useAuthStore()
  const { dailyGoal }  = useOnboardingStore()
  const referralRef    = useLocalSearchParams<{ ref: string }>().ref

  const [currentStep, setCurrentStep] = useState(0)
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [name,     setName]     = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState<string | null>(null)

  // Slide animation
  const slideX = useSharedValue(0)
  const slideOp = useSharedValue(1)
  const slideStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: slideX.value }],
    opacity: slideOp.value,
  }))

  function animateToStep(nextStep: number, direction: 'forward' | 'back') {
    const outX = direction === 'forward' ? -SCREEN_W : SCREEN_W
    const inX  = direction === 'forward' ?  SCREEN_W : -SCREEN_W

    slideX.value  = withTiming(outX,  { duration: 220 })
    slideOp.value = withTiming(0,     { duration: 180 }, () => {
      runOnJS(setCurrentStep)(nextStep)
      runOnJS(setError)(null)
      slideX.value  = inX
      slideX.value  = withSpring(0,   { damping: 22, stiffness: 220 })
      slideOp.value = withTiming(1,   { duration: 200 })
    })
  }

  function handleNext() {
    haptics.tap()
    if (currentStep === 0) {
      if (!name.trim()) {
        setError('Please enter your first name.')
        return
      }
      animateToStep(1, 'forward')
    } else if (currentStep === 1) {
      if (!email.trim().includes('@') || !email.trim().includes('.')) {
        setError('Please enter a valid email address.')
        return
      }
      animateToStep(2, 'forward')
    }
  }

  function handleBack() {
    haptics.tap()
    if (currentStep === 0) {
      router.back()
    } else {
      animateToStep(currentStep - 1, 'back')
    }
  }

  async function handleSubmit() {
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    haptics.celebrate()
    setLoading(true)
    setError(null)

    try {
      const { data, error: signupErr } = await supabase.auth.signUp({
        email:    email.trim(),
        password,
        options: { data: { display_name: name.trim() } },
      })

      if (signupErr) throw signupErr
      if (!data.user) throw new Error('Signup failed — please try again.')

      // Create user profile
      await supabase.from('user_profiles').upsert(
        { id: data.user.id, display_name: name.trim(), daily_goal: dailyGoal ?? 1 },
        { onConflict: 'id' },
      )

      // Referral handling — best-effort, silent fail
      if (referralRef) {
        try {
          const { data: referrer } = await supabase
            .from('user_profiles').select('id')
            .eq('referral_code', referralRef).maybeSingle()

          if (referrer) {
            await supabase.from('friendships').upsert(
              { referrer_id: referrer.id, referred_id: data.user.id },
              { onConflict: 'referrer_id,referred_id' },
            )
            const { data: rewards } = await supabase
              .from('referral_rewards').select('referral_count,free_months')
              .eq('user_id', referrer.id).maybeSingle()
            const MILESTONES = 10
            if (rewards) {
              const r = rewards as { referral_count: number; free_months: number }
              const newCount = r.referral_count + 1
              await supabase.from('referral_rewards').update({
                referral_count: newCount,
                free_months: Math.floor(newCount / MILESTONES),
                updated_at: new Date().toISOString(),
              }).eq('user_id', referrer.id)
              if (newCount % MILESTONES === 0) {
                await pushNotification({
                  userId: referrer.id, type: 'referral_milestone',
                  title: `You've referred ${newCount} friends! 🎉`,
                  body: 'You earned 1 free month of Pro. Check your Profile.',
                  emoji: '🎉', linkRoute: '/(tabs)/profile',
                })
              }
            } else {
              await supabase.from('referral_rewards').insert({ user_id: referrer.id, referral_count: 1, free_months: 0 })
            }
            await pushNotification({
              userId: referrer.id, type: 'friend_joined',
              title: `${name.trim()} joined PhonicsFlow!`,
              body: 'They used your invite link — check your Friends tab.',
              emoji: '🤝', linkRoute: '/(tabs)/friends',
            })
          }
        } catch { /* silent */ }
      }

      if (data.session) {
        setSession(data.session)
        router.replace('/(auth)/onboarding/goal')
      } else {
        router.replace('/(auth)/confirm-email')
      }
    } catch (err) {
      setError(friendlyEmailAuthMessage(err, 'Something went wrong. Please try again.'))
    } finally {
      setLoading(false)
    }
  }

  const stepTitles = ['Name', 'Email', 'Password']

  return (
    <KeyboardAvoidingView
      style={[root.safe, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* ── Top bar ────────────────────────────────────────── */}
      <View style={root.topBar}>
        <TouchableOpacity onPress={handleBack} style={root.backBtn} hitSlop={12}>
          <Text style={root.backChevron}>‹</Text>
        </TouchableOpacity>
        <ProgressBar step={currentStep} />
        {/* Step label */}
        <Text style={root.stepLabel}>{stepTitles[currentStep]}</Text>
      </View>

      {/* ── Animated step content ──────────────────────────── */}
      <ScrollView
        style={root.scroll}
        contentContainerStyle={root.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
      <Animated.View style={[root.content, slideStyle]}>
        {currentStep === 0 && (
          <NameStep
            value={name} onChange={setName}
            onNext={handleNext} error={error} clearError={() => setError(null)}
          />
        )}
        {currentStep === 1 && (
          <EmailStep
            value={email} onChange={setEmail}
            onNext={handleNext} error={error} clearError={() => setError(null)}
            name={name}
          />
        )}
        {currentStep === 2 && (
          <PasswordStep
            value={password} onChange={setPassword}
            onSubmit={handleSubmit} loading={loading}
            error={error} clearError={() => setError(null)}
          />
        )}
      </Animated.View>
      </ScrollView>

    </KeyboardAvoidingView>
  )
}

const root = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: colors.surface },

  topBar:  {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: spacing.lg, gap: spacing.md,
    paddingBottom: spacing.sm,
  },
  backBtn:     { padding: 4 },
  backChevron: { fontSize: 28, color: colors.textMuted, lineHeight: 32 },
  stepLabel:   { fontSize: fontSize.sm, fontWeight: '600', color: colors.textHint, width: 56, textAlign: 'right' },

  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
    justifyContent: 'center',
  },

  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingBottom: 40,
  },

  terms: {
    textAlign: 'center', color: colors.textHint,
    fontSize: fontSize.xs, lineHeight: 18,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
  },
})
