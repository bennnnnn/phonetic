/**
 * Barrel file — re-exports all content data.
 * Import from '@/data' instead of individual files.
 */
import { WORD_THEMES, GROUP_NODES } from '@/data/vocabThemes'
import { IRREGULAR_VERB_GROUPS, IRREGULAR_VERB_NODES } from '@/data/irregularVerbs'
import { HOMOPHONE_GROUPS, HOMOPHONE_NODES } from '@/data/homophones'
import { IDIOM_GROUPS, IDIOM_NODES } from '@/data/idioms'
import { PHRASAL_VERB_GROUPS, PHRASAL_VERB_NODES } from '@/data/phrasalVerbs'

export { WORD_THEMES, GROUP_NODES }
export { IRREGULAR_VERB_GROUPS, IRREGULAR_VERB_NODES }
export { HOMOPHONE_GROUPS, HOMOPHONE_NODES }
export { IDIOM_GROUPS, IDIOM_NODES }
export { PHRASAL_VERB_GROUPS, PHRASAL_VERB_NODES } from '@/data/phrasalVerbs'
export { WORD_EMOJI } from '@/data/wordEmoji'
export { SPEECH_LOCALES } from '@/data/speechLocales'
export { LANGUAGES, languageByCode } from '@/data/languages'
export type { Language } from '@/data/languages'
export { WORD_EXAMPLES } from '@/data/examples'
export { SILENT_LETTERS } from '@/data/silentLetters'
export type { SilentLetter } from '@/data/silentLetters'

/**
 * Get a display-friendly representation of a content group.
 * Works for any group type (vocab, verbs, homophones).
 */
export function getGroupLabel(themeId: string): { emoji: string; name: string } | null {
  const fromVocab = GROUP_NODES.find((g) => g.id === themeId)
  if (fromVocab) return { emoji: fromVocab.emoji, name: fromVocab.name }

  const fromVerbs = IRREGULAR_VERB_NODES.find((g) => g.id === themeId)
  if (fromVerbs) return { emoji: fromVerbs.emoji, name: fromVerbs.name }

  const fromHomo = HOMOPHONE_NODES.find((g) => g.id === themeId)
  if (fromHomo) return { emoji: fromHomo.emoji, name: fromHomo.name }

  const fromIdioms = IDIOM_NODES.find((g) => g.id === themeId)
  if (fromIdioms) return { emoji: fromIdioms.emoji, name: fromIdioms.name }

  const fromPhrasal = PHRASAL_VERB_NODES.find((g) => g.id === themeId)
  if (fromPhrasal) return { emoji: fromPhrasal.emoji, name: fromPhrasal.name }

  return null
}

/**
 * Get the raw data for a group theme by its ID.
 */
export function getGroupData(themeId: string): { words: string[]; emoji: string; rule: string } | null {
  const basicThemes = { ...WORD_THEMES, ...IRREGULAR_VERB_GROUPS, ...HOMOPHONE_GROUPS } as unknown as Record<string, { words?: Array<string | { text: string }>; verbs?: string[]; emoji: string; rule?: string; desc?: string }>
  const basic = basicThemes[themeId]
  if (basic) {
    return {
      words: (basic.words ?? basic.verbs ?? []).map((w) => typeof w === 'string' ? w : w.text),
      emoji: basic.emoji,
      rule: basic.rule ?? basic.desc ?? '',
    }
  }

  const idiom = IDIOM_GROUPS[themeId]
  if (idiom) {
    return {
      words: idiom.idioms.map((i) => i.text),
      emoji: idiom.emoji,
      rule: (idiom as unknown as { desc?: string }).desc ?? '',
    }
  }

  const phrasal = PHRASAL_VERB_GROUPS[themeId]
  if (phrasal) {
    return {
      words: phrasal.verbs.map((v) => v.text),
      emoji: phrasal.emoji,
      rule: (phrasal as unknown as { desc?: string }).desc ?? '',
    }
  }

  return null
}
