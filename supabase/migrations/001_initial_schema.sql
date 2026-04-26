-- Word families
CREATE TABLE word_families (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pattern TEXT NOT NULL,
  sound TEXT NOT NULL,
  rule TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Words
CREATE TABLE words (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  word_family_id UUID REFERENCES word_families(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  consonant TEXT NOT NULL,
  pattern TEXT NOT NULL,
  definition TEXT NOT NULL,
  phoneme TEXT NOT NULL,
  audio_url TEXT DEFAULT '',
  slow_audio_url TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lessons
CREATE TABLE lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  word_family_id UUID REFERENCES word_families(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  level INT NOT NULL DEFAULT 1 CHECK (level IN (1, 2, 3)),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User profiles
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL DEFAULT '',
  streak_days INT DEFAULT 0,
  total_xp INT DEFAULT 0,
  level INT DEFAULT 1,
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free','pro','lifetime')),
  dyslexia_font BOOLEAN DEFAULT FALSE,
  larger_text BOOLEAN DEFAULT FALSE,
  preferred_accent TEXT DEFAULT 'american',
  daily_goal INT DEFAULT 2,
  reminder_time TEXT DEFAULT '08:00',
  last_active_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User progress
CREATE TABLE user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT FALSE,
  score INT DEFAULT 0,
  xp_earned INT DEFAULT 0,
  words_mastered JSONB DEFAULT '[]',
  words_skipped JSONB DEFAULT '[]',
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

-- Quiz attempts
CREATE TABLE quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  answers JSONB DEFAULT '[]',
  score INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX ON words(word_family_id);
CREATE INDEX ON lessons(word_family_id);
CREATE INDEX ON user_progress(user_id);
CREATE INDEX ON user_progress(lesson_id);

-- RLS
ALTER TABLE word_families ENABLE ROW LEVEL SECURITY;
ALTER TABLE words ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;

-- Public read for content
CREATE POLICY "public read word_families" ON word_families FOR SELECT USING (true);
CREATE POLICY "public read words" ON words FOR SELECT USING (true);
CREATE POLICY "public read lessons" ON lessons FOR SELECT USING (true);

-- User owns their data
CREATE POLICY "users own their profile" ON user_profiles
  FOR ALL USING (auth.uid() = id);
CREATE POLICY "users own their progress" ON user_progress
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "users own their attempts" ON quiz_attempts
  FOR ALL USING (auth.uid() = user_id);
