-- Group progress tracking for vocabulary theme completions

CREATE TABLE IF NOT EXISTS public.group_progress (
  id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  group_name    text NOT NULL,
  completed     boolean DEFAULT false NOT NULL,
  completed_at  timestamptz,
  UNIQUE(user_id, group_name)
);

ALTER TABLE public.group_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "group_progress_select_own"
  ON public.group_progress FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "group_progress_insert_own"
  ON public.group_progress FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "group_progress_update_own"
  ON public.group_progress FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "group_progress_delete_own"
  ON public.group_progress FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.group_progress TO authenticated;
