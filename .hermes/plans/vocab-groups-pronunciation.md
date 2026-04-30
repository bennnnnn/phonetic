# Plan: New Vocab Groups + Pronunciation Display

## Goal
1. Replace the 7 current vocabulary themes with ~12 practical, learner-focused groups
2. Add a `pronunciation` field to words (written respelling like "bot" for bought) and display it instead of IPA phonemes
3. Update all word display spots to show `pronunciation` instead of `phoneme`

## Current State
- `/data/vocabThemes.ts` has 7 groups: Travel, Food, Nature, Feelings, Actions, Home, People
- `Word` type in `lib/types.ts` has `phoneme: string` (IPA) but no `pronunciation` field
- 7 display spots render `word.phoneme` — WordFocusCard, Practice screen, Review screen, ThemePractice, WordCard component
- Words come from the `words` DB table — phonemes are in the DB already

## Proposed Vocab Groups (12 groups)
1. **Fruits** 🍎 — apple, banana, orange, grape, lemon, melon, cherry, peach, mango, berry, pear, plum
2. **Vegetables** 🥦 — carrot, celery, lettuce, tomato, potato, onion, bean, pea, corn, spinach, broccoli, mushroom
3. **Kitchen** 🍳 — spoon, fork, knife, plate, bowl, cup, pan, pot, oven, stove, sink, fridge
4. **Furniture** 🛋️ — table, chair, desk, bed, sofa, shelf, drawer, lamp, rug, curtain, closet, cabinet
5. **Car Parts** 🚗 — wheel, tire, engine, brake, pedal, horn, seat, door, window, mirror, trunk, hood
6. **Body** 🦵 — head, hand, foot, arm, leg, face, nose, mouth, eye, ear, back, knee, finger, elbow
7. **Clothes** 👕 — shirt, pants, dress, coat, hat, shoe, sock, belt, glove, scarf, jacket, boot
8. **Body Actions** 🫣 — sneeze, cough, snore, spit, stare, glare, glance, squint, blink, wink, yawn, sigh, whisper, shout, whistle
9. **Feelings & Emotions** 💫 — happy, sad, angry, tired, scared, brave, calm, proud, shy, kind, silly, worried
10. **Nature** 🌿 — rain, snow, sun, moon, star, tree, leaf, cloud, wind, wave, rock, river, lake, hill
11. **Animals** 🐾 — cat, dog, bird, fish, horse, cow, pig, sheep, duck, bear, lion, wolf, deer, mouse
12. **Time & Weather** ⏰ — day, week, month, year, hot, cold, warm, cool, wet, dry, bright, dark, storm, fog

## Step-by-step

### Step 1: Add `pronunciation` column to DB
- Create migration `012_pronunciation_column.sql` — ALTER TABLE words ADD COLUMN pronunciation TEXT
- The `pronunciation` field stores a simple respelling like "bot" for "bought", "kot" for "caught"

### Step 2: Update `Word` type
- `lib/types.ts` — add `pronunciation: string` field

### Step 3: Rewrite `vocabThemes.ts` with 12 new groups
- Replace WORD_THEMES content entirely
- Each word in each group should be real English vocabulary that learners need

### Step 4: Update all 7 display spots to show `pronunciation` instead of `phoneme`
1. `components/lesson/WordFocusCard.tsx` — line 205: `word.phoneme` → `word.pronunciation` (and relabel the display)
2. `app/(tabs)/practice.tsx` — line 350: `word.phoneme` → `word.pronunciation`
3. `components/lesson/WordCard.tsx` — line 50: `word.phoneme` → `word.pronunciation`
4. `app/review/[id].tsx` — line 116: `word.phoneme` → `word.pronunciation`
5. `components/home/ThemePractice.tsx` — line 169: `word.phoneme` → `word.pronunciation`
6. `app/(auth)/onboarding/how-it-works.tsx` — line 161: this one uses a constant `PHONEME` for demo purposes

### Step 5: Backfill pronunciation data
For existing DB words, we'd need to add `pronunciation` values. For the new groups, the pronunciation will be the word respelling.

## Files Changed
- `supabase/migrations/012_pronunciation_column.sql` — NEW
- `lib/types.ts` — MODIFY (add pronunciation field)
- `data/vocabThemes.ts` — REWRITE (12 groups)
- `components/lesson/WordFocusCard.tsx` — MODIFY (phoneme → pronunciation)
- `app/(tabs)/practice.tsx` — MODIFY
- `components/lesson/WordCard.tsx` — MODIFY
- `app/review/[id].tsx` — MODIFY
- `components/home/ThemePractice.tsx` — MODIFY

## Risks
- The DB `words` table has existing phoneme data — removing the display doesn't affect it, but old phoneme values are orphaned
- The new vocab groups don't exist in the DB yet — they're only in `/data/vocabThemes.ts` as word lists. The practice screen pulls from `usePracticeWords` which queries the DB. We need the actual words in the DB with word_family_id associations for the practice screen to work.

## Open Questions
1. Should pronunciation replace phoneme entirely, or be shown alongside? User says "instead" — so replace.
2. For the practice screen: the new vocab words need to exist in the `words` DB table. If they don't, the practice screen shows nothing. Should we seed them?
