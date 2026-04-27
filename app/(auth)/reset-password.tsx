import { useEffect, useState, useCallback } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native'
import * as Linking from 'expo-linking'
import { router } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { supabase } from '@/lib/supabase'
import { colors, spacing, radius, fontSize } from '@/lib/tokens'

function parseTokensFromUrl(url: string): { access_token: string; refresh_token: string } | null {
  const hashIdx = url.indexOf('#')
  if (hashIdx === -1) return null
  const params = new URLSearchParams(url.slice(hashIdx + 1))
  const access_token = params.get('access_token')
  const refresh_token = params.get('refresh_token')
  if (!access_token || !refresh_token) return null
  return { access_token, refresh_token }
}

export default function ResetPasswordScreen() {
  const [ready, setReady] = useState(false)
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const applyUrl = useCallback(async (url: string | null) => {
    if (!url) {
      setLoading(false)
      return
    }
    const tokens = parseTokensFromUrl(url)
    if (!tokens) {
      setLoading(false)
      return
    }
    try {
      const { error: sessionErr } = await supabase.auth.setSession({
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
      })
      if (sessionErr) throw sessionErr
      setReady(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'This reset link is invalid or expired.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void Linking.getInitialURL().then(applyUrl)
    const sub = Linking.addEventListener('url', ({ url }) => void applyUrl(url))
    return () => sub.remove()
  }, [applyUrl])

  const handleUpdate = async () => {
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    try {
      setSubmitting(true)
      setError(null)
      const { error: upErr } = await supabase.auth.updateUser({ password })
      if (upErr) throw upErr
      await supabase.auth.signOut()
      Alert.alert('Password updated', 'You can sign in with your new password.', [
        { text: 'OK', onPress: () => router.replace('/(auth)/login') },
      ])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not update password.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.muted}>Opening reset link…</Text>
        </View>
      </SafeAreaView>
    )
  }

  if (!ready) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text style={styles.title}>Reset link needed</Text>
          <Text style={styles.muted}>
            Open this screen from the link in your reset email, or request a new link from sign in.
          </Text>
          <TouchableOpacity style={styles.primaryBtn} onPress={() => router.replace('/(auth)/login')}>
            <Text style={styles.primaryBtnText}>Back to sign in</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.form}>
          <Text style={styles.headline}>Choose a new password</Text>
          <Text style={styles.sub}>Enter a new password for your account.</Text>

          {error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>New password</Text>
            <View style={styles.passwordRow}>
              <TextInput
                style={[styles.input, styles.passwordInput]}
                value={password}
                onChangeText={setPassword}
                placeholder="Min. 6 characters"
                placeholderTextColor={colors.textHint}
                secureTextEntry={!showPassword}
                autoComplete="new-password"
              />
              <TouchableOpacity onPress={() => setShowPassword((v) => !v)} style={styles.showToggle}>
                <Text style={styles.showToggleText}>{showPassword ? 'hide' : 'show'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.primaryBtn, submitting && styles.disabled]}
            onPress={handleUpdate}
            disabled={submitting}
            accessibilityRole="button"
            accessibilityLabel="Update password"
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryBtnText}>Update password</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  center: { flex: 1, padding: spacing.xl, justifyContent: 'center', gap: spacing.md },
  form: { flex: 1, padding: spacing.xl, gap: spacing.md, paddingTop: spacing.xxl },
  title: { fontSize: fontSize.xl, fontWeight: '600', color: colors.text, textAlign: 'center' },
  headline: { fontSize: 20, fontWeight: '500', color: colors.text },
  sub: { fontSize: fontSize.md, color: colors.textMuted },
  muted: { fontSize: fontSize.md, color: colors.textMuted, textAlign: 'center', lineHeight: 22 },
  errorBox: { backgroundColor: colors.errorLight, borderRadius: radius.md, padding: spacing.md },
  errorText: { color: colors.error, fontSize: fontSize.md },
  field: { gap: 5 },
  fieldLabel: { fontSize: fontSize.sm, fontWeight: '500', color: '#5F5E5A' },
  input: {
    borderWidth: 1.5,
    borderColor: colors.borderLight,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize: fontSize.lg,
    color: colors.text,
  },
  passwordRow: { position: 'relative' },
  passwordInput: { paddingRight: 56 },
  showToggle: { position: 'absolute', right: 14, top: 14 },
  showToggleText: { fontSize: fontSize.sm, color: colors.textMuted, fontWeight: '500' },
  primaryBtn: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  primaryBtnText: { color: '#fff', fontSize: fontSize.lg, fontWeight: '500' },
  disabled: { opacity: 0.6 },
})
