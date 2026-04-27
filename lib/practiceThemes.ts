export const SPEECH_LOCALES: Record<string, string> = {
  es: 'es-ES', fr: 'fr-FR', ar: 'ar-SA', am: 'am-ET',
  pt: 'pt-BR', zh: 'zh-CN', hi: 'hi-IN', tr: 'tr-TR',
  ko: 'ko-KR', ja: 'ja-JP', de: 'de-DE', it: 'it-IT',
  ru: 'ru-RU', id: 'id-ID', sw: 'sw-KE', so: 'so-SO',
}

export const WORD_THEMES: Record<string, { words: string[]; emoji: string; desc: string }> = {
  Travel:   { emoji: '✈️', desc: 'train · boat · trip',       words: ['train','trip','flight','boat','ship','float','track','plain','skate','brake'] },
  Food:     { emoji: '🍕', desc: 'cake · snack · chip',       words: ['cake','bake','plate','snack','chip','dip','sip','grain','flake'] },
  Nature:   { emoji: '🌿', desc: 'rain · snow · grow',        words: ['lake','snow','rain','grow','glow','flow','blow','snake','crow','strain','plain'] },
  Feelings: { emoji: '💫', desc: 'bright · right · might',    words: ['delight','fright','pain','might','bright','right','sight'] },
  Actions:  { emoji: '⚡', desc: 'shake · skip · flip',       words: ['shake','skip','flip','grip','slip','crack','spell','make','take','wake','show','know','attack'] },
  Home:     { emoji: '🏠', desc: 'bell · well · coat',        words: ['bell','well','shell','bank','rack','coat','cell','blank','stack'] },
  People:   { emoji: '👥', desc: 'mate · frank · rank',       words: ['mate','frank','knight','rank','thank'] },
}

export const GROUP_NODES = Object.entries(WORD_THEMES).map(([id, t]) => ({
  id,
  emoji: t.emoji,
  name:  id,
  desc:  t.desc,
  wordCount: t.words.length,
}))

export const WORD_EMOJI: Record<string, string> = {
  bake:'🎂', cake:'🍰', lake:'🏞️', snake:'🐍', rake:'🌾', make:'🔨',
  take:'✋', wake:'⏰', shake:'🤝', flake:'❄️', brake:'🚗', fake:'🎭',
  gate:'🚪', late:'⏱️', mate:'🤝', plate:'🍽️', skate:'⛸️', state:'🏛️',
  light:'💡', night:'🌙', right:'✅', sight:'👁️', fight:'🥊', might:'💪',
  bright:'☀️', flight:'✈️', knight:'♟️', fright:'😱', delight:'😊',
  back:'⬅️', black:'⬛', crack:'💥', hack:'💻', pack:'📦', rack:'🏋️',
  sack:'👜', stack:'📚', track:'🛤️', snack:'🍎', attack:'⚔️', knack:'🎯',
  bell:'🔔', cell:'📱', sell:'💰', tell:'💬', well:'💧', yell:'📣',
  spell:'✨', shell:'🐚', smell:'👃', dwell:'🏡', swell:'🌊', fell:'🍂',
  bank:'🏦', rank:'🏆', tank:'🛢️', blank:'📄', crank:'🔧', drank:'🥤',
  plank:'🪵', prank:'🃏', thank:'🙏', frank:'😐',
  dip:'🤿', sip:'☕', chip:'🍟', flip:'🔄', grip:'🤜',
  ship:'🚢', skip:'⏭️', slip:'🍌', trip:'✈️',
  blow:'💨', crow:'🐦', flow:'🌊', glow:'✨', grow:'🌱', know:'🧠',
  show:'🎬', slow:'🐢', snow:'❄️',
  rain:'🌧️', train:'🚂', drain:'🚿', gain:'📈', grain:'🌾',
  pain:'😣', plain:'🏔️', stain:'💧', strain:'😤',
  boat:'⛵', coat:'🧥', float:'🏊', goat:'🐐', throat:'😮',
}
