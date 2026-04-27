import { useState, useRef, useEffect, useMemo } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, FlatList, ActivityIndicator,
  Alert, Pressable,
} from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import Animated, {
  useSharedValue, useAnimatedStyle,
  withSpring, withTiming, withSequence,
} from 'react-native-reanimated'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { friendlyEmailAuthMessage } from '@/lib/authErrors'
import { LANGUAGES } from '@/lib/languages'
import { haptics } from '@/lib/haptics'
import { colors, spacing, radius, fontSize } from '@/lib/tokens'

// ── Types ───────────────────────────────────────────────────────────────────
type Step = 'name' | 'email' | 'password' | 'goal' | 'language'
type DailyGoal = 1 | 2 | 3 | 5

type GoalOption = {
  goal: DailyGoal
  label: string
  sublabel: string
  timeEst: string
  emoji: string
  tag?: string
  highlight?: boolean
}

const GOALS: GoalOption[] = [
  { goal: 1, label: 'Casual',  sublabel: '1 lesson',  timeEst: '~5 min/day',  emoji: '🌱', tag: 'Great place to start' },
  { goal: 2, label: 'Regular', sublabel: '2 lessons', timeEst: '~10 min/day', emoji: '⚡', tag: 'Most popular', highlight: true },
  { goal: 3, label: 'Serious', sublabel: '3 lessons', timeEst: '~15 min/day', emoji: '🔥', tag: '4× faster progress' },
  { goal: 5, label: 'Intense', sublabel: '5 lessons', timeEst: '~25 min/day', emoji: '🚀', tag: 'Full commitment' },
]

const STEP_PROGRESS: Partial<Record<Step, number>> = { name: 1, email: 2, password: 3 }

// ── Sub-components ──────────────────────────────────────────────────────────
function ProgressBar({ current }: { current: number }) {
  return (
    <View style={pb.bar}>
      {[1, 2, 3].map(i => (
        <View key={i} style={[pb.seg, { backgroundColor: i <= current ? colors.primary : colors.border }]} />
      ))}
    </View>
  )
}
const pb = StyleSheet.create({
  bar: { flexDirection: 'row', gap: 5, flex: 1, marginLeft: spacing.md },
  seg: { flex: 1, height: 3, borderRadius: 2 },
})

function GoalCard({
  option, selected, onSelect,
}: { option: GoalOption; selected: boolean; onSelect: (g: DailyGoal) => void }) {
  const scale = useSharedValue(1)
  const radioScale = useSharedValue(selected ? 1 : 0)

  useEffect(() => {
    radioScale.value = withSpring(selected ? 1 : 0, { damping: 10, stiffness: 200 })
  }, [selected])

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    backgroundColor: selected ? colors.primaryLight : colors.surface,
    borderColor: selected ? colors.primary : colors.border,
    borderWidth: selected ? 1.5 : 1,
  }))

  const radioStyle = useAnimatedStyle(() => ({
    transform: [{ scale: radioScale.value }],
  }))

  return (
    <Pressable onPress={() => {
      scale.value = withSequence(
        withSpring(1.025, { damping: 8, stiffness: 300 }),
        withSpring(1, { damping: 10, stiffness: 200 })
      )
      haptics.tap()
      onSelect(option.goal)
    }}>
      <Animated.View style={[styles.goalCard, cardStyle]}>
        <Text style={styles.goalEmoji}>{option.emoji}</Text>
        <View style={styles.goalContent}>
          <View style={styles.goalLabelRow}>
            <Text style={styles.goalLabel}>{option.label}</Text>
            {option.highlight && (
              <View style={styles.popularBadge}>
                <Text style={styles.popularText}>⭐ popular</Text>
              </View>
            )}
          </View>
          <Text style={styles.goalSub}>{option.sublabel} · {option.timeEst}</Text>
          {option.tag && !option.highlight && (
            <Text style={styles.goalTag}>{option.tag}</Text>
          )}
        </View>
        <View style={styles.radioOuter}>
          <Animated.View style={[
            styles.radioInner,
            { backgroundColor: selected ? colors.primary : 'transparent' },
            radioStyle,
          ]} />
        </View>
      </Animated.View>
    </Pressable>
  )
}

// ── Main screen ─────────────────────────────────────────────────────────────
export default function SignupScreen() {
  const { ref } = useLocalSearchParams<{ ref?: string }>()
  const { setSession } = useAuthStore()
  const prefillCode = (ref ?? '').toUpperCase()

  const [step, setStep] = useState<Step>('name')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [goal, setGoal] = useState<DailyGoal>(2)
  const [langCode, setLangCode] = useState('es')
  const [langSearch, setLangSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pendingUser, setPendingUser] = useState<{ id: string; session: Session | null } | null>(null)

  const nameRef = useRef<TextInput>(null)
  const emailRef = useRef<TextInput>(null)
  const passwordRef = useRef<TextInput>(null)

  // Entrance animation per step
  const contentY  = useSharedValue(24)
  const contentOp = useSharedValue(0)

  useEffect(() => {
    contentY.value  = 24
    contentOp.value = 0
    contentY.value  = withSpring(0, { damping: 20, stiffness: 200 })
    contentOp.value = withTiming(1, { duration: 220 })

    const t = setTimeout(() => {
      if (step === 'name')     nameRef.current?.focus()
      if (step === 'email')    emailRef.current?.focus()
      if (step === 'password') passwordRef.current?.focus()
    }, 300)
    return () => clearTimeout(t)
  }, [step])

  const contentStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: contentY.value }],
    opacity: contentOp.value,
  }))

  // ── Navigation ────────────────────────────────────────────────────────
  const goBack = () => {
    setError(null)
    if (step === 'name')     { router.back(); return }
    if (step === 'email')    { setStep('name'); return }
    if (step === 'password') { setStep('email'); return }
  }

  // ── Pre-auth handlers ─────────────────────────────────────────────────
  const handleNameNext = () => {
    if (!name.trim()) { setError('Please enter your name.'); return }
    setError(null)
    setStep('email')
  }

  const handleEmailNext = () => {
    const t = email.trim()
    if (!t || !t.includes('@') || !t.includes('.')) {
      setError('Please enter a valid email address.')
      return
    }
    setError(null)
    setStep('password')
  }

  const handleCreate = async () => {
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return }
    setError(null)
    setLoading(true)
    try {
      const { data, error: signupErr } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: { data: { display_name: name.trim() } },
      })
      if (signupErr) throw signupErr
      if (!data.user) throw new Error('Signup failed')
      setPendingUser({ id: data.user.id, session: data.session })
      setStep('goal')
    } catch (err) {
      setError(friendlyEmailAuthMessage(err, 'Signup failed. Please try again.'))
    } finally {
      setLoading(false)
    }
  }

  // ── Post-auth handlers ────────────────────────────────────────────────
  const handleFinish = async () => {
    if (!pendingUser) return
    setLoading(true)
    try {
      await supabase.from('user_profiles').upsert(
        {
          id: pendingUser.id,
          display_name: name.trim(),
          daily_goal: goal,
          native_language: langCode,
        },
        { onConflict: 'id' }
      )

      if (prefillCode) {
        const { data: referrer } = await supabase
          .from('user_profiles')
          .select('id')
          .eq('referral_code', prefillCode)
          .neq('id', pendingUser.id)
          .single()
        if (referrer) {
          await supabase.from('friendships').insert({
            referrer_id: referrer.id,
            referred_id: pendingUser.id,
          })
        }
      }

      setSession(pendingUser.session)
      router.replace('/(tabs)/home')
    } catch {
      setLoading(false)
      Alert.alert('Error', 'Could not save your profile. Please try again.')
    }
  }

  // ── Language filter ────────────────────────────────────────────────────
  const filteredLangs = useMemo(() => {
    const q = langSearch.toLowerCase()
    if (!q) return LANGUAGES
    return LANGUAGES.filter(l => l.label.toLowerCase().includes(q))
  }, [langSearch])

  const progress = STEP_PROGRESS[step] ?? 0
  const isPreAuth = step === 'name' || step === 'email' || step === 'password'

  // ── Render: name / email / password ───────────────────────────────────
  if (isPreAuth) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.stepWrap}>
            {/* Header */}
            <View style={styles.stepHeader}>
              <TouchableOpacity onPress={goBack} hitSlop={12}>
                <Ionicons name="arrow-back" size={22} color={colors.text} />
              </TouchableOpacity>
              <ProgressBar current={progress} />
            </View>

            {/* Body */}
            <Animated.View style={[styles.stepBody, contentStyle]}>
              {prefillCode && step === 'name' && (
                <View style={styles.referralBanner}>
                  <Text style={styles.referralText}>
                    🎉 Joined via a friend's invite — you'll be connected automatically.
                  </Text>
                </View>
              )}

              <Text style={styles.question}>
                {step === 'name'     && "What's your name?"}
                {step === 'email'    && "What's your email?"}
                {step === 'password' && 'Create a password'}
              </Text>

              <Text style={styles.questionSub}>
                {step === 'name'     && "This is how you'll appear in the app."}
                {step === 'email'    && "We'll use this to sign you in."}
                {step === 'password' && 'At least 6 characters. You can always change it.'}
              </Text>

              {error ? (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              {step === 'name' && (
                <TextInput
                  ref={nameRef}
                  style={styles.input}
                  value={name}
                  onChangeText={v => { setName(v); setError(null) }}
                  placeholder="Your name"
                  placeholderTextColor={colors.textHint}
                  autoCapitalize="words"
                  autoComplete="name"
                  returnKeyType="next"
                  onSubmitEditing={handleNameNext}
                />
              )}

              {step === 'email' && (
                <TextInput
                  ref={emailRef}
                  style={styles.input}
                  value={email}
                  onChangeText={v => { setEmail(v); setError(null) }}
                  placeholder="you@example.com"
                  placeholderTextColor={colors.textHint}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  returnKeyType="next"
                  onSubmitEditing={handleEmailNext}
                />
              )}

              {step === 'password' && (
                <>
                  <View style={styles.passwordWrap}>
                    <TextInput
                      ref={passwordRef}
                      style={[styles.input, styles.passwordInput]}
                      value={password}
                      onChangeText={v => { setPassword(v); setError(null) }}
                      placeholder="Min. 6 characters"
                      placeholderTextColor={colors.textHint}
                      secureTextEntry={!showPassword}
                      autoComplete="new-password"
                      returnKeyType="done"
                      onSubmitEditing={handleCreate}
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword(v => !v)}
                      style={styles.showBtn}
                    >
                      <Text style={styles.showBtnText}>{showPassword ? 'hide' : 'show'}</Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.terms}>
                    By signing up you agree to our{' '}
                    <Text style={styles.termsLink} onPress={() => router.push('/(auth)/terms')}>Terms</Text>
                    {' '}and{' '}
                    <Text style={styles.termsLink} onPress={() => router.push('/(auth)/privacy')}>Privacy Policy</Text>
                  </Text>
                </>
              )}

            </Animated.View>

            {/* Footer */}
            <TouchableOpacity
              style={[styles.primaryBtn, loading && styles.disabled]}
              onPress={step === 'name' ? handleNameNext : step === 'email' ? handleEmailNext : handleCreate}
              disabled={loading}
            >
              {loading && step === 'password' ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.primaryBtnText}>
                  {step === 'password' ? 'Create account' : 'Continue →'}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.replace('/(auth)/login')}
              style={styles.signInRow}
            >
              <Text style={styles.signInText}>
                Already have an account? <Text style={styles.signInLink}>Sign in</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    )
  }

  // ── Render: goal ───────────────────────────────────────────────────────
  if (step === 'goal') {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <Animated.View style={[styles.postHeader, contentStyle]}>
          <Text style={styles.eyebrow}>ALMOST THERE</Text>
          <Text style={styles.postHeadline}>How much do you want{'\n'}to learn each day?</Text>
          <Text style={styles.postSub}>You can change this any time in settings.</Text>
        </Animated.View>

        <Animated.View style={[styles.goalList, contentStyle]}>
          {GOALS.map(opt => (
            <GoalCard
              key={opt.goal}
              option={opt}
              selected={goal === opt.goal}
              onSelect={setGoal}
            />
          ))}
        </Animated.View>

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => setStep('language')}
          >
            <Text style={styles.primaryBtnText}>Continue →</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  // ── Render: language ───────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <Animated.View style={[styles.postHeader, contentStyle]}>
        <Text style={styles.eyebrow}>ONE MORE THING</Text>
        <Text style={styles.postHeadline}>What's your native language?</Text>
        <Text style={styles.postSub}>We'll tailor examples to help you learn faster.</Text>
      </Animated.View>

      <View style={styles.searchWrap}>
        <Ionicons name="search-outline" size={16} color={colors.textMuted} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          value={langSearch}
          onChangeText={setLangSearch}
          placeholder="Search languages..."
          placeholderTextColor={colors.textHint}
          autoCapitalize="none"
          clearButtonMode="while-editing"
        />
      </View>

      <FlatList
        data={filteredLangs}
        keyExtractor={item => item.code}
        style={styles.langList}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => {
          const selected = langCode === item.code
          return (
            <TouchableOpacity
              style={[styles.langRow, selected && styles.langRowSelected]}
              onPress={() => { setLangCode(item.code); haptics.tap() }}
              activeOpacity={0.7}
            >
              <Text style={styles.langFlag}>{item.flag}</Text>
              <Text style={[styles.langLabel, selected && styles.langLabelSelected]}>
                {item.label}
              </Text>
              {selected && (
                <Ionicons name="checkmark" size={18} color={colors.primary} />
              )}
            </TouchableOpacity>
          )
        }}
      />

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.primaryBtn, loading && styles.disabled]}
          onPress={handleFinish}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.primaryBtnText}>Get started →</Text>
          }
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

// ── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  flex: { flex: 1 },

  // Pre-auth step layout
  stepWrap: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  stepBody: {
    flex: 1,
    paddingTop: spacing.xxl,
    gap: spacing.md,
  },

  referralBanner: {
    backgroundColor: colors.primaryLight,
    borderRadius: radius.md,
    padding: spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  referralText: { fontSize: fontSize.sm, color: colors.primaryDark, lineHeight: 18 },

  question: {
    fontSize: 26,
    fontWeight: '600',
    color: colors.text,
    letterSpacing: -0.5,
    lineHeight: 34,
  },
  questionSub: {
    fontSize: fontSize.md,
    color: colors.textMuted,
    marginTop: -spacing.xs,
    lineHeight: 20,
  },

  input: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: fontSize.lg,
    color: colors.text,
    backgroundColor: colors.surface,
  },

  passwordWrap: { position: 'relative' },
  passwordInput: { paddingRight: 60 },
  showBtn: { position: 'absolute', right: 16, top: 16 },
  showBtnText: { fontSize: fontSize.sm, color: colors.textMuted, fontWeight: '500' },

  terms: {
    textAlign: 'center',
    color: colors.textHint,
    fontSize: 11,
    lineHeight: 17,
  },
  termsLink: { color: colors.textMuted, textDecorationLine: 'underline' },

  errorBox: {
    backgroundColor: colors.errorLight,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  errorText: { color: colors.error, fontSize: fontSize.md },

  primaryBtn: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  primaryBtnText: { color: '#fff', fontSize: fontSize.lg, fontWeight: '600' },
  disabled: { opacity: 0.6 },

  signInRow: { alignItems: 'center', paddingVertical: spacing.xs },
  signInText: { fontSize: fontSize.sm, color: colors.textMuted, textAlign: 'center' },
  signInLink: { color: colors.primary, fontWeight: '600' },

  // Post-auth shared
  postHeader: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
    gap: spacing.xs,
  },
  eyebrow: {
    fontSize: fontSize.xs,
    color: colors.primary,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  postHeadline: {
    fontSize: fontSize.xxl,
    fontWeight: '600',
    color: colors.text,
    lineHeight: 30,
    letterSpacing: -0.3,
  },
  postSub: { fontSize: fontSize.md, color: colors.textMuted, lineHeight: 20 },

  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
  },

  // Goal step
  goalList: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  goalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.md,
  },
  goalEmoji: { fontSize: 26 },
  goalContent: { flex: 1, gap: 2 },
  goalLabelRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  goalLabel: { fontSize: fontSize.lg, fontWeight: '600', color: colors.text },
  goalSub: { fontSize: fontSize.md, color: colors.textMuted },
  goalTag: { fontSize: fontSize.sm, color: colors.primary, fontWeight: '500' },
  popularBadge: {
    backgroundColor: colors.amber,
    borderRadius: radius.full,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  popularText: { fontSize: 9, fontWeight: '700', color: '#fff', letterSpacing: 0.3 },
  radioOuter: {
    width: 22, height: 22, borderRadius: radius.full,
    borderWidth: 2, borderColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  radioInner: { width: 12, height: 12, borderRadius: radius.full },

  // Language step
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    backgroundColor: colors.neutral,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: fontSize.md, color: colors.text },
  langList: { flex: 1 },
  langRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: spacing.lg,
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  langRowSelected: { backgroundColor: colors.primaryLight },
  langFlag: { fontSize: 22, width: 30 },
  langLabel: { flex: 1, fontSize: fontSize.lg, color: colors.text },
  langLabelSelected: { color: colors.primaryDark, fontWeight: '500' },
})
