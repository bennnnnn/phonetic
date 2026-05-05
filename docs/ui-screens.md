# PhonicsFlow — Approved UI Screens

Core flows reviewed and approved. Build to match these specs and the **visual reference** captured in product screenshots (auth, home path + category layouts, group lesson/review/complete, progress, friends, profile).

Do not deviate without explicit instruction.

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

- Top teal hero (~160px): logo (white rounded square, "Pf" in Georgia/teal) + **PhonicsFlow** in white + tagline **"free to start · no credit card"** in smaller white
- White content area:
  - Headline: **Create your account** (bold black), sub: **Join in seconds.** (muted gray)
  - **Google (when disabled / coming soon):** very light gray fill, gray border, muted "G" icon, label **Continue with Google — coming soon** — non-interactive or clearly disabled
  - **Email (primary path):** #E1F5EE (mint) background, **Continue with email** in bold dark teal — main CTA when Google is not ready
  - Separator row: thin lines with **or** centered in gray
  - When Google is live: invert emphasis — Google white outlined primary, email mint secondary; still **no Apple** button
  - Tapping **Continue with email** expands **inline** below: email + password fields, teal focus border on the expanded block — **no confirm password**; password field includes **show/hide** (eye) control
  - Footer: **already have an account?** with **sign in** as teal tappable link
  - Legal: small gray **By signing up you agree to our Terms and Privacy Policy** with Terms / Privacy Policy underlined links

---

## Sign In (auth stack, paired with Screen 6)

- Same teal hero treatment: logo, **PhonicsFlow**, **welcome back** (smaller white)
- White body:
  - Title **Sign in**, subtitle **Good to see you again.**
  - **Continue with Google** — white button, light border, colored "G" icon (when enabled)
  - Divider: **or use email** centered between hairlines
  - **Email** / **Password** — label above field, rounded bordered inputs; password with trailing **eye** toggle
  - **forgot password?** — teal, right-aligned under password
  - Primary **sign in** — full-width teal, white lowercase label, generous radius
  - Footer: **Don't have an account?** + **sign up** (teal link)

---

## Auth entry / Welcome sheet (unauthenticated landing)

- Upper half: full teal (#1D9E75), logo + **PhonicsFlow** + tagline **crack the english code** (or aligned splash copy)
- Decorative **word chips** (two rows): e.g. bake, cake, light / snake, night, feat — frosted white rounded pills; **consonant in muted tone, pattern highlighted** (same decoding grammar as lessons)
- Lower half: **white sheet** with large top corner radius overlapping hero
  - Primary: **Continue with email** — solid teal, white text
  - Secondary: **Continue with Google** — white, gray border, black text + G icon
  - **Already have an account? Sign in** — Sign in in bold teal
  - Terms line as on Screen 6

---

## Screen 7 — Home

- Page background: **#F1EFE8** (neutral) — reads as soft beige on device
- **Header (in scroll or fixed):**
  - Time-based greeting: **Good morning / Good afternoon / Good evening** on first line; **display name** large and bold on second line (or combined line per layout)
  - **Stat chips** (horizontal): streak (**X DAYS** or flame + days), **WORDS** total, **XP** — compact caps/small type
  - **NotificationBell** top-right: teal bell, **red numeric badge** when there are unread items
- **Module / chapter card(s)** — white rounded card(s), one per learning track:
  - **Collapsed row:** circular badge with **content count** (e.g. 482 phonics items), track title (**Phonics**, **Vocabulary**, **Irregular Verbs**, **Homophones**, **Proverbs**), **completed/total** on the right (e.g. 10/26) + chevron; **themed progress bar** under title (green phonics, blue/lavender vocab, purple verbs, orange/yellow homophones, red-orange proverbs)
  - **Expanded (Phonics path):** same header row with **up** chevron; below, **vertical learning path**: large **teal circular lesson nodes** (pattern label e.g. ack, ake, an), **three gold stars** under each node, **completed** lessons show small **check badge** on the node; nodes linked by **dotted connector** path; horizontal **wave** offset for playful path layout
- New users may see **NewUserGuide** overlay — do not block spec above
- **Bottom tab bar:** **Home** (active = teal house + label), Progress, Friends, Profile — white bar, inactive gray icons/labels

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

### Group word lesson variant (`/group-lesson/[theme]`)

- Header: back; **large oval** showing remaining count (e.g. **29**); right pill with **✓ mastered** and **skip** counts
- Main card white, large radius:
  - Emoji / visual above word (when defined)
  - Hero word: **consonant gray, pattern teal** (Georgia for pattern/word display per global rules); optional **simplified spelling** hint beside word in small muted text (e.g. phonetic respelling)
  - Circular **speaker** control (teal) aligned with word row
  - **DEFINITION** / **EXAMPLE** as small **mint pills** (dark teal label text); body copy black/gray; example may be italic
  - Optional **translation** row: small flag + translated text
  - Row actions: **skip** (light gray pill, × + label) and **got it** (teal pill, check + label)
- **Bottom answer strip** (when in quiz-style step): horizontal row of rounded options; **selected correct** = solid teal + white text; distractors light gray; one option may show light border + check when revealed

---

## Group review (`/group-review/[theme]`)

- Background #F1EFE8; white header bar
- Left: back chevron; center title **-{pattern} family** (e.g. **-ack family**); subtitle **N words · tap any row to expand** (muted)
- Right: **done** pill — #E1F5EE background, teal check + **done** text
- **Rule / tip card:** white, rounded, **thick vertical teal accent** on left; lightbulb icon + rule copy (e.g. short vowel + ck pattern)
- **Scrollable word rows** (white cards):
  - Word: **consonant(s) #B4B2A9**, **pattern #1D9E75**, large; second line: small gray phonetic / IPA
  - Trailing **audio** circle (teal, white speaker) + **chevron** (expand)
  - Expanded: divider, optional **mnemonic emoji/image**, definition text

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

### Group quiz (`/group-quiz/[theme]`)

- Same interaction rules as lesson quiz (no manual next; correct/wrong timing and feedback)
- Header shows **theme title** (emoji + pattern/group name), step bar, score strip; body uses shared **QuizOption** / **ScoreBar** components where applicable
- After last question: navigates to **group complete** for that theme

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

### Group complete (`/group-complete/[theme]`)

- Same **full teal takeover** + confetti energy as lesson complete
- Badge: **GROUP COMPLETE** (uppercase, white pill on teal)
- Headline: **You crushed it!** in white
- Subline: **emoji + theme label** (e.g. **🚗 brake /**) — celebrates the group just finished
- White rising card:
  - Large **score ring** or percent (e.g. **100%**) in teal, pale mint inner fill
  - **+X XP** in wide **peach / accent** pill (#FAECE7 family), dark coral text
  - **Two stat tiles** side by side (light neutral): **Words mastered**, **Streak kept** (or parallel stats)
  - Actions: **back to home** (quiet neutral pill, dark text) + **next group →** (solid teal, white text)

---

## Screen 12 — Progress

- Safe area + background **#F1EFE8**
- **Title row:** **your progress** (bold, lowercase-friendly), left; right **segmented pill**: **week** | **month** | **all** — selected segment **white fill + dark text**; unselected **muted gray** on pill track
- **Streak card (full-width teal):** e.g. **5 day streak** in white; small pill **last 7 days** (semi-transparent); row of **7 day circles** (Sat→Fri labels): completed days = white ring + green check on mint fill; future/missed = soft mint; **today** label bold white
- **Section label:** **Stats · this week** (or **Stats · this month** / **Stats · all time**) — small gray, reflects selected period
- **2×2 stat grid** (white rounded cards):
  - Words mastered — **large teal number**
  - Lessons done — **large teal number**
  - Points earned — **large black number** + **xp** suffix smaller
  - Quiz accuracy — **large teal percent**
- **Level progress card (white):** row **level progress** + pill **level N** (#E1F5EE bg, dark teal text); **horizontal progress bar** (teal fill, neutral track); footer row: **current XP** left, **X XP to level N+1** right (muted)
- **Per-track progress (accordion):** white rounded sections — **emoji + title** (Phonics, Vocabulary, Irregular Verbs, Homophones, Proverbs) + chevron; expanded area lists **families / lessons** with bars or rows (implementation detail: must scroll)
- Alternate compact state: single **Phonics** row with chevron when other sections collapsed — same visual language
- Bottom tabs: Progress active (teal chart icon + label)

---

## Screen 13 — Profile / Settings

- **Teal header (tall):** large **white avatar ring** with **teal initial**; **display name** bold white; subtitle **Goal tier · lessons** (e.g. **Casual · 1 lesson**) in smaller white; top-right **edit** pill (outline / translucent)
- **Four stat pills** in a row on teal (semi-transparent darker teal tiles): **streak**, **XP**, **words**, **level** — big white number, small white caption
- Scrollable body (scroll MUST work):
  - **Unlock Pro** charcoal card (#2C2C2A): green **star** square icon; title **Unlock Pro**; body **Invite 10 friends for 1 free month, or tap upgrade**; right **upgrade** teal button
  - **LEARNING** uppercase gray section header
  - White grouped list: **Daily goal** (flag icon, value + chevron), **Reminder time** (bell, time, chevron), **Audio speed** (gauge icon, e.g. **0.75x**, chevron), **Accent** (globe/translate icon, flag + **American**, chevron) — each row colored square icon with white glyph
  - **Accessibility:** dyslexia font, larger text — toggles default **OFF** unless product changes
  - **App:** sound, haptics, notifications — toggles default **ON**
  - **Account:** restore purchases, sign out (destructive red)
- Iconography: **colored rounded squares** with white **Ionicons-style** glyphs (not emoji for settings rows)
- Bottom tab: **Profile** active (teal person icon + label)

---

## Friends (`/(tabs)/friends`)

Social progress is **friends-only** (no leagues or random matchmaking). People show up after an **invite/referral link** signs up, or after **onboarding contacts**: with permission, emails are matched server-side (`find_users_by_emails`); matches create `friendships` rows—**raw contact emails stay on device**, only matched account IDs are linked.

- White top bar: title **Friends** (bold, left)
- Main area background **#F1EFE8**

**Invite row (always visible when referral code exists)**  
- Prominent teal card: **Invite friends to PhonicsFlow** · subline explains **share link**; when they sign up with your link they appear on this screen. **Share** action (share sheet).

**Empty state (no friendships yet)**  
- Centered **🤝**, title **Learning is better with friends**  
- Body: share your **invite link**; optionally note that **contacts access** (during onboarding) can surface people already on the app without sharing numbers.  
- Primary CTA **Invite a friend** (share)  
- Muted hint: link signups and contact matches both add friends here.

**Populated state**  
- **Leader summary** (neutral or light mint card below invite): ranks **you + all friends** by **total XP**—e.g. *You're 1st among 4 learners* or *You're 3rd · 120 XP behind the lead*. If you're alone, gentle nudge to invite.  
- Eyebrow: **N friends · sorted by XP**  
- Scroll list: friend cards with **rank badge** (#1, #2…), avatar initials, name, **streak + XP**; secondary line (**once migration `023` is applied**) compares completed lessons — **rolling last 7 days** vs yours and **all-time completed-lesson count** vs yours; muted line keeps **XP ahead/behind you**
- Pull to refresh refreshes friendships + RPC stats  
- **Contacts scan** (neutral row below invite area): rerun contact → email match anytime; alerts for denial / number of newly linked profiles  
- **In-app bell**: when comparing to a lightweight **XP snapshot** from the prior visit on this device, if a friend's **total XP crossed above yours**, insert a **`friend_pull_ahead`** row (deeplink `/(tabs)/friends`; same-type throttled ~6h per friend)  

**Backend**  
- `friendships` + `profiles` as above  
- **`get_friends_lesson_stats()`**: `SECURITY DEFINER`, returns lesson counts **only for users who share a friendship** with the caller (RLS-safe friend visibility).

- Bottom tab: **Friends** active

---

## Global Rules (apply to every screen)

- Brand teal: #1D9E75 (primary), #E1F5EE (light), #085041 (dark text on teal bg); accents: #F0997B (coral), #EF9F27 (amber) where used in celebrations and XP chips
- Font: system sans-serif (React Native default), **Georgia serif for pattern/word hero displays** in lessons and chips
- Consonants always in #B4B2A9 (gray), patterns always in #1D9E75 (teal)
- Border radius: 14px buttons, 16–20px cards, 24px focus cards, 50% avatars/circles; tab bar **white** surface, no heavy top border
- **Primary tab bar (4 tabs, fixed order):** **Home**, **Progress**, **Friends**, **Profile**
- Active tab: **teal icon + teal label**; inactive: **#888780** (textMuted) icon + label
- All screens respect safe areas (notch top, home indicator bottom)
- No confirm password fields anywhere
- No Apple Sign In button (Google + email only)
- Audio speed lives in profile settings only — not in lesson screens

