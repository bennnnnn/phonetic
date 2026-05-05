-- Friend-visible lesson aggregates (SECURITY DEFINER: bypasses user_progress RLS only for friendship pairs)

CREATE OR REPLACE FUNCTION public.get_friends_lesson_stats()
RETURNS TABLE (
  friend_id uuid,
  lessons_completed_total integer,
  lessons_completed_last_7d integer
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH my_friends AS (
    SELECT
      CASE
        WHEN fr.referrer_id = auth.uid() THEN fr.referred_id
        ELSE fr.referrer_id
      END AS fid
    FROM public.friendships fr
    WHERE fr.referrer_id = auth.uid()
       OR fr.referred_id = auth.uid()
  )
  SELECT
    mf.fid AS friend_id,
    COALESCE(
      (
        SELECT count(*)::int
        FROM public.user_progress up
        WHERE up.user_id = mf.fid
          AND up.completed IS TRUE
      ),
      0
    ) AS lessons_completed_total,
    COALESCE(
      (
        SELECT count(*)::int
        FROM public.user_progress up
        WHERE up.user_id = mf.fid
          AND up.completed IS TRUE
          AND up.completed_at >= (now() - interval '7 days')
      ),
      0
    ) AS lessons_completed_last_7d
  FROM my_friends mf;
$$;

REVOKE ALL ON FUNCTION public.get_friends_lesson_stats() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_friends_lesson_stats() TO authenticated;

-- In-app feed: someone you're tracking passed you on total XP since last Friends visit
ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_type_check;

ALTER TABLE public.notifications ADD CONSTRAINT notifications_type_check CHECK (type IN (
  'friend_joined',
  'level_up',
  'streak_milestone',
  'referral_milestone',
  'lesson_complete',
  'group_complete',
  'pro_activated',
  'free_month_earned',
  'friend_pull_ahead'
));
