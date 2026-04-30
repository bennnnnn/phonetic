import { useState, useEffect, useCallback } from 'react'
import { View, Text, Pressable, StyleSheet } from 'react-native'
import Animated, {
  useSharedValue, useAnimatedStyle,
  withSpring, withTiming, withSequence,
} from 'react-native-reanimated'
import { Ionicons } from '@expo/vector-icons'
import AudioButton from '@/components/lesson/AudioButton'
import TranslationPill from '@/components/ui/TranslationPill'
import XpPop from '@/components/ui/XpPop'
import { haptics } from '@/lib/haptics'
import { soundEngine } from '@/lib/sounds'
import { colors, spacing, radius, fontSize } from '@/lib/tokens'
import { WORD_PRONUNCIATIONS } from '@/data/vocabThemes'
import { VERB_PRONUNCIATIONS } from '@/data/irregularVerbs'
import { WORD_EMOJI } from '@/lib/practiceThemes'
import type { Word } from '@/lib/types'

/**
 * Simple past-tense example sentences for irregular verbs.
 * Key = present tense verb (lowercase), value = past-tense example.
 */
const VERB_EXAMPLES: Record<string, string> = {
  buy:    'I bought a new phone yesterday.',
  catch:  'She caught the ball.',
  teach:  'He taught English for ten years.',
  fight:  'They fought bravely in the war.',
  bring:  'She brought snacks to the party.',
  think:  'I thought about it all day.',
  seek:   'He sought advice from a lawyer.',
  reach:  'We reached the top of the mountain.',
  beseech: 'She besought him for help.',
  ring:   'The bell rang at noon.',
  sing:   'She sang a beautiful song.',
  spring: 'The cat sprang onto the table.',
  swim:   'He swam across the lake.',
  begin:  'The movie began at eight.',
  drink:  'We drank water after the run.',
  sink:   'The ship sank slowly.',
  shrink: 'My shirt shrank in the wash.',
  stink:  'The garbage stank all week.',
  spin:   'He spun around in circles.',
  slink:  'The fox slunk into the bushes.',
  sit:    'She sat down on the grass.',
  spit:   'He spat out the seeds.',
  win:    'We won the game last night.',
  dig:    'The dog dug a hole in the yard.',
  stick:  'The key stuck in the lock.',
  sting:  'A bee stung my arm.',
  strike: 'He struck the match.',
  swing:  'She swung the bat hard.',
  hang:   'They hung the picture on the wall.',
  cling:  'The baby clung to her mother.',
  fling:  'He flung the door open.',
  keep:   'I kept the letter for years.',
  sleep:  'She slept for twelve hours.',
  sweep:  'He swept the kitchen floor.',
  weep:   'The child wept after falling.',
  creep:  'The cat crept into the room.',
  leap:   'The frog leapt into the pond.',
  send:   'I sent the package yesterday.',
  spend:  'She spent all her money.',
  lend:   'He lent me his bike.',
  bend:   'She bent down to pick it up.',
  build:  'They built a house in the woods.',
  rend:   'The storm rent the roof apart.',
  sell:   'He sold his old car.',
  tell:   'She told me a secret.',
  spell:  'I spelt my name for the cashier.',
  dwell:  'They dwelt in a small village.',
  smell:  'I smelt something burning.',
  blow:   'The wind blew the leaves away.',
  grow:   'The tree grew very tall.',
  know:   'I knew the answer immediately.',
  throw:  'He threw the ball to me.',
  draw:   'She drew a picture of a cat.',
  fly:    'We flew to Paris last summer.',
  show:   'He showed me his new car.',
  withdraw: 'She withdrew money from the bank.',
  overflow: 'The river overflowed its banks.',
  wear:   'She wore a red dress to the party.',
  bear:   'He bore the pain bravely.',
  tear:   'She tore the paper in half.',
  swear:  'He swore to tell the truth.',
  feel:   'I felt a cold breeze.',
  kneel:  'She knelt down to pray.',
  deal:   'He dealt with the problem quickly.',
  mean:   'I meant what I said.',
  dream:  'I dreamt about flying last night.',
  lean:   'She leant against the wall.',
  find:   'I found my keys under the couch.',
  grind:  'He ground the coffee beans.',
  wind:   'She wound the clock before bed.',
  bind:   'They bound the book in leather.',
  meet:   'I met her at the coffee shop.',
  feed:   'She fed the cat this morning.',
  speed:  'The car sped down the highway.',
  bleed:  'His nose bled for ten minutes.',
  breed:  'They bred horses on the farm.',
  lead:   'She led the team to victory.',
  read:   'I read that book last year.',
  plead:  'He pled guilty in court.',
  leave:  'She left the office at five.',
  bereave: 'The family was bereft of hope.',
  get:    'I got a letter in the mail.',
  forget: 'I forgot to lock the door.',
  choose: 'She chose the blue dress.',
  freeze: 'The lake froze overnight.',
  wake:   'I woke up at six this morning.',
  awake:  'She awoke to the sound of birds.',
  break:  'He broke the window by accident.',
  steal:  'Someone stole my wallet on the bus.',
  speak:  'She spoke to the manager.',
  weave:  'She wove a beautiful basket.',
  tread:  'He trod carefully on the ice.',
  whelp:  'The dog whelped a litter of pups.',
  write:  'I wrote a letter to my grandmother.',
  ride:   'She rode her bike to school.',
  rise:   'The sun rose at six in the morning.',
  drive:  'He drove us to the airport.',
  hide:   'She hid the present in the closet.',
  bite:   'The dog bit the mailman.',
  slide:  'The kids slid down the hill.',
  stride: 'He strode confidently into the room.',
  come:   'She came to the party late.',
  become: 'He became a doctor after years of study.',
  run:    'I ran five kilometres this morning.',
  eat:    'We ate dinner at a nice restaurant.',
  give:   'She gave me a birthday present.',
  forgive: 'He forgave her for the mistake.',
  take:   'I took the train to work today.',
  mistake: 'She mistook him for her brother.',
  shake:  'He shook hands with the president.',
  see:    'I saw a fantastic movie last night.',
  fall:   'She fell off her bike.',
  lie:    'He lay down for a nap.',
  beat:   'Our team beat them three to one.',
  go:     'We went to the beach yesterday.',
  do:     'She did her homework before dinner.',
  have:   'I had breakfast at seven.',
  make:   'He made a cake for my birthday.',
  stand:  'We stood in line for an hour.',
  understand: 'I understood the lesson perfectly.',
  pay:    'She paid the bill at the restaurant.',
  say:    'He said hello to everyone.',
  hear:   'I heard a strange noise outside.',
  hold:   'She held the baby in her arms.',
}

type Props = {
  word: Word
  onMaster: () => void
  onSkip: () => void
  index: number
  total: number
  words: Word[]
  masteredIds: string[]
  skippedIds: string[]
}

/**
 * A polished word-learning card with:
 * - Slide-in entry animation
 * - Consonant / pattern color split
 * - Translation pill
 * - "Got it" button with XP popup
 * - "Skip" button with subtle feedback
 * - Audio button
 */

// ── WordFocusCard ──────────────────────────────────────────────────────────────
export default function WordFocusCard({ word, onMaster, onSkip, index, total, words, masteredIds, skippedIds }: Props) {
  const [showXp, setShowXp] = useState(false)

  // Entry animation
  const entryTx = useSharedValue(30)
  const entryOp = useSharedValue(0)

  // Button press feedback
  const skipScale = useSharedValue(1)
  const masterScale = useSharedValue(1)

  useEffect(() => {
    entryTx.value = withSpring(0, { damping: 18, stiffness: 200 })
    entryOp.value = withTiming(1, { duration: 180 })
  }, [word.id])

  const cardStyle = useAnimatedStyle(() => ({
    opacity: entryOp.value,
    transform: [{ translateX: entryTx.value }],
  }))
  const skipStyle = useAnimatedStyle(() => ({ transform: [{ scale: skipScale.value }] }))
  const masterStyle = useAnimatedStyle(() => ({ transform: [{ scale: masterScale.value }] }))

  const handleSkipPress = useCallback(() => {
    skipScale.value = withSequence(
      withSpring(0.93, { damping: 8, stiffness: 400 }),
      withSpring(1, { damping: 10, stiffness: 300 }),
    )
    haptics.tap()
    soundEngine.play('tap', 0.3)
    onSkip()
  }, [onSkip])

  const handleMasterPress = useCallback(() => {
    masterScale.value = withSequence(
      withSpring(0.95, { damping: 8, stiffness: 400 }),
      withSpring(1.03, { damping: 10, stiffness: 300 }),
      withSpring(1, { damping: 15, stiffness: 400 }),
    )
    haptics.success()
    soundEngine.play('wordRevealed')
    setShowXp(true)
    setTimeout(() => setShowXp(false), 900)
    onMaster()
  }, [onMaster])

  return (
    <View style={styles.outer}>

      {/* XP popup over the master button */}
      <XpPop amount={5} visible={showXp} color={colors.primary} />

      <Animated.View style={[styles.card, cardStyle]}>
        {/* Emoji — centered in the card (skip for verbs) */}
        {!word.pastText && WORD_EMOJI[word.text.toLowerCase()] && (
          <View style={styles.emojiRow}>
            <Text style={styles.wordEmoji}>{WORD_EMOJI[word.text.toLowerCase()]}</Text>
          </View>
        )}

        {/* Word + speakers — present and past aligned to their own speakers */}
        <View style={styles.wordContent}>
          {/* Present tense row */}
          <View style={styles.wordRow}>
            <View style={styles.wordLabel}>
              <Text style={styles.wordText}>
                <Text style={styles.consonant}>{word.consonant}</Text>
                <Text style={styles.pattern}>{word.pattern}</Text>
              </Text>
              <Text style={styles.pronunciationInline}>{word.pronunciation || WORD_PRONUNCIATIONS[word.text.toLowerCase()] || word.phoneme}</Text>
            </View>
            <AudioButton
              audioUrl={word.audio_url}
              fallbackText={word.text}
              size="lg"
              accessibilityLabel={`Hear ${word.text}`}
            />
          </View>

          {/* Past tense row (verbs only) */}
          {word.pastText ? (
            <View style={styles.wordRow}>
              <View style={styles.wordLabel}>
                <Text style={styles.pastLabel}>past: </Text>
                <Text style={styles.pastText}>{word.pastText}</Text>
                <Text style={styles.pronunciationInline}> ({VERB_PRONUNCIATIONS[word.pastText.toLowerCase()] || word.pastText})</Text>
              </View>
              <AudioButton
                audioUrl=""
                fallbackText={word.pastText}
                size="sm"
                accessibilityLabel={`Hear ${word.pastText}`}
              />
            </View>
          ) : null}

          {/* Example sentence (verbs only) */}
          {word.pastText && VERB_EXAMPLES[word.text.toLowerCase()] ? (
            <Text style={styles.exampleSentence}>
              {VERB_EXAMPLES[word.text.toLowerCase()]}
            </Text>
          ) : null}

          {/* Non-verb: show definition below */}
          {!word.pastText && word.definition ? (
            <Text style={styles.definition}>{word.definition}</Text>
          ) : null}

          <TranslationPill word={word.text} />
        </View>

        <View style={styles.actionRow}>
          <Animated.View style={[{ flex: 1 }, skipStyle]}>
            <Pressable
              style={styles.skipBtn}
              onPress={handleSkipPress}
              accessibilityRole="button"
              accessibilityLabel="Skip this word"
            >
              <Ionicons name="close-outline" size={16} color={colors.textMuted} />
              <Text style={styles.skipBtnText}>skip</Text>
            </Pressable>
          </Animated.View>
          <Animated.View style={[{ flex: 1.5 }, masterStyle]}>
            <Pressable
              style={styles.masterBtn}
              onPress={handleMasterPress}
              accessibilityRole="button"
              accessibilityLabel="Got it, word mastered"
            >
              <Ionicons name="checkmark-circle" size={18} color="#fff" />
              <Text style={styles.masterBtnText}>got it</Text>
            </Pressable>
          </Animated.View>
        </View>
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  outer: {
    gap: spacing.md,
    marginTop: spacing.xs,
  },

  // Card
  card: {
    backgroundColor: colors.surface, borderRadius: 24,
    padding: spacing.xl, gap: spacing.md,
    shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 }, elevation: 4,
    overflow: 'hidden',
  },
  // Word display
  wordContent: { gap: spacing.lg },
  wordRow: {
    flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between',
  },
  wordLabel: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'baseline', flex: 1, gap: 4 },
  emojiRow: { alignItems: 'center', marginBottom: spacing.sm, marginTop: spacing.xs },
  wordEmoji: { fontSize: 64, lineHeight: 72 },
  wordText: { fontSize: 34, fontFamily: 'Georgia', lineHeight: 42, fontWeight: '700' },
  consonant: { color: colors.consonant },
  pattern:   { color: colors.pattern },
  pronunciation:   { fontSize: fontSize.lg, color: colors.textMuted },
  pronunciationInline: { fontSize: fontSize.md, color: colors.textMuted },
  pastLabel: { fontSize: fontSize.md, color: colors.textMuted, fontWeight: '600' },
  pastText: { fontSize: 28, fontFamily: 'Georgia', lineHeight: 36, color: colors.text, fontWeight: '600' },
  exampleSentence: {
    fontSize: fontSize.md, color: colors.textSecondary, fontStyle: 'italic',
    lineHeight: 20,
  },
  definition: { fontSize: fontSize.md, color: colors.text, lineHeight: 22 },

  // Buttons
  actionRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  skipBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4,
    backgroundColor: colors.neutral, borderRadius: radius.md,
    paddingVertical: spacing.md,
  },
  skipBtnText: { fontSize: fontSize.md, color: colors.textMuted, fontWeight: '500' },
  masterBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4,
    backgroundColor: colors.primary, borderRadius: radius.md,
    paddingVertical: spacing.md,
    shadowColor: colors.primaryDark,
    shadowOpacity: 0.3, shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 }, elevation: 4,
  },
  masterBtnText: { fontSize: fontSize.md, color: '#fff', fontWeight: '700' },
})
