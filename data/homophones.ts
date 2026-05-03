/**
 * Homophone groups — words that sound the same but have different meanings.
 * Each group has: emoji, rule, and a list of words each with their own definition.
 *
 * The rule is a short label for the group. Each word has its own definition
 * so the quiz can pick one word's definition as the clue.
 */

export type HomophoneWord = {
  text: string
  definition: string
}

export const HOMOPHONE_GROUPS: Record<string, { words: HomophoneWord[]; emoji: string; rule: string }> = {
  'ate / eight': {
    emoji: '🍽️', rule: 'same sound · different spelling',
    words: [
      { text: 'ate', definition: 'past tense of eat' },
      { text: 'eight', definition: 'the number 8' },
    ],
  },
  'bare / bear': {
    emoji: '🐻', rule: 'same sound · different spelling',
    words: [
      { text: 'bare', definition: 'uncovered or empty' },
      { text: 'bear', definition: 'a large animal; to carry' },
    ],
  },
  'beet / beat': {
    emoji: '🥬', rule: 'same sound · different spelling',
    words: [
      { text: 'beet', definition: 'a purple vegetable' },
      { text: 'beat', definition: 'to strike; a rhythm' },
    ],
  },
  'blew / blue': {
    emoji: '💨', rule: 'same sound · different spelling',
    words: [
      { text: 'blew', definition: 'past tense of blow' },
      { text: 'blue', definition: 'the color of the sky' },
    ],
  },
  'board / bored': {
    emoji: '📋', rule: 'same sound · different spelling',
    words: [
      { text: 'board', definition: 'a flat piece of wood; to get on a vehicle' },
      { text: 'bored', definition: 'feeling uninterested' },
    ],
  },
  'brake / break': {
    emoji: '🚗', rule: 'same sound · different spelling',
    words: [
      { text: 'brake', definition: 'a device for stopping a vehicle' },
      { text: 'break', definition: 'to separate into pieces; a rest period' },
    ],
  },
  'buy / by / bye': {
    emoji: '🛒', rule: 'same sound · different spelling',
    words: [
      { text: 'buy', definition: 'to purchase something' },
      { text: 'by', definition: 'near; through the action of' },
      { text: 'bye', definition: 'a farewell' },
    ],
  },
  'cell / sell': {
    emoji: '📱', rule: 'same sound · different spelling',
    words: [
      { text: 'cell', definition: 'a small room; a basic unit of life' },
      { text: 'sell', definition: 'to exchange for money' },
    ],
  },
  'cent / scent / sent': {
    emoji: '💵', rule: 'same sound · different spelling',
    words: [
      { text: 'cent', definition: 'a penny; one hundredth of a dollar' },
      { text: 'scent', definition: 'a smell or odor' },
      { text: 'sent', definition: 'past tense of send' },
    ],
  },
  'cheap / cheep': {
    emoji: '🐤', rule: 'same sound · different spelling',
    words: [
      { text: 'cheap', definition: 'low in price' },
      { text: 'cheep', definition: 'the sound a baby bird makes' },
    ],
  },
  'dear / deer': {
    emoji: '🦌', rule: 'same sound · different spelling',
    words: [
      { text: 'dear', definition: 'loved; expensive' },
      { text: 'deer', definition: 'a wild animal with antlers' },
    ],
  },
  'die / dye': {
    emoji: '🎨', rule: 'same sound · different spelling',
    words: [
      { text: 'die', definition: 'to stop living' },
      { text: 'dye', definition: 'a substance used to color fabric' },
    ],
  },
  'fair / fare': {
    emoji: '🎡', rule: 'same sound · different spelling',
    words: [
      { text: 'fair', definition: 'just; a carnival' },
      { text: 'fare', definition: 'the price of a ticket; food' },
    ],
  },
  'flower / flour': {
    emoji: '🌺', rule: 'same sound · different spelling',
    words: [
      { text: 'flower', definition: 'the bloom of a plant' },
      { text: 'flour', definition: 'powder made from grains for baking' },
    ],
  },
  'for / four': {
    emoji: '4️⃣', rule: 'same sound · different spelling',
    words: [
      { text: 'for', definition: 'a preposition meaning intended to belong to' },
      { text: 'four', definition: 'the number 4' },
    ],
  },
  'hair / hare': {
    emoji: '🐇', rule: 'same sound · different spelling',
    words: [
      { text: 'hair', definition: 'strands growing on the head' },
      { text: 'hare', definition: 'an animal like a large rabbit' },
    ],
  },
  'heal / heel': {
    emoji: '🦶', rule: 'same sound · different spelling',
    words: [
      { text: 'heal', definition: 'to become healthy again' },
      { text: 'heel', definition: 'the back part of the foot' },
    ],
  },
  'hear / here': {
    emoji: '👂', rule: 'same sound · different spelling',
    words: [
      { text: 'hear', definition: 'to perceive sound with the ears' },
      { text: 'here', definition: 'in or at this place' },
    ],
  },
  'hole / whole': {
    emoji: '🕳️', rule: 'same sound · different spelling',
    words: [
      { text: 'hole', definition: 'an opening or gap' },
      { text: 'whole', definition: 'entire; complete' },
    ],
  },
  'hour / our': {
    emoji: '⏰', rule: 'same sound · different spelling',
    words: [
      { text: 'hour', definition: 'sixty minutes' },
      { text: 'our', definition: 'belonging to us' },
    ],
  },
  'knight / night': {
    emoji: '⚔️', rule: 'same sound · different spelling',
    words: [
      { text: 'knight', definition: 'a medieval warrior in armor' },
      { text: 'night', definition: 'the time after sunset when it is dark' },
    ],
  },
  'knot / not': {
    emoji: '🪢', rule: 'same sound · different spelling',
    words: [
      { text: 'knot', definition: 'a tied loop in rope' },
      { text: 'not', definition: 'used to form the negative' },
    ],
  },
  'know / no': {
    emoji: '🧠', rule: 'same sound · different spelling',
    words: [
      { text: 'know', definition: 'to have information or understanding' },
      { text: 'no', definition: 'a negative answer' },
    ],
  },
  'lead / led': {
    emoji: '🔦', rule: 'same sound · different spelling',
    words: [
      { text: 'lead', definition: 'to guide; a heavy metal' },
      { text: 'led', definition: 'past tense of lead' },
    ],
  },
  'mail / male': {
    emoji: '📬', rule: 'same sound · different spelling',
    words: [
      { text: 'mail', definition: 'letters and packages sent by post' },
      { text: 'male', definition: 'of the masculine sex' },
    ],
  },
  'meat / meet': {
    emoji: '🥩', rule: 'same sound · different spelling',
    words: [
      { text: 'meat', definition: 'animal flesh used as food' },
      { text: 'meet', definition: 'to come together with someone' },
    ],
  },
  'one / won': {
    emoji: '🥇', rule: 'same sound · different spelling',
    words: [
      { text: 'one', definition: 'the number 1' },
      { text: 'won', definition: 'past tense of win' },
    ],
  },
  'pair / pear / pare': {
    emoji: '🍐', rule: 'same sound · different spelling',
    words: [
      { text: 'pair', definition: 'a set of two things' },
      { text: 'pear', definition: 'a sweet fruit' },
      { text: 'pare', definition: 'to trim by cutting' },
    ],
  },
  'pause / paws': {
    emoji: '🐾', rule: 'same sound · different spelling',
    words: [
      { text: 'pause', definition: 'to stop briefly' },
      { text: 'paws', definition: 'the feet of an animal' },
    ],
  },
  'peace / piece': {
    emoji: '🕊️', rule: 'same sound · different spelling',
    words: [
      { text: 'peace', definition: 'a state of calm' },
      { text: 'piece', definition: 'a part or portion' },
    ],
  },
  'plain / plane': {
    emoji: '✈️', rule: 'same sound · different spelling',
    words: [
      { text: 'plain', definition: 'simple; a flat area of land' },
      { text: 'plane', definition: 'an aircraft; a flat surface' },
    ],
  },
  'pole / poll': {
    emoji: '📊', rule: 'same sound · different spelling',
    words: [
      { text: 'pole', definition: 'a long stick' },
      { text: 'poll', definition: 'a survey of opinions' },
    ],
  },
  'right / write': {
    emoji: '✍️', rule: 'same sound · different spelling',
    words: [
      { text: 'right', definition: 'correct; a direction' },
      { text: 'write', definition: 'to put words on paper' },
    ],
  },
  'road / rode': {
    emoji: '🛣️', rule: 'same sound · different spelling',
    words: [
      { text: 'road', definition: 'a paved way for vehicles' },
      { text: 'rode', definition: 'past tense of ride' },
    ],
  },
  'rose / rows': {
    emoji: '🌹', rule: 'same sound · different spelling',
    words: [
      { text: 'rose', definition: 'a type of flower' },
      { text: 'rows', definition: 'lines of things' },
    ],
  },
  'sail / sale': {
    emoji: '⛵', rule: 'same sound · different spelling',
    words: [
      { text: 'sail', definition: 'a piece of fabric on a boat' },
      { text: 'sale', definition: 'a period of reduced prices' },
    ],
  },
  'sea / see': {
    emoji: '🌊', rule: 'same sound · different spelling',
    words: [
      { text: 'sea', definition: 'a large body of salt water' },
      { text: 'see', definition: 'to perceive with the eyes' },
    ],
  },
  'seam / seem': {
    emoji: '🧵', rule: 'same sound · different spelling',
    words: [
      { text: 'seam', definition: 'a line where two pieces join' },
      { text: 'seem', definition: 'to appear to be' },
    ],
  },
  'son / sun': {
    emoji: '☀️', rule: 'same sound · different spelling',
    words: [
      { text: 'son', definition: 'a male child' },
      { text: 'sun', definition: 'the star that gives us light' },
    ],
  },
  'stair / stare': {
    emoji: '👀', rule: 'same sound · different spelling',
    words: [
      { text: 'stair', definition: 'a step in a staircase' },
      { text: 'stare', definition: 'to look fixedly at something' },
    ],
  },
  'steal / steel': {
    emoji: '🔩', rule: 'same sound · different spelling',
    words: [
      { text: 'steal', definition: 'to take something unlawfully' },
      { text: 'steel', definition: 'a strong metal' },
    ],
  },
  'tail / tale': {
    emoji: '🐕', rule: 'same sound · different spelling',
    words: [
      { text: 'tail', definition: 'the rear end of an animal' },
      { text: 'tale', definition: 'a story' },
    ],
  },
  'there / their': {
    emoji: '📍', rule: 'same sound · different spelling',
    words: [
      { text: 'there', definition: 'in or at that place' },
      { text: 'their', definition: 'belonging to them' },
    ],
  },
  'threw / through': {
    emoji: '🏀', rule: 'same sound · different spelling',
    words: [
      { text: 'threw', definition: 'past tense of throw' },
      { text: 'through', definition: 'from one side to the other' },
    ],
  },
  'to / too / two': {
    emoji: '2️⃣', rule: 'same sound · different spelling',
    words: [
      { text: 'to', definition: 'a preposition indicating direction' },
      { text: 'too', definition: 'also; excessively' },
      { text: 'two', definition: 'the number 2' },
    ],
  },
  'waist / waste': {
    emoji: '🗑️', rule: 'same sound · different spelling',
    words: [
      { text: 'waist', definition: 'the middle part of the body' },
      { text: 'waste', definition: 'to use carelessly; garbage' },
    ],
  },
  'wait / weight': {
    emoji: '⏳', rule: 'same sound · different spelling',
    words: [
      { text: 'wait', definition: 'to stay in place until something happens' },
      { text: 'weight', definition: 'how heavy something is' },
    ],
  },
  'week / weak': {
    emoji: '📅', rule: 'same sound · different spelling',
    words: [
      { text: 'week', definition: 'seven days' },
      { text: 'weak', definition: 'not strong' },
    ],
  },
  'wear / where': {
    emoji: '👔', rule: 'same sound · different spelling',
    words: [
      { text: 'wear', definition: 'to have clothing on the body' },
      { text: 'where', definition: 'at or to what place' },
    ],
  },
  'weather / whether': {
    emoji: '🌤️', rule: 'same sound · different spelling',
    words: [
      { text: 'weather', definition: 'the condition of the air outside' },
      { text: 'whether', definition: 'used to introduce alternatives' },
    ],
  },
}

export const HOMOPHONE_NODES = Object.entries(HOMOPHONE_GROUPS).map(([id, g]) => ({
  id,
  emoji: g.emoji,
  name: id,
  desc: g.rule,
  wordCount: g.words.length,
}))

/** Flat map of homophone word text → definition for quick lookup */
export const HOMOPHONE_DEFINITIONS: Record<string, string> = {}
for (const group of Object.values(HOMOPHONE_GROUPS)) {
  for (const w of group.words) {
    HOMOPHONE_DEFINITIONS[w.text.toLowerCase()] = w.definition
  }
}
