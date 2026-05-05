import AsyncStorage from '@react-native-async-storage/async-storage'

const keyFor = (userId: string) => `@phonicsflow/friends_xp_v1:${userId}`

type Snapshot = {
  friends: Record<string, number>
  myXp: number
}

export async function readFriendXpSnapshot(userId: string): Promise<Snapshot | null> {
  try {
    const raw = await AsyncStorage.getItem(keyFor(userId))
    if (!raw) return null
    const parsed = JSON.parse(raw) as Snapshot
    if (!parsed || typeof parsed.myXp !== 'number' || typeof parsed.friends !== 'object')
      return null
    return parsed
  } catch {
    return null
  }
}

export async function writeFriendXpSnapshot(
  userId: string,
  friends: { id: string; total_xp: number }[],
  myXp: number,
): Promise<void> {
  try {
    const friendsMap: Record<string, number> = {}
    for (const f of friends) friendsMap[f.id] = f.total_xp
    await AsyncStorage.setItem(
      keyFor(userId),
      JSON.stringify({ friends: friendsMap, myXp }),
    )
  } catch (err) {
    console.warn('[friendXpSnapshot] write failed:', err)
  }
}
