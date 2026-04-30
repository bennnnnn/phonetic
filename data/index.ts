/**
 * Barrel file — re-exports all content data.
 * Import from '@/data' instead of individual files.
 */
import { WORD_THEMES, GROUP_NODES } from '@/data/vocabThemes'
import { IRREGULAR_VERB_GROUPS, IRREGULAR_VERB_NODES } from '@/data/irregularVerbs'
import { HOMOPHONE_GROUPS, HOMOPHONE_NODES } from '@/data/homophones'

export { WORD_THEMES, GROUP_NODES }
export { IRREGULAR_VERB_GROUPS, IRREGULAR_VERB_NODES }
export { HOMOPHONE_GROUPS, HOMOPHONE_NODES }
export { WORD_EMOJI } from '@/data/wordEmoji'
export { SPEECH_LOCALES } from '@/data/speechLocales'
export { LANGUAGES, languageByCode } from '@/data/languages'
export type { Language } from '@/data/languages'

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

  return null
}

/**
 * Get the raw data for a group theme by its ID.
 */
export function getGroupData(themeId: string): { words: string[]; emoji: string; rule: string } | null {
  const themes = { ...WORD_THEMES, ...IRREGULAR_VERB_GROUPS, ...HOMOPHONE_GROUPS } as unknown as Record<string, { words?: Array<string | { text: string }>; verbs?: string[]; emoji: string; rule?: string; desc?: string }>
  const data = themes[themeId]
  if (!data) return null
  return {
    words: (data.words ?? data.verbs ?? []).map((w) => typeof w === 'string' ? w : w.text),
    emoji: data.emoji,
    rule: data.rule ?? data.desc ?? '',
  }
}
