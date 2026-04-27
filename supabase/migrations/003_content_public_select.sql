-- Fix "permission denied for table lessons" when RLS is on but policies
-- were never applied (or were dropped) on a remote project.

ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.word_families ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.words ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public read lessons" ON public.lessons;
CREATE POLICY "public read lessons"
  ON public.lessons
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "public read word_families" ON public.word_families;
CREATE POLICY "public read word_families"
  ON public.word_families
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "public read words" ON public.words;
CREATE POLICY "public read words"
  ON public.words
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Table privileges (safe if already granted)
GRANT SELECT ON public.lessons TO anon, authenticated;
GRANT SELECT ON public.word_families TO anon, authenticated;
GRANT SELECT ON public.words TO anon, authenticated;
