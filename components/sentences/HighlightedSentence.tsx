import { Text, StyleSheet } from 'react-native'
import { splitToken, normWord } from '@/lib/sentenceHelpers'
import { colors, fontSize } from '@/lib/tokens'
import type { Word } from '@/lib/types'

type Props = {
  sentence: string
  wordByNorm: Map<string, Word>
  onWordTap: (word: Word) => void
}

export default function HighlightedSentence({ sentence, wordByNorm, onWordTap }: Props) {
  const tokens = sentence.split(/\s+/).filter(Boolean)

  return (
    <Text style={styles.sentenceBlock}>
      {tokens.map((raw, i) => {
        const { lead, core, trail } = splitToken(raw)
        const key = `${i}-${raw}`
        const w = core ? wordByNorm.get(normWord(core)) : undefined

        if (!w) {
          return (
            <Text key={key} style={styles.plain}>
              {i > 0 ? ' ' : ''}{raw}
            </Text>
          )
        }

        return (
          <Text key={key}>
            {i > 0 ? ' ' : ''}
            <Text style={styles.plain}>{lead}</Text>
            <Text onPress={() => onWordTap(w)} accessibilityRole="link" style={styles.wordWrap}>
              <Text style={{ fontFamily: 'Georgia' }}>
                <Text style={styles.con}>{w.consonant}</Text>
                <Text style={styles.pat}>{w.pattern}</Text>
              </Text>
            </Text>
            <Text style={styles.plain}>{trail}</Text>
          </Text>
        )
      })}
    </Text>
  )
}

const styles = StyleSheet.create({
  sentenceBlock: {
    fontSize: fontSize.xl,
    lineHeight: 32,
    color: colors.text,
  },
  plain: {
    fontSize: fontSize.xl,
    lineHeight: 32,
    color: colors.text,
    fontWeight: '400',
  },
  wordWrap: {
    fontSize: fontSize.xl,
    lineHeight: 32,
    textDecorationLine: 'underline',
    textDecorationColor: colors.primaryMid,
  },
  con: {
    color: colors.consonant,
    fontSize: fontSize.xl,
    lineHeight: 32,
  },
  pat: {
    color: colors.pattern,
    fontSize: fontSize.xl,
    lineHeight: 32,
  },
})
