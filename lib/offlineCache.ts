/**
 * Offline cache layer for Supabase data.
 *
 * Pattern: cache-first → render instantly → background-refresh → update UI.
 * Allows the app to work offline and feel instant on relaunch.
 *
 * Cache keys follow the convention: `cache:<type>:<userId>`
 * Each entry stores: { data, cachedAt (ISO string), expiresAt (ISO string) }
 */

import AsyncStorage from '@react-native-async-storage/async-storage'
import { reportError } from '@/lib/errors'

const DEFAULT_TTL_MS = 5 * 60 * 1000 // 5 minutes

type CacheEntry<T> = {
  data: T
  cachedAt: string
  expiresAt: string
}

/** Generate a standardised cache key for a user-scoped data type. */
function cacheKey(type: string, userId: string): string {
  return `cache:${type}:${userId}`
}

/**
 * Write data to cache with a TTL.
 * Returns true on success.
 */
export async function writeCache<T>(
  type: string,
  userId: string,
  data: T,
  ttlMs: number = DEFAULT_TTL_MS,
): Promise<boolean> {
  try {
    const now = Date.now()
    const entry: CacheEntry<T> = {
      data,
      cachedAt: new Date(now).toISOString(),
      expiresAt: new Date(now + ttlMs).toISOString(),
    }
    await AsyncStorage.setItem(cacheKey(type, userId), JSON.stringify(entry))
    return true
  } catch (err) {
    reportError('writeCache', err)
    return false
  }
}

/**
 * Read data from cache.
 * Returns { data, stale } — stale is true if the TTL has expired but data is still available.
 * Returns null if no cache entry exists.
 */
export async function readCache<T>(
  type: string,
  userId: string,
): Promise<{ data: T; stale: boolean } | null> {
  try {
    const raw = await AsyncStorage.getItem(cacheKey(type, userId))
    if (!raw) return null

    const entry: CacheEntry<T> = JSON.parse(raw)
    const now = Date.now()
    const expiresAt = new Date(entry.expiresAt).getTime()
    const stale = now > expiresAt

    return { data: entry.data, stale }
  } catch (err) {
    reportError('readCache', err)
    return null
  }
}

/**
 * Remove a single cache entry.
 */
export async function removeCache(type: string, userId: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(cacheKey(type, userId))
  } catch (err) {
    reportError('removeCache', err)
  }
}

/**
 * Remove all cache entries for a user (e.g., on logout).
 */
export async function clearUserCache(userId: string): Promise<void> {
  try {
    const keys = await AsyncStorage.getAllKeys()
    const userKeys = keys.filter((k) => k.startsWith(`cache:`) && k.endsWith(`:${userId}`))
    if (userKeys.length > 0) {
      await AsyncStorage.multiRemove(userKeys)
    }
  } catch (err) {
    reportError('clearUserCache', err)
  }
}

/**
 * Remove ALL cache entries (e.g., for a manual cache clear).
 */
export async function clearAllCache(): Promise<void> {
  try {
    const keys = await AsyncStorage.getAllKeys()
    const cacheKeys = keys.filter((k) => k.startsWith('cache:'))
    if (cacheKeys.length > 0) {
      await AsyncStorage.multiRemove(cacheKeys)
    }
  } catch (err) {
    reportError('clearAllCache', err)
  }
}

/**
 * Cache constants — use these as the `type` parameter for consistency.
 */
export const CACHE_TYPES = {
  USER_PROGRESS: 'user-progress',
  GROUP_PROGRESS: 'group-progress',
  USER_PROFILE: 'user-profile',
  LESSON_DIRECTORY: 'lesson-directory',
  COMPLETED_GROUPS: 'completed-groups',
  NOTIFICATIONS: 'notifications',
} as const
