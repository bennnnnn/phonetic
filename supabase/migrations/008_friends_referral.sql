-- ── Referral codes ────────────────────────────────────────────────────────────

ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS referral_code text UNIQUE;

-- Back-fill existing rows
UPDATE public.user_profiles
SET referral_code = upper(substring(replace(gen_random_uuid()::text, '-', ''), 1, 8))
WHERE referral_code IS NULL;

-- Auto-generate for every new profile
CREATE OR REPLACE FUNCTION public.set_referral_code()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.referral_code IS NULL THEN
    NEW.referral_code :=
      upper(substring(replace(gen_random_uuid()::text, '-', ''), 1, 8));
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_set_referral_code ON public.user_profiles;
CREATE TRIGGER trg_set_referral_code
  BEFORE INSERT ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_referral_code();

-- ── Friendships ────────────────────────────────────────────────────────────────
-- referrer_id = the person who shared their code
-- referred_id = the new user who entered the code on signup

CREATE TABLE IF NOT EXISTS public.friendships (
  id          uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id uuid        REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  referred_id uuid        REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at  timestamptz DEFAULT now() NOT NULL,
  UNIQUE(referrer_id, referred_id),
  CHECK (referrer_id <> referred_id)
);

ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;

-- Both sides of a friendship can read it
CREATE POLICY "friends_select" ON public.friendships
  FOR SELECT USING (auth.uid() = referrer_id OR auth.uid() = referred_id);

-- Only the new user (referred) inserts the row (after their own signup)
CREATE POLICY "friends_insert" ON public.friendships
  FOR INSERT WITH CHECK (auth.uid() = referred_id);

GRANT SELECT, INSERT ON public.friendships TO authenticated;

-- ── Allow authenticated users to read any profile (needed for friends list) ───
-- (Safe: only display_name, streak_days, total_xp are exposed)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'user_profiles' AND policyname = 'profiles_public_read'
  ) THEN
    CREATE POLICY "profiles_public_read" ON public.user_profiles
      FOR SELECT USING (auth.uid() IS NOT NULL);
  END IF;
END$$;
