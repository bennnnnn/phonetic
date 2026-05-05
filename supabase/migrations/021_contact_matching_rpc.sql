-- RPC: given an array of email addresses (from the user's device contacts),
-- return the subset that have PhonicsFlow accounts (excluding the caller).
-- SECURITY DEFINER so it can read auth.users without exposing that table.
CREATE OR REPLACE FUNCTION public.find_users_by_emails(p_emails text[])
RETURNS TABLE (
  user_id      uuid,
  display_name text,
  total_xp     int,
  streak_days  int
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    up.id          AS user_id,
    up.display_name,
    COALESCE(up.total_xp,    0)::int AS total_xp,
    COALESCE(up.streak_days, 0)::int AS streak_days
  FROM auth.users        au
  JOIN public.user_profiles up ON up.id = au.id
  WHERE lower(au.email) = ANY(
    SELECT lower(e) FROM unnest(p_emails) AS e
  )
    AND au.id <> auth.uid();   -- never return the caller themselves
END;
$$;

GRANT EXECUTE ON FUNCTION public.find_users_by_emails(text[]) TO authenticated;

-- Allow either party to create a contact-discovered friendship
-- (existing insert policy only allows referred_id = current user)
-- We add a second policy covering the referrer side.
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'friendships' AND policyname = 'friends_insert_referrer'
  ) THEN
    CREATE POLICY "friends_insert_referrer" ON public.friendships
      FOR INSERT WITH CHECK (auth.uid() = referrer_id);
  END IF;
END $$;
