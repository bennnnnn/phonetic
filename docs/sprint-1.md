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
Create /scripts/generate-audio.ts (or align an existing script with this flow)

This script:
1. Fetches all words from Supabase where audio_url or slow_audio_url is empty
2. For each word, generates audio via Google Cloud Text-to-Speech (or another
   server-side TTS provider) — normal speed for `audio_url`, slower for `slow_audio_url`
3. Uploads both files to Supabase Storage (e.g. bucket "audio-cache")
   Path format: words/{word_id}/normal.mp3 and words/{word_id}/slow.mp3
4. Updates the word row with the public URLs

Follow /skills/add-tts-audio.md (batch generation, keys only in script env, never on device).
Handle rate limiting — add ~500ms delay between API calls if needed.
Log progress: "Generated audio for: bake (3/15)"

Run with service credentials / API key in env (see CLAUDE.md Environment Variables).
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

4. Empty states: there is no shared `/components/ui/EmptyState.tsx` — use a small
   inline layout (title + hint + CTA) or a screen-local component (see Friends tab).

5. /components/lesson/LessonHeader.tsx, BannerBar.tsx, WordFocusCard.tsx, QueueStrip.tsx, AudioButton.tsx
   Build to match /docs/ui-screens.md and existing patterns (consonant vs pattern colors, Georgia for pattern text).
```

---

## Task 7 — Lesson Screen
**Agent prompt:**
```
Follow /skills/create-screen.md and /docs/ui-screens.md.

The implemented lesson flow lives in /app/lesson/[id].tsx — word-at-a-time learning, not a 4-tab wizard.

Core pieces:
  - useLesson(id), useLessonStore for master/skip state
  - LessonHeader, WordFocusCard, QueueStrip, LessonCompleteBanner (BannerBar)
  - useAudio for word audio (URLs from DB + fallback TTS per /skills/add-tts-audio.md)
  - ErrorState + Skeleton for loading/error

After the word queue, navigation continues to quiz/sentences per ROUTES in /lib/routes.ts
(see app/quiz/[id].tsx, app/sentences/[id].tsx).

When extending this screen, keep consonant/pattern colors and Georgia rules from CLAUDE.md.
```

---

## Task 8 — Home Screen
**Agent prompt:**
```
Follow /skills/create-screen.md.

Build /app/(tabs)/home.tsx

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

## Task 11 — Friends (no leagues)

**Product direction:** There are **no leagues** or weekly leaderboard tiers. Social comparison is **friends-only**: invite links, optional **contacts matching** during onboarding, and a **Friends** tab that lists linked users sorted by **total XP** with plain-language rank vs you.

**Agent prompt:**
```
Follow /docs/ui-screens.md — Friends (`/(tabs)/friends`).
Follow /skills/create-screen.md and /skills/create-supabase-hook.md where relevant.

### Data & privacy
- friendships table (referrer_id, referred_id): created on referral signup and on contact match
- find_users_by_emails RPC: server matches contact emails to existing accounts; client never displays raw emails from contacts
- User profiles: display_name, streak_days, total_xp for each friend

### App
- /app/(tabs)/friends.tsx — invite card (share/referral), empty state, list with XP sort, rank among you+friends, XP ahead/behind copy
- Onboarding contacts screen: request permission, call RPC, upsert friendships for matches
- Tab bar: home | progress | friends | profile (Friends is the third tab)

### Optional delight
- Light haptic on pull-to-refresh when list updates; no podium/league promotion UI
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
- [ ] **Friends** tab: invite share, empty state, friends list with XP comparison (no leagues)
- [ ] Tab bar has 4 tabs: **home, progress, friends, profile**
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
- Deeper friends UX (in-app nudges, richer progress breakdown)
- More word families seeded (all short vowel families)
