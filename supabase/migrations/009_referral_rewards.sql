-- Referral reward tracking for free Pro months.
-- When a referred friend signs up, the referrer's count increments.
-- Every 10 successful referrals grants 1 free month of Pro.

CREATE TABLE IF NOT EXISTS public.referral_rewards (
  id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  referral_count  int DEFAULT 0 NOT NULL,
  free_months     int DEFAULT 0 NOT NULL,   -- total free months earned (not yet consumed)
  consumed_months int DEFAULT 0 NOT NULL,   -- months already used
  created_at      timestamptz DEFAULT now() NOT NULL,
  updated_at      timestamptz DEFAULT now() NOT NULL,
  UNIQUE(user_id)
);

ALTER TABLE public.referral_rewards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "referral_rewards_select_own"
  ON public.referral_rewards FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "referral_rewards_insert_own"
  ON public.referral_rewards FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "referral_rewards_update_own"
  ON public.referral_rewards FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

GRANT SELECT, INSERT, UPDATE ON public.referral_rewards TO authenticated;
