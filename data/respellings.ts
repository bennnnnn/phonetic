/**
 * Simple English respellings for phonics words.
 * These show how to SAY the word — not IPA, not spelling.
 * Rules used:
 *   ay = long A (bake → bayk)   ee = long E (sleep → sleep)
 *   y  = long I (night → nyt)   oh = long O (bone → bohn)
 *   oo = long OO (blue → bloo)
 *   k  = hard C (cat → kat)     w  = wh (when → wen)
 */
export const PHONICS_RESPELLINGS: Record<string, string> = {

  // ── -ake ─────────────────────────────────────────────────────────────────
  bake: 'bayk',   cake: 'kayk',   make: 'mayk',   lake: 'layk',
  take: 'tayk',   snake: 'snayk', shake: 'shayk', rake: 'rayk',
  brake: 'brayk', wake: 'wayk',   flake: 'flayk', fake: 'fayk',
  gate: 'gayt',   late: 'layt',   date: 'dayt',   plate: 'playt',

  // ── -at ──────────────────────────────────────────────────────────────────
  cat: 'kat',   bat: 'bat',   hat: 'hat',   mat: 'mat',
  rat: 'rat',   fat: 'fat',   sat: 'sat',   pat: 'pat',
  flat: 'flat', that: 'that', chat: 'chat',

  // ── -an ──────────────────────────────────────────────────────────────────
  man: 'man',   can: 'kan',   fan: 'fan',   pan: 'pan',
  van: 'van',   ran: 'ran',   plan: 'plan', than: 'than',

  // ── -ap ──────────────────────────────────────────────────────────────────
  cap: 'kap',   map: 'map',   nap: 'nap',   tap: 'tap',
  clap: 'klap', snap: 'snap', wrap: 'rap',  gap: 'gap',

  // ── -op ──────────────────────────────────────────────────────────────────
  top: 'top',   hop: 'hop',   stop: 'stop', drop: 'drop',
  shop: 'shop', mop: 'mop',   pop: 'pop',   chop: 'chop',
  prop: 'prop', crop: 'krop',

  // ── -in ──────────────────────────────────────────────────────────────────
  pin: 'pin',   win: 'win',   tin: 'tin',   bin: 'bin',
  fin: 'fin',   thin: 'thin', grin: 'grin', spin: 'spin',

  // ── -en ──────────────────────────────────────────────────────────────────
  hen: 'hen',   pen: 'pen',   ten: 'ten',   men: 'men',
  den: 'den',   when: 'wen',  then: 'then', open: 'oh-pen',

  // ── -et ──────────────────────────────────────────────────────────────────
  pet: 'pet',   net: 'net',   jet: 'jet',   set: 'set',
  wet: 'wet',   get: 'get',   let: 'let',   bet: 'bet',

  // ── -ot ──────────────────────────────────────────────────────────────────
  hot: 'hot',   pot: 'pot',   dot: 'dot',   spot: 'spot',
  not: 'not',   lot: 'lot',   got: 'got',   shot: 'shot',
  robot: 'roh-bot',

  // ── -ug ──────────────────────────────────────────────────────────────────
  bug: 'bug',   hug: 'hug',   mug: 'mug',   rug: 'rug',
  jug: 'jug',   plug: 'plug', snug: 'snug', drug: 'drug',

  // ── -un ──────────────────────────────────────────────────────────────────
  sun: 'sun',   run: 'run',   fun: 'fun',   bun: 'bun',
  gun: 'gun',   nun: 'nun',   stun: 'stun', spun: 'spun',

  // ── -ump ─────────────────────────────────────────────────────────────────
  jump: 'jump',   bump: 'bump',   lump: 'lump',   pump: 'pump',
  stump: 'stump', thump: 'thump', dump: 'dump',   hump: 'hump',

  // ── -ell ─────────────────────────────────────────────────────────────────
  bell: 'bel',   well: 'wel',   tell: 'tel',   sell: 'sel',
  smell: 'smel', yell: 'yel',   shell: 'shel', spell: 'spel',
  fell: 'fel',   dwell: 'dwel',

  // ── -ill ─────────────────────────────────────────────────────────────────
  hill: 'hil',    bill: 'bil',    fill: 'fil',    will: 'wil',
  pill: 'pil',    spill: 'spil',  chill: 'chil',  thrill: 'thril',
  skill: 'skil',  grill: 'gril',

  // ── -ing ─────────────────────────────────────────────────────────────────
  ring: 'ring',   sing: 'sing',   king: 'king',   wing: 'wing',
  thing: 'thing', bring: 'bring', spring: 'spring', string: 'string',
  swing: 'swing', sting: 'sting',

  // ── -ock ─────────────────────────────────────────────────────────────────
  lock: 'lok',   rock: 'rok',   sock: 'sok',   clock: 'klok',
  block: 'blok', knock: 'nok',  shock: 'shok', flock: 'flok',
  dock: 'dok',   mock: 'mok',

  // ── -ick ─────────────────────────────────────────────────────────────────
  kick: 'kik',   lick: 'lik',   pick: 'pik',   sick: 'sik',
  tick: 'tik',   stick: 'stik', quick: 'kwik', chick: 'chik',
  trick: 'trik', thick: 'thik', slick: 'slik',

  // ── -ack ─────────────────────────────────────────────────────────────────
  back: 'bak',   pack: 'pak',   black: 'blak', track: 'trak',
  snack: 'snak', crack: 'krak', stack: 'stak', quack: 'kwak',
  shack: 'shak', whack: 'wak',  knack: 'nak',  hack: 'hak',
  jack: 'jak',   lack: 'lak',   rack: 'rak',   sack: 'sak',
  slack: 'slak', smack: 'smak',

  // ── -eep ─────────────────────────────────────────────────────────────────
  deep: 'deep',   keep: 'keep',   sleep: 'sleep', sheep: 'sheep',
  sweep: 'sweep', creep: 'kreep', beep: 'beep',   weep: 'weep',
  steep: 'steep', jeep: 'jeep',

  // ── -eam ─────────────────────────────────────────────────────────────────
  team: 'teem',   beam: 'beem',   seam: 'seem',   cream: 'kreem',
  dream: 'dreem', steam: 'steem', scream: 'skreem', stream: 'streem',

  // ── -ight ────────────────────────────────────────────────────────────────
  light: 'lyt',    night: 'nyt',    right: 'ryt',    bright: 'bryt',
  fight: 'fyt',    might: 'myt',    sight: 'syt',    tight: 'tyt',
  flight: 'flyt',  fright: 'fryt',  plight: 'plyt',  slight: 'slyt',
  knight: 'nyt',

  // ── -ide ─────────────────────────────────────────────────────────────────
  ride: 'ryd',    hide: 'hyd',    wide: 'wyd',    side: 'syd',
  tide: 'tyd',    bride: 'bryd',  pride: 'pryd',  slide: 'slyd',
  guide: 'gyd',   glide: 'glyd',

  // ── -ime ─────────────────────────────────────────────────────────────────
  time: 'tym',  lime: 'lym',  dime: 'dym',  climb: 'klym',
  chime: 'chym', prime: 'prym',

  // ── -ine ─────────────────────────────────────────────────────────────────
  nine: 'nyn',    line: 'lyn',    mine: 'myn',    fine: 'fyn',
  wine: 'wyn',    shine: 'shyn',  spine: 'spyn',  twine: 'twyn',
  pine: 'pyn',    vine: 'vyn',    dine: 'dyn',

  // ── -one ─────────────────────────────────────────────────────────────────
  bone: 'bohn',   cone: 'kohn',   lone: 'lohn',   phone: 'fohn',
  stone: 'stohn', throne: 'throhn', zone: 'zohn',  tone: 'tohn',
  gone: 'gon',    done: 'dun',

  // ── -ore ─────────────────────────────────────────────────────────────────
  more: 'mor',   sore: 'sor',   core: 'kor',   bore: 'bor',
  score: 'skor', store: 'stor', snore: 'snor', shore: 'shor',
  wore: 'wor',   fore: 'for',

  // ── -uck ─────────────────────────────────────────────────────────────────
  duck: 'duk',   luck: 'luk',   truck: 'truk', stuck: 'stuk',
  cluck: 'kluk', pluck: 'pluk', chuck: 'chuk', puck: 'puk',
  buck: 'buk',   muck: 'muk',

  // ── -unk ─────────────────────────────────────────────────────────────────
  bunk: 'bunk',   dunk: 'dunk',   trunk: 'trunk', sunk: 'sunk',
  chunk: 'chunk', drunk: 'drunk', stunk: 'stunk', funk: 'funk',
  junk: 'junk',   skunk: 'skunk',

  // ── -ank ─────────────────────────────────────────────────────────────────
  bank: 'bank',   tank: 'tank',   rank: 'rank',   sank: 'sank',
  blank: 'blank', drank: 'drank', thank: 'thank', plank: 'plank',
  crank: 'krank', frank: 'frank',

  // ── -ink ─────────────────────────────────────────────────────────────────
  pink: 'pink',   sink: 'sink',   wink: 'wink',   blink: 'blink',
  drink: 'drink', think: 'think', stink: 'stink', link: 'link',
  rink: 'rink',   brink: 'brink',

  // ── -ame ─────────────────────────────────────────────────────────────────
  came: 'kaym',   flame: 'flaym', fame: 'faym',   game: 'gaym',
  name: 'naym',   same: 'saym',   tame: 'taym',   blame: 'blaym',
  frame: 'fraym', shame: 'shaym', claim: 'klaym',

  // ── Silent letters ───────────────────────────────────────────────────────
  knee: 'nee',      knife: 'nyf',     know: 'noh',    knit: 'nit',
  knot: 'not',      knight: 'nyt',    knack: 'nak',
  lamb: 'lam',      comb: 'kohm',     thumb: 'thum',  crumb: 'krum',
  bomb: 'bom',      climb: 'klym',    dumb: 'dum',    numb: 'num',
  write: 'ryt',     wrong: 'rong',    wrist: 'rist',  wreck: 'rek',
  wrap: 'rap',      wren: 'ren',
  island: 'eye-lund', listen: 'lis-un', castle: 'kas-ul',
  whistle: 'wis-ul',  often: 'of-un',   fasten: 'fas-un',

  // ── Common high-frequency words ───────────────────────────────────────
  the: 'thuh',        a: 'uh',          an: 'an',
  is: 'iz',           it: 'it',         to: 'too',
  and: 'and',         you: 'yoo',       was: 'wuz',
  for: 'for',         are: 'ar',        with: 'with',
  they: 'thay',       have: 'hav',      this: 'this',
  from: 'from',       want: 'wont',     what: 'wut',
  where: 'wair',      there: 'thair',   their: 'thair',
  about: 'uh-bowt',   would: 'wood',    could: 'kood',
  should: 'shood',    because: 'bih-kuz', people: 'pee-pul',
  friend: 'frend',    school: 'skool',  water: 'waw-ter',
  again: 'uh-gen',    always: 'awl-wayz', beautiful: 'byoo-tih-ful',
  said: 'sed',        says: 'sez',      come: 'kum',
  some: 'sum',        done: 'dun',      one: 'wun',
  once: 'wuns',       two: 'too',       four: 'for',
  eight: 'ayt',       half: 'haf',      hour: 'ow-er',
  eye: 'eye',         buy: 'by',        by: 'by',
}
