-- In-app notification feed
-- Created automatically by the app when events occur (friend joined, level up, streak milestone, etc.)

CREATE TABLE IF NOT EXISTS public.notifications (
  id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type          text NOT NULL CHECK (type IN (
    'friend_joined', 'level_up', 'streak_milestone', 'referral_milestone',
    'lesson_complete', 'group_complete', 'pro_activated', 'free_month_earned'
  )),
  title         text NOT NULL,
  body          text NOT NULL DEFAULT '',
  emoji         text NOT NULL DEFAULT '📌',
  link_route    text,            -- optional deep link when tapped (e.g., '/(tabs)/friends')
  read          boolean DEFAULT false NOT NULL,
  created_at    timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_created
  ON public.notifications (user_id, created_at DESC);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notifications_select_own"
  ON public.notifications FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "notifications_insert_own"
  ON public.notifications FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "notifications_update_own"
  ON public.notifications FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "notifications_delete_own"
  ON public.notifications FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
