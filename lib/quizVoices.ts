/**
 * Spoken feedback phrases for the listen-and-pick quiz.
 * Each phrase is called via TTS so there's no text shown on screen.
 */

const CORRECT_PHRASES = [
  'Great!',
  'Good job!',
  "You're killing it!",
  'Amazing!',
  'Perfect!',
  'Brilliant!',
  'Awesome!',
  'Well done!',
  'Spot on!',
  'Fantastic!',
]

const WRONG_PHRASES = [
  'Not quite right.',
  'Almost there!',
  'Try again!',
  'Not quite.',
  'Close!',
  'Not this time.',
  "Don't worry, keep going!",
  'Nearly!',
]

const ROUND_START_PHRASES = [
  'Listen to the word, then pick it.',
  'Hear the word, find it below.',
  'Listen carefully and choose.',
]

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!
}

export function pickCorrectPhrase(): string {
  return pick(CORRECT_PHRASES)
}

export function pickWrongPhrase(): string {
  return pick(WRONG_PHRASES)
}

export function pickRoundStartPhrase(): string {
  return pick(ROUND_START_PHRASES)
}
