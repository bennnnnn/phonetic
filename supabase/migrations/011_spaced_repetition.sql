-- Add next_review_at column for spaced repetition scheduling

ALTER TABLE user_progress
ADD COLUMN IF NOT EXISTS next_review_at TIMESTAMPTZ;

ALTER TABLE group_progress
ADD COLUMN IF NOT EXISTS next_review_at TIMESTAMPTZ;

ALTER TABLE user_progress
ADD COLUMN IF NOT EXISTS next_review_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS repetitions INTEGER NOT NULL DEFAULT 0;

-- Index for efficient queries: "what's due for review?"
CREATE INDEX IF NOT EXISTS idx_user_progress_next_review
ON user_progress (user_id, next_review_at)
WHERE next_review_at IS NOT NULL AND completed = true;

CREATE INDEX IF NOT EXISTS idx_group_progress_next_review
ON group_progress (user_id, next_review_at)
WHERE next_review_at IS NOT NULL AND completed = true;
