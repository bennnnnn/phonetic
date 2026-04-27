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
