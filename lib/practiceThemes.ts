/**
 * Old barrel file — kept for backward compatibility.
 * Import from '@/data' instead for new code.
 */
export {
  SPEECH_LOCALES,
  GROUP_NODES,
  IRREGULAR_VERB_GROUPS, IRREGULAR_VERB_NODES,
  HOMOPHONE_GROUPS, HOMOPHONE_NODES,
  WORD_EMOJI,
  getGroupLabel, getGroupData,
} from '@/data'

import { WORD_THEMES as _WORD_THEMES } from '@/data'
import type { VocabWord } from '@/data/vocabThemes'

/** Widened type to allow string indexing — safe because the data is the same object */
export const WORD_THEMES = _WORD_THEMES as Record<string, { emoji: string; desc: string; words: VocabWord[] } | undefined>
