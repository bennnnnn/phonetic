/** Supabase / GoTrue email rate limits (signup, reset, magic link). */
export function isEmailRateLimited(err: unknown): boolean {
  if (!err || typeof err !== 'object') return false
  const o = err as { message?: string; code?: string; status?: number }
  if (o.status === 429) return true
  const m = (o.message ?? '').toLowerCase()
  const c = (o.code ?? '').toLowerCase()
  if (c === 'over_email_send_rate_limit') return true
  if (m.includes('rate limit') || m.includes('too many emails') || m.includes('email rate')) return true
  return false
}

function rawAuthMessage(err: unknown): string {
  if (err instanceof Error && err.message) return err.message
  if (typeof err === 'object' && err !== null && 'message' in err) {
    const m = (err as { message: unknown }).message
    if (typeof m === 'string' && m.length > 0) return m
  }
  return ''
}

export function friendlyEmailAuthMessage(err: unknown, fallback: string): string {
  if (isEmailRateLimited(err)) {
    return 'Too many emails were sent. Wait a few minutes, then try again. Check your spam folder for a link we may have already sent.'
  }
  const raw = rawAuthMessage(err)
  if (raw) return raw
  return fallback
}
