/**
 * Silent letter annotations for common English words.
 * Each entry marks which letter(s) in the word are silent.
 * Format: { word: [{ index: letter_position, letter: 'x' }] }
 *
 * To add a word: just add an entry here. The WordFocusCard displays it
 * with the silent letter greyed out and a small label.
 */
export type SilentLetter = { index: number; letter: string }

export const SILENT_LETTERS: Record<string, SilentLetter[]> = {
  // Silent K
  knee:     [{ index: 0, letter: 'k' }],
  kneel:    [{ index: 0, letter: 'k' }],
  knew:     [{ index: 0, letter: 'k' }],
  knife:    [{ index: 0, letter: 'k' }],
  knight:   [{ index: 0, letter: 'k' }],
  knit:     [{ index: 0, letter: 'k' }],
  knob:     [{ index: 0, letter: 'k' }],
  knock:    [{ index: 0, letter: 'k' }],
  knot:     [{ index: 0, letter: 'k' }],
  know:     [{ index: 0, letter: 'k' }],
  knowledge: [{ index: 0, letter: 'k' }],

  // Silent B
  lamb:     [{ index: 3, letter: 'b' }],
  comb:     [{ index: 3, letter: 'b' }],
  bomb:     [{ index: 3, letter: 'b' }],
  thumb:    [{ index: 4, letter: 'b' }],
  climb:    [{ index: 4, letter: 'b' }],
  crumb:    [{ index: 4, letter: 'b' }],
  dumb:     [{ index: 3, letter: 'b' }],
  numb:     [{ index: 3, letter: 'b' }],
  debt:     [{ index: 1, letter: 'b' }],
  doubt:    [{ index: 2, letter: 'b' }],

  // Silent W
  write:    [{ index: 0, letter: 'w' }],
  wrote:    [{ index: 0, letter: 'w' }],
  written:  [{ index: 0, letter: 'w' }],
  wrong:    [{ index: 0, letter: 'w' }],
  wrist:    [{ index: 0, letter: 'w' }],
  wrap:     [{ index: 0, letter: 'w' }],
  wreck:    [{ index: 0, letter: 'w' }],
  wren:     [{ index: 0, letter: 'w' }],
  wring:    [{ index: 0, letter: 'w' }],
  sword:    [{ index: 0, letter: 'w' }],
  answer:   [{ index: 0, letter: 'w' }],
  two:      [{ index: 0, letter: 'w' }],
  who:      [{ index: 0, letter: 'w' }],
  whole:    [{ index: 0, letter: 'w' }],

  // Silent T
  listen:   [{ index: 3, letter: 't' }],
  castle:   [{ index: 3, letter: 't' }],
  whistle:  [{ index: 3, letter: 't' }],
  thistle:  [{ index: 3, letter: 't' }],
  rustle:   [{ index: 3, letter: 't' }],
  bustle:   [{ index: 3, letter: 't' }],
  Christmas: [{ index: 5, letter: 't' }],
  soften:   [{ index: 4, letter: 't' }],
  often:    [{ index: 3, letter: 't' }],
  ballet:   [{ index: 5, letter: 't' }],

  // Silent H
  hour:     [{ index: 0, letter: 'h' }],
  honest:   [{ index: 0, letter: 'h' }],
  honour:   [{ index: 0, letter: 'h' }],
  heir:     [{ index: 0, letter: 'h' }],
  what:     [{ index: 0, letter: 'h' }],
  when:     [{ index: 0, letter: 'h' }],
  where:    [{ index: 0, letter: 'h' }],
  why:      [{ index: 0, letter: 'h' }],
  which:    [{ index: 0, letter: 'h' }],
  white:    [{ index: 0, letter: 'h' }],

  // Silent G
  gnat:     [{ index: 0, letter: 'g' }],
  gnaw:     [{ index: 0, letter: 'g' }],
  gnome:    [{ index: 0, letter: 'g' }],
  sign:     [{ index: 3, letter: 'g' }],
  design:   [{ index: 5, letter: 'g' }],

  // Silent L
  half:     [{ index: 2, letter: 'l' }],
  calf:     [{ index: 2, letter: 'l' }],
  talk:     [{ index: 1, letter: 'l' }],
  walk:     [{ index: 1, letter: 'l' }],
  could:    [{ index: 1, letter: 'l' }],
  would:    [{ index: 1, letter: 'l' }],
  should:   [{ index: 1, letter: 'l' }],
  calm:     [{ index: 1, letter: 'l' }],
  palm:     [{ index: 1, letter: 'l' }],
  yolk:     [{ index: 2, letter: 'l' }],

  // Silent S
  island:   [{ index: 2, letter: 's' }],
  aisle:    [{ index: 0, letter: 'a' }, { index: 2, letter: 's' }],

  // Silent C
  scissor:  [{ index: 0, letter: 's' }],
  muscle:   [{ index: 3, letter: 'c' }],
  scent:    [{ index: 0, letter: 's' }],

  // Silent N
  autumn:   [{ index: 5, letter: 'n' }],
  column:   [{ index: 5, letter: 'n' }],
  hymn:     [{ index: 3, letter: 'n' }],

  // Silent P
  pterodactyl: [{ index: 0, letter: 'p' }],
  psalm:    [{ index: 0, letter: 'p' }],
  receipt:  [{ index: 5, letter: 'p' }],
  cupboard: [{ index: 0, letter: 'c' }, { index: 4, letter: 'p' }],

  // Silent U
  guess:    [{ index: 1, letter: 'u' }],
  guest:    [{ index: 1, letter: 'u' }],
  guide:    [{ index: 1, letter: 'u' }],
  guitar:   [{ index: 1, letter: 'u' }],
  guard:    [{ index: 1, letter: 'u' }],

  // Silent E (at end of words — the "magic e" pattern)
  // These are super common — only listing a few as examples
  bake:     [{ index: 3, letter: 'e' }],
  cake:     [{ index: 3, letter: 'e' }],
  make:     [{ index: 3, letter: 'e' }],
  lake:     [{ index: 3, letter: 'e' }],
  take:     [{ index: 3, letter: 'e' }],
  snake:    [{ index: 4, letter: 'e' }],
  shake:    [{ index: 4, letter: 'e' }],
  rake:     [{ index: 3, letter: 'e' }],
  brake:    [{ index: 4, letter: 'e' }],
  wake:     [{ index: 3, letter: 'e' }],
  hope:     [{ index: 3, letter: 'e' }],
  rope:     [{ index: 3, letter: 'e' }],
  note:     [{ index: 3, letter: 'e' }],
  like:     [{ index: 3, letter: 'e' }],
  time:     [{ index: 3, letter: 'e' }],
  name:     [{ index: 3, letter: 'e' }],
  game:     [{ index: 3, letter: 'e' }],
  home:     [{ index: 3, letter: 'e' }],
  bone:     [{ index: 3, letter: 'e' }],
  cone:     [{ index: 3, letter: 'e' }],
  stone:    [{ index: 4, letter: 'e' }],
  fine:     [{ index: 3, letter: 'e' }],
  line:     [{ index: 3, letter: 'e' }],
  nine:     [{ index: 3, letter: 'e' }],
  shine:    [{ index: 4, letter: 'e' }],
  spine:    [{ index: 4, letter: 'e' }],
  twine:    [{ index: 4, letter: 'e' }],
  drive:    [{ index: 4, letter: 'e' }],
  ride:     [{ index: 3, letter: 'e' }],
  hide:     [{ index: 3, letter: 'e' }],
  wide:     [{ index: 3, letter: 'e' }],
  side:     [{ index: 3, letter: 'e' }],
  tide:     [{ index: 3, letter: 'e' }],
  bride:    [{ index: 4, letter: 'e' }],
  pride:    [{ index: 4, letter: 'e' }],
  slide:    [{ index: 4, letter: 'e' }],
  more:     [{ index: 3, letter: 'e' }],
  sore:     [{ index: 3, letter: 'e' }],
  core:     [{ index: 3, letter: 'e' }],
  bore:     [{ index: 3, letter: 'e' }],
  score:    [{ index: 4, letter: 'e' }],
  store:    [{ index: 4, letter: 'e' }],
  snore:    [{ index: 4, letter: 'e' }],
  shore:    [{ index: 4, letter: 'e' }],
}
