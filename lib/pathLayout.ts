import { spacing } from './tokens'

export const NODE_SIZE   = 100
export const NODE_GAP    = 48
export const NODE_STEP   = NODE_SIZE + NODE_GAP
export const INITIAL_TOP = 20
export const NUM_DOTS    = 4
export const DOT_SIZE    = 7

export const WAVE = [0.45, 0.64, 0.8, 0.64, 0.45, 0.26, 0.1, 0.26]

export const PALETTE = [
  { bg: '#FF9500', shadow: '#B86D00' },
  { bg: '#5856D6', shadow: '#332F9F' },
  { bg: '#FF3B30', shadow: '#B82820' },
  { bg: '#007AFF', shadow: '#0050B3' },
  { bg: '#34C759', shadow: '#1E8034' },
  { bg: '#AF52DE', shadow: '#7B2FAF' },
  { bg: '#FF6B35', shadow: '#B84510' },
  { bg: '#32ADE6', shadow: '#1B79B8' },
]

export function buildDots(
  pathNodes: Array<{ left: number; top: number }>,
): Array<{ key: string; x: number; y: number; opacity: number }> {
  const result: Array<{ key: string; x: number; y: number; opacity: number }> = []
  for (let i = 0; i < pathNodes.length - 1; i++) {
    const a = pathNodes[i]!, b = pathNodes[i + 1]!
    const ax = a.left + NODE_SIZE / 2, bx = b.left + NODE_SIZE / 2
    const ay = a.top  + NODE_SIZE + 4, by = b.top  - 4
    for (let d = 1; d <= NUM_DOTS; d++) {
      const t = d / (NUM_DOTS + 1)
      result.push({
        key:     `${i}-${d}`,
        x:       ax + (bx - ax) * t - DOT_SIZE / 2,
        y:       ay + (by - ay) * t - DOT_SIZE / 2,
        opacity: 0.25 + 0.1 * (d % 2),
      })
    }
  }
  return result
}

export function nodeLeft(index: number, availableWidth: number): number {
  return Math.round(availableWidth * WAVE[index % WAVE.length]!) + spacing.lg
}

export function nodeTop(index: number): number {
  return INITIAL_TOP + index * NODE_STEP
}
