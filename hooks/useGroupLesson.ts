import { useEffect, useState, useCallback } from 'react'
import { WORD_THEMES, IRREGULAR_VERB_GROUPS, HOMOPHONE_GROUPS } from '@/lib/practiceThemes'
import { PROVERB_GROUPS } from '@/data/proverbs'
import { IDIOM_GROUPS } from '@/data/idioms'
import { PHRASAL_VERB_GROUPS } from '@/data/phrasalVerbs'
import { HOMOPHONE_DEFINITIONS } from '@/data/homophones'
import { WORD_PRONUNCIATIONS } from '@/data/vocabThemes'
import { VERB_PRONUNCIATIONS } from '@/data/irregularVerbs'
import type { Word } from '@/lib/types'

export function useGroupLesson(theme: string) {
  const [words, setWords] = useState<Word[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(() => {
    const themeData   = WORD_THEMES[theme]
    const verbGroup   = IRREGULAR_VERB_GROUPS[theme]
    const homoGroup   = HOMOPHONE_GROUPS[theme]
    const proverbData = PROVERB_GROUPS[theme]
    const idiomData   = IDIOM_GROUPS[theme]
    const phrasalData = PHRASAL_VERB_GROUPS[theme]

    let built: Word[] | null = null

    if (proverbData) {
      built = proverbData.proverbs.map((p, i) => ({
        id: `proverb:${theme}:${i}`, text: p.text,
        consonant: '', pattern: '', definition: p.meaning,
        phoneme: '', pronunciation: '', audio_url: '', slow_audio_url: '',
      }))
    } else if (verbGroup) {
      built = verbGroup.verbs.map((text, i) => ({
        id: `verb:${theme}:${text}`, text,
        consonant: '', pattern: text,
        definition: verbGroup.past[i] || verbGroup.pastPart[i]
          ? `past: ${verbGroup.past[i] ?? ''} · past participle: ${verbGroup.pastPart[i] ?? ''}`
          : '',
        phoneme: '', pronunciation: VERB_PRONUNCIATIONS[text.toLowerCase()] ?? text,
        audio_url: '', slow_audio_url: '',
        pastText: verbGroup.past[i] ?? '', pastPart: verbGroup.pastPart[i] ?? '',
      }))
    } else if (homoGroup) {
      built = homoGroup.words.map((w) => {
        const text = typeof w === 'string' ? w : w.text
        const def  = typeof w === 'string' ? '' : (w.definition ?? HOMOPHONE_DEFINITIONS[text.toLowerCase()] ?? '')
        return {
          id: `homo:${theme}:${text}`, text,
          consonant: '', pattern: text, definition: def,
          phoneme: '', pronunciation: WORD_PRONUNCIATIONS[text.toLowerCase()] ?? text,
          audio_url: '', slow_audio_url: '',
        }
      })
    } else if (idiomData) {
      built = idiomData.idioms.map((item, idx) => ({
        id: `idiom:${theme}:${idx}`, text: item.text,
        consonant: '', pattern: item.text, definition: item.meaning,
        phoneme: '', pronunciation: '', audio_url: '', slow_audio_url: '',
        example: item.example,
      }))
    } else if (phrasalData) {
      built = phrasalData.verbs.map((v, idx) => ({
        id: `phrasal:${theme}:${idx}`, text: v.text,
        consonant: '', pattern: v.text, definition: v.definition,
        phoneme: '', pronunciation: '', audio_url: '', slow_audio_url: '',
        example: v.example,
      }))
    } else if (themeData) {
      built = themeData.words.map((entry) => {
        const text = typeof entry === 'string' ? entry : entry.text
        const pron = typeof entry === 'string'
          ? (WORD_PRONUNCIATIONS[text.toLowerCase()] ?? text)
          : (entry.pron ?? WORD_PRONUNCIATIONS[text.toLowerCase()] ?? text)
        return {
          id: `vocab:${theme}:${text}`, text,
          consonant: '', pattern: text, definition: '',
          phoneme: '', pronunciation: pron, audio_url: '', slow_audio_url: '',
        }
      })
    }

    setWords(built ?? [])
    setLoading(false)
  }, [theme])

  useEffect(() => { load() }, [load])

  return { words, loading, error: null as string | null, refetch: load }
}
