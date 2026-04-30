import type { Word } from '@/lib/types'

export function normWord(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]/g, '')
}

/** Leading non-letters, core letters/digits, trailing punctuation. */
export function splitToken(raw: string): { lead: string; core: string; trail: string } {
  let i = 0
  while (i < raw.length && !/[a-zA-Z0-9]/.test(raw[i]!)) i++
  const lead = raw.slice(0, i)
  let j = raw.length
  while (j > i && !/[a-zA-Z0-9]/.test(raw[j - 1]!)) j--
  const core = raw.slice(i, j)
  const trail = raw.slice(j)
  return { lead, core, trail }
}

/** Short, readable practice lines built only from given words. */
export function buildPracticeSentences(words: Word[]): string[] {
  if (words.length === 0) return []
  const t = words.map((w) => w.text)
  const out: string[] = []
  out.push(`Can you read this word: ${t[0]}?`)
  if (t.length >= 2) {
    out.push(`Look at ${t[0]} and ${t[1]}. Say each one slowly.`)
  }
  if (t.length >= 3) {
    out.push(`Now read: ${t[0]}, ${t[1]}, and ${t[2]}.`)
  }
  if (t.length >= 4) {
    out.push(`Try these together: ${t.slice(0, 4).join(', ')}.`)
  }
  if (t.length >= 5) {
    out.push(`Great work with ${t[4]} and the rest!`)
  }
  return out.slice(0, 5)
}

/** Build a norm -> Word lookup map. */
export function buildWordByNorm(words: Word[]): Map<string, Word> {
  const m = new Map<string, Word>()
  for (const w of words) m.set(normWord(w.text), w)
  return m
}
