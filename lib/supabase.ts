import { createClient } from '@supabase/supabase-js'
import AsyncStorage from '@react-native-async-storage/async-storage'

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})

/**
 * Sign in with Google OAuth.
 * Opens a browser session, completes the OAuth flow, and sets the session.
 * Call this from a user-triggered event (onPress) — browser APIs require it.
 *
 * Uses expo-auth-session's makeRedirectUri to build a valid redirect URL
 * for the current runtime: exp:// proxy in Expo Go, custom scheme in standalone.
 */
export async function signInWithGoogle(): Promise<void> {
  const { makeRedirectUri } = await import('expo-auth-session')
  const redirectTo = makeRedirectUri({ path: 'auth/callback' })

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
      skipBrowserRedirect: true,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  })
  if (error) throw error
  if (!data.url) throw new Error('No auth URL returned')

  const { openAuthSessionAsync } = await import('expo-web-browser')
  const result = await openAuthSessionAsync(data.url, redirectTo)

  if (result.type === 'cancel') throw new Error('Sign in cancelled')
  if (result.type !== 'success' || !result.url) throw new Error('Sign in failed')

  // Extract tokens from the callback URL fragment (#access_token=...&refresh_token=...)
  const fragment = result.url.split('#')[1]
  if (!fragment) throw new Error('No token data in callback')

  const params = new URLSearchParams(fragment)
  const accessToken = params.get('access_token')
  const refreshToken = params.get('refresh_token')

  if (!accessToken || !refreshToken) throw new Error('Missing tokens in callback')

  await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken })
}

/** Readable message from Supabase / PostgREST errors (they are often plain objects, not `Error`). */
export function supabaseErrorMessage(err: unknown): string {
  if (typeof err === 'string' && err.length > 0) return err
  if (err instanceof Error && err.message) return err.message
  if (err && typeof err === 'object') {
    const o = err as Record<string, unknown>
    const msg = o.message
    if (typeof msg === 'string' && msg.length > 0) return msg
    const details = o.details
    if (typeof details === 'string' && details.length > 0) return details
    const hint = o.hint
    if (typeof hint === 'string' && hint.length > 0) return hint
    const code = o.code
    if (typeof code === 'string' && code.length > 0) return `Request failed (${code}).`
  }
  return 'Something went wrong'
}
