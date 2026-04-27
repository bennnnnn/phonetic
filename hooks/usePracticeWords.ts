import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { Word } from '@/lib/types'

export type PracticeWord = Word & {
  familyPattern: string
  lessonId: string | null
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function usePracticeWords() {
  const [allWords, setAllWords] = useState<PracticeWord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchWords = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Join lessons so we can persist mastered words per lesson
      const { data, error: sbErr } = await supabase
        .from('word_families')
        .select('pattern, words(*), lessons(id)')

      if (sbErr) throw sbErr

      const flat: PracticeWord[] = []
      for (const fam of (data ?? []) as any[]) {
        const lessonId: string | null = (fam.lessons as { id: string }[] | null)?.[0]?.id ?? null
        for (const w of fam.words ?? []) {
          flat.push({ ...w, familyPattern: fam.pattern, lessonId })
        }
      }
      setAllWords(shuffle(flat))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load words')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void fetchWords() }, [fetchWords])

  return { allWords, loading, error, refetch: fetchWords }
}
