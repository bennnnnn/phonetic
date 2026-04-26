# PhonicsFlow — Approved UI Screens

All 13 screens reviewed and approved. Build exactly as described here.
Do not deviate from these specs without explicit instruction.

---

## Screen 1 — Splash

- Full teal background (#1D9E75)
- White logo card: rounded square, "Pf" in Georgia serif, teal text
- App name: "PhonicsFlow" in white, 26px, weight 500
- Tagline below name: "hack the english code" in #9FE1CB, 13px
- 3 progress dots at bottom (first active = white pill, others = #9FE1CB circles)
- No buttons — auto-advances to onboarding

---

## Screen 2 — Onboarding 1 (Welcome)

- Top 260px: teal (#E1F5EE) hero area
- Giant pattern display: "_ake" — underscore in #B4B2A9, "ake" in #1D9E75, 64px Georgia serif
- Word pills below pattern: "bake", "cake", "lake", "snake"
  - White background, #9FE1CB border, consonant in #B4B2A9, pattern in #1D9E75
- Bottom content area white:
  - Eyebrow: "welcome to phonicsflow" in #1D9E75, 11px uppercase
  - Headline: "English has a secret pattern system" 24px weight 500
  - Body: muted gray, 14px
  - 4-dot progress bar (dot 1 active = #1D9E75, rest = #E1F5EE)
  - CTA: "show me how it works" — full width teal button, border-radius 14px
- "skip" text top right in #888780

---

## Screen 3 — Onboarding 2 (How it works)

- White background
- Headline: "3 steps to decode any word" 22px
- 3 step cards stacked:
  - Card 1 (teal #E1F5EE): "Spot the pattern" — shows "b[ake]" with sound badge "/eɪk/"
  - Card 2 (coral #FAECE7): "Hear the sound" — shows "-ake always says /eɪk/"
  - Card 3 (gray #F1EFE8): "Blend and read" — shows "sn[ake] = snake"
  - Each card: circle number, title, description, mini word demo
- Progress bar: 2 of 4 active
- CTA: "got it, keep going"

---

## Screen 4 — Onboarding 3 (Set goal)

- 4 tappable goal cards — only one selected at a time
- Selected state: #E1F5EE background, #1D9E75 border 1.5px, teal checkmark
- Default selected: "Regular" (2 lessons · ~10 min a day)
- Options: Casual (1 lesson), Regular (2 lessons), Serious (3 lessons), Intense (5 lessons)
- Each card: icon, title, time estimate
- Progress bar: 3 of 4 active
- CTA: "looks good"

---

## Screen 5 — Onboarding 4 (Name + Let's go)

- Top 220px: teal hero (#1D9E75)
  - Avatar circle (white, initial letter in teal) — updates live as user types
  - Greeting: "Hey, [name]!" — name in #9FE1CB, updates live
  - Tagline: "ready to crack the code?" in #9FE1CB
- Bottom content:
  - Eyebrow: "almost there"
  - Headline: "What should we call you?"
  - Single text input — border #9FE1CB, border-radius 14px, 16px text
  - Helper text: "We'll use this to personalise your experience."
  - All 4 progress dots active
  - CTA changes live: "let's go" → "let's go, [name]!" as user types
  - Sub-text: "takes 10 seconds to sign up" below button

---

## Screen 6 — Sign Up

- Top teal hero (160px): logo + app name + "free to start · no credit card"
- White content area:
  - Headline: "Create your account", sub: "Join in seconds."
  - Google button: white, gray border, "G" circle in coral, "Continue with Google" — PRIMARY
  - Email button: #E1F5EE background, teal text, "Continue with email" — SECONDARY
    - Tapping email button expands inline — border becomes teal, email + password fields appear below, merged seamlessly
    - NO confirm password field
    - Password has show/hide toggle
  - NO Apple button
  - "already have an account? sign in" below buttons
  - Terms fine print at bottom, 10px, very muted

---

## Screen 7 — Home

- Background: #F1EFE8
- White header:
  - "Good morning, [name]" — name in #1D9E75
  - Avatar circle top right
  - Streak pill + XP pill + words pill below greeting
- Scrollable content:
  - "continue learning" section:
    - Big teal card (#1D9E75) with in-progress lesson
    - Shows lesson name, current step, progress bar, play icon, "resume lesson" button (white)
  - "word families" section:
    - List of family cards — pattern badge (teal bg), title, word count, progress bar, level badge
    - Locked families: grayed out, lock icon, "Complete level X to unlock"
- Bottom tab bar: home (active), progress, profile — 3 tabs only

---

## Screen 8 — Lesson: Word Learning (core lesson screen)

- Background: #F1EFE8
- Header: back arrow, lesson title, "X of Y" count badge, 4-step progress bar
- Center focus card (white, border-radius 24px):
  - Word displayed large: consonant in #B4B2A9, pattern in #1D9E75, 52px Georgia serif
  - Phoneme below: e.g. "/beɪk/" in #888780
  - Definition: 13px centered gray text
  - Audio circle button (teal bg) — plays word audio
- Two action buttons below card:
  - "skip for now" — flex 1, #F1EFE8 bg, gray text
  - "got it ✓" — flex 2, teal bg, white text (wider = nudges mastering)
- Bottom queue strip (white, rounded top):
  - Label: "up next — X remaining"
  - Horizontal scroll of word pills
  - States: current (teal), mastered (light teal + checkmark), skipped (strikethrough gray), upcoming (gray)
- Audio speed removed from this screen — lives in profile settings

---

## Screen 9 — Lesson: Sentences

- One sentence owns the screen — no list
- Center card (#F1EFE8, border-radius 20px):
  - "sentence X of 5" label
  - Sentence text 20px — -ake words in teal, underlined, tappable
  - Tapping a teal word shows its definition in hint strip below
  - "hear the sentence" button — plays full sentence TTS
  - Hint strip: word + dot + definition, #E1F5EE bg
  - 5 progress dots at bottom of card
- Back + next buttons below card
- Last sentence: next button becomes "go to quiz →"

---

## Screen 10 — Lesson: Quiz

- Score bar at top (fills as user gets answers right)
- Word displayed large in card (consonant gray, pattern teal) with "hear it" audio button
- 4 answer options — tappable, full width
- NO next button — auto-advances:
  - Correct: button turns green, card flashes green, advances after 900ms
  - Wrong: button turns red, correct answer highlights green, advances after 1400ms
- On completion: score shown inline in the card, "finish lesson" button appears

---

## Screen 11 — Lesson Complete (ceremony)

- Full teal screen takeover
- Confetti animation (brand colors: white, #9FE1CB, #F0997B, #EF9F27, #E24B4A)
- "lesson complete" badge (semi-transparent white pill)
- "You crushed it!" headline in white
- Score circle: semi-transparent ring, score counts up from 0
- 3 stars fill in one by one (based on score: 90+ = 3, 70+ = 2, else 1)
- White bottom card slides up:
  - 2x2 stat grid: words mastered, streak kept, XP earned, quiz accuracy
  - XP banner: "+X XP" counts up, level progress bar fills
  - Two buttons: "home" (quiet, #E1F5EE) + "next lesson →" (teal, dominant)

---

## Screen 12 — Progress

- Background: #F1EFE8
- White header: "your progress" + week/month/all toggle + streak/XP pills
- Scrollable content:
  - Streak card (teal): big streak number, "personal best" badge, 7-day week grid with checkmarks
  - "this week" stat grid (2x2): words mastered, lessons done, XP, quiz accuracy
  - Level card: progress bar from current XP to next level
  - Word families list: pattern badge, name, progress bar, percentage

---

## Screen 13 — Profile / Settings

- Teal header: avatar, name, goal subtitle, edit button, 4 mini stats (streak, XP, words, level)
- Scrollable settings below (scroll MUST work — all sections visible on scroll):
  - Pro upgrade card: dark (#2C2C2A), star icon, upgrade button
  - Learning section: daily goal, reminder time, audio speed, accent — all with chevron + current value
  - Accessibility section: dyslexia font (toggle OFF default), larger text (toggle OFF default)
  - App section: sound effects (ON), haptic feedback (ON), notifications (ON) — all toggles
  - Bottom card: restore purchases, sign out (red)
- Every row has a colored icon (SVG, not emoji, not colored dot)
- Bottom tab bar: home, progress, profile (active)

---

## Global Rules (apply to every screen)

- Brand teal: #1D9E75 (primary), #E1F5EE (light), #085041 (dark text on teal bg)
- Font: system sans-serif (React Native default), Georgia serif for pattern displays only
- Consonants always in #B4B2A9 (gray), patterns always in #1D9E75 (teal)
- Border radius: 14px buttons, 16-20px cards, 24px focus cards, 50% avatars/circles
- Tab bar: 3 tabs only — home, progress, profile
- Active tab: teal indicator bar + teal dot + teal label
- All screens respect safe areas (notch top, home indicator bottom)
- No confirm password fields anywhere
- No Apple Sign In button (Google + email only)
- Audio speed lives in profile settings only — not in lesson screens

---

## Screen 14 — Leaderboard

- Background: #F1EFE8
- White header:
  - Title: "leaderboard" 20px weight 500
  - "Teal League" badge top right — green dot + text, #E1F5EE bg
  - 3-tab toggle below: "this week" / "all time" / "friends"
    - Active tab: white bg, #2C2C2A text. Inactive: transparent, #888780
- "resets in X days · top 3 promote to Gold League" — 11px muted, below tabs

- Podium (white bg, no bottom padding — list sits flush below):
  - 3-column podium, tallest block in center (#1)
  - Block heights: 1st = 72px (#1D9E75), 2nd = 56px (#5DCAA5), 3rd = 44px (#9FE1CB)
  - Block width: 1st = 72px, 2nd + 3rd = 60px
  - Avatar above each block: initials circle, colored border matching block
  - Crown emoji above 1st place avatar
  - Name (truncated) + XP below avatar, above block
  - Rank number inside block, white, 13px

- Scrollable list below podium:
  - Ranks 4–10 shown as rows
  - Each row: rank number, avatar (initials, colored bg), name, streak, XP, movement badge
  - Movement badges: green "+N" on #E1F5EE for climbing, red "-N" on #FCEBEB for dropping
  - User's own row (rank 7):
    - #E1F5EE background, #1D9E75 border
    - Teal avatar with white initial
    - "(you)" appended to name
    - Divider lines above and below to visually separate from others
  - Scroll works — bottom entries fully reachable

- Tab bar: 4 tabs — home, progress, leagues (active), profile
  - Active: teal indicator bar + teal dot + teal label
  - Inactive: gray bar, no dot, gray label

## Leagues System (backend logic)

- Each user is placed in a league of ~10 people with similar XP levels
- Leagues: Teal → Gold → Diamond → Master (4 tiers)
- Weekly reset every Sunday midnight
- Top 3 of each league promote up one tier
- Bottom 2 demote down one tier
- XP earned during the week is the ranking metric (not total XP)
- Friends tab shows only mutual followers — invite via share link
