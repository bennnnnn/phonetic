# Skill: Lesson audio — pre-generate, store, play

Read this before adding **playback**, **batch generation**, or **new word/sentence audio** to the app.

## Canonical approach (PhonicsFlow)

1. **Generate each clip once** (CI, local script, or one-off job) using **Google Cloud TTS**, **Expo Speech in a tooling context**, or any provider you choose — **not** from the user’s phone during a normal lesson for static curriculum.
2. **Upload** the file (e.g. MP3) to **Supabase Storage** (or your CDN bucket).
3. **Persist public (or signed) URLs** on the row: e.g. `audio_url`, `slow_audio_url` on `words` / lesson content tables (`lib/types.ts`).
4. **At runtime**, the app **plays the URL** first — fast, cheap, consistent. **`hooks/useAudio.ts`**: `play(url, fallbackText?)` uses `expo-av` when `url` is non-empty; on failure or missing URL it uses **`googleTts` + Expo Speech** as fallback (see implementation).

**Never** call paid TTS from the **client** for every tap on **fixed** lesson words. Batch generation belongs in **`scripts/`** (or a backend job) with a service key, not in `EXPO_PUBLIC_*` on the device.

---

## Architecture overview

```
Lesson UI needs audio for a word
       ↓
Row has audio_url (and slow_audio_url)?
       ↓ yes
useAudio.play(url) → expo-av streams from URL
       ↓ fails or empty
useAudio falls back to speakWithSettings(fallbackText)
       → googleTts (if API key) else expo-speech
```

For **user-typed or one-off text** (e.g. pronunciation drill): you may **only** use runtime TTS, or **generate-on-first-use** then **upload + UPDATE** the row so the next play is from storage.

---

## Batch generation (outline)

Typical steps in a Node script under `scripts/` (run with secrets in env, not shipped to the app binary):

1. Select rows missing `audio_url` (or stale checksum).
2. For each text + accent + speed variant, call your TTS API → `Buffer` / file.
3. `supabase.storage.from('audio').upload(path, bytes, { contentType: 'audio/mpeg', upsert: true })`.
4. `supabase.from('words').update({ audio_url: publicUrl, slow_audio_url: ... }).eq('id', id)`.

Use stable object paths (e.g. `words/{id}/normal.mp3`) so regenerations overwrite cleanly. Document voice id / locale in the script or a small config file so regenerations stay consistent.

---

## Runtime playback (`hooks/useAudio.ts`)

- **`play(url, fallbackText?)`**: If `url` is set, load and play with **expo-av**; `haptics.tap()` when enabled. On error, if `fallbackText` is provided, **`speakWithSettings`** runs (Google TTS → data URI, else **Expo Speech**).
- **`stop()`**: Stops av sound and **Speech.stop()**.
- **Session**: `playsInSilentModeIOS: true`, unload on unmount.

Components should pass **stored URLs** from the lesson/word model whenever available, and pass **word text** as `fallbackText` so offline / missing-file cases still speak.

---

## UI integration pattern

```typescript
// Prefer DB URLs; fallbackText enables TTS if URL missing or broken
const { play, playing, loading } = useAudio()
await play(word.audio_url, word.text)
```

Slow variant: use `word.slow_audio_url` when the UI requests slow playback; if only one URL exists, you can still pass `fallbackText` for slow path via settings-aware TTS (see `useAudio` / `googleTts` accent + speed).

---

## Rules

1. **Static curriculum → URLs in DB** — generate once, store, play from storage; batch job updates rows.
2. **No per-tap TTS for bulk words** — cost and latency; reserve runtime synthesis for gaps or dynamic phrases.
3. **Always `unloadAsync`** previous `Audio.Sound` before loading another (already pattern in `useAudio`).
4. **`playsInSilentModeIOS: true`** — learning apps should respect silent switch policy per product choice; current code plays in silent mode on iOS.
5. **Two speeds** — keep `slow_audio_url` (or equivalent) for learners when the spec requires it.
6. **Accent** — batch assets per `american` / `british` if you store both; runtime fallback uses `settingsStore.accent` + `audioSpeed`.
7. **One utterance at a time** — `stop()` before starting unrelated audio if the UX requires hard cuts.

---

## Optional: other batch providers

If you prefer **ElevenLabs** (or any vendor) for **offline generation only**, keep all API keys in **script / server** env. The app repo does **not** ship `lib/elevenlabs.ts` for runtime; implement generation inside `scripts/your-generate.ts` only, then upload and update URLs the same way as Google batch output.
