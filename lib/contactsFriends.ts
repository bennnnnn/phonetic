import * as Contacts from 'expo-contacts'
import { supabase } from '@/lib/supabase'

/**
 * Reads device contacts with email, RPC-matches existing PhonicsFlow users,
 * inserts friendship rows (referrer = current user). Caller should ensure
 * permissions were granted beforehand.
 *
 * Raw emails stay on-device in the expo-contacts read; Supabase RPC only accepts
 * a list client-side matching the app's prior permission UX.
 */
export async function matchContactsToFriendships(
  userId: string,
): Promise<{ matched: number }> {
  const { status } = await Contacts.getPermissionsAsync()
  if (status !== 'granted') return { matched: 0 }

  const { data } = await Contacts.getContactsAsync({
    fields: [Contacts.Fields.Emails],
  })

  const emails: string[] = []
  for (const contact of data ?? []) {
    for (const e of contact.emails ?? []) {
      if (e.email) emails.push(e.email.toLowerCase())
    }
  }

  if (emails.length === 0) return { matched: 0 }

  const { data: matches, error } = await supabase.rpc('find_users_by_emails', {
    p_emails: emails,
  })

  if (error || !matches?.length) return { matched: 0 }

  const rows = matches.map((m: { user_id: string }) => ({
    referrer_id: userId,
    referred_id: m.user_id,
  }))

  const { error: upsertErr } = await supabase.from('friendships').upsert(rows, { ignoreDuplicates: true })
  if (upsertErr) console.warn('[contactsFriends] friendship upsert failed:', upsertErr)

  return { matched: matches.length }
}

/** Request contacts access (if needed) then run matching. */
export async function matchContactsAfterPermissionPrompt(
  userId: string,
): Promise<{ matched: number; granted: boolean }> {
  const { status } = await Contacts.requestPermissionsAsync()
  if (status !== 'granted') return { matched: 0, granted: false }

  // Permission just granted — skip the re-check inside matchContactsToFriendships
  const { data } = await Contacts.getContactsAsync({ fields: [Contacts.Fields.Emails] })
  const emails: string[] = []
  for (const contact of data ?? []) {
    for (const e of contact.emails ?? []) {
      if (e.email) emails.push(e.email.toLowerCase())
    }
  }
  if (emails.length === 0) return { matched: 0, granted: true }

  const { data: matches, error } = await supabase.rpc('find_users_by_emails', { p_emails: emails })
  if (error || !matches?.length) return { matched: 0, granted: true }

  const rows = matches.map((m: { user_id: string }) => ({
    referrer_id: userId,
    referred_id: m.user_id,
  }))
  const { error: upsertErr } = await supabase.from('friendships').upsert(rows, { ignoreDuplicates: true })
  if (upsertErr) console.warn('[contactsFriends] friendship upsert failed:', upsertErr)

  return { matched: matches.length, granted: true }
}
