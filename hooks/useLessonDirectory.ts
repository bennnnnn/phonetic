import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { readCache, writeCache, CACHE_TYPES } from '@/lib/offlineCache'

export type LessonDirectoryItem = {
  id: string
  title: string
  level: number
  pattern: string
  sound: string
  wordCount: number
}

type LessonRow = {
  id: string
  title: string
  level: number
  word_family_id: string | null
}

function errorMessage(err: unknown): string {
  if (err instanceof Error) return err.message
  if (err && typeof err === 'object' && 'message' in err) {
    const m = (err as { message?: unknown }).message
    if (typeof m === 'string' && m.length > 0) return m
  }
  return 'Failed to load lessons'
}

export function useLessonDirectory() {
  const [lessons, setLessons] = useState<LessonDirectoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refetch = useCallback(async () => {
    const { user } = useAuthStore.getState()
    try {
      // 1. Cache-first
      if (user) {
        const cached = await readCache<LessonDirectoryItem[]>(CACHE_TYPES.LESSON_DIRECTORY, user.id)
        if (cached) {
          setLessons(cached.data)
          setLoading(false)
          if (!cached.stale) return
        }
      }

      if (!user) setLoading(true)
      setError(null)

      if (!process.env.EXPO_PUBLIC_SUPABASE_URL || !process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY) {
        setError('Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY')
        setLessons([])
        return
      }

      const { data: lessonRows, error: lessonsError } = await supabase
        .from('lessons')
        .select('id, title, level, word_family_id')
        .order('level', { ascending: true })

      if (lessonsError) throw lessonsError

      const rows = (lessonRows as LessonRow[] | null) ?? []
      if (rows.length === 0) {
        setLessons([])
        return
      }

      const familyIds = [...new Set(rows.map((r) => r.word_family_id).filter(Boolean))] as string[]

      let familyById: Record<string, { pattern: string; sound: string }> = {}
      if (familyIds.length > 0) {
        const { data: families, error: familiesError } = await supabase
          .from('word_families')
          .select('id, pattern, sound')
          .in('id', familyIds)

        if (familiesError) throw familiesError
        for (const f of families ?? []) {
          familyById[f.id] = { pattern: f.pattern, sound: f.sound ?? '' }
        }
      }

      let countByFamilyId: Record<string, number> = {}
      if (familyIds.length > 0) {
        const { data: wordRows, error: wordsError } = await supabase
          .from('words')
          .select('word_family_id')
          .in('word_family_id', familyIds)

        if (wordsError) throw wordsError
        for (const w of wordRows ?? []) {
          const fid = (w as { word_family_id: string }).word_family_id
          countByFamilyId[fid] = (countByFamilyId[fid] ?? 0) + 1
        }
      }

      const result = rows.map((row) => {
        const fid = row.word_family_id
        const fam = fid ? familyById[fid] : null
        const wc = fid ? countByFamilyId[fid] ?? 0 : 0
        return {
          id: row.id,
          title: row.title,
          level: row.level,
          pattern: fam?.pattern ?? '',
          sound: fam?.sound ?? '',
          wordCount: Math.max(1, wc),
        }
      })

      setLessons(result)
      // 2. Cache it (longer TTL — lesson directory rarely changes)
      if (user) {
        void writeCache(CACHE_TYPES.LESSON_DIRECTORY, user.id, result, 30 * 60 * 1000) // 30 min
      }
    } catch (err) {
      setError(errorMessage(err))
      // Keep cached data if network fails
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refetch()
  }, [])

  return { lessons, loading, error, refetch }
}
