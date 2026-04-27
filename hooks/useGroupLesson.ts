import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { WORD_THEMES } from '@/lib/practiceThemes'
import type { Word } from '@/lib/types'

export function useGroupLesson(theme: string) {
  const [words, setWords] = useState<Word[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    const themeWords = WORD_THEMES[theme]?.words ?? []
    if (!themeWords.length) {
      setWords([])
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    const { data, error: err } = await supabase
      .from('words')
      .select('id, text, consonant, pattern, phoneme, definition, audio_url, slow_audio_url')
      .in('text', themeWords)
    if (err) setError(err.message)
    else setWords((data as Word[]) ?? [])
    setLoading(false)
  }, [theme])

  useEffect(() => { void load() }, [load])

  return { words, loading, error, refetch: load }
}
