/** XP band size for level-up display (tune with product; keep in one place). */
export const XP_PER_LEVEL = 500

/** Display level from cumulative XP (1-based). */
export function levelFromTotalXp(totalXp: number): number {
  return Math.max(1, Math.floor(totalXp / XP_PER_LEVEL) + 1)
}

/** Progress 0–100 within the current XP band toward the next level. */
export function xpProgressPercentInCurrentLevel(totalXp: number): number {
  const remainder = totalXp % XP_PER_LEVEL
  return Math.min(100, Math.round((remainder / XP_PER_LEVEL) * 100))
}

export function xpToReachNextLevel(totalXp: number): number {
  const remainder = totalXp % XP_PER_LEVEL
  return XP_PER_LEVEL - remainder
}
