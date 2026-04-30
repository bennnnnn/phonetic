import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { WORD_THEMES, IRREGULAR_VERB_GROUPS, HOMOPHONE_GROUPS } from '@/lib/practiceThemes'
import { HOMOPHONE_DEFINITIONS } from '@/data/homophones'
import { WORD_PRONUNCIATIONS } from '@/data/vocabThemes'
import { VERB_PRONUNCIATIONS } from '@/data/irregularVerbs'
import type { Word } from '@/lib/types'

export function useGroupLesson(theme: string) {
  const [words, setWords] = useState<Word[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    const themeData = WORD_THEMES[theme]
    const verbGroup = IRREGULAR_VERB_GROUPS[theme]
    const homoGroup = HOMOPHONE_GROUPS[theme]

    // — Irregular verbs: build from local data
    if (verbGroup) {
      const built: Word[] = verbGroup.verbs.map((text, i) => ({
        id: `verb:${theme}:${text}`,
        text,
        consonant: '',
        pattern: text,
        definition: verbGroup.past[i] ? `past: ${verbGroup.past[i] ?? ''}` : '',
        phoneme: '',
        pronunciation: VERB_PRONUNCIATIONS[text.toLowerCase()] ?? text,
        audio_url: '',
        slow_audio_url: '',
        pastText: verbGroup.past[i] ?? '',
      }))
      setWords(built)
      setLoading(false)
      return
    }

    // — Homophones: build from local data with per-word definitions
    if (homoGroup) {
      const built: Word[] = homoGroup.words.map((w) => {
        const text = typeof w === 'string' ? w : w.text
        const def = typeof w === 'string' ? '' : (w.definition ?? HOMOPHONE_DEFINITIONS[text.toLowerCase()] ?? '')
        return {
          id: `homo:${theme}:${text}`,
          text,
          consonant: '',
          pattern: text,
          definition: def,
          phoneme: '',
          pronunciation: WORD_PRONUNCIATIONS[text.toLowerCase()] ?? text,
          audio_url: '',
          slow_audio_url: '',
        }
      })
      setWords(built)
      setLoading(false)
      return
    }

    // — Vocab themes: build from local word data (no DB dependency)
    if (themeData) {
      const built: Word[] = themeData.words.map((entry) => {
        const text = typeof entry === 'string' ? entry : entry.text
        const pron = typeof entry === 'string'
          ? (WORD_PRONUNCIATIONS[text.toLowerCase()] ?? text)
          : (entry.pron ?? WORD_PRONUNCIATIONS[text.toLowerCase()] ?? text)
        return {
          id: `vocab:${theme}:${text}`,
          text,
          consonant: '',
          pattern: text,
          definition: '',
          phoneme: '',
          pronunciation: pron,
          audio_url: '',
          slow_audio_url: '',
        }
      })
      setWords(built)
      setLoading(false)
      return
    }

    // — Fallback: try Supabase (legacy support)
    const themeWords: Array<string | { text: string }> = []
    if (!themeWords.length) {
      setWords([])
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    const wordTexts = themeWords.map((w: string | { text: string }) => (typeof w === 'string' ? w : w.text))
    const { data, error: err } = await supabase
      .from('words')
      .select('id, text, consonant, pattern, phoneme, definition, audio_url, slow_audio_url')
      .in('text', wordTexts)
    if (err) setError(err.message)
    else setWords((data as Word[]) ?? [])
    setLoading(false)
  }, [theme])

  useEffect(() => { void load() }, [load])

  return { words, loading, error, refetch: load }
}
