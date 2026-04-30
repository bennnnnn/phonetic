/**
 * Emoji map for words — used to show a visual icon for each word in review screens.
 * Every word in vocabThemes.ts should have an emoji here.
 * Uses clear, universally-recognized emojis across all platforms.
 *
 * KEY RULE: The emoji must ACTUALLY represent the word.
 * A chair → 🪑, not table. A window → 🪟, not curtain.
 * If no good emoji exists, OMIT the entry (WORD_EMOJI skips display).
 */

const _EMOJI: Record<string, string> = {

  // ── Fruits ───────────────────────────────────────────────────────────────────
  apple:'🍎', banana:'🍌', orange:'🍊', grape:'🍇', lemon:'🍋',
  melon:'🍈', cherry:'🍒', peach:'🍑', mango:'🥭',
  berry:'🫐', pear:'🍐', plum:'🫐',
  kiwi:'🥝', pineapple:'🍍', strawberry:'🍓',
  coconut:'🥥', watermelon:'🍉', lime:'🍋',

  // ── Vegetables ───────────────────────────────────────────────────────────────
  carrot:'🥕', celery:'🥬', lettuce:'🥬', tomato:'🍅', potato:'🥔', onion:'🧅',
  bean:'🫘', pea:'🫛', corn:'🌽', spinach:'🥬', broccoli:'🥦', mushroom:'🍄',
  cucumber:'🥒', pepper:'🫑', pumpkin:'🎃', garlic:'🧄', cabbage:'🥬',
  eggplant:'🍆',

  // ── Kitchen ──────────────────────────────────────────────────────────────────
  spoon:'🥄', fork:'🍴', knife:'🔪', plate:'🍽️', bowl:'🥣', cup:'🥤',
  pan:'🍳', pot:'🍲', oven:'🫕', stove:'🍳', sink:'🚰', fridge:'🧊',
  microwave:'📟', toaster:'🍞', kettle:'🫖', spatula:'🥄', teapot:'🫖',

  // ── Furniture ────────────────────────────────────────────────────────────────
  table:'🪑', chair:'🪑', desk:'🪑', bed:'🛏️', sofa:'🛋️',
  shelf:'📚', drawer:'🗄️', lamp:'💡', rug:'🟫',
  curtain:'🪟', closet:'🚪', cabinet:'🗄️', bookshelf:'📚',
  pillow:'🛌', blanket:'🧶', stool:'🪑', bench:'🪑',

  // ── Car Parts ────────────────────────────────────────────────────────────────
  wheel:'🛞', tire:'🛞', engine:'🔧', brake:'🛑',
  pedal:'🦶', horn:'📯', seat:'💺', door:'🚪', window:'🪟',
  mirror:'🪞', trunk:'🪵', hood:'🧢', bumper:'🚗', headlight:'💡',
  battery:'🔋', gear:'⚙️', dashboard:'📊',

  // ── Body ─────────────────────────────────────────────────────────────────────
  head:'🗣️', hand:'✋', foot:'🦶', arm:'💪', leg:'🦵', face:'😃',
  nose:'👃', mouth:'👄', eye:'👁️', ear:'👂',
  back:'🔙', knee:'🦵', finger:'☝️', elbow:'💪', shoulder:'🙋',
  neck:'🧣', chest:'💪', tooth:'🦷', tongue:'👅', thumb:'👍',
  ankle:'🦶', wrist:'⌚',

  // ── Clothes ──────────────────────────────────────────────────────────────────
  shirt:'👕', pants:'👖', dress:'👗', coat:'🧥', hat:'🎩', shoe:'👟',
  sock:'🧦', belt:'🩳', glove:'🧤', scarf:'🧣', jacket:'🧥', boot:'🥾',
  sweater:'🧶', shorts:'🩳', skirt:'👗', tie:'👔',
  vest:'🦺', uniform:'👔', sneaker:'👟', sandal:'🩴',

  // ── Body Actions ─────────────────────────────────────────────────────────────
  sneeze:'🤧', cough:'😷', snore:'💤', spit:'💦',
  stare:'👀', glare:'😠', glance:'👀', squint:'😑', blink:'👁️', wink:'😉',
  yawn:'🥱', sigh:'😮‍💨', whisper:'🤫', shout:'📢', whistle:'🎵',
  laugh:'😂', smile:'😊', cry:'😭',
  wave:'👋', clap:'👏', nod:'👍', hug:'🤗',
  chew:'🦷', swallow:'🤤',

  // ── Feelings ─────────────────────────────────────────────────────────────────
  happy:'😊', sad:'😢', angry:'😠', tired:'😴', scared:'😨', brave:'🦸',
  calm:'🧘', shy:'😳', kind:'💕', silly:'🤪', worried:'😟',
  excited:'🤩', nervous:'😰', jealous:'😒', lonely:'😔', grateful:'🙏',
  confused:'😕', surprised:'😲', curious:'🤔', proud:'🏆',

  // ── Nature ───────────────────────────────────────────────────────────────────
  rain:'🌧️', snow:'❄️', sun:'☀️', moon:'🌙', star:'⭐', tree:'🌳',
  leaf:'🍃', cloud:'☁️', wind:'💨',
  rock:'🪨',
  river:'🏞️', lake:'🏞️', hill:'⛰️', ocean:'🌊', mountain:'🏔️',
  forest:'🌲', flower:'🌸', rainbow:'🌈', island:'🏝️',
  cave:'⛰️', volcano:'🌋',

  // ── Animals ──────────────────────────────────────────────────────────────────
  cat:'🐱', dog:'🐶', bird:'🐦', fish:'🐟', horse:'🐴', cow:'🐮', pig:'🐷',
  sheep:'🐑', duck:'🦆', bear:'🐻', lion:'🦁', wolf:'🐺', deer:'🦌',
  mouse:'🐭', fox:'🦊', rabbit:'🐰', frog:'🐸', turtle:'🐢',
  owl:'🦉', eagle:'🦅', shark:'🦈', whale:'🐳', dolphin:'🐬',
  monkey:'🐒', elephant:'🐘', snake:'🐍', butterfly:'🦋', bee:'🐝',

  // ── Time & Weather ───────────────────────────────────────────────────────────
  day:'☀️', week:'📅', month:'📅', year:'🗓️',
  hot:'🥵', cold:'🥶', warm:'🌤️', cool:'😎',
  wet:'💧', dry:'🏜️', bright:'☀️', dark:'🌑',
  storm:'⛈️', fog:'🌫️', breeze:'💨', hurricane:'🌀', tornado:'🌪️',
  humid:'💧', freezing:'🥶', mild:'🌤️',

  // ── Food & Drink ─────────────────────────────────────────────────────────────
  bread:'🍞', cheese:'🧀', milk:'🥛', butter:'🧈', egg:'🥚', rice:'🍚',
  pasta:'🍝', pizza:'🍕', burger:'🍔', fries:'🍟', sandwich:'🥪',
  soup:'🍜', pancake:'🥞', cookie:'🍪', chocolate:'🍫',
  juice:'🧃', tea:'🫖', coffee:'☕', salt:'🧂', sugar:'🧂',

  // ── Home & Rooms ─────────────────────────────────────────────────────────────
  house:'🏠', room:'🚪', kitchen:'🍳', bathroom:'🚿',
  bedroom:'🛏️', garage:'🚗', garden:'🌻',
  roof:'🏠', floor:'🏢', wall:'🧱',
  lock:'🔒', key:'🔑', trash:'🗑️',
  shower:'🚿', toilet:'🚽', bathtub:'🛁',
  broom:'🧹', vacuum:'🧹',

  // ── Transportation ───────────────────────────────────────────────────────────
  car:'🚗', bus:'🚌', train:'🚂', plane:'✈️', bike:'🚲',
  truck:'🚛', van:'🚐', taxi:'🚕', subway:'🚇',
  ferry:'⛴️', helicopter:'🚁', boat:'⛵',
  scooter:'🛴', skateboard:'🛹',
  ticket:'🎟️', station:'🚉', airport:'✈️', bridge:'🌉', map:'🗺️',

  // ── Sports & Hobbies ─────────────────────────────────────────────────────────
  soccer:'⚽', basketball:'🏀', tennis:'🎾',
  swimming:'🏊', running:'🏃', yoga:'🧘',
  dancing:'💃', singing:'🎤', painting:'🎨', reading:'📖',
  gaming:'🎮', fishing:'🎣', camping:'🏕️',
  skiing:'⛷️', surfing:'🏄', climbing:'🧗',
  gym:'🏋️', jump:'🤸', throw:'🤾', catch:'🧤',
}

export const WORD_EMOJI: Record<string, string> = _EMOJI
