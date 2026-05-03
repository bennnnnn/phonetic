-- Add words_mastered and words_skipped columns to group_progress

ALTER TABLE public.group_progress
  ADD COLUMN IF NOT EXISTS words_mastered jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS words_skipped jsonb DEFAULT '[]'::jsonb;
