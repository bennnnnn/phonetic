---
description: >-
  PhonicsFlow onboarding, contacts/notifications permissions, Friends tab, and
  leaderboard-style social UI. Use when building or refining onboarding flows,
  permission screens, friends list, XP ranking, invites, or making those areas
  feel more interactive and performant in React Native / Expo.
---

# PhonicsFlow — interactive onboarding & friends

**Scope:** Use this skill for **onboarding**, **contacts/notifications permission UX**, **Friends tab**, and **friends-only XP ranking**. General screens, lessons, and quiz behavior follow **`CLAUDE.md`** + **`docs/ui-screens.md`** without needing this file.

## Before coding

1. Read the matching sections in **`docs/ui-screens.md`** (onboarding sequence, Friends tab, profile/notifications if relevant).
2. Skim **`app/(auth)/onboarding/`** and **`app/(tabs)/friends.tsx`** (and related hooks under `hooks/`, `lib/contactsFriends`, `lib/notifications`) to extend existing patterns.

## Onboarding & data entry

- One primary action per step; minimize fields; use live feedback where spec calls for it (e.g. name → avatar/greeting).
- Use **`components/onboarding/`** and shared UI (`Button`, tokens) for consistency.
- Respect **delight rules** in `CLAUDE.md` where they apply (e.g. “let’s go” moment); do not add speed controls outside profile.

## Permissions (contacts & notifications)

- **Always** show an in-app rationale screen **before** `requestPermissionsAsync` / contacts APIs — tie copy to outcomes: friends discovery vs streak/reminder notifications per product copy direction in `docs/ui-screens.md`.
- Handle denied / limited states with a calm recovery path (settings deep link later, not nag loops).
- Do not send raw contact emails to the server beyond what existing RPCs expect; follow comments and patterns in `lib/contactsFriends` and migrations.

## Friends & “leaderboard”

- Implement **friends-only** ranking and copy from the spec (XP order, “among N learners”, invite card, empty state).
- Lesson comparison stats must stay **RLS-safe** and friendship-scoped — use existing RPCs / hooks; do not invent new public leaderboards unless the user changes the spec.

## Performance & polish

- Memoize list rows; avoid inline object literals and anonymous functions in hot list render paths where it matters.
- Keep **tab bar order**: Home → Progress → Friends → Profile.

## Output

When suggesting changes, name the spec section you followed and call out any intentional deviation the user must approve.
