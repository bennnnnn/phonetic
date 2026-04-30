/**
 * Irregular verb groups organised by their conjugation pattern.
 * Each group has: emoji, rule explanation, present tense verbs, and past tense forms.
 *
 * To add a new group: add an entry here. No other code changes needed.
 */
export const IRREGULAR_VERB_GROUPS: Record<string, { verbs: string[]; past: string[]; emoji: string; rule: string }> = {
  'no change': {
    emoji: '🔄',
    rule: 'present = past — no change',
    verbs:  ['let','set','put','cut','hurt','shut','bet','burst','cast','cost','hit','quit','spread','upset','split','thrust','knit','wed','rid'],
    past:   ['let','set','put','cut','hurt','shut','bet','burst','cast','cost','hit','quit','spread','upset','split','thrust','knit','wed','rid'],
  },
  '-aught / -ought': {
    emoji: '🔗',
    rule: 'buy → bought · catch → caught · teach → taught',
    verbs:  ['buy','catch','teach','fight','bring','think','seek','reach','beseech'],
    past:   ['bought','caught','taught','fought','brought','thought','sought','reached','besought'],
  },
  'i → a → u': {
    emoji: '🔠',
    rule: 'ring → rang → rung · swim → swam → swum',
    verbs:  ['ring','sing','spring','swim','begin','drink','sink','shrink','stink','spin','slink'],
    past:   ['rang','sang','sprang','swam','began','drank','sank','shrank','stank','spun','slunk'],
  },
  'i → a (sit → sat)': {
    emoji: '💺',
    rule: 'sit → sat · win → won · stick → stuck',
    verbs:  ['sit','spit','win','dig','stick','sting','strike','swing','hang','cling','fling','slink'],
    past:   ['sat','spat','won','dug','stuck','stung','struck','swung','hung','clung','flung','slunk'],
  },
  '-eep → -ept': {
    emoji: '😴',
    rule: 'keep → kept · sleep → slept · weep → wept',
    verbs:  ['keep','sleep','sweep','weep','creep','leap'],
    past:   ['kept','slept','swept','wept','crept','leapt'],
  },
  '-end → -ent': {
    emoji: '📨',
    rule: 'send → sent · spend → spent · bend → bent',
    verbs:  ['send','spend','lend','bend','build','rend'],
    past:   ['sent','spent','lent','bent','built','rent'],
  },
  '-ell → -old': {
    emoji: '💰',
    rule: 'sell → sold · tell → told · dwell → dwelt',
    verbs:  ['sell','tell','spell','dwell','smell'],
    past:   ['sold','told','spelt','dwelt','smelt'],
  },
  '-ow → -ew → -own': {
    emoji: '💨',
    rule: 'blow → blew → blown · grow → grew → grown',
    verbs:  ['blow','grow','know','throw','draw','fly','show','withdraw','overflow'],
    past:   ['blew','grew','knew','threw','drew','flew','showed','withdrew','overflowed'],
  },
  '-ear → -ore': {
    emoji: '👕',
    rule: 'wear → wore · bear → bore · tear → tore',
    verbs:  ['wear','bear','tear','swear'],
    past:   ['wore','bore','tore','swore'],
  },
  '-eel → -elt': {
    emoji: '💓',
    rule: 'feel → felt · kneel → knelt · deal → dealt',
    verbs:  ['feel','kneel','deal','mean','dream','lean'],
    past:   ['felt','knelt','dealt','meant','dreamt','leant'],
  },
  '-ind → -ound': {
    emoji: '🔍',
    rule: 'find → found · grind → ground · wind → wound',
    verbs:  ['find','grind','wind','bind'],
    past:   ['found','ground','wound','bound'],
  },
  'ee → e (meet → met)': {
    emoji: '🤝',
    rule: 'meet → met · feed → fed · lead → led',
    verbs:  ['meet','feed','speed','bleed','breed','lead','read','plead'],
    past:   ['met','fed','sped','bled','bred','led','read','pled'],
  },
  '-eave → -eft': {
    emoji: '🚪',
    rule: 'leave → left',
    verbs:  ['leave','bereave'],
    past:   ['left','bereft'],
  },
  'vowel shift (get → got)': {
    emoji: '↩️',
    rule: 'get → got · choose → chose · break → broke',
    verbs:  ['get','forget','choose','freeze','wake','awake','break','steal','speak','weave','tread','whelp'],
    past:   ['got','forgot','chose','froze','woke','awoke','broke','stole','spoke','wove','trod','whelped'],
  },
  'write → wrote → written': {
    emoji: '✍️',
    rule: 'write → wrote · ride → rode · rise → rose',
    verbs:  ['write','ride','rise','drive','hide','bite','slide','stride'],
    past:   ['wrote','rode','rose','drove','hid','bit','slid','strode'],
  },
  'double past (come → came)': {
    emoji: '🏃',
    rule: 'come → came · run → ran · eat → ate',
    verbs:  ['come','become','run','eat','give','forgive','take','mistake','shake','see','fall','lie','beat'],
    past:   ['came','became','ran','ate','gave','forgave','took','mistook','shook','saw','fell','lay','beat'],
  },
  'go / do / have / make': {
    emoji: '⭐',
    rule: 'go → went · do → did · have → had · make → made',
    verbs:  ['go','do','have','make','stand','understand','pay','say','hear','hold','sell','tell'],
    past:   ['went','did','had','made','stood','understood','paid','said','heard','held','sold','told'],
  },
}

export const IRREGULAR_VERB_NODES = Object.entries(IRREGULAR_VERB_GROUPS).map(([id, g]) => ({
  id,
  emoji: '',
  name:  id,
  desc:  g.rule,
  wordCount: g.verbs.length,
}))

/**
 * Pronunciation respellings for irregular verb present and past forms.
 * Simple English respelling so users know how to say each word.
 * The key is the verb text (lowercase), the value is the respelling.
 */
export const VERB_PRONUNCIATIONS: Record<string, string> = {
  // Group: no change
  let:'let', set:'set', put:'put', cut:'cut', hurt:'hurt',
  shut:'shut', bet:'bet', burst:'burst', cast:'cast', cost:'cost',
  hit:'hit', quit:'kwit', spread:'spred', upset:'up-set', split:'split',
  thrust:'thrust', knit:'nit', wed:'wed', rid:'rid',

  // Group: -aught / -ought
  buy:'bai', bought:'bot', catch:'kach', caught:'kot',
  teach:'teech', taught:'tot', fight:'fite', fought:'fot',
  bring:'bring', brought:'brot', think:'thingk', thought:'thot',
  seek:'seek', sought:'sot', reach:'reech', reached:'reecht',
  beseech:'beseek', besought:'bi-sot',

  // Group: i -> a -> u
  ring:'ring', rang:'rang', rung:'rung',
  sing:'sing', sang:'sang', sung:'sung',
  spring:'spring', sprang:'sprang', sprung:'sprung',
  swim:'swim', swam:'swam', swum:'swum',
  begin:'bi-gin', began:'bi-gan', begun:'bi-gun',
  drink:'drink', drank:'drangk', drunk:'drungk',
  sink:'sink', sank:'sangk', sunk:'sungk',
  shrink:'shrink', shrank:'shrank', shrunk:'shrungk',
  stink:'stink', stank:'stangk', stunk:'stungk',
  spin:'spin', spun:'spun',
  slink:'slink', slunk:'slunk',

  // Group: i -> a (sit -> sat)
  sit:'sit', sat:'sat', spit:'spit', spat:'spat',
  win:'win', won:'wun', dig:'dig', dug:'dug',
  stick:'stik', stuck:'stuk', sting:'sting', stung:'stung',
  strike:'strike', struck:'struk', swing:'swing', swung:'swung',
  hang:'hang', hung:'hung', cling:'kling', clung:'klung',
  fling:'fling', flung:'flung',

  // Group: -eep -> -ept
  keep:'keep', kept:'kept', sleep:'sleep', slept:'slept',
  sweep:'sweep', swept:'swept', weep:'weep', wept:'wept',
  creep:'kreep', crept:'krept', leap:'leep', leapt:'lept',

  // Group: -end -> -ent
  send:'send', sent:'sent', spend:'spend', spent:'spent',
  lend:'lend', lent:'lent', bend:'bend', bent:'bent',
  build:'bild', built:'bilt', rend:'rend', rent:'rent',

  // Group: -ell -> -old
  sell:'sel', sold:'sold', tell:'tel', told:'told',
  spell:'spel', spelt:'spelt', dwell:'dwel', dwelt:'dwelt',
  smell:'smel', smelt:'smelt',

  // Group: -ow -> -ew -> -own
  blow:'blo', blew:'bloo', blown:'blone',
  grow:'gro', grew:'groo', grown:'grone',
  know:'no', knew:'nyoo', known:'none',
  throw:'thro', threw:'throo', thrown:'throne',
  draw:'dror', drew:'droo', drawn:'dron',
  fly:'flai', flew:'floo', flown:'flone',
  show:'sho', showed:'shod',
  withdraw:'with-dror', withdrew:'with-droo', withdrawn:'with-dron',
  overflow:'over-flo', overflowed:'over-flod',

  // Group: -ear -> -ore
  wear:'wair', wore:'wor', bear:'bair', bore:'bor',
  tear:'tair', tore:'tor', swear:'swair', swore:'swor',

  // Group: -eel -> -elt
  feel:'feel', felt:'felt', kneel:'neel', knelt:'nelt',
  deal:'deel', dealt:'delt', mean:'meen', meant:'ment',
  dream:'dreem', dreamt:'dremt', lean:'leen', leant:'lent',

  // Group: -ind -> -ound
  find:'faind', found:'found', grind:'grind', ground:'ground',
  wind:'waind', wound:'wound', bind:'baind', bound:'bound',

  // Group: ee -> e (meet -> met)
  meet:'meet', met:'met', feed:'feed', fed:'fed',
  speed:'speed', sped:'sped', bleed:'bleed', bled:'bled',
  breed:'breed', bred:'bred', lead:'leed', led:'led',
  read:'reed', plead:'pleed', pled:'pled',

  // Group: -eave -> -eft
  leave:'leev', left:'left', bereave:'bi-reev', bereft:'bi-reft',

  // Group: vowel shift (get -> got)
  get:'get', got:'got', forget:'for-get', forgot:'for-got',
  choose:'chooz', chose:'choz', freeze:'freez', froze:'froz',
  wake:'wake', woke:'wok', awake:'uh-wake', awoke:'uh-wok',
  break:'brayk', broke:'brok', steal:'steel', stole:'stol',
  speak:'speek', spoke:'spok', weave:'weev', wove:'wove',
  tread:'tred', trod:'trod', whelp:'welp', whelped:'welpt',

  // Group: write -> wrote -> written
  write:'rite', wrote:'rot', ride:'ride', rode:'rod',
  rise:'rize', rose:'roz', drive:'drive', drove:'drov',
  hide:'hide', hid:'hid', bite:'bite', bit:'bit',
  slide:'slide', slid:'slid', stride:'stride', strode:'strod',

  // Group: double past (come -> came)
  come:'kum', came:'kaym', become:'bi-kum', became:'bi-kaym',
  run:'run', ran:'ran', eat:'eet', ate:'ayt',
  give:'giv', gave:'gayv', forgive:'for-giv', forgave:'for-gayv',
  take:'tayk', took:'tuk', mistake:'mis-tayk', mistook:'mis-tuk',
  shake:'shayk', shook:'shuk', see:'see', saw:'so',
  fall:'fol', fell:'fel', lie:'lie', lay:'lay',
  beat:'beet',

  // Group: go / do / have / make
  go:'go', went:'went', do:'doo', did:'did',
  have:'hav', had:'had', make:'mayk', made:'mayd',
  stand:'stand', stood:'stud', understand:'un-der-stand', understood:'un-der-stud',
  pay:'pay', paid:'payd', say:'say', said:'sed',
  hear:'heer', heard:'herd', hold:'hold', held:'held',
}
