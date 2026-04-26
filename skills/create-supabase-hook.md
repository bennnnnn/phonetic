# Skill: Create a Supabase Data Hook

Read this before building any hook that fetches or mutates Supabase data.

---

## File Location
```
/hooks/use[Entity].ts
```
Examples: `useLesson.ts`, `useProgress.ts`, `useWordFamily.ts`

---

## Read-Only Hook Template

```typescript
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { Lesson } from '@/lib/types'

type UseLessonReturn = {
  lesson: Lesson | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useLesson(lessonId: string): UseLessonReturn {
  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchLesson = useCallback(async () => {
    if (!lessonId) return
    try {
      setLoading(true)
      setError(null)

      const { data, error: sbError } = await supabase
        .from('lessons')
        .select(`
          *,
          word_family:word_families(*, words(*))
        `)
        .eq('id', lessonId)
        .single()

      if (sbError) throw sbError
      setLesson(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }, [lessonId])

  useEffect(() => {
    fetchLesson()
  }, [fetchLesson])

  return { lesson, loading, error, refetch: fetchLesson }
}
```

---

## Mutation Hook Template

```typescript
import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import type { UserProgress } from '@/lib/types'

type SaveProgressInput = {
  lessonId: string
  score: number
  xpEarned: number
}

type UseSaveProgressReturn = {
  saving: boolean
  error: string | null
  saveProgress: (input: SaveProgressInput) => Promise<UserProgress | null>
}

export function useSaveProgress(): UseSaveProgressReturn {
  const { user } = useAuthStore()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const saveProgress = useCallback(async (input: SaveProgressInput) => {
    if (!user) return null
    try {
      setSaving(true)
      setError(null)

      const { data, error: sbError } = await supabase
        .from('user_progress')
        .upsert({
          user_id: user.id,
          lesson_id: input.lessonId,
          score: input.score,
          xp_earned: input.xpEarned,
          completed: input.score >= 70,
          completed_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (sbError) throw sbError
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save progress')
      return null
    } finally {
      setSaving(false)
    }
  }, [user])

  return { saving, error, saveProgress }
}
```

---

## Rules

1. **Return shape always:** `{ data, loading, error, refetch }` for reads — `{ loading, error, action }` for mutations
2. **Wrap fetch in `useCallback`** with correct deps — never define async directly in useEffect
3. **Always set `loading: false` in finally** — never leave the user hanging
4. **Type all Supabase responses** — use types from `/lib/types.ts`
5. **Auth errors** — if error code is `401` or `403`, call `authStore.signOut()` and redirect to `/login`
6. **Never call hooks conditionally** — if data depends on a param, guard inside the fetch function
7. **Optimistic updates** for mutations that affect UI immediately (e.g. liking, completing)

---

## Auth Error Handling Pattern

```typescript
import { router } from 'expo-router'
import { useAuthStore } from '@/store/authStore'

// Inside catch block:
if (err?.status === 401 || err?.code === 'PGRST301') {
  useAuthStore.getState().signOut()
  router.replace('/login')
  return
}
```

---

## Real-Time Subscription Pattern (when needed)

```typescript
useEffect(() => {
  const channel = supabase
    .channel(`lesson-${lessonId}`)
    .on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'lessons',
      filter: `id=eq.${lessonId}`,
    }, (payload) => {
      setLesson(payload.new as Lesson)
    })
    .subscribe()

  return () => { supabase.removeChannel(channel) }
}, [lessonId])
```
