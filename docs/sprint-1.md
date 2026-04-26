# PhonicsFlow — Sprint 1

**Goal:** Working lesson player for a single word family (-ake)
**Duration:** 2 weeks
**Definition of done:** User can open the app, see the -ake lesson, hear words pronounced, complete a quiz, and have progress saved.

---

## Task 1 — Project Setup
**Agent prompt:**
```
Initialize a new Expo project called "phonicsflow" using:
  npx create-expo-app phonicsflow --template tabs

Then install these dependencies:
  @supabase/supabase-js
  @react-navigation/native
  expo-router
  expo-av
  expo-haptics
  expo-speech
  expo-file-system
  react-native-reanimated
  zustand
  @react-native-async-storage/async-storage

Create the folder structure exactly as defined in CLAUDE.md.
Create /lib/tokens.ts with the design tokens from CLAUDE.md.
Create /lib/types.ts with all types from CLAUDE.md.
Create /lib/routes.ts with empty ROUTES object.
Create /lib/supabase.ts with Supabase client using env vars.
Create .env.local with empty placeholder keys from CLAUDE.md.
```

---

## Task 2 — Database Migration
**Agent prompt:**
```
Follow /skills/database-rules.md.
Create a Supabase migration file at /supabase/migrations/001_initial_schema.sql

Create these tables exactly as defined in CLAUDE.md:
  word_families, words, lessons, user_progress, user_profiles, quiz_attempts

Add Row Level Security (RLS) policies:
  - word_families, words, lessons → public read
  - user_progress, user_profiles, quiz_attempts → authenticated users own their data only

Add indexes on:
  words.word_family_id
  lessons.word_family_id
  user_progress.user_id
  user_progress.lesson_id
```

---

## Task 3 — Seed Data
**Agent prompt:**
```
Create /scripts/seed-lessons.ts

Seed the following data into Supabase:
  1. One word_family record:
     pattern: "-ake", sound: "/eɪk/", rule: "CVCe — silent e makes the vowel say its name"

  2. These words linked to that family:
     rake, bake, make, cake, lake, fake, sake, wake, take, quake, shake, flake, stake, snake, brake
     Each needs: text, definition (see below), phonemes array
     audio_url and slow_audio_url → leave as empty string for now (filled in Task 5)

  3. One lesson record:
     title: "The -ake Pattern", level: 1
     steps: decode → word_bank → sentences → quiz

Definitions:
  rake: "a garden tool with a long handle"
  bake: "to cook food in an oven using dry heat"
  make: "to create or produce something"
  cake: "a sweet baked food made with flour, eggs, and sugar"
  lake: "a large body of water surrounded by land"
  fake: "not real or genuine"
  sake: "for the purpose or benefit of something"
  wake: "to stop sleeping"
  take: "to reach out and hold something"
  quake: "to shake or tremble"
  shake: "to move back and forth quickly"
  flake: "a small, thin, flat piece of something"
  stake: "a pointed post driven into the ground"
  snake: "a long reptile with no legs"
  brake: "a device used to slow down or stop a vehicle"

Run the script: npx ts-node scripts/seed-lessons.ts
```

---

## Task 4 — Core Hooks
**Agent prompt:**
```
Follow /skills/create-supabase-hook.md for each.

Build these hooks:

1. /hooks/useLesson.ts
   - Input: lessonId string
   - Fetches lesson with nested word_family and words
   - Returns: { lesson, loading, error, refetch }

2. /hooks/useProgress.ts
   - Input: none (reads from auth)
   - Fetches all user_progress for current user
   - Returns: { progress, completedLessonIds, totalXP, loading, error }

3. /hooks/useSaveProgress.ts
   - Input: none
   - Returns: { saveProgress(lessonId, score, xpEarned), saving, error }
   - Upserts to user_progress table

4. /hooks/useAudio.ts
   - As defined in /skills/add-tts-audio.md exactly
```

---

## Task 5 — Audio Generation Script
**Agent prompt:**
```
Create /scripts/generate-audio.ts

This script:
1. Fetches all words from Supabase where audio_url is empty
2. For each word, calls ElevenLabs API (American voice, normal speed)
3. Calls ElevenLabs again (same voice, speed 0.7) for slow version
4. Uploads both audio files to Supabase storage bucket "audio-cache"
   Path format: words/{word_id}/normal.mp3 and words/{word_id}/slow.mp3
5. Updates the word record with the public URLs

Use the ElevenLabs client pattern from /skills/add-tts-audio.md
Handle rate limiting — add 500ms delay between API calls
Log progress: "Generated audio for: bake (3/15)"

Run with: ELEVENLABS_API_KEY=xxx npx ts-node scripts/generate-audio.ts
```

---

## Task 6 — UI Components
**Agent prompt:**
```
Build these components. Use design tokens from /lib/tokens.ts.
No hardcoded colors or sizes.

1. /components/ui/Button.tsx
   Props: label, onPress, variant ('primary'|'secondary'|'ghost'), size ('sm'|'md'|'lg'), loading, disabled
   Primary: teal background, white text
   Secondary: teal border, teal text, transparent bg
   Ghost: no border, teal text

2. /components/ui/Skeleton.tsx
   Props: width, height, borderRadius
   Animated shimmer effect using Reanimated

3. /components/ui/ErrorState.tsx
   Props: message, onRetry
   Shows error message + retry button

4. /components/ui/EmptyState.tsx
   Props: message, subtitle (optional)

5. /components/lesson/PatternHeader.tsx
   Props: pattern (e.g. "-ake"), sound (e.g. "/eɪk/"), rule (e.g. "CVCe...")
   Shows large stylized pattern with colored suffix
   Teal color for the pattern part

6. /components/lesson/WordCard.tsx
   Props: word (Word type), onPress, revealed (bool)
   Shows word text with teal colored suffix matching the pattern
   AudioButton on the right
   Definition shown when revealed=true
   Tap → scale bounce animation via Reanimated
```

---

## Task 7 — Lesson Screen
**Agent prompt:**
```
Follow /skills/create-screen.md.

Build /app/lesson/[id].tsx

This is the core lesson screen with 4 steps (tab-style progress):
  Step 1 — Decode: show PatternHeader, explain the rule, 3 example words with audio
  Step 2 — Word Bank: grid of WordCards, each plays audio on tap, revealed on tap
  Step 3 — Sentences: list of 5 practice sentences, -ake words highlighted in teal, tap word to hear it
  Step 4 — Quiz: 6 multiple choice questions (definition → word), score tracked

Navigation between steps: Next button at bottom, previous via back arrow
Progress bar at top showing current step (1-4)

Use:
  useLesson(id) for data
  useAudio() for playback
  PatternHeader, WordCard, Button, Skeleton, ErrorState components

On quiz completion:
  Call useSaveProgress with the score
  Show celebration (use Lottie from /assets/lottie/celebrate.json if it exists, else skip)
  Show score summary with XP earned
  Button: "Back to Home"

Word cards stagger in with 80ms delay using Reanimated FadeInDown.
```

---

## Task 8 — Home Screen
**Agent prompt:**
```
Follow /skills/create-screen.md.

Build /app/(tabs)/home/index.tsx

Shows:
  - Greeting: "Good morning, [name]" (use time of day)
  - Streak badge: "🔥 {streakDays} day streak"
  - Section: "Continue Learning" → lesson cards for in-progress lessons
  - Section: "Word Families" → horizontal scroll of family cards (one per pattern)

Each lesson card:
  - Shows pattern (e.g. "-ake"), level badge, progress bar if started
  - Tap → router.push(ROUTES.LESSON(id))

Use useProgress() for completion data.
Hard-code one lesson card pointing to the -ake lesson (id from seed data).
```

---

## Task 9 — Auth Flow
**Agent prompt:**
```
Build minimal auth:

1. /lib/supabase.ts — already exists, add getSession helper
2. /store/authStore.ts — Zustand store with user, session, signIn, signOut, loading
3. /app/(auth)/login.tsx — email + password login form, link to signup
4. /app/(auth)/signup.tsx — name + email + password, creates user_profiles record on signup
5. /app/_layout.tsx — root layout, checks session on load, redirects to /login if none

Use Supabase Auth (email/password only for now).
On signup success: create user_profiles row with display_name, default values.
```

---

## Task 10 — End-to-End Test Run
**Agent prompt:**
```
Run the app with: npx expo start

Fix any TypeScript errors: npx tsc --noEmit
Fix any lint errors: npx eslint . --ext .ts,.tsx

Verify this flow works end to end:
1. Open app → redirect to /login
2. Sign up → land on home screen
3. Tap -ake lesson card → lesson screen loads
4. Step 1: decode screen shows, pattern is visible
5. Step 2: word cards load, tapping plays audio
6. Step 3: sentences show with highlighted words
7. Step 4: quiz runs, score saves to Supabase
8. Return to home → lesson shows as completed

Report any broken steps as a list with the error message.
```

---

## Sprint 1 Completion Criteria
- [ ] App runs on iOS simulator and Android emulator
- [ ] User can sign up and log in
- [ ] -ake lesson is fully playable (all 4 steps)
- [ ] Audio plays for all 15 words (normal + slow)
- [ ] Quiz score saves to Supabase
- [ ] No TypeScript errors
- [ ] No crashes on happy path

---

## Sprint 2 Preview (don't build yet)
- More word families seeded (all short vowel families)
- Pronunciation check with Whisper
- Streak tracking + XP system
- RevenueCat paywall (free: 3 lessons, pro: unlimited)
- Onboarding flow
- Push notifications for streak reminders

---

## Task 11 — Leaderboard Screen

**Agent prompt:**
```
Follow /skills/create-screen.md and /docs/ui-screens.md (Screen 14).
Follow /skills/create-supabase-hook.md for all data hooks.
Follow /skills/delight-system.md for interactions.

Build the leaderboard feature — screen + backend + logic.

---

### 1. Database migration

Create /supabase/migrations/004_leaderboard.sql

Tables:
  leagues
    id, name (text), tier (1|2|3|4), created_at

  league_members
    id, league_id, user_id, weekly_xp (int, default 0), rank (int), movement (int), joined_at
    RLS: users can read all members in their league, write only their own row

  league_tiers
    id, name ('Teal'|'Gold'|'Diamond'|'Master'), min_rank_to_promote (3), max_rank_to_demote (2)

Indexes:
  league_members.league_id
  league_members.user_id
  league_members.weekly_xp DESC (for ranking)

Seed 4 league tiers:
  1 = Teal, 2 = Gold, 3 = Diamond, 4 = Master

---

### 2. Leaderboard hooks

Build /hooks/useLeaderboard.ts
  - Fetches current user's league_members row to get their league_id
  - Fetches all members in that league ordered by weekly_xp DESC
  - Returns: { members, userRank, userMember, loading, error }
  - Members shape: { id, user_id, display_name, weekly_xp, rank, movement, streak_days }

Build /hooks/useLeagueTier.ts
  - Returns current user's league tier name (Teal/Gold/Diamond/Master)
  - Returns days until weekly reset (next Sunday midnight)

---

### 3. Leaderboard screen

Build /app/(tabs)/leagues/index.tsx

Layout (exactly as /docs/ui-screens.md Screen 14):
  - White header:
      - "leaderboard" title left
      - League tier badge top right (e.g. "Teal League") — colored dot + name
      - 3-tab toggle: "this week" | "all time" | "friends"
      - "resets in X days · top 3 promote to [next tier] League" — muted 11px

  - Podium (top 3 users):
      - 3-column layout, order: 2nd | 1st | 3rd
      - 1st place block: #1D9E75, 72px tall, 72px wide, crown above avatar
      - 2nd place block: #5DCAA5, 56px tall, 60px wide
      - 3rd place block: #9FE1CB, 44px tall, 60px wide
      - Each: avatar (initials circle), name (truncated 10 chars), XP, rank number in block

  - Scrollable list (ranks 4–10+):
      - Each row: rank, avatar, name, streak, XP right-aligned, movement badge
      - Movement badge: green "+N" (#E1F5EE bg) for climbing, red "-N" (#FCEBEB bg) for dropping
      - User's own row:
          - #E1F5EE background, 1.5px #1D9E75 border
          - Teal avatar (#1D9E75 bg, white initial)
          - "(you)" appended to name
          - Divider lines above and below

  - Loading state: skeleton rows for list, skeleton blocks for podium
  - Empty state: "No league yet — complete your first lesson to join!"

---

### 4. Weekly XP reset (Supabase Edge Function)

Create /supabase/functions/weekly-reset/index.ts

Logic (runs every Sunday at midnight UTC via cron):
  1. For each league, rank members by weekly_xp DESC
  2. Calculate movement = old_rank - new_rank (positive = climbed)
  3. Update all league_members rows with new rank + movement
  4. Promote top 3 in each league to next tier (create new league_members row in higher league)
  5. Demote bottom 2 to previous tier (if tier > 1)
  6. Reset all weekly_xp to 0
  7. Log: "Reset complete: X leagues processed"

---

### 5. Weekly XP tracking

When useSaveProgress saves a completed lesson:
  Also call: supabase.rpc('increment_weekly_xp', { user_id, xp_amount })

Create the RPC in a migration:
  CREATE OR REPLACE FUNCTION increment_weekly_xp(user_id uuid, xp_amount int)
  RETURNS void AS $$
    UPDATE league_members
    SET weekly_xp = weekly_xp + xp_amount
    WHERE league_members.user_id = $1;
  $$ LANGUAGE sql SECURITY DEFINER;

---

### 6. Tab bar update

Update /app/(tabs)/_layout.tsx to include 4 tabs:
  home | progress | leagues | profile

Leagues tab icon: a simple podium SVG (3 bars of different heights).
Active state: teal icon + teal dot + teal label.

---

### 7. Friends tab (stub)

"friends" tab shows:
  - "Invite friends to compete" card with share button
  - Share link: https://phonicsflow.app/join/[user_id]
  - Empty state if no friends yet: "No friends yet — share your link!"
  - Use Expo Sharing for the share action

Full friends social graph is Sprint 3 scope. This sprint: invite link only.

---

### Delight moments

When user opens leaderboard and sees they've climbed:
  - Movement badge "+N" pulses once with Reanimated scale spring
  - soundEngine.play('streakContinue') at 0.5 volume
  - haptics.tap()

When user reaches top 3 for the first time:
  - Show StreakModal-style banner: "You're in the top 3!"
  - soundEngine.play('perfect')
  - haptics.celebrate()
```

---

## Sprint 1 Completion Criteria (updated)
- [ ] App runs on iOS simulator and Android emulator
- [ ] User can sign up and log in
- [ ] -ake lesson is fully playable (word learning → sentences → quiz)
- [ ] Quiz auto-advances — no next button
- [ ] Audio plays for all 15 words
- [ ] Quiz score saves to Supabase
- [ ] Lesson complete ceremony plays (confetti + score count + stars)
- [ ] Leaderboard screen renders with mock data
- [ ] Tab bar has 4 tabs: home, progress, leagues, profile
- [ ] Weekly XP increments when lesson completes
- [ ] No TypeScript errors
- [ ] No crashes on happy path

---

## Sprint 2 Preview (don't build yet)
- Full onboarding flow (4 screens)
- Sign up screen with Google OAuth + email expand
- Pronunciation check with Whisper
- Streak tracking + XP system fully wired
- RevenueCat paywall (free: 3 lessons, pro: unlimited)
- Push notifications for streak reminders
- Friends social graph (follow, compare, invite)
- More word families seeded (all short vowel families)
