import { useState, useRef, useEffect } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator,
  Alert, Modal, Pressable,
} from 'react-native'
import { router } from 'expo-router'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import Animated, {
  useSharedValue, useAnimatedStyle,
  withSpring, withTiming, withDelay,
} from 'react-native-reanimated'
import { Ionicons } from '@expo/vector-icons'
import { friendlyEmailAuthMessage, isEmailRateLimited } from '@/lib/authErrors'
import { supabase, signInWithGoogle } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { haptics } from '@/lib/haptics'
import { colors, spacing, radius, fontSize } from '@/lib/tokens'

export default function LoginScreen() {
  const { signIn } = useAuthStore()
  const insets = useSafeAreaInsets()

  const [emailExpanded,   setEmailExpanded]   = useState(false)
  const [email,           setEmail]           = useState('')
  const [password,        setPassword]        = useState('')
  const [showPassword,    setShowPassword]    = useState(false)
  const [loading,         setLoading]         = useState(false)
  const [googleLoading,   setGoogleLoading]   = useState(false)
  const [error,           setError]           = useState<string | null>(null)
  const [emailFocused,    setEmailFocused]    = useState(false)
  const [passwordFocused, setPasswordFocused] = useState(false)
  const [forgotOpen,      setForgotOpen]      = useState(false)
  const [forgotEmail,     setForgotEmail]     = useState('')
  const [forgotSending,   setForgotSending]   = useState(false)
  const [forgotMessage,   setForgotMessage]   = useState<string | null>(null)

  const lastResetRequestAt = useRef(0)
  const RESET_COOLDOWN_MS  = 90_000
  const emailRef    = useRef<TextInput>(null)
  const passwordRef = useRef<TextInput>(null)
  const scrollRef   = useRef<import('react-native').ScrollView>(null)

  // Entrance animations
  const heroY  = useSharedValue(-20)
  const heroOp = useSharedValue(0)
  const formY  = useSharedValue(30)
  const formOp = useSharedValue(0)

  // Fields slide-in after email button tap
  const fieldsOp = useSharedValue(0)
  const fieldsY  = useSharedValue(12)

  useEffect(() => {
    heroY.value  = withSpring(0, { damping: 14, stiffness: 110 })
    heroOp.value = withTiming(1, { duration: 280 })
    formY.value  = withDelay(150, withSpring(0, { damping: 16, stiffness: 120 }))
    formOp.value = withDelay(150, withTiming(1, { duration: 300 }))
  }, [])

  const heroStyle   = useAnimatedStyle(() => ({ transform: [{ translateY: heroY.value }], opacity: heroOp.value }))
  const formStyle   = useAnimatedStyle(() => ({ transform: [{ translateY: formY.value }], opacity: formOp.value }))
  const fieldsStyle = useAnimatedStyle(() => ({ opacity: fieldsOp.value, transform: [{ translateY: fieldsY.value }] }))

  const handleEmailTap = () => {
    haptics.tap()
    setEmailExpanded(true)
    fieldsOp.value = withDelay(60, withTiming(1, { duration: 240 }))
    fieldsY.value  = withDelay(60, withSpring(0, { damping: 18, stiffness: 160 }))
    setTimeout(() => emailRef.current?.focus(), 120)
  }

  const handleGoogle = async () => {
    haptics.tap()
    setGoogleLoading(true)
    setError(null)
    try {
      await signInWithGoogle()
      router.replace('/(tabs)/home')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Google sign in failed. Please try again.'
      if (!msg.includes('cancelled') && !msg.includes('cancel')) setError(msg)
    } finally {
      setGoogleLoading(false)
    }
  }

  const openForgot = () => {
    setForgotOpen(true)
    setForgotEmail(email.trim())
    setForgotMessage(null)
    setError(null)
  }

  const handleSendReset = async () => {
    const trimmed = forgotEmail.trim()
    if (!trimmed) { setForgotMessage('Please enter your email.'); return }
    const elapsed = Date.now() - lastResetRequestAt.current
    if (elapsed < RESET_COOLDOWN_MS && lastResetRequestAt.current > 0) {
      const waitSec = Math.ceil((RESET_COOLDOWN_MS - elapsed) / 1000)
      setForgotMessage(`Please wait ${waitSec}s before requesting another link.`)
      return
    }
    try {
      setForgotSending(true)
      setForgotMessage(null)
      const redirectTo = 'phonicsflow:///(auth)/reset-password'
      const { error: resetErr } = await supabase.auth.resetPasswordForEmail(trimmed, { redirectTo })
      if (resetErr) throw resetErr
      lastResetRequestAt.current = Date.now()
      Alert.alert(
        'Check your email',
        `We sent a reset link to ${trimmed}. Open it on this device to set a new password.`,
        [{ text: 'OK', onPress: () => setForgotOpen(false) }]
      )
    } catch (e: unknown) {
      if (isEmailRateLimited(e)) lastResetRequestAt.current = Date.now()
      setForgotMessage(friendlyEmailAuthMessage(e, 'Could not send reset email.'))
    } finally {
      setForgotSending(false)
    }
  }

  const handleLogin = async () => {
    if (!email || !password) { setError('Please enter your email and password.'); return }
    try {
      setLoading(true)
      setError(null)
      haptics.tap()
      await signIn(email.trim(), password)
      router.replace('/(tabs)/home')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'height' : undefined}
        keyboardVerticalOffset={insets.top}
      >
        <ScrollView ref={scrollRef} contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">

          {/* Hero */}
          <Animated.View style={[styles.hero, heroStyle]}>
            <View style={styles.logoCard}>
              <Text style={styles.logoText}>Pf</Text>
            </View>
            <Text style={styles.appName}>PhonicsFlow</Text>
            <Text style={styles.tagline}>welcome back</Text>
          </Animated.View>

          {/* Form */}
          <Animated.View style={[styles.form, formStyle]}>
            <Text style={styles.headline}>Sign in</Text>

            {error && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* Step 1: Google + email button — hidden after email tapped */}
            {!emailExpanded && (
              <>
                <TouchableOpacity
                  style={[styles.googleBtn, googleLoading && styles.disabled]}
                  onPress={handleGoogle}
                  disabled={googleLoading}
                  activeOpacity={0.85}
                >
                  {googleLoading ? (
                    <ActivityIndicator color={colors.text} />
                  ) : (
                    <>
                      <View style={styles.googleIcon}><Text style={styles.googleG}>G</Text></View>
                      <Text style={styles.googleLabel}>Continue with Google</Text>
                    </>
                  )}
                </TouchableOpacity>

                <View style={styles.dividerRow}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>or</Text>
                  <View style={styles.dividerLine} />
                </View>

                <TouchableOpacity style={styles.emailBtn} onPress={handleEmailTap} activeOpacity={0.86}>
                  <Text style={styles.emailIcon}>✉️</Text>
                  <Text style={styles.emailBtnText}>Continue with email</Text>
                </TouchableOpacity>
              </>
            )}

            {/* Step 2: email + password fields */}
            {emailExpanded && (
              <Animated.View style={[styles.fields, fieldsStyle]}>
                <View style={styles.field}>
                  <Text style={[styles.fieldLabel, emailFocused && styles.fieldLabelFocused]}>Email</Text>
                  <TextInput
                    ref={emailRef}
                    style={[styles.input, emailFocused && styles.inputFocused]}
                    value={email}
                    onChangeText={setEmail}
                    placeholder="you@example.com"
                    placeholderTextColor={colors.textHint}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    returnKeyType="next"
                    onFocus={() => setEmailFocused(true)}
                    onBlur={() => setEmailFocused(false)}
                    onSubmitEditing={() => passwordRef.current?.focus()}
                  />
                </View>

                <View style={styles.field}>
                  <Text style={[styles.fieldLabel, passwordFocused && styles.fieldLabelFocused]}>Password</Text>
                  <View style={[styles.passwordRow, passwordFocused && styles.passwordRowFocused]}>
                    <TextInput
                      ref={passwordRef}
                      style={[styles.input, styles.passwordInput, { borderWidth: 0 }]}
                      value={password}
                      onChangeText={setPassword}
                      placeholder="••••••••"
                      placeholderTextColor={colors.textHint}
                      secureTextEntry={!showPassword}
                      autoComplete="password"
                      returnKeyType="go"
                      onFocus={() => setPasswordFocused(true)}
                      onBlur={() => setPasswordFocused(false)}
                      onSubmitEditing={handleLogin}
                    />
                    <TouchableOpacity onPress={() => setShowPassword(v => !v)} style={styles.showToggle}>
                      <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.textMuted} />
                    </TouchableOpacity>
                  </View>
                </View>

                <TouchableOpacity onPress={openForgot}>
                  <Text style={styles.forgot}>Forgot password?</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.primaryBtn, loading && styles.disabled]}
                  onPress={handleLogin}
                  disabled={loading}
                  activeOpacity={0.85}
                >
                  {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>Sign in</Text>}
                </TouchableOpacity>
              </Animated.View>
            )}

            <TouchableOpacity onPress={() => router.replace('/(auth)/signup')}>
              <Text style={styles.switchText}>
                {"Don't have an account? "}
                <Text style={styles.switchLink}>Sign up</Text>
              </Text>
            </TouchableOpacity>
          </Animated.View>

        </ScrollView>

      </KeyboardAvoidingView>

      {/* Forgot password modal */}
      <Modal visible={forgotOpen} transparent animationType="slide" onRequestClose={() => setForgotOpen(false)}>
        <Pressable style={styles.overlay} onPress={() => setForgotOpen(false)}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <Pressable style={styles.resetSheet} onPress={() => {}}>
              <View style={styles.resetHandle} />
              <Text style={styles.resetTitle}>Reset password</Text>
              <Text style={styles.resetHint}>Enter your email and we'll send a link to set a new password.</Text>
              <TextInput
                style={styles.input}
                value={forgotEmail}
                onChangeText={v => { setForgotEmail(v); setForgotMessage(null) }}
                placeholder="you@example.com"
                placeholderTextColor={colors.textHint}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                autoFocus
              />
              {forgotMessage ? <Text style={styles.forgotError}>{forgotMessage}</Text> : null}
              <TouchableOpacity
                style={[styles.primaryBtn, forgotSending && styles.disabled]}
                onPress={handleSendReset}
                disabled={forgotSending}
              >
                {forgotSending ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>Send reset link</Text>}
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelRow} onPress={() => setForgotOpen(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </Pressable>
          </KeyboardAvoidingView>
        </Pressable>
      </Modal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe:      { flex: 1, backgroundColor: colors.surface },
  container: { flexGrow: 1 },

  hero: {
    backgroundColor: colors.primary,
    paddingTop: spacing.lg, paddingBottom: spacing.lg,
    alignItems: 'center', justifyContent: 'center',
    gap: 6, minHeight: 145,
  },
  logoCard: {
    width: 48, height: 48, borderRadius: 13,
    backgroundColor: colors.surface,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 }, elevation: 3,
  },
  logoText: { fontFamily: 'Georgia', fontSize: 20, fontWeight: '500', color: colors.primary },
  appName:  { color: '#fff', fontSize: 18, fontWeight: '600', letterSpacing: -0.3 },
  tagline:  { color: '#9FE1CB', fontSize: fontSize.sm },

  form: {
    flex: 1, paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl, paddingBottom: spacing.xxl,
    gap: spacing.md,
  },
  headline: { fontSize: 22, fontWeight: '600', color: colors.text, letterSpacing: -0.3 },

  errorBox:  { backgroundColor: colors.errorLight, borderRadius: radius.md, padding: spacing.md },
  errorText: { color: colors.error, fontSize: fontSize.md },

  googleBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10, backgroundColor: colors.surface,
    borderWidth: 1.5, borderColor: colors.border,
    borderRadius: 13, paddingVertical: 14,
  },
  googleIcon: {
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: colors.accentLight, alignItems: 'center', justifyContent: 'center',
  },
  googleG:    { fontSize: 13, fontWeight: '600', color: '#D85A30' },
  googleLabel:{ fontSize: fontSize.lg, fontWeight: '500', color: colors.text },

  dividerRow:  { flexDirection: 'row', alignItems: 'center', gap: 10 },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.border },
  dividerText: { fontSize: fontSize.sm, color: colors.textHint },

  emailBtn: {
    backgroundColor: colors.primary, borderRadius: 14, paddingVertical: 15,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm,
  },
  emailIcon:    { fontSize: 18 },
  emailBtnText: { color: '#fff', fontSize: fontSize.lg, fontWeight: '700' },

  fields: { gap: spacing.md },
  field:  { gap: 5 },
  fieldLabel:        { fontSize: fontSize.sm, fontWeight: '500', color: '#5F5E5A' },
  fieldLabelFocused: { color: colors.primary },
  input: {
    borderWidth: 1.5, borderColor: colors.border,
    borderRadius: 12, paddingVertical: 13, paddingHorizontal: 14,
    fontSize: fontSize.lg, color: colors.text, backgroundColor: colors.surface,
  },
  inputFocused:      { borderColor: colors.primary },
  passwordRow:       { position: 'relative', borderWidth: 1.5, borderColor: colors.border, borderRadius: 12 },
  passwordRowFocused:{ borderColor: colors.primary },
  passwordInput:     { paddingRight: 44 },
  showToggle:        { position: 'absolute', right: 14, top: 13 },

  forgot: { fontSize: fontSize.md, color: colors.primary, fontWeight: '500', textAlign: 'right', marginTop: -4 },
  forgotError: { fontSize: fontSize.sm, color: colors.error },

  primaryBtn:     { backgroundColor: colors.primary, borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  primaryBtnText: { color: '#fff', fontSize: fontSize.lg, fontWeight: '600' },
  disabled:       { opacity: 0.6 },

  switchText: { textAlign: 'center', color: colors.textMuted, fontSize: fontSize.md, marginTop: spacing.sm },
  switchLink: { color: colors.primary, fontWeight: '600' },

  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  resetSheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.xxl,
    gap: spacing.md,
  },
  resetHandle: { width: 36, height: 4, borderRadius: 2, backgroundColor: colors.border, alignSelf: 'center', marginBottom: spacing.sm },
  resetTitle:  { fontSize: fontSize.xl, fontWeight: '600', color: colors.text },
  resetHint:   { fontSize: fontSize.md, color: colors.textMuted, lineHeight: 20 },
  cancelRow:   { alignItems: 'center', paddingVertical: spacing.xs },
  cancelText:  { fontSize: fontSize.md, color: colors.textMuted },
})
