/**
 * Centralised error handling service.
 * In production, swap console.warn for Sentry / Datadog / etc.
 *
 * Usage:
 *   import { reportError, tryOrIgnore } from '@/lib/errors'
 *   await tryOrIgnore(() => riskyOperation(), 'MyComponent.functionName')
 */

const IS_DEV = __DEV__

export function reportError(context: string, error: unknown): void {
  const message = error instanceof Error ? error.message : String(error ?? 'Unknown error')
  const stack = error instanceof Error ? error.stack : undefined

  if (IS_DEV) {
    console.warn(`[${context}]`, message)
    if (stack) console.warn(stack)
  } else {
    // TODO: Send to Sentry / Datadog / your error tracker
    // Sentry.captureException(error, { tags: { context } })
    console.warn(`[${context}]`, message)
  }
}

/**
 * Wraps an async operation and silently swallows errors.
 * Use for best-effort operations where failure is acceptable.
 */
export async function tryOrIgnore<T>(fn: () => Promise<T>, context: string): Promise<T | undefined> {
  try {
    return await fn()
  } catch (err) {
    reportError(context, err)
    return undefined
  }
}

/**
 * Wraps a sync operation and silently swallows errors.
 */
export function trySyncOrIgnore<T>(fn: () => T, context: string): T | undefined {
  try {
    return fn()
  } catch (err) {
    reportError(context, err)
    return undefined
  }
}
