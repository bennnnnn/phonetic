-- Reliable RLS + grants for lesson progress (fixes silent insert/update failures on some projects).

ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users own their progress" ON public.user_progress;

CREATE POLICY "user_progress_select_own"
  ON public.user_progress
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "user_progress_insert_own"
  ON public.user_progress
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_progress_update_own"
  ON public.user_progress
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_progress_delete_own"
  ON public.user_progress
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_progress TO authenticated;

-- Weekly XP RPC: allow the app to call it when logged in (no-op if not in a league yet).
GRANT EXECUTE ON FUNCTION public.increment_weekly_xp(uuid, integer) TO authenticated;

-- Backfill: older app builds set completed = false when quiz was under 70% even after finishing the lesson.
UPDATE public.user_progress
SET completed = true
WHERE completed_at IS NOT NULL AND completed = false;
