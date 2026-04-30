-- Add pronunciation column (simple respelling like "bot" for "bought")

ALTER TABLE words
ADD COLUMN IF NOT EXISTS pronunciation TEXT;

-- Backfill existing words with a basic respelling based on text
-- This is a rough fallback — admins should curate proper values
UPDATE words SET pronunciation = lower(text) WHERE pronunciation IS NULL;
