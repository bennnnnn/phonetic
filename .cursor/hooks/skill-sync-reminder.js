#!/usr/bin/env node
/**
 * Cursor postToolUse hook: after Write / StrReplace, suggest which skills and
 * docs may be stale (injected as additional_context — does not auto-edit files).
 */
const fs = require('fs')

function main() {
  let input = {}
  try {
    input = JSON.parse(fs.readFileSync(0, 'utf8') || '{}')
  } catch {
    process.stdout.write('{}\n')
    return
  }

  const name = String(input.tool_name || '').trim()
  if (!/^(Write|StrReplace|ApplyPatch)$/i.test(name)) {
    process.stdout.write('{}\n')
    return
  }

  let ti = input.tool_input
  if (typeof ti === 'string') {
    try {
      ti = JSON.parse(ti)
    } catch {
      ti = {}
    }
  }
  if (!ti || typeof ti !== 'object') ti = {}

  const rel = String(ti.path || ti.target_file || ti.file_path || '').replace(/\\/g, '/')
  if (!rel) {
    process.stdout.write('{}\n')
    return
  }

  const hints = new Set()

  if (
    rel.startsWith('app/(auth)/onboarding') ||
    rel.includes('contacts-permission') ||
    rel.includes('notifications-permission')
  ) {
    hints.add('`.cursor/skills/phonicsflow-interactive-experience/SKILL.md` — onboarding / permission flow or copy.')
  }
  if (rel.includes('friends') && rel.includes('app')) {
    hints.add('`.cursor/skills/phonicsflow-interactive-experience/SKILL.md` — Friends tab, XP, invites.')
  }
  if (/^app\/(lesson|quiz|sentences|complete|review|group-)/.test(rel) || rel.startsWith('components/lesson')) {
    hints.add('`skills/add-tts-audio.md` + `skills/create-screen.md` — lesson / quiz / audio UX.')
  }
  if (rel.includes('useAudio') || rel.includes('googleTts') || rel.endsWith('hooks/useAudio.ts')) {
    hints.add('`skills/add-tts-audio.md` + `CLAUDE.md` (stack / env) — TTS or playback.')
  }
  if (rel.startsWith('supabase/migrations') || (rel.includes('supabase') && rel.endsWith('.sql'))) {
    hints.add('Supabase skills under `.agents/skills/supabase*` + subagent `/supabase-migration-reviewer` — SQL / RLS.')
  }
  if (rel.includes('docs/ui-screens.md')) {
    hints.add('`skills/create-screen.md`, `.cursor/skills/phonicsflow-interactive-experience/SKILL.md`, `CLAUDE.md` Key UI Rules — spec drift.')
  }
  if (rel.endsWith('CLAUDE.md')) {
    hints.add('`CLAUDE.md` Skills Reference + `.cursor/rules/phonicsflow.mdc` — handbook / baseline rule.')
  }
  if (rel.startsWith('lib/routes') || rel.includes('app/(tabs)/')) {
    hints.add('`docs/ui-screens.md` (tabs / nav) + `skills/create-screen.md` if navigation labels or flow changed.')
  }

  if (hints.size === 0) {
    process.stdout.write('{}\n')
    return
  }

  const msg = [
    '**Skill / doc sync (hook)** — not auto-fixed.',
    'Edited `' + rel + '`. If product behavior changed, update:',
    ...[...hints].sort().map((h) => '- ' + h),
    'Full map: `.cursor/skills/phonicsflow-skill-maintenance/SKILL.md`.',
  ].join('\n')

  process.stdout.write(JSON.stringify({ additional_context: msg }) + '\n')
}

main()
