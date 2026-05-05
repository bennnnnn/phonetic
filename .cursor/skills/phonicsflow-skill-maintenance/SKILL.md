---
description: >-
  Maps app/code changes to which project skills, CLAUDE.md, and rules likely need
  updates so agent instructions stay aligned with the product. Use when doing a
  refactor across screens, navigation, audio, Supabase, or after the hook
  reminds you about stale docs.
---

# PhonicsFlow — keep skills and instructions aligned

Cursor runs **`node .cursor/hooks/skill-sync-reminder.js`** on **`postToolUse`** for **Write** and **StrReplace** (see `.cursor/hooks.json`). It injects a short **reminder** into the chat when you touch certain paths — it does **not** edit SKILL files automatically.

## What to update when things change

| You change… | Revisit… |
|-------------|----------|
| `docs/ui-screens.md` | `skills/create-screen.md`, `.cursor/skills/phonicsflow-interactive-experience/SKILL.md`, `CLAUDE.md` Key UI Rules |
| Onboarding or permission screens | `.cursor/skills/phonicsflow-interactive-experience/SKILL.md` |
| Friends tab, XP, invites, contacts | Same skill + `docs/ui-screens.md` Friends section |
| Lesson / quiz / sentences / `components/lesson/` | `skills/add-tts-audio.md`, `skills/create-screen.md`, `docs/sprint-1.md` (legacy prompts) |
| `hooks/useAudio.ts`, `lib/googleTts.ts` | `skills/add-tts-audio.md`, `CLAUDE.md` (TTS / env) |
| `supabase/migrations/*.sql`, RPC SQL | `.agents/skills/supabase*`, run `/supabase-migration-reviewer` on risky changes |
| `CLAUDE.md` | Skills Reference table, `.cursor/rules/phonicsflow.mdc` layering line if structure changed |
| `lib/routes.ts`, tab layouts | `docs/ui-screens.md`, `skills/create-screen.md` |

## If the hook is wrong or noisy

- Adjust matchers in `.cursor/hooks.json` or path heuristics in `.cursor/hooks/skill-sync-reminder.js`.
- `postToolUse` output only supports `additional_context` (and MCP output rewrite); it cannot patch files for you.

## Manual habit

After a **large** feature merge, skim **this table** once — faster than debugging an agent that read an outdated skill.
