import { useState, useEffect, useCallback } from 'react'
import { View, Text, Pressable, StyleSheet, Dimensions } from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, {
  useSharedValue, useAnimatedStyle,
  withSpring, withTiming, withRepeat, withSequence,
  interpolate, runOnJS,
} from 'react-native-reanimated'
import { Ionicons } from '@expo/vector-icons'
import AudioButton from '@/components/lesson/AudioButton'
import TranslationPill from '@/components/ui/TranslationPill'
import TappableTranslatedSentence from '@/components/ui/TappableTranslatedSentence'
import XpPop from '@/components/ui/XpPop'
import { haptics } from '@/lib/haptics'
import { soundEngine } from '@/lib/sounds'
import { useAudio } from '@/hooks/useAudio'
import { colors, spacing, radius, fontSize } from '@/lib/tokens'
import { WORD_PRONUNCIATIONS } from '@/data/vocabThemes'
import { VERB_PRONUNCIATIONS } from '@/data/irregularVerbs'
import { WORD_EXAMPLES } from '@/data/examples'
import { WORD_EMOJI } from '@/data/wordEmoji'
import { PHONICS_RESPELLINGS } from '@/data/respellings'
import type { Word } from '@/lib/types'
import WaveformBars from '@/components/ui/WaveformBars'

const SCREEN_W = Dimensions.get('window').width
const SWIPE_THRESHOLD = SCREEN_W * 0.3

// ── Animated swipe hint pills ─────────────────────────────────────────────────

function AnimatedHintPill() {
  const tx = useSharedValue(0)
  useEffect(() => {
    tx.value = withRepeat(
      withSequence(withTiming(8, { duration: 700 }), withTiming(-8, { duration: 700 })),
      -1, true,
    )
  }, [])
  const leftStyle = useAnimatedStyle(() => ({ transform: [{ translateX: tx.value * -1 }] }))
  const rightStyle = useAnimatedStyle(() => ({ transform: [{ translateX: tx.value }] }))
  return (
    <View style={hintStyles.row} pointerEvents="none">
      <Animated.View style={[hintStyles.pill, leftStyle]}>
        <Ionicons name="arrow-back" size={12} color={colors.textMuted} />
        <Text style={hintStyles.text}>not yet</Text>
      </Animated.View>
      <Animated.View style={[hintStyles.pill, rightStyle]}>
        <Text style={hintStyles.text}>got it</Text>
        <Ionicons name="arrow-forward" size={12} color={colors.textMuted} />
      </Animated.View>
    </View>
  )
}

const hintStyles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: spacing.sm, paddingBottom: spacing.sm, marginTop: 'auto' },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.neutral, borderRadius: radius.full, paddingVertical: 6, paddingHorizontal: 12 },
  text: { fontSize: fontSize.xs, color: colors.textMuted, fontWeight: '600' },
})

// ── Verb example sentences ────────────────────────────────────────────────────

const VERB_EXAMPLES: Record<string, string> = {
  buy:'I bought a new phone yesterday.', catch:'She caught the ball.', teach:'He taught English for ten years.',
  fight:'They fought bravely in the war.', bring:'She brought snacks to the party.', think:'I thought about it all day.',
  seek:'He sought advice from a lawyer.', reach:'We reached the top of the mountain.', beseech:'She besought him for help.',
  ring:'The bell rang at noon.', sing:'She sang a beautiful song.', spring:'The cat sprang onto the table.',
  swim:'He swam across the lake.', begin:'The movie began at eight.', drink:'We drank water after the run.',
  sink:'The ship sank slowly.', shrink:'My shirt shrank in the wash.', stink:'The garbage stank all week.',
  spin:'He spun around in circles.', slink:'The fox slunk into the bushes.', sit:'She sat down on the grass.',
  spit:'He spat out the seeds.', win:'We won the game last night.', dig:'The dog dug a hole in the yard.',
  stick:'The key stuck in the lock.', sting:'A bee stung my arm.', strike:'He struck the match.',
  swing:'She swung the bat hard.', hang:'They hung the picture on the wall.', cling:'The baby clung to her mother.',
  fling:'He flung the door open.', keep:'I kept the letter for years.', sleep:'She slept for twelve hours.',
  sweep:'He swept the kitchen floor.', weep:'The child wept after falling.', creep:'The cat crept into the room.',
  leap:'The frog leapt into the pond.', send:'I sent the package yesterday.', spend:'She spent all her money.',
  lend:'He lent me his bike.', bend:'She bent down to pick it up.', build:'They built a house in the woods.',
  rend:'The storm rent the roof apart.', sell:'He sold his old car.', tell:'She told me a secret.',
  spell:'I spelt my name for the cashier.', dwell:'They dwelt in a small village.', smell:'I smelt something burning.',
  blow:'The wind blew the leaves away.', grow:'The tree grew very tall.', know:'I knew the answer immediately.',
  throw:'He threw the ball to me.', draw:'She drew a picture of a cat.', fly:'We flew to Paris last summer.',
  show:'He showed me his new car.', withdraw:'She withdrew money from the bank.', overflow:'The river overflowed its banks.',
  wear:'She wore a red dress to the party.', bear:'He bore the pain bravely.', tear:'She tore the paper in half.',
  swear:'He swore to tell the truth.', feel:'I felt a cold breeze.', kneel:'She knelt down to pray.',
  deal:'He dealt with the problem quickly.', mean:'I meant what I said.', dream:'I dreamt about flying last night.',
  lean:'She leant against the wall.', find:'I found my keys under the couch.', grind:'He ground the coffee beans.',
  wind:'She wound the clock before bed.', bind:'They bound the book in leather.', meet:'I met her at the coffee shop.',
  feed:'She fed the cat this morning.', speed:'The car sped down the highway.', bleed:'His nose bled for ten minutes.',
  breed:'They bred horses on the farm.', lead:'She led the team to victory.', read:'I read that book last year.',
  plead:'He pled guilty in court.', leave:'She left the office at five.', bereave:'The family was bereft of hope.',
  get:'I got a letter in the mail.', forget:'I forgot to lock the door.', choose:'She chose the blue dress.',
  freeze:'The lake froze overnight.', wake:'I woke up at six this morning.', awake:'She awoke to the sound of birds.',
  break:'He broke the window by accident.', steal:'Someone stole my wallet on the bus.', speak:'She spoke to the manager.',
  weave:'She wove a beautiful basket.', tread:'He trod carefully on the ice.', whelp:'The dog whelped a litter of pups.',
  write:'I wrote a letter to my grandmother.', ride:'She rode her bike to school.', rise:'The sun rose at six in the morning.',
  drive:'He drove us to the airport.', hide:'She hid the present in the closet.', bite:'The dog bit the mailman.',
  slide:'The kids slid down the hill.', stride:'He strode confidently into the room.', come:'She came to the party late.',
  become:'He became a doctor after years of study.', run:'I ran five kilometres this morning.', eat:'We ate dinner at a nice restaurant.',
  give:'She gave me a birthday present.', forgive:'He forgave her for the mistake.', take:'I took the train to work today.',
  mistake:'She mistook him for her brother.', shake:'He shook hands with the president.', see:'I saw a fantastic movie last night.',
  fall:'She fell off her bike.', lie:'He lay down for a nap.', beat:'Our team beat them three to one.',
  go:'We went to the beach yesterday.', do:'She did her homework before dinner.', have:'I had breakfast at seven.',
  make:'He made a cake for my birthday.', stand:'We stood in line for an hour.', understand:'I understood the lesson perfectly.',
  pay:'She paid the bill at the restaurant.', say:'He said hello to everyone.', hear:'I heard a strange noise outside.',
  hold:'She held the baby in her arms.', let:'She let the dog out into the garden.', set:'He set the table for dinner.',
  put:'I put the keys on the counter.', cut:'She cut the cake into eight slices.', hurt:'He hurt his ankle during the game.',
  shut:'She shut the door quietly.', bet:'I bet my friend that it would rain today.', burst:'The balloon burst with a loud pop.',
  cast:'He cast his fishing line into the river.', cost:'The jacket cost more than I expected.', hit:'She hit the ball over the fence.',
  quit:'He quit his job to travel the world.', spread:'She spread butter on the toast.', upset:'The bad news upset her deeply.',
  split:'They split the pizza between them.', thrust:'He thrust his hands into his pockets.', knit:'She knit a warm scarf for the winter.',
  wed:'They wed in a small chapel by the sea.', rid:'She rid the house of pests.',
}

const VERB_DEFS: Record<string, string> = {
  buy:'get something by paying for it', catch:'grab or stop something moving', teach:'help someone learn',
  fight:'try to hurt or defeat someone', bring:'carry something to a place', think:'use your mind',
  seek:'look for', reach:'arrive at or stretch to get', beseech:'beg urgently', ring:'make a bell sound',
  sing:'make musical sounds with your voice', spring:'jump suddenly', swim:'move through water', begin:'start',
  drink:'swallow liquid', sink:'go down below the surface', shrink:'get smaller', stink:'smell very bad',
  spin:'turn around quickly', slink:'move quietly and sneakily', sit:'rest on a chair or surface',
  spit:'push liquid out of your mouth', win:'be the best in a game', dig:'make a hole in the ground',
  stick:'push something into or attach', sting:'cause a sharp pain', strike:'hit with force',
  swing:'move back and forth', hang:'suspend from above', cling:'hold tightly', fling:'throw with force',
  keep:'hold or continue to have', sleep:'rest with your eyes closed', sweep:'clean with a brush', weep:'cry',
  creep:'move slowly and quietly', leap:'jump high or far', send:'make something go somewhere',
  spend:'use money or time', lend:'give something temporarily', bend:'make something curved', build:'make a structure',
  rend:'tear apart violently', sell:'give something for money', tell:'say something to someone',
  spell:'write or say the letters of a word', dwell:'live in a place', smell:'notice with your nose',
  blow:'push air out of your mouth', grow:'get bigger', know:'have information in your mind',
  throw:'send something through the air', draw:'make a picture with a pen', fly:'move through the air',
  show:'let someone see something', withdraw:'take money out of a bank', overflow:'spill over the top',
  wear:'have on your body as clothing', bear:'carry or endure', tear:'pull apart by force', swear:'make a serious promise',
  feel:'experience with your body or emotions', kneel:'rest on your knees', deal:'handle something',
  mean:'have a particular meaning', dream:'have thoughts while sleeping', lean:'rest against something',
  find:'discover something', grind:'crush into small pieces', wind:'turn a handle or twist', bind:'tie together',
  meet:'come together with someone', feed:'give food to', speed:'go very fast', bleed:'lose blood',
  breed:'keep animals for babies', lead:'guide or be in charge', read:'look at words and understand',
  plead:'ask for something strongly', leave:'go away from', bereave:'lose a loved one', get:'receive or obtain',
  forget:'not remember', choose:'pick one from many', freeze:'become solid from cold', wake:'stop sleeping',
  awake:'wake up', break:'separate into pieces', steal:'take something without permission', speak:'talk',
  weave:'make cloth from threads', tread:'step on something', whelp:'give birth to puppies', write:'put words on paper',
  ride:'travel on a vehicle or animal', rise:'go up', drive:'control a vehicle', hide:'put where no one can see',
  bite:'cut with teeth', slide:'move smoothly', stride:'walk with long steps', come:'move toward someone',
  become:'change into something', run:'move quickly on foot', eat:'put food into your mouth and swallow',
  give:'hand something to someone', forgive:'stop being angry', take:'grab or carry', mistake:'think wrongly',
  shake:'move quickly back and forth', see:'use your eyes', fall:'drop down', lie:'rest flat on a surface',
  beat:'hit many times or defeat', go:'move from one place to another', do:'perform an action', have:'own or hold',
  make:'create something', stand:'be on your feet', understand:'know the meaning of something', pay:'give money for something',
  say:'speak words', hear:'notice sound with your ears', hold:'keep in your hand', let:'allow',
  set:'put something in a place', put:'place something somewhere', cut:'divide with a knife', hurt:'cause pain',
  shut:'close', bet:'risk money on a guess', burst:'break open suddenly', cast:'throw or send out',
  cost:'have a price of', hit:'touch with force', quit:'stop doing something', spread:'cover a larger area',
  upset:'make someone unhappy', split:'divide into parts', thrust:'push suddenly', knit:'make cloth from yarn',
  wed:'get married', rid:'remove something unwanted',
}

type Props = {
  word: Word; onMaster: () => void; onSkip: () => void
  index: number; total: number; words: Word[]
  masteredIds: string[]; skippedIds: string[]
}

export default function WordFocusCard({ word, onMaster, onSkip, index, total, words, masteredIds, skippedIds }: Props) {
  const [showXp, setShowXp] = useState(false)
  const [showHint, setShowHint] = useState(true)
  const [proverbPlaying, setProverbPlaying] = useState(false)
  const isProverb = word.id.startsWith('proverb:')

  const speakerPulse = useSharedValue(1)
  useEffect(() => {
    speakerPulse.value = proverbPlaying
      ? withRepeat(withSequence(withTiming(1.15, { duration: 400 }), withTiming(1, { duration: 400 })), -1, true)
      : withSpring(1, { damping: 10 })
  }, [proverbPlaying])

  const speakerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: speakerPulse.value }],
    opacity: withSpring(proverbPlaying ? 0.7 : 1, { damping: 12 }),
  }))

  const proverbAudio = useAudio()

  // Hide hint after first interaction
  useEffect(() => { if (index > 0) setShowHint(false) }, [index])

  // Entry animation
  const entryTx = useSharedValue(30)
  const entryOp = useSharedValue(0)

  // Swipe
  const translateX = useSharedValue(0)
  const swipeDirection = useSharedValue(0)
  const handledSV = useSharedValue(0)

  const doSkip = useCallback(() => {
    if (handledSV.value) return; handledSV.value = 1
    haptics.tap(); soundEngine.play('tap', 0.3); onSkip()
  }, [onSkip])

  const doMaster = useCallback(() => {
    if (handledSV.value) return; handledSV.value = 1
    haptics.success(); soundEngine.play('wordRevealed')
    setShowXp(true); setTimeout(() => setShowXp(false), 900); onMaster()
  }, [onMaster])

  const swipeGesture = Gesture.Pan()
    .onUpdate((e) => { translateX.value = e.translationX })
    .onEnd((e) => {
      if (Math.abs(e.translationX) > SWIPE_THRESHOLD) {
        const dir = e.translationX > 0 ? 1 : -1
        translateX.value = withTiming(dir * SCREEN_W * 1.5, { duration: 200 })
        runOnJS(e.translationX > 0 ? doMaster : doSkip)()
      } else {
        translateX.value = withSpring(0, { damping: 18, stiffness: 200 })
      }
    })

  useEffect(() => {
    entryTx.value = withSpring(0, { damping: 18, stiffness: 200 })
    entryOp.value = withTiming(1, { duration: 180 })
    translateX.value = 0; swipeDirection.value = 0; handledSV.value = 0
  }, [word.id])

  const cardStyle = useAnimatedStyle(() => ({ opacity: entryOp.value, transform: [{ translateX: entryTx.value }] }))
  const swipeCardStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }, { rotate: `${interpolate(translateX.value, [-SCREEN_W, 0, SCREEN_W], [-12, 0, 12], 'clamp')}deg` }],
  }))
  const overlayStyle = useAnimatedStyle(() => ({
    opacity: interpolate(Math.abs(translateX.value), [0, SWIPE_THRESHOLD], [0, 1], 'clamp'),
    backgroundColor: translateX.value > 0 ? colors.primary : colors.error,
  }))
  const overlayLabelStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(Math.abs(translateX.value), [0, SWIPE_THRESHOLD], [0.5, 1], 'clamp') }],
    opacity: translateX.value > 0 ? 1 : 0,
  }))
  const overlaySkipStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(Math.abs(translateX.value), [0, SWIPE_THRESHOLD], [0.5, 1], 'clamp') }],
    opacity: translateX.value < 0 ? 1 : 0,
  }))

  return (
    <View style={styles.outer}>
      <GestureDetector gesture={swipeGesture}>
        <Animated.View style={[styles.card, cardStyle, swipeCardStyle]}>
          <Animated.View style={[styles.swipeOverlay, overlayStyle]} pointerEvents="none">
            <Animated.Text style={[styles.swipeLabel, styles.swipeMastered, overlayLabelStyle]}>MASTERED</Animated.Text>
            <Animated.Text style={[styles.swipeLabel, styles.swipeNotYet, overlaySkipStyle]}>NOT YET</Animated.Text>
          </Animated.View>

          <XpPop amount={5} visible={showXp} color={colors.primary} />

          {!word.pastText && !isProverb && !word.consonant && !word.id.startsWith('homo:') && WORD_EMOJI[word.text.toLowerCase()] && (
            <View style={styles.emojiRow}><Text style={styles.wordEmoji}>{WORD_EMOJI[word.text.toLowerCase()]}</Text></View>
          )}

          {isProverb ? (
            <View style={styles.proverbContent}>
              <Text style={styles.proverbText}>{word.text}</Text>
              <Pressable onPress={async () => {
                await proverbAudio.play(word.audio_url, word.text)
              }} style={styles.proverbSpeakerRow}>
                <Animated.View style={[styles.proverbSpeakerMini, speakerStyle]}>
                  {proverbAudio.playing ? <WaveformBars playing={proverbAudio.playing} /> : <Ionicons name="volume-high" size={18} color="#fff" />}
                </Animated.View>
              </Pressable>
              <View style={[styles.defCard, { marginBottom: spacing.sm }]}>
                <Text style={styles.defCardLabel}>meaning:</Text>
                <Text style={styles.proverbAnswer}>{word.definition}</Text>
              </View>
              {(() => {
                const key = word.text.toLowerCase()
                const ex = WORD_EXAMPLES[key]
                if (!ex) return null
                return (
                  <View style={styles.defCard}>
                    <Text style={styles.defCardLabel}>example:</Text>
                    <Text style={styles.proverbExample}>{ex[0]}</Text>
                  </View>
                )
              })()}
              <View style={{ flex: 1 }} />
            </View>
          ) : (
            <View style={styles.wordContent}>
              <View style={styles.wordRow}>
                <View style={styles.wordLabel}>
                  <Text style={[styles.wordText, word.id.startsWith('idiom:') && styles.wordTextIdiom]}>
                    {word.id.startsWith('idiom:') ? word.text : (
                      <>
                        <Text style={styles.consonant}>{word.consonant}</Text>
                        <Text style={styles.pattern}>{word.pattern}</Text>
                      </>
                    )}
                  </Text>
                  {(() => {
                    const p = PHONICS_RESPELLINGS[word.text.toLowerCase()] || WORD_PRONUNCIATIONS[word.text.toLowerCase()] || word.phoneme
                    if (!p || p === word.text.toLowerCase()) return null
                    return <Text style={styles.respelling}>/{p}/</Text>
                  })()}
                </View>
                <AudioButton audioUrl={word.audio_url} fallbackText={word.text} size="lg" accessibilityLabel={`Hear ${word.text}`} />
              </View>
              {!isProverb && <TranslationPill word={word.text} />}

              {word.pastText && VERB_DEFS[word.text.toLowerCase()] && (
                <Text style={styles.verbDefText}>{VERB_DEFS[word.text.toLowerCase()]}</Text>
              )}

              {word.pastText && (
                <View style={styles.verbForms}>
                  <Text style={styles.verbFormTitle}>past tense</Text>
                  <View style={styles.verbFormRow}>
                    <Text style={styles.verbFormPast}>{word.pastText}</Text>
                    <AudioButton audioUrl="" fallbackText={word.pastText} size="sm" accessibilityLabel={`Hear ${word.pastText}`} />
                  </View>
                  {word.pastPart && (
                    <>
                      <Text style={[styles.verbFormTitle, { marginTop: spacing.sm }]}>past participle</Text>
                      <View style={styles.verbFormRow}>
                        <Text style={styles.verbFormPart}>{word.pastPart}</Text>
                        <AudioButton audioUrl="" fallbackText={word.pastPart} size="sm" accessibilityLabel={`Hear ${word.pastPart}`} />
                      </View>
                    </>
                  )}
                </View>
              )}

              {word.pastText && (VERB_EXAMPLES[word.text.toLowerCase()] || (word.pastPart && WORD_EXAMPLES[word.pastPart.toLowerCase()])) && (
                <View style={styles.defCard}>
                  <Text style={styles.defCardLabel}>example:</Text>
                  {VERB_EXAMPLES[word.text.toLowerCase()] && <TappableTranslatedSentence sentence={VERB_EXAMPLES[word.text.toLowerCase()]} />}
                  {word.pastPart && WORD_EXAMPLES[word.pastPart.toLowerCase()] && <TappableTranslatedSentence sentence={WORD_EXAMPLES[word.pastPart.toLowerCase()][0]} sentences={WORD_EXAMPLES[word.pastPart.toLowerCase()]} />}
                </View>
              )}

              {!word.pastText && word.definition && !isProverb && (
                <View style={styles.defCard}>
                  <Text style={styles.defCardLabel}>definition:</Text>
                  <Text style={styles.definition}>{word.definition}</Text>
                </View>
              )}

              {(!word.pastText || !VERB_EXAMPLES[word.text.toLowerCase()]) && (() => {
                const key = word.text.toLowerCase()
                const ex = WORD_EXAMPLES[key]
                if (!ex) return null
                return (
                  <View style={styles.defCard}>
                    <Text style={styles.defCardLabel}>example:</Text>
                    <TappableTranslatedSentence sentence={ex[0]} sentences={ex} />
                  </View>
                )
              })()}
            </View>
          )}

          {showHint && index === 0 && <AnimatedHintPill />}
        </Animated.View>
      </GestureDetector>
    </View>
  )
}

const styles = StyleSheet.create({
  outer: { gap: spacing.md, flex: 1 },
  card: {
    backgroundColor: colors.surface, borderRadius: 24, padding: spacing.xl, flex: 1,
    position: 'relative', overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 6,
  },
  swipeOverlay: { ...StyleSheet.absoluteFillObject, borderRadius: 24, justifyContent: 'center', alignItems: 'center', zIndex: 10 },
  swipeLabel: { fontSize: 28, fontWeight: '800', letterSpacing: 2, position: 'absolute' },
  swipeMastered: { color: '#fff' },
  swipeNotYet: { color: '#fff' },
  wordContent: { flex: 1, gap: spacing.md, justifyContent: 'flex-start' },
  wordRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  wordLabel: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'baseline', flex: 1, gap: 4 },
  emojiRow: { alignItems: 'center', marginBottom: spacing.sm, marginTop: spacing.xs },
  wordEmoji: { fontSize: 64, lineHeight: 72 },
  wordText: { fontSize: 34, fontFamily: 'Georgia', lineHeight: 42, fontWeight: '700' },
  wordTextIdiom: { fontSize: 22, lineHeight: 30 },
  consonant: { color: colors.consonant },
  pattern: { color: colors.pattern },
  pronunciation: { fontSize: fontSize.lg, color: colors.textMuted },
  pronunciationInline: { fontSize: fontSize.md, color: colors.textMuted },
  respelling: { fontSize: fontSize.lg, color: colors.textMuted, fontStyle: 'italic', letterSpacing: 0.3 },
  pastLabel: { fontSize: fontSize.md, color: colors.textMuted, fontWeight: '600' },
  pastText: { fontSize: 28, fontFamily: 'Georgia', lineHeight: 36, color: colors.text, fontWeight: '600' },
  verbForms: { backgroundColor: colors.primaryLight, borderRadius: radius.lg, padding: spacing.md, gap: 4 },
  verbFormTitle: { fontSize: fontSize.xs, color: colors.textMuted, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  verbFormRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  verbFormPast: { fontSize: 28, fontFamily: 'Georgia', lineHeight: 36, color: colors.text, fontWeight: '700' },
  verbFormPart: { fontSize: 22, fontFamily: 'Georgia', lineHeight: 30, color: colors.primary, fontWeight: '700' },
  exampleSentence: { fontSize: fontSize.md, color: colors.textSecondary, fontStyle: 'italic', lineHeight: 20 },
  definition: { fontSize: fontSize.lg, color: colors.text, lineHeight: 24 },
  defCard: { backgroundColor: colors.primaryLight, borderRadius: radius.lg, padding: spacing.sm, gap: spacing.xs },
  defCardLabel: { fontSize: fontSize.xs, color: colors.textMuted, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  verbDefText: { fontSize: fontSize.sm, color: colors.textSecondary, lineHeight: 18, fontStyle: 'italic' },
  labelText: { fontSize: fontSize.xs, color: colors.textMuted, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.8, backgroundColor: colors.neutral, alignSelf: 'flex-start', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 1, marginBottom: 2, overflow: 'hidden' },
  proverbContent: { gap: spacing.md, justifyContent: 'flex-start', paddingTop: spacing.md },
  proverbText: { fontSize: 22, fontFamily: 'Georgia', lineHeight: 30, color: colors.text, textAlign: 'left' },
  proverbSpeaker: { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', alignSelf: 'center' },
  proverbSpeakerMini: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  proverbSpeakerRow: { alignSelf: 'flex-start' },
  proverbAnswer: { fontSize: fontSize.lg, color: colors.text, textAlign: 'left', lineHeight: 24 },
  proverbExample: { fontSize: fontSize.md, color: colors.text, lineHeight: 22 },
  proverbSpacer: { flex: 1 },
  waveRow: { flexDirection: 'row', alignItems: 'center', gap: 3, height: 22 },
  waveBar: { width: 3, height: 22, borderRadius: 2, backgroundColor: '#fff' },
})
