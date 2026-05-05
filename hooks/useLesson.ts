import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import type { Lesson, WordFamily } from '@/lib/types'

export type LessonWithFamily = Lesson & {
  word_family: WordFamily
}

type UseLessonReturn = {
  lesson: LessonWithFamily | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useLesson(lessonId: string): UseLessonReturn {
  const [lesson, setLesson] = useState<LessonWithFamily | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => { mountedRef.current = false }
  }, [])

  const fetchLesson = useCallback(async () => {
    if (!lessonId) return
    try {
      setLoading(true)
      setError(null)

      const { data, error: sbError } = await supabase
        .from('lessons')
        .select(`
          *,
          word_family:word_families(
            *,
            words(*)
          )
        `)
        .eq('id', lessonId)
        .single()

      if (!mountedRef.current) return
      if (sbError) throw sbError
      setLesson(data as LessonWithFamily)
    } catch (err) {
      if (!mountedRef.current) return
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      if (mountedRef.current) setLoading(false)
    }
  }, [lessonId])

  useEffect(() => {
    fetchLesson()
  }, [fetchLesson])

  return { lesson, loading, error, refetch: fetchLesson }
}
