import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'

type Notification = {
  id: string
  user_id: string
  type: string
  title: string
  body: string
  emoji: string
  link_route: string | null
  read: boolean
  created_at: string
}

type UseNotificationsReturn = {
  notifications: Notification[]
  unreadCount: number
  loading: boolean
  refetch: () => Promise<void>
  markAsRead: (id: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  deleteNotification: (id: string) => Promise<void>
}

export function useInAppNotifications(): UseNotificationsReturn {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    const { user } = useAuthStore.getState()
    if (!user) {
      setNotifications([])
      setLoading(false)
      return
    }
    try {
      setLoading(true)
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50)
      setNotifications((data as Notification[]) ?? [])
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void fetch() }, [])

  const markAsRead = useCallback(async (id: string) => {
    try {
      await supabase.from('notifications').update({ read: true }).eq('id', id)
      setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n))
    } catch {}
  }, [])

  const markAllAsRead = useCallback(async () => {
    const { user } = useAuthStore.getState()
    if (!user) return
    try {
      await supabase.from('notifications').update({ read: true }).eq('user_id', user.id).eq('read', false)
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    } catch {}
  }, [])

  const deleteNotification = useCallback(async (id: string) => {
    try {
      await supabase.from('notifications').delete().eq('id', id)
      setNotifications((prev) => prev.filter((n) => n.id !== id))
    } catch {}
  }, [])

  const unreadCount = notifications.filter((n) => !n.read).length

  return { notifications, unreadCount, loading, refetch: fetch, markAsRead, markAllAsRead, deleteNotification }
}
