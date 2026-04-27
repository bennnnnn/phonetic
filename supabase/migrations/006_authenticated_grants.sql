-- Fix "permission denied for table …" for the Supabase API (anon / authenticated).
-- RLS can pass and you still get denied if the role has no table privileges.

GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Lesson content
GRANT SELECT ON public.word_families TO anon, authenticated;
GRANT SELECT ON public.words TO anon, authenticated;
GRANT SELECT ON public.lessons TO anon, authenticated;

-- Per-user rows: logged-in users only
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_progress TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.quiz_attempts TO authenticated;

-- Leaderboard (002)
GRANT SELECT ON public.league_tiers TO anon, authenticated;
GRANT SELECT ON public.leagues TO anon, authenticated;
GRANT SELECT, UPDATE ON public.league_members TO authenticated;

-- Replace broad FOR ALL policies with explicit authenticated policies + WITH CHECK (insert-safe)

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "users own their profile" ON public.user_profiles;
CREATE POLICY "user_profiles_select_own"
  ON public.user_profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "user_profiles_insert_own"
  ON public.user_profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "user_profiles_update_own"
  ON public.user_profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "user_profiles_delete_own"
  ON public.user_profiles FOR DELETE TO authenticated USING (auth.uid() = id);

ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "users own their attempts" ON public.quiz_attempts;
CREATE POLICY "quiz_attempts_select_own"
  ON public.quiz_attempts FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "quiz_attempts_insert_own"
  ON public.quiz_attempts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "quiz_attempts_update_own"
  ON public.quiz_attempts FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "quiz_attempts_delete_own"
  ON public.quiz_attempts FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- RPC (only if 002 applied)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public' AND p.proname = 'increment_weekly_xp'
  ) THEN
    EXECUTE 'GRANT EXECUTE ON FUNCTION public.increment_weekly_xp(uuid, integer) TO authenticated';
  END IF;
END $$;
