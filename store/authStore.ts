import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import { Session, User } from '@supabase/supabase-js'
import { clearUserCache } from '@/lib/offlineCache'

type AuthStore = {
  user: User | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  setSession: (session: Session | null) => void
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  session: null,
  loading: true,
  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    set({ user: data.user, session: data.session })
  },
  signOut: async () => {
    const uid = get().user?.id
    await supabase.auth.signOut()
    set({ user: null, session: null })
    // Clear offline cache for this user
    if (uid) clearUserCache(uid).catch(() => {})
  },
  setSession: (session) => set({ session, user: session?.user ?? null, loading: false }),
}))
