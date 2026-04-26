-- League tiers
CREATE TABLE league_tiers (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  promote_top INT DEFAULT 3,
  demote_bottom INT DEFAULT 2
);

INSERT INTO league_tiers (name) VALUES ('Teal'), ('Gold'), ('Diamond'), ('Master');

-- Leagues
CREATE TABLE leagues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tier_id INT REFERENCES league_tiers(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- League members
CREATE TABLE league_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  league_id UUID REFERENCES leagues(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  weekly_xp INT DEFAULT 0,
  rank INT DEFAULT 0,
  movement INT DEFAULT 0,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE INDEX ON league_members(league_id);
CREATE INDEX ON league_members(user_id);
CREATE INDEX ON league_members(weekly_xp DESC);

ALTER TABLE leagues ENABLE ROW LEVEL SECURITY;
ALTER TABLE league_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE league_tiers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read tiers" ON league_tiers FOR SELECT USING (true);
CREATE POLICY "public read leagues" ON leagues FOR SELECT USING (true);
CREATE POLICY "members read their league" ON league_members FOR SELECT
  USING (league_id IN (SELECT league_id FROM league_members WHERE user_id = auth.uid()));
CREATE POLICY "members update own row" ON league_members FOR UPDATE
  USING (user_id = auth.uid());

-- Weekly XP increment RPC
CREATE OR REPLACE FUNCTION increment_weekly_xp(target_user_id UUID, xp_amount INT)
RETURNS VOID AS $$
  UPDATE league_members SET weekly_xp = weekly_xp + xp_amount
  WHERE user_id = target_user_id;
$$ LANGUAGE sql SECURITY DEFINER;
